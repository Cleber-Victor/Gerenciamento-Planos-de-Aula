const { query } = require('../db/connection');
const logger = require('../utils/logger');

async function create(data) {
  const result = await query(
    `INSERT INTO lesson_plans (title, objective, summary, scheduled_date, discipline, contents, support_resources, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.title,
      data.objective,
      data.summary,
      data.scheduled_date,
      data.discipline,
      JSON.stringify(data.contents || []),
      JSON.stringify(data.support_resources || []),
      JSON.stringify(data.tags || []),
    ],
  );

  logger.info('Plano de aula criado', { id: result.rows[0].id, title: data.title });
  return result.rows[0];
}

async function findById(id) {
  const result = await query('SELECT * FROM lesson_plans WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function findAll(filters) {
  const conditions = [];
  const params = [];
  let paramIndex = 1;

  // Filtro por disciplina
  if (filters.discipline) {
    conditions.push(`discipline ILIKE $${paramIndex}`);
    params.push(`%${filters.discipline}%`);
    paramIndex++;
  }

  // Filtro por tags
  if (filters.tags) {
    const tagList = filters.tags.split(',').map((t) => t.trim());
    conditions.push(`tags ?| $${paramIndex}`);
    params.push(tagList);
    paramIndex++;
  }

  // Filtro por data (de)
  if (filters.scheduled_date_from) {
    conditions.push(`scheduled_date >= $${paramIndex}`);
    params.push(filters.scheduled_date_from);
    paramIndex++;
  }

  // Filtro por data (até)
  if (filters.scheduled_date_to) {
    conditions.push(`scheduled_date <= $${paramIndex}`);
    params.push(filters.scheduled_date_to);
    paramIndex++;
  }

  // Busca por título
  if (filters.search) {
    conditions.push(`title ILIKE $${paramIndex}`);
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sortBy = filters.sort_by === 'title' ? 'title' : 'created_at';
  const sortOrder = filters.sort_order === 'asc' ? 'ASC' : 'DESC';

  // Paginação
  const limit = filters.limit || 10;
  const offset = ((filters.page || 1) - 1) * limit;

  const dataResult = await query(
    `SELECT * FROM lesson_plans ${whereClause}
     ORDER BY ${sortBy} ${sortOrder}
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset],
  );

  // Total de registros (para paginação)
  const countResult = await query(
    `SELECT COUNT(*) as total FROM lesson_plans ${whereClause}`,
    params,
  );

  const total = parseInt(countResult.rows[0].total, 10);

  return {
    data: dataResult.rows,
    pagination: {
      page: filters.page || 1,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function update(id, data) {
  const fields = [];
  const params = [];
  let paramIndex = 1;

  const allowedFields = [
    'title',
    'objective',
    'summary',
    'scheduled_date',
    'discipline',
    'contents',
    'support_resources',
    'tags',
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = $${paramIndex}`);
      const jsonFields = ['contents', 'support_resources', 'tags'];
      params.push(jsonFields.includes(field) ? JSON.stringify(data[field]) : data[field]);
      paramIndex++;
    }
  }

  if (fields.length === 0) {
    return findById(id);
  }

  fields.push(`updated_at = NOW()`);

  const result = await query(
    `UPDATE lesson_plans SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    [...params, id],
  );

  if (result.rows.length === 0) {
    return null;
  }

  logger.info('Plano de aula atualizado', { id, fields: Object.keys(data) });
  return result.rows[0];
}

async function remove(id) {
  const result = await query('DELETE FROM lesson_plans WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    return false;
  }

  logger.info('Plano de aula excluído', { id });
  return true;
}

module.exports = { create, findById, findAll, update, remove };
