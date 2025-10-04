/**
 * Weather Condition Card Component
 *
 * Enhanced display for individual weather condition with visual indicators.
 */

import type { WeatherCondition } from "../../types/weather";
import "./WeatherConditionCard.css";

interface WeatherConditionCardProps {
  condition: WeatherCondition;
}

// Map condition names to emoji icons
const conditionIcons: Record<string, string> = {
  "Very Hot": "🔥",
  "Very Cold": "❄️",
  "Very Wet": "🌧️",
  "Very Windy": "💨",
  "Very Uncomfortable": "😰",
};

// Map condition names to color themes
const conditionColors: Record<string, string> = {
  "Very Hot": "hot",
  "Very Cold": "cold",
  "Very Wet": "wet",
  "Very Windy": "windy",
  "Very Uncomfortable": "uncomfortable",
};

export function WeatherConditionCard({ condition }: WeatherConditionCardProps) {
  const icon = conditionIcons[condition.condition] || "🌤️";
  const colorTheme = conditionColors[condition.condition] || "default";
  const likelihood = condition.likelihood;

  // Determine risk level based on likelihood
  const getRiskLevel = (likelihood: number): string => {
    if (likelihood >= 75) return "Very High";
    if (likelihood >= 50) return "High";
    if (likelihood >= 25) return "Moderate";
    if (likelihood >= 10) return "Low";
    return "Very Low";
  };

  const riskLevel = getRiskLevel(likelihood);

  return (
    <div className={`weather-condition-card theme-${colorTheme}`}>
      {/* Header */}
      <div className="card-header">
        <span className="condition-icon">{icon}</span>
        <h3 className="condition-name">{condition.condition}</h3>
      </div>

      {/* Likelihood Display */}
      <div className="likelihood-display">
        <div className="likelihood-value">{likelihood}%</div>
        <div className="likelihood-label">Likelihood</div>
      </div>

      {/* Progress Bar */}
      <div className="likelihood-bar">
        <div
          className="likelihood-bar-fill"
          style={{ width: `${likelihood}%` }}
        />
      </div>

      {/* Risk Level Badge */}
      <div
        className={`risk-badge risk-${riskLevel
          .toLowerCase()
          .replace(" ", "-")}`}
      >
        {riskLevel} Risk
      </div>

      {/* Description */}
      <p className="condition-description">{condition.description}</p>

      {/* Threshold Info */}
      <div className="threshold-info">
        <span className="threshold-label">Threshold:</span>
        <span className="threshold-value">
          {condition.threshold} {condition.unit}
        </span>
      </div>

      {/* Historical Range */}
      {condition.historicalRange && (
        <div className="historical-range">
          <div className="range-label">Historical Range:</div>
          <div className="range-values">
            <span className="range-item">
              Min: {condition.historicalRange.min.toFixed(1)} {condition.unit}
            </span>
            <span className="range-item">
              Median: {condition.historicalRange.median.toFixed(1)}{" "}
              {condition.unit}
            </span>
            <span className="range-item">
              Max: {condition.historicalRange.max.toFixed(1)} {condition.unit}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
