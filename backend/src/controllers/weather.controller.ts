import { Request, Response } from "express";
import { geminiService } from "../services/gemini.service";
import { WeatherQuery } from "../types/weather.types";

export class WeatherController {
  async getWeatherAnalysis(req: Request, res: Response): Promise<void> {
    try {
      const { latitude, longitude, date } = req.query;

      if (!latitude || !longitude || !date) {
        res.status(400).json({
          error: "Missing required parameters",
          message:
            "Please provide latitude, longitude, and date as query parameters",
          example:
            "/api/weather?latitude=10.726563&longitude=76.290312&date=30-09-2026",
        });
        return;
      }

      if (
        typeof latitude !== "string" ||
        typeof longitude !== "string" ||
        typeof date !== "string"
      ) {
        res.status(400).json({
          error: "Invalid parameter types",
          message: "All parameters must be strings",
        });
        return;
      }

      const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
      if (!dateRegex.test(date)) {
        res.status(400).json({
          error: "Invalid date format",
          message: "Date must be in DD-MM-YYYY format",
          example: "30-09-2026",
        });
        return;
      }

      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      if (isNaN(lat) || lat < -90 || lat > 90) {
        res.status(400).json({
          error: "Invalid latitude",
          message: "Latitude must be a number between -90 and 90",
        });
        return;
      }

      if (isNaN(lon) || lon < -180 || lon > 180) {
        res.status(400).json({
          error: "Invalid longitude",
          message: "Longitude must be a number between -180 and 180",
        });
        return;
      }

      const weatherQuery: WeatherQuery = {
        latitude,
        longitude,
        date,
      };

      console.log("[Controller] Calling Gemini service...");
      const weatherData = await geminiService.getWeatherAnalysis(weatherQuery);
      console.log("[Controller] Gemini service completed successfully");

      res.status(200).json(weatherData);
    } catch (error) {
      console.error("Error in weather controller:", error);

      if (error instanceof Error && error.message.includes("timeout")) {
        res.status(504).json({
          error: "Gateway Timeout",
          message:
            "The AI service took too long to respond. Please try again with a different date or location.",
          details: error.message,
        });
        return;
      }

      res.status(500).json({
        error: "Internal server error",
        message: "Failed to process weather analysis request",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async healthCheck(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "Weather Analysis API",
      version: "1.0.0",
    });
  }
}

export const weatherController = new WeatherController();
