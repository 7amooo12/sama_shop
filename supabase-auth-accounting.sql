-- SQL script for Authentication, Accounting, and Payment features
-- Execute this after the other setup scripts

-- Create auth_audit table to track login/logout events
CREATE TABLE IF NOT EXISTS auth_audit (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'login', 'logout', 'failed_login', 'password_reset', 'registration'
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create refresh_tokens table for better token management
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user_verifications table for email verification
CREATE TABLE IF NOT EXISTS user_verifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  verification_token TEXT NOT NULL UNIQUE,
  verification_type TEXT NOT NULL, -- 'email', 'password_reset'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add is_verified column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE;

-- Create accounting tables

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'stripe', 'paypal', etc.
  payment_token TEXT, -- encrypted token from payment provider
  card_type TEXT, -- 'visa', 'mastercard', etc.
  last_four TEXT, -- last 4 digits of card
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  billing_address_id INTEGER REFERENCES customer_addresses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  amount DOUBLE PRECISION NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
  payment_method_id INTEGER REFERENCES payment_methods(id) ON DELETE SET NULL,
  provider TEXT NOT NULL, -- 'stripe', 'paypal', etc.
  provider_transaction_id TEXT, -- ID from payment provider
  transaction_type TEXT NOT NULL, -- 'payment', 'refund', 'chargeback'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  transaction_id INTEGER REFERENCES transactions(id) ON DELETE SET NULL,
  subtotal DOUBLE PRECISION NOT NULL,
  tax DOUBLE PRECISION NOT NULL DEFAULT 0,
  shipping DOUBLE PRECISION NOT NULL DEFAULT 0,
  discount DOUBLE PRECISION NOT NULL DEFAULT 0,
  total DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL, -- 'draft', 'issued', 'paid', 'void'
  due_date TIMESTAMP WITH TIME ZONE,
  issued_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  paid_date TIMESTAMP WITH TIME ZONE,
  billing_address JSONB,
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create accounting_entries table for double-entry accounting
CREATE TABLE IF NOT EXISTS accounting_entries (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL, -- 'debit', 'credit'
  account TEXT NOT NULL, -- 'revenue', 'inventory', 'accounts_receivable', etc.
  amount DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create tax_rates table
CREATE TABLE IF NOT EXISTS tax_rates (
  id SERIAL PRIMARY KEY,
  country TEXT NOT NULL,
  state TEXT,
  zip_code TEXT,
  rate DOUBLE PRECISION NOT NULL,
  tax_name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE auth_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Auth audit policies
CREATE POLICY "Admins can read auth audit logs" 
  ON auth_audit FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND is_admin = true
    )
  );

CREATE POLICY "System can insert auth audit logs" 
  ON auth_audit FOR INSERT
  WITH CHECK (true);

-- Refresh tokens policies
CREATE POLICY "Users can manage their own refresh tokens" 
  ON refresh_tokens FOR ALL
  USING (user_id::text = auth.uid()::text);

-- User verifications policies
CREATE POLICY "Users can manage their own verifications" 
  ON user_verifications FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "System can manage all verifications" 
  ON user_verifications FOR ALL
  USING (true);

-- Payment methods policies
CREATE POLICY "Users can manage their own payment methods" 
  ON payment_methods FOR ALL
  USING (user_id::text = auth.uid()::text);

-- Transactions policies
CREATE POLICY "Users can see their own transactions" 
  ON transactions FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "System can insert transactions" 
  ON transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage all transactions" 
  ON transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND is_admin = true
    )
  );

-- Invoices policies
CREATE POLICY "Users can see their own invoices" 
  ON invoices FOR SELECT
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Admins can manage all invoices" 
  ON invoices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND is_admin = true
    )
  );

-- Accounting entries policies
CREATE POLICY "Admins can see accounting entries" 
  ON accounting_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND is_admin = true
    )
  );

CREATE POLICY "System can insert accounting entries" 
  ON accounting_entries FOR INSERT
  WITH CHECK (true);

