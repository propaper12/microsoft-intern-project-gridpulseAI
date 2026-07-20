/**
 * Windows'ta localhost çoğu zaman ::1'e gider; 8000'de başka bir süreç
 * dinliyorsa Vite proxy 404 döner. GridPulse API her zaman 127.0.0.1:8000.
 */
const DEFAULT_API = "http://127.0.0.1:8000";

export const API_BASE = (import.meta.env.VITE_API_BASE || DEFAULT_API).replace(/\/$/, "");

export function apiUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}
