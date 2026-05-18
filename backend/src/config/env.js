const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Em desenvolvimento local, carrega o .env da raiz do projeto.
// Em Docker, as variáveis são injetadas pelo docker-compose.
const envPath = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}


const config = {
  port: parseInt(process.env.PORT, 10) || 3001,

  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'planos_de_aula',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },

  aiProvider: process.env.AI_PROVIDER || 'gemini',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
};

module.exports = config;
