import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, Instagram, MapPin, Phone } from 'lucide-react';

const translations = {
  en: {
    company: 'Company',
    home: 'Home',
    products: 'Products',
    about: 'About Us',
    contact: 'Contact',
    customerPanel: 'Customer Panel',
    contactInfo: 'Contact Information',
    address: 'Address',
    addressText: 'Denizli, Turkey',
    email: 'Email',
    phone: 'Phone',
    followUs: 'Follow Us',
    certificates: 'Certificates',
    paymentMethods: 'Payment Methods',
    allRightsReserved: 'All rights reserved.',
    madeWith: 'Made with quality Turkish craftsmanship'
  },
  tr: {
    company: 'Şirket',
    home: 'Ana Sayfa',
    products: 'Ürünler',
    about: 'Hakkımızda',
    contact: 'İletişim',
    customerPanel: 'Müşteri Paneli',
    contactInfo: 'İletişim Bilgileri',
    address: 'Adres',
    addressText: 'Denizli, Türkiye',
    email: 'E-posta',
    phone: 'Telefon',
    followUs: 'Bizi Takip Edin',
    certificates: 'Sertifikalar',
    paymentMethods: 'Ödeme Yöntemleri',
    allRightsReserved: 'Tüm hakları saklıdır.',
    madeWith: 'Kaliteli Türk el sanatlarıyla yapılmıştır'
  }
};

const Footer = ({ language }) => {
  const t = translations[language];

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
    <footer className="section-beige border-t border-gray-200">
      <div className="container">
        <div className="grid-4 pb-12">
          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.company}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-gray-800 transition-colors">
                  {t.home}
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-600 hover:text-gray-800 transition-colors">
                  {t.products}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-gray-800 transition-colors">
                  {t.about}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-gray-800 transition-colors">
                  {t.contact}
                </Link>
              </li>
              <li>
                <Link to="/customer-panel" className="text-gray-600 hover:text-gray-800 transition-colors">
                  {t.customerPanel}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.contactInfo}</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-600">
                <MapPin size={16} />
                <span>{t.addressText}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={16} />
                <button
                  onClick={() => handleContactClick('email')}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  sales@oviahome.info
                </button>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={16} />
                <button
                  onClick={() => handleContactClick('whatsapp')}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  +90 546 431 37 45
                </button>
              </li>
            </ul>
          </div>

          {/* Certificates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.certificates}</h3>
            <div className="space-y-2">
              <div className="certificate-badge">OEKO-TEX</div>
              <div className="certificate-badge">GOTS</div>
              <div className="certificate-badge">Organic Cotton</div>
              <div className="certificate-badge">ISO 9001</div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t.paymentMethods}</h3>
            <ul className="space-y-2 text-gray-600">
              <li>Credit Card</li>
              <li>Bank Transfer</li>
              <li>PayPal</li>
              <li>Letter of Credit (LC)</li>
            </ul>
            
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">{t.followUs}</h4>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleContactClick('instagram')}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors bg-white rounded-full shadow-sm"
                  title="Instagram"
                >
                  <Instagram size={18} />
                </button>
                <button
                  onClick={() => handleContactClick('whatsapp')}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors bg-white rounded-full shadow-sm"
                  title="WhatsApp"
                >
                  <MessageCircle size={18} />
                </button>
                <button
                  onClick={() => handleContactClick('email')}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors bg-white rounded-full shadow-sm"
                  title="Email"
                >
                  <Mail size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-600 text-sm mb-4 md:mb-0">
            © 2024 Ovia Home. {t.allRightsReserved}
          </div>
          <div className="text-gray-600 text-sm">
            {t.madeWith} 🇹🇷
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;