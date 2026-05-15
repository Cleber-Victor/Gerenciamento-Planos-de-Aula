const { z } = require('zod');

// Valida os dados na criação de um plano de aula
const createLessonPlanSchema = z.object({
  title: z
    .string({ required_error: 'Título é obrigatório' })
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(255, 'Título deve ter no máximo 255 caracteres'),
  objective: z
    .string({ required_error: 'Objetivo é obrigatório' })
    .min(10, 'Objetivo deve ter no mínimo 10 caracteres'),
  summary: z
    .string({ required_error: 'Ementa/Resumo é obrigatório' })
    .min(10, 'Ementa deve ter no mínimo 10 caracteres'),
  scheduled_date: z
    .string({ required_error: 'Data prevista é obrigatória' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  discipline: z
    .string({ required_error: 'Disciplina é obrigatória' })
    .min(2, 'Disciplina deve ter no mínimo 2 caracteres')
    .max(100, 'Disciplina deve ter no máximo 100 caracteres'),
  contents: z.array(z.string()).default([]),
  support_resources: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

// Na edição, todos os campos são opcionais
const updateLessonPlanSchema = createLessonPlanSchema.partial();

// Valida os dados do Smart Assist (IA)
const smartAssistSchema = z.object({
  title: z
    .string({ required_error: 'Título é obrigatório para gerar recomendações' })
    .min(3, 'Título deve ter no mínimo 3 caracteres'),
  discipline: z
    .string({ required_error: 'Disciplina é obrigatória para gerar recomendações' })
    .min(2, 'Disciplina deve ter no mínimo 2 caracteres'),
  summary: z
    .string({ required_error: 'Ementa é obrigatória para gerar recomendações' })
    .min(10, 'Ementa deve ter no mínimo 10 caracteres'),
});

// Valida os filtros da listagem
const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  discipline: z.string().optional(),
  tags: z.string().optional(),
  scheduled_date_from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .optional(),
  scheduled_date_to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .optional(),
  search: z.string().optional(),
  sort_by: z.enum(['title', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc'),
});

module.exports = {
  createLessonPlanSchema,
  updateLessonPlanSchema,
  smartAssistSchema,
  listQuerySchema,
};
