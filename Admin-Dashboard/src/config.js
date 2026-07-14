const config = {
  // When deployed, set VITE_API_BASE_URL in the Vercel dashboard
  API_BASE_URL:
    // import.meta.env.VITE_API_BASE_URL || 'https://social-m-backend-25yv.onrender.com'
    import.meta.env.VITE_BASE_URL || "http://localhost:8002",
};

export default config;
