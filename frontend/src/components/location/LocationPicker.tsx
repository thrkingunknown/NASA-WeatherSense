import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Location, Coordinates } from "../../types/weather";
import "./LocationPicker.css";

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
  const isMountedRef = useRef<boolean>(true);
  const geocodeTimeoutRef = useRef<number | null>(null);
  const locationType = value.type;

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
    };
  }, []);

  const updateLocation = useCallback(
    (location: Location) => {
      onChange(location);
    },
    [onChange]
  );

  const reverseGeocode = useCallback(
    async (coords: Coordinates) => {
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }

      geocodeTimeoutRef.current = window.setTimeout(async () => {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.lon},${coords.lat}.json?access_token=${mapboxgl.accessToken}`
          );
          const data = await response.json();

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
          if (isMountedRef.current) {
            console.error("Geocoding error:", error);
          }
        }
      }, 500);
    },
    [updateLocation]
  );

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

    map.current.addControl(
      new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: false,
      }),
      "top-right"
    );

    if (value.type === "point") {
      marker.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat([value.coordinates.lon, value.coordinates.lat])
        .addTo(map.current);

      marker.current.on("dragend", () => {
        if (!marker.current) return;
        const lngLat = marker.current.getLngLat();
        const coords = { lat: lngLat.lat, lon: lngLat.lng };

        reverseGeocode(coords);
      });
    }

    map.current.on("click", (e) => {
      if (locationType === "point") {
        const coords = { lat: e.lngLat.lat, lon: e.lngLat.lng };

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

            reverseGeocode(coords);
          });
        }

        reverseGeocode(coords);
      }
    });

    return () => {
      isMountedRef.current = false;
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !marker.current || value.type !== "point") return;

    const currentLngLat = marker.current.getLngLat();
    const valueLon = value.coordinates.lon;
    const valueLat = value.coordinates.lat;

    if (
      Math.abs(currentLngLat.lng - valueLon) > 0.00001 ||
      Math.abs(currentLngLat.lat - valueLat) > 0.00001
    ) {
      marker.current.setLngLat([valueLon, valueLat]);
      map.current.flyTo({
        center: [valueLon, valueLat],
        zoom: map.current.getZoom(),
      });
    }
  }, [value]);

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

            reverseGeocode(coords);
          });
        }

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
