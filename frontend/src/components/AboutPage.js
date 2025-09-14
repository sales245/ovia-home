import React from 'react';
import { MapPin, Users, Globe, Award, Heart, Target, Eye } from 'lucide-react';

const translations = {
  en: {
    aboutUs: 'About Ovia Home',
    ourStory: 'Our Story',
    storyDesc: 'Founded in the heart of Denizli, Turkey, Ovia Home represents the perfect blend of traditional Turkish textile craftsmanship and modern quality standards. For over 15 years, we have been dedicated to creating premium home textiles that showcase the rich heritage of Turkish weaving and the natural beauty of organic materials.',
    ourMission: 'Our Mission',
    missionDesc: 'To provide the finest Turkish home textiles to wholesale partners worldwide, combining traditional craftsmanship with sustainable practices and modern quality standards. We strive to build lasting relationships with our partners while preserving the artisanal traditions of Turkish textile production.',
    ourVision: 'Our Vision',
    visionDesc: 'To become the leading global ambassador for Turkish home textiles, recognized for our commitment to quality, sustainability, and authentic craftsmanship. We envision a world where traditional textile arts thrive alongside modern innovation.',
    whyTurkishTextiles: 'Why Turkish Textiles?',
    turkishDesc: 'Turkey has been a center of textile excellence for centuries. Our region benefits from ideal cotton-growing conditions, skilled artisans, and a deep understanding of natural fiber processing. This heritage, combined with modern manufacturing techniques, creates textiles of unmatched quality.',
    ourCertificates: 'Our Certificates & Standards',
    productionProcess: 'Our Production Process',
    processStep1: 'Material Selection',
    processStep1Desc: 'Carefully sourced organic cotton, bamboo, and linen',
    processStep2: 'Traditional Weaving',
    processStep2Desc: 'Time-honored Turkish weaving techniques',
    processStep3: 'Quality Control',
    processStep3Desc: 'Rigorous testing and inspection standards',
    processStep4: 'Sustainable Finishing',
    processStep4Desc: 'Eco-friendly dyes and finishing processes',
    globalReach: 'Global Reach',
    reachDesc: 'We proudly serve wholesale partners in over 30 countries, from Europe to North America, and from Asia to the Middle East. Our commitment to quality and reliability has made us a trusted partner for businesses worldwide.',
    teamValues: 'Our Values',
    quality: 'Quality Excellence',
    qualityDesc: 'Uncompromising commitment to the highest standards',
    sustainability: 'Sustainability',
    sustainabilityDesc: 'Responsible production and eco-friendly practices',
    craftsmanship: 'Authentic Craftsmanship',
    craftsmanshipDesc: 'Preserving traditional Turkish textile arts',
    partnership: 'True Partnership',
    partnershipDesc: 'Building lasting relationships with our clients'
  },
  tr: {
    aboutUs: 'Ovia Home Hakkında',
    ourStory: 'Hikayemiz',
    storyDesc: 'Denizli\'nin kalbinde kurulan Ovia Home, geleneksel Türk tekstil zanaatkarlığı ile modern kalite standartlarının mükemmel birleşimini temsil eder. 15 yılı aşkın süredir, Türk dokuma sanatının zengin mirasını ve organik malzemelerin doğal güzelliğini sergileyen premium ev tekstilleri yaratmaya kendimizi adadık.',
    ourMission: 'Misyonumuz',
    missionDesc: 'Dünya çapındaki toptan ortaklara geleneksel zanaatkarlığı sürdürülebilir uygulamalar ve modern kalite standartlarıyla birleştirerek en kaliteli Türk ev tekstillerini sunmak. Türk tekstil üretiminin zanaatkar geleneklerini korurken ortaklarımızla kalıcı ilişkiler kurmaya çalışıyoruz.',
    ourVision: 'Vizyonumuz',
    visionDesc: 'Kalite, sürdürülebilirlik ve otantik zanaatkarlığa olan bağlılığımızla tanınan, Türk ev tekstillerinin önde gelen küresel elçisi olmak. Geleneksel tekstil sanatlarının modern yenilikle birlikte geliştiği bir dünya öngörüyoruz.',
    whyTurkishTextiles: 'Neden Türk Tekstilleri?',
    turkishDesc: 'Türkiye yüzyıllardır tekstil mükemmeliyetinin merkezi olmuştur. Bölgemiz ideal pamuk yetiştirme koşulları, yetenekli zanaatkarlar ve doğal elyaf işleme konusunda derin anlayıştan yararlanmaktadır. Bu miras, modern üretim teknikleriyle birleşince eşsiz kalitede tekstiller yaratır.',
    ourCertificates: 'Sertifikalarımız ve Standartlarımız',
    productionProcess: 'Üretim Sürecimiz',
    processStep1: 'Malzeme Seçimi',
    processStep1Desc: 'Özenle temin edilmiş organik pamuk, bambu ve keten',
    processStep2: 'Geleneksel Dokuma',
    processStep2Desc: 'Asırlık Türk dokuma teknikleri',
    processStep3: 'Kalite Kontrolü',
    processStep3Desc: 'Sıkı test ve muayene standartları',
    processStep4: 'Sürdürülebilir Bitirme',
    processStep4Desc: 'Çevre dostu boyalar ve bitirme işlemleri',
    globalReach: 'Küresel Erişim',
    reachDesc: 'Avrupa\'dan Kuzey Amerika\'ya, Asya\'dan Orta Doğu\'ya kadar 30\'dan fazla ülkede toptan ortaklara hizmet vermenin gururunu yaşıyoruz. Kalite ve güvenilirliğe olan bağlılığımız bizi dünya çapında işletmeler için güvenilir bir ortak haline getirdi.',
    teamValues: 'Değerlerimiz',
    quality: 'Kalite Mükemmeliyeti',
    qualityDesc: 'En yüksek standartlara taviz vermez bağlılık',
    sustainability: 'Sürdürülebilirlik',
    sustainabilityDesc: 'Sorumlu üretim ve çevre dostu uygulamalar',
    craftsmanship: 'Otantik Zanaatkarlık',
    craftsmanshipDesc: 'Geleneksel Türk tekstil sanatlarını koruma',
    partnership: 'Gerçek Ortaklık',
    partnershipDesc: 'Müşterilerimizle kalıcı ilişkiler kurma'
  }
};

