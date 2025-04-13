# Smart Ecommerce Application

A full-stack e-commerce application with user authentication, product catalog, shopping cart, and order management.

## Setup Instructions

### Prerequisites
- Node.js (v16 or later)
- Supabase account with a project

### Environment Setup
1. Copy the `.env` file and update with your Supabase credentials:
```
DATABASE_URL=postgres://<your-postgres-url>
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_KEY=<your-service-key>
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SESSION_SECRET=<your-secret-session-key>
```

### Database Setup
Since this project uses Supabase, you need to set up the database tables manually:

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to the SQL Editor
3. Copy the contents of the `supabase-setup.sql` file from this project
4. Paste and run the SQL script in the editor
5. This will create all necessary tables and policies

### Install Dependencies
```bash
npm install
```

### Run the Application
```bash
npm run dev
```

The application will be available at http://localhost:5000

## Database Tables

The application uses the following tables:

1. **users** - User accounts
2. **products** - Product catalog
3. **carts** - Shopping carts
4. **orders** - Customer orders
5. **sessions** - Session management

## Default Users

The SQL setup script creates two default users:

1. **Admin User**
   - Username: admin
   - Password: admin123
   - Email: admin@example.com
   - Has admin privileges

2. **Test User**
   - Username: testuser
   - Password: password123
   - Email: test@example.com
   - Regular user privileges

## Troubleshooting

If you encounter issues with the database:

1. Check that all tables exist in Supabase
2. Verify your environment variables are correctly set
3. Visit http://localhost:5000/api/setup-instructions for database setup help
4. Check http://localhost:5000/health for API status

## API Endpoints

- **POST /api/login** - User login
- **POST /api/register** - User registration
- **GET /api/user** - Get current user
- **GET /api/products** - Get all products
- **GET /api/products/:id** - Get a specific product
- **GET /api/cart** - Get user's cart
- **POST /api/cart/add** - Add item to cart
- **POST /api/orders** - Create a new order 