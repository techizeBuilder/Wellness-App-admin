// API Configuration
const config = {
  // Production API URL
  API_BASE_URL: 'https://apiwellness.shrawantravels.com',
  
  // Local development URL (if needed for testing)
  LOCAL_API_URL: 'http://localhost:5000',
  
  // Current environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Get the appropriate API URL based on environment
  getApiUrl: () => {
    // Always use production URL for now
    return config.API_BASE_URL;
    
    // Uncomment below if you want to use local URL in development
    // return config.isDevelopment ? config.LOCAL_API_URL : config.API_BASE_URL;
  }
};

export default config;