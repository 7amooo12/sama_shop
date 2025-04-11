import { users, type User, type InsertUser, products, type Product, type InsertProduct, orders, type Order, type InsertOrder, carts, type Cart, type InsertCart, type CartItem } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

// Memory store for sessions
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Product methods
  getProduct(id: number): Promise<Product | undefined>;
  getAllProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: InsertProduct): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Cart methods
  getCartByUserId(userId: number): Promise<Cart | undefined>;
  addToCart(userId: number, productId: number, quantity: number): Promise<Cart>;
  removeFromCart(userId: number, productId: number): Promise<Cart>;
  updateCartItemQuantity(userId: number, productId: number, quantity: number): Promise<Cart>;
  clearCart(userId: number): Promise<void>;
  
  // Order methods
  getOrder(id: number): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  createOrder(userId: number, shippingAddress: any): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private carts: Map<number, Cart>;
  private orders: Map<number, Order>;
  sessionStore: session.SessionStore;
  
  private userId: number = 1;
  private productId: number = 1;
  private cartId: number = 1;
  private orderId: number = 1;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.carts = new Map();
    this.orders = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Create admin user
    this.createUser({
      username: "admin",
      password: "password", // This will be hashed in auth.ts
      email: "admin@lumina.com",
      firstName: "Admin",
      lastName: "User",
      isAdmin: true,
    });
    
    // Seed with sample products
    this.seedProducts();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(userData: Partial<InsertUser>): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = {
      id,
      username: userData.username!,
      password: userData.password!,
      email: userData.email!,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      isAdmin: userData.isAdmin || false,
      createdAt: now
    };
    
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.isFeatured);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.category.toLowerCase() === category.toLowerCase()
    );
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const now = new Date();
    
    const product: Product = {
      id,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      salePrice: productData.salePrice || null,
      imageUrl: productData.imageUrl,
      category: productData.category,
      tags: productData.tags || [],
      features: productData.features || null,
      isFeatured: productData.isFeatured || false,
      inStock: productData.inStock ?? true,
      rating: productData.rating || 0,
      ratingCount: productData.ratingCount || 0,
      createdAt: now
    };
    
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, productData: InsertProduct): Promise<Product | undefined> {
    const product = this.products.get(id);
    
    if (!product) {
      return undefined;
    }
    
    const updatedProduct: Product = {
      ...product,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      salePrice: productData.salePrice || null,
      imageUrl: productData.imageUrl,
      category: productData.category,
      tags: productData.tags || [],
      features: productData.features || null,
      isFeatured: productData.isFeatured || false,
      inStock: productData.inStock ?? true,
      rating: productData.rating || product.rating,
      ratingCount: productData.ratingCount || product.ratingCount
    };
    
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Cart methods
  async getCartByUserId(userId: number): Promise<Cart | undefined> {
    const carts = Array.from(this.carts.values());
    const cart = carts.find(cart => cart.userId === userId);
    
    if (cart) {
      // Enhance cart items with product details
      const items = cart.items as CartItem[];
      const enhancedItems = [];
      
      for (const item of items) {
        const product = await this.getProduct(item.productId);
        if (product) {
          enhancedItems.push({
            ...item,
            product
          });
        }
      }
      
      return {
        ...cart,
        items: enhancedItems
      };
    }
    
    return undefined;
  }

  async addToCart(userId: number, productId: number, quantity: number): Promise<Cart> {
    let cart = await this.getCartByUserId(userId);
    const now = new Date();
    
    if (!cart) {
      // Create new cart if it doesn't exist
      const id = this.cartId++;
      
      cart = {
        id,
        userId,
        items: [{
          productId,
          quantity,
          product: await this.getProduct(productId)!
        }],
        createdAt: now,
        updatedAt: now
      };
      
      this.carts.set(id, cart);
    } else {
      // Update existing cart
      const items = cart.items as CartItem[];
      const existingItemIndex = items.findIndex(item => item.productId === productId);
      
      if (existingItemIndex !== -1) {
        // Update quantity if item already exists
        items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        items.push({
          productId,
          quantity,
          product: await this.getProduct(productId)!
        });
      }
      
      cart.items = items;
      cart.updatedAt = now;
      
      this.carts.set(cart.id, cart);
    }
    
    return cart;
  }

  async removeFromCart(userId: number, productId: number): Promise<Cart> {
    const cart = await this.getCartByUserId(userId);
    
    if (!cart) {
      throw new Error("Cart not found");
    }
    
    const items = cart.items as CartItem[];
    cart.items = items.filter(item => item.productId !== productId);
    cart.updatedAt = new Date();
    
    this.carts.set(cart.id, cart);
    return cart;
  }

  async updateCartItemQuantity(userId: number, productId: number, quantity: number): Promise<Cart> {
    const cart = await this.getCartByUserId(userId);
    
    if (!cart) {
      throw new Error("Cart not found");
    }
    
    const items = cart.items as CartItem[];
    const item = items.find(item => item.productId === productId);
    
    if (!item) {
      throw new Error("Item not found in cart");
    }
    
    item.quantity = quantity;
    cart.updatedAt = new Date();
    
    this.carts.set(cart.id, cart);
    return cart;
  }

  async clearCart(userId: number): Promise<void> {
    const cart = await this.getCartByUserId(userId);
    
    if (cart) {
      cart.items = [];
      cart.updatedAt = new Date();
      this.carts.set(cart.id, cart);
    }
  }

  // Order methods
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async createOrder(userId: number, shippingAddress: any): Promise<Order> {
    const cart = await this.getCartByUserId(userId);
    const user = await this.getUser(userId);
    
    if (!cart || !cart.items.length) {
      throw new Error("Cart is empty");
    }
    
    // Calculate total
    const items = cart.items as CartItem[];
    const total = items.reduce((sum, item) => {
      const price = item.product.salePrice || item.product.price;
      return sum + (price * item.quantity);
    }, 0);
    
    const id = this.orderId++;
    const now = new Date();
    
    const order: Order = {
      id,
      userId,
      email: user!.email,
      total,
      status: "pending",
      shippingAddress,
      items: cart.items,
      createdAt: now
    };
    
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    
    if (!order) {
      return undefined;
    }
    
    order.status = status;
    this.orders.set(id, order);
    
    return order;
  }

  // Seed products
  private seedProducts() {
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

    products.forEach(product => {
      this.createProduct(product);
    });
  }
}

export const storage = new MemStorage();
