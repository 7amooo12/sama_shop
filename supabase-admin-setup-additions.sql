-- Additional SQL script with more tables and functionality
-- Execute this after the main setup and admin setup scripts

-- Create inventory table for stock management
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  sku TEXT UNIQUE,
  location TEXT,
  last_restock_date TIMESTAMP WITH TIME ZONE,
  restock_threshold INTEGER DEFAULT 5,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create product variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_adjustment DOUBLE PRECISION DEFAULT 0,
  attributes JSONB NOT NULL,
  image_url TEXT,
  sku TEXT UNIQUE,
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create a product_tags table for better tag management
CREATE TABLE IF NOT EXISTS product_tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create product_tags_map junction table
CREATE TABLE IF NOT EXISTS product_tags_map (
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES product_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

-- Create customer_addresses table for saved addresses
CREATE TABLE IF NOT EXISTS customer_addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  address_type TEXT, -- 'shipping', 'billing', 'both'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  source TEXT -- where they subscribed from
);

-- Create abandoned_carts view for marketing
CREATE OR REPLACE VIEW abandoned_carts AS
SELECT 
  c.id as cart_id,
  c.user_id,
  u.email,
  c.created_at,
  c.updated_at,
  EXTRACT(EPOCH FROM (NOW() - c.updated_at))/3600 as hours_abandoned,
  COUNT(items) as item_count,
  SUM((items->>'quantity')::int * 
      COALESCE(
        (SELECT sale_price FROM products WHERE id = (items->>'productId')::int AND sale_price IS NOT NULL),
        (SELECT price FROM products WHERE id = (items->>'productId')::int)
      )) as cart_value
FROM 
  carts c
JOIN 
  users u ON c.user_id = u.id,
  jsonb_array_elements(c.items) as items
WHERE 
  jsonb_array_length(c.items) > 0
  AND NOT EXISTS (
    SELECT 1 FROM orders o
    WHERE o.user_id = c.user_id
    AND o.created_at > c.updated_at
  )
GROUP BY 
  c.id, c.user_id, u.email, c.created_at, c.updated_at
HAVING 
  EXTRACT(EPOCH FROM (NOW() - c.updated_at))/3600 > 1 -- abandoned for more than 1 hour
ORDER BY 
  c.updated_at DESC;

-- Create product_views table for tracking user browsing behavior
CREATE TABLE IF NOT EXISTS product_views (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  view_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  view_duration INTEGER, -- in seconds
  source TEXT, -- where they came from
  device_type TEXT -- mobile, desktop, etc.
);

-- Create related_products table to define relationships
CREATE TABLE IF NOT EXISTS related_products (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  related_product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL, -- 'similar', 'complementary', 'frequently_bought_together', etc.
  UNIQUE(product_id, related_product_id, relationship_type)
);

-- Enable RLS on new tables
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_tags_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE related_products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Inventory policies
CREATE POLICY "Anyone can read inventory" 
  ON inventory FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can modify inventory" 
  ON inventory FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND is_admin = true
    )
  );

-- Product variants policies
CREATE POLICY "Anyone can read product variants" 
  ON product_variants FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can modify product variants" 
  ON product_variants FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND is_admin = true
    )
  );

-- Product tags policies
CREATE POLICY "Anyone can read product tags" 
  ON product_tags FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can modify product tags" 
  ON product_tags FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND is_admin = true
    )
  );

-- Product tags map policies
CREATE POLICY "Anyone can read product tags map" 
  ON product_tags_map FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can modify product tags map" 
  ON product_tags_map FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND is_admin = true
    )
  );

-- Customer addresses policies
CREATE POLICY "Users can manage their own addresses" 
  ON customer_addresses FOR ALL
  USING (user_id::text = auth.uid()::text);

-- Newsletter subscribers policies
CREATE POLICY "Admins can read newsletter subscribers" 
  ON newsletter_subscribers FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND is_admin = true
    )
  );

CREATE POLICY "Anyone can subscribe to newsletter" 
  ON newsletter_subscribers FOR INSERT 
  WITH CHECK (true);

-- Product views policies
CREATE POLICY "Users can see their own product views" 
  ON product_views FOR SELECT 
  USING (user_id::text = auth.uid()::text OR user_id IS NULL);

CREATE POLICY "Anyone can insert product views" 
  ON product_views FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins can see all product views" 
  ON product_views FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND is_admin = true
    )
  );

