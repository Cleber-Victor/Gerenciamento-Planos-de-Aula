const { Router } = require('express');
const lessonPlanService = require('../services/lessonPlanService');
const aiService = require('../services/aiService');
const {
  createLessonPlanSchema,
  updateLessonPlanSchema,
  smartAssistSchema,
  listQuerySchema,
} = require('../validators/lessonPlan');

const router = Router();

// GET /api/lesson-plans — Listar com filtros e paginação
router.get('/', async (req, res, next) => {
  try {
    const filters = listQuerySchema.parse(req.query);
    const result = await lessonPlanService.findAll(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/lesson-plans/:id — Buscar por ID
router.get('/:id', async (req, res, next) => {
  try {
    const plan = await lessonPlanService.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        status: 404,
        message: 'Plano de aula não encontrado',
      });
    }

    res.json(plan);
  } catch (error) {
    next(error);
  }
});

// POST /api/lesson-plans — Criar novo plano
router.post('/', async (req, res, next) => {
  try {
    const data = createLessonPlanSchema.parse(req.body);
    const plan = await lessonPlanService.create(data);
    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
});

// PUT /api/lesson-plans/:id — Atualizar plano
router.put('/:id', async (req, res, next) => {
  try {
    const data = updateLessonPlanSchema.parse(req.body);
    const plan = await lessonPlanService.update(req.params.id, data);

    if (!plan) {
      return res.status(404).json({
        status: 404,
        message: 'Plano de aula não encontrado',
      });
    }

    res.json(plan);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/lesson-plans/:id — Excluir plano
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await lessonPlanService.remove(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        status: 404,
        message: 'Plano de aula não encontrado',
      });
    }

    res.json({ message: 'Plano de aula excluído com sucesso' });
  } catch (error) {
    next(error);
  }
});

// POST /api/lesson-plans/smart-assist — Gerar recomendações com IA
router.post('/smart-assist', async (req, res, next) => {
  try {
    const data = smartAssistSchema.parse(req.body);
    const recommendations = await aiService.generateRecommendations(data);
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
