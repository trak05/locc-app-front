#!/usr/bin/env node
// PostToolUse hook: formats the file just edited/written with Prettier.
// Never fails the tool call: swallows all errors and always exits 0.

const { execFileSync } = require('node:child_process');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

const PRETTIER_EXTENSIONS = new Set([
  '.ts', '.html', '.scss', '.css', '.json', '.js', '.mjs', '.cjs', '.md',
]);

let raw = '';
process.stdin.on('data', (chunk) => {
  raw += chunk;
});

process.stdin.on('end', () => {
  try {
    const payload = JSON.parse(raw);
    const filePath = payload?.tool_input?.file_path;
    if (!filePath) return;

    if (!PRETTIER_EXTENSIONS.has(path.extname(filePath).toLowerCase())) return;

    const prettierBin = require.resolve('prettier/bin/prettier.cjs', {
      paths: [PROJECT_ROOT],
    });

    execFileSync(process.execPath, [prettierBin, '--write', filePath], {
      cwd: PROJECT_ROOT,
      stdio: 'ignore',
    });
  } catch {
    // Best-effort formatting only; never block the workflow.
  }
});
