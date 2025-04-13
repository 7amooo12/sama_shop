import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { users, products, orders, carts } from '../shared/schema';
import { supabase } from './supabase';

// دالة لإنشاء الجداول في قاعدة بيانات Supabase
export async function createTables() {
  try {
    console.log('بدء إنشاء الجداول في قاعدة بيانات Supabase...');
    
    // إنشاء جدول المستخدمين
    const { error: usersError } = await supabase.rpc('create_pg_table', {
      table_name: 'users',
      definition: `
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        first_name TEXT,
        last_name TEXT,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      `
    });
    
    if (usersError) {
      console.log('جدول المستخدمين موجود بالفعل أو حدث خطأ:', usersError.message);
    } else {
      console.log('تم إنشاء جدول المستخدمين بنجاح');
    }
    
    // إنشاء جدول المنتجات
    const { error: productsError } = await supabase.rpc('create_pg_table', {
      table_name: 'products',
      definition: `
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
      `
    });
    
    if (productsError) {
      console.log('جدول المنتجات موجود بالفعل أو حدث خطأ:', productsError.message);
    } else {
      console.log('تم إنشاء جدول المنتجات بنجاح');
    }
    
    // إنشاء جدول الطلبات
    const { error: ordersError } = await supabase.rpc('create_pg_table', {
      table_name: 'orders',
      definition: `
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        email TEXT NOT NULL,
        total DOUBLE PRECISION NOT NULL,
        status TEXT NOT NULL,
        shipping_address JSONB NOT NULL,
        items JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      `
    });
    
    if (ordersError) {
      console.log('جدول الطلبات موجود بالفعل أو حدث خطأ:', ordersError.message);
    } else {
      console.log('تم إنشاء جدول الطلبات بنجاح');
    }
    
    // إنشاء جدول سلة التسوق
    const { error: cartsError } = await supabase.rpc('create_pg_table', {
      table_name: 'carts',
      definition: `
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        items JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      `
    });
    
    if (cartsError) {
      console.log('جدول سلة التسوق موجود بالفعل أو حدث خطأ:', cartsError.message);
    } else {
      console.log('تم إنشاء جدول سلة التسوق بنجاح');
    }
    
    console.log('تم الانتهاء من إنشاء الجداول في قاعدة بيانات Supabase');
  } catch (error) {
    console.error('فشل في إنشاء الجداول:', error);
    throw error;
  }
}
