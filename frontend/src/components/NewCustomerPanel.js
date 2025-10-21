import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, Settings, LogOut, Mail, Lock, Eye, EyeOff, Plus, Edit, Trash2, Clock, CheckCircle, Truck, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

const NewCustomerPanel = ({ language }) => {
  const { user, loading: authLoading, login, register, loginWithGoogle, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // Data states
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    title: '',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isDefault: false
  });
  
  // Login state
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Register state
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company: ''
  });
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  const translations = {
    en: {
      customerPanel: 'Customer Panel',
      login: 'Login',
      register: 'Register',
      email: 'Email',
      password: 'Password',
      name: 'Full Name',
      phone: 'Phone',
      company: 'Company (Optional)',
      loginButton: 'Sign In',
      registerButton: 'Create Account',
      googleLogin: 'Continue with Google',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      signUpHere: 'Sign up here',
      signInHere: 'Sign in here',
      overview: 'Overview',
      orders: 'Orders',
      addresses: 'Addresses',
      account: 'Account',
      logout: 'Logout',
      welcome: 'Welcome',
      myOrders: 'My Orders',
      myAddresses: 'My Addresses',
      accountSettings: 'Account Settings',
      noOrders: 'No orders yet',
      noAddresses: 'No addresses saved',
      orderNumber: 'Order',
      date: 'Date',
      status: 'Status',
      total: 'Total',
      viewDetails: 'View Details',
      addAddress: 'Add New Address',
      editAddress: 'Edit Address',
      title: 'Title',
      fullName: 'Full Name',
      address: 'Address',
      city: 'City',
      state: 'State',
      postalCode: 'Postal Code',
      country: 'Country',
      makeDefault: 'Make Default',
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      orderDetails: 'Order Details',
      items: 'Items',
      quantity: 'Quantity',
      price: 'Price',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'Tax',
      paymentMethod: 'Payment Method',
      shippingAddress: 'Shipping Address',
      pending: 'Pending',
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered'
    },
    tr: {
      customerPanel: 'Müşteri Paneli',
      login: 'Giriş Yap',
      register: 'Kayıt Ol',
      email: 'E-posta',
      password: 'Şifre',
      name: 'Ad Soyad',
      phone: 'Telefon',
      company: 'Şirket (Opsiyonel)',
      loginButton: 'Giriş Yap',
      registerButton: 'Hesap Oluştur',
      googleLogin: 'Google ile Devam Et',
      noAccount: 'Hesabınız yok mu?',
      haveAccount: 'Zaten hesabınız var mı?',
      signUpHere: 'Buradan kayıt olun',
      signInHere: 'Buradan giriş yapın',
      overview: 'Genel Bakış',
      orders: 'Siparişler',
      addresses: 'Adresler',
      account: 'Hesap',
      logout: 'Çıkış Yap',
      welcome: 'Hoş Geldiniz',
      myOrders: 'Siparişlerim',
      myAddresses: 'Adreslerim',
      accountSettings: 'Hesap Ayarları',
      noOrders: 'Henüz siparişiniz yok',
      noAddresses: 'Kayıtlı adres yok',
      orderNumber: 'Sipariş',
      date: 'Tarih',
      status: 'Durum',
      total: 'Toplam',
      viewDetails: 'Detayları Gör',
      addAddress: 'Yeni Adres Ekle',
      editAddress: 'Adresi Düzenle',
      title: 'Başlık',
      fullName: 'Ad Soyad',
      address: 'Adres',
      city: 'Şehir',
      state: 'İl',
      postalCode: 'Posta Kodu',
      country: 'Ülke',
      makeDefault: 'Varsayılan Yap',
      save: 'Kaydet',
      cancel: 'İptal',
      edit: 'Düzenle',
      delete: 'Sil',
      orderDetails: 'Sipariş Detayları',
      items: 'Ürünler',
      quantity: 'Adet',
      price: 'Fiyat',
      subtotal: 'Ara Toplam',
      shipping: 'Kargo',
      tax: 'KDV',
      paymentMethod: 'Ödeme Yöntemi',
      shippingAddress: 'Teslimat Adresi',
      pending: 'Beklemede',
      confirmed: 'Onaylandı',
      shipped: 'Kargoda',
      delivered: 'Teslim Edildi'
    }
  };

  const t = translations[language] || translations.en;

  // Fetch orders
  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchAddresses();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/orders`, {
        withCredentials: true
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await axios.get(`${API}/addresses`, {
        withCredentials: true
      });
      setAddresses(response.data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddAddress = async () => {
    try {
      await axios.post(`${API}/addresses`, addressForm, {
        withCredentials: true
      });
      fetchAddresses();
      setShowAddressForm(false);
      resetAddressForm();
    } catch (error) {
      console.error('Error adding address:', error);
      alert('Failed to add address');
    }
  };

  const handleUpdateAddress = async () => {
    try {
      await axios.put(`${API}/addresses`, { ...addressForm, id: editingAddress }, {
        withCredentials: true
      });
      fetchAddresses();
      setShowAddressForm(false);
      setEditingAddress(null);
      resetAddressForm();
    } catch (error) {
      console.error('Error updating address:', error);
      alert('Failed to update address');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm(language === 'tr' ? 'Adresi silmek istediğinize emin misiniz?' : 'Are you sure you want to delete this address?')) {
      return;
    }
    
    try {
      await axios.delete(`${API}/addresses?id=${id}`, {
        withCredentials: true
      });
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address');
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      title: '',
      fullName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      isDefault: false
    });
  };

  const startEditAddress = (address) => {
    setEditingAddress(address.id);
    setAddressForm(address);
    setShowAddressForm(true);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    const result = await login(loginData.email, loginData.password);
    
    if (!result.success) {
      setLoginError(result.error);
    }
    
    setLoginLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterLoading(true);

    const result = await register(registerData);
    
    if (!result.success) {
      setRegisterError(result.error);
    }
    
    setRegisterLoading(false);
  };

  const handleGoogleLogin = () => {
    loginWithGoogle();
  };

  // If not logged in, show login/register forms
  if (!user && !authLoading) {
    return (
      <div className="header-spacing min-h-screen bg-gray-50">
        <div className="container py-16">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h1 className="text-3xl font-bold text-center mb-8">{t.customerPanel}</h1>

              {/* Tabs */}
              <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setIsLoginMode(true)}
                  className={`flex-1 py-2 rounded-md font-medium transition-colors ${
                    isLoginMode ? 'bg-white text-primary shadow-sm' : 'text-gray-600'
                  }`}
                >
                  {t.login}
                </button>
                <button
                  onClick={() => setIsLoginMode(false)}
                  className={`flex-1 py-2 rounded-md font-medium transition-colors ${
                    !isLoginMode ? 'bg-white text-primary shadow-sm' : 'text-gray-600'
                  }`}
                >
                  {t.register}
                </button>
              </div>

              {/* Login Form */}
              {isLoginMode ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  {loginError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                      {loginError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">{t.email}</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t.password}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {loginLoading ? 'Loading...' : t.loginButton}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  {registerError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                      {registerError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">{t.name}</label>
                    <input
                      type="text"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t.email}</label>
                    <input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t.password}</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={registerData.password}
                        onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                        className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t.phone}</label>
                    <input
                      type="tel"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t.company}</label>
                    <input
                      type="text"
                      value={registerData.company}
                      onChange={(e) => setRegisterData({...registerData, company: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    {registerLoading ? 'Loading...' : t.registerButton}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If logged in, show dashboard
  if (user) {
    return (
      <div className="header-spacing min-h-screen bg-gray-50">
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6">
                {/* User Info */}
                <div className="flex items-center gap-4 pb-6 border-b">
                  {user.picture ? (
                    <img src={user.picture} alt={user.name} className="w-16 h-16 rounded-full" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold truncate">{user.name}</h2>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="mt-6 space-y-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'overview' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <User size={20} />
                    {t.overview}
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'orders' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Package size={20} />
                    {t.orders}
                  </button>
                  <button
                    onClick={() => setActiveTab('addresses')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'addresses' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <MapPin size={20} />
                    {t.addresses}
                  </button>
                  <button
                    onClick={() => setActiveTab('account')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'account' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Settings size={20} />
                    {t.account}
                  </button>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={20} />
                    {t.logout}
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm p-8">
                {activeTab === 'overview' && (
                  <div>
                    <h1 className="text-2xl font-bold mb-6">{t.welcome}, {user.name}!</h1>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <Package className="text-blue-600 mb-2" size={32} />
                        <h3 className="font-bold text-2xl">{orders.length}</h3>
                        <p className="text-gray-600">{t.myOrders}</p>
                      </div>
                      <div className="bg-green-50 p-6 rounded-lg">
                        <MapPin className="text-green-600 mb-2" size={32} />
                        <h3 className="font-bold text-2xl">{addresses.length}</h3>
                        <p className="text-gray-600">{t.myAddresses}</p>
                      </div>
                      <div className="bg-orange-50 p-6 rounded-lg">
                        <Settings className="text-orange-600 mb-2" size={32} />
                        <h3 className="font-bold text-2xl">✓</h3>
                        <p className="text-gray-600">{t.accountSettings}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && (
                  <div>
                    <h1 className="text-2xl font-bold mb-6">{t.myOrders}</h1>
                    
                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package size={64} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">{t.noOrders}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                              <div>
                                <h3 className="font-bold text-lg">{order.orderNumber}</h3>
                                <p className="text-sm text-gray-500">
                                  {new Date(order.createdAt).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'confirmed' ? 'bg-orange-100 text-orange-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {t[order.status] || order.status}
                                </span>
                                <span className="font-bold text-lg text-primary">
                                  ${order.total.toFixed(2)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                              <div>
                                <span className="text-gray-600">{t.items}:</span>
                                <span className="ml-2 font-medium">{order.items.length}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">{t.paymentMethod}:</span>
                                <span className="ml-2 font-medium">{order.paymentMethod}</span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-primary hover:text-orange-600 font-semibold text-sm"
                            >
                              {t.viewDetails} →
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Order Details Modal */}
                    {selectedOrder && (
                      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                          <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold">{t.orderDetails}</h2>
                            <button
                              onClick={() => setSelectedOrder(null)}
                              className="p-2 hover:bg-gray-100 rounded-full"
                            >
                              <X size={24} />
                            </button>
                          </div>
                          
                          <div className="p-6 space-y-6">
                            {/* Order Info */}
                            <div>
                              <h3 className="font-bold mb-2">{selectedOrder.orderNumber}</h3>
                              <p className="text-sm text-gray-500">
                                {new Date(selectedOrder.createdAt).toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US')}
                              </p>
                            </div>

                            {/* Items */}
                            <div>
                              <h3 className="font-bold mb-3">{t.items}</h3>
                              <div className="space-y-3">
                                {selectedOrder.items.map((item, idx) => (
                                  <div key={idx} className="flex gap-4 bg-gray-50 p-3 rounded-lg">
                                    {item.image && (
                                      <img src={item.image} alt="" className="w-16 h-16 object-cover rounded" />
                                    )}
                                    <div className="flex-1">
                                      <p className="font-medium">{typeof item.name === 'object' ? (item.name[language] || item.name.en) : item.name}</p>
                                      <p className="text-sm text-gray-600">
                                        {t.quantity}: {item.quantity} × ${item.price.toFixed(2)}
                                      </p>
                                    </div>
                                    <div className="font-bold">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Totals */}
                            <div className="border-t pt-4 space-y-2">
                              <div className="flex justify-between">
                                <span>{t.subtotal}</span>
                                <span>${selectedOrder.subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{t.shipping}</span>
                                <span>${selectedOrder.shipping.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>{t.tax}</span>
                                <span>${selectedOrder.tax.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-lg border-t pt-2">
                                <span>{t.total}</span>
                                <span className="text-primary">${selectedOrder.total.toFixed(2)}</span>
                              </div>
                            </div>

                            {/* Shipping Address */}
                            <div>
                              <h3 className="font-bold mb-2">{t.shippingAddress}</h3>
                              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                                <p className="font-medium">{selectedOrder.customerInfo.firstName} {selectedOrder.customerInfo.lastName}</p>
                                <p>{selectedOrder.shippingAddress.address}</p>
                                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</p>
                                <p>{selectedOrder.shippingAddress.country}</p>
                                <p className="mt-2">{selectedOrder.customerInfo.phone}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'addresses' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h1 className="text-2xl font-bold">{t.myAddresses}</h1>
                      <button
                        onClick={() => {
                          resetAddressForm();
                          setShowAddressForm(true);
                        }}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Plus size={20} />
                        {t.addAddress}
                      </button>
                    </div>

                    {addresses.length === 0 ? (
                      <div className="text-center py-12">
                        <MapPin size={64} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">{t.noAddresses}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((addr) => (
                          <div key={addr.id} className={`bg-gray-50 rounded-lg p-4 ${addr.isDefault ? 'border-2 border-primary' : ''}`}>
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold">{addr.title}</h3>
                              {addr.isDefault && (
                                <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                                  {language === 'tr' ? 'Varsayılan' : 'Default'}
                                </span>
                              )}
                            </div>
                            <p className="text-sm mb-1">{addr.fullName}</p>
                            <p className="text-sm text-gray-600">{addr.address}</p>
                            <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.postalCode}</p>
                            <p className="text-sm text-gray-600">{addr.country}</p>
                            <p className="text-sm text-gray-600 mt-1">{addr.phone}</p>
                            
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => startEditAddress(addr)}
                                className="text-primary hover:text-orange-600 text-sm font-medium flex items-center gap-1"
                              >
                                <Edit size={16} />
                                {t.edit}
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                              >
                                <Trash2 size={16} />
                                {t.delete}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Address Form Modal */}
                    {showAddressForm && (
                      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                          <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold">
                              {editingAddress ? t.editAddress : t.addAddress}
                            </h2>
                            <button
                              onClick={() => {
                                setShowAddressForm(false);
                                setEditingAddress(null);
                                resetAddressForm();
                              }}
                              className="p-2 hover:bg-gray-100 rounded-full"
                            >
                              <X size={20} />
                            </button>
                          </div>
                          
                          <div className="p-6 space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">{t.title}</label>
                              <input
                                type="text"
                                value={addressForm.title}
                                onChange={(e) => setAddressForm({...addressForm, title: e.target.value})}
                                placeholder={language === 'tr' ? 'Örn: Ev, İş' : 'e.g. Home, Work'}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">{t.fullName}</label>
                              <input
                                type="text"
                                value={addressForm.fullName}
                                onChange={(e) => setAddressForm({...addressForm, fullName: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">{t.phone}</label>
                              <input
                                type="tel"
                                value={addressForm.phone}
                                onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">{t.address}</label>
                              <textarea
                                value={addressForm.address}
                                onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
                                rows="3"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">{t.city}</label>
                                <input
                                  type="text"
                                  value={addressForm.city}
                                  onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">{t.state}</label>
                                <input
                                  type="text"
                                  value={addressForm.state}
                                  onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">{t.postalCode}</label>
                                <input
                                  type="text"
                                  value={addressForm.postalCode}
                                  onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})}
                                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-2">{t.country}</label>
                                <input
                                  type="text"
                                  value={addressForm.country}
                                  onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                              </div>
                            </div>

                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={addressForm.isDefault}
                                onChange={(e) => setAddressForm({...addressForm, isDefault: e.target.checked})}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">{t.makeDefault}</span>
                            </label>

                            <div className="flex gap-3 pt-4">
                              <button
                                onClick={() => {
                                  setShowAddressForm(false);
                                  setEditingAddress(null);
                                  resetAddressForm();
                                }}
                                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                              >
                                {t.cancel}
                              </button>
                              <button
                                onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
                                className="flex-1 btn-primary"
                              >
                                {t.save}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'account' && (
                  <div>
                    <h1 className="text-2xl font-bold mb-6">{t.accountSettings}</h1>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">{t.name}</label>
                        <input
                          type="text"
                          value={user.name}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">{t.email}</label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="header-spacing min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default NewCustomerPanel;
