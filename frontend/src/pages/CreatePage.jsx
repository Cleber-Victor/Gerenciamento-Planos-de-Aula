import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLessonPlan, generateSmartAssist } from '../api/client.js';

// Regras de mínimo de caracteres (sincronizadas com o backend)
const MIN_LENGTHS = {
  title: 3,
  discipline: 2,
  summary: 4,
  objective: 4,
};

function getFieldError(name, value) {
  const min = MIN_LENGTHS[name];
  if (!min) return null;
  if (value.length > 0 && value.length < min) {
    return `Mínimo de ${min} caracteres (${value.length}/${min})`;
  }
  return null;
}

function CreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [touched, setTouched] = useState({});

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
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
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

  // Helper para renderizar um campo com validação visual
  function renderField(name, label, placeholder, isTextarea = false) {
    const fieldError = touched[name] ? getFieldError(name, form[name]) : null;
    const isValid = touched[name] && form[name].length >= (MIN_LENGTHS[name] || 0) && form[name].length > 0;
    const InputTag = isTextarea ? 'textarea' : 'input';

    return (
      <div className={`form-group ${fieldError ? 'has-error' : ''} ${isValid ? 'is-valid' : ''}`}>
        <label htmlFor={name}>{label} *</label>
        <InputTag
          id={name}
          name={name}
          type={isTextarea ? undefined : 'text'}
          placeholder={placeholder}
          value={form[name]}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          className={fieldError ? 'input-error' : isValid ? 'input-valid' : ''}
        />
        {fieldError && <span className="field-error">{fieldError}</span>}
        {!fieldError && MIN_LENGTHS[name] && touched[name] && !isValid && form[name].length === 0 && (
          <span className="field-hint">Mínimo de {MIN_LENGTHS[name]} caracteres</span>
        )}
      </div>
    );
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
          {renderField('title', 'Título da Aula', 'Ex: Introdução ao Protocolo OSPF')}
          {renderField('discipline', 'Disciplina', 'Ex: Redes de Computadores')}
          {renderField('summary', 'Ementa / Resumo', 'Descreva brevemente o conteúdo da aula...', true)}

          {/* Botão Smart Assist */}
          <button
            type="button"
            className={`smart-assist-btn ${aiLoading ? 'loading' : ''}`}
            onClick={handleSmartAssist}
            disabled={aiLoading}
          >
            {aiLoading ? '⏳ Gerando recomendações com IA...' : '✨ Gerar Recomendações com IA'}
          </button>

          {renderField('objective', 'Objetivo', 'O que o aluno deve aprender ao final da aula?', true)}

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
