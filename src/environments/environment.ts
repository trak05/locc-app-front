// Environnement de production (image Docker servie par Nginx) : même origine que
// l'interface, Nginx relaie /api/ et /ws/ vers le backend. L'URL WebSocket est
// déduite de la page courante pour fonctionner quelle que soit l'IP de la VM.
export const environment = {
  production: true,
  apiBaseUrl: '/api',
  wsBaseUrl: `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}`,
};
