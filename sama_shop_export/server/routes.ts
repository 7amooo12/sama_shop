import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { setupAuth } from "./auth";
import { storage } from "./supabase-storage";
import { User } from "../shared/schema";

export async function registerRoutes(app: express.Express) {
  // إعداد الجلسة
  const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 ساعة
    },
  });
  
  app.use(sessionMiddleware);
  
  // إعداد Passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: "اسم المستخدم غير صحيح" });
        }
        
        const isValid = await setupAuth().verifyPassword(password, user.password);
        
        if (!isValid) {
          return done(null, false, { message: "كلمة المرور غير صحيحة" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  
  // API routes
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, email, firstName, lastName } = req.body;
      
      if (!username || !password || !email) {
        return res.status(400).json({ message: "اسم المستخدم وكلمة المرور والبريد الإلكتروني مطلوبة" });
      }
      
      // التحقق من وجود المستخدم
      const existingUser = await storage.getUserByUsername(username);
      
      if (existingUser) {
        return res.status(400).json({ message: "اسم المستخدم موجود بالفعل" });
      }
      
      // تشفير كلمة المرور
      const hashedPassword = await setupAuth().hashPassword(password);
      
      // إنشاء المستخدم
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        isAdmin: false
      });
      
      // تسجيل الدخول تلقائيًا بعد التسجيل
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "خطأ في تسجيل الدخول" });
        }
        
        return res.status(201).json({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin
        });
      });
    } catch (error) {
      res.status(500).json({ message: "خطأ في التسجيل" });
    }
  });
  
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    const user = req.user as User;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin
    });
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "تم تسجيل الخروج بنجاح" });
    });
  });
  
  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as User;
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin
      });
    } else {
      res.status(401).json({ message: "غير مصرح" });
    }
  });
  
  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const category = req.query.category as string;
      const featured = req.query.featured === "true";
      
      let products;
      
      if (category) {
        products = await storage.getProductsByCategory(category);
      } else if (featured) {
        products = await storage.getFeaturedProducts();
      } else {
        products = await storage.getAllProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب المنتجات" });
    }
  });
  
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب المنتج" });
    }
  });
  
  // Admin Products routes
  app.post("/api/admin/products", async (req, res) => {
    if (!req.isAuthenticated() || !(req.user as User).isAdmin) {
      return res.status(403).json({ message: "غير مصرح" });
    }
    
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: "خطأ في إنشاء المنتج" });
    }
  });
  
  app.put("/api/admin/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || !(req.user as User).isAdmin) {
      return res.status(403).json({ message: "غير مصرح" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const product = await storage.updateProduct(id, req.body);
      
      if (!product) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "خطأ في تحديث المنتج" });
    }
  });
  
  app.delete("/api/admin/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || !(req.user as User).isAdmin) {
      return res.status(403).json({ message: "غير مصرح" });
    }
    
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "خطأ في حذف المنتج" });
    }
  });
  
  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      const cart = await storage.getCart((req.user as User).id);
      res.json(cart || { items: [] });
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب سلة التسوق" });
    }
  });
  
  app.post("/api/cart", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      const { productId, quantity } = req.body;
      
      if (!productId || !quantity || quantity < 1) {
        return res.status(400).json({ message: "المنتج أو الكمية غير صالحة" });
      }
      
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "المنتج غير موجود" });
      }
      
      const cart = await storage.addToCart((req.user as User).id, productId, quantity);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: "خطأ في إضافة المنتج إلى سلة التسوق" });
    }
  });
  
  app.delete("/api/cart/:productId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      const productId = parseInt(req.params.productId);
      const cart = await storage.removeFromCart((req.user as User).id, productId);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: "خطأ في إزالة المنتج من سلة التسوق" });
    }
  });
  
  // Orders routes
  app.get("/api/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      const orders = await storage.getUserOrders((req.user as User).id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الطلبات" });
    }
  });
  
  app.post("/api/orders", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "غير مصرح" });
      }
      
      const { shippingAddress } = req.body;
      
      if (!shippingAddress) {
        return res.status(400).json({ message: "عنوان الشحن مطلوب" });
      }
      
      const order = await storage.createOrder((req.user as User).id, shippingAddress);
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: "خطأ في إنشاء الطلب" });
    }
  });
  
  // Admin Orders routes
  app.get("/api/admin/orders", async (req, res) => {
    if (!req.isAuthenticated() || !(req.user as User).isAdmin) {
      return res.status(403).json({ message: "غير مصرح" });
    }
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "خطأ في جلب الطلبات" });
    }
  });
  
  app.put("/api/admin/orders/:id", async (req, res) => {
    if (!req.isAuthenticated() || !(req.user as User).isAdmin) {
      return res.status(403).json({ message: "غير مصرح" });
    }
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "الحالة مطلوبة" });
      }
      
      const order = await storage.updateOrderStatus(id, status);
      
      if (!order) {
        return res.status(404).json({ message: "الطلب غير موجود" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "خطأ في تحديث حالة الطلب" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
