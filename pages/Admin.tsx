
import React, { useState, useRef, useMemo } from 'react';
import { LayoutDashboard, Package, ShoppingCart, Plus, LogOut, Trash2, ArrowUpDown, Upload, Edit3, X, RefreshCcw, Search, BarChart3, MapPin, Phone, Mail, User, Eye, TrendingUp, Download, ArrowLeft, History } from 'lucide-react';
import { Product, Order, ViewLog } from '../types';

interface AdminProps {
  products: Product[];
  orders: Order[];
  viewLogs: ViewLog[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const Admin: React.FC<AdminProps> = ({ products, orders, viewLogs, setProducts, setOrders }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'inventory' | 'orders' | 'analytics'>('products');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductIdsInGraph, setShowProductIdsInGraph] = useState(false);
  const [viewingCustomerEmail, setViewingCustomerEmail] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    image: '',
    description: '',
    category: 'Apparel',
    stock: 0
  });

  // Calculate View Analytics
  const viewStats = useMemo(() => {
    const counts: Record<string, number> = {};
    viewLogs.forEach(log => {
      counts[log.productId] = (counts[log.productId] || 0) + 1;
    });
    
    return products.map(p => ({
      name: p.name,
      views: counts[p.id] || 0,
      id: p.id
    })).sort((a, b) => b.views - a.views);
  }, [viewLogs, products]);

  const maxViews = Math.max(...viewStats.map(s => s.views), 1);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'LUXE2024') {
      setIsLoggedIn(true);
    } else {
      alert('Incorrect Passcode');
    }
  };

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await resizeImage(file);
        setFormData(prev => ({ ...prev, image: base64 }));
      } catch (err) {
        alert("Failed to process image.");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.image) {
      alert("Please fill in all required fields.");
      return;
    }

    if (editingId) {
      setProducts(prev => prev.map(p => 
        p.id === editingId ? { ...p, ...formData as Product } : p
      ));
      alert('Product updated successfully');
      setEditingId(null);
    } else {
      const product: Product = {
        id: `p-${Date.now()}`,
        name: formData.name as string,
        price: Number(formData.price),
        image: formData.image as string,
        description: formData.description || '',
        category: (formData.category as any) || 'Apparel',
        stock: Number(formData.stock) || 0
      };
      setProducts(prev => [...prev, product]);
      alert('Product added successfully');
    }
    setFormData({ name: '', price: 0, image: '', description: '', category: 'Apparel', stock: 0 });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({ ...product });
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', price: 0, image: '', description: '', category: 'Apparel', stock: 0 });
  };

  const deleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product from the catalog?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const exportOrdersToCSV = () => {
    if (orders.length === 0) {
      alert("No orders available to export.");
      return;
    }

    const headers = ["Order ID", "Date", "Customer Name", "Email", "Phone", "Address", "Items", "Total (NGN)", "Status"];
    const csvRows = (viewingCustomerEmail ? orders.filter(o => o.customerEmail === viewingCustomerEmail) : orders).map(order => {
      const itemSummary = order.items.map(i => `${i.quantity}x ${i.name}`).join(" | ");
      return [
        order.id,
        new Date(order.date).toLocaleDateString(),
        `"${order.customerName.replace(/"/g, '""')}"`,
        order.customerEmail,
        order.customerPhone,
        `"${order.customerAddress.replace(/"/g, '""')}"`,
        `"${itemSummary.replace(/"/g, '""')}"`,
        order.total,
        order.status
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Zarhrah_Luxury_Orders_${viewingCustomerEmail ? viewingCustomerEmail.split('@')[0] + '_' : ''}${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedOrders = useMemo(() => {
    if (viewingCustomerEmail) {
      return orders.filter(o => o.customerEmail === viewingCustomerEmail);
    }
    return orders;
  }, [orders, viewingCustomerEmail]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 px-4">
        <div className="max-w-md w-full bg-white p-12 rounded-sm shadow-2xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-[0.3em] uppercase mb-2">Atelier Access</h2>
            <p className="text-stone-400 text-[10px] font-bold tracking-widest uppercase">Zarhrah Luxury Admin</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="password"
              placeholder="PASSCODE"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full px-6 py-4 bg-stone-50 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] text-center tracking-[0.5em] text-lg"
              autoFocus
            />
            <button className="w-full gold-bg text-white py-4 font-bold tracking-[0.2em] text-[10px] hover:bg-stone-800 transition-all uppercase">
              Enter Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 fixed h-full hidden md:block">
        <div className="p-10">
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase mb-12">Dashboard</h2>
          <nav className="space-y-8">
            <button 
              onClick={() => { setActiveTab('products'); setViewingCustomerEmail(null); }}
              className={`flex items-center space-x-4 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'products' ? 'gold-text' : 'text-stone-400 hover:text-stone-900'}`}
            >
              <Package size={16} />
              <span>Products</span>
            </button>
            <button 
              onClick={() => { setActiveTab('inventory'); setViewingCustomerEmail(null); }}
              className={`flex items-center space-x-4 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'inventory' ? 'gold-text' : 'text-stone-400 hover:text-stone-900'}`}
            >
              <ArrowUpDown size={16} />
              <span>Inventory</span>
            </button>
            <button 
              onClick={() => { setActiveTab('orders'); setViewingCustomerEmail(null); }}
              className={`flex items-center space-x-4 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'orders' ? 'gold-text' : 'text-stone-400 hover:text-stone-900'}`}
            >
              <ShoppingCart size={16} />
              <span>Orders</span>
            </button>
            <button 
              onClick={() => { setActiveTab('analytics'); setViewingCustomerEmail(null); }}
              className={`flex items-center space-x-4 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'analytics' ? 'gold-text' : 'text-stone-400 hover:text-stone-900'}`}
            >
              <BarChart3 size={16} />
              <span>Analytics</span>
            </button>
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="flex items-center space-x-4 text-[10px] font-bold tracking-widest uppercase text-stone-400 hover:text-red-600 transition-colors pt-12 border-t border-stone-100 w-full"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-8 md:p-16">
        <header className="flex justify-between items-end mb-16">
          <div>
            <span className="gold-text font-bold text-[10px] tracking-[0.4em] uppercase block mb-2">Zarhrah Atelier</span>
            <h1 className="text-4xl font-bold capitalize">{activeTab} Management</h1>
          </div>
        </header>

        {activeTab === 'analytics' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div className="bg-stone-900 text-white p-8 rounded-sm shadow-sm relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <Eye size={80} />
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">Global Impressions</p>
                  <p className="text-3xl font-bold">{viewLogs.length}</p>
               </div>
               <div className="bg-white border border-stone-200 p-8 rounded-sm shadow-sm">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">Conversion Ratio</p>
                  <p className="text-3xl font-bold">{viewLogs.length > 0 ? ((orders.length / viewLogs.length) * 100).toFixed(1) : 0}%</p>
               </div>
               <div className="bg-white border border-stone-200 p-8 rounded-sm shadow-sm">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">Active Catalog</p>
                  <p className="text-3xl font-bold">{products.length}</p>
               </div>
               <div className="bg-[#C5A059] text-white p-8 rounded-sm shadow-sm relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform duration-500">
                    <TrendingUp size={80} />
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-2">Session Revenue</p>
                  <p className="text-3xl font-bold">N{orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}</p>
               </div>
            </div>

            {/* Main Traffic Graph */}
            <section className="bg-white p-12 border border-stone-200 shadow-sm rounded-sm">
              <div className="flex justify-between items-center mb-12 border-b border-stone-100 pb-6">
                <div>
                  <h3 className="text-[11px] font-bold tracking-widest uppercase mb-1">Product Traffic Analytics</h3>
                  <p className="text-[9px] text-stone-400 uppercase tracking-widest">Visualizing engagement per boutique item</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-stone-400">View as</span>
                  <button 
                    onClick={() => setShowProductIdsInGraph(!showProductIdsInGraph)}
                    className="bg-stone-50 border border-stone-200 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest hover:bg-stone-100 transition-colors"
                  >
                    {showProductIdsInGraph ? 'Product Names' : 'Product IDs'}
                  </button>
                </div>
              </div>

              <div className="space-y-8">
                {viewStats.map((stat, index) => (
                  <div key={stat.id} className="group">
                    <div className="flex justify-between items-end mb-2">
                      <div className="flex items-baseline space-x-3">
                        <span className="text-[9px] font-bold text-stone-300">#{index + 1}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest group-hover:text-[#C5A059] transition-colors">
                          {showProductIdsInGraph ? stat.id : stat.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold gold-text bg-stone-50 px-2 py-1 rounded-sm">
                        {stat.views.toLocaleString()} VIEWS
                      </span>
                    </div>
                    <div className="w-full bg-stone-50 h-5 rounded-sm overflow-hidden border border-stone-100 p-0.5">
                      <div 
                        className="h-full bg-stone-900 group-hover:bg-[#C5A059] transition-all duration-1000 ease-out flex items-center justify-end px-2"
                        style={{ width: `${(stat.views / maxViews) * 100}%` }}
                      >
                        {stat.views > (maxViews * 0.2) && (
                          <span className="text-[8px] font-bold text-white tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            {((stat.views / viewLogs.length) * 100).toFixed(0)}% SHARE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {viewStats.length === 0 && (
                  <div className="py-20 text-center">
                    <BarChart3 className="mx-auto text-stone-200 mb-4" size={48} />
                    <p className="text-stone-400 font-serif italic text-lg">Your atelier's traffic data will appear here.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="grid lg:grid-cols-2 gap-16">
            <section className="bg-white p-10 border border-stone-200 shadow-sm relative h-fit">
              {editingId && (
                <button 
                  onClick={cancelEdit}
                  className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 flex items-center text-[9px] font-bold uppercase tracking-widest"
                >
                  <X size={14} className="mr-1" /> Cancel Edit
                </button>
              )}
              <h3 className="text-[10px] font-bold tracking-widest uppercase mb-8 pb-4 border-b border-stone-100 flex items-center">
                {editingId ? <Edit3 size={14} className="mr-2" /> : <Plus size={14} className="mr-2" />}
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[9px] font-bold tracking-widest uppercase text-stone-400 mb-2">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-4 bg-stone-50 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] text-xs"
                    placeholder="e.g. Minimalist Linen Blazer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold tracking-widest uppercase text-stone-400 mb-2">Price (NGN)</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full p-4 bg-stone-50 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold tracking-widest uppercase text-stone-400 mb-2">Inventory Stock</label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      className="w-full p-4 bg-stone-50 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold tracking-widest uppercase text-stone-400 mb-2">Upload Image</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-stone-200 p-8 text-center hover:border-[#C5A059] transition-colors cursor-pointer group"
                  >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    {formData.image ? (
                      <div className="space-y-4">
                        <img src={formData.image} className="h-32 mx-auto object-cover rounded-sm shadow-md" alt="Preview" />
                        <p className="text-[9px] font-bold text-[#C5A059] uppercase tracking-widest">Image Loaded • Click to Change</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload size={24} className="mx-auto text-stone-300 group-hover:text-[#C5A059] transition-colors" />
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Choose Device Photo</p>
                      </div>
                    )}
                  </div>
                </div>
                <button className="w-full bg-stone-900 text-white py-5 font-bold tracking-[0.2em] text-[10px] hover:bg-[#C5A059] transition-all uppercase shadow-lg">
                  {editingId ? 'Update Atelier Item' : 'Confirm Addition'}
                </button>
              </form>
            </section>

            <section>
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-stone-100">
                <h3 className="text-[10px] font-bold tracking-widest uppercase">Live Catalog</h3>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Search Catalog..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-4 py-2 bg-stone-100 border-none focus:ring-1 focus:ring-[#C5A059] text-[10px] uppercase font-bold tracking-widest rounded-sm w-48"
                  />
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                </div>
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4">
                {filteredProducts.map(p => (
                  <div key={p.id} className="bg-white p-4 flex items-center justify-between border border-stone-200 group">
                    <div className="flex items-center space-x-4">
                      <img src={p.image} className="w-12 h-16 object-cover rounded-sm bg-stone-50" />
                      <div>
                        <p className="text-xs font-bold">{p.name}</p>
                        <p className="text-[9px] text-stone-400 uppercase tracking-widest">N{p.price.toLocaleString()} • {p.category}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => startEdit(p)} className="text-stone-300 hover:text-[#C5A059] transition-colors p-2"><Edit3 size={16} /></button>
                      <button onClick={() => deleteProduct(p.id)} className="text-stone-300 hover:text-red-500 transition-colors p-2"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-12">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                {viewingCustomerEmail && (
                  <button 
                    onClick={() => setViewingCustomerEmail(null)}
                    className="p-2 text-stone-400 hover:text-stone-900 bg-white border border-stone-200 rounded-sm shadow-sm transition-all"
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}
                <div>
                  <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-stone-400">
                    {viewingCustomerEmail ? 'Customer Order History' : 'Transaction History'}
                  </h3>
                  {viewingCustomerEmail && (
                    <p className="text-xs font-bold text-stone-900 mt-1 flex items-center">
                      <History size={12} className="mr-1.5 gold-text" /> 
                      Showing {displayedOrders.length} records for {displayedOrders[0]?.customerName}
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={exportOrdersToCSV}
                className="flex items-center space-x-2 bg-stone-900 text-white px-5 py-2.5 text-[9px] font-bold uppercase tracking-widest hover:bg-[#C5A059] transition-all rounded-sm shadow-sm"
              >
                <Download size={14} />
                <span>Export {viewingCustomerEmail ? 'Customer ' : ''}CSV Report</span>
              </button>
            </div>

            {displayedOrders.length === 0 ? (
              <div className="p-20 text-center bg-white border border-dashed border-stone-300">
                <p className="text-stone-400 font-serif italic">No orders logged.</p>
              </div>
            ) : (
              displayedOrders.map(order => (
                <div key={order.id} className="bg-white border border-stone-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-stone-50 px-8 py-6 border-b border-stone-100 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-lg mb-1">{order.id}</h4>
                      <p className="text-[10px] text-stone-400 tracking-widest uppercase font-bold">{new Date(order.date).toLocaleString()}</p>
                    </div>
                    <div className="relative group flex items-center space-x-4">
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                        className="bg-stone-900 text-white text-[9px] font-bold px-6 py-2.5 uppercase tracking-[0.2em] outline-none appearance-none cursor-pointer pr-10"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                      <RefreshCcw size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div className="p-10 grid lg:grid-cols-3 gap-12">
                    {/* Customer Dossier */}
                    <div className="space-y-6">
                       <h5 className="text-[10px] font-bold uppercase tracking-widest gold-text pb-2 border-b border-stone-100">Customer Dossier</h5>
                       <div className="space-y-4">
                          <div className="flex items-start space-x-3 group">
                             <User size={14} className="text-stone-400 mt-0.5" />
                             <button 
                                onClick={() => setViewingCustomerEmail(order.customerEmail)}
                                className={`text-sm font-bold text-left hover:text-[#C5A059] transition-colors ${viewingCustomerEmail ? 'pointer-events-none' : 'hover:underline decoration-[#C5A059] underline-offset-4'}`}
                             >
                                {order.customerName}
                             </button>
                          </div>
                          <div className="flex items-start space-x-3">
                             <Mail size={14} className="text-stone-400 mt-0.5" />
                             <p className="text-xs text-stone-600 underline">{order.customerEmail}</p>
                          </div>
                          <div className="flex items-start space-x-3">
                             <Phone size={14} className="text-stone-400 mt-0.5" />
                             <p className="text-xs text-stone-600">{order.customerPhone}</p>
                          </div>
                          <div className="flex items-start space-x-3">
                             <MapPin size={14} className="text-stone-400 mt-0.5" />
                             <p className="text-xs text-stone-600 leading-relaxed">{order.customerAddress}</p>
                          </div>
                       </div>
                    </div>

                    {/* Order Contents */}
                    <div className="lg:col-span-2 space-y-6">
                       <h5 className="text-[10px] font-bold uppercase tracking-widest gold-text pb-2 border-b border-stone-100">Shipment Contents</h5>
                       <div className="grid sm:grid-cols-2 gap-4">
                          {order.items.map(item => (
                            <div key={item.id} className="flex space-x-4 p-3 bg-stone-50 rounded-sm">
                               <img src={item.image} className="w-10 h-14 object-cover" />
                               <div>
                                  <p className="text-xs font-bold">{item.name}</p>
                                  <p className="text-[9px] text-stone-400 uppercase">Qty: {item.quantity} • N{item.price.toLocaleString()}</p>
                               </div>
                            </div>
                          ))}
                       </div>
                       <div className="pt-6 border-t border-stone-100 flex justify-between items-center">
                          <p className="text-[10px] font-bold uppercase tracking-widest">Total Transaction Value</p>
                          <p className="text-xl font-bold">N{order.total.toLocaleString()}</p>
                       </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Keeping existing tabs like Inventory... */}
        {activeTab === 'inventory' && (
          <div className="bg-white border border-stone-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-stone-400">Product</th>
                  <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-stone-400 text-right">Stock Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-8 py-6 flex items-center space-x-3">
                      <span className={`w-2 h-2 rounded-full ${p.stock < 5 ? 'bg-red-500' : 'bg-green-500'}`} />
                      <span className="text-xs font-medium">{p.name}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className={`text-sm font-bold ${p.stock < 5 ? 'text-red-600' : 'text-stone-900'}`}>{p.stock} units</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
