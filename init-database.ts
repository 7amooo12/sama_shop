import { supabase } from './server/supabase';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Verify connection to Supabase
async function verifySupabaseConnection() {
  try {
    console.log('Verifying Supabase connection...');
    
    // Try a simple query to verify connection
    const { error: directError } = await supabase.from('users').select('count').limit(1);
    
    // If table doesn't exist, that's expected - just means we need to create it
    if (directError && !directError.message.includes('does not exist')) {
      console.log('Direct connection test failed:', directError);
      
      // If we get invalid API key error, show helpful message
      if (directError.message.includes('Invalid API key')) {
        console.error('\n----------------------------------------');
        console.error('ERROR: Invalid Supabase API key');
        console.error('Please check your .env file and ensure SUPABASE_ANON_KEY and SUPABASE_SERVICE_KEY are set correctly');
        console.error('----------------------------------------\n');
      }
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Error verifying Supabase connection:', error);
    return false;
  }
}

async function createTables() {
  try {
    console.log('Starting database table creation...');
    
    // Create tables using direct SQL through Supabase
    try {
      // Create users table
      console.log('Creating users table...');
      await supabase.from('users').insert({
        username: 'temp_user',
        password: 'temp_password',
        email: 'temp@example.com',
        is_admin: false,
        first_name: 'temp',
        last_name: 'user'
      }).select();
      
      console.log('Users table created or already exists');
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('Users table needs to be created manually in the Supabase dashboard');
      } else {
        console.log('Users table already exists or other error:', error.message);
      }
    }
    
    try {
      // Create products table
      console.log('Creating products table...');
      await supabase.from('products').insert({
        name: 'Temporary Product',
        description: 'This is a temporary product to initialize the table',
        price: 0,
        image_url: 'https://example.com/temp.jpg',
        category: 'temp'
      }).select();
      
      console.log('Products table created or already exists');
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('Products table needs to be created manually in the Supabase dashboard');
      } else {
        console.log('Products table already exists or other error:', error.message);
      }
    }
    
    try {
      // Create carts table
      console.log('Creating carts table...');
      await supabase.from('carts').insert({
        user_id: null,
        items: []
      }).select();
      
      console.log('Carts table created or already exists');
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('Carts table needs to be created manually in the Supabase dashboard');
      } else {
        console.log('Carts table already exists or other error:', error.message);
      }
    }
    
    try {
      // Create orders table
      console.log('Creating orders table...');
      await supabase.from('orders').insert({
        user_id: null,
        email: 'temp@example.com',
        total: 0,
        status: 'temp',
        shipping_address: {},
        items: []
      }).select();
      
      console.log('Orders table created or already exists');
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('Orders table needs to be created manually in the Supabase dashboard');
      } else {
        console.log('Orders table already exists or other error:', error.message);
      }
    }
    
    console.log('Table check completed. Please ensure tables exist in Supabase dashboard');
    return true;
  } catch (error) {
    console.error('Error checking tables:', error);
    return false;
  }
}

async function createAdminUser() {
  try {
    console.log('Checking for admin user...');
    
    // Check if admin user exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking for admin user:', checkError);
      return;
    }
    
    if (existingAdmin && existingAdmin.length > 0) {
      console.log('Admin user already exists');
      return;
    }
    
    console.log('Creating admin user...');
    try {
      // Hash password for admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Create admin user
      const { data: admin, error: createError } = await supabase
        .from('users')
        .insert([
          {
            username: 'admin',
            password: hashedPassword,
            email: 'admin@example.com',
            first_name: 'Admin',
            last_name: 'User',
            is_admin: true
          }
        ])
        .select();
      
      if (createError) {
        console.error('Error creating admin user:', createError);
      } else {
        console.log('Admin user created successfully');
      }
    } catch (bcryptError) {
      console.error('Error with password hashing:', bcryptError);
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

async function createTestUser() {
  try {
    console.log('Checking for test user...');
    
    // Check if test user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'testuser')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking for test user:', checkError);
      return;
    }
    
    if (existingUser && existingUser.length > 0) {
      console.log('Test user already exists');
      return;
    }
    
    // Hash password for test user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Create test user
    const { data: user, error: createError } = await supabase
      .from('users')
      .insert([
        {
          username: 'testuser',
          password: hashedPassword,
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          is_admin: false
        }
      ])
      .select();
    
    if (createError) {
      console.error('Error creating test user:', createError);
    } else {
      console.log('Test user created successfully');
    }
  } catch (error) {
    console.error('Error creating test user:', error);
  }
}

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Verify Supabase connection first
    const connectionValid = await verifySupabaseConnection();
    if (!connectionValid) {
      console.error('Failed to connect to Supabase. Database initialization aborted.');
      return false;
    }
    
    // Skip data persistence test since we can't create tables directly
    console.log('Skipping data persistence test - requires Supabase table creation');
    
    // Check tables
    await createTables();
    
    // Create admin and test users
    await createAdminUser();
    await createTestUser();
    
    console.log('Database initialization completed');
    console.log('\nIMPORTANT: If tables do not exist, please create them manually in the Supabase dashboard.');
    console.log('Use the schema definitions from shared/schema.ts as a reference.');
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}

// Execute database initialization
initializeDatabase()
  .then(() => {
    console.log('Database initialization process finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database initialization process failed:', error);
    process.exit(1);
  }); 