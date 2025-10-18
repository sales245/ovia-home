import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Filter, X } from 'lucide-react';
import { translations } from '../translations';

// Badge colors helper
const getBadgeColors = (badge) => {
  switch (badge) {
    case 'organicCotton':
      return 'bg-green-100 text-green-800';
    case 'premium':
      return 'bg-orange-100 text-primary';
    case 'certified':
      return 'bg-blue-100 text-blue-800';
    case 'sustainable':
      return 'bg-emerald-100 text-emerald-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const ProductsPage = ({ language }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const t = translations[language] || translations.en;

  // Badge translations
  const badgeTranslations = {
    organicCotton: {
      en: 'Organic Cotton',
      tr: 'Organik Pamuk',
      de: 'Bio-Baumwolle',
      fr: 'Coton Bio',
      it: 'Cotone Biologico',
      es: 'Algodón Orgánico',
      pl: 'Bawełna Organiczna',
      ru: 'Органический Хлопок',
      bg: 'Органичен Памук',
      el: 'Βιολογικό Βαμβάκι',
      pt: 'Algodão Orgânico',
      ar: 'قطن عضوي'
    },
    premium: {
      en: 'Premium',
      tr: 'Premium',
      de: 'Premium',
      fr: 'Premium',
      it: 'Premium',
      es: 'Premium',
      pl: 'Premium',
      ru: 'Премиум',
      bg: 'Премиум',
      el: 'Premium',
      pt: 'Premium',
      ar: 'فاخر'
    },
    certified: {
      en: 'Certified',
      tr: 'Sertifikalı',
      de: 'Zertifiziert',
      fr: 'Certifié',
      it: 'Certificato',
      es: 'Certificado',
      pl: 'Certyfikowany',
      ru: 'Сертифицированный',
      bg: 'Сертифициран',
      el: 'Πιστοποιημένο',
      pt: 'Certificado',
      ar: 'معتمد'
    },
    sustainable: {
      en: 'Sustainable',
      tr: 'Sürdürülebilir',
      de: 'Nachhaltig',
      fr: 'Durable',
      it: 'Sostenibile',
      es: 'Sostenible',
      pl: 'Zrównoważony',
      ru: 'Экологичный',
      bg: 'Устойчив',
      el: 'Βιώσιμο',
      pt: 'Sustentável',
      ar: 'مستدام'
    }
  };

  // WhatsApp contact for products
  const whatsappNumber = '+905464313745';
  
  const handleWhatsAppClick = (product) => {
    const productName = product.name[language] || product.name.en;
    
    let messageText = `Merhaba! ${productName} ürününüz hakkında bilgi almak istiyorum.`;
    
    // Add price tier information if available
    if (product.priceTiers && product.priceTiers.length > 0) {
      const lowestTier = product.priceTiers[0];
      const highestTier = product.priceTiers[product.priceTiers.length - 1];
      messageText += `\n\nMiktara bağlı fiyatlandırmayı inceledim:\n`;
      messageText += `${lowestTier.quantity} adet: $${lowestTier.price}\n`;
      messageText += `${highestTier.quantity}+ adet: $${highestTier.price}\n\n`;
      messageText += `Bu fiyatlar güncel mi? Sipariş vermek istiyorum.`;
    } else {
      messageText += ` Toptan fiyat ve minimum sipariş miktarını öğrenebilir miyim?`;
    }

    const message = encodeURIComponent(messageText);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  // API endpoint is at the same domain as the frontend in production
  const API = '/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products and categories in parallel
        const [productsResponse, categoriesResponse] = await Promise.all([
          fetch(`${API}/products`),
          fetch(`${API}/categories`)
        ]);

        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData);
        }

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API]);

  // Filter products based on selected category and search term
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      (product.name[language] && product.name[language].toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.name.en && product.name.en.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'organicCotton':
        return 'bg-green-100 text-green-800';
      case 'premium':
        return 'bg-orange-100 text-primary';
      case 'certified':
        return 'bg-blue-100 text-blue-800';
      case 'sustainable':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="header-spacing">
        <div className="container section">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="header-spacing">
      {/* Hero Section */}
      <section className="section section-light">
        <div className="container text-center">
          <h1 className="mb-6">{t.ourProducts}</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t.productsDescription}
          </p>
          
          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={t.searchProducts}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50"
              >
                <Filter size={18} />
                {t.filters}
              </button>
            </div>

            {/* Category Filters */}
            <div className={`flex flex-wrap justify-center gap-3 mb-8 ${showFilters ? 'block' : 'hidden md:flex'}`}>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-3 rounded-full transition-all ${
                  selectedCategory === 'all' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-ink-2 border border-gray-300 hover:border-primary hover:text-primary'
                }`}
              >
                {t.allProducts}
              </button>
              <button
                onClick={() => setSelectedCategory('bathrobes')}
                className={`px-6 py-3 rounded-full transition-all ${
                  selectedCategory === 'bathrobes' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-ink-2 border border-gray-300 hover:border-primary hover:text-primary'
                }`}
              >
                {t.bathrobes}
              </button>
              <button
                onClick={() => setSelectedCategory('towels')}
                className={`px-6 py-3 rounded-full transition-all ${
                  selectedCategory === 'towels' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-ink-2 border border-gray-300 hover:border-primary hover:text-primary'
                }`}
              >
                {t.towels}
              </button>
              <button
                onClick={() => setSelectedCategory('bedding')}
                className={`px-6 py-3 rounded-full transition-all ${
                  selectedCategory === 'bedding' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-ink-2 border border-gray-300 hover:border-primary hover:text-primary'
                }`}
              >
                {t.bedding}
              </button>
              <button
                onClick={() => setSelectedCategory('home-decor')}
                className={`px-6 py-3 rounded-full transition-all ${
                  selectedCategory === 'home-decor' 
                    ? 'bg-primary text-white' 
                    : 'bg-white text-ink-2 border border-gray-300 hover:border-primary hover:text-primary'
                }`}
              >
                {t.homeDecor}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="section">
        <div className="container">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">{t.noProductsFound}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="group">
                  <div className="card hover:scale-105 transition-transform duration-300">
                    <div className="relative">
                      <img
                        src={product.image}
                        alt={product.name[language] || product.name.en}
                        className="w-full h-64 object-cover rounded-xl mb-4"
                      />
                      
                      {/* Badges */}
                      {product.badges && (
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {product.badges.map((badge) => (
                            <span
                              key={badge}
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getBadgeColor(badge)}`}
                            >
                              {badgeTranslations[badge]?.[language] || badgeTranslations[badge]?.en || badge}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <h3 className="mb-3 group-hover:text-primary transition-colors">
                      {product.name[language] || product.name.en}
                    </h3>
                    
                    {/* Features */}
                    {product.features && product.features[language] && (
                      <ul className="text-gray-600 mb-4 space-y-1">
                        {product.features[language].slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                    
                    {/* Price Info - Alibaba Style */}
                    <div className="mb-4">
                      {product.priceTiers && product.priceTiers.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                              <tr>
                                <th className="px-4 py-2 text-sm text-gray-600">{t.orderQuantity}</th>
                                <th className="px-4 py-2 text-sm text-gray-600">{t.unitPrice}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {product.priceTiers.map((tier, index) => (
                                <tr key={index} className="border-b last:border-b-0">
                                  <td className="px-4 py-2 text-sm text-gray-800">
                                    ≥ {tier.quantity} {t.pieces}
                                  </td>
                                  <td className="px-4 py-2 text-sm font-semibold text-primary">
                                    ${tier.price.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <>
                          {product.retail_price && (
                            <div className="text-lg font-semibold text-primary">
                              ${product.retail_price}
                            </div>
                          )}
                          {product.min_wholesale_quantity && (
                            <div className="text-sm text-gray-600">
                              Min. {product.min_wholesale_quantity} {t.pieces}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    {/* WhatsApp Button */}
                    <button 
                      onClick={() => handleWhatsAppClick(product)}
                      className="btn-primary w-full flex items-center justify-center py-3"
                    >
                      <ShoppingCart className="text-primary" size={20} />
                      <span className="ml-2">{t.getQuote}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section section-beige">
        <div className="container text-center">
          <h2 className="mb-4">{t.customOrdersTitle}</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t.customOrdersDescription}
          </p>
          <Link to="/contact" className="btn-primary">
            {t.contactUs}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;