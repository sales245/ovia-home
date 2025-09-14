import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MessageCircle, Star, Award, Leaf } from 'lucide-react';
import { translations } from '../translations';

const products = [
  {
    id: 1,
    name: 'Premium Cotton Bathrobe',
    category: 'bathrobes',
    image: 'https://images.unsplash.com/photo-1713881676551-b16f22ce4719?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxjb3R0b24lMjBiYXRocm9iZXN8ZW58MHx8fHwxNzU3ODY5NDU1fDA&ixlib=rb-4.1.0&q=85',
    features: ['100% Organic Cotton', 'OEKO-TEX Certified', 'Multiple Sizes'],
    badges: ['organicCotton', 'certified']
  },
  {
    id: 2,
    name: 'Bamboo Luxury Bathrobe',
    category: 'bathrobes',
    image: 'https://images.unsplash.com/photo-1639654803583-7c616d7e0b6c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwyfHxjb3R0b24lMjBiYXRocm9iZXN8ZW58MHx8fHwxNzU3ODY5NDU1fDA&ixlib=rb-4.1.0&q=85',
    features: ['Bamboo Fiber', 'Antibacterial', 'Eco-Friendly'],
    badges: ['sustainable', 'premium']
  },
  {
    id: 3,
    name: 'Turkish Cotton Towel Set',
    category: 'towels',
    image: 'https://images.unsplash.com/photo-1649446326998-a16524cfa667?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB0b3dlbHN8ZW58MHx8fHwxNzU3ODY5NDU5fDA&ixlib=rb-4.1.0&q=85',
    features: ['Turkish Cotton', 'High Absorption', 'Various Colors'],
    badges: ['premium', 'certified']
  },
  {
    id: 4,
    name: 'Spa Luxury Towels',
    category: 'towels',
    image: 'https://images.unsplash.com/photo-1700918232124-f64da19e73eb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjB0b3dlbHN8ZW58MHx8fHwxNzU3ODY5NDU5fDA&ixlib=rb-4.1.0&q=85',
    features: ['Hotel Quality', 'Ultra Soft', 'Quick Dry'],
    badges: ['premium', 'certified']
  },
  {
    id: 5,
    name: 'Premium Bedding Set',
    category: 'bedding',
    image: 'https://images.unsplash.com/photo-1689626698503-47934d011285?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHw0fHxiZWRkaW5nJTIwc2V0c3xlbnwwfHx8fDE3NTc4Njk0NjR8MA&ixlib=rb-4.1.0&q=85',
    features: ['Egyptian Cotton', 'Thread Count 800', 'Complete Set'],
    badges: ['premium', 'organicCotton']
  },
  {
    id: 6,
    name: 'Organic Bedding Collection',
    category: 'bedding',
    image: 'https://images.pexels.com/photos/6603475/pexels-photo-6603475.jpeg',
    features: ['100% Organic', 'GOTS Certified', 'Hypoallergenic'],
    badges: ['organicCotton', 'certified', 'sustainable']
  },
  {
    id: 7,
    name: 'Traditional Turkish Carpets',
    category: 'home-decor',
    image: 'https://images.unsplash.com/photo-1638368888223-4efbc65b1153?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxUdXJraXNoJTIwdGV4dGlsZXN8ZW58MHx8fHwxNzU3ODY5NDQ4fDA&ixlib=rb-4.1.0&q=85',
    features: ['Hand Woven', 'Traditional Patterns', 'Various Sizes'],
    badges: ['premium', 'certified']
  },
  {
    id: 8,
    name: 'Decorative Cushions',
    category: 'home-decor',
    image: 'https://images.unsplash.com/photo-1610643073583-332a16a0968a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxUdXJraXNoJTIwdGV4dGlsZXN8ZW58MHx8fHwxNzU3ODY5NDQ4fDA&ixlib=rb-4.1.0&q=85',
    features: ['Natural Dyes', 'Embroidered', 'Multiple Designs'],
    badges: ['sustainable', 'premium']
  }
];

