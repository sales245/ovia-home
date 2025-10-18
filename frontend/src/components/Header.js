import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, Mail, MessageCircle, Instagram } from 'lucide-react';
import { translations } from '../translations';

const Header = ({ language, setLanguage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const t = translations[language];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleContactClick = (type) => {
    switch (type) {
      case 'email':
        window.location.href = 'mailto:sales@oviahome.info';
        break;
      case 'whatsapp':
        window.open('https://wa.me/905464313745', '_blank');
        break;
      case 'instagram':
        window.open('https://instagram.com/oviahome', '_blank');
        break;
      default:
        break;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="container">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="text-2xl font-bold text-ink">
              <span style={{ fontFamily: 'Playfair Display, serif' }}>Ovia Home</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-ink border-b-2 border-primary pb-1' : 'text-ink-2'
              }`}
            >
              {t.home}
            </Link>
            <div className="relative group">
              <Link
                to="/products"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/products') || isActive('/products/retail') || isActive('/products/wholesale') 
                    ? 'text-ink border-b-2 border-primary pb-1' 
                    : 'text-ink-2'
                }`}
              >
                {t.products}
              </Link>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link
                  to="/products/retail"
                  className="block px-4 py-2 text-sm text-ink-2 hover:bg-gray-50 hover:text-primary"
                >
                  {t.retailProducts}
                </Link>
                <Link
                  to="/products/wholesale"
                  className="block px-4 py-2 text-sm text-ink-2 hover:bg-gray-50 hover:text-primary"
                >
                  {t.wholesaleProducts}
                </Link>
              </div>
            </div>
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/about') ? 'text-ink border-b-2 border-primary pb-1' : 'text-ink-2'
              }`}
            >
              {t.about}
            </Link>
            <Link
              to="/contact"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/contact') ? 'text-ink border-b-2 border-primary pb-1' : 'text-ink-2'
              }`}
            >
              {t.contact}
            </Link>
            <Link
              to="/customer-panel"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/customer-panel') ? 'text-ink border-b-2 border-primary pb-1' : 'text-ink-2'
              }`}
            >
              {t.customerPanel}
            </Link>
            {/* Discrete Admin Link */}
            <Link
              to="/admin"
              className={`text-xs text-ink-2/50 hover:text-primary transition-colors ${
                isActive('/admin') ? 'text-primary' : ''
              }`}
              title="Admin Panel"
            >
              •
            </Link>
          </nav>

          {/* Contact Icons & Language Selector */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => handleContactClick('email')}
              className="p-2 text-ink-2 hover:text-primary transition-colors"
              title="Email us"
            >
              <Mail size={18} />
            </button>
            <button
              onClick={() => handleContactClick('whatsapp')}
              className="p-2 text-ink-2 hover:text-primary transition-colors"
              title="WhatsApp"
            >
              <MessageCircle size={18} />
            </button>
            <button
              onClick={() => handleContactClick('instagram')}
              className="p-2 text-ink-2 hover:text-primary transition-colors"
              title="Instagram"
            >
              <Instagram size={18} />
            </button>
            
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="appearance-none bg-transparent border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring"
                style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
              >
                <option value="en">English</option>
                <option value="tr">Türkçe</option>
                <option value="de">Deutsch</option>
                <option value="fr">Français</option>
                <option value="it">Italiano</option>
                <option value="es">Español</option>
                <option value="pl">Polski</option>
                <option value="ru">Русский</option>
                <option value="bg">Български</option>
                <option value="el">Ελληνικά</option>
                <option value="pt">Português</option>
                <option value="ar">العربية</option>
              </select>
              <Globe size={14} className="absolute right-1 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
            </div>

            <Link to="/contact" className="btn-primary text-sm py-2 px-4">
              {t.getQuote}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-ink-2 hover:text-primary"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className={`text-sm font-medium ${
                  isActive('/') ? 'text-ink' : 'text-ink-2'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t.home}
              </Link>
              <div className="space-y-2">
                <Link
                  to="/products"
                  className={`text-sm font-medium ${
                    isActive('/products') ? 'text-ink' : 'text-ink-2'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t.products}
                </Link>
                <div className="pl-4 space-y-2">
                  <Link
                    to="/products/retail"
                    className={`block text-sm ${
                      isActive('/products/retail') ? 'text-primary' : 'text-ink-2'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t.retailProducts}
                  </Link>
                  <Link
                    to="/products/wholesale"
                    className={`block text-sm ${
                      isActive('/products/wholesale') ? 'text-primary' : 'text-ink-2'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t.wholesaleProducts}
                  </Link>
                </div>
              </div>
              <Link
                to="/about"
                className={`text-sm font-medium ${
                  isActive('/about') ? 'text-ink' : 'text-ink-2'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t.about}
              </Link>
              <Link
                to="/contact"
                className={`text-sm font-medium ${
                  isActive('/contact') ? 'text-ink' : 'text-ink-2'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t.contact}
              </Link>
              <Link
                to="/customer-panel"
                className={`text-sm font-medium ${
                  isActive('/customer-panel') ? 'text-ink' : 'text-ink-2'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t.customerPanel}
              </Link>
              
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleContactClick('email')}
                  className="p-2 text-ink-2 hover:text-primary"
                >
                  <Mail size={18} />
                </button>
                <button
                  onClick={() => handleContactClick('whatsapp')}
                  className="p-2 text-ink-2 hover:text-primary"
                >
                  <MessageCircle size={18} />
                </button>
                <button
                  onClick={() => handleContactClick('instagram')}
                  className="p-2 text-ink-2 hover:text-primary"
                >
                  <Instagram size={18} />
                </button>
                
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="appearance-none bg-transparent border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:border-primary"
                  style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}
                >
                  <option value="en">English</option>
                  <option value="tr">Türkçe</option>
                  <option value="de">Deutsch</option>
                  <option value="fr">Français</option>
                  <option value="it">Italiano</option>
                  <option value="es">Español</option>
                  <option value="pl">Polski</option>
                  <option value="ru">Русский</option>
                  <option value="bg">Български</option>
                  <option value="el">Ελληνικά</option>
                  <option value="pt">Português</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
              
              <Link
                to="/contact"
                className="btn-primary text-sm py-2 px-4 text-center mt-4"
                onClick={() => setIsMenuOpen(false)}
              >
                {t.getQuote}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;