-- Tax rates policies
CREATE POLICY "Anyone can read tax rates" 
  ON tax_rates FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage tax rates" 
  ON tax_rates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND is_admin = true
    )
  );

-- Create functions and triggers for authentication

-- Authentication logging function
CREATE OR REPLACE FUNCTION log_auth_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO auth_audit (user_id, event_type, ip_address, user_agent)
  VALUES (NEW.id, TG_ARGV[0], current_setting('request.headers', true)::json->'X-Forwarded-For', current_setting('request.headers', true)::json->'User-Agent');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for authentication events
CREATE TRIGGER user_login_trigger
AFTER UPDATE OF last_login ON users
FOR EACH ROW
WHEN (OLD.last_login IS DISTINCT FROM NEW.last_login)
EXECUTE FUNCTION log_auth_event('login');

-- Functions for user management

-- Create function to register a new user with verification
CREATE OR REPLACE FUNCTION register_user(
  username_input TEXT,
  email_input TEXT,
  password_input TEXT,
  first_name_input TEXT DEFAULT NULL,
  last_name_input TEXT DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  new_user_id INTEGER;
  verification_token TEXT;
BEGIN
  -- Insert the new user
  INSERT INTO users (
    username, 
    email, 
    password, 
    first_name, 
    last_name, 
    is_admin, 
    is_verified
  )
  VALUES (
    username_input,
    email_input,
    password_input, -- Note: In production, this should be hashed
    first_name_input,
    last_name_input,
    FALSE,
    FALSE
  )
  RETURNING id INTO new_user_id;
  
  -- Generate a verification token
  verification_token := encode(gen_random_bytes(20), 'hex');
  
  -- Insert the verification record
  INSERT INTO user_verifications (
    user_id,
    verification_token,
    verification_type,
    expires_at
  )
  VALUES (
    new_user_id,
    verification_token,
    'email',
    NOW() + INTERVAL '24 hours'
  );
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to verify a user's email
CREATE OR REPLACE FUNCTION verify_user_email(token_input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_id_found INTEGER;
BEGIN
  -- Find the verification record
  SELECT user_id INTO user_id_found
  FROM user_verifications
  WHERE verification_token = token_input
    AND verification_type = 'email'
    AND expires_at > NOW()
    AND verified = FALSE;
  
  -- If no valid verification found
  IF user_id_found IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update the verification record
  UPDATE user_verifications
  SET verified = TRUE
  WHERE verification_token = token_input;
  
  -- Update the user record
  UPDATE users
  SET is_verified = TRUE
  WHERE id = user_id_found;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to create a password reset token
CREATE OR REPLACE FUNCTION create_password_reset(email_input TEXT)
RETURNS TEXT AS $$
DECLARE
  user_id_found INTEGER;
  reset_token TEXT;
BEGIN
  -- Find the user
  SELECT id INTO user_id_found
  FROM users
  WHERE email = email_input;
  
  -- If no user found
  IF user_id_found IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Generate a reset token
  reset_token := encode(gen_random_bytes(20), 'hex');
  
  -- Update the user record
  UPDATE users
  SET 
    reset_password_token = reset_token,
    reset_password_expires = NOW() + INTERVAL '1 hour'
  WHERE id = user_id_found;
  
  RETURN reset_token;
END;
$$ LANGUAGE plpgsql;

-- Function to reset password
CREATE OR REPLACE FUNCTION reset_password(token_input TEXT, new_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_id_found INTEGER;
BEGIN
  -- Find the user
  SELECT id INTO user_id_found
  FROM users
  WHERE reset_password_token = token_input
    AND reset_password_expires > NOW();
  
  -- If no valid token found
  IF user_id_found IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update the user record
  UPDATE users
  SET 
    password = new_password, -- Note: In production, this should be hashed
    reset_password_token = NULL,
    reset_password_expires = NULL
  WHERE id = user_id_found;
  
  -- Log the password reset
  INSERT INTO auth_audit (user_id, event_type)
  VALUES (user_id_found, 'password_reset');
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Accounting functions

-- Function to create a transaction and accounting entries
CREATE OR REPLACE FUNCTION create_transaction(
  order_id_input INTEGER,
  user_id_input INTEGER,
  amount_input DOUBLE PRECISION,
  currency_input TEXT,
  status_input TEXT,
  payment_method_id_input INTEGER,
  provider_input TEXT,
  provider_transaction_id_input TEXT,
  transaction_type_input TEXT
) RETURNS INTEGER AS $$
DECLARE
  new_transaction_id INTEGER;
BEGIN
  -- Insert the transaction
  INSERT INTO transactions (
    order_id,
    user_id,
    amount,
    currency,
    status,
    payment_method_id,
    provider,
    provider_transaction_id,
    transaction_type
  )
  VALUES (
    order_id_input,
    user_id_input,
    amount_input,
    currency_input,
    status_input,
    payment_method_id_input,
    provider_input,
    provider_transaction_id_input,
    transaction_type_input
  )
  RETURNING id INTO new_transaction_id;
  
  -- Create accounting entries (double-entry)
  IF status_input = 'completed' AND transaction_type_input = 'payment' THEN
    -- Debit cash/accounts receivable
    INSERT INTO accounting_entries (
      transaction_id,
      entry_type,
      account,
      amount
    )
    VALUES (
      new_transaction_id,
      'debit',
      'accounts_receivable',
      amount_input
    );
    
    -- Credit revenue
    INSERT INTO accounting_entries (
      transaction_id,
      entry_type,
      account,
      amount
    )
    VALUES (
      new_transaction_id,
      'credit',
      'revenue',
      amount_input
    );
  END IF;
  
  RETURN new_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice
CREATE OR REPLACE FUNCTION generate_invoice(
  order_id_input INTEGER,
  transaction_id_input INTEGER
) RETURNS TEXT AS $$
DECLARE
  new_invoice_number TEXT;
  user_id_found INTEGER;
  subtotal_amount DOUBLE PRECISION;
  tax_amount DOUBLE PRECISION;
  shipping_amount DOUBLE PRECISION;
  discount_amount DOUBLE PRECISION;
  total_amount DOUBLE PRECISION;
  shipping_address_json JSONB;
  billing_address_json JSONB;
BEGIN
  -- Generate invoice number
  new_invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || order_id_input;
  
  -- Get order details
  SELECT 
    o.user_id, 
    o.total, 
    o.shipping_address, 
    COALESCE((o.total * 0.1), 0) -- Assume 10% tax for demo
  INTO 
    user_id_found, 
    subtotal_amount,
    shipping_address_json,
    tax_amount
  FROM orders o
  WHERE o.id = order_id_input;
  
  -- Get shipping and discount
  shipping_amount := 0; -- You could calculate based on order items weight
  discount_amount := 0; -- You could get from any applied promotion
  
  -- Calculate total
  total_amount := subtotal_amount + tax_amount + shipping_amount - discount_amount;
  
  -- Get billing address (assume same as shipping for demo)
  billing_address_json := shipping_address_json;
  
  -- Insert the invoice
  INSERT INTO invoices (
    invoice_number,
    user_id,
    order_id,
    transaction_id,
    subtotal,
    tax,
    shipping,
    discount,
    total,
    status,
    due_date,
    issued_date,
    billing_address,
    shipping_address
  )
  VALUES (
    new_invoice_number,
    user_id_found,
    order_id_input,
    transaction_id_input,
    subtotal_amount,
    tax_amount,
    shipping_amount,
    discount_amount,
    total_amount,
    'issued',
    NOW() + INTERVAL '30 days',
    NOW(),
    billing_address_json,
    shipping_address_json
  );
  
  RETURN new_invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Insert sample tax rates
INSERT INTO tax_rates (country, state, rate, tax_name, is_default)
VALUES
  ('US', 'CA', 7.25, 'California Sales Tax', false),
  ('US', 'NY', 8.875, 'New York Sales Tax', false),
  ('US', 'TX', 6.25, 'Texas Sales Tax', false),
  ('US', 'FL', 6.0, 'Florida Sales Tax', false),
  ('US', NULL, 0.0, 'No Tax', true)
ON CONFLICT DO NOTHING; 