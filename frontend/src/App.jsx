import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ListPage from './pages/ListPage.jsx';
import CreatePage from './pages/CreatePage.jsx';
import EditPage from './pages/EditPage.jsx';
import ViewPage from './pages/ViewPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<ListPage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/edit/:id" element={<EditPage />} />
          <Route path="/view/:id" element={<ViewPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
