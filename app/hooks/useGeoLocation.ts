/**
 * useGeoLocation
 *
 * Captures the device's current GPS position once on demand.
 * Returns { lat, lng } or null if unavailable/denied.
 */

export async function getCurrentPosition(): Promise<{ lat: number; lng: number } | null> {
  if (typeof window === "undefined" || !navigator.geolocation) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000, maximumAge: 30000 }
    );
  });
}
