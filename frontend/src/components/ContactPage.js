import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, MessageCircle, Instagram, MapPin, Phone, Send, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const translations = {
  en: {
    contactUs: 'Contact Us',
    getQuote: 'Get Your Quote',
    productInquiry: 'Product Inquiry',
    bulkQuote: 'Bulk Quote Request',
    contactInfo: 'Contact Information',
    name: 'Full Name',
    email: 'Email Address',
    company: 'Company Name',
    phone: 'Phone Number',
    country: 'Country',
    selectCountry: 'Select your country',
    productCategory: 'Product Category',
    selectProduct: 'Select product category',
    bathrobes: 'Bathrobes',
    towels: 'Towels',
    bedding: 'Bedding Sets',
    homeDecor: 'Home Décor',
    allProducts: 'All Products',
    message: 'Message',
    messagePlaceholder: 'Tell us about your requirements, quantities, and any specific needs...',
    quotePlaceholder: 'Please provide details about your bulk order requirements, quantities, delivery timeline, and any specific product specifications...',
    products: 'Products of Interest',
    quantity: 'Expected Quantity',
    quantityPlaceholder: 'e.g., 1000 pieces, 50 sets, etc.',
    sendInquiry: 'Send Inquiry',
    requestQuote: 'Request Quote',
    inquirySent: 'Inquiry Sent Successfully!',
    quoteSent: 'Quote Request Sent!',
    thankYou: 'Thank you for your interest. We will contact you within 24 hours.',
    addressLabel: 'Address',
    addressText: 'Denizli, Turkey',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    followUs: 'Follow Us',
    paymentMethods: 'Payment Methods',
    paymentText: 'We accept Credit Cards, Bank Transfers, PayPal, and Letter of Credit (LC)',
    shippingInfo: 'Shipping Information',
    shippingText: 'Worldwide shipping with tracking numbers provided for all orders',
    required: 'Required',
    agreeTerms: 'I agree to receive communications about products and services',
    formError: 'Please fill in all required fields correctly.'
  },
  tr: {
    contactUs: 'İletişim',
    getQuote: 'Teklifinizi Alın',
    productInquiry: 'Ürün Sorgusu',
    bulkQuote: 'Toptan Teklif Talebi',
    contactInfo: 'İletişim Bilgileri',
    name: 'Ad Soyad',
    email: 'E-posta Adresi',
    company: 'Şirket Adı',
    phone: 'Telefon Numarası',
    country: 'Ülke',
    selectCountry: 'Ülkenizi seçin',
    productCategory: 'Ürün Kategorisi',
    selectProduct: 'Ürün kategorisi seçin',
    bathrobes: 'Bornozlar',
    towels: 'Havlular',
    bedding: 'Yatak Takımları',
    homeDecor: 'Ev Dekorasyonu',
    allProducts: 'Tüm Ürünler',
    message: 'Mesaj',
    messagePlaceholder: 'İhtiyaçlarınız, miktarlar ve özel gereksinimleriniz hakkında bize bilgi verin...',
    quotePlaceholder: 'Lütfen toptan sipariş gereksinimleriniz, miktarlar, teslimat zaman çizelgesi ve özel ürün spesifikasyonları hakkında ayrıntıları sağlayın...',
    products: 'İlgilendiğiniz Ürünler',
    quantity: 'Beklenen Miktar',
    quantityPlaceholder: 'örn. 1000 adet, 50 takım, vb.',
    sendInquiry: 'Sorgula',
    requestQuote: 'Teklif İste',
    inquirySent: 'Sorgu Başarıyla Gönderildi!',
    quoteSent: 'Teklif Talebi Gönderildi!',
    thankYou: 'İlginiz için teşekkür ederiz. 24 saat içinde sizinle iletişime geçeceğiz.',
    addressLabel: 'Adres',
    addressText: 'Denizli, Türkiye',
    emailLabel: 'E-posta',
    phoneLabel: 'Telefon',
    followUs: 'Bizi Takip Edin',
    paymentMethods: 'Ödeme Yöntemleri',
    paymentText: 'Kredi Kartı, Banka Havalesi, PayPal ve Akreditif (LC) kabul ediyoruz',
    shippingInfo: 'Kargo Bilgileri',
    shippingText: 'Tüm siparişler için takip numarası ile dünya çapında kargo',
    required: 'Gerekli',
    agreeTerms: 'Ürün ve hizmetler hakkında iletişim almayı kabul ediyorum',
    formError: 'Lütfen tüm gerekli alanları doğru şekilde doldurun.'
  }
};