const AboutPage = ({ language }) => {
  const t = translations[language];

  return (
    <div className="header-spacing">
      {/* Hero Section */}
      <section className="section section-light">
        <div className="container">
          <div className="text-center mb-16">
            <h1 className="mb-6">{t.aboutUs}</h1>
            <div className="max-w-4xl mx-auto">
              <img
                src="https://images.unsplash.com/photo-1610643073583-332a16a0968a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxUdXJraXNoJTIwdGV4dGlsZXN8ZW58MHx8fHwxNzU3ODY5NDQ4fDA&ixlib=rb-4.1.0&q=85"
                alt="Turkish Textiles"
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="section section-beige">
        <div className="container">
          <div className="grid-2 items-center">
            <div>
              <h2 className="mb-6">{t.ourStory}</h2>
              <p className="text-lg leading-relaxed mb-6">
                {t.storyDesc}
              </p>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="stat-number">15+</div>
                  <div className="stat-label">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="stat-number">30+</div>
                  <div className="stat-label">Countries</div>
                </div>
                <div className="text-center">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Partners</div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1638368888223-4efbc65b1153?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxUdXJraXNoJTIwdGV4dGlsZXN8ZW58MHx8fHwxNzU3ODY5NDQ4fDA&ixlib=rb-4.1.0&q=85"
                alt="Traditional Turkish Textiles"
                className="w-full h-80 object-cover rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section section-light">
        <div className="container">
          <div className="grid-2 gap-12">
            <div className="card text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="text-blue-600" size={32} />
              </div>
              <h2 className="mb-6">{t.ourMission}</h2>
              <p className="text-lg leading-relaxed">
                {t.missionDesc}
              </p>
            </div>
            <div className="card text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="text-purple-600" size={32} />
              </div>
              <h2 className="mb-6">{t.ourVision}</h2>
              <p className="text-lg leading-relaxed">
                {t.visionDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Turkish Textiles */}
      <section className="section section-cream">
        <div className="container">
          <div className="grid-2 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1639654803583-7c616d7e0b6c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwyfHxjb3R0b24lMjBiYXRocm9iZXN8ZW58MHx8fHwxNzU3ODY5NDU1fDA&ixlib=rb-4.1.0&q=85"
                alt="Cotton Texture"
                className="w-full h-80 object-cover rounded-2xl shadow-lg"
              />
            </div>
            <div>
              <h2 className="mb-6">{t.whyTurkishTextiles}</h2>
              <p className="text-lg leading-relaxed">
                {t.turkishDesc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Production Process */}
      <section className="section section-light">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="mb-6">{t.productionProcess}</h2>
          </div>
          <div className="grid-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="mb-3">{t.processStep1}</h3>
              <p className="text-gray-600">{t.processStep1Desc}</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="mb-3">{t.processStep2}</h3>
              <p className="text-gray-600">{t.processStep2Desc}</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-amber-600">3</span>
              </div>
              <h3 className="mb-3">{t.processStep3}</h3>
              <p className="text-gray-600">{t.processStep3Desc}</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">4</span>
              </div>
              <h3 className="mb-3">{t.processStep4}</h3>
              <p className="text-gray-600">{t.processStep4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Certificates */}
      <section className="section section-beige">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="mb-6">{t.ourCertificates}</h2>
          </div>
          <div className="grid-4">
            <div className="trust-badge">
              <Award className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">OEKO-TEX</h3>
              <p className="text-sm text-gray-600">Standard 100 certification for textile safety</p>
            </div>
            <div className="trust-badge">
              <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">GOTS</h3>
              <p className="text-sm text-gray-600">Global Organic Textile Standard</p>
            </div>
            <div className="trust-badge">
              <Award className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Organic Cotton</h3>
              <p className="text-sm text-gray-600">Certified organic cotton sourcing</p>
            </div>
            <div className="trust-badge">
              <Award className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">ISO 9001</h3>
              <p className="text-sm text-gray-600">Quality management systems</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="section section-light">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="mb-6">{t.teamValues}</h2>
          </div>
          <div className="grid-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-amber-600" size={24} />
              </div>
              <h3 className="mb-3">{t.quality}</h3>
              <p className="text-gray-600">{t.qualityDesc}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="text-green-600" size={24} />
              </div>
              <h3 className="mb-3">{t.sustainability}</h3>
              <p className="text-gray-600">{t.sustainabilityDesc}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-blue-600" size={24} />
              </div>
              <h3 className="mb-3">{t.craftsmanship}</h3>
              <p className="text-gray-600">{t.craftsmanshipDesc}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-purple-600" size={24} />
              </div>
              <h3 className="mb-3">{t.partnership}</h3>
              <p className="text-gray-600">{t.partnershipDesc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Reach */}
      <section className="section section-cream">
        <div className="container">
          <div className="text-center">
            <h2 className="mb-6">{t.globalReach}</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              {t.reachDesc}
            </p>
            <div className="flex justify-center items-center space-x-8">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <div className="stat-number text-2xl">30+</div>
                <div className="stat-label">Countries</div>
              </div>
              <div className="text-center">
                <Globe className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="stat-number text-2xl">5</div>
                <div className="stat-label">Continents</div>
              </div>
              <div className="text-center">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="stat-number text-2xl">500+</div>
                <div className="stat-label">Partners</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;