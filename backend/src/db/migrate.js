const { query } = require('./connection');
const logger = require('../utils/logger');

/**
 * Cria as tabelas do banco de dados se não existirem
 */
async function migrate() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS lesson_plans (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        objective TEXT NOT NULL,
        summary TEXT NOT NULL,
        scheduled_date DATE NOT NULL,
        discipline VARCHAR(100) NOT NULL,
        contents JSONB DEFAULT '[]'::jsonb,
        support_resources JSONB DEFAULT '[]'::jsonb,
        tags JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Índices para melhorar performance de filtros e buscas
    await query(`
      CREATE INDEX IF NOT EXISTS idx_lesson_plans_discipline ON lesson_plans (discipline);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_lesson_plans_scheduled_date ON lesson_plans (scheduled_date);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_lesson_plans_tags ON lesson_plans USING GIN (tags);
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_lesson_plans_title ON lesson_plans (title);
    `);

    logger.info('Migração do banco de dados concluída com sucesso');
  } catch (error) {
    logger.error('Erro na migração do banco de dados', { error: error.message });
    throw error;
  }
}

module.exports = { migrate };
