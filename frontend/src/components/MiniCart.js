import React from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const MiniCart = ({ language }) => {
  const { cart, isOpen, closeCart, updateQuantity, removeFromCart, loading } = useCart();

  const translations = {
    en: {
      cart: 'Shopping Cart',
      empty: 'Your cart is empty',
      subtotal: 'Subtotal',
      viewCart: 'View Cart',
      checkout: 'Checkout',
      continueShopping: 'Continue Shopping',
      items: 'items'
    },
    tr: {
      cart: 'Sepetim',
      empty: 'Sepetiniz boş',
      subtotal: 'Ara Toplam',
      viewCart: 'Sepeti Görüntüle',
      checkout: 'Ödeme',
      continueShopping: 'Alışverişe Devam',
      items: 'ürün'
    }
  };

  const t = translations[language] || translations.en;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={closeCart}
      />

      {/* Slide-out Cart */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-primary" size={24} />
            <h2 className="text-xl font-bold">{t.cart}</h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingCart size={64} className="mb-4 opacity-20" />
              <p className="text-lg">{t.empty}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                  {/* Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                      {typeof item.name === 'object' ? (item.name[language] || item.name.en) : item.name}
                    </h3>
                    <p className="text-primary font-bold text-sm mb-2">
                      ${item.price.toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2 bg-white rounded-lg border">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={loading || item.quantity <= 1}
                          className="p-1 hover:bg-gray-100 rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {item.quantity <= 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                        </button>
                        <span className="px-2 text-sm font-semibold min-w-[30px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={loading}
                          className="p-1 hover:bg-gray-100 rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <span className="text-sm font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className="border-t p-4 bg-gray-50">
            {/* Subtotal */}
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">{t.subtotal}</span>
              <span className="text-2xl font-bold text-primary">
                ${cart.subtotal.toFixed(2)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Link
                to="/checkout"
                onClick={closeCart}
                className="block w-full bg-primary hover:bg-orange-600 text-white text-center font-semibold py-3 rounded-lg transition-colors"
              >
                {t.checkout}
              </Link>
              <Link
                to="/cart"
                onClick={closeCart}
                className="block w-full bg-white hover:bg-gray-100 text-gray-800 text-center font-semibold py-3 rounded-lg border-2 border-gray-300 transition-colors"
              >
                {t.viewCart}
              </Link>
            </div>

            <button
              onClick={closeCart}
              className="w-full mt-2 text-gray-600 hover:text-gray-800 text-sm py-2 transition-colors"
            >
              {t.continueShopping}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MiniCart;
