import { useEffect, useState } from 'react';
import { gql } from 'graphql-request';
import client from '../client';
import EntitySection from '../EntitySection';

const FABRICS_QUERY = gql`query { fabrics { id name quantity notes photo_url } }`;
const ADD_FABRIC = gql`mutation($name: String!, $quantity: Float, $notes: String, $photo_url: String) {
  addFabric(name: $name, quantity: $quantity, notes: $notes, photo_url: $photo_url) { id name quantity notes photo_url }
}`;

const NOTIONS_QUERY = gql`query { notions { id name quantity notes photo_url } }`;
const ADD_NOTION = gql`mutation($name: String!, $quantity: Float, $notes: String, $photo_url: String) {
  addNotion(name: $name, quantity: $quantity, notes: $notes, photo_url: $photo_url) { id name quantity notes photo_url }
}`;

const PATTERNS_QUERY = gql`query { patterns { id name notes photo_url file_url } }`;
const ADD_PATTERN = gql`mutation($name: String!, $notes: String, $photo_url: String, $file_url: String) {
  addPattern(name: $name, notes: $notes, photo_url: $photo_url, file_url: $file_url) { id name notes photo_url file_url }
}`;

const TOOLS_QUERY = gql`query { tools { id name notes } }`;
const ADD_TOOL = gql`mutation($name: String!, $notes: String) {
  addTool(name: $name, notes: $notes) { id name notes }
}`;

const IMPORT_QUERY = gql`
  query($url: String!) {
    importFromUrl(url: $url) {
      title
      image
      description
    }
  }
`;

const TABS = ['Fabrics', 'Notions', 'Patterns', 'Tools'];
const IMPORTABLE_TABS = ['Fabrics', 'Patterns'];

function StashPage() {
  const [activeTab, setActiveTab] = useState('Fabrics');
  const [fabrics, setFabrics] = useState([]);
  const [notions, setNotions] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [tools, setTools] = useState([]);

  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(null);
  const [prefill, setPrefill] = useState(null);

  useEffect(() => {
    client.request(FABRICS_QUERY).then((d) => setFabrics(d.fabrics));
    client.request(NOTIONS_QUERY).then((d) => setNotions(d.notions));
    client.request(PATTERNS_QUERY).then((d) => setPatterns(d.patterns));
    client.request(TOOLS_QUERY).then((d) => setTools(d.tools));
  }, []);

  useEffect(() => {
    setImportUrl('');
    setImportError(null);
    setPrefill(null);
  }, [activeTab]);

  const addFabric = async (vars) => {
    const data = await client.request(ADD_FABRIC, vars);
    setFabrics([data.addFabric, ...fabrics]);
  };
  const addNotion = async (vars) => {
    const data = await client.request(ADD_NOTION, vars);
    setNotions([data.addNotion, ...notions]);
  };
  const addPattern = async (vars) => {
    const data = await client.request(ADD_PATTERN, vars);
    setPatterns([data.addPattern, ...patterns]);
  };
  const addTool = async (vars) => {
    const data = await client.request(ADD_TOOL, vars);
    setTools([data.addTool, ...tools]);
  };

  const handleImport = async () => {
    if (!importUrl) return;
    setImporting(true);
    setImportError(null);
    try {
      const data = await client.request(IMPORT_QUERY, { url: importUrl });
      setPrefill({
        name: data.importFromUrl.title || '',
        photo_url: data.importFromUrl.image || '',
        notes: data.importFromUrl.description || '',
      });
    } catch (err) {
      setImportError('Could not fetch that page — check the URL and try again.');
    }
    setImporting(false);
  };

  const tabButtonClass = (tab) =>
    `px-4 py-2 text-sm font-medium border-b-2 ${
      activeTab === tab ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'
    }`;

  return (
    <div>
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={tabButtonClass(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {IMPORTABLE_TABS.includes(activeTab) && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4 flex gap-2 items-start flex-wrap">
          <input
            type="url"
            placeholder="Paste a webshop product URL"
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            className="flex-1 min-w-[200px] rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <button
            onClick={handleImport}
            disabled={importing}
            className="rounded-md bg-slate-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {importing ? 'Fetching…' : 'Import'}
          </button>
          {importError && <p className="text-sm text-red-600 w-full">{importError}</p>}
          {prefill && !importError && (
            <p className="text-sm text-teal-700 w-full">Found "{prefill.name || 'untitled'}" — review and adjust below, then Add.</p>
          )}
        </div>
      )}

      {activeTab === 'Fabrics' && (
        <EntitySection title="Fabrics" items={fabrics} onAdd={addFabric} prefill={prefill} fields={[
          { name: 'name', placeholder: 'Fabric name', required: true },
          { name: 'quantity', placeholder: 'Quantity (m)', type: 'number' },
          { name: 'notes', placeholder: 'Notes' },
          { name: 'photo_url', placeholder: 'Photo', type: 'photo' },
        ]} />
      )}
      {activeTab === 'Notions' && (
        <EntitySection title="Notions" items={notions} onAdd={addNotion} fields={[
          { name: 'name', placeholder: 'Notion name', required: true },
          { name: 'quantity', placeholder: 'Quantity', type: 'number' },
          { name: 'notes', placeholder: 'Notes' },
          { name: 'photo_url', placeholder: 'Photo', type: 'photo' },
        ]} />
      )}
      {activeTab === 'Patterns' && (
        <EntitySection title="Patterns" items={patterns} onAdd={addPattern} prefill={prefill} fields={[
          { name: 'name', placeholder: 'Pattern name', required: true },
          { name: 'notes', placeholder: 'Notes' },
          { name: 'photo_url', placeholder: 'Photo', type: 'photo' },
          { name: 'file_url', placeholder: 'Pattern file link', type: 'link' },
        ]} />
      )}
      {activeTab === 'Tools' && (
        <EntitySection title="Tools" items={tools} onAdd={addTool} fields={[
          { name: 'name', placeholder: 'Tool name', required: true },
          { name: 'notes', placeholder: 'Notes' },
        ]} />
      )}
    </div>
  );
}

export default StashPage;