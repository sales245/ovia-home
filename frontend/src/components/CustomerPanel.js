import React, { useState, useEffect } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const translations = {
  en: {
    customerPanel: 'Customer Panel',
    orderTracking: 'Order Tracking',
    trackOrder: 'Track Your Order',
    orderNumber: 'Order Number',
    orderNumberPlaceholder: 'Enter your order number (e.g., OV12345678)',
    trackButton: 'Track Order',
    orderDetails: 'Order Details',
    orderNotFound: 'Order not found. Please check your order number.',
    status: 'Status',
    orderDate: 'Order Date',
    trackingNumber: 'Tracking Number',
    products: 'Products',
    shippingAddress: 'Shipping Address',
    paymentMethod: 'Payment Method',
    totalAmount: 'Total Amount',
    contactUs: 'Contact Us',
    needHelp: 'Need help with your order?',
    helpText: 'Our customer service team is here to assist you with any questions about your order.',
    statuses: {
      pending: 'Pending',
      confirmed: 'Confirmed',
      'in-production': 'In Production',
      shipped: 'Shipped',
      delivered: 'Delivered'
    },
    statusDescriptions: {
      pending: 'Your order has been received and is being processed',
      confirmed: 'Your order has been confirmed and will enter production soon',
      'in-production': 'Your order is currently being manufactured',
      shipped: 'Your order has been shipped and is on its way',
      delivered: 'Your order has been delivered successfully'
    },
    recentOrders: 'Recent Orders',
    viewAll: 'View All Orders',
    noOrders: 'No orders found',
    searchPlaceholder: 'Search orders...',
    customerLogin: 'Customer Login',
    email: 'Email Address',
    loginButton: 'Access Panel',
    loginError: 'Customer not found. Please check your email address.',
    logout: 'Logout',
    welcome: 'Welcome back'
  },
  tr: {
    customerPanel: 'Müşteri Paneli',
    orderTracking: 'Sipariş Takibi',
    trackOrder: 'Siparişinizi Takip Edin',
    orderNumber: 'Sipariş Numarası',
    orderNumberPlaceholder: 'Sipariş numaranızı girin (örn. OV12345678)',
    trackButton: 'Siparişi Takip Et',
    orderDetails: 'Sipariş Detayları',
    orderNotFound: 'Sipariş bulunamadı. Lütfen sipariş numaranızı kontrol edin.',
    status: 'Durum',
    orderDate: 'Sipariş Tarihi',
    trackingNumber: 'Kargo Takip Numarası',
    products: 'Ürünler',
    shippingAddress: 'Teslimat Adresi',
    paymentMethod: 'Ödeme Yöntemi',
    totalAmount: 'Toplam Tutar',
    contactUs: 'İletişime Geçin',
    needHelp: 'Siparişinizle ilgili yardıma mı ihtiyacınız var?',
    helpText: 'Müşteri hizmetleri ekibimiz siparişinizle ilgili sorularınızda size yardımcı olmak için burada.',
    statuses: {
      pending: 'Beklemede',
      confirmed: 'Onaylandı',
      'in-production': 'Üretimde',
      shipped: 'Kargoda',
      delivered: 'Teslim Edildi'
    },
    statusDescriptions: {
      pending: 'Siparişiniz alındı ve işlenmekte',
      confirmed: 'Siparişiniz onaylandı ve yakında üretime girecek',
      'in-production': 'Siparişiniz şu anda üretiliyor',
      shipped: 'Siparişiniz kargoya verildi ve yolda',
      delivered: 'Siparişiniz başarıyla teslim edildi'
    },
    recentOrders: 'Son Siparişler',
    viewAll: 'Tümünü Görüntüle',
    noOrders: 'Sipariş bulunamadı',
    searchPlaceholder: 'Sipariş ara...',
    customerLogin: 'Müşteri Girişi',
    email: 'E-posta Adresi',
    loginButton: 'Panele Erişim',
    loginError: 'Müşteri bulunamadı. Lütfen e-posta adresinizi kontrol edin.',
    logout: 'Çıkış',
    welcome: 'Tekrar hoş geldiniz'
  }
};

