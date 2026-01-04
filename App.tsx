
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Product, CartItem, Order, ViewLog } from './types';
import { APP_STORAGE_KEY, PRODUCTS_STORAGE_KEY, ORDERS_STORAGE_KEY, ANALYTICS_STORAGE_KEY, INITIAL_PRODUCTS } from './constants';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import ProductDetail from './pages/ProductDetail';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [viewLogs, setViewLogs] = useState<ViewLog[]>(() => {
    const saved = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(APP_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(viewLogs));
  }, [viewLogs]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const logView = (productId: string) => {
    setViewLogs(prev => [...prev, { productId, timestamp: Date.now() }]);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleNewOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
    setProducts(prev => prev.map(p => {
      const orderedItem = order.items.find(oi => oi.id === p.id);
      if (orderedItem) {
        return { ...p, stock: Math.max(0, p.stock - orderedItem.quantity) };
      }
      return p;
    }));
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Router>
      <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-[#C5A059] selection:text-white">
        <Navbar cartCount={cartCount} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home products={products} onAddToCart={addToCart} onLogView={logView} />} />
            <Route path="/product/:id" element={<ProductDetail products={products} onAddToCart={addToCart} onLogView={logView} />} />
            <Route 
              path="/checkout" 
              element={
                <Checkout 
                  cart={cart} 
                  onRemoveFromCart={removeFromCart} 
                  onClearCart={clearCart}
                  onOrderPlaced={handleNewOrder}
                />
              } 
            />
            <Route 
              path="/admin" 
              element={
                <Admin 
                  products={products} 
                  orders={orders} 
                  viewLogs={viewLogs}
                  setProducts={setProducts} 
                  setOrders={setOrders}
                />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
