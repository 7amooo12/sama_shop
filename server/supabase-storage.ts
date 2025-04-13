import { supabase, supabaseAdmin } from './supabase';
import { User, Product, Order, Cart, CartItem, ensureCartItems } from '@shared/schema';
import session from 'express-session';
import { MemoryStore } from 'express-session';
import { log } from './vite';

export class SupabaseStorage {
  private static instance: SupabaseStorage;
  public sessionStore: session.Store;

  // استخدام نمط Singleton للتأكد من وجود نسخة واحدة فقط
  public static getInstance(): SupabaseStorage {
    if (!SupabaseStorage.instance) {
      SupabaseStorage.instance = new SupabaseStorage();
    }
    return SupabaseStorage.instance;
  }

  constructor() {
    // تهيئة البيانات الأولية عند الحاجة
    this.sessionStore = new MemoryStore();
    this.initializeData();
  }

  // تهيئة البيانات الأولية
  private async initializeData() {
    try {
      // التحقق من وجود منتجات في قاعدة البيانات
      const { data: products, error } = await supabase
        .from('products')
        .select('count');

      // إذا لم تكن هناك منتجات، قم بإضافة بعض المنتجات الافتراضية
      if (error || !products || products.length === 0) {
        await this.seedProducts();
      }
    } catch (error) {
      log(`خطأ في تهيئة البيانات: ${error}`);
    }
  }

