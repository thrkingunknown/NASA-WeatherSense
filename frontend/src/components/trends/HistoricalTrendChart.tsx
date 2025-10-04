/**
 * Historical Trend Chart Component
 *
 * Visualizes historical weather data with regression line using Recharts.
 */

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Tooltip as InfoTooltip } from "../common/Tooltip";
import type { HistoricalTrend } from "../../types/weather";
import "./HistoricalTrendChart.css";

interface HistoricalTrendChartProps {
  trend: HistoricalTrend;
}

// Format variable names for display
const variableNames: Record<string, string> = {
  T2M: "Temperature",
  PRECTOT: "Precipitation",
  U10M: "Wind Speed (U)",
  V10M: "Wind Speed (V)",
  QV2M: "Humidity",
  WIND_SPEED: "Wind Speed",
};

// Get unit display
const getUnitDisplay = (variable: string): string => {
  if (variable === "T2M") return "°C";
  if (variable === "PRECTOT") return "mm";
  if (variable.includes("WIND")) return "m/s";
  if (variable === "QV2M") return "g/kg";
  return "";
};

export function HistoricalTrendChart({ trend }: HistoricalTrendChartProps) {
  // Transform data for Recharts
  const chartData = trend.dataPoints.map((point) => ({
    date: `${point.year}-${String(point.month).padStart(2, "0")}-${String(
      point.day
    ).padStart(2, "0")}`,
    year: point.year,
    value: point.value != null ? parseFloat(point.value.toFixed(2)) : 0,
  }));

  const variableName = variableNames[trend.variable] || trend.variable;
  const unit = getUnitDisplay(trend.variable);

  // Trend direction indicator
  const getTrendIcon = () => {
    if (trend.trendDirection === "increasing") return "📈";
    if (trend.trendDirection === "decreasing") return "📉";
    return "➡️";
  };

  const getTrendColor = () => {
    if (trend.trendDirection === "increasing") return "#ff6b6b";
    if (trend.trendDirection === "decreasing") return "#4facfe";
    return "#ffd700";
  };

  return (
    <div className="historical-trend-chart">
      {/* Chart Header */}
      <div className="chart-header">
        <div className="chart-title-section">
          <h3 className="chart-title">{variableName} Historical Trend</h3>
          <p className="chart-subtitle">
            {trend.dateRange.start} to {trend.dateRange.end}
          </p>
        </div>

        <div className="trend-indicator">
          <span className="trend-icon">{getTrendIcon()}</span>
          <div className="trend-info">
            <span
              className="trend-direction"
              style={{ color: getTrendColor() }}
            >
              {trend.trendDirection.toUpperCase()}
            </span>
            <span className="trend-magnitude">
              {trend.trendMagnitude} trend
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="year"
            stroke="#666"
            tick={{ fontSize: 12 }}
            label={{ value: "Year", position: "insideBottom", offset: -10 }}
          />
          <YAxis
            stroke="#666"
            tick={{ fontSize: 12 }}
            label={{
              value: `${variableName} (${unit})`,
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="line" />

          {/* Mean reference line */}
          <ReferenceLine
            y={trend.statistics.mean}
            stroke="#999"
            strokeDasharray="5 5"
            label={{
              value: "Mean",
              position: "insideTopRight",
              fill: "#666",
              fontSize: 12,
              offset: 10,
            }}
          />

          {/* Actual data line */}
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0066cc"
            strokeWidth={2}
            dot={{ r: 3, fill: "#0066cc" }}
            activeDot={{ r: 6 }}
            name="Historical Data"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Statistics Summary */}
      <div className="statistics-summary">
        <div className="stat-card">
          <div className="stat-label">
            <InfoTooltip content="The average value of all data points in the analysis period.">
              Mean
            </InfoTooltip>
          </div>
          <div className="stat-value">
            {trend.statistics.mean != null
              ? trend.statistics.mean.toFixed(2)
              : "N/A"}{" "}
            {unit}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <InfoTooltip content="The middle value when all measurements are sorted from lowest to highest.">
              Median
            </InfoTooltip>
          </div>
          <div className="stat-value">
            {trend.statistics.median != null
              ? trend.statistics.median.toFixed(2)
              : "N/A"}{" "}
            {unit}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <InfoTooltip content="Standard Deviation measures how spread out the values are from the average. Higher values mean more variability.">
              Std Dev
            </InfoTooltip>
          </div>
          <div className="stat-value">
            {trend.statistics.stdDev != null
              ? trend.statistics.stdDev.toFixed(2)
              : "N/A"}{" "}
            {unit}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <InfoTooltip content="10% of historical values were below this threshold. Useful for identifying unusually low values.">
              10th Percentile
            </InfoTooltip>
          </div>
          <div className="stat-value">
            {trend.statistics.percentile10 != null
              ? trend.statistics.percentile10.toFixed(2)
              : "N/A"}{" "}
            {unit}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            <InfoTooltip content="90% of historical values were below this threshold. Useful for identifying unusually high values.">
              90th Percentile
            </InfoTooltip>
          </div>
          <div className="stat-value">
            {trend.statistics.percentile90 != null
              ? trend.statistics.percentile90.toFixed(2)
              : "N/A"}{" "}
            {unit}
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="trend-interpretation">
        <h4>Analysis</h4>
        <p>{trend.interpretation}</p>
      </div>
    </div>
  );
}
