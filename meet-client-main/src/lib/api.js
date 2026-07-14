/**
 * Shared fetch helper — auto-injects auth token and base URL.
 * Usage: const data = await api("/api/user/feed");
 */
export async function api(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  // Only set Content-Type for JSON bodies (not FormData)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${import.meta.env.VITE_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Request failed");
  }

  return res.json();
}
