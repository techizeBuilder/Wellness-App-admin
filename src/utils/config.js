// API Configuration
const config = {
  // Production API URL
  API_BASE_URL: process.env.REACT_APP_PRODUCTION_API_URL || 'https://apiwellness.shrawantravels.com',
  
  // Local development URL
  LOCAL_API_URL: process.env.REACT_APP_DEVELOPMENT_API_URL || 'https://apiwellness.shrawantravels.com',
  
  // Current environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Get the appropriate API URL based on environment
  getApiUrl: () => {
    // Priority 1: Check if specific environment API URL is set
    if (process.env.NODE_ENV === 'development') {
      return config.LOCAL_API_URL;
    } else if (process.env.NODE_ENV === 'production') {
      return config.API_BASE_URL;
    }
    
    // Priority 2: Fallback to generic API URL from env
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    
    // Priority 3: Final fallback to production URL
    return config.API_BASE_URL;
  },
  
  // Utility functions
  getCurrentEnvironment: () => process.env.NODE_ENV || 'development',
  
  // Get current API URL with logging for debugging
  getApiUrlWithLog: () => {
    const url = config.getApiUrl();
    if (config.isDevelopment) {
      console.log(`🔗 API URL: ${url} (Environment: ${config.getCurrentEnvironment()})`);
    }
    return url;
  }
};

export default config;