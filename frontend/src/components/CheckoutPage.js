import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Building2, FileText, Lock, CheckCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';

const CheckoutPage = ({ language }) => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { settings } = useSettings();
  
  const [step, setStep] = useState(1); // 1: Info, 2: Shipping, 3: Payment
  const [formData, setFormData] = useState({
    // Customer Info
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    
    // Shipping Address
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    
    // Payment
    paymentMethod: 'bankTransfer'
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const translations = {
    en: {
      checkout: 'Checkout',
      step1: 'Contact Information',
      step2: 'Shipping Address',
      step3: 'Payment Method',
      email: 'Email',
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone',
      company: 'Company (Optional)',
      address: 'Address',
      city: 'City',
      state: 'State/Province',
      postalCode: 'Postal Code',
      country: 'Country',
      paymentMethod: 'Select Payment Method',
      bankTransfer: 'Bank Transfer',
      letterOfCredit: 'Letter of Credit (LC)',
      paypal: 'PayPal',
      creditCard: 'Credit Card',
      continue: 'Continue',
      back: 'Back',
      placeOrder: 'Place Order',
      orderSummary: 'Order Summary',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'Tax',
      total: 'Total',
      items: 'items',
      orderSuccess: 'Order Placed Successfully!',
      orderNumber: 'Order Number',
      thankYou: 'Thank you for your order!',
      orderConfirmation: 'We\'ve sent a confirmation email to',
      paymentInstructions: 'Payment Instructions',
      returnHome: 'Return to Home',
      viewOrders: 'View My Orders',
      required: 'Required fields'
    },
    tr: {
      checkout: 'Ödeme',
      step1: 'İletişim Bilgileri',
      step2: 'Teslimat Adresi',
      step3: 'Ödeme Yöntemi',
      email: 'E-posta',
      firstName: 'Ad',
      lastName: 'Soyad',
      phone: 'Telefon',
      company: 'Şirket (Opsiyonel)',
      address: 'Adres',
      city: 'Şehir',
      state: 'İl/Bölge',
      postalCode: 'Posta Kodu',
      country: 'Ülke',
      paymentMethod: 'Ödeme Yöntemi Seçin',
      bankTransfer: 'Banka Havalesi',
      letterOfCredit: 'Akreditif (LC)',
      paypal: 'PayPal',
      creditCard: 'Kredi Kartı',
      continue: 'Devam Et',
      back: 'Geri',
      placeOrder: 'Siparişi Tamamla',
      orderSummary: 'Sipariş Özeti',
      subtotal: 'Ara Toplam',
      shipping: 'Kargo',
      tax: 'KDV',
      total: 'Toplam',
      items: 'ürün',
      orderSuccess: 'Siparişiniz Başarıyla Alındı!',
      orderNumber: 'Sipariş Numarası',
      thankYou: 'Siparişiniz için teşekkür ederiz!',
      orderConfirmation: 'Onay e-postası gönderildi:',
      paymentInstructions: 'Ödeme Talimatları',
      returnHome: 'Ana Sayfaya Dön',
      viewOrders: 'Siparişlerimi Görüntüle',
      required: 'Zorunlu alanlar'
    }
  };

  const t = translations[language] || translations.en;

  // Calculate totals
  const shipping = 25;
  const tax = cart.subtotal * 0.18;
  const total = cart.subtotal + shipping + tax;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateStep = () => {
    if (step === 1) {
      return formData.email && formData.firstName && formData.lastName && formData.phone;
    }
    if (step === 2) {
      return formData.address && formData.city && formData.country;
    }
    return true;
  };

  const handleContinue = () => {
    if (validateStep()) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      alert(language === 'tr' ? 'Lütfen tüm zorunlu alanları doldurun' : 'Please fill in all required fields');
    }
  };

  const handlePlaceOrder = async () => {
    if (!formData.paymentMethod) {
      alert(language === 'tr' ? 'Lütfen ödeme yöntemi seçin' : 'Please select a payment method');
      return;
    }

    // Generate order number
    const orderNum = `OV${Date.now().toString().slice(-8)}`;
    setOrderNumber(orderNum);
    setOrderPlaced(true);
    
    // Clear cart
    await clearCart();
    
    window.scrollTo(0, 0);
  };

  if (orderPlaced) {
    return (
      <div className="header-spacing min-h-screen bg-gray-50">
        <div className="container py-16">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={48} className="text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">{t.orderSuccess}</h1>
            <p className="text-xl text-gray-600 mb-6">{t.thankYou}</p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">{t.orderNumber}</p>
              <p className="text-2xl font-bold text-primary">{orderNumber}</p>
            </div>
            
            <p className="text-gray-600 mb-2">{t.orderConfirmation}</p>
            <p className="font-semibold mb-8">{formData.email}</p>
            
            {/* Payment Instructions */}
            {formData.paymentMethod === 'bankTransfer' && settings.paymentMethods.bankTransfer.enabled && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left mb-6">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Building2 size={20} />
                  {t.paymentInstructions}
                </h3>
                <div className="text-sm whitespace-pre-line text-gray-700">
                  {settings.paymentMethods.bankTransfer.instructions}
                </div>
              </div>
            )}
            
            {formData.paymentMethod === 'letterOfCredit' && settings.paymentMethods.letterOfCredit.enabled && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left mb-6">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <FileText size={20} />
                  {t.paymentInstructions}
                </h3>
                <div className="text-sm whitespace-pre-line text-gray-700">
                  {settings.paymentMethods.letterOfCredit.instructions}
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="btn-secondary"
              >
                {t.returnHome}
              </button>
              <button
                onClick={() => navigate('/customer-panel')}
                className="btn-primary"
              >
                {t.viewOrders}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="header-spacing min-h-screen bg-gray-50">
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">{t.checkout}</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    step >= s ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {s}
                  </div>
                  <span className={`ml-2 hidden sm:inline text-sm font-medium ${
                    step >= s ? 'text-primary' : 'text-gray-500'
                  }`}>
                    {s === 1 ? t.step1 : s === 2 ? t.step2 : t.step3}
                  </span>
                </div>
                {s < 3 && <div className={`h-0.5 w-12 sm:w-24 transition-colors ${
                  step > s ? 'bg-primary' : 'bg-gray-300'
                }`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Step 1: Contact Information */}
              {step === 1 && (
                <div>
                  <h2 className="text-xl font-bold mb-6">{t.step1}</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t.email} *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t.firstName} *</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t.lastName} *</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t.phone} *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">{t.company}</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleContinue}
                    className="btn-primary w-full mt-6"
                  >
                    {t.continue}
                  </button>
                </div>
              )}

              {/* Step 2: Shipping Address */}
              {step === 2 && (
                <div>
                  <h2 className="text-xl font-bold mb-6">{t.step2}</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">{t.address} *</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t.city} *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t.state}</label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t.postalCode}</label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t.country} *</label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => setStep(1)}
                      className="btn-secondary flex-1"
                    >
                      {t.back}
                    </button>
                    <button
                      onClick={handleContinue}
                      className="btn-primary flex-1"
                    >
                      {t.continue}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment Method */}
              {step === 3 && (
                <div>
                  <h2 className="text-xl font-bold mb-6">{t.step3}</h2>
                  <div className="space-y-4">
                    {/* Bank Transfer */}
                    {settings.paymentMethods.bankTransfer.enabled && (
                      <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.paymentMethod === 'bankTransfer' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bankTransfer"
                          checked={formData.paymentMethod === 'bankTransfer'}
                          onChange={handleInputChange}
                          className="mr-3"
                        />
                        <span className="flex items-center gap-2 font-semibold">
                          <Building2 size={20} />
                          {t.bankTransfer}
                        </span>
                      </label>
                    )}

                    {/* Letter of Credit */}
                    {settings.paymentMethods.letterOfCredit.enabled && (
                      <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.paymentMethod === 'letterOfCredit' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="letterOfCredit"
                          checked={formData.paymentMethod === 'letterOfCredit'}
                          onChange={handleInputChange}
                          className="mr-3"
                        />
                        <span className="flex items-center gap-2 font-semibold">
                          <FileText size={20} />
                          {t.letterOfCredit}
                        </span>
                      </label>
                    )}

                    {/* PayPal */}
                    {settings.paymentMethods.paypal.enabled && (
                      <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.paymentMethod === 'paypal' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="paypal"
                          checked={formData.paymentMethod === 'paypal'}
                          onChange={handleInputChange}
                          className="mr-3"
                        />
                        <span className="flex items-center gap-2 font-semibold">
                          <CreditCard size={20} />
                          {t.paypal}
                        </span>
                      </label>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-6 text-sm text-gray-600">
                    <Lock size={16} />
                    <span>{language === 'tr' ? 'Bilgileriniz güvenli şekilde işlenir' : 'Your information is processed securely'}</span>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => setStep(2)}
                      className="btn-secondary flex-1"
                    >
                      {t.back}
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      className="btn-primary flex-1"
                    >
                      {t.placeOrder}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">{t.orderSummary}</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={typeof item.name === 'object' ? (item.name[language] || item.name.en) : item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">
                        {typeof item.name === 'object' ? (item.name[language] || item.name.en) : item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} x ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span className="font-semibold">${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.shipping}</span>
                  <span className="font-semibold">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.tax}</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="font-bold">{t.total}</span>
                  <span className="text-xl font-bold text-primary">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
