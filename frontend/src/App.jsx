import { useEffect, useState } from 'react';
import { GraphQLClient, gql } from 'graphql-request';
import StashSection from './StashSection';
import './App.css';

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

function App() {
  const [fabrics, setFabrics] = useState([]);
  const [notions, setNotions] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [tools, setTools] = useState([]);

  useEffect(() => {
    client.request(FABRICS_QUERY).then((d) => setFabrics(d.fabrics));
    client.request(NOTIONS_QUERY).then((d) => setNotions(d.notions));
    client.request(PATTERNS_QUERY).then((d) => setPatterns(d.patterns));
    client.request(TOOLS_QUERY).then((d) => setTools(d.tools));
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

  return (
    <div>
      <h1>My Sewing Stash</h1>
      <StashSection title="Fabrics" items={fabrics} onAdd={addFabric} fields={[
        { name: 'name', placeholder: 'Fabric name', required: true },
        { name: 'quantity', placeholder: 'Quantity (m)', type: 'number' },
        { name: 'notes', placeholder: 'Notes' },
      ]} />
      <StashSection title="Notions" items={notions} onAdd={addNotion} fields={[
        { name: 'name', placeholder: 'Notion name', required: true },
        { name: 'quantity', placeholder: 'Quantity', type: 'number' },
        { name: 'notes', placeholder: 'Notes' },
      ]} />
      <StashSection title="Patterns" items={patterns} onAdd={addPattern} fields={[
        { name: 'name', placeholder: 'Pattern name', required: true },
        { name: 'notes', placeholder: 'Notes' },
      ]} />
      <StashSection title="Tools" items={tools} onAdd={addTool} fields={[
        { name: 'name', placeholder: 'Tool name', required: true },
        { name: 'notes', placeholder: 'Notes' },
      ]} />
    </div>
  );
}

export default App;