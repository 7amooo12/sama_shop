-- SQL script to create admin views and additional tables
-- Execute this in the Supabase SQL Editor after running the main setup script

-- Create a view for admins to see user statistics
CREATE OR REPLACE VIEW admin_user_stats AS
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_users_last_30_days,
  COUNT(CASE WHEN is_admin = true THEN 1 END) as total_admins
FROM users;

-- Create a view for product performance metrics
CREATE OR REPLACE VIEW admin_product_stats AS
SELECT 
  p.id,
  p.name,
  p.category,
  p.price,
  p.sale_price,
  p.rating,
  p.rating_count,
  COUNT(DISTINCT o.id) as times_ordered,
  COALESCE(SUM(oi.quantity), 0) as units_sold
FROM 
  products p
LEFT JOIN 
  (SELECT o.id, items FROM orders o, jsonb_array_elements(o.items) as items) o
  ON (o.items->>'productId')::int = p.id
LEFT JOIN
  LATERAL jsonb_to_record(o.items) AS oi(productId int, quantity int)
  ON true
GROUP BY 
  p.id, p.name, p.category, p.price, p.sale_price, p.rating, p.rating_count
ORDER BY 
  units_sold DESC;

-- Create a view for order summary
CREATE OR REPLACE VIEW admin_order_summary AS
SELECT 
  DATE_TRUNC('day', created_at) as order_date,
  COUNT(*) as order_count,
  SUM(total) as total_revenue,
  AVG(total) as average_order_value,
  COUNT(DISTINCT user_id) as unique_customers
FROM 
  orders
GROUP BY 
  DATE_TRUNC('day', created_at)
ORDER BY 
  order_date DESC;

-- Create a categories table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create a product_reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create a wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  products INTEGER[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create a promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_percentage INTEGER NOT NULL,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  min_purchase_amount DOUBLE PRECISION DEFAULT 0,
  max_discount_amount DOUBLE PRECISION,
  usage_limit INTEGER,
  current_usage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create order_history table for tracking status changes
CREATE TABLE IF NOT EXISTS order_history (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;

-- Categories RLS policies
CREATE POLICY "Anyone can read categories" 
  ON categories FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can modify categories" 
  ON categories FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND is_admin = true
    )
  );

-- Product reviews RLS policies
CREATE POLICY "Anyone can read product reviews" 
  ON product_reviews FOR SELECT 
  USING (true);

CREATE POLICY "Users can create their own reviews" 
  ON product_reviews FOR INSERT 
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update their own reviews" 
  ON product_reviews FOR UPDATE 
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete their own reviews" 
  ON product_reviews FOR DELETE 
  USING (user_id::text = auth.uid()::text);

-- Wishlists RLS policies
CREATE POLICY "Users can manage their own wishlists" 
  ON wishlists FOR ALL
  USING (user_id::text = auth.uid()::text);

-- Promotions RLS policies
CREATE POLICY "Anyone can read active promotions" 
  ON promotions FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Only admins can manage promotions" 
  ON promotions FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND is_admin = true
    )
  );

-- Order history RLS policies
CREATE POLICY "Users can read their own order history" 
  ON order_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_history.order_id
      AND orders.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Only admins can create order history" 
  ON order_history FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND is_admin = true
    )
  );

-- Insert sample categories
INSERT INTO categories (name, description, image_url)
VALUES
  ('Pendants', 'Hanging lights for modern spaces', 'https://images.unsplash.com/photo-1592833167001-55c6233fc83e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'),
  ('Chandeliers', 'Luxury lighting fixtures for grand spaces', 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'),
  ('Smart Lighting', 'Connected lighting solutions with app control', 'https://images.unsplash.com/photo-1536528906775-c0c07c0ac0f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'),
  ('Wall Sconces', 'Elegant wall-mounted lighting options', 'https://images.unsplash.com/photo-1507151218956-16a0191806f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'),
  ('Table Lamps', 'Decorative lighting for tables and desks', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')
ON CONFLICT (name) DO NOTHING;

-- Insert sample promotions
INSERT INTO promotions (code, description, discount_percentage, valid_from, valid_until, min_purchase_amount, max_discount_amount, usage_limit)
VALUES
  ('WELCOME20', 'Welcome discount for new customers', 20, NOW(), NOW() + INTERVAL '60 days', 500, 500, 1000),
  ('SUMMER2023', 'Summer sale promotion', 15, NOW(), NOW() + INTERVAL '90 days', 0, 300, 500),
  ('FREESHIP', 'Free shipping on orders over $999', 100, NOW(), NOW() + INTERVAL '30 days', 999, 49.99, 200)
ON CONFLICT (code) DO NOTHING;

-- Create functions for admin dashboard
CREATE OR REPLACE FUNCTION get_sales_summary(start_date TIMESTAMP, end_date TIMESTAMP)
RETURNS TABLE(
  date_range TEXT,
  total_orders BIGINT, 
  total_revenue DOUBLE PRECISION,
  avg_order_value DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    start_date::TEXT || ' to ' || end_date::TEXT as date_range,
    COUNT(*) as total_orders,
    SUM(total) as total_revenue,
    AVG(total) as avg_order_value
  FROM 
    orders
  WHERE 
    created_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get top selling products
CREATE OR REPLACE FUNCTION get_top_products(limit_count INTEGER)
RETURNS TABLE(
  product_id INTEGER,
  product_name TEXT,
  category TEXT,
  units_sold BIGINT,
  revenue DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.name as product_name,
    p.category,
    COALESCE(SUM(oi.quantity), 0)::BIGINT as units_sold,
    COALESCE(SUM(oi.quantity * COALESCE(p.sale_price, p.price)), 0) as revenue
  FROM 
    products p
  LEFT JOIN 
    (SELECT o.id, items FROM orders o, jsonb_array_elements(o.items) as items) o
    ON (o.items->>'productId')::int = p.id
  LEFT JOIN
    LATERAL jsonb_to_record(o.items) AS oi(productId int, quantity int)
    ON true
  GROUP BY 
    p.id, p.name, p.category
  ORDER BY 
    units_sold DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql; 