import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, Instagram, MapPin, Phone } from 'lucide-react';
import { translations } from '../translations';

const Footer = ({ language }) => {
  const t = translations[language] || translations.en;

  // Footer-specific translations
  const footerTranslations = {
    company: {
      en: 'Company', tr: 'Şirket', de: 'Unternehmen', fr: 'Entreprise', 
      it: 'Azienda', es: 'Empresa', pl: 'Firma', ru: 'Компания', 
      bg: 'Компания', el: 'Εταιρεία', pt: 'Empresa', ar: 'الشركة'
    },
    addressText: {
      en: 'Denizli, Turkey', tr: 'Denizli, Türkiye', de: 'Denizli, Türkei', 
      fr: 'Denizli, Turquie', it: 'Denizli, Turchia', es: 'Denizli, Turquía', 
      pl: 'Denizli, Turcja', ru: 'Денизли, Турция', bg: 'Денизли, Турция', 
      el: 'Ντενιζλί, Τουρκία', pt: 'Denizli, Turquia', ar: 'دنيزلي، تركيا'
    },
    followUs: {
      en: 'Follow Us', tr: 'Bizi Takip Edin', de: 'Folgen Sie uns', 
      fr: 'Suivez-nous', it: 'Seguici', es: 'Síguenos', pl: 'Obserwuj nas', 
      ru: 'Подписывайтесь', bg: 'Последвайте ни', el: 'Ακολουθήστε μας', 
      pt: 'Siga-nos', ar: 'تابعنا'
    },
    paymentMethods: {
      en: 'Payment Methods', tr: 'Ödeme Yöntemleri', de: 'Zahlungsmethoden', 
      fr: 'Modes de paiement', it: 'Metodi di pagamento', es: 'Métodos de pago', 
      pl: 'Metody płatności', ru: 'Способы оплаты', bg: 'Начини на плащане', 
      el: 'Τρόποι πληρωμής', pt: 'Métodos de pagamento', ar: 'طرق الدفع'
    },
    allRightsReserved: {
      en: 'All rights reserved.', tr: 'Tüm hakları saklıdır.', de: 'Alle Rechte vorbehalten.', 
      fr: 'Tous droits réservés.', it: 'Tutti i diritti riservati.', es: 'Todos los derechos reservados.', 
      pl: 'Wszelkie prawa zastrzeżone.', ru: 'Все права защищены.', bg: 'Всички права запазени.', 
      el: 'Όλα τα δικαιώματα διατηρούνται.', pt: 'Todos os direitos reservados.', ar: 'جميع الحقوق محفوظة.'
    },
    madeWith: {
      en: 'Made with quality Turkish craftsmanship', tr: 'Kaliteli Türk el sanatlarıyla yapılmıştır', 
      de: 'Mit hochwertiger türkischer Handwerkskunst gefertigt', fr: 'Fabriqué avec un savoir-faire turc de qualité', 
      it: 'Realizzato con artigianato turco di qualità', es: 'Hecho con artesanía turca de calidad', 
      pl: 'Wykonane z wysokiej jakości tureckim rzemiosłem', ru: 'Изготовлено с качественным турецким мастерством', 
      bg: 'Направено с качествено турско майсторство', el: 'Φτιαγμένο με ποιοτική τουρκική χειροτεχνία', 
      pt: 'Feito com artesanato turco de qualidade', ar: 'صنع بحرفية تركية عالية الجودة'
    }
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
    <footer className="section-beige border-t border-gray-200">
      <div className="container">
        <div className="grid-4 pb-12">
          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold text-ink mb-4">
              {footerTranslations.company[language] || footerTranslations.company.en}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-ink-2 hover:text-primary transition-colors">
                  {t.home}
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-ink-2 hover:text-primary transition-colors">
                  {t.products}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-ink-2 hover:text-primary transition-colors">
                  {t.about}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-ink-2 hover:text-primary transition-colors">
                  {t.contact}
                </Link>
              </li>
              <li>
                <Link to="/customer-panel" className="text-ink-2 hover:text-primary transition-colors">
                  {t.customerPanel}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-ink mb-4">{t.contactInfo}</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-ink-2">
                <MapPin size={16} />
                <span>{footerTranslations.addressText[language] || footerTranslations.addressText.en}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={16} />
                <button
                  onClick={() => handleContactClick('email')}
                  className="text-ink-2 hover:text-primary transition-colors"
                >
                  sales@oviahome.info
                </button>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={16} />
                <button
                  onClick={() => handleContactClick('whatsapp')}
                  className="text-ink-2 hover:text-primary transition-colors"
                >
                  +90 546 431 37 45
                </button>
              </li>
            </ul>
          </div>

          {/* Certificates */}
          <div>
            <h3 className="text-lg font-semibold text-ink mb-4">{t.certificates}</h3>
            <div className="space-y-2">
              <div className="certificate-badge">OEKO-TEX</div>
              <div className="certificate-badge">GOTS</div>
              <div className="certificate-badge">Organic Cotton</div>
              <div className="certificate-badge">ISO 9001</div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="text-lg font-semibold text-ink mb-4">
              {footerTranslations.paymentMethods[language] || footerTranslations.paymentMethods.en}
            </h3>
            <ul className="space-y-2 text-ink-2">
              <li>Credit Card</li>
              <li>Bank Transfer</li>
              <li>PayPal</li>
              <li>Letter of Credit (LC)</li>
            </ul>
            
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-ink mb-2">
                {footerTranslations.followUs[language] || footerTranslations.followUs.en}
              </h4>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleContactClick('instagram')}
                  className="p-2 text-ink-2 hover:text-primary transition-colors bg-white rounded-full shadow-sm"
                  title="Instagram"
                >
                  <Instagram size={18} />
                </button>
                <button
                  onClick={() => handleContactClick('whatsapp')}
                  className="p-2 text-ink-2 hover:text-primary transition-colors bg-white rounded-full shadow-sm"
                  title="WhatsApp"
                >
                  <MessageCircle size={18} />
                </button>
                <button
                  onClick={() => handleContactClick('email')}
                  className="p-2 text-ink-2 hover:text-primary transition-colors bg-white rounded-full shadow-sm"
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
          <div className="text-ink-2 text-sm mb-4 md:mb-0">
            © 2025 Ovia Home. {footerTranslations.allRightsReserved[language] || footerTranslations.allRightsReserved.en}
          </div>
          <div className="text-ink-2 text-sm">
            {footerTranslations.madeWith[language] || footerTranslations.madeWith.en} 🇹🇷
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;