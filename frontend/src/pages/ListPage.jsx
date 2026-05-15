import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchLessonPlans, deleteLessonPlan } from '../api/client.js';

function ListPage() {
  const [plans, setPlans] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    discipline: '',
    tags: '',
    sort_by: 'created_at',
    sort_order: 'desc',
    page: 1,
    limit: 10,
  });

  async function loadPlans() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchLessonPlans(filters);
      setPlans(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlans();
  }, [filters]);

  function handleFilterChange(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  }

  function handlePageChange(newPage) {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }

  async function handleDelete(id, title) {
    if (!window.confirm(`Tem certeza que deseja excluir "${title}"?`)) return;
    try {
      await deleteLessonPlan(id);
      loadPlans();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="list-page">
      <div className="page-header">
        <h2>Meus Planos de Aula</h2>
        <p className="subtitle">{pagination.total} plano(s) encontrado(s)</p>
      </div>

      {/* Filtros */}
      <div className="filters-bar">
        <div className="filter-group">
          <input
            type="text"
            name="search"
            placeholder="🔍 Buscar por título..."
            value={filters.search}
            onChange={handleFilterChange}
            className="filter-input search-input"
          />
        </div>
        <div className="filter-group">
          <input
            type="text"
            name="discipline"
            placeholder="Disciplina"
            value={filters.discipline}
            onChange={handleFilterChange}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <input
            type="text"
            name="tags"
            placeholder="Tags (ex: redes,ospf)"
            value={filters.tags}
            onChange={handleFilterChange}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <select
            name="sort_by"
            value={filters.sort_by}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="created_at">Ordenar por data</option>
            <option value="title">Ordenar por título</option>
          </select>
        </div>
        <div className="filter-group">
          <select
            name="sort_order"
            value={filters.sort_order}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="desc">Mais recente</option>
            <option value="asc">Mais antigo</option>
          </select>
        </div>
      </div>

      {/* Conteúdo */}
      {loading && <div className="loading-state"><div className="spinner"></div><p>Carregando...</p></div>}

      {error && <div className="error-state"><p>❌ {error}</p></div>}

      {!loading && !error && plans.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📝</span>
          <h3>Nenhum plano de aula encontrado</h3>
          <p>Comece criando seu primeiro plano!</p>
          <Link to="/create" className="btn btn-primary">+ Criar Plano</Link>
        </div>
      )}

      {!loading && !error && plans.length > 0 && (
        <>
          <div className="plans-grid">
            {plans.map((plan) => (
              <div key={plan.id} className="plan-card">
                <div className="card-header">
                  <span className="card-discipline">{plan.discipline}</span>
                  <span className="card-date">
                    {new Date(plan.scheduled_date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <h3 className="card-title">{plan.title}</h3>
                <p className="card-summary">{plan.summary?.substring(0, 120)}...</p>
                <div className="card-tags">
                  {(plan.tags || []).map((tag, i) => (
                    <span key={i} className="tag">{tag}</span>
                  ))}
                </div>
                <div className="card-actions">
                  <Link to={`/view/${plan.id}`} className="btn btn-ghost">Ver</Link>
                  <Link to={`/edit/${plan.id}`} className="btn btn-ghost">Editar</Link>
                  <button
                    onClick={() => handleDelete(plan.id, plan.title)}
                    className="btn btn-danger-ghost"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="btn btn-ghost"
              >
                ← Anterior
              </button>
              <span className="page-info">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="btn btn-ghost"
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ListPage;
