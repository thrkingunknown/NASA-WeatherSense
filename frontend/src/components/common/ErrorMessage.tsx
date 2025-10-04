/**
 * Error Message Component
 *
 * Enhanced error display with icons, styling, and helpful suggestions.
 * Shows error details and provides recovery actions.
 */

import type { ApiError } from "../../types/weather";
import "./ErrorMessage.css";

interface ErrorMessageProps {
  error: ApiError;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorMessage({ error, onRetry, onDismiss }: ErrorMessageProps) {
  // Get error icon based on error type
  const getErrorIcon = (): string => {
    if (error.statusCode === 0 || error.error.includes("Network")) {
      return "🌐"; // Network error
    }
    if (error.statusCode === 400 || error.statusCode === 422) {
      return "⚠️"; // Validation error
    }
    if (error.statusCode === 404) {
      return "🔍"; // Not found
    }
    if (error.statusCode === 503 || error.statusCode === 504) {
      return "⏱️"; // Timeout/unavailable
    }
    return "❌"; // Generic error
  };

  // Get helpful suggestion based on error type
  const getSuggestion = (): string => {
    if (error.statusCode === 0 || error.error.includes("Network")) {
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
        {/* Error Icon */}
        <div className="error-icon">{getErrorIcon()}</div>

        {/* Error Details */}
        <div className="error-details">
          <h3 className="error-title">{error.error}</h3>
          <p className="error-description">{error.message}</p>

          {/* Status Code Badge */}
          {error.statusCode && error.statusCode > 0 && (
            <span className="status-badge">Status: {error.statusCode}</span>
          )}

          {/* Suggestion */}
          <div className="error-suggestion">
            <span className="suggestion-icon">💡</span>
            <p className="suggestion-text">{getSuggestion()}</p>
          </div>

          {/* Additional Details */}
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

      {/* Action Buttons */}
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
