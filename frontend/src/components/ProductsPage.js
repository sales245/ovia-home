import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Tag, 
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
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

  // API endpoint - Use environment variable or fallback to current domain
  const API = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : '/api';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching from:', `${API}/products`);
        
        const productsResponse = await fetch(`${API}/products`);
        console.log('Response status:', productsResponse.status);
        
        const text = await productsResponse.text();
        console.log('Response text:', text);
        
        if (!productsResponse.ok) {
          throw new Error(`HTTP error! status: ${productsResponse.status}`);
        }
        
        const productsData = JSON.parse(text);
        console.log('Parsed products:', productsData);
        setProducts(productsData);

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
      {/* Products Section */}
      <div className="header-spacing py-12">
        <div className="container">
          <h1 className="text-4xl font-bold mb-8">{t.ourProducts}</h1>
          
          {/* Search and Filters Bar */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder={t.searchProducts}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="min-w-[200px]">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full py-2 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="all">{t.allCategories}</option>
                  <option value="bathrobes">{t.bathrobes}</option>
                  <option value="towels">{t.towels}</option>
                  <option value="bedding">{t.bedding}</option>
                  <option value="homeDecor">{t.homeDecor}</option>
                </select>
              </div>
              
              {/* Sort Options */}
              <div className="min-w-[200px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full py-2 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="default">{t.sortDefault}</option>
                  <option value="price_asc">{t.sortPriceLow}</option>
                  <option value="price_desc">{t.sortPriceHigh}</option>
                </select>
              </div>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden mt-4 flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 w-full justify-center"
            >
              <Filter size={18} />
              {t.filters}
            </button>

            {/* Category Filters - Improved visibility */}
            <div className={`mt-4 flex flex-wrap justify-center gap-3 ${showFilters ? 'block' : 'hidden md:flex'}`}>
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-3 rounded-full transition-all font-medium ${
                  selectedCategory === 'all' 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-gray-100 text-gray-800 border-2 border-gray-300 hover:border-primary hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {t.allProducts}
              </button>
              <button
                onClick={() => setSelectedCategory('bathrobes')}
                className={`px-6 py-3 rounded-full transition-all font-medium ${
                  selectedCategory === 'bathrobes' 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-gray-100 text-gray-800 border-2 border-gray-300 hover:border-primary hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {t.bathrobes}
              </button>
              <button
                onClick={() => setSelectedCategory('towels')}
                className={`px-6 py-3 rounded-full transition-all font-medium ${
                  selectedCategory === 'towels' 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-gray-100 text-gray-800 border-2 border-gray-300 hover:border-primary hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {t.towels}
              </button>
              <button
                onClick={() => setSelectedCategory('bedding')}
                className={`px-6 py-3 rounded-full transition-all font-medium ${
                  selectedCategory === 'bedding' 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-gray-100 text-gray-800 border-2 border-gray-300 hover:border-primary hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {t.bedding}
              </button>
              <button
                onClick={() => setSelectedCategory('home-decor')}
                className={`px-6 py-3 rounded-full transition-all font-medium ${
                  selectedCategory === 'home-decor' 
                    ? 'bg-primary text-white shadow-md' 
                    : 'bg-gray-100 text-gray-800 border-2 border-gray-300 hover:border-primary hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {t.homeDecor}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="section">
        <div className="container">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">{t.noProductsFound}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => {
                const productName = product.name[language] || product.name.en;
                return (
                  <div key={product.id} className="group flex flex-col">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full border border-gray-100">
                      {/* Product Image */}
                      <div className="relative w-full h-64 bg-gray-100">
                        <img
                          src={product.image}
                          alt={product.name[language] || product.name.en}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Badges */}
                        {product.badges && product.badges.length > 0 && (
                          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                            {product.badges.map((badge) => (
                              <span
                                key={badge}
                                className={`px-3 py-1 text-xs font-medium rounded-full shadow-md ${getBadgeColors(badge)}`}
                              >
                                {badgeTranslations[badge]?.[language] || badgeTranslations[badge]?.en || badge}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Stock Status */}
                        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm
                          ${product.in_stock ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}
                        >
                          {product.in_stock ? t.inStock : t.outOfStock}
                        </div>
                      </div>
                      
                      {/* Product Info */}
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
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
                          className="w-full bg-primary text-white rounded-lg py-3 px-4 flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                        >
                          <ShoppingCart size={20} />
                          <span>{t.getQuote}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="section section-beige">
        <div className="container text-center">
          <h2 className="mb-4">{t.customOrdersTitle}</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t.customOrdersDescription}
          </p>
          <Link to="/contact" className="btn-primary">
            {t.contactUs}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;

/*
This is a React component for displaying products in a grid layout.
It features:
- Search functionality
- Category filtering
- Price tier display (Alibaba style)
- WhatsApp integration for quotes
- Responsive grid layout
*/