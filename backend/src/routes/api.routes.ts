import { Router } from "express";
import { weatherController } from "../controllers/weather.controller";

const router = Router();

router.get("/weather", (req, res) =>
  weatherController.getWeatherAnalysis(req, res)
);

router.get("/health", (req, res) => weatherController.healthCheck(req, res));

export default router;
