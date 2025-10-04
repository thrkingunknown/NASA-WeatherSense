/**
 * Date Picker Component
 *
 * Component for selecting month, day, and optionally year for weather queries.
 */

import { useState, useEffect, useMemo } from "react";
import type { DateQuery } from "../../types/weather";
import "./DatePicker.css";

interface DatePickerProps {
  value: DateQuery;
  onChange: (date: DateQuery) => void;
  includeYear?: boolean;
  label?: string;
}

// Memoize static arrays outside component
const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const YEARS = Array.from({ length: 2100 - 1980 + 1 }, (_, i) => 1980 + i);

export function DatePicker({
  value,
  onChange,
  includeYear = true,
  label = "Select Date",
}: DatePickerProps) {
  const [month, setMonth] = useState(value.month);
  const [day, setDay] = useState(value.day);
  const [year, setYear] = useState(value.year || "");
  const [useHistorical, setUseHistorical] = useState(!value.year);

  // Update parent when values change - REMOVED onChange from dependencies to prevent infinite loop
  useEffect(() => {
    onChange({
      month,
      day,
      year: useHistorical ? undefined : Number(year),
    });
  }, [month, day, year, useHistorical]);

  // Get days in selected month
  const getDaysInMonth = (m: number, y?: number) => {
    const currentYear = y || new Date().getFullYear();
    return new Date(currentYear, m, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(month, year ? Number(year) : undefined);

  // Adjust day if it exceeds days in selected month
  useEffect(() => {
    if (day > daysInMonth) {
      setDay(daysInMonth);
    }
  }, [daysInMonth, day]);

  // Memoize days array to avoid recreation on every render
  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]
  );

  const currentYear = new Date().getFullYear();

  // Memoize recent years to avoid filtering on every render
  const recentYears = useMemo(
    () =>
      YEARS.filter(
        (y) => y >= currentYear - 5 && y <= currentYear + 5
      ).reverse(),
    [currentYear]
  );

  return (
    <div className="date-picker">
      <label className="date-picker-label">{label}</label>

      <div className="date-picker-fields">
        {/* Month Select */}
        <div className="field-group">
          <label htmlFor="month-select">Month</label>
          <select
            id="month-select"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="date-select"
          >
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Day Select */}
        <div className="field-group">
          <label htmlFor="day-select">Day</label>
          <select
            id="day-select"
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="date-select"
          >
            {days.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Year Select (optional) */}
        {includeYear && (
          <div className="field-group">
            <label htmlFor="year-select">Year</label>
            <select
              id="year-select"
              value={useHistorical ? "historical" : year}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "historical") {
                  setUseHistorical(true);
                  setYear("");
                } else {
                  setUseHistorical(false);
                  setYear(val);
                }
              }}
              className="date-select"
            >
              <option value="historical">Historical (All Years)</option>
              <optgroup label="Recent Years">
                {recentYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </optgroup>
              <optgroup label="All Years">
                {[...YEARS].reverse().map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        )}
      </div>

      {/* Info message */}
      {useHistorical && (
        <p className="date-picker-info">
          Historical mode: Analyze likelihood across all available years
          (1980-present)
        </p>
      )}
    </div>
  );
}
