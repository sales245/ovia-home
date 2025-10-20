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
      viewDetails: 'View Details'
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
      viewDetails: 'Detayları Gör'
    }
  };

  const t = translations[language] || translations.en;

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

              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                className="w-full mb-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t.googleLogin}
              </button>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
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
                        <h3 className="font-bold text-2xl">0</h3>
                        <p className="text-gray-600">{t.myOrders}</p>
                      </div>
                      <div className="bg-green-50 p-6 rounded-lg">
                        <MapPin className="text-green-600 mb-2" size={32} />
                        <h3 className="font-bold text-2xl">0</h3>
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
                    <div className="text-center py-12">
                      <Package size={64} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">{t.noOrders}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'addresses' && (
                  <div>
                    <h1 className="text-2xl font-bold mb-6">{t.myAddresses}</h1>
                    <div className="text-center py-12">
                      <MapPin size={64} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">{t.noAddresses}</p>
                    </div>
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
