import { useEffect, useState } from 'react';
import { GraphQLClient, gql } from 'graphql-request';
import './App.css';

const client = new GraphQLClient('http://localhost:4000/');

const FABRICS_QUERY = gql`
  query {
    fabrics {
      id
      name
      quantity
    }
  }
`;

const ADD_FABRIC_MUTATION = gql`
  mutation AddFabric($name: String!, $quantity: Float) {
    addFabric(name: $name, quantity: $quantity) {
      id
      name
      quantity
    }
  }
`;

const NOTIONS_QUERY = gql`
  query {
    notions {
      id
      name
      quantity
      notes
    }
  }
`;

const ADD_NOTION_MUTATION = gql`
  mutation AddNotion($name: String!, $quantity: Float, $notes: String) {
    addNotion(name: $name, quantity: $quantity, notes: $notes) {
      id
      name
      quantity
      notes
    }
  }
`;

function App() {
  const [fabrics, setFabrics] = useState([]);
  const [fabricName, setFabricName] = useState('');
  const [fabricQuantity, setFabricQuantity] = useState('');

  const [notions, setNotions] = useState([]);
  const [notionName, setNotionName] = useState('');
  const [notionQuantity, setNotionQuantity] = useState('');
  const [notionNotes, setNotionNotes] = useState('');

  useEffect(() => {
    client.request(FABRICS_QUERY).then((data) => setFabrics(data.fabrics));
    client.request(NOTIONS_QUERY).then((data) => setNotions(data.notions));
  }, []);

  const handleAddFabric = async (e) => {
    e.preventDefault();
    const data = await client.request(ADD_FABRIC_MUTATION, {
      name: fabricName,
      quantity: fabricQuantity ? parseFloat(fabricQuantity) : null,
    });
    setFabrics([data.addFabric, ...fabrics]);
    setFabricName('');
    setFabricQuantity('');
  };

  const handleAddNotion = async (e) => {
    e.preventDefault();
    const data = await client.request(ADD_NOTION_MUTATION, {
      name: notionName,
      quantity: notionQuantity ? parseFloat(notionQuantity) : null,
      notes: notionNotes || null,
    });
    setNotions([data.addNotion, ...notions]);
    setNotionName('');
    setNotionQuantity('');
    setNotionNotes('');
  };

  return (
    <div>
      <h1>My Sewing Stash</h1>

      <section>
        <h2>Fabrics</h2>
        <form onSubmit={handleAddFabric}>
          <input type="text" placeholder="Fabric name" value={fabricName} onChange={(e) => setFabricName(e.target.value)} required />
          <input type="number" step="0.1" placeholder="Quantity (m)" value={fabricQuantity} onChange={(e) => setFabricQuantity(e.target.value)} />
          <button type="submit">Add fabric</button>
        </form>
        <ul>
          {fabrics.map((fabric) => (
            <li key={fabric.id}>{fabric.name} — {fabric.quantity}m</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Notions</h2>
        <form onSubmit={handleAddNotion}>
          <input type="text" placeholder="Notion name" value={notionName} onChange={(e) => setNotionName(e.target.value)} required />
          <input type="number" step="1" placeholder="Quantity" value={notionQuantity} onChange={(e) => setNotionQuantity(e.target.value)} />
          <input type="text" placeholder="Notes" value={notionNotes} onChange={(e) => setNotionNotes(e.target.value)} />
          <button type="submit">Add notion</button>
        </form>
        <ul>
          {notions.map((notion) => (
            <li key={notion.id}>{notion.name} — {notion.quantity} {notion.notes && `(${notion.notes})`}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;