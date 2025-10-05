import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  visualCrossingApiKey: process.env.VISUAL_CROSSING_API_KEY || "",
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:5173",
  ],
  nodeEnv: process.env.NODE_ENV || "development",
};

if (!config.geminiApiKey) {
  console.error("ERROR: GEMINI_API_KEY is not set in environment variables");
  console.error("Please create a .env file based on .env.example");
  process.exit(1);
}

if (!config.visualCrossingApiKey) {
  console.error(
    "ERROR: VISUAL_CROSSING_API_KEY is not set in environment variables"
  );
  console.error("Please add VISUAL_CROSSING_API_KEY to your .env file");
  console.error(
    "Get your free API key from: https://www.visualcrossing.com/weather-api"
  );
  process.exit(1);
}
