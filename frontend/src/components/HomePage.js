import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Globe, Award, Shield, Users } from 'lucide-react';
import { translations } from '../translations';
import HeroSlider from './HeroSlider';



const HomePage = ({ stats = {}, language }) => {
  const t = translations[language];

  // Hero slider slides - Home Textile themed
  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1920&q=85',
      title: {
        en: 'Luxury Home Textiles',
        tr: 'Lüks Ev Tekstilleri',
        de: 'Luxus-Heimtextilien',
        fr: 'Textiles de Maison de Luxe'
      },
      subtitle: {
        en: 'Comfort Meets Elegance',
        tr: 'Konfor ve Zarafet Bir Arada',
        de: 'Komfort trifft Eleganz',
        fr: 'Le Confort Rencontre l\'Élégance'
      },
      description: {
        en: 'Transform your home with premium Turkish bathrobes, plush towels, and elegant bedding',
        tr: 'Evinizi premium Türk bornozları, pelüş havlular ve zarif yatak takımları ile dönüştürün',
        de: 'Verwandeln Sie Ihr Zuhause mit Premium-Bademänteln, Plüschhandtüchern und eleganter Bettwäsche',
        fr: 'Transformez votre maison avec des peignoirs turcs premium, des serviettes moelleuses et une literie élégante'
      },
      buttonText: {
        en: 'Shop Now',
        tr: 'Alışverişe Başla',
        de: 'Jetzt Einkaufen',
        fr: 'Acheter Maintenant'
      },
      buttonLink: '/products'
    },
    {
      image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=1920&q=85',
      title: {
        en: 'Soft & Sustainable',
        tr: 'Yumuşak ve Sürdürülebilir',
        de: 'Weich & Nachhaltig',
        fr: 'Doux et Durable'
      },
      subtitle: {
        en: '100% Organic Cotton',
        tr: '%100 Organik Pamuk',
        de: '100% Bio-Baumwolle',
        fr: '100% Coton Biologique'
      },
      description: {
        en: 'Eco-friendly towels and linens that feel amazing and care for the planet',
        tr: 'Harika hissettiren ve gezegene özen gösteren çevre dostu havlular ve çarşaflar',
        de: 'Umweltfreundliche Handtücher und Bettwäsche, die sich fantastisch anfühlen',
        fr: 'Serviettes et draps écologiques qui se sentent incroyables'
      },
      buttonText: {
        en: 'Discover',
        tr: 'Keşfet',
        de: 'Entdecken',
        fr: 'Découvrir'
      },
      buttonLink: '/products'
    },
    {
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=85',
      title: {
        en: 'Cozy Living Spaces',
        tr: 'Rahat Yaşam Alanları',
        de: 'Gemütliche Wohnräume',
        fr: 'Espaces de Vie Confortables'
      },
      subtitle: {
        en: 'For Hotels & Homes',
        tr: 'Oteller ve Evler İçin',
        de: 'Für Hotels & Zuhause',
        fr: 'Pour Hôtels et Maisons'
      },
      description: {
        en: 'Wholesale and retail solutions for creating comfortable, stylish living environments',
        tr: 'Rahat ve şık yaşam alanları oluşturmak için toptan ve perakende çözümler',
        de: 'Großhandels- und Einzelhandelslösungen für komfortable, stilvolle Wohnumgebungen',
        fr: 'Solutions en gros et au détail pour créer des environnements de vie confortables et élégants'
      },
      buttonText: {
        en: 'Contact Us',
        tr: 'Bize Ulaşın',
        de: 'Kontakt',
        fr: 'Contactez-Nous'
      },
      buttonLink: '/contact'
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