  // المستخدمين
  async createUser(userData: any): Promise<User> {
    try {
      // Make sure we're using the right column names for the database
      const userForDb = {
        username: userData.username,
        password: userData.password,
        email: userData.email,
        first_name: userData.first_name || userData.firstName,
        last_name: userData.last_name || userData.lastName,
        is_admin: userData.isAdmin || false
      };

      const { data, error } = await supabase
        .from('users')
        .insert([userForDb])
        .select()
        .single();

      if (error) throw new Error(`فشل في إنشاء المستخدم: ${error.message}`);
      return data;
    } catch (error) {
      log(`فشل في إنشاء المستخدم: ${error}`);
      throw error;
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`فشل في الحصول على المستخدم: ${error.message}`);
      }
      return data || undefined;
    } catch (error) {
      log(`فشل في الحصول على المستخدم: ${error}`);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      console.log(`Attempting to fetch user by username: ${username}`);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log(`Failed to get user by username: ${error.message}`);
        return undefined;
      }
      
      if (data) {
        console.log(`User found: ID=${data.id}, Username=${data.username}, Email=${data.email}`);
        console.log(`Password format: ${data.password.substring(0, 10)}...`);
      } else {
        console.log(`No user found with username: ${username}`);
      }
      
      return data || undefined;
    } catch (error) {
      console.log(`Exception while getting user: ${error}`);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        log(`فشل في الحصول على المستخدم: ${error.message}`);
        return undefined;
      }
      return data || undefined;
    } catch (error) {
      log(`فشل في الحصول على المستخدم: ${error}`);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) throw new Error(`فشل في الحصول على المستخدمين: ${error.message}`);
    return data || [];
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

  async getFeaturedProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('isFeatured', true);

    if (error) throw new Error(`فشل في الحصول على المنتجات المميزة: ${error.message}`);
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

  async deleteProduct(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`فشل في حذف المنتج: ${error.message}`);
    return true;
  }

  // سلة التسوق
  async getCartByUserId(userId: number): Promise<Cart | undefined> {
    const { data, error } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`فشل في الحصول على سلة التسوق: ${error.message}`);
    }

    if (!data) {
      // إنشاء سلة جديدة إذا لم تكن موجودة
      return this.createCart(userId);
    }

    // استرجاع معلومات المنتجات المرتبطة بالسلة
    const cartItems = ensureCartItems(data.items);
    for (const item of cartItems) {
      const product = await this.getProduct(item.productId);
      if (product) {
        item.product = product;
      }
    }

    return data;
  }

  private async createCart(userId: number): Promise<Cart> {
    const { data, error } = await supabase
      .from('carts')
      .insert([{
        user_id: userId,
        items: []
      }])
      .select()
      .single();

    if (error) throw new Error(`فشل في إنشاء سلة التسوق: ${error.message}`);
    return data;
  }

  async addToCart(userId: number, productId: number, quantity: number): Promise<Cart> {
    let cart = await this.getCartByUserId(userId);
    if (!cart) {
      cart = await this.createCart(userId);
    }

    const items = ensureCartItems(cart.items);
    const existingItemIndex = items.findIndex(item => item.productId === productId);

    if (existingItemIndex !== -1) {
      items[existingItemIndex].quantity += quantity;
    } else {
      const product = await this.getProduct(productId);
      if (!product) throw new Error('المنتج غير موجود');

      items.push({
        productId,
        quantity,
        product
      });
    }

    const { data, error } = await supabase
      .from('carts')
      .update({ items })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`فشل في تحديث سلة التسوق: ${error.message}`);
    return data;
  }

  async removeFromCart(userId: number, productId: number): Promise<Cart> {
    const cart = await this.getCartByUserId(userId);
    if (!cart) throw new Error('سلة التسوق غير موجودة');

    const items = cart.items as CartItem[];
    const updatedItems = items.filter(item => item.productId !== productId);

    const { data, error } = await supabase
      .from('carts')
      .update({ items: updatedItems })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`فشل في حذف المنتج من سلة التسوق: ${error.message}`);
    return data;
  }

  async updateCartItemQuantity(userId: number, productId: number, quantity: number): Promise<Cart> {
    const cart = await this.getCartByUserId(userId);
    if (!cart) throw new Error('سلة التسوق غير موجودة');

    const items = cart.items as CartItem[];
    const itemIndex = items.findIndex(item => item.productId === productId);

    if (itemIndex === -1) throw new Error('المنتج غير موجود في سلة التسوق');

    items[itemIndex].quantity = quantity;

    const { data, error } = await supabase
      .from('carts')
      .update({ items })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`فشل في تحديث كمية المنتج: ${error.message}`);
    return data;
  }

  async clearCart(userId: number): Promise<void> {
    const { error } = await supabase
      .from('carts')
      .update({ items: [] })
      .eq('user_id', userId);

    if (error) throw new Error(`فشل في تفريغ سلة التسوق: ${error.message}`);
  }

  // الطلبات
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

  async getAllOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*');

    if (error) throw new Error(`فشل في الحصول على الطلبات: ${error.message}`);
    return data || [];
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId);

    if (error) throw new Error(`فشل في الحصول على طلبات المستخدم: ${error.message}`);
    return data || [];
  }

  async createOrder(userId: number, shippingAddress: any): Promise<Order> {
    const cart = await this.getCartByUserId(userId);
    if (!cart) throw new Error('سلة التسوق غير موجودة');
    
    const items = ensureCartItems(cart.items);
    if (items.length === 0) throw new Error('سلة التسوق فارغة');

    const total = items.reduce((sum, item) => {
      const price = item.product.salePrice || item.product.price;
      return sum + (price * item.quantity);
    }, 0);

    const { data, error } = await supabase
      .from('orders')
      .insert([{
        user_id: userId,
        email: 'customer@example.com', // This should be dynamically set based on user
        items,
        total,
        status: 'pending',
        shipping_address: shippingAddress
      }])
      .select()
      .single();

    if (error) throw new Error(`فشل في إنشاء الطلب: ${error.message}`);

    // تفريغ سلة التسوق بعد إنشاء الطلب
    await this.clearCart(userId);

    return data;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`فشل في تحديث حالة الطلب: ${error.message}`);
    return data;
  }

  // تهيئة المنتجات الافتراضية
  private async seedProducts() {
    const products = [
      {
        name: "Crystal Nova Pendant",
        description: "Modern geometric design with premium crystal elements and smart RGB lighting system.",
        price: 1599,
        salePrice: 1299,
        imageUrl: "https://images.unsplash.com/photo-1592833167001-55c6233fc83e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        lightImageUrl: null,
        category: "Pendants",
        tags: ["modern", "crystal", "smart"],
        features: {
          material: "Crystal",
          dimensions: "60cm x 60cm",
          bulbType: "LED",
          smartFeatures: true
        },
        isFeatured: true,
        inStock: true,
        rating: 4.5,
        ratingCount: 42
      },
      // ... المزيد من المنتجات
    ];

    for (const product of products) {
      await this.createProduct(product as Omit<Product, "id" | "createdAt">);
    }
  }
}

export const storage = SupabaseStorage.getInstance();