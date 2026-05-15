const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/env');
const logger = require('../utils/logger');

const PROMPT_TEMPLATE = `Você é um Assistente Pedagógico especialista em planejamento de aulas.

Com base nas informações abaixo, sugira conteúdos complementares, recursos de apoio e tags para o plano de aula.

**Título da Aula:** {title}
**Disciplina:** {discipline}
**Ementa/Resumo:** {summary}

Responda APENAS com um JSON válido, sem texto adicional, no seguinte formato:
{
  "contents": ["conteúdo 1", "conteúdo 2", "conteúdo 3", "conteúdo 4", "conteúdo 5"],
  "support_resources": ["recurso 1", "recurso 2", "recurso 3"],
  "tags": ["tag1", "tag2", "tag3"]
}

Regras:
- Sugira entre 4 e 6 conteúdos complementares relevantes para a aula.
- Sugira entre 2 e 4 recursos de apoio (livros, vídeos, artigos, ferramentas).
- Sugira exatamente 3 tags curtas e descritivas.
- Todos os textos devem estar em português brasileiro.`;

async function generateRecommendations({ title, discipline, summary }) {
  const startTime = Date.now();

  const prompt = PROMPT_TEMPLATE
    .replace('{title}', title)
    .replace('{discipline}', discipline)
    .replace('{summary}', summary);

  try {
    if (!config.geminiApiKey) {
      throw new Error('GEMINI_API_KEY não configurada no .env');
    }

    const genAI = new GoogleGenerativeAI(config.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Remove marcadores de código (```json ... ```) se existirem
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsed = JSON.parse(cleanText);

    const latency = ((Date.now() - startTime) / 1000).toFixed(1);
    const tokenUsage = response.usageMetadata?.totalTokenCount || 'N/A';

    logger.info(
      `AI Request: Title="${title}", Discipline="${discipline}", TokenUsage=${tokenUsage}, Latency=${latency}s`,
    );

    return {
      contents: parsed.contents || [],
      support_resources: parsed.support_resources || [],
      tags: parsed.tags || [],
    };
  } catch (error) {
    const latency = ((Date.now() - startTime) / 1000).toFixed(1);
    logger.error(`AI Error: Title="${title}", Discipline="${discipline}", Latency=${latency}s`, {
      error: error.message,
    });
    throw error;
  }
}

module.exports = { generateRecommendations };
