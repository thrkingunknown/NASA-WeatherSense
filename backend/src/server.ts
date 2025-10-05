import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import { config } from "./config/config";
import apiRoutes from "./routes/api.routes";

const app: Application = express();

app.use(
  cors({
    origin: config.allowedOrigins.includes("*") ? "*" : config.allowedOrigins,
    credentials: config.allowedOrigins.includes("*") ? false : true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  req.setTimeout(90000);
  res.setTimeout(90000);
  next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

app.use("/api", apiRoutes);

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

app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message || "Something went wrong",
  });
});

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
