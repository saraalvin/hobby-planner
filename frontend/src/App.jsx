import { useEffect, useState } from "react";
import { GraphQLClient, gql } from "graphql-request";
import "./App.css";
const client = new GraphQLClient("http://localhost:4000/");
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
function App() {
  const [fabrics, setFabrics] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  useEffect(() => {
    client.request(FABRICS_QUERY).then((data) => setFabrics(data.fabrics));
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await client.request(ADD_FABRIC_MUTATION, {
      name,
      quantity: quantity ? parseFloat(quantity) : null,
    });
    setFabrics([data.addFabric, ...fabrics]);
    setName("");
    setQuantity("");
  };
  return (
    <div>
      {" "}
      <h1>My Fabric Stash</h1>{" "}
      <form onSubmit={handleSubmit}>
        {" "}
        <input
          type="text"
          placeholder="Fabric name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />{" "}
        <input
          type="number"
          step="0.1"
          placeholder="Quantity (m)"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />{" "}
        <button type="submit">Add fabric</button>{" "}
      </form>{" "}
      <ul>
        {" "}
        {fabrics.map((fabric) => (
          <li key={fabric.id}>
            {" "}
            {fabric.name} — {fabric.quantity}m{" "}
          </li>
        ))}{" "}
      </ul>{" "}
    </div>
  );
}
export default App;