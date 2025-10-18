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
    </>
  );
}

function App() {
  const [language, setLanguage] = useState('en');
  const [stats, setStats] = useState({});

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
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={
            <Layout language={language} setLanguage={setLanguage}>
              <Routes>
                <Route index element={<HomePage language={language} stats={stats} />} />
                <Route path="products" element={<ProductsPage language={language} />} />
                <Route path="about" element={<AboutPage language={language} />} />
                <Route path="contact" element={<ContactPage language={language} />} />
                <Route path="customer-panel" element={<CustomerPanel language={language} />} />
                <Route path="admin" element={<AdminPage language={language} />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;