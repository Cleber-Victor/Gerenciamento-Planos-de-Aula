import { Link, useLocation } from 'react-router-dom';

function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-icon">📚</span>
            <h1>Planos de Aula</h1>
          </Link>
          <nav className="header-nav">
            <Link
              to="/"
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Meus Planos
            </Link>
            <Link
              to="/create"
              className="nav-link btn-primary"
            >
              + Novo Plano
            </Link>
          </nav>
        </div>
      </header>
      <main className="app-main">
        {children}
      </main>
    </div>
  );
}

export default Layout;
