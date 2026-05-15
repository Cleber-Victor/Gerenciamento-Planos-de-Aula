const { ZodError } = require('zod');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, _next) => {
  // Erros de validação do Zod (dados inválidos do usuário)
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    logger.warn('Erro de validação', { errors });

    return res.status(400).json({
      status: 400,
      message: 'Dados inválidos',
      errors,
    });
  }

  // Outros erros
  logger.error(err.message, { stack: err.stack });

  const status = err.statusCode || 500;
  res.status(status).json({
    status,
    message: err.message || 'Erro interno do servidor',
  });
};

module.exports = errorHandler;
