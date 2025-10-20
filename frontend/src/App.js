import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import axios from 'axios';
import './App.css';

// Import components
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import ProductsPage from './components/ProductsPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import CustomerPanel from './components/CustomerPanel';
import AdminPage from './components/AdminPage';
import MiniCart from './components/MiniCart';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';

// Import contexts
import { CartProvider } from './contexts/CartContext';
import { SettingsProvider } from './contexts/SettingsContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API = `${BACKEND_URL}/api`;

// WhatsApp floating button component
const WhatsAppButton = () => {
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/905464313745?text=Merhaba%2C%20ürünleriniz%20hakkında%20bilgi%20almak%20istiyorum.', '_blank');
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="fixed bottom-6 right-6 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50 group"
      title="WhatsApp ile iletişime geç"
    >
      <MessageCircle size={24} />
      <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        WhatsApp ile mesaj gönderin
      </span>
    </button>
  );
};

function Layout({ children, language, setLanguage }) {
  return (
    <>
      <Header language={language} setLanguage={setLanguage} />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer language={language} />
      <WhatsAppButton />
      <MiniCart language={language} />
    </>
  );
}

function App() {
  // Initialize language from localStorage/cookie
  const getInitialLanguage = () => {
    // Try localStorage first
    const savedLang = localStorage.getItem('preferred_language');
    if (savedLang) {
      return savedLang;
    }
    
    // Try cookie
    const cookies = document.cookie.split(';');
    const langCookie = cookies.find(c => c.trim().startsWith('lang='));
    if (langCookie) {
      return langCookie.split('=')[1];
    }
    
    // Default to English
    return 'en';
  };

  const [language, setLanguage] = useState(getInitialLanguage);
  const [stats, setStats] = useState({});

  // Persist language selection
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('preferred_language', language);
    
    // Save to cookie (30 days)
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    document.cookie = `lang=${language}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }, [language]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API}/stats`);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="App">
      <SettingsProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/*" element={
                <Layout language={language} setLanguage={setLanguage}>
                  <Routes>
                    <Route index element={<HomePage language={language} stats={stats} />} />
                    <Route path="products" element={<ProductsPage language={language} />} />
                    <Route path="about" element={<AboutPage language={language} />} />
                    <Route path="contact" element={<ContactPage language={language} />} />
                    <Route path="cart" element={<CartPage language={language} />} />
                    <Route path="checkout" element={<CheckoutPage language={language} />} />
                    <Route path="customer-panel" element={<CustomerPanel language={language} />} />
                    <Route path="admin" element={<AdminPage language={language} />} />
                  </Routes>
                </Layout>
              } />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </SettingsProvider>
    </div>
  );
}

export default App;