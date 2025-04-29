import { createClient } from '@supabase/supabase-js';
import { supabase, supabaseAdmin } from './supabase';
import { User, Product, Order, Cart, CartItem } from '../shared/schema';

class SupabaseStorage {
  private static instance: SupabaseStorage;

  // استخدام نمط Singleton للتأكد من وجود نسخة واحدة فقط
  public static getInstance(): SupabaseStorage {
    if (!SupabaseStorage.instance) {
      SupabaseStorage.instance = new SupabaseStorage();
    }
    return SupabaseStorage.instance;
  }

  constructor() {
    // تهيئة البيانات الأولية عند الحاجة
    this.initializeData();
  }

  // تهيئة البيانات الأولية
  private async initializeData() {
    try {
      // التحقق من وجود منتجات في قاعدة البيانات
      const { data: products, error } = await supabase
        .from('products')
        .select('*');

      // إذا لم تكن هناك منتجات، قم بإضافة بعض المنتجات الافتراضية
      if (!error && (!products || products.length === 0)) {
        await this.seedProducts();
      }
    } catch (error) {
      console.error('خطأ في تهيئة البيانات:', error);
    }
  }

  // المستخدمين
  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) throw new Error(`فشل في إنشاء المستخدم: ${error.message}`);
    return data;
  }

  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`فشل في الحصول على المستخدم: ${error.message}`);
    }
    return data || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`فشل في الحصول على المستخدم: ${error.message}`);
    }
    return data || undefined;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`فشل في تحديث المستخدم: ${error.message}`);
    return data;
  }

  // المنتجات
  async createProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) throw new Error(`فشل في إنشاء المنتج: ${error.message}`);
    return data;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`فشل في الحصول على المنتج: ${error.message}`);
    }
    return data || undefined;
  }

  async getAllProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) throw new Error(`فشل في الحصول على المنتجات: ${error.message}`);
    return data || [];
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category);

    if (error) throw new Error(`فشل في الحصول على المنتجات حسب الفئة: ${error.message}`);
    return data || [];
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('isFeatured', true);

    if (error) throw new Error(`فشل في الحصول على المنتجات المميزة: ${error.message}`);
    return data || [];
  }

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`فشل في تحديث المنتج: ${error.message}`);
    return data;
  }

  async deleteProduct(id: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`فشل في حذف المنتج: ${error.message}`);
  }

  // سلة التسوق
  async getCart(userId: number): Promise<Cart | undefined> {
    const { data, error } = await supabase
      .from('carts')
      .select('*')
      .eq('userId', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`فشل في الحصول على سلة التسوق: ${error.message}`);
    }

    if (!data) {
      // إنشاء سلة جديدة إذا لم تكن موجودة
      return this.createCart(userId);
    }

    // استرجاع معلومات المنتجات المرتبطة بالسلة
    if (data.items && Array.isArray(data.items)) {
      const cartItems = data.items as CartItem[];
      for (const item of cartItems) {
        const product = await this.getProduct(item.productId);
        if (product) {
          item.product = product;
        }
      }
    }

    return data;
  }

  async createCart(userId: number): Promise<Cart> {
    const { data, error } = await supabase
      .from('carts')
      .insert([{
        userId,
        items: []
      }])
      .select()
      .single();

    if (error) throw new Error(`فشل في إنشاء سلة التسوق: ${error.message}`);
    return data;
  }

  async updateCart(userId: number, items: CartItem[]): Promise<Cart> {
    // تحديث السلة الحالية أو إنشاء سلة جديدة إذا لم تكن موجودة
    const { data: existingCart } = await supabase
      .from('carts')
      .select('*')
      .eq('userId', userId)
      .single();

    if (existingCart) {
      // تحديث السلة الموجودة
      const { data, error } = await supabase
        .from('carts')
        .update({
          items,
          updatedAt: new Date()
        })
        .eq('userId', userId)
        .select()
        .single();

      if (error) throw new Error(`فشل في تحديث سلة التسوق: ${error.message}`);
      return data;
    } else {
      // إنشاء سلة جديدة
      return this.createCart(userId);
    }
  }

  async addToCart(userId: number, productId: number, quantity: number): Promise<Cart> {
    // الحصول على السلة الحالية
    const cart = await this.getCart(userId);
    
    if (!cart) {
      throw new Error('لم يتم العثور على سلة التسوق');
    }

    // الحصول على المنتج
    const product = await this.getProduct(productId);
    if (!product) {
      throw new Error('لم يتم العثور على المنتج');
    }

    // تحديث العناصر في السلة
    const items = cart.items as CartItem[] || [];
    const existingItemIndex = items.findIndex(item => item.productId === productId);

    if (existingItemIndex >= 0) {
      // تحديث الكمية إذا كان المنتج موجودًا بالفعل
      items[existingItemIndex].quantity += quantity;
    } else {
      // إضافة المنتج إلى السلة إذا لم يكن موجودًا
      items.push({
        productId,
        quantity,
        product
      });
    }

    // تحديث السلة في قاعدة البيانات
    return this.updateCart(userId, items);
  }

  async removeFromCart(userId: number, productId: number): Promise<Cart> {
    // الحصول على السلة الحالية
    const cart = await this.getCart(userId);
    
    if (!cart) {
      throw new Error('لم يتم العثور على سلة التسوق');
    }

    // تحديث العناصر في السلة
    const items = cart.items as CartItem[] || [];
    const updatedItems = items.filter(item => item.productId !== productId);

    // تحديث السلة في قاعدة البيانات
    return this.updateCart(userId, updatedItems);
  }

  async clearCart(userId: number): Promise<Cart> {
    // تحديث السلة بقائمة فارغة من العناصر
    return this.updateCart(userId, []);
  }

  // الطلبات
  async createOrder(
    userId: number,
    shippingAddress: any
  ): Promise<Order> {
    // الحصول على سلة التسوق
    const cart = await this.getCart(userId);
    const user = await this.getUser(userId);
    
    if (!cart || !(cart.items as CartItem[]).length) {
      throw new Error('سلة التسوق فارغة');
    }
    
    // حساب المجموع
    const items = cart.items as CartItem[];
    const total = items.reduce((sum, item) => {
      const price = item.product.salePrice || item.product.price;
      return sum + (price * item.quantity);
    }, 0);
    
    // إنشاء الطلب
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        userId,
        email: user!.email,
        total,
        status: 'pending',
        shippingAddress,
        items: cart.items
      }])
      .select()
      .single();

    if (error) throw new Error(`فشل في إنشاء الطلب: ${error.message}`);
    
    // مسح سلة التسوق بعد إنشاء الطلب
    await this.clearCart(userId);
    
    return data;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`فشل في الحصول على الطلب: ${error.message}`);
    }
    return data || undefined;
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('userId', userId);

    if (error) throw new Error(`فشل في الحصول على طلبات المستخدم: ${error.message}`);
    return data || [];
  }

  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*');

    if (error) throw new Error(`فشل في الحصول على جميع الطلبات: ${error.message}`);
    return data || [];
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`فشل في تحديث حالة الطلب: ${error.message}`);
    return data;
  }

  // بذر المنتجات الأولية
  private async seedProducts() {
    const products = [
      {
        name: "Crystal Nova Pendant",
        description: "Modern geometric design with premium crystal elements and smart RGB lighting system.",
        price: 1599,
        salePrice: 1299,
        imageUrl: "https://images.unsplash.com/photo-1592833167001-55c6233fc83e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "Pendants",
        tags: ["modern", "crystal", "smart"],
        features: {
          material: "Crystal",
          dimensions: "60cm x 60cm",
          bulbType: "LED",
          smartFeatures: true
        },
        isFeatured: true,
        rating: 4.5,
        ratingCount: 42
      },
      {
        name: "Geometric Hexa Light",
        description: "Hexagonal pendant with warm ambient lighting, perfect for dining rooms and modern interiors.",
        price: 849,
        imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "Pendants",
        tags: ["modern", "geometric"],
        features: {
          material: "Aluminum",
          dimensions: "45cm diameter",
          bulbType: "LED",
          smartFeatures: false
        },
        rating: 4.0,
        ratingCount: 36
      },
      {
        name: "Celestial Smart Ceiling",
        description: "Wi-Fi enabled smart lighting with customizable patterns, voice control and app integration.",
        price: 2299,
        salePrice: 1999,
        imageUrl: "https://images.unsplash.com/photo-1536528906775-c0c07c0ac0f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "Smart Lighting",
        tags: ["smart", "ceiling", "modern"],
        features: {
          material: "Aluminum and Acrylic",
          dimensions: "120cm x 80cm",
          bulbType: "LED RGB",
          smartFeatures: true
        },
        isFeatured: true,
        rating: 5.0,
        ratingCount: 59
      },
      {
        name: "Linear Float Chandelier",
        description: "Minimalist linear design with adjustable height and warm LED lighting for dining tables.",
        price: 699,
        imageUrl: "https://images.unsplash.com/photo-1572385226827-c9c0abed35e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "Chandeliers",
        tags: ["modern", "minimalist", "dining"],
        features: {
          material: "Metal",
          dimensions: "120cm length",
          bulbType: "LED",
          smartFeatures: false
        },
        rating: 3.5,
        ratingCount: 28
      },
      {
        name: "Royal Gold Cascades",
        description: "Luxury gold-plated chandelier with cascading crystal elements for grand entrances and halls.",
        price: 4299,
        imageUrl: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "Chandeliers",
        tags: ["luxury", "gold", "crystal"],
        features: {
          material: "Gold-plated metal and crystal",
          dimensions: "100cm diameter, 120cm height",
          bulbType: "LED",
          smartFeatures: false
        },
        isFeatured: true,
        rating: 5.0,
        ratingCount: 47
      },
      {
        name: "Industrial Pendant Cluster",
        description: "Industrial-style pendant cluster with vintage Edison bulbs, perfect for restaurants and lofts.",
        price: 699,
        salePrice: 549,
        imageUrl: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        category: "Pendants",
        tags: ["industrial", "vintage", "cluster"],
        features: {
          material: "Metal",
          dimensions: "Cluster of 5-8 pendants",
          bulbType: "Edison",
          smartFeatures: false
        },
        rating: 4.0,
        ratingCount: 32
      }
    ];

    // إضافة المنتجات إلى قاعدة البيانات
    for (const product of products) {
      await this.createProduct(product);
    }
  }
}

export const storage = SupabaseStorage.getInstance();