const countries = [
  'Germany', 'France', 'Italy', 'Spain', 'United Kingdom', 'Netherlands', 'Poland',
  'United States', 'Canada', 'Australia', 'Japan', 'South Korea', 'UAE', 'Saudi Arabia',
  'Russia', 'Brazil', 'Other'
];

const ContactPage = ({ language }) => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('inquiry');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const t = translations[language];
  const preselectedProduct = searchParams.get('product');

  // Form data states
  const [inquiryData, setInquiryData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    product_category: preselectedProduct || '',
    message: ''
  });

  const [quoteData, setQuoteData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    country: '',
    products: [],
    quantity: '',
    message: ''
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);

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

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError(t.formError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API}/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inquiryData),
      });

      if (response.ok) {
        setIsSuccess(true);
        setInquiryData({
          name: '',
          email: '',
          company: '',
          phone: '',
          product_category: '',
          message: ''
        });
      } else {
        setError(t.formError);
      }
    } catch (error) {
      setError(t.formError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError(t.formError);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API}/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData),
      });

      if (response.ok) {
        setIsSuccess(true);
        setQuoteData({
          name: '',
          email: '',
          company: '',
          phone: '',
          country: '',
          products: [],
          quantity: '',
          message: ''
        });
      } else {
        setError(t.formError);
      }
    } catch (error) {
      setError(t.formError);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="header-spacing">
        <section className="section section-light">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
              <h1 className="mb-4">{activeTab === 'inquiry' ? t.inquirySent : t.quoteSent}</h1>
              <p className="text-xl text-gray-600 mb-8">{t.thankYou}</p>
              <Button 
                onClick={() => {
                  setIsSuccess(false);
                  setActiveTab('inquiry');
                }}
                variant="outline"
              >
                Send Another Message
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="header-spacing">
      {/* Hero Section */}
      <section className="section section-light">
        <div className="container">
          <div className="text-center mb-16">
            <h1 className="mb-6">{t.contactUs}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ready to partner with us? Get in touch for product inquiries, bulk quotes, or any questions about our Turkish home textiles.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                {/* Tab Buttons */}
                <div className="flex space-x-4 mb-8">
                  <Button
                    onClick={() => setActiveTab('inquiry')}
                    variant={activeTab === 'inquiry' ? 'default' : 'outline'}
                    className="flex-1"
                  >
                    {t.productInquiry}
                  </Button>
                  <Button
                    onClick={() => setActiveTab('quote')}
                    variant={activeTab === 'quote' ? 'default' : 'outline'}
                    className="flex-1"
                  >
                    {t.bulkQuote}
                  </Button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                  </div>
                )}

                {/* Product Inquiry Form */}
                {activeTab === 'inquiry' && (
                  <Card className="p-6">
                    <form onSubmit={handleInquirySubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">{t.name} *</Label>
                          <Input
                            id="name"
                            value={inquiryData.name}
                            onChange={(e) => setInquiryData({...inquiryData, name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">{t.email} *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={inquiryData.email}
                            onChange={(e) => setInquiryData({...inquiryData, email: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="company">{t.company} *</Label>
                          <Input
                            id="company"
                            value={inquiryData.company}
                            onChange={(e) => setInquiryData({...inquiryData, company: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">{t.phone}</Label>
                          <Input
                            id="phone"
                            value={inquiryData.phone}
                            onChange={(e) => setInquiryData({...inquiryData, phone: e.target.value})}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="product_category">{t.productCategory}</Label>
                        <Select
                          value={inquiryData.product_category}
                          onValueChange={(value) => setInquiryData({...inquiryData, product_category: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectProduct} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bathrobes">{t.bathrobes}</SelectItem>
                            <SelectItem value="towels">{t.towels}</SelectItem>
                            <SelectItem value="bedding">{t.bedding}</SelectItem>
                            <SelectItem value="home-decor">{t.homeDecor}</SelectItem>
                            <SelectItem value="all">{t.allProducts}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="message">{t.message} *</Label>
                        <Textarea
                          id="message"
                          placeholder={t.messagePlaceholder}
                          value={inquiryData.message}
                          onChange={(e) => setInquiryData({...inquiryData, message: e.target.value})}
                          required
                          rows={5}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="terms"
                          checked={agreedToTerms}
                          onCheckedChange={setAgreedToTerms}
                        />
                        <Label htmlFor="terms" className="text-sm">
                          {t.agreeTerms}
                        </Label>
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          'Sending...'
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            {t.sendInquiry}
                          </>
                        )}
                      </Button>
                    </form>
                  </Card>
                )}

                {/* Bulk Quote Form */}
                {activeTab === 'quote' && (
                  <Card className="p-6">
                    <form onSubmit={handleQuoteSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="quote-name">{t.name} *</Label>
                          <Input
                            id="quote-name"
                            value={quoteData.name}
                            onChange={(e) => setQuoteData({...quoteData, name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="quote-email">{t.email} *</Label>
                          <Input
                            id="quote-email"
                            type="email"
                            value={quoteData.email}
                            onChange={(e) => setQuoteData({...quoteData, email: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="quote-company">{t.company} *</Label>
                          <Input
                            id="quote-company"
                            value={quoteData.company}
                            onChange={(e) => setQuoteData({...quoteData, company: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="quote-phone">{t.phone} *</Label>
                          <Input
                            id="quote-phone"
                            value={quoteData.phone}
                            onChange={(e) => setQuoteData({...quoteData, phone: e.target.value})}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="country">{t.country} *</Label>
                        <Select
                          value={quoteData.country}
                          onValueChange={(value) => setQuoteData({...quoteData, country: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectCountry} />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country} value={country}>{country}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="products">{t.products} *</Label>
                        <Select
                          value={quoteData.products.join(',')}
                          onValueChange={(value) => setQuoteData({...quoteData, products: [value]})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectProduct} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bathrobes">{t.bathrobes}</SelectItem>
                            <SelectItem value="towels">{t.towels}</SelectItem>
                            <SelectItem value="bedding">{t.bedding}</SelectItem>
                            <SelectItem value="home-decor">{t.homeDecor}</SelectItem>
                            <SelectItem value="all">{t.allProducts}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="quantity">{t.quantity} *</Label>
                        <Input
                          id="quantity"
                          placeholder={t.quantityPlaceholder}
                          value={quoteData.quantity}
                          onChange={(e) => setQuoteData({...quoteData, quantity: e.target.value})}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="quote-message">{t.message}</Label>
                        <Textarea
                          id="quote-message"
                          placeholder={t.quotePlaceholder}
                          value={quoteData.message}
                          onChange={(e) => setQuoteData({...quoteData, message: e.target.value})}
                          rows={5}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="quote-terms"
                          checked={agreedToTerms}
                          onCheckedChange={setAgreedToTerms}
                        />
                        <Label htmlFor="quote-terms" className="text-sm">
                          {t.agreeTerms}
                        </Label>
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          'Sending...'
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            {t.requestQuote}
                          </>
                        )}
                      </Button>
                    </form>
                  </Card>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6">{t.contactInfo}</h2>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">{t.addressLabel}</div>
                        <div className="text-gray-600">{t.addressText}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">{t.emailLabel}</div>
                        <button
                          onClick={() => handleContactClick('email')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          sales@oviahome.info
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="font-medium">{t.phoneLabel}</div>
                        <button
                          onClick={() => handleContactClick('whatsapp')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          +90 546 431 37 45
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-medium mb-3">{t.followUs}</h3>
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleContactClick('instagram')}
                        variant="outline"
                        size="sm"
                      >
                        <Instagram className="w-4 h-4 mr-2" />
                        Instagram
                      </Button>
                      <Button
                        onClick={() => handleContactClick('whatsapp')}
                        variant="outline"
                        size="sm"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-3">{t.paymentMethods}</h3>
                  <p className="text-gray-600 text-sm mb-4">{t.paymentText}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="certificate-badge">Credit Card</span>
                    <span className="certificate-badge">Bank Transfer</span>
                    <span className="certificate-badge">PayPal</span>
                    <span className="certificate-badge">LC</span>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-3">{t.shippingInfo}</h3>
                  <p className="text-gray-600 text-sm">{t.shippingText}</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;