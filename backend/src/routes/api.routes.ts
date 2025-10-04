import { Router } from "express";
import { weatherController } from "../controllers/weather.controller";

const router = Router();

/**
 * @route GET /api/weather
 * @desc Get weather analysis for a specific location and date
 * @query latitude - Latitude coordinate (required)
 * @query longitude - Longitude coordinate (required)
 * @query date - Date in DD-MM-YYYY format (required)
 * @example /api/weather?latitude=10.726563&longitude=76.290312&date=30-09-2026
 */
router.get("/weather", (req, res) =>
  weatherController.getWeatherAnalysis(req, res)
);

/**
 * @route GET /api/health
 * @desc Health check endpoint
 */
router.get("/health", (req, res) => weatherController.healthCheck(req, res));

export default router;
