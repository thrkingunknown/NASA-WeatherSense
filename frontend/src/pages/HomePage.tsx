/**
 * Home Page Component
 *
 * Main page for the weather likelihood application.
 * Orchestrates the query form, results display, and historical trend analysis.
 */

import { useState } from "react";
import "./HomePage.css";
import { WeatherQueryForm } from "../components/weather/WeatherQueryForm";
import { WeatherReportDisplay } from "../components/weather/WeatherReportDisplay";
import { HistoricalTrendChart } from "../components/trends/HistoricalTrendChart";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ErrorMessage } from "../components/common/ErrorMessage";
import type {
  WeatherQuery,
  WeatherReport,
  HistoricalTrend,
  LoadingState,
  ApiError,
} from "../types/weather";
import {
  fetchWeatherReport,
  createHistoricalTrendFromData,
} from "../services/weatherApi";

export function HomePage() {
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");
  const [weatherReport, setWeatherReport] = useState<WeatherReport | null>(
    null
  );
  const [temperatureTrend, setTemperatureTrend] =
    useState<HistoricalTrend | null>(null);
  const [rainfallTrend, setRainfallTrend] = useState<HistoricalTrend | null>(
    null
  );
  const [snowfallTrend, setSnowfallTrend] = useState<HistoricalTrend | null>(
    null
  );
  const [error, setError] = useState<ApiError | null>(null);
  const [lastQuery, setLastQuery] = useState<WeatherQuery | null>(null);

  const handleQuerySubmit = async (query: WeatherQuery) => {
    setLoadingState("loading");
    setError(null);
    setWeatherReport(null);
    setTemperatureTrend(null);
    setRainfallTrend(null);
    setSnowfallTrend(null);
    setLastQuery(query); // Save query for retry

    // Create abort controller for cleanup
    let isMounted = true;

    try {
      // Fetch weather report (includes ALL data including graphs)
      console.log("[HomePage] Fetching weather report...");
      const report = await fetchWeatherReport(query);

      // Only update state if component is still mounted
      if (!isMounted) return;

      setWeatherReport(report);

      // Set loading to success immediately after getting the report
      // This shows the UI right away instead of waiting for graph processing
      setLoadingState("success");

      // Extract historical trends from the data we already have
      // No additional API calls needed!
      console.log("[HomePage] Extracting historical trends from response...");
      if (report.geminiData) {
        const location =
          report.query.location.type === "point"
            ? report.query.location.coordinates
            : report.query.location.coordinates[0]; // Use first coord for polygon

        const tempTrend = createHistoricalTrendFromData(
          report.geminiData,
          "temperature",
          location
        );
        if (!isMounted) return;
        setTemperatureTrend(tempTrend);

        const rainTrend = createHistoricalTrendFromData(
          report.geminiData,
          "rainfall",
          location
        );
        if (!isMounted) return;
        setRainfallTrend(rainTrend);

        const snowTrend = createHistoricalTrendFromData(
          report.geminiData,
          "snowfall",
          location
        );
        if (!isMounted) return;
        setSnowfallTrend(snowTrend);
      }

      console.log("[HomePage] All data loaded successfully!");
    } catch (err) {
      // Only update state if component is still mounted
      if (!isMounted) return;

      setError(err as ApiError);
      setLoadingState("error");
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  };

  return (
    <div className="home-page">
      <header className="page-header">
        <img
          src="\Colorway=2-Color White@3x.png"
          alt="NASA Logo"
          className="nasa-logo"
          aria-label="NASA Logo"
          width={296}
          height={110}
        />
        <h1>WeatherSense</h1>
        <p className="tagline">Weather likelihood assessment</p>
      </header>

      <main className="page-content">
        {/* Weather Query Form */}
        {loadingState !== "success" && (
          <WeatherQueryForm
            onSubmit={handleQuerySubmit}
            isLoading={loadingState === "loading"}
          />
        )}

        {/* Loading state */}
        {loadingState === "loading" && (
          <LoadingSpinner
            message="Analyzing weather data (this may take up to 60 seconds)..."
            size="large"
          />
        )}

        {/* Error state */}
        {loadingState === "error" && error && (
          <ErrorMessage
            error={error}
            onRetry={lastQuery ? () => handleQuerySubmit(lastQuery) : undefined}
            onDismiss={() => {
              setLoadingState("idle");
              setError(null);
            }}
          />
        )}

        {/* Success state */}
        {loadingState === "success" && weatherReport && (
          <div className="results-section">
            <div className="results-header">
              <h2>Weather Likelihood Report</h2>
              <button
                onClick={() => {
                  setLoadingState("idle");
                  setWeatherReport(null);
                  setTemperatureTrend(null);
                  setRainfallTrend(null);
                  setSnowfallTrend(null);
                  setError(null);
                }}
                className="btn-new-query"
              >
                🔄 New Query
              </button>
            </div>

            {/* Enhanced Weather Report Display */}
            <WeatherReportDisplay report={weatherReport} />

            {/* Historical Trend Charts */}
            <div className="trends-section">
              <h2 className="trends-title">📊 Historical Trends (5 Years)</h2>

              {temperatureTrend && (
                <div className="trend-chart-wrapper">
                  <HistoricalTrendChart trend={temperatureTrend} />
                </div>
              )}

              {rainfallTrend && (
                <div className="trend-chart-wrapper">
                  <HistoricalTrendChart trend={rainfallTrend} />
                </div>
              )}

              {snowfallTrend && (
                <div className="trend-chart-wrapper">
                  <HistoricalTrendChart trend={snowfallTrend} />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
