import { useEffect, useState } from 'react';
import { gql } from 'graphql-request';
import client from '../client';

const PROJECTS_QUERY = gql`
  query {
    projects {
      id
      name
      status
      size_chosen
      notes
      pattern { id name }
      person { id name }
      steps { id step_name is_done position }
    }
  }
`;

const PATTERNS_QUERY = gql`query { patterns { id name } }`;
const PEOPLE_QUERY = gql`query { people { id name } }`;

const ADD_PROJECT = gql`
  mutation($name: String!, $pattern_id: ID, $person_id: ID, $size_chosen: String, $notes: String) {
    addProject(name: $name, pattern_id: $pattern_id, person_id: $person_id, size_chosen: $size_chosen, notes: $notes) {
      id
      name
      status
      size_chosen
      notes
      pattern { id name }
      person { id name }
      steps { id step_name is_done position }
    }
  }
`;

const UPDATE_PROJECT_STATUS = gql`
  mutation($id: ID!, $status: String!) {
    updateProjectStatus(id: $id, status: $status) { id status }
  }
`;

const TOGGLE_STEP = gql`
  mutation($id: ID!) {
    toggleStep(id: $id) { id is_done }
  }
`;

const COLUMNS = ['Planning', 'To do', 'In progress', 'Done'];

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [people, setPeople] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({ name: '', pattern_id: '', person_id: '', size_chosen: '', notes: '' });

  const [draggedId, setDraggedId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);

  useEffect(() => {
    client.request(PROJECTS_QUERY).then((d) => setProjects(d.projects));
    client.request(PATTERNS_QUERY).then((d) => setPatterns(d.patterns));
    client.request(PEOPLE_QUERY).then((d) => setPeople(d.people));
  }, []);

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    const data = await client.request(ADD_PROJECT, {
      name: form.name,
      pattern_id: form.pattern_id || null,
      person_id: form.person_id || null,
      size_chosen: form.size_chosen || null,
      notes: form.notes || null,
    });
    setProjects([data.addProject, ...projects]);
    setForm({ name: '', pattern_id: '', person_id: '', size_chosen: '', notes: '' });
  };

  const handleToggleStep = (stepId) => async () => {
    const data = await client.request(TOGGLE_STEP, { id: stepId });
    setProjects(
      projects.map((p) => ({
        ...p,
        steps: p.steps.map((s) => (s.id === stepId ? { ...s, is_done: data.toggleStep.is_done } : s)),
      }))
    );
  };

  // Drag-and-drop uses the browser's native DnD API, not mouse events: a drag
  // sequence fires dragstart (on the card) then, as it crosses potential drop
  // targets, dragover — which must call preventDefault() or the drop is rejected
  // by default — and finally drop (on the target). Data crosses between them via
  // e.dataTransfer, since drop lands on a different element than dragstart did.
  const handleDragStart = (project) => (e) => {
    setDraggedId(project.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', project.id);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverStatus(null);
  };

  const handleDragOver = (status) => (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStatus(status);
  };

  const handleDrop = (status) => async (e) => {
    e.preventDefault();
    setDragOverStatus(null);
    const id = e.dataTransfer.getData('text/plain');
    const project = projects.find((p) => p.id === id);
    if (!project || project.status === status) return;

    const previousStatus = project.status;
    setProjects(projects.map((p) => (p.id === id ? { ...p, status } : p)));
    try {
      await client.request(UPDATE_PROJECT_STATUS, { id, status });
    } catch {
      setProjects(projects.map((p) => (p.id === id ? { ...p, status: previousStatus } : p)));
    }
  };

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
        <h2 className="text-lg font-medium text-slate-800 mb-3">Add a project</h2>
        <form onSubmit={handleAddProject} className="flex flex-wrap gap-2 items-start">
          <input
            type="text"
            placeholder="Project name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="flex-1 min-w-[160px] rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <select
            value={form.pattern_id}
            onChange={(e) => setForm({ ...form, pattern_id: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          >
            <option value="">No pattern</option>
            {patterns.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            value={form.person_id}
            onChange={(e) => setForm({ ...form, person_id: e.target.value })}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          >
            <option value="">No person</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Size"
            value={form.size_chosen}
            onChange={(e) => setForm({ ...form, size_chosen: e.target.value })}
            className="w-24 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          />
          <input
            type="text"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="flex-1 min-w-[120px] rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          />
          <button type="submit" className="rounded-md bg-teal-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-teal-700">
            Add
          </button>
        </form>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {COLUMNS.map((status) => (
          <div
            key={status}
            onDragOver={handleDragOver(status)}
            onDragLeave={() => setDragOverStatus((prev) => (prev === status ? null : prev))}
            onDrop={handleDrop(status)}
            className={`rounded-lg border-2 border-dashed p-2 min-h-[200px] space-y-2 transition-colors ${
              dragOverStatus === status ? 'border-teal-400 bg-teal-50' : 'border-transparent'
            }`}
          >
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide px-1">{status}</h3>

            {projects
              .filter((p) => p.status === status)
              .map((project) => {
                const doneCount = project.steps.filter((s) => s.is_done).length;
                return (
                  <div
                    key={project.id}
                    draggable
                    onDragStart={handleDragStart(project)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white rounded-lg shadow-sm border border-slate-200 p-3 cursor-grab active:cursor-grabbing ${
                      draggedId === project.id ? 'opacity-40' : ''
                    }`}
                  >
                    <button
                      onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
                      className="text-sm font-medium text-slate-800 text-left w-full"
                    >
                      {project.name} {expandedId === project.id ? '▲' : '▼'}
                    </button>
                    <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                      {project.pattern && <div>Pattern: {project.pattern.name}</div>}
                      {project.person && <div>For: {project.person.name}</div>}
                      {project.size_chosen && <div>Size: {project.size_chosen}</div>}
                      <div>{doneCount}/{project.steps.length} steps done</div>
                    </div>

                    {expandedId === project.id && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                        {project.notes && <p className="text-xs text-slate-500 italic">{project.notes}</p>}
                        <ul className="space-y-1">
                          {project.steps.map((step) => (
                            <li key={step.id}>
                              <label className="flex items-center gap-2 text-xs text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={step.is_done}
                                  onChange={handleToggleStep(step.id)}
                                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-400"
                                />
                                <span className={step.is_done ? 'line-through text-slate-400' : ''}>{step.step_name}</span>
                              </label>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectsPage;
