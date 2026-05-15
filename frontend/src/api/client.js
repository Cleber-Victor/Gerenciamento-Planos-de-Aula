const API_BASE = '/api/lesson-plans';

async function request(url, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || `Erro ${response.status}`);
  }

  return response.json();
}

// Listar planos com filtros
export function fetchLessonPlans(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.append(key, value);
    }
  });
  return request(`${API_BASE}?${query.toString()}`);
}

// Buscar plano por ID
export function fetchLessonPlan(id) {
  return request(`${API_BASE}/${id}`);
}

// Criar plano
export function createLessonPlan(data) {
  return request(API_BASE, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Atualizar plano
export function updateLessonPlan(id, data) {
  return request(`${API_BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Excluir plano
export function deleteLessonPlan(id) {
  return request(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
}

// Smart Assist — gerar recomendações com IA
export function generateSmartAssist({ title, discipline, summary }) {
  return request(`${API_BASE}/smart-assist`, {
    method: 'POST',
    body: JSON.stringify({ title, discipline, summary }),
  });
}
