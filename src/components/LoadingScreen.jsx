import React from 'react';
import { useSettings } from '../context/SettingsContext';

const LoadingScreen = () => {
  const { settings } = useSettings();

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 flex flex-col items-center justify-center z-50">
      <div className="loading-logo">
        {settings.logoUrl ? (
          <img src={settings.logoUrl} alt="Site Logo" className="h-16 w-auto object-contain" />
        ) : (
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-teal-700 font-bold text-2xl">Z</span>
          </div>
        )}
      </div>
      <div className="loading-text text-white text-2xl font-semibold mt-4">Zenovia Admin</div>
      <div className="loading-subtitle text-gray-200 mt-2">Loading your wellness dashboard...</div>
      <div className="loading-spinner w-10 h-10 border-4 border-t-4 border-t-white border-gray-200 rounded-full animate-spin mt-8"></div>
    </div>
  );
};

export default LoadingScreen;
