import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import pkg from 'pg';
import 'dotenv/config';

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const typeDefs = `#graphql
  type Fabric {
    id: ID!
    name: String!
    quantity: Float
  }

  type Notion {
    id: ID!
    name: String!
    quantity: Float
    notes: String
  }

  type Query {
    fabrics: [Fabric!]!
    notions: [Notion!]!
  }

  type Mutation {
    addFabric(name: String!, quantity: Float): Fabric!
    addNotion(name: String!, quantity: Float, notes: String): Notion!
  }
`;

const resolvers = {
  Query: {
    fabrics: async () => {
      const result = await pool.query('SELECT * FROM fabrics ORDER BY created_at DESC');
      return result.rows;
    },
    notions: async () => {
      const result = await pool.query('SELECT * FROM notions ORDER BY created_at DESC');
      return result.rows;
    },
  },
  Mutation: {
    addFabric: async (_, { name, quantity }) => {
      const result = await pool.query(
        'INSERT INTO fabrics (name, quantity) VALUES ($1, $2) RETURNING *',
        [name, quantity]
      );
      return result.rows[0];
    },
    addNotion: async (_, { name, quantity, notes }) => {
      const result = await pool.query(
        'INSERT INTO notions (name, quantity, notes) VALUES ($1, $2, $3) RETURNING *',
        [name, quantity, notes]
      );
      return result.rows[0];
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });
console.log(`Server ready at ${url}`);