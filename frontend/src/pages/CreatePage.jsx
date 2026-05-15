import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLessonPlan, generateSmartAssist } from '../api/client.js';

function CreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    title: '',
    objective: '',
    summary: '',
    scheduled_date: '',
    discipline: '',
    contents: [],
    support_resources: [],
    tags: [],
  });

  // Campos de texto temporários para listas (conteúdos, recursos, tags)
  const [contentInput, setContentInput] = useState('');
  const [resourceInput, setResourceInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Adiciona item a uma lista (contents, support_resources, tags)
  function addToList(field, value, setter) {
    if (!value.trim()) return;
    setForm((prev) => ({ ...prev, [field]: [...prev[field], value.trim()] }));
    setter('');
  }

  // Remove item de uma lista
  function removeFromList(field, index) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  }

  // Smart Assist — gerar recomendações com IA
  async function handleSmartAssist() {
    if (!form.title || !form.discipline || !form.summary) {
      setError('Preencha o Título, a Disciplina e a Ementa antes de gerar recomendações.');
      return;
    }

    setAiLoading(true);
    setError(null);

    try {
      const result = await generateSmartAssist({
        title: form.title,
        discipline: form.discipline,
        summary: form.summary,
      });

      setForm((prev) => ({
        ...prev,
        contents: result.contents || prev.contents,
        support_resources: result.support_resources || prev.support_resources,
        tags: result.tags || prev.tags,
      }));

      setSuccess('✨ Recomendações geradas com sucesso!');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(`Erro ao gerar recomendações: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  }

  // Submeter formulário
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createLessonPlan(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-container">
      <div className="page-header">
        <h2>Criar Plano de Aula</h2>
        <p className="subtitle">Preencha as informações e use a IA para sugestões</p>
      </div>

      {error && <div className="toast error">{error}</div>}
      {success && <div className="toast success">{success}</div>}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {/* Título */}
          <div className="form-group">
            <label htmlFor="title">Título da Aula *</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Ex: Introdução ao Protocolo OSPF"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Disciplina */}
          <div className="form-group">
            <label htmlFor="discipline">Disciplina *</label>
            <input
              id="discipline"
              name="discipline"
              type="text"
              placeholder="Ex: Redes de Computadores"
              value={form.discipline}
              onChange={handleChange}
              required
            />
          </div>

          {/* Ementa/Resumo */}
          <div className="form-group">
            <label htmlFor="summary">Ementa / Resumo *</label>
            <textarea
              id="summary"
              name="summary"
              placeholder="Descreva brevemente o conteúdo da aula..."
              value={form.summary}
              onChange={handleChange}
              required
            />
          </div>

          {/* Botão Smart Assist */}
          <button
            type="button"
            className={`smart-assist-btn ${aiLoading ? 'loading' : ''}`}
            onClick={handleSmartAssist}
            disabled={aiLoading}
          >
            {aiLoading ? '⏳ Gerando recomendações com IA...' : '✨ Gerar Recomendações com IA'}
          </button>

          {/* Objetivo */}
          <div className="form-group">
            <label htmlFor="objective">Objetivo *</label>
            <textarea
              id="objective"
              name="objective"
              placeholder="O que o aluno deve aprender ao final da aula?"
              value={form.objective}
              onChange={handleChange}
              required
            />
          </div>

          {/* Data Prevista */}
          <div className="form-group">
            <label htmlFor="scheduled_date">Data Prevista *</label>
            <input
              id="scheduled_date"
              name="scheduled_date"
              type="date"
              value={form.scheduled_date}
              onChange={handleChange}
              required
            />
          </div>

          {/* Conteúdos */}
          <div className="form-group">
            <label>Conteúdos</label>
            <div className="list-input">
              <input
                type="text"
                placeholder="Adicionar conteúdo e pressionar Enter"
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToList('contents', contentInput, setContentInput);
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-ghost add-btn"
                onClick={() => addToList('contents', contentInput, setContentInput)}
              >
                +
              </button>
            </div>
            <div className="list-items">
              {form.contents.map((item, i) => (
                <span key={i} className="list-item">
                  {item}
                  <button type="button" onClick={() => removeFromList('contents', i)}>×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Recursos de Apoio */}
          <div className="form-group">
            <label>Recursos de Apoio</label>
            <div className="list-input">
              <input
                type="text"
                placeholder="Adicionar recurso e pressionar Enter"
                value={resourceInput}
                onChange={(e) => setResourceInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToList('support_resources', resourceInput, setResourceInput);
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-ghost add-btn"
                onClick={() => addToList('support_resources', resourceInput, setResourceInput)}
              >
                +
              </button>
            </div>
            <div className="list-items">
              {form.support_resources.map((item, i) => (
                <span key={i} className="list-item">
                  {item}
                  <button type="button" onClick={() => removeFromList('support_resources', i)}>×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label>Tags</label>
            <div className="list-input">
              <input
                type="text"
                placeholder="Adicionar tag e pressionar Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addToList('tags', tagInput, setTagInput);
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-ghost add-btn"
                onClick={() => addToList('tags', tagInput, setTagInput)}
              >
                +
              </button>
            </div>
            <div className="card-tags">
              {form.tags.map((item, i) => (
                <span key={i} className="tag">
                  {item}
                  <button type="button" onClick={() => removeFromList('tags', i)} className="tag-remove">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Ações */}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate('/')}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Plano'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePage;
