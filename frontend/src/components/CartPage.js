import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const CartPage = ({ language }) => {
  const { cart, updateQuantity, removeFromCart, loading } = useCart();

  const translations = {
    en: {
      cart: 'Shopping Cart',
      emptyCart: 'Your cart is empty',
      continueShopping: 'Continue Shopping',
      product: 'Product',
      price: 'Price',
      quantity: 'Quantity',
      total: 'Total',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'Tax',
      orderTotal: 'Order Total',
      proceedToCheckout: 'Proceed to Checkout',
      remove: 'Remove',
      updateCart: 'Update Cart',
      shippingCalculated: 'Calculated at checkout',
      items: 'items'
    },
    tr: {
      cart: 'Alışveriş Sepeti',
      emptyCart: 'Sepetiniz boş',
      continueShopping: 'Alışverişe Devam',
      product: 'Ürün',
      price: 'Fiyat',
      quantity: 'Adet',
      total: 'Toplam',
      subtotal: 'Ara Toplam',
      shipping: 'Kargo',
      tax: 'KDV',
      orderTotal: 'Sipariş Toplamı',
      proceedToCheckout: 'Ödemeye Geç',
      remove: 'Kaldır',
      updateCart: 'Sepeti Güncelle',
      shippingCalculated: 'Ödeme sayfasında hesaplanır',
      items: 'ürün'
    }
  };

  const t = translations[language] || translations.en;

  // Calculate totals
  const shipping = cart.subtotal > 0 ? 25 : 0; // Flat rate shipping
  const tax = cart.subtotal * 0.18; // 18% VAT
  const orderTotal = cart.subtotal + shipping + tax;

  if (cart.items.length === 0) {
    return (
      <div className="header-spacing min-h-screen bg-gray-50">
        <div className="container py-16">
          <div className="max-w-2xl mx-auto text-center">
            <ShoppingCart size={80} className="mx-auto mb-6 text-gray-300" />
            <h1 className="text-3xl font-bold mb-4">{t.emptyCart}</h1>
            <p className="text-gray-600 mb-8">
              {language === 'tr' 
                ? 'Sepetinize henüz ürün eklemediniz. Hemen alışverişe başlayın!' 
                : 'You haven\'t added any products to your cart yet. Start shopping now!'}
            </p>
            <Link to="/products" className="btn-primary inline-flex items-center gap-2">
              <Package size={20} />
              {t.continueShopping}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="header-spacing min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t.cart}</h1>
          <p className="text-gray-600">
            {cart.itemCount} {t.items}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Table Header - Desktop */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b font-semibold text-sm">
                <div className="col-span-6">{t.product}</div>
                <div className="col-span-2 text-center">{t.price}</div>
                <div className="col-span-2 text-center">{t.quantity}</div>
                <div className="col-span-2 text-right">{t.total}</div>
              </div>

              {/* Cart Items */}
              <div className="divide-y">
                {cart.items.map((item) => (
                  <div key={item.productId} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Product Info */}
                      <div className="col-span-1 md:col-span-6 flex gap-4">
                        <img
                          src={item.image}
                          alt={typeof item.name === 'object' ? (item.name[language] || item.name.en) : item.name}
                          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1 line-clamp-2">
                            {typeof item.name === 'object' ? (item.name[language] || item.name.en) : item.name}
                          </h3>
                          {item.category && (
                            <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                          )}
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-red-600 hover:text-red-700 text-sm mt-2 flex items-center gap-1 md:hidden"
                          >
                            <Trash2 size={14} />
                            {t.remove}
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="col-span-1 md:col-span-2 flex md:justify-center items-center gap-2">
                        <span className="md:hidden text-sm text-gray-600">{t.price}:</span>
                        <span className="font-semibold">${item.price.toFixed(2)}</span>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-1 md:col-span-2 flex md:justify-center items-center gap-2">
                        <span className="md:hidden text-sm text-gray-600">{t.quantity}:</span>
                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={loading}
                            className="p-2 hover:bg-gray-200 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {item.quantity <= 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value) || 1;
                              if (newQty > 0 && newQty <= 9999) {
                                updateQuantity(item.productId, newQty);
                              }
                            }}
                            disabled={loading}
                            className="w-16 px-2 py-1 text-center font-semibold bg-transparent border-0 focus:outline-none disabled:opacity-50"
                          />
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={loading}
                            className="p-2 hover:bg-gray-200 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="col-span-1 md:col-span-2 flex md:justify-end items-center gap-2">
                        <span className="md:hidden text-sm text-gray-600">{t.total}:</span>
                        <span className="font-bold text-lg text-primary">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="hidden md:block ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t.remove}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-4">
              <Link
                to="/products"
                className="text-primary hover:text-orange-600 font-semibold flex items-center gap-2"
              >
                ← {t.continueShopping}
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">{t.orderTotal}</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>{t.subtotal}</span>
                  <span className="font-semibold">${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t.shipping}</span>
                  <span className="font-semibold">
                    {shipping > 0 ? `$${shipping.toFixed(2)}` : t.shippingCalculated}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t.tax}</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">{t.total}</span>
                    <span className="text-2xl font-bold text-primary">
                      ${orderTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {t.proceedToCheckout}
                <ArrowRight size={20} />
              </Link>

              {/* Security Badges */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>
                    {language === 'tr' ? 'Güvenli Ödeme' : 'Secure Payment'}
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

export default CartPage;
