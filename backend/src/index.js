const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const logger = require('./utils/logger');
const { migrate } = require('./db/migrate');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const healthRoutes = require('./routes/health');
const lessonPlanRoutes = require('./routes/lessonPlans');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Rotas
app.use('/', healthRoutes);
app.use('/api/lesson-plans', lessonPlanRoutes);

// Error handler (sempre por último)
app.use(errorHandler);

// Inicia o servidor
async function start() {
  try {
    // Cria as tabelas no banco se não existirem
    await migrate();

    app.listen(config.port, () => {
      logger.info(`Servidor rodando na porta ${config.port}`);
      logger.info(`Health check: http://localhost:${config.port}/health`);
      logger.info(`API: http://localhost:${config.port}/api/lesson-plans`);
    });
  } catch (error) {
    logger.error('Falha ao iniciar o servidor', { error: error.message });
    process.exit(1);
  }
}

start();
