import { WeatherConditionCard } from "./WeatherConditionCard";
import type { WeatherReport } from "../../types/weather";
import "./WeatherReportDisplay.css";

interface WeatherReportDisplayProps {
  report: WeatherReport;
}

const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return "#00e400"; // Good
  if (aqi <= 100) return "#ffff00"; // Moderate
  if (aqi <= 150) return "#ff7e00"; // Unhealthy for Sensitive Groups
  if (aqi <= 200) return "#ff0000"; // Unhealthy
  if (aqi <= 300) return "#8f3f97"; // Very Unhealthy
  return "#7e0023"; // Hazardous
};

const getAQICategory = (aqi: number): string => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

const getAQIDescription = (aqi: number): string => {
  if (aqi <= 50)
    return "Air quality is satisfactory, and air pollution poses little or no risk.";
  if (aqi <= 100)
    return "Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.";
  if (aqi <= 150)
    return "Members of sensitive groups may experience health effects. The general public is less likely to be affected.";
  if (aqi <= 200)
    return "Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.";
  if (aqi <= 300)
    return "Health alert: The risk of health effects is increased for everyone.";
  return "Health warning of emergency conditions: everyone is more likely to be affected.";
};

export function WeatherReportDisplay({ report }: WeatherReportDisplayProps) {
  const formatDate = (date: typeof report.query.date): string => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const month = monthNames[date.month - 1];
    const day = date.day;
    const year = date.year ? `, ${date.year}` : " (Historical Analysis)";

    return `${month} ${day}${year}`;
  };

  const handleExportJSON = () => {
    const { metadata, reportId, ...reportData } = report;

    const jsonString = JSON.stringify(reportData, null, 2);

    const blob = new Blob([jsonString], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const locationName =
      report.query.location.name?.replace(/\s+/g, "_") || "location";
    const dateStr = `${report.query.date.year || "historical"}-${String(
      report.query.date.month
    ).padStart(2, "0")}-${String(report.query.date.day).padStart(2, "0")}`;
    const filename = `weather_report_${locationName}_${dateStr}.json`;

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const comfortabilityScore =
    report.geminiData?.overall_comfortability_score?.score ?? 50;
  const comfortabilitySummary =
    report.geminiData?.overall_comfortability_score?.summary ?? "Moderate";

  const getComfortColor = (score: number): string => {
    if (score >= 75) return "#388e3c";
    if (score >= 50) return "#fbc02d";
    if (score >= 25) return "#f57c00";
    return "#c62828";
  };

  return (
    <div className="weather-report-display">
      <div className="report-summary">
        <div className="summary-header">
          <div className="location-info">
            <h3 className="location-name">
              📍 {report.query.location.name || "Selected Location"}
            </h3>
            {report.query.location.type === "point" && (
              <p className="coordinates">
                {report.query.location.coordinates.lat.toFixed(4)}°N,{" "}
                {report.query.location.coordinates.lon.toFixed(4)}°E
              </p>
            )}
          </div>

          <div className="comfort-score-container">
            <div className="comfort-score">
              <div
                className="comfort-value"
                style={{ color: getComfortColor(comfortabilityScore) }}
              >
                {comfortabilityScore}%
              </div>
              <div className="comfort-label">Comfort Score</div>
              <div className="comfort-summary">{comfortabilitySummary}</div>
            </div>

            <button
              className="export-json-btn"
              onClick={handleExportJSON}
              title="Download weather report as JSON"
            >
              <span className="export-icon">📥</span>
              <span className="export-text">Export JSON</span>
            </button>
          </div>
        </div>

        <div
          className="summary-details"
          style={{
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
            alignContent: "center",
          }}
        >
          <div className="detail-item">
            <span className="detail-icon">📅</span>
            <div className="detail-content">
              <div className="detail-label">Event Date</div>
              <div className="detail-value">
                {formatDate(report.query.date)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="conditions-section">
        <h3 className="section-title">Weather Condition Likelihood</h3>
        <p className="section-description">
          Based on historical data analysis, here's the probability of each
          extreme weather condition occurring:
        </p>

        <div className="conditions-grid">
          {report.profile.conditions.map((condition, idx) => (
            <WeatherConditionCard key={idx} condition={condition} />
          ))}
        </div>
      </div>

      {report.geminiData?.activities && (
        <div className="activities-section">
          <h3 className="section-title">🎯 AI Recommendations</h3>

          {report.geminiData.activities.suggestions &&
            report.geminiData.activities.suggestions.length > 0 && (
              <div className="activity-group suggestions-group">
                <h4 className="activity-title">
                  <span className="activity-icon">✨</span>
                  Suggested Activities
                </h4>
                <ul className="activity-list">
                  {report.geminiData.activities.suggestions.map(
                    (suggestion, idx) => (
                      <li key={idx} className="activity-item suggestion-item">
                        {suggestion}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

          {report.geminiData.activities.warnings &&
            report.geminiData.activities.warnings.length > 0 && (
              <div className="activity-group warnings-group">
                <h4 className="activity-title">
                  <span className="activity-icon">⚠️</span>
                  Important Warnings
                </h4>
                <ul className="activity-list">
                  {report.geminiData.activities.warnings.map((warning, idx) => (
                    <li key={idx} className="activity-item warning-item">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {report.geminiData.activities.reminders &&
            report.geminiData.activities.reminders.length > 0 && (
              <div className="activity-group reminders-group">
                <h4 className="activity-title">
                  <span className="activity-icon">📝</span>
                  Helpful Reminders
                </h4>
                <ul className="activity-list">
                  {report.geminiData.activities.reminders.map(
                    (reminder, idx) => (
                      <li key={idx} className="activity-item reminder-item">
                        {reminder}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}
        </div>
      )}

      {report.geminiData?.weather_conditions?.specific_variables
        ?.air_quality_index != null && (
        <div className="air-quality-section">
          <h3 className="section-title">🌬️ Air Quality Index</h3>
          <div className="air-quality-card">
            <div className="aqi-display">
              <div className="aqi-value-container">
                <div
                  className="aqi-value"
                  style={{
                    color: getAQIColor(
                      report.geminiData.weather_conditions.specific_variables
                        .air_quality_index
                    ),
                  }}
                >
                  {Math.round(
                    report.geminiData.weather_conditions.specific_variables
                      .air_quality_index
                  )}
                </div>
                <div className="aqi-label">AQI</div>
              </div>
              <div className="aqi-info">
                <div
                  className="aqi-category"
                  style={{
                    backgroundColor: getAQIColor(
                      report.geminiData.weather_conditions.specific_variables
                        .air_quality_index
                    ),
                  }}
                >
                  {getAQICategory(
                    report.geminiData.weather_conditions.specific_variables
                      .air_quality_index
                  )}
                </div>
                <div className="aqi-description">
                  {getAQIDescription(
                    report.geminiData.weather_conditions.specific_variables
                      .air_quality_index
                  )}
                </div>
              </div>
            </div>
            <div className="aqi-scale">
              <div className="scale-title">AQI Scale:</div>
              <div className="scale-items">
                <div className="scale-item">
                  <div
                    className="scale-color"
                    style={{ backgroundColor: "#00e400" }}
                  ></div>
                  <span>0-50 Good</span>
                </div>
                <div className="scale-item">
                  <div
                    className="scale-color"
                    style={{ backgroundColor: "#ffff00" }}
                  ></div>
                  <span>51-100 Moderate</span>
                </div>
                <div className="scale-item">
                  <div
                    className="scale-color"
                    style={{ backgroundColor: "#ff7e00" }}
                  ></div>
                  <span>101-150 Unhealthy for Sensitive Groups</span>
                </div>
                <div className="scale-item">
                  <div
                    className="scale-color"
                    style={{ backgroundColor: "#ff0000" }}
                  ></div>
                  <span>151-200 Unhealthy</span>
                </div>
                <div className="scale-item">
                  <div
                    className="scale-color"
                    style={{ backgroundColor: "#8f3f97" }}
                  ></div>
                  <span>201-300 Very Unhealthy</span>
                </div>
                <div className="scale-item">
                  <div
                    className="scale-color"
                    style={{ backgroundColor: "#7e0023" }}
                  ></div>
                  <span>301+ Hazardous</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="report-note">
        <h4>📌 Understanding the Results</h4>
        <ul>
          <li>
            <strong>Likelihood percentage</strong> shows how often this
            condition has occurred historically on this date
          </li>
          <li>
            <strong>Risk levels</strong> help you quickly assess which
            conditions to prepare for
          </li>
          <li>
            <strong>Historical analysis</strong> uses{" "}
            {report.metadata.yearsAnalyzed} years of climate data
          </li>
          <li>
            Past patterns don't guarantee future weather, but help inform
            planning decisions
          </li>
        </ul>
      </div>
    </div>
  );
}
