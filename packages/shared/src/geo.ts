import type { LatLng } from './types';

const EARTH_RADIUS_M = 6371008.8;
const rad = (d: number) => (d * Math.PI) / 180;

/** Great-circle (haversine) distance in metres. */
export function distanceM(a: LatLng, b: LatLng): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Rounds to the nearest step (50 m for alerts, 100 m for the pending list). A positive distance never shows as 0. */
export function roundDistance(m: number, step: number): number {
  if (m <= 0) return 0;
  return Math.max(step, Math.round(m / step) * step);
}
