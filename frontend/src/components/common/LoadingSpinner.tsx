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
        <div className="orbit-ring outer-ring"></div>

        <div className="orbit-ring middle-ring"></div>

        <div className="orbit-ring inner-ring"></div>

        <div className="spinner-globe">
          <div className="globe-inner"></div>
        </div>

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
