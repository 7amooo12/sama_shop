import { supabase } from './server/supabase';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

async function createTablesDirectly() {
  try {
    console.log('بدء إنشاء الجداول في قاعدة البيانات Supabase مباشرة...');
    
    // إنشاء جدول المستخدمين
    const { error: usersError } = await supabase.from('users').select('count').limit(1);
    
    if (usersError && usersError.code === '42P01') { // جدول غير موجود
      const { error } = await supabase.rpc('exec_sql', {
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
      
      if (error) {
        console.error('خطأ في إنشاء جدول المستخدمين:', error);
      } else {
        console.log('تم إنشاء جدول المستخدمين بنجاح');
      }
    } else {
      console.log('جدول المستخدمين موجود بالفعل');
    }
    
    // إنشاء جدول المنتجات
    const { error: productsError } = await supabase.from('products').select('count').limit(1);
    
    if (productsError && productsError.code === '42P01') { // جدول غير موجود
      const { error } = await supabase.rpc('exec_sql', {
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
      
      if (error) {
        console.error('خطأ في إنشاء جدول المنتجات:', error);
      } else {
        console.log('تم إنشاء جدول المنتجات بنجاح');
      }
    } else {
      console.log('جدول المنتجات موجود بالفعل');
    }
    
    // إنشاء جدول الطلبات
    const { error: ordersError } = await supabase.from('orders').select('count').limit(1);
    
    if (ordersError && ordersError.code === '42P01') { // جدول غير موجود
      const { error } = await supabase.rpc('exec_sql', {
        query: `
          CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            email TEXT NOT NULL,
            total DOUBLE PRECISION NOT NULL,
            status TEXT NOT NULL,
            shipping_address JSONB NOT NULL,
            items JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
          )
        `
      });
      
      if (error) {
        console.error('خطأ في إنشاء جدول الطلبات:', error);
      } else {
        console.log('تم إنشاء جدول الطلبات بنجاح');
      }
    } else {
      console.log('جدول الطلبات موجود بالفعل');
    }
    
    // إنشاء جدول سلة التسوق
    const { error: cartsError } = await supabase.from('carts').select('count').limit(1);
    
    if (cartsError && cartsError.code === '42P01') { // جدول غير موجود
      const { error } = await supabase.rpc('exec_sql', {
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
      
      if (error) {
        console.error('خطأ في إنشاء جدول سلة التسوق:', error);
      } else {
        console.log('تم إنشاء جدول سلة التسوق بنجاح');
      }
    } else {
      console.log('جدول سلة التسوق موجود بالفعل');
    }
    
    console.log('تم الانتهاء من إنشاء الجداول في قاعدة البيانات Supabase');
    return true;
  } catch (error) {
    console.error('فشل في إنشاء الجداول:', error);
    return false;
  }
}

// طريقة بديلة لإنشاء الجداول باستخدام واجهة برمجة التطبيقات المتاحة
async function createTablesUsingAPI() {
  try {
    console.log('بدء إنشاء الجداول باستخدام واجهة برمجة التطبيقات...');
    
    // إنشاء جدول المستخدمين
    const { error: usersError } = await supabase.from('users').select('count').limit(1);
    
    if (usersError && usersError.code === '42P01') { // جدول غير موجود
      // استخدام واجهة برمجة التطبيقات لإنشاء الجدول
      const { error } = await supabase
        .from('users')
        .insert([
          {
            username: 'admin',
            password: 'admin_password_hash',
            email: 'admin@example.com',
            first_name: 'Admin',
            last_name: 'User',
            is_admin: true
          }
        ]);
      
      if (error && error.code !== '23505') { // تجاهل خطأ التكرار
        console.error('خطأ في إنشاء جدول المستخدمين:', error);
      } else {
        console.log('تم إنشاء جدول المستخدمين بنجاح');
      }
    } else {
      console.log('جدول المستخدمين موجود بالفعل');
    }
    
    // إنشاء جدول المنتجات
    const { error: productsError } = await supabase.from('products').select('count').limit(1);
    
    if (productsError && productsError.code === '42P01') { // جدول غير موجود
      // إضافة منتج افتراضي لإنشاء الجدول
      const { error } = await supabase
        .from('products')
        .insert([
          {
            name: "Crystal Nova Pendant",
            description: "Modern geometric design with premium crystal elements and smart RGB lighting system.",
            price: 1599,
            sale_price: 1299,
            image_url: "https://images.unsplash.com/photo-1592833167001-55c6233fc83e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
            category: "Pendants",
            tags: ["modern", "crystal", "smart"],
            features: {
              material: "Crystal",
              dimensions: "60cm x 60cm",
              bulbType: "LED",
              smartFeatures: true
            },
            is_featured: true,
            rating: 4.5,
            rating_count: 42
          }
        ]);
      
      if (error && error.code !== '23505') { // تجاهل خطأ التكرار
        console.error('خطأ في إنشاء جدول المنتجات:', error);
      } else {
        console.log('تم إنشاء جدول المنتجات بنجاح');
      }
    } else {
      console.log('جدول المنتجات موجود بالفعل');
    }
    
    // إنشاء جدول الطلبات
    const { error: ordersError } = await supabase.from('orders').select('count').limit(1);
    
    if (ordersError && ordersError.code === '42P01') { // جدول غير موجود
      // لا يمكن إنشاء طلب بدون مستخدم موجود، لذا نتحقق من وجود مستخدم أولاً
      const { data: users } = await supabase.from('users').select('id').limit(1);
      
      if (users && users.length > 0) {
        // إضافة طلب افتراضي لإنشاء الجدول
        const { error } = await supabase
          .from('orders')
          .insert([
            {
              user_id: users[0].id,
              email: 'test@example.com',
              total: 1599,
              status: 'pending',
              shipping_address: {
                address: '123 Main St',
                city: 'Anytown',
                state: 'CA',
                zip: '12345'
              },
              items: [
                {
                  productId: 1,
                  quantity: 1,
                  product: {
                    id: 1,
                    name: "Crystal Nova Pendant",
                    price: 1599
                  }
                }
              ]
            }
          ]);
        
        if (error && error.code !== '23505') { // تجاهل خطأ التكرار
          console.error('خطأ في إنشاء جدول الطلبات:', error);
        } else {
          console.log('تم إنشاء جدول الطلبات بنجاح');
        }
      } else {
        console.log('لا يمكن إنشاء جدول الطلبات بدون وجود مستخدم');
      }
    } else {
      console.log('جدول الطلبات موجود بالفعل');
    }
    
    // إنشاء جدول سلة التسوق
    const { error: cartsError } = await supabase.from('carts').select('count').limit(1);
    
    if (cartsError && cartsError.code === '42P01') { // جدول غير موجود
      // لا يمكن إنشاء سلة بدون مستخدم موجود، لذا نتحقق من وجود مستخدم أولاً
      const { data: users } = await supabase.from('users').select('id').limit(1);
      
      if (users && users.length > 0) {
        // إضافة سلة افتراضية لإنشاء الجدول
        const { error } = await supabase
          .from('carts')
          .insert([
            {
              user_id: users[0].id,
              items: []
            }
          ]);
        
        if (error && error.code !== '23505') { // تجاهل خطأ التكرار
          console.error('خطأ في إنشاء جدول سلة التسوق:', error);
        } else {
          console.log('تم إنشاء جدول سلة التسوق بنجاح');
        }
      } else {
        console.log('لا يمكن إنشاء جدول سلة التسوق بدون وجود مستخدم');
      }
    } else {
      console.log('جدول سلة التسوق موجود بالفعل');
    }
    
    console.log('تم الانتهاء من إنشاء الجداول باستخدام واجهة برمجة التطبيقات');
    return true;
  } catch (error) {
    console.error('فشل في إنشاء الجداول:', error);
    return false;
  }
}

async function initializeDatabase() {
  try {
    console.log('بدء تهيئة قاعدة البيانات...');
    
    // محاولة إنشاء الجداول باستخدام واجهة برمجة التطبيقات
    const tablesCreated = await createTablesUsingAPI();
    
    if (tablesCreated) {
      console.log('تم إنشاء الجداول بنجاح');
      
      // التحقق من وجود منتجات في قاعدة البيانات
      const { data: products, error } = await supabase
        .from('products')
        .select('*');
      
      if (!error) {
        console.log(`تم العثور على ${products?.length || 0} منتج في قاعدة البيانات`);
        
        if (!products || products.length < 3) {
          console.log('عدد المنتجات أقل من المطلوب، جاري إضافة منتجات إضافية...');
          
          // إضافة منتجات إضافية
          const additionalProducts = [
            {
              name: "Geometric Hexa Light",
              description: "Hexagonal pendant with warm ambient lighting, perfect for dining rooms and modern interiors.",
              price: 849,
              image_url: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
              category: "Pendants",
              tags: ["modern", "geometric"],
              features: {
                material: "Aluminum",
                dimensions: "45cm diameter",
                bulbType: "LED",
                smartFeatures: false
              },
              rating: 4.0,
              rating_count: 36
            },
            {
              name: "Celestial Smart Ceiling",
              description: "Wi-Fi enabled smart lighting with customizable patterns, voice control and app integration.",
              price: 2299,
              sale_price: 1999,
              image_url: "https://images.unsplash.com/photo-1536528906775-c0c07c0ac0f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
              category: "Smart Lighting",
              tags: ["smart", "ceiling", "modern"],
              features: {
                material: "Aluminum and Acrylic",
                dimensions: "120cm x 80cm",
                bulbType: "LED RGB",
                smartFeatures: true
              },
              is_featured: true,
              rating: 5.0,
              rating_count: 59
            }
          ];
          
          for (const product of additionalProducts) {
            const { error } = await supabase.from('products').insert([product]);
            if (error && error.code !== '23505') { // تجاهل خطأ التكرار
              console.error('خطأ في إضافة منتج:', error);
            }
          }
          
          console.log('تم إضافة المنتجات الإضافية بنجاح');
        }
      } else {
        console.error('خطأ في التحقق من وجود منتجات:', error);
      }
    }
    
    console.log('تم تهيئة قاعدة البيانات بنجاح');
  } catch (error) {
    console.error('حدث خطأ أثناء تهيئة قاعدة البيانات:', error);
  }
}

// تنفيذ تهيئة قاعدة البيانات
initializeDatabase()
  .then(() => {
    console.log('اكتملت عملية تهيئة قاعدة البيانات');
    process.exit(0);
  })
  .catch((error) => {
    console.error('فشلت عملية تهيئة قاعدة البيانات:', error);
    process.exit(1);
  });
