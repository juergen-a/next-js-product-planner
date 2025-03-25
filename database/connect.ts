import 'server-only';
import { config } from 'dotenv-safe';
import postgres, { type Sql } from 'postgres';

// Function calls .env file and injects the stored variables into the running app process - always on top of file
config();

// Define type for globalThis
declare namespace globalThis {
  let postgreSqlClient: Sql;
}

// Function postgres from 'postgres' retrieves values from .env-variables through app process, connects to DB and can now receive SQL-queries, that will be wrapped in this function
// Export will make querying possible from every server component within the app
// Transform object will be created converting all datatable names from snake to camel case in order to process in JS
// Checks whether a connection in postgresClient already exists in app process, if not establishes connection, else exit global environment
function connectOneTimeToDatabase() {
  if (!('postgresSqlClient' in globalThis)) {
    globalThis.postgreSqlClient = postgres({
      transform: {
        ...postgres.camel,
        undefined: null,
      },
    });
  }
  return globalThis.postgreSqlClient;
}

// Connect one time to database avoid reconnecting on every render triggered by UI
export const sql = connectOneTimeToDatabase();
