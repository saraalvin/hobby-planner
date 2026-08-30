import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import pkg from 'pg';
import 'dotenv/config';

const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function makeCrud(table, columns) {
  return {
    list: async () => {
      const result = await pool.query(`SELECT * FROM ${table} ORDER BY created_at DESC`);
      return result.rows;
    },
    create: async (fields) => {
      const cols = columns.filter((c) => fields[c] !== undefined);
      const values = cols.map((c) => fields[c]);
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
      const result = await pool.query(
        `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return result.rows[0];
    },
  };
}

const fabricCrud = makeCrud('fabrics', ['name', 'quantity', 'notes']);
const notionCrud = makeCrud('notions', ['name', 'quantity', 'notes']);
const patternCrud = makeCrud('patterns', ['name', 'notes']);
const toolCrud = makeCrud('tools', ['name', 'notes']);
const measurementCrud = makeCrud('measurements', ['person_name', 'bust', 'waist', 'hip', 'notes']);

const typeDefs = `#graphql
  type Fabric { id: ID! name: String! quantity: Float notes: String }
  type Notion { id: ID! name: String! quantity: Float notes: String }
  type Pattern { id: ID! name: String! notes: String }
  type Tool { id: ID! name: String! notes: String }
  type Measurement {
    id: ID!
    person_name: String!
    bust: Float
    waist: Float
    hip: Float
    notes: String
  }

  type Query {
    fabrics: [Fabric!]!
    notions: [Notion!]!
    patterns: [Pattern!]!
    tools: [Tool!]!
    measurements: [Measurement!]!
  }

  type Mutation {
    addFabric(name: String!, quantity: Float, notes: String): Fabric!
    addNotion(name: String!, quantity: Float, notes: String): Notion!
    addPattern(name: String!, notes: String): Pattern!
    addTool(name: String!, notes: String): Tool!
    addMeasurement(person_name: String!, bust: Float, waist: Float, hip: Float, notes: String): Measurement!
  }
`;

const resolvers = {
  Query: {
    fabrics: fabricCrud.list,
    notions: notionCrud.list,
    patterns: patternCrud.list,
    tools: toolCrud.list,
    measurements: measurementCrud.list,
  },
  Mutation: {
    addFabric: (_, args) => fabricCrud.create(args),
    addNotion: (_, args) => notionCrud.create(args),
    addPattern: (_, args) => patternCrud.create(args),
    addTool: (_, args) => toolCrud.create(args),
    addMeasurement: (_, args) => measurementCrud.create(args),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });
console.log(`Server ready at ${url}`);