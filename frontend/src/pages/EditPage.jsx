import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchLessonPlan, updateLessonPlan, generateSmartAssist } from '../api/client.js';

function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const [contentInput, setContentInput] = useState('');
  const [resourceInput, setResourceInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchLessonPlan(id);
        setForm({
          title: data.title || '',
          objective: data.objective || '',
          summary: data.summary || '',
          scheduled_date: data.scheduled_date ? data.scheduled_date.split('T')[0] : '',
          discipline: data.discipline || '',
          contents: data.contents || [],
          support_resources: data.support_resources || [],
          tags: data.tags || [],
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function addToList(field, value, setter) {
    if (!value.trim()) return;
    setForm((prev) => ({ ...prev, [field]: [...prev[field], value.trim()] }));
    setter('');
  }

  function removeFromList(field, index) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  }

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

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await updateLessonPlan(id, form);
      navigate(`/view/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Carregando plano...</p>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="page-header">
        <Link to={`/view/${id}`} className="btn btn-ghost" style={{ marginBottom: '8px' }}>← Voltar</Link>
        <h2>Editar Plano de Aula</h2>
      </div>

      {error && <div className="toast error">{error}</div>}
      {success && <div className="toast success">{success}</div>}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Título da Aula *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="discipline">Disciplina *</label>
            <input
              id="discipline"
              name="discipline"
              type="text"
              value={form.discipline}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="summary">Ementa / Resumo *</label>
            <textarea
              id="summary"
              name="summary"
              value={form.summary}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="button"
            className={`smart-assist-btn ${aiLoading ? 'loading' : ''}`}
            onClick={handleSmartAssist}
            disabled={aiLoading}
          >
            {aiLoading ? '⏳ Gerando recomendações com IA...' : '✨ Gerar Recomendações com IA'}
          </button>

          <div className="form-group">
            <label htmlFor="objective">Objetivo *</label>
            <textarea
              id="objective"
              name="objective"
              value={form.objective}
              onChange={handleChange}
              required
            />
          </div>

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

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate(`/view/${id}`)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditPage;
