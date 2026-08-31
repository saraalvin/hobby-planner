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

const fabricCrud = makeCrud('fabrics', ['name', 'quantity', 'notes', 'photo_url']);
const notionCrud = makeCrud('notions', ['name', 'quantity', 'notes', 'photo_url']);
const patternCrud = makeCrud('patterns', ['name', 'notes', 'photo_url', 'file_url']);
const toolCrud = makeCrud('tools', ['name', 'notes']);
const personCrud = makeCrud('people', ['name', 'notes']);
const historyCrud = makeCrud('measurement_history', ['person_id', 'bust', 'waist', 'hip', 'notes']);

const typeDefs = `#graphql
  type Fabric { id: ID! name: String! quantity: Float notes: String photo_url: String }
  type Notion { id: ID! name: String! quantity: Float notes: String photo_url: String }
  type Pattern { id: ID! name: String! notes: String photo_url: String file_url: String }
  type Tool { id: ID! name: String! notes: String }

  type MeasurementRecord {
    id: ID!
    person_id: ID!
    date_taken: String
    bust: Float
    waist: Float
    hip: Float
    notes: String
  }

  type Person {
    id: ID!
    name: String!
    notes: String
    history: [MeasurementRecord!]!
  }

  type Query {
    fabrics: [Fabric!]!
    notions: [Notion!]!
    patterns: [Pattern!]!
    tools: [Tool!]!
    people: [Person!]!
  }

  type Mutation {
    addFabric(name: String!, quantity: Float, notes: String, photo_url: String): Fabric!
    addNotion(name: String!, quantity: Float, notes: String, photo_url: String): Notion!
    addPattern(name: String!, notes: String, photo_url: String, file_url: String): Pattern!
    addTool(name: String!, notes: String): Tool!
    addPerson(name: String!, notes: String): Person!
    addMeasurementRecord(person_id: ID!, bust: Float, waist: Float, hip: Float, notes: String): MeasurementRecord!
  }
`;

const resolvers = {
  Query: {
    fabrics: fabricCrud.list,
    notions: notionCrud.list,
    patterns: patternCrud.list,
    tools: toolCrud.list,
    people: personCrud.list,
  },
  Mutation: {
    addFabric: (_, args) => fabricCrud.create(args),
    addNotion: (_, args) => notionCrud.create(args),
    addPattern: (_, args) => patternCrud.create(args),
    addTool: (_, args) => toolCrud.create(args),
    addPerson: (_, args) => personCrud.create(args),
    addMeasurementRecord: (_, args) => historyCrud.create(args),
  },
  Person: {
    history: async (parent) => {
      const result = await pool.query(
        'SELECT * FROM measurement_history WHERE person_id = $1 ORDER BY date_taken DESC',
        [parent.id]
      );
      return result.rows;
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });
console.log(`Server ready at ${url}`);