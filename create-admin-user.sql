-- SQL script to create admin user directly
-- Execute this in the Supabase SQL Editor

-- First, check and disable RLS temporarily if needed
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Insert the admin user with pre-hashed password
INSERT INTO users (username, password, email, first_name, last_name, is_admin, created_at)
VALUES (
  'admin', 
  'c506dc0b9fca274452f7e920cdf08fb62a652be590cefb9512dced468cff823d3dffd6881a34b238bf38c8616f8f8d6568564e0ea1ed5d2231c59b8c13d1bc66.4d55872cb88fbaddd45bc62766be3bea', 
  'admin@example.com', 
  'Admin', 
  'User', 
  true,
  NOW()
) ON CONFLICT (username) DO NOTHING;

-- Insert a test user
INSERT INTO users (username, password, email, first_name, last_name, is_admin, created_at)
VALUES (
  'testuser', 
  '88541a985576a36d72cec81d73b42e71bd17f0c1e23ff1f5fccf30a83df8f07a2e8bbac958f45708a1ea24716580eada2f804aafd6df0eeb9be5893c03d29b6f.56f10b3d3b626ae8fe4eb1a24e4dce1e', 
  'test@example.com', 
  'Test', 
  'User', 
  false,
  NOW()
) ON CONFLICT (username) DO NOTHING;

-- Re-enable RLS after user creation
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Verify users were created
SELECT id, username, email, is_admin FROM users; 