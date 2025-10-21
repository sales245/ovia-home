import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check for Google OAuth callback first
    if (window.location.hash.includes('session_id=')) {
      processGoogleAuth().then(() => {
        // After processing Google auth, check regular auth
        if (!user) {
          checkAuth();
        }
      });
    } else {
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        withCredentials: true
      });
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password
      }, {
        withCredentials: true
      });
      
      setUser(response.data.user);
      setToken(response.data.token);
      return { success: true, user: response.data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API}/auth/register`, userData, {
        withCredentials: true
      });
      
      setUser(response.data.user);
      setToken(response.data.token);
      return { success: true, user: response.data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const loginWithGoogle = async () => {
    // Redirect to Emergent Auth
    const redirectUrl = `${window.location.origin}/customer-panel`;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  // Process Google OAuth session_id from URL fragment
  const processGoogleAuth = async () => {
    const hash = window.location.hash;
    console.log('Checking for Google OAuth callback, hash:', hash);
    
    if (!hash.includes('session_id=')) {
      return;
    }

    // Extract session_id
    const sessionId = hash.split('session_id=')[1]?.split('&')[0];
    console.log('Found session_id:', sessionId);
    
    if (!sessionId) {
      console.error('Session ID not found in hash');
      return;
    }

    // Show loading state
    setLoading(true);

    try {
      console.log('Fetching session data from Emergent...');
      
      // Exchange session_id for session data
      const response = await axios.get(
        'https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data',
        {
          headers: {
            'X-Session-ID': sessionId
          }
        }
      );

      console.log('Session data received:', response.data);

      const { id, email, name, picture, session_token } = response.data;

      // Save session to our backend
      console.log('Saving to our backend...');
      
      const loginResponse = await axios.post(`${API}/auth/google`, {
        credential: session_token,
        userData: { id, email, name, picture }
      }, {
        withCredentials: true
      });

      console.log('Login successful:', loginResponse.data);

      setUser(loginResponse.data.user);
      setToken(loginResponse.data.token);

      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);

      return { success: true };
    } catch (error) {
      console.error('Google auth error details:', error);
      console.error('Error response:', error.response?.data);
      
      // Clean URL even on error
      window.history.replaceState({}, document.title, window.location.pathname);
      
      alert('Google authentication failed. Please try again.');
      return { success: false, error: 'Google authentication failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, {
        withCredentials: true
      });
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      loginWithGoogle,
      logout,
      checkAuth,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