const ProductsPage = ({ language }) => {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const t = translations[language] || translations.en;

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'organicCotton':
        return 'bg-green-100 text-green-800';
      case 'premium':
        return 'bg-amber-100 text-amber-800';
      case 'certified':
        return 'bg-blue-100 text-blue-800';
      case 'sustainable':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'organicCotton':
        return <Leaf size={14} />;
      case 'premium':
        return <Star size={14} />;
      case 'certified':
        return <Award size={14} />;
      case 'sustainable':
        return <Leaf size={14} />;
      default:
        return null;
    }
  };

  // Badge translations
  const badgeTranslations = {
    organicCotton: {
      en: 'Organic Cotton', tr: 'Organik Pamuk', de: 'Bio-Baumwolle', fr: 'Coton Bio', 
      it: 'Cotone Organico', es: 'Algodón Orgánico', pl: 'Bawełna Organiczna', 
      ru: 'Органический хлопок', bg: 'Органичен памук', el: 'Οργανικό Βαμβάκι', 
      pt: 'Algodão Orgânico', ar: 'قطن عضوي'
    },
    premium: {
      en: 'Premium', tr: 'Premium', de: 'Premium', fr: 'Premium', 
      it: 'Premium', es: 'Premium', pl: 'Premium', 
      ru: 'Премиум', bg: 'Премиум', el: 'Premium', 
      pt: 'Premium', ar: 'مميز'
    },
    certified: {
      en: 'Certified', tr: 'Sertifikalı', de: 'Zertifiziert', fr: 'Certifié', 
      it: 'Certificato', es: 'Certificado', pl: 'Certyfikowany', 
      ru: 'Сертифицированный', bg: 'Сертифициран', el: 'Πιστοποιημένο', 
      pt: 'Certificado', ar: 'معتمد'
    },
    sustainable: {
      en: 'Sustainable', tr: 'Sürdürülebilir', de: 'Nachhaltig', fr: 'Durable', 
      it: 'Sostenibile', es: 'Sostenible', pl: 'Zrównoważony', 
      ru: 'Устойчивый', bg: 'Устойчив', el: 'Βιώσιμο', 
      pt: 'Sustentável', ar: 'مستدام'
    }
  };

  return (
    <div className="header-spacing">
      {/* Hero Section */}
      <section className="section section-light">
        <div className="container">
          <div className="text-center mb-16">
            <h1 className="mb-6">{t.ourProducts}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t.productsDesc || 'Discover our comprehensive range of premium Turkish home textiles, crafted with traditional techniques and modern quality standards.'}
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-full transition-all ${
                selectedCategory === 'all' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-amber-600'
              }`}
            >
              {t.allCategories || 'All Categories'}
            </button>
            <button
              onClick={() => setSelectedCategory('bathrobes')}
              className={`px-6 py-3 rounded-full transition-all ${
                selectedCategory === 'bathrobes' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-amber-600'
              }`}
            >
              {t.bathrobes}
            </button>
            <button
              onClick={() => setSelectedCategory('towels')}
              className={`px-6 py-3 rounded-full transition-all ${
                selectedCategory === 'towels' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-amber-600'
              }`}
            >
              {t.towels}
            </button>
            <button
              onClick={() => setSelectedCategory('bedding')}
              className={`px-6 py-3 rounded-full transition-all ${
                selectedCategory === 'bedding' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-amber-600'
              }`}
            >
              {t.bedding}
            </button>
            <button
              onClick={() => setSelectedCategory('home-decor')}
              className={`px-6 py-3 rounded-full transition-all ${
                selectedCategory === 'home-decor' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-amber-600'
              }`}
            >
              {t.homeDecor}
            </button>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section section-beige">
        <div className="container">
          <div className="grid-3 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="card group hover:scale-105 transition-transform duration-300">
                <div className="relative mb-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {product.badges.map((badge) => (
                      <span
                        key={badge}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(badge)}`}
                      >
                        {getBadgeIcon(badge)}
                        {badgeTranslations[badge]?.[language] || badgeTranslations[badge]?.en || badge}
                      </span>
                    ))}
                  </div>
                </div>
                
                <h3 className="mb-3 group-hover:text-amber-700 transition-colors">
                  {product.name}
                </h3>
                
                <ul className="text-sm text-gray-600 mb-4 space-y-1">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <div className="text-center text-sm text-gray-500 mb-4">
                  {t.contactForPricing || 'Contact for Wholesale Pricing'}
                </div>
                
                <Link
                  to={`/contact?product=${encodeURIComponent(product.name)}`}
                  className="btn-primary w-full text-center"
                >
                  <MessageCircle className="inline mr-2" size={16} />
                  {t.inquireNow || 'Inquire Now'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Features */}
      <section className="section section-light">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="mb-6">{t.productFeatures || 'Product Features'}</h2>
          </div>
          <div className="grid-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="text-green-600" size={24} />
              </div>
              <h3 className="mb-3">{t.qualityMaterials || 'Quality Materials'}</h3>
              <p className="text-gray-600">Premium natural fibers sourced sustainably</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-amber-600" size={24} />
              </div>
              <h3 className="mb-3">{t.expertCraftsmanship || 'Expert Craftsmanship'}</h3>
              <p className="text-gray-600">Traditional Turkish weaving techniques</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-blue-600" size={24} />
              </div>
              <h3 className="mb-3">{t.certifiedSafe || 'Certified Safe'}</h3>
              <p className="text-gray-600">OEKO-TEX and GOTS certified products</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="text-emerald-600" size={24} />
              </div>
              <h3 className="mb-3">{t.sustainableProduction || 'Sustainable Production'}</h3>
              <p className="text-gray-600">Environmentally responsible manufacturing</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;