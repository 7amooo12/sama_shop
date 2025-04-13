import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createTables } from "./create-tables";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple logging middleware
app.use((req, _, next) => {
  log(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", time: new Date().toISOString() });
});

// Special endpoint to display setup instructions
app.get("/api/setup-instructions", (req, res) => {
  res.json({
    message: "Your database tables need to be created manually in Supabase",
    instructions: [
      "1. Log into your Supabase dashboard",
      "2. Go to SQL Editor",
      "3. Open the supabase-setup.sql file from this project",
      "4. Run the SQL script in the editor",
      "5. Restart the application"
    ]
  });
});

(async () => {
  try {
    // Check if tables exist in the database
    const tablesResult = await createTables();
    
    if (!tablesResult) {
      log("WARNING: Some database tables might be missing. Please check the setup instructions.");
      log("Visit http://localhost:5000/api/setup-instructions for more information.");
    }

    const server = await registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      log(`Error: ${message}`);
      res.status(status).json({ message });
    });

    // Setup Vite for development
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start the server
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0", // Allow external connections
    }, () => {
      log(`Server running on port ${port}`);
      log("To check API status, visit: http://localhost:5000/health");
      log("For database setup instructions, visit: http://localhost:5000/api/setup-instructions");
    });
  } catch (error) {
    log(`Server startup error: ${error}`);
  }
})();
