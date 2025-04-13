import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';
import { log } from './vite';

// Load environment variables
dotenv.config();

// Ensure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create a postgres client for migrations
const migrationClient = postgres(process.env.DATABASE_URL, { max: 1 });

// Create a postgres client for queries
const queryClient = postgres(process.env.DATABASE_URL);

// Create a drizzle database instance
export const db = drizzle(queryClient);

// Function to run database migrations
export async function runMigrations() {
  try {
    log('Starting database migrations...');
    await migrate(drizzle(migrationClient), { migrationsFolder: './migrations' });
    log('Database migrations completed successfully');
  } catch (error) {
    log(`Error running migrations: ${error}`);
    throw error;
  } finally {
    // Close the migration client
    await migrationClient.end();
  }
}

// Gracefully close the database connection
export async function closeDatabase() {
  try {
    log('Closing database connections...');
    await queryClient.end();
    log('Database connections closed');
  } catch (error) {
    log(`Error closing database: ${error}`);
  }
}