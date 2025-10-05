import axios from "axios";
import { config } from "../config/config";

export interface VisualCrossingDay {
  datetime: string;
  tempmax: number;
  tempmin: number;
  temp: number;
  feelslikemax: number;
  feelslikemin: number;
  feelslike: number;
  dew: number;
  humidity: number;
  precip: number;
  precipprob: number;
  precipcover: number;
  preciptype: string[] | null;
  snow: number;
  snowdepth: number;
  windgust: number;
  windspeed: number;
  winddir: number;
  pressure: number;
  cloudcover: number;
  visibility: number;
  solarradiation: number;
  solarenergy: number;
  uvindex: number;
  sunrise: string;
  sunset: string;
  moonphase: number;
  conditions: string;
  description: string;
  icon: string;
  stations: string[] | null;
}

export interface VisualCrossingResponse {
  queryCost: number;
  latitude: number;
  longitude: number;
  resolvedAddress: string;
  address: string;
  timezone: string;
  tzoffset: number;
  description: string;
  days: VisualCrossingDay[];
}

export interface StatisticalForecast {
  date: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  current: VisualCrossingDay | null;
  forecast: VisualCrossingDay | null;
  historicalData: {
    past5Years: VisualCrossingDay[];
    monthlyAverages: {
      temperature: number;
      precipitation: number;
      humidity: number;
      windspeed: number;
    };
  };
  statistics: {
    temperatureStats: {
      mean: number;
      min: number;
      max: number;
      standardDeviation: number;
    };
    precipitationStats: {
      totalMean: number;
      probability: number;
      maxRecorded: number;
    };
    trends: {
      temperatureTrend: string;
      precipitationTrend: string;
    };
  };
}

export class VisualCrossingService {
  private baseUrl =
    "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";
  private apiKey: string;

  constructor() {
    this.apiKey = config.visualCrossingApiKey;
  }

  private parseDateString(dateStr: string): string {
    const [day, month, year] = dateStr.split("-");
    return `${year}-${month}-${day}`;
  }

