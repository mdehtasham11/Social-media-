const getApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env?.VITE_BASE_URL;
  return (configuredBaseUrl || "http://localhost:8002").replace(/\/$/, "");
};

export const getMediaUrl = (url, fallback = "") => {
  if (!url) return fallback;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
    return url;
  }
  if (url.startsWith("/uploads/")) {
    return `${getApiBaseUrl()}${url}`;
  }
  return url;
};
