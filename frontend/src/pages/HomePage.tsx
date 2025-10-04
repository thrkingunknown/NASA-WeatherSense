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
    setLastQuery(query);

    let isMounted = true;

    try {
      console.log("[HomePage] Fetching weather report...");
      const report = await fetchWeatherReport(query);

      if (!isMounted) return;

      setWeatherReport(report);

      setLoadingState("success");

      console.log("[HomePage] Extracting historical trends from response...");
      if (report.geminiData) {
        const location =
          report.query.location.type === "point"
            ? report.query.location.coordinates
            : report.query.location.coordinates[0];

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
      if (!isMounted) return;

      setError(err as ApiError);
      setLoadingState("error");
    }

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
        {loadingState !== "success" && (
          <WeatherQueryForm
            onSubmit={handleQuerySubmit}
            isLoading={loadingState === "loading"}
          />
        )}

        {loadingState === "loading" && (
          <LoadingSpinner
            message="Analyzing weather data (this may take up to 60 seconds)..."
            size="large"
          />
        )}

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

            <WeatherReportDisplay report={weatherReport} />

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
