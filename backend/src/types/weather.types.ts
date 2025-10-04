export interface WeatherQuery {
  latitude: string;
  longitude: string;
  date: string;
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

export interface WeatherResponse {
  request_parameters: RequestParameters;
  overall_comfortability_score: ComfortabilityScore;
  activities: Activities;
  weather_conditions: WeatherConditions;
  statistical_analysis: StatisticalAnalysis;
  temperature_graph_data: GraphData;
  rain_graph_data: GraphData;
  snow_graph_data: GraphData;
}
