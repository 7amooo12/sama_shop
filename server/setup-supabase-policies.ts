import { supabaseAdmin } from './supabase';
import { log } from './vite';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

async function setupRlsPolicies() {
  try {
    log('Setting up Supabase RLS policies...');
    
    // Check if we can use RPC functions
    const { error: rpcError } = await supabaseAdmin.rpc('get_now', {});
    
    // If the RPC function is not available, we need to use the Supabase dashboard
    if (rpcError && rpcError.message.includes('function') && rpcError.message.includes('not found')) {
      log('RPC functions are not available in this Supabase project.');
      log('IMPORTANT: You need to manually set up RLS policies in the Supabase dashboard:');
      log('1. Enable RLS on all tables (users, products, orders, carts)');
      log('2. Create a policy for users to access their own data');
      log('3. Create a policy for public read access to products');
      log('4. Create policies for users to manage their own carts and orders');
      log('5. Create admin-only policies for managing all resources');
      return false;
    }

    // If RPC exec_sql is not available, we need to use the Supabase dashboard
    log('RPC functions may be available but exec_sql is not supported on this Supabase plan.');
    log('IMPORTANT: You need to manually set up RLS policies in the Supabase dashboard');
    
    return true;
  } catch (error) {
    log(`Error setting up Supabase RLS policies: ${error}`);
    return false;
  }
}

export { setupRlsPolicies };

// Check if this file is being run directly (ES module version)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  setupRlsPolicies()
    .then(() => {
      log('Supabase setup completed');
      process.exit(0);
    })
    .catch((error) => {
      log(`Supabase setup failed: ${error}`);
      process.exit(1);
    });
} 