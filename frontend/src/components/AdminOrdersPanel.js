import React, { useState, useEffect } from 'react';
import { Package, Filter, Search, Edit, DollarSign, Truck, CheckCircle, Clock, X } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

const AdminOrdersPanel = ({ language }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const translations = {
    en: {
      orders: 'Orders',
      orderManagement: 'Order Management',
      search: 'Search orders...',
      allOrders: 'All Orders',
      status: 'Status',
      paymentStatus: 'Payment Status',
      dateRange: 'Date Range',
      orderNumber: 'Order #',
      customer: 'Customer',
      date: 'Date',
      items: 'Items',
      total: 'Total',
      actions: 'Actions',
      viewDetails: 'View Details',
      updateOrder: 'Update Order',
      pending: 'Pending',
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      paid: 'Paid',
      unpaid: 'Unpaid',
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
      all: 'All Time',
      orderDetails: 'Order Details',
      customerInfo: 'Customer Information',
      shippingAddress: 'Shipping Address',
      paymentMethod: 'Payment Method',
      trackingNumber: 'Tracking Number',
      payoneerLink: 'Payoneer Payment Link',
      notes: 'Notes',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'Tax',
      save: 'Save',
      cancel: 'Cancel',
      noOrders: 'No orders found',
      addPayoneerLink: 'Add Payoneer Link',
      addTracking: 'Add Tracking Number'
    },
    tr: {
      orders: 'Siparişler',
      orderManagement: 'Sipariş Yönetimi',
      search: 'Sipariş ara...',
      allOrders: 'Tüm Siparişler',
      status: 'Durum',
      paymentStatus: 'Ödeme Durumu',
      dateRange: 'Tarih Aralığı',
      orderNumber: 'Sipariş #',
      customer: 'Müşteri',
      date: 'Tarih',
      items: 'Ürünler',
      total: 'Toplam',
      actions: 'İşlemler',
      viewDetails: 'Detayları Gör',
      updateOrder: 'Siparişi Güncelle',
      pending: 'Beklemede',
      confirmed: 'Onaylandı',
      shipped: 'Kargoda',
      delivered: 'Teslim Edildi',
      paid: 'Ödendi',
      unpaid: 'Ödenmedi',
      today: 'Bugün',
      week: 'Bu Hafta',
      month: 'Bu Ay',
      all: 'Tüm Zamanlar',
      orderDetails: 'Sipariş Detayları',
      customerInfo: 'Müşteri Bilgileri',
      shippingAddress: 'Teslimat Adresi',
      paymentMethod: 'Ödeme Yöntemi',
      trackingNumber: 'Kargo Takip No',
      payoneerLink: 'Payoneer Ödeme Linki',
      notes: 'Notlar',
      subtotal: 'Ara Toplam',
      shipping: 'Kargo',
      tax: 'KDV',
      save: 'Kaydet',
      cancel: 'İptal',
      noOrders: 'Sipariş bulunamadı',
      addPayoneerLink: 'Payoneer Link Ekle',
      addTracking: 'Takip No Ekle'
    }
  };

  const t = translations[language] || translations.en;

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter, paymentFilter, dateFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${order.customerInfo.firstName} ${order.customerInfo.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === paymentFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      
      filtered = filtered.filter(order => {
        const orderDate = order.createdAt;
        if (dateFilter === 'today') {
          return now - orderDate < dayMs;
        } else if (dateFilter === 'week') {
          return now - orderDate < 7 * dayMs;
        } else if (dateFilter === 'month') {
          return now - orderDate < 30 * dayMs;
        }
        return true;
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    setFilteredOrders(filtered);
  };

  const handleUpdateOrder = async () => {
    try {
      await axios.put(`${API}/orders/${editingOrder.id}`, editingOrder);
      fetchOrders();
      setEditingOrder(null);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentBadge = (status) => {
    return status === 'paid' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t.orderManagement}</h1>
        <p className="text-gray-600">{filteredOrders.length} {t.orders}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">{t.allOrders}</option>
            <option value="pending">{t.pending}</option>
            <option value="confirmed">{t.confirmed}</option>
            <option value="shipped">{t.shipped}</option>
            <option value="delivered">{t.delivered}</option>
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">{t.paymentStatus}</option>
            <option value="paid">{t.paid}</option>
            <option value="pending">{t.unpaid}</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <Package size={64} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">{t.noOrders}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.orderNumber}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.customer}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.date}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.items}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.status}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.paymentStatus}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.total}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium">{order.customerInfo.firstName} {order.customerInfo.lastName}</div>
                        <div className="text-gray-500">{order.customerInfo.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.items.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                        {t[order.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentBadge(order.paymentStatus)}`}>
                        {t[order.paymentStatus]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-primary">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setEditingOrder({ ...order });
                        }}
                        className="text-primary hover:text-orange-600 font-medium"
                      >
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Edit Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">{t.updateOrder} - {editingOrder.orderNumber}</h2>
              <button
                onClick={() => {
                  setEditingOrder(null);
                  setSelectedOrder(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status & Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.status}</label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="pending">{t.pending}</option>
                    <option value="confirmed">{t.confirmed}</option>
                    <option value="shipped">{t.shipped}</option>
                    <option value="delivered">{t.delivered}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.paymentStatus}</label>
                  <select
                    value={editingOrder.paymentStatus}
                    onChange={(e) => setEditingOrder({ ...editingOrder, paymentStatus: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="pending">{t.unpaid}</option>
                    <option value="paid">{t.paid}</option>
                  </select>
                </div>
              </div>

              {/* Tracking & Payoneer */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.trackingNumber}</label>
                  <input
                    type="text"
                    value={editingOrder.trackingNumber || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, trackingNumber: e.target.value })}
                    placeholder={t.addTracking}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.payoneerLink}</label>
                  <input
                    type="url"
                    value={editingOrder.payoneerPaymentLink || ''}
                    onChange={(e) => setEditingOrder({ ...editingOrder, payoneerPaymentLink: e.target.value })}
                    placeholder={t.addPayoneerLink}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">{t.notes}</label>
                <textarea
                  value={editingOrder.notes || ''}
                  onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Order Items Preview */}
              <div>
                <h3 className="font-bold mb-3">{t.items}</h3>
                <div className="space-y-2">
                  {editingOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                      <div>
                        <p className="font-medium">{typeof item.name === 'object' ? (item.name[language] || item.name.en) : item.name}</p>
                        <p className="text-sm text-gray-600">{item.quantity} × ${item.price.toFixed(2)}</p>
                      </div>
                      <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  onClick={() => {
                    setEditingOrder(null);
                    setSelectedOrder(null);
                  }}
                  className="flex-1 px-6 py-3 border rounded-lg hover:bg-gray-50"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleUpdateOrder}
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
  );
};

export default AdminOrdersPanel;