-- Related products policies
CREATE POLICY "Anyone can read related products" 
  ON related_products FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can modify related products" 
  ON related_products FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND is_admin = true
    )
  );

-- Create inventory level trigger to update product.in_stock
CREATE OR REPLACE FUNCTION update_product_stock_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity <= 0 THEN
    UPDATE products SET in_stock = false WHERE id = NEW.product_id;
  ELSE
    UPDATE products SET in_stock = true WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_stock_trigger
AFTER INSERT OR UPDATE ON inventory
FOR EACH ROW
EXECUTE FUNCTION update_product_stock_status();

-- Create a function to recommend products based on user history
CREATE OR REPLACE FUNCTION get_recommended_products(user_id_input INTEGER, limit_count INTEGER)
RETURNS TABLE(
  product_id INTEGER,
  product_name TEXT,
  category TEXT,
  price DOUBLE PRECISION,
  image_url TEXT,
  recommendation_reason TEXT
) AS $$
BEGIN
  RETURN QUERY
  -- First get products from the same categories the user has viewed
  SELECT DISTINCT
    p.id as product_id,
    p.name as product_name,
    p.category,
    COALESCE(p.sale_price, p.price) as price,
    p.image_url,
    'Based on your browsing history' as recommendation_reason
  FROM 
    products p
  WHERE 
    p.category IN (
      SELECT DISTINCT p2.category 
      FROM product_views pv
      JOIN products p2 ON pv.product_id = p2.id
      WHERE pv.user_id = user_id_input
    )
    AND p.id NOT IN (
      SELECT pv.product_id 
      FROM product_views pv 
      WHERE pv.user_id = user_id_input
    )
    AND p.in_stock = true
  
  UNION
  
  -- Then get products that are frequently bought with products the user has viewed
  SELECT DISTINCT
    p.id as product_id,
    p.name as product_name,
    p.category,
    COALESCE(p.sale_price, p.price) as price,
    p.image_url,
    'Frequently bought together' as recommendation_reason
  FROM 
    products p
  JOIN related_products rp ON p.id = rp.related_product_id
  WHERE 
    rp.product_id IN (
      SELECT pv.product_id 
      FROM product_views pv 
      WHERE pv.user_id = user_id_input
    )
    AND rp.relationship_type = 'frequently_bought_together'
    AND p.in_stock = true
  
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for product tags
INSERT INTO product_tags (name)
VALUES
  ('modern'),
  ('crystal'),
  ('smart'),
  ('geometric'),
  ('ceiling'),
  ('luxury'),
  ('gold'),
  ('industrial'),
  ('vintage'),
  ('cluster'),
  ('LED'),
  ('voice-controlled')
ON CONFLICT (name) DO NOTHING;

-- Create stored procedure for order processing
CREATE OR REPLACE PROCEDURE process_order(order_id_input INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  v_order_items JSONB;
  v_item JSONB;
  v_product_id INTEGER;
  v_quantity INTEGER;
  v_inventory_count INTEGER;
BEGIN
  -- Get order items
  SELECT items INTO v_order_items FROM orders WHERE id = order_id_input;
  
  -- Update inventory for each item
  FOR v_item IN SELECT * FROM jsonb_array_elements(v_order_items)
  LOOP
    v_product_id := (v_item->>'productId')::INTEGER;
    v_quantity := (v_item->>'quantity')::INTEGER;
    
    -- Check if inventory exists for this product
    SELECT quantity INTO v_inventory_count FROM inventory WHERE product_id = v_product_id;
    
    IF v_inventory_count IS NULL THEN
      -- Create inventory record if it doesn't exist
      INSERT INTO inventory (product_id, quantity) VALUES (v_product_id, 0);
      v_inventory_count := 0;
    END IF;
    
    -- Update inventory (deduct the ordered quantity)
    UPDATE inventory 
    SET 
      quantity = GREATEST(0, quantity - v_quantity),
      updated_at = NOW()
    WHERE product_id = v_product_id;
    
    -- Add to order history
    INSERT INTO order_history (order_id, status, notes)
    VALUES (order_id_input, 'processing', 'Order processed and inventory updated');
  END LOOP;
  
  -- Update order status
  UPDATE orders SET status = 'processing' WHERE id = order_id_input;
END;
$$; 