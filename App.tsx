
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Product, CartItem, Order, ViewLog, RestockRequest, HomeLayoutConfig, SectionConfig, FooterPage } from './types';
import { 
  APP_STORAGE_KEY, 
  PRODUCTS_STORAGE_KEY, 
  ORDERS_STORAGE_KEY, 
  ANALYTICS_STORAGE_KEY, 
  RESTOCK_REQUESTS_STORAGE_KEY, 
  WISHLIST_STORAGE_KEY,
  INITIAL_PRODUCTS,
  FOOTER_PAGES_STORAGE_KEY,
  INITIAL_FOOTER_PAGES
} from './constants';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import ProductDetail from './pages/ProductDetail';
import Wishlist from './pages/Wishlist';
import InfoPage from './pages/InfoPage';
import WhatsAppBot from './components/WhatsAppBot';

const LAYOUT_CONFIG_KEY = 'ZARHRAH_LAYOUT_CONFIG';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [footerPages, setFooterPages] = useState<FooterPage[]>(() => {
    const saved = localStorage.getItem(FOOTER_PAGES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_FOOTER_PAGES;
  });

  const [layoutConfig, setLayoutConfig] = useState<HomeLayoutConfig>(() => {
    const saved = localStorage.getItem(LAYOUT_CONFIG_KEY);
    if (saved) return JSON.parse(saved);
    
    const bundleIds = INITIAL_PRODUCTS.filter(p => p.tags.includes('bundle')).map(p => p.id);
    const newIds = INITIAL_PRODUCTS.filter(p => p.tags.includes('new')).map(p => p.id);

    return {
      sections: [
        { id: 'sec-bundles', title: 'Bundles Deals', type: 'carousel', productIds: bundleIds, isVisible: true },
        { id: 'sec-new', title: 'New Arrivals', type: 'carousel', productIds: newIds, isVisible: true }
      ],
      showCatalog: true
    };
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [restockRequests, setRestockRequests] = useState<RestockRequest[]>(() => {
    const saved = localStorage.getItem(RESTOCK_REQUESTS_STORAGE_KEY);
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

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(FOOTER_PAGES_STORAGE_KEY, JSON.stringify(footerPages));
  }, [footerPages]);

  useEffect(() => {
    localStorage.setItem(LAYOUT_CONFIG_KEY, JSON.stringify(layoutConfig));
  }, [layoutConfig]);

  useEffect(() => {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(RESTOCK_REQUESTS_STORAGE_KEY, JSON.stringify(restockRequests));
  }, [restockRequests]);

  useEffect(() => {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(viewLogs));
  }, [viewLogs]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const addToCart = useCallback((product: Product, quantity: number = 1, color?: string, size?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => 
        item.id === product.id && 
        item.selectedColor === color && 
        item.selectedSize === size
      );
      
      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex] = { 
          ...newCart[existingIndex], 
          quantity: newCart[existingIndex].quantity + quantity 
        };
        return newCart;
      }
      
      return [...prev, { ...product, quantity, selectedColor: color, selectedSize: size }];
    });
  }, []);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlist((prev) => {
      const isExist = prev.some(p => p.id === product.id);
      if (isExist) return prev.filter(p => p.id !== product.id);
      return [...prev, product];
    });
  }, []);

  const logView = useCallback((productId: string) => {
    setViewLogs(prev => [...prev, { productId, timestamp: Date.now() }]);
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const handleNewOrder = useCallback((order: Order) => {
    setOrders(prev => [order, ...prev]);
    setProducts(prev => prev.map(p => {
      const orderedItem = order.items.find(oi => oi.id === p.id);
      if (orderedItem) {
        return { ...p, stock: Math.max(0, p.stock - orderedItem.quantity) };
      }
      return p;
    }));
  }, []);

  const handleAddRestockRequest = useCallback((request: RestockRequest) => {
    setRestockRequests(prev => [request, ...prev]);
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Router>
      <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-[#C5A059] selection:text-white">
        <Navbar cartCount={cartCount} wishlistCount={wishlist.length} />
        
        <main className="flex-grow w-full">
          <Routes>
            <Route path="/" element={<Home products={products} setProducts={setProducts} layoutConfig={layoutConfig} footerPages={footerPages} onAddToCart={addToCart} onLogView={logView} onToggleWishlist={toggleWishlist} wishlist={wishlist} />} />
            <Route path="/wishlist" element={<Wishlist wishlist={wishlist} onToggleWishlist={toggleWishlist} onAddToCart={addToCart} />} />
            <Route path="/p/:slug" element={<InfoPage footerPages={footerPages} />} />
            <Route 
              path="/product/:id" 
              element={
                <ProductDetail 
                  products={products} 
                  onAddToCart={addToCart} 
                  onLogView={logView} 
                  onAddRestockRequest={handleAddRestockRequest}
                  onToggleWishlist={toggleWishlist}
                  wishlist={wishlist}
                />
              } 
            />
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
                  restockRequests={restockRequests}
                  layoutConfig={layoutConfig}
                  footerPages={footerPages}
                  setLayoutConfig={setLayoutConfig}
                  setFooterPages={setFooterPages}
                  setProducts={setProducts} 
                  setOrders={setOrders}
                  setRestockRequests={setRestockRequests}
                />
              } 
            />
          </Routes>
        </main>

        <WhatsAppBot />
      </div>
    </Router>
  );
};

export default App;
