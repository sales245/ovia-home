import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    salesMode: 'hybrid',
    paymentMethods: {
      creditCard: { enabled: false },
      bankTransfer: { enabled: true, instructions: '' },
      letterOfCredit: { enabled: true, instructions: '' },
      paypal: { enabled: false, environment: 'sandbox', clientId: '', clientSecret: '', webhookId: '' }
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const response = await axios.put(`${API}/settings`, newSettings);
      setSettings(response.data);
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      return false;
    }
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      updateSettings,
      loadSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