  private async fetchWeatherData(
    latitude: string,
    longitude: string,
    startDate: string,
    endDate?: string
  ): Promise<VisualCrossingResponse> {
    try {
      const location = `${latitude},${longitude}`;
      const dateRange = endDate ? `${startDate}/${endDate}` : startDate;
      const url = `${this.baseUrl}/${location}/${dateRange}`;

      console.log(`[VisualCrossing] Fetching data from: ${url}`);

      const response = await axios.get<VisualCrossingResponse>(url, {
        params: {
          key: this.apiKey,
          unitGroup: "metric",
          include: "days,current",
          elements:
            "datetime,tempmax,tempmin,temp,feelslike,feelslikemax,feelslikemin,dew,humidity,precip,precipprob,precipcover,preciptype,snow,snowdepth,windgust,windspeed,winddir,pressure,cloudcover,visibility,solarradiation,solarenergy,uvindex,conditions,description,icon",
          contentType: "json",
        },
        timeout: 30000,
      });

      console.log(
        `[VisualCrossing] Successfully fetched data for ${response.data.days.length} days`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          `[VisualCrossing] API Error: ${error.response?.status} - ${
            error.response?.data?.message || error.message
          }`
        );
        throw new Error(
          `Visual Crossing API error: ${
            error.response?.data?.message || error.message
          }`
        );
      }
      throw error;
    }
  }

  private async getHistoricalData(
    latitude: string,
    longitude: string,
    targetDate: string
  ): Promise<VisualCrossingDay[]> {
    const [year, month, day] = targetDate.split("-");
    const targetYear = parseInt(year);
    const historicalData: VisualCrossingDay[] = [];

    for (let i = 1; i <= 5; i++) {
      const historicalYear = targetYear - i;
      const historicalDate = `${historicalYear}-${month}-${day}`;

      try {
        const data = await this.fetchWeatherData(
          latitude,
          longitude,
          historicalDate
        );
        if (data.days && data.days.length > 0) {
          historicalData.push(data.days[0]);
        }
      } catch (error) {
        console.warn(
          `[VisualCrossing] Could not fetch historical data for ${historicalDate}:`,
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    }

    return historicalData;
  }

  private calculateStatistics(historicalData: VisualCrossingDay[]) {
    if (historicalData.length === 0) {
      return {
        temperatureStats: {
          mean: 0,
          min: 0,
          max: 0,
          standardDeviation: 0,
        },
        precipitationStats: {
          totalMean: 0,
          probability: 0,
          maxRecorded: 0,
        },
        trends: {
          temperatureTrend: "Stable",
          precipitationTrend: "Stable",
        },
      };
    }

    const temps = historicalData.map((d) => d.temp);
    const tempMean = temps.reduce((a, b) => a + b, 0) / temps.length;
    const tempMin = Math.min(...temps);
    const tempMax = Math.max(...temps);
    const tempVariance =
      temps.reduce((sum, t) => sum + Math.pow(t - tempMean, 2), 0) /
      temps.length;
    const tempStdDev = Math.sqrt(tempVariance);

    const precips = historicalData.map((d) => d.precip);
    const precipMean = precips.reduce((a, b) => a + b, 0) / precips.length;
    const precipMax = Math.max(...precips);
    const daysWithPrecip = precips.filter((p) => p > 0).length;
    const precipProbability = (daysWithPrecip / precips.length) * 100;

    const calculateTrend = (values: number[]): string => {
      if (values.length < 2) return "Stable";
      const n = values.length;
      const sumX = ((n - 1) * n) / 2; // 0 + 1 + 2 + ... + (n-1)
      const sumY = values.reduce((a, b) => a + b, 0);
      const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
      const sumX2 = ((n - 1) * n * (2 * n - 1)) / 6; // Sum of squares

      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

      if (slope > 0.1) return "Increasing";
      if (slope < -0.1) return "Decreasing";
      return "Stable";
    };

    return {
      temperatureStats: {
        mean: parseFloat(tempMean.toFixed(2)),
        min: parseFloat(tempMin.toFixed(2)),
        max: parseFloat(tempMax.toFixed(2)),
        standardDeviation: parseFloat(tempStdDev.toFixed(2)),
      },
      precipitationStats: {
        totalMean: parseFloat(precipMean.toFixed(2)),
        probability: parseFloat(precipProbability.toFixed(2)),
        maxRecorded: parseFloat(precipMax.toFixed(2)),
      },
      trends: {
        temperatureTrend: calculateTrend(temps),
        precipitationTrend: calculateTrend(precips),
      },
    };
  }

  async getStatisticalForecast(
    latitude: string,
    longitude: string,
    date: string
  ): Promise<StatisticalForecast> {
    try {
      console.log(
        `[VisualCrossing] Getting statistical forecast for ${latitude}, ${longitude} on ${date}`
      );

      const vcDate = this.parseDateString(date);
      const currentDate = new Date();
      const targetDate = new Date(vcDate);
      const isFuture = targetDate > currentDate;

      const mainData = await this.fetchWeatherData(latitude, longitude, vcDate);

      const historicalData = await this.getHistoricalData(
        latitude,
        longitude,
        vcDate
      );

      const statistics = this.calculateStatistics(historicalData);

      const monthlyAverages = {
        temperature:
          historicalData.length > 0
            ? parseFloat(
                (
                  historicalData.reduce((sum, d) => sum + d.temp, 0) /
                  historicalData.length
                ).toFixed(2)
              )
            : 0,
        precipitation:
          historicalData.length > 0
            ? parseFloat(
                (
                  historicalData.reduce((sum, d) => sum + d.precip, 0) /
                  historicalData.length
                ).toFixed(2)
              )
            : 0,
        humidity:
          historicalData.length > 0
            ? parseFloat(
                (
                  historicalData.reduce((sum, d) => sum + d.humidity, 0) /
                  historicalData.length
                ).toFixed(2)
              )
            : 0,
        windspeed:
          historicalData.length > 0
            ? parseFloat(
                (
                  historicalData.reduce((sum, d) => sum + d.windspeed, 0) /
                  historicalData.length
                ).toFixed(2)
              )
            : 0,
      };

      return {
        date,
        location: {
          latitude: mainData.latitude,
          longitude: mainData.longitude,
          address: mainData.resolvedAddress,
        },
        current: !isFuture && mainData.days[0] ? mainData.days[0] : null,
        forecast: isFuture && mainData.days[0] ? mainData.days[0] : null,
        historicalData: {
          past5Years: historicalData,
          monthlyAverages,
        },
        statistics,
      };
    } catch (error) {
      console.error(
        "[VisualCrossing] Error getting statistical forecast:",
        error
      );
      throw error;
    }
    }
    
  async getExtendedForecast(
    latitude: string,
    longitude: string,
    startDate: string,
    days: number = 15
  ): Promise<VisualCrossingDay[]> {
    try {
      const vcStartDate = this.parseDateString(startDate);
      const endDate = new Date(vcStartDate);
      endDate.setDate(endDate.getDate() + days - 1);
      const vcEndDate = endDate.toISOString().split("T")[0];

      const data = await this.fetchWeatherData(
        latitude,
        longitude,
        vcStartDate,
        vcEndDate
      );

      return data.days;
    } catch (error) {
      console.error("[VisualCrossing] Error getting extended forecast:", error);
      throw error;
    }
  }
}

export const visualCrossingService = new VisualCrossingService();
