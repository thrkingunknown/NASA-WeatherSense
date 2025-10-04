/**
 * Location Picker Component
 *
 * Component for selecting a location using Mapbox.
 * Supports both point and polygon selection.
 *
 * Note: Mapbox GL JS v2.x adds non-passive event listeners for touch events,
 * which triggers Chrome performance warnings. This is a known issue with the
 * Mapbox library (https://github.com/mapbox/mapbox-gl-js/issues/10173).
 * The warnings are cosmetic and don't impact actual performance. The CSS
 * touch-action property and GPU acceleration are configured to optimize
 * touch responsiveness.
 */

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Location, Coordinates } from "../../types/weather";
import "./LocationPicker.css";

// Set Mapbox access token from environment
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_API_KEY || "";

interface LocationPickerProps {
  value: Location;
  onChange: (location: Location) => void;
  label?: string;
}

export function LocationPicker({
  value,
  onChange,
  label = "Select Location",
}: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const isMountedRef = useRef<boolean>(true); // Track mount status across renders
  const geocodeTimeoutRef = useRef<number | null>(null); // Debounce timer
  const locationType = value.type; // For future polygon support

  // Set mounted status on mount and cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Clear any pending geocode requests
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
    };
  }, []);

  // Memoize updateLocation to prevent unnecessary re-renders
  const updateLocation = useCallback(
    (location: Location) => {
      onChange(location);
    },
    [onChange]
  );

  // Memoize reverseGeocode to prevent recreation on every render
  const reverseGeocode = useCallback(
    async (coords: Coordinates) => {
      // Clear any pending geocode requests to debounce
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }

      // Debounce geocoding requests by 500ms
      geocodeTimeoutRef.current = window.setTimeout(async () => {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.lon},${coords.lat}.json?access_token=${mapboxgl.accessToken}`
          );
          const data = await response.json();

          // Only update state if component is still mounted
          if (!isMountedRef.current) return;

          if (data.features && data.features[0]) {
            const placeName = data.features[0].place_name;
            updateLocation({
              type: "point",
              coordinates: coords,
              name: placeName,
            });
          }
        } catch (error) {
          // Only log error if component is still mounted
          if (isMountedRef.current) {
            console.error("Geocoding error:", error);
          }
        }
      }, 500);
    },
    [updateLocation]
  );

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initialCoords =
      value.type === "point"
        ? value.coordinates
        : value.coordinates[0] || { lat: 34.0522, lon: -118.2437 };

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initialCoords.lon, initialCoords.lat],
      zoom: 10,
      dragPan: true,
      dragRotate: true,
      scrollZoom: true,
      touchZoomRotate: true,
      doubleClickZoom: true,
    });

    // Add navigation controls with optimized options
    map.current.addControl(
      new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: false, // Reduce complexity
      }),
      "top-right"
    );

    // Add marker for point location
    if (value.type === "point") {
      marker.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat([value.coordinates.lon, value.coordinates.lat])
        .addTo(map.current);

      marker.current.on("dragend", () => {
        if (!marker.current) return;
        const lngLat = marker.current.getLngLat();
        const coords = { lat: lngLat.lat, lon: lngLat.lng };

        // Reverse geocode to get the new location name
        reverseGeocode(coords);
      });
    }

    // Click to set location
    map.current.on("click", (e) => {
      if (locationType === "point") {
        const coords = { lat: e.lngLat.lat, lon: e.lngLat.lng };

        // Update or create marker
        if (marker.current) {
          marker.current.setLngLat([coords.lon, coords.lat]);
        } else if (map.current) {
          marker.current = new mapboxgl.Marker({ draggable: true })
            .setLngLat([coords.lon, coords.lat])
            .addTo(map.current);

          marker.current.on("dragend", () => {
            if (!marker.current) return;
            const lngLat = marker.current.getLngLat();
            const coords = { lat: lngLat.lat, lon: lngLat.lng };

            // Reverse geocode to get the new location name
            reverseGeocode(coords);
          });
        }

        // Reverse geocode to get location name
        reverseGeocode(coords);
      }
    });

    return () => {
      isMountedRef.current = false; // Mark as unmounted
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
    };
  }, [reverseGeocode, updateLocation, locationType, value]); // Add dependencies

  const handleManualCoordinates = () => {
    const lat = prompt("Enter latitude (-90 to 90):");
    const lon = prompt("Enter longitude (-180 to 180):");

    if (lat && lon) {
      const latNum = parseFloat(lat);
      const lonNum = parseFloat(lon);

      if (
        !isNaN(latNum) &&
        !isNaN(lonNum) &&
        latNum >= -90 &&
        latNum <= 90 &&
        lonNum >= -180 &&
        lonNum <= 180
      ) {
        const coords = { lat: latNum, lon: lonNum };

        if (map.current) {
          map.current.flyTo({
            center: [lonNum, latNum],
            zoom: 10,
          });
        }

        if (marker.current) {
          marker.current.setLngLat([lonNum, latNum]);
        } else if (map.current) {
          marker.current = new mapboxgl.Marker({ draggable: true })
            .setLngLat([lonNum, latNum])
            .addTo(map.current);

          marker.current.on("dragend", () => {
            if (!marker.current) return;
            const lngLat = marker.current.getLngLat();
            const coords = { lat: lngLat.lat, lon: lngLat.lng };

            // Reverse geocode to get the new location name
            reverseGeocode(coords);
          });
        }

        // Reverse geocode to get location name
        reverseGeocode(coords);
      } else {
        alert(
          "Invalid coordinates. Please enter valid latitude and longitude."
        );
      }
    }
  };

  return (
    <div className="location-picker">
      <label className="location-picker-label">{label}</label>

      <div className="location-info">
        <div className="location-name">
          <strong>Selected Location:</strong>{" "}
          {value.name || "Click on map to select"}
        </div>
        {value.type === "point" && (
          <div className="coordinates">
            Lat: {value.coordinates.lat.toFixed(6)}, Lon:{" "}
            {value.coordinates.lon.toFixed(6)}
          </div>
        )}
      </div>

      <div className="map-container" ref={mapContainer} />

      <div className="location-controls">
        <button
          type="button"
          onClick={handleManualCoordinates}
          className="btn-secondary"
        >
          Enter Coordinates Manually
        </button>

        <div className="location-tip">
          <strong>Tip:</strong> Click anywhere on the map to select a location,
          or drag the marker to adjust.
        </div>
      </div>

      {/* Note: Polygon support can be added in future */}
      {locationType === "polygon" && (
        <div className="polygon-notice">
          <p>
            <strong>Note:</strong> Polygon selection coming soon. Using point
            location for now.
          </p>
        </div>
      )}
    </div>
  );
}
