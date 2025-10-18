import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { translations } from '../translations';

const WholesaleLoginRequired = ({ language }) => {
  const t = translations[language] || translations.en;

  return (
    <div className="header-spacing">
      <div className="container section min-h-[70vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <Lock className="w-16 h-16 text-primary mx-auto" />
          </div>
          <h1 className="text-2xl font-bold mb-4">{t.wholesaleLoginRequired}</h1>
          <p className="text-gray-600 mb-8">
            {t.wholesaleLoginMessage}
          </p>
          <div className="space-y-4">
            <Link
              to="/customer-panel"
              className="btn-primary block w-full text-center py-3"
            >
              {t.login}
            </Link>
            <Link
              to="/contact"
              className="btn-secondary block w-full text-center py-3"
            >
              {t.contactForAccount}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WholesaleLoginRequired;