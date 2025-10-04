/**
 * Loading Spinner Component
 *
 * Animated loading spinner with NASA-themed styling.
 * Shows loading states with smooth animations and optional message.
 */

import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "medium" | "large";
  variant?: "primary" | "light";
}

export function LoadingSpinner({
  message = "Loading...",
  size = "medium",
  variant = "primary",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`loading-spinner ${size} ${variant}`}
      role="status"
      aria-live="polite"
    >
      <div className="spinner-container">
        {/* Outer orbit ring */}
        <div className="orbit-ring outer-ring"></div>

        {/* Middle orbit ring */}
        <div className="orbit-ring middle-ring"></div>

        {/* Inner orbit ring */}
        <div className="orbit-ring inner-ring"></div>

        {/* Center globe */}
        <div className="spinner-globe">
          <div className="globe-inner"></div>
        </div>

        {/* Orbiting satellites */}
        <div className="satellite satellite-1"></div>
        <div className="satellite satellite-2"></div>
        <div className="satellite satellite-3"></div>
      </div>

      {message && (
        <p className="loading-message">
          {message}
          <span className="loading-dots">
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </span>
        </p>
      )}

      <span className="sr-only">{message}</span>
    </div>
  );
}
