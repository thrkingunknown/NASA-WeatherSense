import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/config";
import {
  WeatherQuery,
  WeatherResponse,
  VisualCrossingData,
} from "../types/weather.types";
import { StatisticalForecast } from "./visualcrossing.service";

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

export class GeminiService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    });
  }

  async getWeatherAnalysis(
    query: WeatherQuery,
    vcForecast?: StatisticalForecast
  ): Promise<WeatherResponse> {
    try {
      console.log(
        `[Gemini] Generating analysis for lat:${query.latitude}, lon:${query.longitude}, date:${query.date}`
      );

      const prompt = this.buildPrompt(query, vcForecast);

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

      let jsonText = text.trim();

      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/^```json\s*\n/, "").replace(/\n```$/, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```\s*\n/, "").replace(/\n```$/, "");
      }

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(jsonText);
      } catch (parseError) {
        console.error("[Gemini] Failed to parse JSON response:");
        console.error("[Gemini] Raw response text:", jsonText);
        console.error("[Gemini] Parse error:", parseError);
        throw new Error("Gemini returned invalid JSON. Please try again.");
      }

      if (
        !parsedResponse.overall_comfortability_score ||
        !parsedResponse.activities
      ) {
        console.error("[Gemini] Invalid response structure:", parsedResponse);
        throw new Error("Invalid response structure from Gemini");
      }

      if (vcForecast) {
        const targetDay = vcForecast.current || vcForecast.forecast;
        if (targetDay) {
          parsedResponse.visual_crossing_data = {
            source: "Visual Crossing Weather API",
            location: vcForecast.location,
            actualData: {
              temperature: targetDay.temp,
              temperatureMax: targetDay.tempmax,
              temperatureMin: targetDay.tempmin,
              feelsLike: targetDay.feelslike,
              humidity: targetDay.humidity,
              precipitation: targetDay.precip,
              precipitationProbability: targetDay.precipprob,
              snow: targetDay.snow,
              snowDepth: targetDay.snowdepth,
              windSpeed: targetDay.windspeed,
              windGust: targetDay.windgust,
              cloudCover: targetDay.cloudcover,
              uvIndex: targetDay.uvindex,
              visibility: targetDay.visibility,
              pressure: targetDay.pressure,
              conditions: targetDay.conditions,
              description: targetDay.description,
            },
            historicalAverages: vcForecast.historicalData.monthlyAverages,
            statistics: vcForecast.statistics,
          };
        }
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

  private buildPrompt(
    query: WeatherQuery,
    vcForecast?: StatisticalForecast
  ): string {
    const { latitude, longitude, date } = query;
    let vcDataContext = "";
    if (vcForecast) {
      const targetDay = vcForecast.current || vcForecast.forecast;
      const dataType = vcForecast.current ? "CURRENT/HISTORICAL" : "FORECAST";

      if (targetDay) {
        vcDataContext = `

REAL WEATHER DATA FROM VISUAL CROSSING API (${dataType} DATA):
Location: ${vcForecast.location.address}
Coordinates: ${vcForecast.location.latitude}, ${vcForecast.location.longitude}

CURRENT/FORECAST CONDITIONS:
- Temperature: ${targetDay.temp}°C (Min: ${targetDay.tempmin}°C, Max: ${targetDay.tempmax}°C)
- Feels Like: ${targetDay.feelslike}°C
- Humidity: ${targetDay.humidity}%
- Precipitation: ${targetDay.precip}mm (Probability: ${targetDay.precipprob}%)
- Snow: ${targetDay.snow}cm (Depth: ${targetDay.snowdepth}cm)
- Wind Speed: ${targetDay.windspeed} km/h (Gusts: ${targetDay.windgust} km/h)
- Cloud Cover: ${targetDay.cloudcover}%
- UV Index: ${targetDay.uvindex}
- Visibility: ${targetDay.visibility} km
- Pressure: ${targetDay.pressure} mb
- Conditions: ${targetDay.conditions}
- Description: ${targetDay.description}

HISTORICAL AVERAGES (Past 5 Years):
- Average Temperature: ${vcForecast.historicalData.monthlyAverages.temperature}°C
- Average Precipitation: ${vcForecast.historicalData.monthlyAverages.precipitation}mm
- Average Humidity: ${vcForecast.historicalData.monthlyAverages.humidity}%
- Average Wind Speed: ${vcForecast.historicalData.monthlyAverages.windspeed} km/h

STATISTICAL ANALYSIS:
Temperature Statistics:
- Mean: ${vcForecast.statistics.temperatureStats.mean}°C
- Min (5yr): ${vcForecast.statistics.temperatureStats.min}°C
- Max (5yr): ${vcForecast.statistics.temperatureStats.max}°C
- Std Dev: ${vcForecast.statistics.temperatureStats.standardDeviation}°C

Precipitation Statistics:
- Mean: ${vcForecast.statistics.precipitationStats.totalMean}mm
- Probability: ${vcForecast.statistics.precipitationStats.probability}%
- Max Recorded: ${vcForecast.statistics.precipitationStats.maxRecorded}mm

Trends:
- Temperature Trend: ${vcForecast.statistics.trends.temperatureTrend}
- Precipitation Trend: ${vcForecast.statistics.trends.precipitationTrend}

USE THIS REAL DATA as the primary source for your analysis. Ensure your specific_variables match this data closely. You can supplement with additional NASA/MERRA-2/ERA5 data for air quality, dust concentration, and other environmental factors not provided by Visual Crossing.
`;
      }
    }

    const customInstructions = `
AI Agent System Instructions
You are a specialized AI agent designed to provide detailed weather and environmental data. Your sole function is to process a JSON input containing geographic coordinates and a date, and return a clean, minified JSON output with comprehensive data. You must not output any text, explanation, or characters outside of the final JSON object.
Core Directives:
Input Processing: You will receive a JSON object with latitude, longitude, and a date.
Output Format: Your entire response must be a single, valid JSON object. Do not include any introductory text, markdown formatting, or conversational elements.

CRITICAL JSON RULES:
- NEVER output a property without a value (e.g., "property":, is INVALID)
- ALWAYS provide a valid value for every property (use null, [], or 0 if no data available)
- NEVER use trailing commas before closing braces or brackets
- Ensure all arrays have at least empty brackets []
- Ensure all strings are properly quoted
- The output must pass JSON.parse() without errors
${vcDataContext}
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
    "year_minus_5": [15.2, 23.5, 28.9, 18.7],
    "year_minus_4": [14.8, 24.1, 29.2, 19.1],
    "year_minus_3": [15.5, 23.8, 28.5, 18.3],
    "year_minus_2": [15.9, 24.5, 29.8, 19.5],
    "year_minus_1": [15.1, 23.2, 28.1, 18.9]
  },
  "rain_graph_data": {
    "description": "Quarterly total rainfall in mm for the past 5 years. Each year contains [Q1_total, Q2_total, Q3_total, Q4_total].",
    "year_minus_5": [120, 80, 45, 95],
    "year_minus_4": [135, 75, 50, 105],
    "year_minus_3": [110, 85, 40, 90],
    "year_minus_2": [125, 90, 55, 100],
    "year_minus_1": [130, 70, 48, 110]
  },
  "snow_graph_data": {
    "description": "Quarterly total snowfall in cm for the past 5 years. Each year contains [Q1_total, Q2_total, Q3_total, Q4_total].",
    "year_minus_5": [0, 0, 0, 0],
    "year_minus_4": [0, 0, 0, 0],
    "year_minus_3": [0, 0, 0, 0],
    "year_minus_2": [0, 0, 0, 0],
    "year_minus_1": [0, 0, 0, 0]
  }
}

CRITICAL INSTRUCTIONS FOR GRAPH DATA:
- The graph data arrays MUST contain actual numerical values, NOT empty arrays
- Each year array must have EXACTLY 4 numbers representing quarterly data: [Q1, Q2, Q3, Q4]
- Q1 = Jan-Mar, Q2 = Apr-Jun, Q3 = Jul-Sep, Q4 = Oct-Dec
- Use historical climate data for the specified location to populate these arrays
- If no snow occurs in this location, use [0, 0, 0, 0] for all snow years
- Example valid format: "year_minus_1": [15.2, 23.5, 28.9, 18.7]
- NEVER return empty arrays like "year_minus_1": []

Generate the weather analysis now for:
- Latitude: ${latitude}
- Longitude: ${longitude}
- Date: ${date}

IMPORTANT: 
1. Return ONLY the JSON object, no other text. 
2. Be concise but accurate.
3. EVERY property MUST have a valid value - ESPECIALLY graph data arrays must have 4 numbers each
4. NEVER output incomplete properties like "property":, or "property":}
5. Graph arrays must have exactly 4 numerical values: [Q1, Q2, Q3, Q4]
6. Your response must be parseable by JSON.parse() without any errors.`;

    return customInstructions;
  }
}

export const geminiService = new GeminiService();
