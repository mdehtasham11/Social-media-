const config = {
  // When deployed, set VITE_API_BASE_URL in the Vercel dashboard
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || 'https://social-media-ybi8.onrender.com'
};

export default config;