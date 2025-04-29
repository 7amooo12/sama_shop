import { supabase, supabaseAdmin } from './supabase';

export async function createTables() {
  try {
    console.log('بدء إنشاء الجداول في قاعدة بيانات Supabase...');
    
    // إنشاء جدول المستخدمين
    const { error: usersError } = await supabase.from('users').select('count').limit(1);
    
    if (usersError && usersError.code === '42P01') { // جدول غير موجود
      try {
        // محاولة إنشاء الجدول باستخدام SQL مباشرة
        const { error: createTableError } = await supabaseAdmin.rpc('exec_sql', {
          query: `
            CREATE TABLE IF NOT EXISTS users (
              id SERIAL PRIMARY KEY,
              username TEXT NOT NULL UNIQUE,
              password TEXT NOT NULL,
              email TEXT NOT NULL UNIQUE,
              first_name TEXT,
              last_name TEXT,
              is_admin BOOLEAN NOT NULL DEFAULT FALSE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
            )
          `
        });
        
        if (createTableError) {
          console.error('خطأ في إنشاء جدول المستخدمين باستخدام SQL:', createTableError);
          
          // إذا فشلت محاولة SQL، نحاول إنشاء الجدول من خلال إدراج أول مستخدم
          const { error } = await supabaseAdmin
            .from('users')
            .insert({
              username: 'admin',
              password: 'admin123', // يجب تغييره لاحقًا
              email: 'admin@example.com',
              first_name: 'Admin',
              last_name: 'User',
              is_admin: true,
              created_at: new Date().toISOString()
            });
          
          if (error) {
            console.error('خطأ في إنشاء جدول المستخدمين من خلال الإدراج:', error);
          } else {
            console.log('تم إنشاء جدول المستخدمين بنجاح من خلال الإدراج');
          }
        } else {
          console.log('تم إنشاء جدول المستخدمين بنجاح باستخدام SQL');
        }
      } catch (err) {
        console.error('خطأ غير متوقع أثناء إنشاء جدول المستخدمين:', err);
      }
    } else {
      console.log('جدول المستخدمين موجود بالفعل');
    }

    // إنشاء جدول المنتجات
    const { error: productsError } = await supabase.from('products').select('count').limit(1);
    
    if (productsError && productsError.code === '42P01') { // جدول غير موجود
      try {
        // محاولة إنشاء الجدول باستخدام SQL مباشرة
        const { error: createTableError } = await supabaseAdmin.rpc('exec_sql', {
          query: `
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
            )
          `
        });
        
        if (createTableError) {
          console.error('خطأ في إنشاء جدول المنتجات باستخدام SQL:', createTableError);
          
          // إذا فشلت محاولة SQL، نحاول إنشاء الجدول من خلال إدراج أول منتج
          const { error } = await supabaseAdmin
            .from('products')
            .insert({
              name: 'منتج تجريبي',
              description: 'وصف المنتج التجريبي',
              price: 99.99,
              sale_price: 79.99,
              image_url: 'https://example.com/image.jpg',
              light_image_url: 'https://example.com/light-image.jpg',
              category: 'عام',
              tags: ['تجريبي', 'جديد'],
              features: { color: 'أزرق', size: 'متوسط' },
              is_featured: true,
              in_stock: true,
              rating: 5.0,
              rating_count: 1,
              created_at: new Date().toISOString()
            });
          
          if (error) {
            console.error('خطأ في إنشاء جدول المنتجات من خلال الإدراج:', error);
          } else {
            console.log('تم إنشاء جدول المنتجات بنجاح من خلال الإدراج');
          }
        } else {
          console.log('تم إنشاء جدول المنتجات بنجاح باستخدام SQL');
        }
      } catch (err) {
        console.error('خطأ غير متوقع أثناء إنشاء جدول المنتجات:', err);
      }
    } else {
      console.log('جدول المنتجات موجود بالفعل');
    }

    // إنشاء جدول سلة التسوق
    const { error: cartsError } = await supabase.from('carts').select('count').limit(1);
    
    if (cartsError && cartsError.code === '42P01') { // جدول غير موجود
      try {
        // محاولة إنشاء الجدول باستخدام SQL مباشرة
        const { error: createTableError } = await supabaseAdmin.rpc('exec_sql', {
          query: `
            CREATE TABLE IF NOT EXISTS carts (
              id SERIAL PRIMARY KEY,
              user_id INTEGER REFERENCES users(id),
              items JSONB NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
            )
          `
        });
        
        if (createTableError) {
          console.error('خطأ في إنشاء جدول سلة التسوق باستخدام SQL:', createTableError);
          
          // إذا فشلت محاولة SQL، نحاول إنشاء الجدول من خلال إدراج أول سلة
          const { error } = await supabaseAdmin
            .from('carts')
            .insert({
              user_id: null, // سيتم ربطه بالمستخدم لاحقًا
              items: JSON.stringify([]),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (error) {
            console.error('خطأ في إنشاء جدول سلة التسوق من خلال الإدراج:', error);
          } else {
            console.log('تم إنشاء جدول سلة التسوق بنجاح من خلال الإدراج');
          }
        } else {
          console.log('تم إنشاء جدول سلة التسوق بنجاح باستخدام SQL');
        }
      } catch (err) {
        console.error('خطأ غير متوقع أثناء إنشاء جدول سلة التسوق:', err);
      }
    } else {
      console.log('جدول سلة التسوق موجود بالفعل');
    }

    // إنشاء جدول الطلبات باستخدام واجهة برمجة التطبيقات المباشرة
    const { error: ordersError } = await supabase.from('orders').select('count').limit(1);
    
    if (ordersError && ordersError.code === '42P01') { // جدول غير موجود
      // إنشاء جدول الطلبات من خلال إدراج أول طلب (سيتم إنشاء الجدول تلقائيًا)
      const { error } = await supabaseAdmin
        .from('orders')
        .insert({
          user_id: null, // سيتم ربطه بالمستخدم لاحقًا
          email: 'test@example.com',
          total: 99.99,
          status: 'تم الإنشاء',
          shipping_address: JSON.stringify({
            name: 'اسم المستلم',
            address: 'عنوان الشحن',
            city: 'المدينة',
            country: 'الدولة',
            postal_code: '12345'
          }),
          items: JSON.stringify([]),
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error('خطأ في إنشاء جدول الطلبات:', error);
      } else {
        console.log('تم إنشاء جدول الطلبات بنجاح');
      }
    } else {
      console.log('جدول الطلبات موجود بالفعل');
    }

    console.log('تم الانتهاء من إنشاء الجداول في قاعدة بيانات Supabase');
  } catch (error) {
    console.error('فشل في إنشاء الجداول:', error);
    throw error;
  }
}