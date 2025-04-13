-- SQL script to create all necessary tables in Supabase
-- Execute this in the Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  sale_price DOUBLE PRECISION,
  image_url TEXT NOT NULL,
  light_image_url TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  features JSONB,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  rating DOUBLE PRECISION DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  email TEXT NOT NULL,
  total DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Carts table
CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users table policies
CREATE POLICY "Users can read their own data" 
  ON users FOR SELECT 
  USING (id::text = auth.uid()::text);

CREATE POLICY "Users can update their own data" 
  ON users FOR UPDATE 
  USING (id::text = auth.uid()::text);

-- Products table policies
CREATE POLICY "Anyone can read products" 
  ON products FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can modify products" 
  ON products FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND is_admin = true
    )
  );

-- Carts table policies
CREATE POLICY "Users can manage their own cart" 
  ON carts FOR ALL
  USING (user_id::text = auth.uid()::text);

-- Orders table policies
CREATE POLICY "Users can read their own orders" 
  ON orders FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can create their own orders" 
  ON orders FOR INSERT
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Only admins can modify orders" 
  ON orders FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND is_admin = true
    )
  );

-- Sessions table policies
CREATE POLICY "Anyone can access sessions"
  ON sessions FOR ALL
  USING (true);

-- Insert an admin user for testing (password: admin123)
INSERT INTO users (username, password, email, first_name, last_name, is_admin)
VALUES (
  'admin', 
  'c506dc0b9fca274452f7e920cdf08fb62a652be590cefb9512dced468cff823d3dffd6881a34b238bf38c8616f8f8d6568564e0ea1ed5d2231c59b8c13d1bc66.4d55872cb88fbaddd45bc62766be3bea', 
  'admin@example.com', 
  'Admin', 
  'User', 
  true
) ON CONFLICT (username) DO NOTHING;

-- Insert a test user for testing (password: password123)
INSERT INTO users (username, password, email, first_name, last_name, is_admin)
VALUES (
  'testuser', 
  '88541a985576a36d72cec81d73b42e71bd17f0c1e23ff1f5fccf30a83df8f07a2e8bbac958f45708a1ea24716580eada2f804aafd6df0eeb9be5893c03d29b6f.56f10b3d3b626ae8fe4eb1a24e4dce1e', 
  'test@example.com', 
  'Test', 
  'User', 
  false
) ON CONFLICT (username) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, sale_price, image_url, light_image_url, category, tags, features, is_featured, in_stock, rating, rating_count)
VALUES
  (
    'Crystal Nova Pendant',
    'Modern geometric design with premium crystal elements and smart RGB lighting system.',
    1599,
    1299,
    'https://images.unsplash.com/photo-1592833167001-55c6233fc83e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1592833167001-55c6233fc83e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    'Pendants',
    ARRAY['modern', 'crystal', 'smart'],
    '{"material": "Crystal", "dimensions": "60cm x 60cm", "bulbType": "LED", "smartFeatures": true}',
    true,
    true,
    4.5,
    42
  ),
  (
    'Geometric Hexa Light',
    'Hexagonal pendant with warm ambient lighting, perfect for dining rooms and modern interiors.',
    849,
    NULL,
    'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    NULL,
    'Pendants',
    ARRAY['modern', 'geometric'],
    '{"material": "Aluminum", "dimensions": "45cm diameter", "bulbType": "LED", "smartFeatures": false}',
    false,
    true,
    4.0,
    36
  ),
  (
    'Celestial Smart Ceiling',
    'Wi-Fi enabled smart lighting with customizable patterns, voice control and app integration.',
    2299,
    1999,
    'https://images.unsplash.com/photo-1536528906775-c0c07c0ac0f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    NULL,
    'Smart Lighting',
    ARRAY['smart', 'ceiling', 'modern'],
    '{"material": "Aluminum and Acrylic", "dimensions": "120cm x 80cm", "bulbType": "LED RGB", "smartFeatures": true}',
    true,
    true,
    5.0,
    59
  )
ON CONFLICT DO NOTHING; 