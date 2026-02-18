import React, { createContext, useState, useEffect, useContext } from 'react';
import { apiGet } from '../utils/api';
import { getFullImageUrl } from '../utils/imageUrl';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    logoUrl: null,
    // Add other settings here in the future
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiGet('/api/admin/logo');
        if (response.success && response.data?.logoUrl) {
          setSettings(prevSettings => ({
            ...prevSettings,
            logoUrl: getFullImageUrl(response.data.logoUrl),
          }));
        }
      } catch (error) {
        console.error('Error fetching site settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};
