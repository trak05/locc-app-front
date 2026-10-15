/**
 * Fabrique un JWT factice (signature bidon) : le front ne fait que décoder le payload,
 * il ne vérifie jamais la signature — c'est le back qui la contrôle.
 */
export function fakeJwt(payload: Record<string, unknown>): string {
  return `header.${btoa(JSON.stringify(payload))}.signature`;
}

/** Payload valide pendant une heure, fusionné avec les claims voulues (role, parkingRole...). */
export function validPayload(extra: Record<string, unknown> = {}): Record<string, unknown> {
  const now = Math.floor(Date.now() / 1000);
  return { sub: 'user', iat: now, exp: now + 3600, ...extra };
}
