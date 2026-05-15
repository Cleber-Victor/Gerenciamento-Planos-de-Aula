import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchLessonPlan, deleteLessonPlan } from '../api/client.js';

function ViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchLessonPlan(id);
        setPlan(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleDelete() {
    if (!window.confirm(`Tem certeza que deseja excluir "${plan.title}"?`)) return;
    try {
      await deleteLessonPlan(id);
      navigate('/');
    } catch (err) {
      setError(err.message);
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

  if (error) {
    return (
      <div className="error-state">
        <p>❌ {error}</p>
        <Link to="/" className="btn btn-ghost" style={{ marginTop: '16px' }}>← Voltar</Link>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="view-container">
      <div className="page-header">
        <Link to="/" className="btn btn-ghost" style={{ marginBottom: '16px' }}>← Voltar para listagem</Link>
      </div>

      <div className="view-card">
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <span className="card-discipline">{plan.discipline}</span>
          <span className="card-date">
            📅 {new Date(plan.scheduled_date).toLocaleDateString('pt-BR')}
          </span>
        </div>

        <h2>{plan.title}</h2>

        <div className="view-meta">
          <span>🕐 Criado em {new Date(plan.created_at).toLocaleDateString('pt-BR')}</span>
          <span>✏️ Atualizado em {new Date(plan.updated_at).toLocaleDateString('pt-BR')}</span>
        </div>

        <div className="view-section">
          <h3>Objetivo</h3>
          <p>{plan.objective}</p>
        </div>

        <div className="view-section">
          <h3>Ementa / Resumo</h3>
          <p>{plan.summary}</p>
        </div>

        {plan.contents && plan.contents.length > 0 && (
          <div className="view-section">
            <h3>Conteúdos</h3>
            <ul>
              {plan.contents.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {plan.support_resources && plan.support_resources.length > 0 && (
          <div className="view-section">
            <h3>Recursos de Apoio</h3>
            <ul>
              {plan.support_resources.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {plan.tags && plan.tags.length > 0 && (
          <div className="view-section">
            <h3>Tags</h3>
            <div className="card-tags">
              {plan.tags.map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        <div className="view-actions">
          <Link to={`/edit/${plan.id}`} className="btn btn-primary">✏️ Editar</Link>
          <button onClick={handleDelete} className="btn btn-danger-ghost">🗑️ Excluir</button>
        </div>
      </div>
    </div>
  );
}

export default ViewPage;
