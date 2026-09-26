/**
 * South East Asian Institute of Technology (SEAIT)
 * Geographic Anchor & Configuration
 * Location: National Highway, Purok 7, Crossing Rubber, Tupi, South Cotabato 9505
 */
export const SEAIT_CAMPUS = {
  name: 'South East Asian Institute of Technology (SEAIT)',
  latitude: 6.3648,
  longitude: 124.9222,
  barangay: 'Crossing Rubber',
  municipality: 'Tupi',
  province: 'South Cotabato',
  postalCode: '9505',
  defaultSearchRadiusKm: 2.0,
  maxSearchRadiusKm: 5.0
};

/**
 * Calculates straight-line distance in meters between two lat/lon points using the Haversine formula
 */
export function calculateDistanceToSeaitMeters(lat: number, lon: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat - SEAIT_CAMPUS.latitude) * Math.PI) / 180;
  const dLon = ((lon - SEAIT_CAMPUS.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((SEAIT_CAMPUS.latitude * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Estimates walking time in minutes based on average walking pace of 80m/min (approx 4.8 km/h)
 */
export function calculateWalkingTimeMinutes(distanceMeters: number): number {
  return Math.max(1, Math.round(distanceMeters / 80));
}

/**
 * Estimates tricycle / habal-habal commute time in minutes
 */
export function calculateCommuteTimeMinutes(distanceMeters: number): number {
  return Math.max(1, Math.round(distanceMeters / 400));
}
