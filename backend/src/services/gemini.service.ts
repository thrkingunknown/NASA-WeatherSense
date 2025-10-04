import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/config";
import { WeatherQuery, WeatherResponse } from "../types/weather.types";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.geminiApiKey);

export class GeminiService {
  private model;

  constructor() {
    // Using gemini-1.5-pro model for better JSON responses
    this.model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });
  }

  /**
   * Generate weather analysis using Gemini API
   */
  async getWeatherAnalysis(query: WeatherQuery): Promise<WeatherResponse> {
    try {
      console.log(
        `[Gemini] Generating analysis for lat:${query.latitude}, lon:${query.longitude}, date:${query.date}`
      );

      const prompt = this.buildPrompt(query);

      // Add timeout wrapper (60 seconds max)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("Gemini API timeout after 60 seconds")),
          60000
        );
      });

      const contentPromise = this.model.generateContent(prompt);

      const result = await Promise.race([contentPromise, timeoutPromise]);
      const response = await result.response;
      const text = response.text();

      console.log("[Gemini] Successfully received response");

      // Parse the JSON response
      const parsedResponse = JSON.parse(text);

      // Validate response has required fields
      if (
        !parsedResponse.overall_comfortability_score ||
        !parsedResponse.activities
      ) {
        console.error("[Gemini] Invalid response structure:", parsedResponse);
        throw new Error("Invalid response structure from Gemini");
      }

      return parsedResponse as WeatherResponse;
    } catch (error) {
      console.error("Error calling Gemini API:", error);

      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Failed to get weather analysis from Gemini");
    }
  }

  /**
   * Build the prompt for Gemini API
   *
   * ⚠️ CUSTOMIZE THIS PROMPT BELOW ⚠️
   * Modify the instructions to change how Gemini generates weather analysis
   */
  private buildPrompt(query: WeatherQuery): string {
    const { latitude, longitude, date } = query;

    // ════════════════════════════════════════════════════════════════
    // 📝 CUSTOM INSTRUCTION SECTION - MODIFY THIS PROMPT AS NEEDED
    // ════════════════════════════════════════════════════════════════

    const customInstructions = `
AI Agent System Instructions
You are a specialized AI agent designed to provide detailed weather and environmental data. Your sole function is to process a JSON input containing geographic coordinates and a date, and return a clean, minified JSON output with comprehensive data. You must not output any text, explanation, or characters outside of the final JSON object.
Core Directives:
Input Processing: You will receive a JSON object with latitude, longitude, and a date.
Output Format: Your entire response must be a single, valid JSON object. Do not include any introductory text, markdown formatting, or conversational elements.
Data Handling:
Past/Present Dates: If the provided date is in the past or is the current date, you must retrieve and provide actual historical or current data.
Future Dates: If the provided date is in the future, you must generate a prediction based on a thorough analysis of historical data, trends, and climatological models for the specified location and time of year.
Thorough Analysis: You must engage in a deep process of thinking, researching, and calculating to ensure the highest accuracy for the requested data. Synthesize information from multiple reliable meteorological and environmental data sources.
Acquire, analyse data from MERRA 2, ERA 5, GES DISC OPeNDAP server (Hyrax), etc...
All likelihood and probabilities in percentage.
Required Output JSON Structure:
Your output must conform to the following structure. Provide a null value for any data point that is not applicable or for which data cannot be found.
{
  "request_parameters": {
    "latitude": "input_latitude",
    "longitude": "input_longitude",
    "date": "input_date"
  },
  "overall_comfortability_score": {
    "score": "A numerical score from 0 (Extremely Uncomfortable) to 100 (Extremely Comfortable)",
    "summary": "A brief summary like 'Pleasant', 'Very Hot', 'Windy and Cold', etc."
  },
  "activities": {
    "suggestions": ["Array of strings with suggestions, e.g., 'Perfect day for a picnic.'"],
    "warnings": ["Array of strings with warnings, e.g., 'High UV index, wear sunscreen.'"],
    "reminders": ["Array of strings with reminders, e.g., 'Don't forget your umbrella.'", "Bring a sweater for the evening."]
  },
  "weather_conditions": {
    "general_conditions": {
      "is_very_hot_percentage": "Percentage from 0 to 100",
      "is_very_cold_percentage": "Percentage from 0 to 100",
      "is_very_windy_percentage": "Percentage from 0 to 100",
      "is_very_wet_percentage": "Percentage from 0 to 100"
    },
    "specific_variables": {
      "temperature_celsius": "Number",
      "rainfall_mm": "Number",
      "windspeed_kph": "Number",
      "dust_concentration_ug_m3": "Number",
      "snowfall_cm": "Number",
      "snow_depth_cm": "Number",
      "cloud_cover_percent": "Number",
      "air_quality_index": "Number",
      "humidity_percent": "Number"
    }
  },
  "statistical_analysis": {
    "threshold_probabilities": [
      {
        "description": "Example: Chance of temperature exceeding 32°C",
        "percentage": "Percentage from 0 to 100"
      }
    ],
    "long_term_mean_comparison": [
      {
        "variable": "temperature_celsius",
        "mean_value": "Historical mean for this time of year",
        "deviation_from_mean": "The deviation of the current/predicted value from the mean"
      }
    ],
    "trend_estimation": {
      "heavy_rain_trend": "Increasing, Decreasing, or Stable",
      "high_temperature_trend": "Increasing, Decreasing, or Stable"
    }
  },
  "temperature_graph_data": {
    "description": "Quarterly average temperatures in Celsius for the past 5 years. Each year contains [Q1_avg, Q2_avg, Q3_avg, Q4_avg].",
    "year_minus_5": [],
    "year_minus_4": [],
    "year_minus_3": [],
    "year_minus_2": [],
    "year_minus_1": []
  },
  "rain_graph_data": {
    "description": "Quarterly total rainfall in mm for the past 5 years. Each year contains [Q1_total, Q2_total, Q3_total, Q4_total].",
    "year_minus_5": [],
    "year_minus_4": [],
    "year_minus_3": [],
    "year_minus_2": [],
    "year_minus_1": []
  },
  "snow_graph_data": {
    "description": "Quarterly total snowfall in cm for the past 5 years. Each year contains [Q1_total, Q2_total, Q3_total, Q4_total].",
    "year_minus_5": [],
    "year_minus_4": [],
    "year_minus_3": [],
    "year_minus_2": [],
    "year_minus_1": []
  }
}

Generate the weather analysis now for:
- Latitude: ${latitude}
- Longitude: ${longitude}
- Date: ${date}

IMPORTANT: Return ONLY the JSON object, no other text. Be concise but accurate.`;

    // ════════════════════════════════════════════════════════════════
    // END OF CUSTOM INSTRUCTION SECTION
    // ════════════════════════════════════════════════════════════════

    return customInstructions;
  }
}

export const geminiService = new GeminiService();
