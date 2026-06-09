/**
 * Calculates the distance between two coordinate pairs using the Haversine formula.
 * Returns the distance in meters.
 */
export function getDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const r1 = lat1 * (Math.PI / 180);
  const r2 = lat2 * (Math.PI / 180);
  const deltaLat = (lat2 - lat1) * (Math.PI / 180);
  const deltaLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(r1) * Math.cos(r2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Formats a distance in meters into a user-friendly string (e.g., "350m" or "1.2 km").
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}
