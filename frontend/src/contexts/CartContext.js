import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], subtotal: 0, itemCount: 0 });
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/cart`, {
        withCredentials: true
      });
      
      setCart({
        items: response.data.items || [],
        subtotal: response.data.subtotal || 0,
        itemCount: response.data.itemCount || 0
      });
      setSessionId(response.data.sessionId);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API}/cart`, {
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.retail_price || product.priceTiers?.[0]?.price || 0,
        quantity,
        category: product.category
      }, {
        withCredentials: true
      });

      setCart({
        items: response.data.items || [],
        subtotal: response.data.subtotal || 0,
        itemCount: response.data.itemCount || 0
      });
      setSessionId(response.data.sessionId);
      
      // Show mini cart
      setIsOpen(true);
      
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API}/cart`, {
        productId,
        quantity
      }, {
        withCredentials: true
      });

      setCart({
        items: response.data.items || [],
        subtotal: response.data.subtotal || 0,
        itemCount: response.data.itemCount || 0
      });
      
      return true;
    } catch (error) {
      console.error('Error updating cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API}/cart?productId=${productId}`, {
        withCredentials: true
      });

      setCart({
        items: response.data.items || [],
        subtotal: response.data.subtotal || 0,
        itemCount: response.data.itemCount || 0
      });
      
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await axios.delete(`${API}/cart`, {
        withCredentials: true
      });

      setCart({ items: [], subtotal: 0, itemCount: 0 });
      
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  const closeCart = () => {
    setIsOpen(false);
  };

  const openCart = () => {
    setIsOpen(true);
  };

  return (
    <CartContext.Provider value={{
      cart,
      sessionId,
      loading,
      isOpen,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      loadCart,
      toggleCart,
      closeCart,
      openCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
