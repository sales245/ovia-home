import React, { useState, useEffect } from 'react';
import { 
  Users, MessageSquare, FileText, Package, TrendingUp, 
  Mail, Phone, Calendar, Download, RefreshCw, LogOut,
  Eye, EyeOff, BarChart3, PieChart, Activity
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { translations } from '../translations';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPage = ({ language }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Admin data states
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    inquiries: [],
    quotes: [],
    customers: [],
    orders: [],
    products: []
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  // Product management states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productFormData, setProductFormData] = useState({
    category: 'bathrobes',
    image: '',
    name: {
      en: '', tr: '', de: '', fr: '', it: '', es: '', pl: '', ru: '', bg: '', el: '', pt: '', ar: ''
    },
    features: {
      en: ['', '', ''], tr: ['', '', ''], de: ['', '', ''], fr: ['', '', ''],
      it: ['', '', ''], es: ['', '', ''], pl: ['', '', ''], ru: ['', '', ''],
      bg: ['', '', ''], el: ['', '', ''], pt: ['', '', ''], ar: ['', '', '']
    },
    badges: []
  });

  const t = translations[language] || translations.en;

  // Admin translations
  const adminTranslations = {
    en: {
      adminPanel: 'Admin Panel',
      dashboard: 'Dashboard',
      inquiries: 'Inquiries',
      quotes: 'Quote Requests',
      customers: 'Customers',
      orders: 'Orders',
      products: 'Products',
      login: 'Admin Login',
      username: 'Username',
      password: 'Password',
      loginBtn: 'Login',
      logout: 'Logout',
      totalInquiries: 'Total Inquiries',
      totalQuotes: 'Total Quotes',
      totalCustomers: 'Total Customers',
      totalOrders: 'Total Orders',
      recentActivity: 'Recent Activity',
      viewAll: 'View All',
      export: 'Export',
      refresh: 'Refresh',
      noData: 'No data available',
      date: 'Date',
      customerName: 'Customer Name',
      company: 'Company',
      email: 'Email',
      phone: 'Phone',
      message: 'Message',
      productCategory: 'Product Category',
      country: 'Country',
      quantity: 'Quantity',
      status: 'Status',
      orderNumber: 'Order Number',
      products: 'Products',
      created: 'Created',
      loginError: 'Invalid credentials. Please try again.',
      businessMetrics: 'Business Metrics',
      quickActions: 'Quick Actions'
    },
    tr: {
      adminPanel: 'Yönetici Paneli',
      dashboard: 'Kontrol Paneli',
      inquiries: 'Sorgulamalar',
      quotes: 'Teklif Talepleri',
      customers: 'Müşteriler',
      orders: 'Siparişler',
      login: 'Yönetici Girişi',
      username: 'Kullanıcı Adı',
      password: 'Şifre',
      loginBtn: 'Giriş',
      logout: 'Çıkış',
      totalInquiries: 'Toplam Sorgulama',
      totalQuotes: 'Toplam Teklif',
      totalCustomers: 'Toplam Müşteri',
      totalOrders: 'Toplam Sipariş',
      recentActivity: 'Son Aktiviteler',
      viewAll: 'Tümünü Gör',
      export: 'Dışa Aktar',
      refresh: 'Yenile',
      noData: 'Veri bulunmuyor',
      date: 'Tarih',
      customerName: 'Müşteri Adı',
      company: 'Şirket',
      email: 'E-posta',
      phone: 'Telefon',
      message: 'Mesaj',
      productCategory: 'Ürün Kategorisi',
      country: 'Ülke',
      quantity: 'Miktar',
      status: 'Durum',
      orderNumber: 'Sipariş Numarası',
      products: 'Ürünler',
      created: 'Oluşturuldu',
      loginError: 'Geçersiz kimlik bilgileri. Lütfen tekrar deneyin.',
      businessMetrics: 'İş Metrikleri',
      quickActions: 'Hızlı İşlemler'
    }
  };

  const at = adminTranslations[language] || adminTranslations.en;

  // Check if user is already authenticated (simple session storage)
  useEffect(() => {
    const authToken = sessionStorage.getItem('admin_auth');
    if (authToken === 'authenticated') {
      setIsAuthenticated(true);
      fetchDashboardData();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    // Simple hardcoded authentication (in production, use proper backend auth)
    if (loginData.username === 'admin' && loginData.password === 'oviahome2024') {
      sessionStorage.setItem('admin_auth', 'authenticated');
      setIsAuthenticated(true);
      fetchDashboardData();
    } else {
      setLoginError(at.loginError);
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    setLoginData({ username: '', password: '' });
  };

  const fetchDashboardData = async () => {
    setRefreshing(true);
    try {
      // Fetch all data in parallel
      const [statsRes, inquiriesRes, quotesRes, customersRes] = await Promise.all([
        fetch(`${API}/stats`),
        fetch(`${API}/inquiries`),
        fetch(`${API}/quotes`),
        fetch(`${API}/customers`)
      ]);

      const stats = await statsRes.json();
      const inquiries = await inquiriesRes.json();
      const quotes = await quotesRes.json();
      const customers = await customersRes.json();

      setDashboardData({
        stats,
        inquiries: inquiries.slice(0, 10), // Latest 10
        quotes: quotes.slice(0, 10),
        customers: customers.slice(0, 10),
        orders: [] // Orders would come from customer orders
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportData = (data, filename) => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="header-spacing">
        <section className="section section-light min-h-screen flex items-center justify-center">
          <div className="container">
            <div className="max-w-md mx-auto">
              <Card className="p-8">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl mb-2">{at.adminPanel}</CardTitle>
                  <p className="text-gray-600">{at.login}</p>
                </CardHeader>
                <CardContent>
                  {loginError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                      {loginError}
                    </div>
                  )}
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="username">{at.username}</Label>
                      <Input
                        id="username"
                        type="text"
                        value={loginData.username}
                        onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                        required
                        placeholder="admin"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="password">{at.password}</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          required
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Logging in...' : at.loginBtn}
                    </Button>
                  </form>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                    <p className="text-sm text-gray-600">
                      Demo Credentials:<br />
                      Username: <code className="bg-gray-100 px-2 py-1 rounded">admin</code><br />
                      Password: <code className="bg-gray-100 px-2 py-1 rounded">oviahome2024</code>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="header-spacing">
      <section className="section section-light min-h-screen">
        <div className="container-wide">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{at.adminPanel}</h1>
              <p className="text-gray-600">Welcome back, Admin</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={fetchDashboardData}
                variant="outline"
                size="sm"
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {at.refresh}
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                {at.logout}
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'dashboard', label: at.dashboard, icon: BarChart3 },
              { id: 'inquiries', label: at.inquiries, icon: MessageSquare },
              { id: 'quotes', label: at.quotes, icon: FileText },
              { id: 'customers', label: at.customers, icon: Users }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  activeTab === id 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>

          {/* Dashboard Content */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{at.totalInquiries}</p>
                        <p className="text-3xl font-bold text-blue-600">
                          {dashboardData.stats.inquiries || 0}
                        </p>
                      </div>
                      <MessageSquare className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{at.totalQuotes}</p>
                        <p className="text-3xl font-bold text-green-600">
                          {dashboardData.stats.quotes || 0}
                        </p>
                      </div>
                      <FileText className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{at.totalCustomers}</p>
                        <p className="text-3xl font-bold text-purple-600">
                          {dashboardData.stats.customers || 0}
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{at.totalOrders}</p>
                        <p className="text-3xl font-bold text-orange-600">
                          {dashboardData.stats.orders || 0}
                        </p>
                      </div>
                      <Package className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>{at.recentActivity}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.inquiries.slice(0, 5).map((inquiry) => (
                      <div key={inquiry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <MessageSquare className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium">{inquiry.name} - {inquiry.company}</p>
                            <p className="text-sm text-gray-600">{inquiry.product_category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{formatDate(inquiry.created_at)}</p>
                          <Badge variant="outline">New Inquiry</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Inquiries Tab */}
          {activeTab === 'inquiries' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{at.inquiries}</CardTitle>
                  <Button
                    onClick={() => exportData(dashboardData.inquiries, 'inquiries')}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {at.export}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">{at.date}</th>
                        <th className="text-left p-4">{at.customerName}</th>
                        <th className="text-left p-4">{at.company}</th>
                        <th className="text-left p-4">{at.email}</th>
                        <th className="text-left p-4">{at.productCategory}</th>
                        <th className="text-left p-4">{at.message}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.inquiries.map((inquiry) => (
                        <tr key={inquiry.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">{formatDate(inquiry.created_at)}</td>
                          <td className="p-4 font-medium">{inquiry.name}</td>
                          <td className="p-4">{inquiry.company}</td>
                          <td className="p-4">
                            <a href={`mailto:${inquiry.email}`} className="text-blue-600 hover:underline">
                              {inquiry.email}
                            </a>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">{inquiry.product_category}</Badge>
                          </td>
                          <td className="p-4 max-w-xs truncate">{inquiry.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quotes Tab */}
          {activeTab === 'quotes' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{at.quotes}</CardTitle>
                  <Button
                    onClick={() => exportData(dashboardData.quotes, 'quotes')}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {at.export}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">{at.date}</th>
                        <th className="text-left p-4">{at.customerName}</th>
                        <th className="text-left p-4">{at.company}</th>
                        <th className="text-left p-4">{at.country}</th>
                        <th className="text-left p-4">{at.products}</th>
                        <th className="text-left p-4">{at.quantity}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.quotes.map((quote) => (
                        <tr key={quote.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">{formatDate(quote.created_at)}</td>
                          <td className="p-4 font-medium">{quote.name}</td>
                          <td className="p-4">{quote.company}</td>
                          <td className="p-4">{quote.country}</td>
                          <td className="p-4">
                            {quote.products.map((product, index) => (
                              <Badge key={index} variant="outline" className="mr-1 mb-1">
                                {product}
                              </Badge>
                            ))}
                          </td>
                          <td className="p-4">{quote.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{at.customers}</CardTitle>
                  <Button
                    onClick={() => exportData(dashboardData.customers, 'customers')}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {at.export}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">{at.date}</th>
                        <th className="text-left p-4">{at.customerName}</th>
                        <th className="text-left p-4">{at.company}</th>
                        <th className="text-left p-4">{at.email}</th>
                        <th className="text-left p-4">{at.phone}</th>
                        <th className="text-left p-4">{at.country}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.customers.map((customer) => (
                        <tr key={customer.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">{formatDate(customer.created_at)}</td>
                          <td className="p-4 font-medium">{customer.name}</td>
                          <td className="p-4">{customer.company}</td>
                          <td className="p-4">
                            <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                              {customer.email}
                            </a>
                          </td>
                          <td className="p-4">{customer.phone}</td>
                          <td className="p-4">{customer.country}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminPage;