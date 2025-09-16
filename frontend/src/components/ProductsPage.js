import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MessageCircle, Star, Award, Leaf } from 'lucide-react';
import { translations } from '../translations';

// Multilingual product database
const productsData = [
  {
    id: 1,
    category: 'bathrobes',
    image: 'https://images.unsplash.com/photo-1713881676551-b16f22ce4719?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwxfHxjb3R0b24lMjBiYXRocm9iZXN8ZW58MHx8fHwxNzU3ODY5NDU1fDA&ixlib=rb-4.1.0&q=85',
    name: {
      en: 'Premium Cotton Bathrobe',
      tr: 'Premium Pamuk Bornoz',
      de: 'Premium Baumwoll-Bademantel',
      fr: 'Peignoir en Coton Premium',
      it: 'Accappatoio di Cotone Premium',
      es: 'Albornoz de Algodón Premium',
      pl: 'Szlafrok Bawełniany Premium',
      ru: 'Премиум Хлопковый Халат',
      bg: 'Премиум Памучен Халат',
      el: 'Premium Βαμβακερό Μπουρνούζι',
      pt: 'Roupão de Algodão Premium',
      ar: 'بشكير قطني فاخر'
    },
    features: {
      en: ['100% Organic Cotton', 'OEKO-TEX Certified', 'Multiple Sizes'],
      tr: ['%100 Organik Pamuk', 'OEKO-TEX Sertifikalı', 'Çoklu Bedenler'],
      de: ['100% Bio-Baumwolle', 'OEKO-TEX Zertifiziert', 'Mehrere Größen'],
      fr: ['100% Coton Biologique', 'Certifié OEKO-TEX', 'Tailles Multiples'],
      it: ['100% Cotone Biologico', 'Certificato OEKO-TEX', 'Taglie Multiple'],
      es: ['100% Algodón Orgánico', 'Certificado OEKO-TEX', 'Múltiples Tallas'],
      pl: ['100% Bawełna Organiczna', 'Certyfikat OEKO-TEX', 'Wiele Rozmiarów'],
      ru: ['100% Органический Хлопок', 'Сертификат OEKO-TEX', 'Разные Размеры'],
      bg: ['100% Органичен Памук', 'OEKO-TEX Сертификат', 'Множество Размери'],
      el: ['100% Βιολογικό Βαμβάκι', 'Πιστοποίηση OEKO-TEX', 'Πολλαπλά Μεγέθη'],
      pt: ['100% Algodão Orgânico', 'Certificado OEKO-TEX', 'Múltiplos Tamanhos'],
      ar: ['قطن عضوي 100%', 'معتمد OEKO-TEX', 'أحجام متعددة']
    },
    badges: ['organicCotton', 'certified']
  },
  {
    id: 2,
    category: 'bathrobes',
    image: 'https://images.unsplash.com/photo-1639654803583-7c616d7e0b6c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDF8MHwxfHNlYXJjaHwyfHxjb3R0b24lMjBiYXRocm9iZXN8ZW58MHx8fHwxNzU3ODY5NDU1fDA&ixlib=rb-4.1.0&q=85',
    name: {
      en: 'Bamboo Luxury Bathrobe',
      tr: 'Bambu Lüks Bornoz',
      de: 'Bambus Luxus-Bademantel',
      fr: 'Peignoir de Luxe en Bambou',
      it: 'Accappatoio di Lusso in Bambù',
      es: 'Albornoz de Lujo de Bambú',
      pl: 'Luksusowy Szlafrok Bambusowy',
      ru: 'Роскошный Бамбуковый Халат',
      bg: 'Луксозен Бамбуков Халат',
      el: 'Πολυτελές Μπαμπού Μπουρνούζι',
      pt: 'Roupão de Luxo de Bambu',
      ar: 'بشكير خيزران فاخر'
    },
    features: {
      en: ['Bamboo Fiber', 'Antibacterial', 'Eco-Friendly'],
      tr: ['Bambu Lifi', 'Antibakteriyel', 'Çevre Dostu'],
      de: ['Bambusfaser', 'Antibakteriell', 'Umweltfreundlich'],
      fr: ['Fibre de Bambou', 'Antibactérien', 'Écologique'],
      it: ['Fibra di Bambù', 'Antibatterico', 'Ecologico'],
      es: ['Fibra de Bambú', 'Antibacteriano', 'Ecológico'],
      pl: ['Włókno Bambusowe', 'Antybakteryjne', 'Ekologiczne'],
      ru: ['Бамбуковое Волокно', 'Антибактериальный', 'Экологичный'],
      bg: ['Бамбуково Влакно', 'Антибактериален', 'Екологичен'],
      el: ['Ίνα Μπαμπού', 'Αντιβακτηριδιακό', 'Φιλικό προς το Περιβάλλον'],
      pt: ['Fibra de Bambu', 'Antibacteriano', 'Ecológico'],
      ar: ['ألياف الخيزران', 'مضاد للبكتيريا', 'صديق للبيئة']
    },
    badges: ['sustainable', 'premium']
  },
  {
    id: 3,
    category: 'towels',
    image: 'https://images.unsplash.com/photo-1649446326998-a16524cfa667?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB0b3dlbHN8ZW58MHx8fHwxNzU3ODY5NDU5fDA&ixlib=rb-4.1.0&q=85',
    name: {
      en: 'Turkish Cotton Towel Set',
      tr: 'Türk Pamuğu Havlu Seti',
      de: 'Türkisches Baumwoll-Handtuch-Set',
      fr: 'Set de Serviettes en Coton Turc',
      it: 'Set Asciugamani in Cotone Turco',
      es: 'Juego de Toallas de Algodón Turco',
      pl: 'Zestaw Ręczników z Tureckiej Bawełny',
      ru: 'Набор Полотенец из Турецкого Хлопка',
      bg: 'Комплект Хавлии от Турски Памук',
      el: 'Σετ Πετσέτες από Τουρκικό Βαμβάκι',
      pt: 'Conjunto de Toalhas de Algodão Turco',
      ar: 'طقم مناشف قطن تركي'
    },
    features: {
      en: ['Turkish Cotton', 'High Absorption', 'Various Colors'],
      tr: ['Türk Pamuğu', 'Yüksek Emicilik', 'Çeşitli Renkler'],
      de: ['Türkische Baumwolle', 'Hohe Saugfähigkeit', 'Verschiedene Farben'],
      fr: ['Coton Turc', 'Haute Absorption', 'Couleurs Variées'],
      it: ['Cotone Turco', 'Alta Assorbenza', 'Vari Colori'],
      es: ['Algodón Turco', 'Alta Absorción', 'Varios Colores'],
      pl: ['Turecka Bawełna', 'Wysoka Chłonność', 'Różne Kolory'],
      ru: ['Турецкий Хлопок', 'Высокая Впитываемость', 'Разные Цвета'],
      bg: ['Турски Памук', 'Високо Поглъщане', 'Различни Цветове'],
      el: ['Τουρκικό Βαμβάκι', 'Υψηλή Απορρόφηση', 'Διάφορα Χρώματα'],
      pt: ['Algodão Turco', 'Alta Absorção', 'Várias Cores'],
      ar: ['قطن تركي', 'امتصاص عالي', 'ألوان متنوعة']
    },
    badges: ['premium', 'certified']
  },
  {
    id: 4,
    category: 'towels',
    image: 'https://images.unsplash.com/photo-1700918232124-f64da19e73eb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjB0b3dlbHN8ZW58MHx8fHwxNzU3ODY5NDU5fDA&ixlib=rb-4.1.0&q=85',
    name: {
      en: 'Spa Luxury Towels',
      tr: 'Spa Lüks Havlular',
      de: 'Spa Luxus-Handtücher',
      fr: 'Serviettes de Luxe Spa',
      it: 'Asciugamani di Lusso Spa',
      es: 'Toallas de Lujo Spa',
      pl: 'Luksusowe Ręczniki Spa',
      ru: 'Роскошные СПА Полотенца',
      bg: 'Луксозни СПА Хавлии',
      el: 'Πολυτελείς Πετσέτες Spa',
      pt: 'Toalhas de Luxo Spa',
      ar: 'مناشف سبا فاخرة'
    },
    features: {
      en: ['Hotel Quality', 'Ultra Soft', 'Quick Dry'],
      tr: ['Otel Kalitesi', 'Ultra Yumuşak', 'Hızlı Kuruyan'],
      de: ['Hotelqualität', 'Ultra Weich', 'Schnell Trocknend'],
      fr: ['Qualité Hôtel', 'Ultra Doux', 'Séchage Rapide'],
      it: ['Qualità Hotel', 'Ultra Morbido', 'Asciugatura Rapida'],
      es: ['Calidad Hotel', 'Ultra Suave', 'Secado Rápido'],
      pl: ['Jakość Hotelowa', 'Ultra Miękkie', 'Szybko Schnące'],
      ru: ['Отельное Качество', 'Ультра Мягкие', 'Быстрое Высыхание'],
      bg: ['Хотелско Качество', 'Ултра Меки', 'Бързо Изсъхване'],
      el: ['Ποιότητα Ξενοδοχείου', 'Υπερ Απαλό', 'Γρήγορο Στέγνωμα'],
      pt: ['Qualidade Hotel', 'Ultra Macio', 'Secagem Rápida'],
      ar: ['جودة فندقية', 'ناعم جداً', 'سريع الجفاف']
    },
    badges: ['premium', 'certified']
  },
  {
    id: 5,
    category: 'bedding',
    image: 'https://images.unsplash.com/photo-1689626698503-47934d011285?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHw0fHxiZWRkaW5nJTIwc2V0c3xlbnwwfHx8fDE3NTc4Njk0NjR8MA&ixlib=rb-4.1.0&q=85',
    name: {
      en: 'Premium Bedding Set',
      tr: 'Premium Yatak Takımı',
      de: 'Premium Bettwäsche-Set',
      fr: 'Parure de Lit Premium',
      it: 'Set Lenzuola Premium',
      es: 'Juego de Sábanas Premium',
      pl: 'Zestaw Pościeli Premium',
      ru: 'Премиум Постельное Белье',
      bg: 'Премиум Спално Бельо',
      el: 'Premium Σετ Κλινοσκεπασμάτων',
      pt: 'Conjunto de Cama Premium',
      ar: 'طقم أسرّة فاخر'
    },
    features: {
      en: ['Egyptian Cotton', 'Thread Count 800', 'Complete Set'],
      tr: ['Mısır Pamuğu', '800 İplik Sayısı', 'Komple Set'],
      de: ['Ägyptische Baumwolle', 'Fadenzahl 800', 'Komplettes Set'],
      fr: ['Coton Égyptien', 'Nombre de Fils 800', 'Set Complet'],
      it: ['Cotone Egiziano', 'Numero di Fili 800', 'Set Completo'],
      es: ['Algodón Egipcio', 'Número de Hilos 800', 'Juego Completo'],
      pl: ['Bawełna Egipska', 'Liczba Nici 800', 'Kompletny Zestaw'],
      ru: ['Египетский Хлопок', 'Плотность 800', 'Полный Комплект'],
      bg: ['Египетски Памук', 'Плътност 800', 'Пълен Комплект'],
      el: ['Αιγυπτιακό Βαμβάκι', 'Αριθμός Νημάτων 800', 'Πλήρες Σετ'],
      pt: ['Algodão Egípcio', 'Contagem de Fios 800', 'Conjunto Completo'],
      ar: ['قطن مصري', 'عدد الخيوط 800', 'طقم كامل']
    },
    badges: ['premium', 'organicCotton']
  },
  {
    id: 6,
    category: 'bedding',
    image: 'https://images.pexels.com/photos/6603475/pexels-photo-6603475.jpeg',
    name: {
      en: 'Organic Bedding Collection',
      tr: 'Organik Yatak Koleksiyonu',
      de: 'Bio-Bettwäsche Kollektion',
      fr: 'Collection Literie Biologique',
      it: 'Collezione Lenzuola Biologiche',
      es: 'Colección de Ropa de Cama Orgánica',
      pl: 'Kolekcja Organicznej Pościeli',
      ru: 'Органическая Коллекция Постельного Белья',
      bg: 'Органична Колекция Спално Бельо',
      el: 'Οργανική Συλλογή Κλινοσκεπασμάτων',
      pt: 'Coleção de Cama Orgânica',
      ar: 'مجموعة أسرّة عضوية'
    },
    features: {
      en: ['100% Organic', 'GOTS Certified', 'Hypoallergenic'],
      tr: ['%100 Organik', 'GOTS Sertifikalı', 'Hipoalerjenik'],
      de: ['100% Biologisch', 'GOTS Zertifiziert', 'Hypoallergen'],
      fr: ['100% Biologique', 'Certifié GOTS', 'Hypoallergénique'],
      it: ['100% Biologico', 'Certificato GOTS', 'Ipoallergenico'],
      es: ['100% Orgánico', 'Certificado GOTS', 'Hipoalergénico'],
      pl: ['100% Organiczne', 'Certyfikat GOTS', 'Hipoalergiczne'],
      ru: ['100% Органический', 'Сертификат GOTS', 'Гипоаллергенный'],
      bg: ['100% Органичен', 'GOTS Сертификат', 'Хипоалергенен'],
      el: ['100% Βιολογικό', 'Πιστοποίηση GOTS', 'Υποαλλεργικό'],
      pt: ['100% Orgânico', 'Certificado GOTS', 'Hipoalergênico'],
      ar: ['عضوي 100%', 'معتمد GOTS', 'مضاد للحساسية']
    },
    badges: ['organicCotton', 'certified', 'sustainable']
  },
  {
    id: 7,
    category: 'home-decor',
    image: 'https://images.unsplash.com/photo-1638368888223-4efbc65b1153?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwxfHxUdXJraXNoJTIwdGV4dGlsZXN8ZW58MHx8fHwxNzU3ODY5NDQ4fDA&ixlib=rb-4.1.0&q=85',
    name: {
      en: 'Traditional Turkish Carpets',
      tr: 'Geleneksel Türk Halıları',
      de: 'Traditionelle Türkische Teppiche',
      fr: 'Tapis Turcs Traditionnels',
      it: 'Tappeti Turchi Tradizionali',
      es: 'Alfombras Turcas Tradicionales',
      pl: 'Tradycyjne Tureckie Dywany',
      ru: 'Традиционные Турецкие Ковры',
      bg: 'Традиционни Турски Килими',
      el: 'Παραδοσιακά Τουρκικά Χαλιά',
      pt: 'Tapetes Turcos Tradicionais',
      ar: 'سجاد تركي تقليدي'
    },
    features: {
      en: ['Hand Woven', 'Traditional Patterns', 'Various Sizes'],
      tr: ['El Dokuma', 'Geleneksel Desenler', 'Çeşitli Boyutlar'],
      de: ['Handgewebt', 'Traditionelle Muster', 'Verschiedene Größen'],
      fr: ['Tissé à la Main', 'Motifs Traditionnels', 'Tailles Variées'],
      it: ['Tessuto a Mano', 'Motivi Tradizionali', 'Varie Dimensioni'],
      es: ['Tejido a Mano', 'Patrones Tradicionales', 'Varios Tamaños'],
      pl: ['Ręcznie Tkane', 'Tradycyjne Wzory', 'Różne Rozmiary'],
      ru: ['Ручной Работы', 'Традиционные Узоры', 'Разные Размеры'],
      bg: ['Ръчно Тъкани', 'Традиционни Модели', 'Различни Размери'],
      el: ['Χειροποίητα', 'Παραδοσιακά Μοτίβα', 'Διάφορα Μεγέθη'],
      pt: ['Tecido à Mão', 'Padrões Tradicionais', 'Vários Tamanhos'],
      ar: ['منسوج يدوياً', 'أنماط تقليدية', 'أحجام متنوعة']
    },
    badges: ['premium', 'certified']
  },
  {
    id: 8,
    category: 'home-decor',
    image: 'https://images.unsplash.com/photo-1610643073583-332a16a0968a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzh8MHwxfHNlYXJjaHwyfHxUdXJraXNoJTIwdGV4dGlsZXN8ZW58MHx8fHwxNzU3ODY5NDQ4fDA&ixlib=rb-4.1.0&q=85',
    name: {
      en: 'Decorative Cushions',
      tr: 'Dekoratif Yastıklar',
      de: 'Dekorative Kissen',
      fr: 'Coussins Décoratifs',
      it: 'Cuscini Decorativi',
      es: 'Cojines Decorativos',
      pl: 'Poduszki Dekoracyjne',
      ru: 'Декоративные Подушки',
      bg: 'Декоративни Възглавници',
      el: 'Διακοσμητικά Μαξιλάρια',
      pt: 'Almofadas Decorativas',
      ar: 'وسائد زخرفية'
    },
    features: {
      en: ['Natural Dyes', 'Embroidered', 'Multiple Designs'],
      tr: ['Doğal Boyalar', 'İşlemeli', 'Çoklu Tasarımlar'],
      de: ['Natürliche Farbstoffe', 'Bestickt', 'Mehrere Designs'],
      fr: ['Teintures Naturelles', 'Brodé', 'Multiples Designs'],
      it: ['Coloranti Naturali', 'Ricamato', 'Design Multipli'],
      es: ['Tintes Naturales', 'Bordado', 'Múltiples Diseños'],
      pl: ['Naturalne Barwniki', 'Haftowane', 'Wiele Wzorów'],
      ru: ['Натуральные Красители', 'Вышитые', 'Множество Дизайнов'],
      bg: ['Натурални Багрила', 'Бродирани', 'Множество Дизайни'],
      el: ['Φυσικές Βαφές', 'Κεντημένα', 'Πολλαπλά Σχέδια'],
      pt: ['Corantes Naturais', 'Bordado', 'Múltiplos Designs'],
      ar: ['أصباغ طبيعية', 'مطرز', 'تصاميم متعددة']
    },
    badges: ['sustainable', 'premium']
  }
];

const ProductsPage = ({ language }) => {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const t = translations[language] || translations.en;

  // Transform products data with language-specific content
  const products = productsData.map(product => ({
    ...product,
    name: product.name[language] || product.name.en,
    features: product.features[language] || product.features.en
  }));

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