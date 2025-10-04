import type { ApiError } from "../../types/weather";
import "./ErrorMessage.css";

interface ErrorMessageProps {
  error: ApiError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorMessage({ error, onRetry, onDismiss }: ErrorMessageProps) {
  const getErrorIcon = (): string => {
    const errorString = typeof error.error === "string" ? error.error : "";
    if (error.statusCode === 0 || errorString.includes("Network")) {
      return "🌐";
    }
    if (error.statusCode === 400 || error.statusCode === 422) {
      return "⚠️";
    }
    if (error.statusCode === 404) {
      return "🔍";
    }
    if (error.statusCode === 503 || error.statusCode === 504) {
      return "⏱️";
    }
    return "❌";
  };

  const getSuggestion = (): string => {
    const errorString = typeof error.error === "string" ? error.error : "";
    if (error.statusCode === 0 || errorString.includes("Network")) {
      return "Check your internet connection and try again.";
    }
    if (error.statusCode === 400 || error.statusCode === 422) {
      return "Please check your inputs and try again.";
    }
    if (error.statusCode === 404) {
      return "The requested resource was not found. Please try a different query.";
    }
    if (error.statusCode === 503) {
      return "The service is temporarily unavailable. Please try again in a few moments.";
    }
    if (error.statusCode === 504) {
      return "The request took too long. Try selecting a smaller area or different date.";
    }
    return "Please try again or contact support if the problem persists.";
  };

  return (
    <div className="error-message" role="alert" aria-live="assertive">
      <div className="error-content">
        <div className="error-icon">{getErrorIcon()}</div>

        <div className="error-details">
          <h3 className="error-title">
            {typeof error.error === "string" ? error.error : "Error"}
          </h3>
          <p className="error-description">{error.message}</p>

          {error.statusCode && error.statusCode > 0 && (
            <span className="status-badge">Status: {error.statusCode}</span>
          )}

          <div className="error-suggestion">
            <span className="suggestion-icon">💡</span>
            <p className="suggestion-text">{getSuggestion()}</p>
          </div>

          {error.details && Object.keys(error.details).length > 0 && (
            <details className="error-details-toggle">
              <summary>Technical Details</summary>
              <pre className="error-details-content">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>

      <div className="error-actions">
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-retry"
            aria-label="Retry the request"
          >
            🔄 Try Again
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="btn-dismiss"
            aria-label="Dismiss this error"
          >
            ✕ Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
