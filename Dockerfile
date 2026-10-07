# Image de production du front : build Angular puis service par Nginx, qui est
# aussi l'unique point d'entrée HTTP (relais /api/, /ws/, /healthz vers le backend).

# --- Étape 1 : build Angular (configuration production => environment.ts, apiBaseUrl '/api')
FROM node:24-alpine AS build
WORKDIR /app
# Copie des manifestes seuls d'abord pour profiter du cache Docker sur npm ci.
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration production

# --- Étape 2 : runtime Nginx
FROM nginx:1.27-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/loc-app-front/browser /usr/share/nginx/html
EXPOSE 80
