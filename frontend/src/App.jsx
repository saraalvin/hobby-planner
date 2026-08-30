import { useEffect, useState } from 'react';
import { GraphQLClient, gql } from 'graphql-request';
import EntitySection from './EntitySection';

const client = new GraphQLClient('http://localhost:4000/');

const FABRICS_QUERY = gql`query { fabrics { id name quantity notes } }`;
const ADD_FABRIC = gql`mutation($name: String!, $quantity: Float, $notes: String) {
  addFabric(name: $name, quantity: $quantity, notes: $notes) { id name quantity notes }
}`;

const NOTIONS_QUERY = gql`query { notions { id name quantity notes } }`;
const ADD_NOTION = gql`mutation($name: String!, $quantity: Float, $notes: String) {
  addNotion(name: $name, quantity: $quantity, notes: $notes) { id name quantity notes }
}`;

const PATTERNS_QUERY = gql`query { patterns { id name notes } }`;
const ADD_PATTERN = gql`mutation($name: String!, $notes: String) {
  addPattern(name: $name, notes: $notes) { id name notes }
}`;

const TOOLS_QUERY = gql`query { tools { id name notes } }`;
const ADD_TOOL = gql`mutation($name: String!, $notes: String) {
  addTool(name: $name, notes: $notes) { id name notes }
}`;

const MEASUREMENTS_QUERY = gql`query { measurements { id person_name bust waist hip notes } }`;
const ADD_MEASUREMENT = gql`mutation($person_name: String!, $bust: Float, $waist: Float, $hip: Float, $notes: String) {
  addMeasurement(person_name: $person_name, bust: $bust, waist: $waist, hip: $hip, notes: $notes) {
    id person_name bust waist hip notes
  }
}`;

function App() {
  const [fabrics, setFabrics] = useState([]);
  const [notions, setNotions] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [tools, setTools] = useState([]);
  const [measurements, setMeasurements] = useState([]);

  useEffect(() => {
    client.request(FABRICS_QUERY).then((d) => setFabrics(d.fabrics));
    client.request(NOTIONS_QUERY).then((d) => setNotions(d.notions));
    client.request(PATTERNS_QUERY).then((d) => setPatterns(d.patterns));
    client.request(TOOLS_QUERY).then((d) => setTools(d.tools));
    client.request(MEASUREMENTS_QUERY).then((d) => setMeasurements(d.measurements));
  }, []);

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
  const addMeasurement = async (vars) => {
    const data = await client.request(ADD_MEASUREMENT, vars);
    setMeasurements([data.addMeasurement, ...measurements]);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-semibold text-slate-800">My Sewing Stash</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EntitySection title="Fabrics" items={fabrics} onAdd={addFabric} fields={[
            { name: 'name', placeholder: 'Fabric name', required: true },
            { name: 'quantity', placeholder: 'Quantity (m)', type: 'number' },
            { name: 'notes', placeholder: 'Notes' },
          ]} />
          <EntitySection title="Notions" items={notions} onAdd={addNotion} fields={[
            { name: 'name', placeholder: 'Notion name', required: true },
            { name: 'quantity', placeholder: 'Quantity', type: 'number' },
            { name: 'notes', placeholder: 'Notes' },
          ]} />
          <EntitySection title="Patterns" items={patterns} onAdd={addPattern} fields={[
            { name: 'name', placeholder: 'Pattern name', required: true },
            { name: 'notes', placeholder: 'Notes' },
          ]} />
          <EntitySection title="Tools" items={tools} onAdd={addTool} fields={[
            { name: 'name', placeholder: 'Tool name', required: true },
            { name: 'notes', placeholder: 'Notes' },
          ]} />
        </div>

        <EntitySection title="Measurements" items={measurements} onAdd={addMeasurement} fields={[
          { name: 'person_name', placeholder: 'Person name', required: true },
          { name: 'bust', placeholder: 'Bust (cm)', type: 'number' },
          { name: 'waist', placeholder: 'Waist (cm)', type: 'number' },
          { name: 'hip', placeholder: 'Hip (cm)', type: 'number' },
          { name: 'notes', placeholder: 'Notes' },
        ]} />
      </main>
    </div>
  );
}

export default App;