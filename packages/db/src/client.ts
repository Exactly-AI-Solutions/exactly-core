import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Create a database client
 */
export function createDbClient(connectionString: string) {
  const client = postgres(connectionString);
  return drizzle(client, { schema });
}

/**
 * Database client type
 */
export type DbClient = ReturnType<typeof createDbClient>;

// Singleton instance (initialized lazily)
let _db: DbClient | null = null;

/**
 * Get the database client singleton
 * Must call initDb first
 */
export function getDb(): DbClient {
  if (!_db) {
    throw new Error('Database not initialized. Call initDb first.');
  }
  return _db;
}

/**
 * Initialize the database client
 */
export function initDb(connectionString: string): DbClient {
  if (_db) {
    return _db;
  }
  _db = createDbClient(connectionString);
  return _db;
}
