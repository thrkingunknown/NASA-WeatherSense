/**
 * Weather Query Form Component
 *
 * Main form component for submitting weather queries.
 * Integrates LocationPicker and DatePicker components.
 */

import { useState, useCallback } from "react";
import { LocationPicker } from "../location/LocationPicker";
import { DatePicker } from "../date/DatePicker";
import type { WeatherQuery, Location, DateQuery } from "../../types/weather";
import "./WeatherQueryForm.css";

interface WeatherQueryFormProps {
  onSubmit: (query: WeatherQuery) => void;
  isLoading?: boolean;
}

export function WeatherQueryForm({
  onSubmit,
  isLoading = false,
}: WeatherQueryFormProps) {
  const [location, setLocation] = useState<Location>({
    type: "point",
    coordinates: { lat: 38.8830, lon: -77.0163 },
    name: "Mary W Jackson, NASA Headquarters",
  });

  const [date, setDate] = useState<DateQuery>({
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
    year: new Date().getFullYear(),
  });

  const [errors, setErrors] = useState<string[]>([]);

  // Memoize callbacks to prevent child component re-renders
  const handleLocationChange = useCallback((newLocation: Location) => {
    setLocation(newLocation);
  }, []);

  const handleDateChange = useCallback((newDate: DateQuery) => {
    setDate(newDate);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    // Validate location
    if (location.type === "point") {
      const { lat, lon } = location.coordinates;
      if (lat < -90 || lat > 90) {
        newErrors.push("Latitude must be between -90 and 90");
      }
      if (lon < -180 || lon > 180) {
        newErrors.push("Longitude must be between -180 and 180");
      }
    }

    // Validate date
    if (date.month < 1 || date.month > 12) {
      newErrors.push("Month must be between 1 and 12");
    }
    if (date.day < 1 || date.day > 31) {
      newErrors.push("Day must be between 1 and 31");
    }
    if (date.year && (date.year < 1980 || date.year > 2100)) {
      newErrors.push("Year must be between 1980 and 2100");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const query: WeatherQuery = {
      location,
      date,
      // queryId is optional - omitting it
    };

    onSubmit(query);
  };

  return (
    <form
      className="weather-query-form"
      onSubmit={handleSubmit}
      aria-label="Weather likelihood query form"
    >
      <h2 className="form-title">Plan Your Event</h2>
      <p className="form-description">
        Select a location and date to get weather likelihood predictions on.
      </p>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="form-errors" role="alert" aria-live="assertive">
          <h4>Please fix the following errors:</h4>
          <ul>
            {errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Location Picker */}
      <LocationPicker
        value={location}
        onChange={handleLocationChange}
        label="📍 Event Location"
      />

      {/* Date Picker */}
      <DatePicker
        value={date}
        onChange={handleDateChange}
        includeYear={true}
        label="📅 Event Date"
      />

      {/* Submit Button */}
      <div className="form-actions">
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
          aria-label={
            isLoading
              ? "Analyzing weather data, please wait"
              : "Submit weather likelihood query"
          }
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner" aria-hidden="true"></span>
              Analyzing Weather Data...
            </>
          ) : (
            <>Get Weather Likelihood</>
          )}
        </button>
      </div>

      {/* Info Box */}
      <div className="form-info">
        <h4>How it works:</h4>
        <ol>
          <li>
            <strong>Select your location</strong>
          </li>
          <li>
            <strong>Choose your date</strong>
          </li>
          <li>
            <strong>Get predictions</strong>
          </li>
        </ol>
      </div>
    </form>
  );
}
