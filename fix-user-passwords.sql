-- SQL script to fix the password format for admin and test users
-- Execute this in the Supabase SQL Editor

-- First, verify what users exist in the database
SELECT id, username, email, first_name, last_name, is_admin, 
       SUBSTRING(password, 1, 20) as password_start
FROM users;

-- Option 1: Update to bcrypt format (preferred)
-- Use these if you want to use bcrypt format passwords
UPDATE users
SET password = '$2a$10$RBqfVXTKkHXMYd/XuJYJDuWNmJFXuDoR0TsrYgL1ptcfNwv1.9uGq'
WHERE username = 'admin';

UPDATE users
SET password = '$2a$10$aT5iUPwTnndZp0b4zCGEuu1XpOI3YdYkx7FrWHGGJ3aHR3YpDqhRy'
WHERE username = 'testuser';

-- Option 2: If above does not work, create new admin user
-- Temporarily disable RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Insert a new admin user if none exists
INSERT INTO users (username, password, email, first_name, last_name, is_admin, created_at)
SELECT 'admin_new', '$2a$10$RBqfVXTKkHXMYd/XuJYJDuWNmJFXuDoR0TsrYgL1ptcfNwv1.9uGq', 'admin_new@example.com', 'Admin', 'User', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin_new');

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Verify the changes
SELECT id, username, email, first_name, last_name, is_admin, 
       SUBSTRING(password, 1, 20) as password_start
FROM users; 