# --- Estágio 1: Build ---
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.js ./
COPY public/ ./public/
COPY src/ ./src/

RUN npm run build

# --- Estágio 2: Servir com Nginx ---
FROM nginx:alpine

# Config personalizada do nginx com proxy reverso para o backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os assets buildados
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
