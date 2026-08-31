import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import StashPage from './pages/StashPage';
import PeoplePage from './pages/PeoplePage';
import ProjectsPage from './pages/ProjectsPage';

const navLinkClass = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${
    isActive ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`;

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-800">My Sewing Stash</h1>
          <nav className="flex gap-1">
            <NavLink to="/stash" className={navLinkClass}>Stash</NavLink>
            <NavLink to="/people" className={navLinkClass}>People</NavLink>
            <NavLink to="/projects" className={navLinkClass}>Projects</NavLink>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/stash" replace />} />
          <Route path="/stash" element={<StashPage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;