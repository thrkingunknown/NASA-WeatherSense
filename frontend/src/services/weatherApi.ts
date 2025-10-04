/**
 * Weather API Service
 *
 * Service layer for communicating with the Gemini-powered backend API.
 * Handles HTTP requests, error handling, and data transformation.
 */

import axios, { AxiosError } from "axios";
import type {
  WeatherQuery,
  WeatherReport,
  HistoricalTrend,
  ApiError,
  Coordinates,
  GeminiWeatherResponse,
  WeatherCondition,
  GraphData,
} from "../types/weather";

// Get API base URL from environment variable or default to localhost
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 75000, // 75 seconds (backend has 90s timeout)
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `[API] Requesting: ${config.method?.toUpperCase()} ${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("[API] Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] Success: ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error("[API] Response error:", error.message);
    return Promise.reject(error);
  }
);

/**
 * Transform axios error to ApiError format
 */
function transformError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;

    // Check if we have error response from server
    if (axiosError.response?.data) {
      return axiosError.response.data;
    }

    // Network or timeout error
    if (axiosError.code === "ECONNABORTED") {
      return {
        error: "Request Timeout",
        message:
          "The request took too long to complete. Please try a smaller area or different date.",
        statusCode: 504,
      };
    }

    if (axiosError.code === "ERR_NETWORK") {
      return {
        error: "Network Error",
        message:
          "Unable to connect to the server. Please check your connection and try again.",
        statusCode: 0,
      };
    }

    // Generic axios error
    return {
      error: "Request Failed",
      message: axiosError.message || "An unexpected error occurred",
      statusCode: axiosError.response?.status || 0,
    };
  }

  // Non-axios error
  return {
    error: "Unknown Error",
    message:
      error instanceof Error ? error.message : "An unexpected error occurred",
    statusCode: 0,
  };
}

/**
 * Fetch weather likelihood report for a specific location and date
 * Now powered by Gemini AI
 *
 * @param query - Weather query with location and date
 * @returns Promise<WeatherReport>
 * @throws ApiError
 */
export async function fetchWeatherReport(
  query: WeatherQuery
): Promise<WeatherReport> {
  try {
    // Extract coordinates from location
    const coords =
      query.location.type === "point"
        ? query.location.coordinates
        : query.location.coordinates[0]; // Use first point for polygon

    // Format date as DD-MM-YYYY for the new backend
    const day = String(query.date.day).padStart(2, "0");
    const month = String(query.date.month).padStart(2, "0");
    const year = query.date.year || new Date().getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    // Call the new Gemini backend API
    const response = await apiClient.get<GeminiWeatherResponse>(
      "/api/weather",
      {
        params: {
          latitude: coords.lat.toString(),
          longitude: coords.lon.toString(),
          date: formattedDate,
        },
      }
    );

    const geminiData = response.data;

    // Transform Gemini response to WeatherReport format for frontend compatibility
    const weatherReport: WeatherReport = {
      reportId: `gemini-${Date.now()}`,
      query: {
        location: query.location,
        date: query.date,
      },
      profile: {
        conditions: transformGeminiToConditions(geminiData),
        overallRisk: calculateRiskLevel(
          geminiData.overall_comfortability_score.score
        ),
        riskFactors: geminiData.activities.warnings,
        summary: geminiData.overall_comfortability_score.summary,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        dataSource: "Google Gemini AI",
        dateRange: `Historical analysis for ${formattedDate}`,
        yearsAnalyzed: 5,
        queryProcessingTimeMs: 0,
      },
      geminiData: geminiData,
    };

    return weatherReport;
  } catch (error) {
    throw transformError(error);
  }
}

/**
 * Transform Gemini weather conditions to frontend WeatherCondition format
 */
function transformGeminiToConditions(
  geminiData: GeminiWeatherResponse
): WeatherCondition[] {
  const conditions: WeatherCondition[] = [];
  const { general_conditions, specific_variables } =
    geminiData.weather_conditions;

  // Temperature condition
  if (
    general_conditions.is_very_hot_percentage > 0 ||
    general_conditions.is_very_cold_percentage > 0
  ) {
    conditions.push({
      condition:
        general_conditions.is_very_hot_percentage >
        general_conditions.is_very_cold_percentage
          ? "Very Hot"
          : "Very Cold",
      likelihood: Math.max(
        general_conditions.is_very_hot_percentage,
        general_conditions.is_very_cold_percentage
      ),
      description: `Temperature is expected to be ${specific_variables.temperature_celsius}°C`,
      threshold: specific_variables.temperature_celsius,
      unit: "°C",
      historicalRange: {
        min: specific_variables.temperature_celsius - 5,
        max: specific_variables.temperature_celsius + 5,
        median: specific_variables.temperature_celsius,
      },
      percentile:
        general_conditions.is_very_hot_percentage >
        general_conditions.is_very_cold_percentage
          ? 90
          : 10,
      confidence: "high",
    });
  }

  // Rainfall condition
  if (general_conditions.is_very_wet_percentage > 0) {
    conditions.push({
      condition: "Heavy Rainfall",
      likelihood: general_conditions.is_very_wet_percentage,
      description: `Expected rainfall: ${specific_variables.rainfall_mm}mm`,
      threshold: specific_variables.rainfall_mm,
      unit: "mm",
      historicalRange: {
        min: 0,
        max: specific_variables.rainfall_mm * 2,
        median: specific_variables.rainfall_mm,
      },
      percentile: 90,
      confidence: "high",
    });
  }

  // Wind condition
  if (general_conditions.is_very_windy_percentage > 0) {
    conditions.push({
      condition: "Very Windy",
      likelihood: general_conditions.is_very_windy_percentage,
      description: `Wind speed: ${specific_variables.windspeed_kph} km/h`,
      threshold: specific_variables.windspeed_kph,
      unit: "km/h",
      historicalRange: {
        min: 0,
        max: specific_variables.windspeed_kph * 1.5,
        median: specific_variables.windspeed_kph,
      },
      percentile: 90,
      confidence: "high",
    });
  }

  // Add humidity as a condition if significant
  if (specific_variables.humidity_percent > 70) {
    conditions.push({
      condition: "High Humidity",
      likelihood: specific_variables.humidity_percent,
      description: `Humidity: ${specific_variables.humidity_percent}%`,
      threshold: specific_variables.humidity_percent,
      unit: "%",
      historicalRange: {
        min: 30,
        max: 100,
        median: specific_variables.humidity_percent,
      },
      percentile: 75,
      confidence: "high",
    });
  }

  return conditions;
}

/**
 * Calculate risk level based on comfortability score
 */
function calculateRiskLevel(score: number): "low" | "medium" | "high" {
  if (score >= 70) return "low";
  if (score >= 40) return "medium";
  return "high";
}

/**
 * Create historical trend from graph data already in the response
 * Avoids making additional API calls to Gemini
 */
export function createHistoricalTrendFromData(
  geminiData: GeminiWeatherResponse,
  variable: "temperature" | "rainfall" | "snowfall",
  location: Coordinates
): HistoricalTrend {
  // Select the appropriate graph data based on variable
  let graphData: GraphData;
  let unit: string;
  let variableName: string;

  if (variable === "temperature") {
    graphData = geminiData.temperature_graph_data;
    unit = "°C";
    variableName = "Temperature";
  } else if (variable === "rainfall") {
    graphData = geminiData.rain_graph_data;
    unit = "mm";
    variableName = "Rainfall";
  } else {
    graphData = geminiData.snow_graph_data;
    unit = "cm";
    variableName = "Snowfall";
  }

  // Transform quarterly data to data points
  const dataPoints = transformQuarterlyToDataPoints(graphData, unit);

  // Calculate statistics
  const values = dataPoints.map((dp) => dp.value);
  const statistics = calculateStatistics(values);

  // Calculate regression
  const regression = calculateRegression(dataPoints);

  // Determine trend
  const trendDirection =
    regression.slope > 0.1
      ? "increasing"
      : regression.slope < -0.1
      ? "decreasing"
      : "stable";

  const trendMagnitude =
    Math.abs(regression.slope) > 1
      ? "strong"
      : Math.abs(regression.slope) > 0.5
      ? "moderate"
      : Math.abs(regression.slope) > 0.1
      ? "weak"
      : "none";

  const interpretation = `${variableName} shows a ${trendDirection} trend over the past 5 years with ${trendMagnitude} magnitude.`;

  return {
    location,
    variable: variableName,
    timeframe: "5yr",
    dateRange: {
      start: `${new Date().getFullYear() - 5}-01-01`,
      end: `${new Date().getFullYear() - 1}-12-31`,
    },
    dataPoints,
    regression,
    statistics,
    trendDirection,
    trendMagnitude,
    interpretation,
    metadata: {
      generatedAt: new Date().toISOString(),
      dataSource: "Google Gemini AI",
      pointsCount: dataPoints.length,
    },
  };
}

/**
 * Fetch historical weather trend data
 * Now uses Gemini-generated historical data
 *
 * @param location - Coordinates for the location
 * @param variable - Weather variable (temperature, rainfall, snowfall)
 * @param _timeframe - Time period (always uses 5 years from Gemini)
 * @param _startDate - Optional start date (not used with Gemini)
 * @param _endDate - Optional end date (not used with Gemini)
 * @returns Promise<HistoricalTrend>
 * @throws ApiError
 */
export async function fetchHistoricalTrend(
  location: Coordinates,
  variable: string,
  _timeframe?: string,
  _startDate?: string,
  _endDate?: string
): Promise<HistoricalTrend> {
  try {
    // First get the Gemini weather data
    const formattedDate = new Date()
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");

    const response = await apiClient.get<GeminiWeatherResponse>(
      "/api/weather",
      {
        params: {
          latitude: location.lat.toString(),
          longitude: location.lon.toString(),
          date: formattedDate,
        },
      }
    );

    const geminiData = response.data;

    // Select the appropriate graph data based on variable
    let graphData = geminiData.temperature_graph_data;
    let unit = "°C";
    let variableName = "Temperature";

    if (variable.includes("PREC") || variable.toLowerCase().includes("rain")) {
      graphData = geminiData.rain_graph_data;
      unit = "mm";
      variableName = "Rainfall";
    } else if (variable.toLowerCase().includes("snow")) {
      graphData = geminiData.snow_graph_data;
      unit = "cm";
      variableName = "Snowfall";
    }

    // Transform quarterly data to data points
    const dataPoints = transformQuarterlyToDataPoints(graphData, unit);

    // Calculate statistics
    const values = dataPoints.map((dp) => dp.value);
    const statistics = calculateStatistics(values);

    // Calculate regression
    const regression = calculateRegression(dataPoints);

    // Determine trend
    const trendDirection =
      regression.slope > 0.1
        ? "increasing"
        : regression.slope < -0.1
        ? "decreasing"
        : "stable";

    const trendMagnitude =
      Math.abs(regression.slope) > 1
        ? "strong"
        : Math.abs(regression.slope) > 0.5
        ? "moderate"
        : Math.abs(regression.slope) > 0.1
        ? "weak"
        : "none";

    const interpretation = `${variableName} shows a ${trendDirection} trend over the past 5 years with ${trendMagnitude} magnitude.`;

    const historicalTrend: HistoricalTrend = {
      location,
      variable: variableName,
      timeframe: "5yr",
      dateRange: {
        start: `${new Date().getFullYear() - 5}-01-01`,
        end: `${new Date().getFullYear() - 1}-12-31`,
      },
      dataPoints,
      regression,
      statistics,
      trendDirection,
      trendMagnitude,
      interpretation,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataSource: "Google Gemini AI",
        pointsCount: dataPoints.length,
      },
    };

    return historicalTrend;
  } catch (error) {
    throw transformError(error);
  }
}

/**
 * Transform quarterly graph data to individual data points
 */
function transformQuarterlyToDataPoints(
  graphData: {
    year_minus_5: number[];
    year_minus_4: number[];
    year_minus_3: number[];
    year_minus_2: number[];
    year_minus_1: number[];
  },
  unit: string
): Array<{
  year: number;
  month: number;
  day: number;
  value: number;
  unit: string;
}> {
  const dataPoints: Array<{
    year: number;
    month: number;
    day: number;
    value: number;
    unit: string;
  }> = [];
  const currentYear = new Date().getFullYear();
  const years = [
    { data: graphData.year_minus_5, year: currentYear - 5 },
    { data: graphData.year_minus_4, year: currentYear - 4 },
    { data: graphData.year_minus_3, year: currentYear - 3 },
    { data: graphData.year_minus_2, year: currentYear - 2 },
    { data: graphData.year_minus_1, year: currentYear - 1 },
  ];

  years.forEach(({ data, year }) => {
    // Q1 (Jan-Mar) - month 2, day 15
    dataPoints.push({ year, month: 2, day: 15, value: data[0], unit });
    // Q2 (Apr-Jun) - month 5, day 15
    dataPoints.push({ year, month: 5, day: 15, value: data[1], unit });
    // Q3 (Jul-Sep) - month 8, day 15
    dataPoints.push({ year, month: 8, day: 15, value: data[2], unit });
    // Q4 (Oct-Dec) - month 11, day 15
    dataPoints.push({ year, month: 11, day: 15, value: data[3], unit });
  });

  return dataPoints;
}

/**
 * Calculate statistics from values
 */
function calculateStatistics(values: number[]): {
  mean: number;
  median: number;
  stdDev: number;
  percentile10: number;
  percentile90: number;
} {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  const stdDev = Math.sqrt(variance);
  const percentile10 = sorted[Math.floor(sorted.length * 0.1)];
  const percentile90 = sorted[Math.floor(sorted.length * 0.9)];

  return { mean, median, stdDev, percentile10, percentile90 };
}

/**
 * Calculate linear regression
 */
function calculateRegression(
  dataPoints: Array<{ year: number; month: number; value: number }>
): {
  slope: number;
  intercept: number;
  rSquared: number;
} {
  const n = dataPoints.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;

  dataPoints.forEach((point, index) => {
    const x = index;
    const y = point.value;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared
  const yMean = sumY / n;
  let ssTotal = 0,
    ssResidual = 0;
  dataPoints.forEach((point, index) => {
    const yPred = slope * index + intercept;
    ssTotal += Math.pow(point.value - yMean, 2);
    ssResidual += Math.pow(point.value - yPred, 2);
  });
  const rSquared = 1 - ssResidual / ssTotal;

  return { slope, intercept, rSquared };
}

/**
 * Check if the API is available
 *
 * @returns Promise<boolean>
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await apiClient.get("/api/health", { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}
