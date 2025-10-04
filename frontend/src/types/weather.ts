export interface Coordinates {
  lat: number;
  lon: number;
}

export interface PointLocation {
  type: "point";
  coordinates: Coordinates;
  name?: string;
}

export interface PolygonLocation {
  type: "polygon";
  coordinates: Coordinates[];
  name?: string;
  areaSqKm?: number;
}

export type Location = PointLocation | PolygonLocation;

export interface DateQuery {
  month: number;
  day: number;
  year?: number;
}

export interface WeatherQuery {
  location: Location;
  date: DateQuery;
  queryId?: string;
}

export interface RequestParameters {
  latitude: string;
  longitude: string;
  date: string;
}

export interface ComfortabilityScore {
  score: number;
  summary: string;
}

export interface Activities {
  suggestions: string[];
  warnings: string[];
  reminders: string[];
}

export interface GeneralConditions {
  is_very_hot_percentage: number;
  is_very_cold_percentage: number;
  is_very_windy_percentage: number;
  is_very_wet_percentage: number;
}

export interface SpecificVariables {
  temperature_celsius: number;
  rainfall_mm: number;
  windspeed_kph: number;
  dust_concentration_ug_m3: number;
  snowfall_cm: number;
  snow_depth_cm: number;
  cloud_cover_percent: number;
  air_quality_index: number;
  humidity_percent: number;
}

export interface WeatherConditions {
  general_conditions: GeneralConditions;
  specific_variables: SpecificVariables;
}

export interface ThresholdProbability {
  description: string;
  percentage: number;
}

export interface LongTermMeanComparison {
  variable: string;
  mean_value: number;
  deviation_from_mean: string;
}

export interface TrendEstimation {
  heavy_rain_trend: string;
  high_temperature_trend: string;
}

export interface StatisticalAnalysis {
  threshold_probabilities: ThresholdProbability[];
  long_term_mean_comparison: LongTermMeanComparison[];
  trend_estimation: TrendEstimation;
}

export interface GraphData {
  description: string;
  year_minus_5: number[];
  year_minus_4: number[];
  year_minus_3: number[];
  year_minus_2: number[];
  year_minus_1: number[];
}

export interface GeminiWeatherResponse {
  request_parameters: RequestParameters;
  overall_comfortability_score: ComfortabilityScore;
  activities: Activities;
  weather_conditions: WeatherConditions;
  statistical_analysis: StatisticalAnalysis;
  temperature_graph_data: GraphData;
  rain_graph_data: GraphData;
  snow_graph_data: GraphData;
}

export interface WeatherCondition {
  condition: string;
  likelihood: number;
  description: string;
  threshold: number;
  unit: string;
  historicalRange: {
    min: number;
    max: number;
    median: number;
  };
  percentile: number;
  confidence: "low" | "medium" | "high";
}

export interface WeatherReport {
  reportId: string;
  query: {
    location: Location;
    date: DateQuery;
  };
  profile: {
    conditions: WeatherCondition[];
    overallRisk: "low" | "medium" | "high";
    riskFactors: string[];
    summary: string;
  };
  metadata: {
    generatedAt: string;
    dataSource: string;
    dateRange: string;
    yearsAnalyzed: number;
    queryProcessingTimeMs: number;
  };
  geminiData?: GeminiWeatherResponse;
}

export interface DataPoint {
  year: number;
  month: number;
  day: number;
  value: number;
  unit: string;
}

export interface RegressionAnalysis {
  slope: number;
  intercept: number;
  rSquared: number;
}

export interface Statistics {
  mean: number;
  median: number;
  stdDev: number;
  percentile10: number;
  percentile90: number;
}

export interface HistoricalTrend {
  location: Coordinates;
  variable: string;
  timeframe: string;
  dateRange: {
    start: string;
    end: string;
  };
  dataPoints: DataPoint[];
  regression: RegressionAnalysis;
  statistics: Statistics;
  trendDirection: "increasing" | "decreasing" | "stable";
  trendMagnitude: "none" | "weak" | "moderate" | "strong";
  interpretation: string;
  metadata: {
    generatedAt: string;
    dataSource: string;
    pointsCount: number;
  };
}

export interface ApiError {
  error: string;
  message: string;
  statusCode?: number;
  timestamp?: string;
  details?: Record<string, unknown>;
}

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface QueryState {
  status: LoadingState;
  error: ApiError | null;
}
