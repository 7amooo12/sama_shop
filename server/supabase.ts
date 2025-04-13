import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { log } from './vite';

// Load environment variables from .env file
dotenv.config();

// Check required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Environment variables SUPABASE_URL and SUPABASE_ANON_KEY are required');
}

// Log configuration status (redacting sensitive parts of keys)
log(`Supabase URL: ${process.env.SUPABASE_URL}`);
log(`Supabase Anon Key: ${process.env.SUPABASE_ANON_KEY.substring(0, 12)}...`);
if (process.env.SUPABASE_SERVICE_KEY) {
  log(`Supabase Service Key: ${process.env.SUPABASE_SERVICE_KEY.substring(0, 12)}...`);
} else {
  log('Warning: SUPABASE_SERVICE_KEY not found, using SUPABASE_ANON_KEY for admin operations');
}

// Create a Supabase client
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false
    }
  }
);

// Create a Supabase admin client with service key
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false
    }
  }
);