const CustomerPanel = ({ language }) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [customer, setCustomer] = useState(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerOrders, setCustomerOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const t = translations[language];

  // Mock customer login for demonstration
  const handleCustomerLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // For demo purposes, create a mock customer
      const mockCustomer = {
        id: 'customer-123',
        name: 'John Doe',
        email: customerEmail,
        company: 'ABC Trading Co.'
      };
      
      // Mock orders for demonstration
      const mockOrders = [
        {
          id: 'order-1',
          order_number: 'OV12345678',
          status: 'shipped',
          created_at: '2024-01-15T10:00:00Z',
          tracking_number: 'TRK123456789',
          products: [
            { name: 'Premium Cotton Bathrobe', quantity: 50, category: 'bathrobes' },
            { name: 'Turkish Cotton Towel Set', quantity: 100, category: 'towels' }
          ],
          total_amount: 5500,
          payment_method: 'Bank Transfer',
          shipping_address: {
            street: '123 Business Street',
            city: 'Berlin',
            country: 'Germany',
            postal_code: '10115'
          }
        },
        {
          id: 'order-2',
          order_number: 'OV87654321',
          status: 'in-production',
          created_at: '2024-01-20T14:30:00Z',
          products: [
            { name: 'Organic Bedding Collection', quantity: 25, category: 'bedding' }
          ],
          total_amount: 3200,
          payment_method: 'Credit Card',
          shipping_address: {
            street: '456 Trade Avenue',
            city: 'Berlin',
            country: 'Germany',
            postal_code: '10117'
          }
        }
      ];

      setCustomer(mockCustomer);
      setCustomerOrders(mockOrders);
    } catch (error) {
      setError(t.loginError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setCurrentOrder(null);

    try {
      // Check if order exists in customer orders or search by order number
      const foundOrder = customerOrders.find(order => 
        order.order_number.toLowerCase() === orderNumber.toLowerCase()
      );

      if (foundOrder) {
        setCurrentOrder(foundOrder);
      } else {
        setError(t.orderNotFound);
      }
    } catch (error) {
      setError(t.orderNotFound);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5" />;
      case 'in-production':
        return <Package className="w-5 h-5" />;
      case 'shipped':
        return <Truck className="w-5 h-5" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in-production':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const filteredOrders = customerOrders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!customer) {
    return (
      <div className="header-spacing">
        <section className="section section-light">
          <div className="container">
            <div className="max-w-md mx-auto">
              <Card className="p-8">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold mb-2">{t.customerLogin}</h1>
                  <p className="text-gray-600">Access your order history and tracking information</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                    {error}
                  </div>
                )}

                <form onSubmit={handleCustomerLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="customer-email">{t.email}</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@example.com"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Loading...' : t.loginButton}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-600">
                    Demo: Use any email address to access the customer panel
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="header-spacing">
      <section className="section section-light">
        <div className="container">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{t.customerPanel}</h1>
              <p className="text-gray-600">{t.welcome}, {customer.name}</p>
            </div>
            <Button
              onClick={() => {
                setCustomer(null);
                setCustomerOrders([]);
                setCurrentOrder(null);
                setCustomerEmail('');
              }}
              variant="outline"
            >
              {t.logout}
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Tracking */}
            <div className="lg:col-span-2 space-y-8">
              {/* Track Order Form */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">{t.trackOrder}</h2>
                <form onSubmit={handleTrackOrder} className="space-y-4">
                  <div>
                    <Label htmlFor="order-number">{t.orderNumber}</Label>
                    <Input
                      id="order-number"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder={t.orderNumberPlaceholder}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    <Search className="w-4 h-4 mr-2" />
                    {isLoading ? 'Tracking...' : t.trackButton}
                  </Button>
                </form>

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
              </Card>

              {/* Order Details */}
              {currentOrder && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-6">{t.orderDetails}</h2>
                  
                  <div className="space-y-6">
                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(currentOrder.status)}
                        <div>
                          <Badge className={getStatusColor(currentOrder.status)}>
                            {t.statuses[currentOrder.status]}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            {t.statusDescriptions[currentOrder.status]}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Info */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900">{t.orderNumber}</h3>
                        <p className="text-gray-600">{currentOrder.order_number}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{t.orderDate}</h3>
                        <p className="text-gray-600">{formatDate(currentOrder.created_at)}</p>
                      </div>
                      {currentOrder.tracking_number && (
                        <div>
                          <h3 className="font-semibold text-gray-900">{t.trackingNumber}</h3>
                          <p className="text-gray-600 font-mono">{currentOrder.tracking_number}</p>
                        </div>
                      )}
                      {currentOrder.payment_method && (
                        <div>
                          <h3 className="font-semibold text-gray-900">{t.paymentMethod}</h3>
                          <p className="text-gray-600">{currentOrder.payment_method}</p>
                        </div>
                      )}
                    </div>

                    {/* Products */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">{t.products}</h3>
                      <div className="space-y-3">
                        {currentOrder.products.map((product, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {currentOrder.shipping_address && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{t.shippingAddress}</h3>
                        <div className="text-gray-600">
                          <p>{currentOrder.shipping_address.street}</p>
                          <p>{currentOrder.shipping_address.city}, {currentOrder.shipping_address.postal_code}</p>
                          <p>{currentOrder.shipping_address.country}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Recent Orders */}
              <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{t.recentOrders}</h2>
                  <Input
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                  />
                </div>

                {filteredOrders.length > 0 ? (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{order.order_number}</p>
                            <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {t.statuses[order.status]}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            {order.products.length} product{order.products.length > 1 ? 's' : ''}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => {
                            setOrderNumber(order.order_number);
                            setCurrentOrder(order);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">{t.noOrders}</p>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Info */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Customer Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {customer.name}</p>
                  <p><span className="font-medium">Email:</span> {customer.email}</p>
                  <p><span className="font-medium">Company:</span> {customer.company}</p>
                </div>
              </Card>

              {/* Help */}
              <Card className="p-6">
                <h3 className="font-semibold mb-3">{t.needHelp}</h3>
                <p className="text-sm text-gray-600 mb-4">{t.helpText}</p>
                <Button variant="outline" className="w-full">
                  {t.contactUs}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomerPanel;