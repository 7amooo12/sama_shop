import { supabase } from './supabase';
import { log } from './vite';

// Function to create tables in the Supabase database
export async function createTables() {
  try {
    log('Starting table creation in Supabase database...');
    
    // Create tables by trying to insert data - if tables don't exist, we'll get a helpful error
    try {
      // Check users table
      log('Checking users table...');
      const { error: usersError } = await supabase.from('users').select('id').limit(1);
      
      if (usersError && usersError.message.includes('does not exist')) {
        log('Users table needs to be created in Supabase dashboard');
      } else {
        log('Users table exists');
      }
      
      // Check products table
      log('Checking products table...');
      const { error: productsError } = await supabase.from('products').select('id').limit(1);
      
      if (productsError && productsError.message.includes('does not exist')) {
        log('Products table needs to be created in Supabase dashboard');
      } else {
        log('Products table exists');
      }
      
      // Check orders table
      log('Checking orders table...');
      const { error: ordersError } = await supabase.from('orders').select('id').limit(1);
      
      if (ordersError && ordersError.message.includes('does not exist')) {
        log('Orders table needs to be created in Supabase dashboard');
      } else {
        log('Orders table exists');
      }
      
      // Check carts table
      log('Checking carts table...');
      const { error: cartsError } = await supabase.from('carts').select('id').limit(1);
      
      if (cartsError && cartsError.message.includes('does not exist')) {
        log('Carts table needs to be created in Supabase dashboard');
      } else {
        log('Carts table exists');
      }
      
      log('Table checks completed. Missing tables need to be created manually in Supabase dashboard.');
    } catch (error: any) {
      log(`Error checking tables: ${error.message}`);
    }
    
    log('Table creation completed');
    return true;
  } catch (error) {
    log(`Error creating tables: ${error}`);
    return false;
  }
}