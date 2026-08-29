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
function App() {
  const [fabrics, setFabrics] = useState([]);
  useEffect(() => {
    client.request(FABRICS_QUERY).then((data) => setFabrics(data.fabrics));
  }, []);
  return (
    <div>
      {" "}
      <h1>My Fabric Stash</h1>{" "}
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
