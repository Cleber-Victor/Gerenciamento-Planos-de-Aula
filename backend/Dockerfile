FROM node:20-alpine

WORKDIR /app

# Instala dependências primeiro para aproveitar cache de camadas
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copia o código-fonte
COPY src/ ./src/

EXPOSE 3001

CMD ["node", "src/index.js"]
