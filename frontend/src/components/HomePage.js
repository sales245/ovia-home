import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Globe, Award, Shield, Users } from 'lucide-react';
import { translations } from '../translations';
import HeroSlider from './HeroSlider';



const HomePage = ({ stats = {}, language }) => {
  const t = translations[language];

  // Hero slider slides - Home Textile themed (Bedroom, Bathroom, Living Room)
  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1920&q=85',
      title: {
        en: 'Luxurious Bedding',
        tr: 'Lüks Yatak Takımları',
        de: 'Luxuriöse Bettwäsche',
        fr: 'Literie Luxueuse'
      },
      subtitle: {
        en: 'Sleep in Comfort',
        tr: 'Konforlu Uyku',
        de: 'Komfortabel Schlafen',
        fr: 'Dormir Confortablement'
      },
      description: {
        en: 'Premium bed linens, duvets, and pillows for the perfect night\'s sleep',
        tr: 'Mükemmel bir gece uykusu için premium yatak takımları, yorganlar ve yastıklar',
        de: 'Premium-Bettwäsche, Bettdecken und Kissen für den perfekten Schlaf',
        fr: 'Linge de lit, couettes et oreillers premium pour un sommeil parfait'
      },
      buttonText: {
        en: 'Shop Bedding',
        tr: 'Yatak Ürünleri',
        de: 'Bettwäsche Kaufen',
        fr: 'Acheter Literie'
      },
      buttonLink: '/products'
    },
    {
      image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1920&q=85',
      title: {
        en: 'Spa-Quality Towels',
        tr: 'Spa Kalitesinde Havlular',
        de: 'Handtücher in Spa-Qualität',
        fr: 'Serviettes Qualité Spa'
      },
      subtitle: {
        en: 'Bathroom Essentials',
        tr: 'Banyo Ürünleri',
        de: 'Badezimmer-Essentials',
        fr: 'Essentiels de Salle de Bain'
      },
      description: {
        en: 'Soft, absorbent towels and bathrobes crafted from 100% premium Turkish cotton',
        tr: '%100 premium Türk pamuğundan üretilmiş yumuşak, emici havlular ve bornozlar',
        de: 'Weiche, saugfähige Handtücher und Bademäntel aus 100% Premium-Baumwolle',
        fr: 'Serviettes et peignoirs doux et absorbants en 100% coton turc premium'
      },
      buttonText: {
        en: 'Explore Towels',
        tr: 'Havluları Keşfet',
        de: 'Handtücher Entdecken',
        fr: 'Découvrir les Serviettes'
      },
      buttonLink: '/products'
    },
    {
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=85',
      title: {
        en: 'Elegant Living Spaces',
        tr: 'Zarif Yaşam Alanları',
        de: 'Elegante Wohnräume',
        fr: 'Espaces de Vie Élégants'
      },
      subtitle: {
        en: 'Home Comfort',
        tr: 'Ev Konforu',
        de: 'Wohnkomfort',
        fr: 'Confort Maison'
      },
      description: {
        en: 'Transform your living room with decorative cushions, throws, and home textiles',
        tr: 'Dekoratif yastıklar, örtüler ve ev tekstilleri ile oturma odanızı dönüştürün',
        de: 'Verwandeln Sie Ihr Wohnzimmer mit dekorativen Kissen, Decken und Heimtextilien',
        fr: 'Transformez votre salon avec des coussins décoratifs, des plaids et des textiles'
      },
      buttonText: {
        en: 'View Collection',
        tr: 'Koleksiyonu Gör',
        de: 'Kollektion Ansehen',
        fr: 'Voir la Collection'
      },
      buttonLink: '/products'
    }
  ];

  return (
    <div className="header-spacing">
      {/* Hero Section with Slider */}
      <section className="section section-light relative overflow-hidden">
        <div className="container relative z-10">
          <HeroSlider slides={heroSlides} language={language} autoPlayInterval={6000} />
        </div>
      </section>

      {/* Trust Statistics */}
      <section className="section section-beige">
        <div className="container">
          <div className="grid-4 text-center">
            <div className="trust-badge">
              <div className="stat-number">{stats.countries_served || '30'}+</div>
              <div className="stat-label">{t.countries}</div>
            </div>
            <div className="trust-badge">
              <div className="stat-number">{stats.years_experience || '15'}+</div>
              <div className="stat-label">{t.yearsExp}</div>
            </div>
            <div className="trust-badge">
              <div className="stat-number">8+</div>
              <div className="stat-label">{t.certificates}</div>
            </div>
            <div className="trust-badge">
              <div className="stat-number">{stats.customers || '500'}+</div>
              <div className="stat-label">{t.customers}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section section-light">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="mb-6">{t.whyChooseUs}</h2>
          </div>
          <div className="grid-4">
            <div className="card text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-primary" size={24} />
              </div>
              <h3 className="mb-3">{t.qualityCraftsmanship}</h3>
              <p>{t.qualityDesc}</p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-secondary" size={24} />
              </div>
              <h3 className="mb-3">{t.naturalMaterials}</h3>
              <p>{t.materialsDesc}</p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-primary" size={24} />
              </div>
              <h3 className="mb-3">{t.certifiedQuality}</h3>
              <p>{t.certifiedDesc}</p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="text-secondary" size={24} />
              </div>
              <h3 className="mb-3">{t.globalReach}</h3>
              <p>{t.reachDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="section section-cream">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="mb-6">{t.ourProducts}</h2>
          </div>
          <div className="grid-2 gap-8">
            <Link to="/products?category=bathrobes" className="group">
              <div className="card hover:scale-105 transition-transform duration-300">
                <img
                  src="https://images.unsplash.com/photo-1713881676551-b16f22ce4719?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxjb3R0b24lMjBiYXRocm9iZXN8ZW58MHx8fHwxNzU3ODY5NDU1fDA&ixlib=rb-4.1.0&q=85"
                  alt="Bathrobes"
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <h3 className="mb-2 group-hover:text-primary transition-colors">{t.bathrobes}</h3>
                <p className="text-gray-600">{t.bathrobesDesc}</p>
              </div>
            </Link>
            
            <Link to="/products?category=towels" className="group">
              <div className="card hover:scale-105 transition-transform duration-300">
                <img
                  src="https://images.unsplash.com/photo-1649446326998-a16524cfa667?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB0b3dlbHN8ZW58MHx8fHwxNzU3ODY5NDU5fDA&ixlib=rb-4.1.0&q=85"
                  alt="Towels"
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <h3 className="mb-2 group-hover:text-primary transition-colors">{t.towels}</h3>
                <p className="text-gray-600">{t.towelsDesc}</p>
              </div>
            </Link>
            
            <Link to="/products?category=bedding" className="group">
              <div className="card hover:scale-105 transition-transform duration-300">
                <img
                  src="https://images.unsplash.com/photo-1689626698503-47934d011285?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHw0fHxiZWRkaW5nJTIwc2V0c3xlbnwwfHx8fDE3NTc4Njk0NjR8MA&ixlib=rb-4.1.0&q=85"
                  alt="Bedding"
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <h3 className="mb-2 group-hover:text-primary transition-colors">{t.bedding}</h3>
                <p className="text-gray-600">{t.beddingDesc}</p>
              </div>
            </Link>
            
            <Link to="/products?category=home-decor" className="group">
              <div className="card hover:scale-105 transition-transform duration-300">
                <img
                  src="https://images.unsplash.com/photo-1700918232124-f64da19e73eb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjB0b3dlbHN8ZW58MHx8fHwxNzU3ODY5NDU5fDA&ixlib=rb-4.1.0&q=85"
                  alt="Home Decor"
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <h3 className="mb-2 group-hover:text-primary transition-colors">{t.homeDecor}</h3>
                <p className="text-gray-600">{t.decorDesc}</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section section-light">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="mb-6">Ready to Partner with Us?</h2>
            <p className="text-xl mb-8 text-gray-600">
              Join hundreds of satisfied wholesale partners worldwide. Get a custom quote for your business needs.
            </p>
            <Link to="/contact" className="btn-primary text-lg px-8 py-4">
              Get Your Custom Quote <ArrowRight className="inline ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;