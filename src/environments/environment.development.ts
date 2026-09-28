// Environnement de développement (`npm start` sur 4300) : le backend tourne à part
// sur localhost:8081. Remplace environment.ts via fileReplacements (angular.json).
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8081/api',
  wsBaseUrl: 'ws://localhost:8081',
};
