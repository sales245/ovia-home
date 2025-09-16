import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import ProductsPage from './components/ProductsPage';
import AboutPage from './components/AboutPage';
import ContactPage from './components/ContactPage';
import CustomerPanel from './components/CustomerPanel';
import AdminPage from './components/AdminPage';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Layout wrapper component to conditionally show header/footer
const Layout = ({ children, language, setLanguage }) => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  if (isAdminPage) {
    // Admin pages don't need header/footer
    return <>{children}</>;
  }

  return (
    <>
      <Header language={language} setLanguage={setLanguage} />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer language={language} />
    </>
  );
};

function App() {
  const [language, setLanguage] = useState('en');
  const [stats, setStats] = useState({});

  useEffect(() => {
    // Fetch website statistics
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
    <div className="App" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <BrowserRouter>
        <Layout language={language} setLanguage={setLanguage}>
          <Routes>
            <Route path="/" element={<HomePage stats={stats} language={language} />} />
            <Route path="/products" element={<ProductsPage language={language} />} />
            <Route path="/about" element={<AboutPage language={language} />} />
            <Route path="/contact" element={<ContactPage language={language} />} />
            <Route path="/customer-panel" element={<CustomerPanel language={language} />} />
            <Route path="/admin" element={<AdminPage language={language} />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;