import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { config } from "./config/config";
import apiRoutes from "./routes/api.routes";

const app: Application = express();

// ════════════════════════════════════════════════════════════════
// MIDDLEWARE CONFIGURATION
// ════════════════════════════════════════════════════════════════

// Enable CORS
app.use(
  cors({
    origin: config.allowedOrigins,
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Set request timeout to 90 seconds
app.use((req: Request, res: Response, next: NextFunction) => {
  // Set timeout to 90 seconds (90000ms)
  req.setTimeout(90000);
  res.setTimeout(90000);
  next();
});

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ════════════════════════════════════════════════════════════════
// ROUTES
// ════════════════════════════════════════════════════════════════

// API routes
app.use("/api", apiRoutes);

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Weather Analysis API - Powered by Gemini",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      weather: "/api/weather?latitude={lat}&longitude={lon}&date={DD-MM-YYYY}",
    },
    documentation: "See README.md for full API documentation",
  });
});

// ════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ════════════════════════════════════════════════════════════════

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "Something went wrong",
  });
});

// ════════════════════════════════════════════════════════════════
// SERVER START
// ════════════════════════════════════════════════════════════════

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   Weather Analysis API Server                                  ║
║   Powered by Google Gemini AI                                  ║
║                                                                ║
║   🚀 Server running on: http://localhost:${PORT}                ║
║   🌍 Environment: ${config.nodeEnv}                            ║
║   📡 CORS enabled for: ${config.allowedOrigins.join(", ")}     ║
║                                                                ║
║   Endpoints:                                                   ║
║   - GET /api/health                                            ║
║   - GET /api/weather?latitude=X&longitude=Y&date=DD-MM-YYYY    ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});

export default app;
