const DEFAULT_API_BASE_URL = "http://localhost:3000/api/v1";

export function getApiBaseUrl() {
  const raw = import.meta.env?.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;
  return raw.replace(/\/$/, "");
}
