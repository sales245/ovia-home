import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Globe, Award, Shield, Users } from 'lucide-react';
import { translations } from '../translations';
import HeroSlider from './HeroSlider';



const HomePage = ({ stats = {}, language }) => {
  const t = translations[language];

  // Hero slider slides
  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=1920&q=80',
      title: {
        en: 'Premium Turkish Home Textiles',
        tr: 'Premium Türk Ev Tekstilleri',
        de: 'Premium Türkische Heimtextilien',
        fr: 'Textiles de Maison Turcs Premium'
      },
      subtitle: {
        en: 'Quality & Comfort',
        tr: 'Kalite ve Konfor',
        de: 'Qualität und Komfort',
        fr: 'Qualité et Confort'
      },
      description: {
        en: 'Experience luxury with our handcrafted bathrobes, towels, and home textiles',
        tr: 'El yapımı bornozlarımız, havlularımız ve ev tekstillerimizle lüksü deneyimleyin',
        de: 'Erleben Sie Luxus mit unseren handgefertigten Bademänteln, Handtüchern und Heimtextilien',
        fr: 'Découvrez le luxe avec nos peignoirs, serviettes et textiles de maison faits à la main'
      },
      buttonText: {
        en: 'Explore Collection',
        tr: 'Koleksiyonu Keşfet',
        de: 'Kollektion Erkunden',
        fr: 'Explorer la Collection'
      },
      buttonLink: '/products'
    },
    {
      image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1920&q=80',
      title: {
        en: '100% Organic Cotton',
        tr: '%100 Organik Pamuk',
        de: '100% Bio-Baumwolle',
        fr: '100% Coton Biologique'
      },
      subtitle: {
        en: 'Sustainable & Soft',
        tr: 'Sürdürülebilir ve Yumuşak',
        de: 'Nachhaltig & Weich',
        fr: 'Durable et Doux'
      },
      description: {
        en: 'Eco-friendly materials, certified quality, exceptional comfort for your home',
        tr: 'Çevre dostu malzemeler, sertifikalı kalite, eviniz için olağanüstü konfor',
        de: 'Umweltfreundliche Materialien, zertifizierte Qualität, außergewöhnlicher Komfort',
        fr: 'Matériaux écologiques, qualité certifiée, confort exceptionnel'
      },
      buttonText: {
        en: 'Learn More',
        tr: 'Daha Fazla Bilgi',
        de: 'Mehr Erfahren',
        fr: 'En Savoir Plus'
      },
      buttonLink: '/about'
    },
    {
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80',
      title: {
        en: 'Wholesale & Retail',
        tr: 'Toptan ve Perakende',
        de: 'Großhandel & Einzelhandel',
        fr: 'Vente en Gros et au Détail'
      },
      subtitle: {
        en: 'Flexible Solutions',
        tr: 'Esnek Çözümler',
        de: 'Flexible Lösungen',
        fr: 'Solutions Flexibles'
      },
      description: {
        en: 'Custom orders for hotels, resorts, and retail customers with competitive pricing',
        tr: 'Oteller, tatil köyleri ve perakende müşteriler için rekabetçi fiyatlarla özel siparişler',
        de: 'Individuelle Bestellungen für Hotels, Resorts und Privatkunden mit wettbewerbsfähigen Preisen',
        fr: 'Commandes personnalisées pour hôtels, complexes hôteliers et clients de détail à prix compétitifs'
      },
      buttonText: {
        en: 'Get Quote',
        tr: 'Teklif Al',
        de: 'Angebot Erhalten',
        fr: 'Obtenir un Devis'
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