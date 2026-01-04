
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { LayoutDashboard, Package, ShoppingCart, Plus, LogOut, Trash2, ArrowUpDown, Upload, Edit3, X, RefreshCcw, Search, BarChart3, MapPin, Phone, Mail, User, Eye, TrendingUp, Download, ArrowLeft, History, CheckCircle2, Truck, ShieldCheck, Tag, Ban, BellRing, DollarSign, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Product, Order, ViewLog, RestockRequest } from '../types';
import Logo from '../components/Logo';

interface AdminProps {
  products: Product[];
  orders: Order[];
  viewLogs: ViewLog[];
  restockRequests: RestockRequest[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setRestockRequests: React.Dispatch<React.SetStateAction<RestockRequest[]>>;
}

const ADMIN_SESSION_KEY = 'ZARHRAH_ADMIN_SESSION';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const Admin: React.FC<AdminProps> = ({ products = [], orders = [], viewLogs = [], restockRequests = [], setProducts, setOrders, setRestockRequests }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'inventory' | 'orders' | 'analytics' | 'requests'>('products');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingCustomerEmail, setViewingCustomerEmail] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    brand: '',
    price: 0,
    images: [],
    description: '',
    category: 'Apparel',
    stock: 0,
    tags: []
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const savedSession = localStorage.getItem(ADMIN_SESSION_KEY);
    if (savedSession) {
      try {
        const { expiry } = JSON.parse(savedSession);
        if (Date.now() < expiry) {
          setIsLoggedIn(true);
        } else {
          localStorage.removeItem(ADMIN_SESSION_KEY);
        }
      } catch (e) {
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }
    }
  }, []);

  const viewStats = useMemo(() => {
    const counts: Record<string, number> = {};
    viewLogs.forEach(log => {
      counts[log.productId] = (counts[log.productId] || 0) + 1;
    });
    
    return products.map(p => ({
      name: p.name,
      views: counts[p.id] || 0,
      id: p.id,
      image: p.images?.[0] || '',
      brand: p.brand
    })).sort((a, b) => b.views - a.views);
  }, [viewLogs, products]);

  const analyticsSummary = useMemo(() => {
    const totalRevenue = (orders || []).reduce((sum, order) => sum + order.total, 0);
    const totalOrders = (orders || []).length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalViews = (viewLogs || []).length;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      totalViews
    };
  }, [orders, viewLogs]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'LUXURY#ADMIN') {
      setIsLoggedIn(true);
      const session = {
        authenticated: true,
        expiry: Date.now() + SESSION_DURATION
      };
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    } else {
      alert('Incorrect Passcode');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem(ADMIN_SESSION_KEY);
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
    const files = e.target.files;
    if (files) {
      try {
        const newImages: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const base64 = await resizeImage(files[i]);
          newImages.push(base64);
        }
        setFormData(prev => ({ 
          ...prev, 
          images: [...(prev.images || []), ...newImages] 
        }));
      } catch (err) {
        alert("Failed to process one or more images.");
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.images || formData.images.length === 0) {
      alert("Please fill in all required fields including at least one image.");
      return;
    }

    const finalTags = tagInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const productData = { 
      ...formData, 
      tags: finalTags,
      brand: formData.brand || 'Unbranded'
    };

    if (editingId) {
      setProducts(prev => prev.map(p => 
        p.id === editingId ? { ...p, ...productData as Product } : p
      ));
      alert('Product updated successfully');
      setEditingId(null);
    } else {
      const product: Product = {
        id: `p-${Date.now()}`,
        name: productData.name as string,
        brand: productData.brand as string,
        price: Number(productData.price),
        images: productData.images as string[],
        description: productData.description || '',
        category: (productData.category as any) || 'Apparel',
        stock: Number(productData.stock) || 0,
        tags: productData.tags as string[]
      };
      setProducts(prev => [...prev, product]);
      alert('Piece added successfully');
    }
    setFormData({ name: '', brand: '', price: 0, images: [], description: '', category: 'Apparel', stock: 0, tags: [] });
    setTagInput('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({ ...product });
    setTagInput(product.tags.join(', '));
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', brand: '', price: 0, images: [], description: '', category: 'Apparel', stock: 0, tags: [] });
    setTagInput('');
  };

  const deleteProduct = (id: string) => {
    if (window.confirm('Remove this piece from the boutique collection?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const deleteRestockRequest = (id: string) => {
    if (window.confirm('Clear this restock request?')) {
      setRestockRequests(prev => prev.filter(r => r.id !== id));
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.brand.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const displayedOrders = useMemo(() => {
    let filtered = orders || [];
    if (viewingCustomerEmail) {
      filtered = filtered.filter(o => o.customerEmail === viewingCustomerEmail);
    }
    if (searchTerm) {
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, viewingCustomerEmail, searchTerm]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 px-4">
        <div className="max-w-md w-full bg-white p-12 rounded-sm shadow-2xl">
          <div className="text-center mb-10">
            <Logo size={100} className="mx-auto mb-6" />
            <h2 className="text-2xl font-bold tracking-[0.3em] uppercase mb-2 text-stone-900">Admin Access</h2>
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
            <button className="w-full gold-bg text-white py-4 font-bold tracking-[0.2em] text-[10px] hover:bg-stone-800 transition-all uppercase shadow-lg flex items-center justify-center space-x-2">
              <ShieldCheck size={14} />
              <span>Enter Dashboard</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen bg-stone-50 flex">
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
              onClick={() => { setActiveTab('requests'); setViewingCustomerEmail(null); }}
              className={`flex items-center space-x-4 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'requests' ? 'gold-text' : 'text-stone-400 hover:text-stone-900'}`}
            >
              <div className="relative">
                <BellRing size={16} />
                {restockRequests.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#C5A059] rounded-full border border-white" />}
              </div>
              <span>Requests</span>
            </button>
            <button 
              onClick={() => { setActiveTab('analytics'); setViewingCustomerEmail(null); }}
              className={`flex items-center space-x-4 text-[10px] font-bold tracking-widest uppercase transition-colors ${activeTab === 'analytics' ? 'gold-text' : 'text-stone-400 hover:text-stone-900'}`}
            >
              <BarChart3 size={16} />
              <span>Analytics</span>
            </button>
            <button onClick={handleLogout} className="flex items-center space-x-4 text-[10px] font-bold tracking-widest uppercase text-stone-400 hover:text-red-600 transition-colors pt-12 border-t border-stone-100 w-full">
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-8 md:p-16">
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="gold-text font-bold text-[10px] tracking-[0.4em] uppercase block mb-2">Zarhrah Luxury</span>
            <h1 className="text-4xl font-bold capitalize serif italic">{activeTab} Management</h1>
          </div>
          <div className="relative">
            <input 
              type="text"
              placeholder="SEARCH CATALOG..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-4 py-2 bg-stone-100 border-none focus:ring-1 focus:ring-[#C5A059] text-[10px] uppercase font-bold tracking-widest rounded-sm w-full md:w-64"
            />
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          </div>
        </header>

        {activeTab === 'products' && (
          <div className="grid lg:grid-cols-2 gap-16">
            <section className="bg-white p-10 border border-stone-200 shadow-sm relative h-fit">
              {editingId && (
                <button onClick={cancelEdit} className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 flex items-center text-[9px] font-bold uppercase tracking-widest">
                  <X size={14} className="mr-1" /> Cancel Edit
                </button>
              )}
              <h3 className="text-[10px] font-bold tracking-widest uppercase mb-8 pb-4 border-b border-stone-100 flex items-center">
                {editingId ? <Edit3 size={14} className="mr-2" /> : <Plus size={14} className="mr-2" />}
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[9px] font-bold tracking-widest uppercase text-stone-400 mb-2">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full p-4 bg-stone-50 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] text-xs"
                    placeholder="e.g. ZARA UK"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold tracking-widest uppercase text-stone-400 mb-2">Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-4 bg-stone-50 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold tracking-widest uppercase text-stone-400 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full p-4 bg-stone-50 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] text-xs"
                    >
                      <option value="Apparel">Apparel</option>
                      <option value="Footwear">Footwear</option>
                      <option value="Watches">Watches</option>
                      <option value="Perfumes">Perfumes</option>
                      <option value="Bags">Bags</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
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
                <div>
                  <label className="block text-[9px] font-bold tracking-widest uppercase text-stone-400 mb-2">Tags</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="w-full p-4 pl-10 bg-stone-50 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] text-xs"
                      placeholder="luxury, limited, zara..."
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold tracking-widest uppercase text-stone-400 mb-2">Upload Photos</label>
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-stone-200 p-8 text-center hover:border-[#C5A059] transition-colors cursor-pointer group rounded-sm">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" multiple />
                    <div className="space-y-2">
                      <Upload size={24} className="mx-auto text-stone-300 group-hover:text-[#C5A059] transition-colors" />
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Select One or More Images</p>
                    </div>
                  </div>
                  
                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-6">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative aspect-[3/4] group border border-stone-100 rounded-sm overflow-hidden">
                          <img src={img} className="w-full h-full object-cover" alt="" />
                          <button 
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button className="w-full bg-stone-900 text-white py-5 font-bold tracking-[0.2em] text-[10px] hover:bg-[#C5A059] transition-all uppercase shadow-lg">
                  {editingId ? 'Update Product' : 'Add to Collection'}
                </button>
              </form>
            </section>

            <section className="space-y-4">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-stone-100">
                <h3 className="text-[10px] font-bold tracking-widest uppercase">Catalog Overview</h3>
              </div>
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                {filteredProducts.map(p => (
                  <div key={p.id} className="bg-white p-4 flex items-center justify-between border border-stone-200 group transition-shadow hover:shadow-md">
                    <div className="flex items-center space-x-4">
                      <img src={p.images?.[0]} className="w-12 h-16 object-cover rounded-sm grayscale group-hover:grayscale-0 transition-all" alt="" />
                      <div>
                        <p className="text-[8px] font-bold gold-text uppercase tracking-widest">{p.brand}</p>
                        <p className="text-xs font-bold text-stone-900">{p.name}</p>
                        <p className="text-[10px] text-stone-400">N{p.price.toLocaleString()} • {p.stock} units</p>
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

        {activeTab === 'inventory' && (
           <div className="bg-white border border-stone-200 shadow-sm">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-stone-50 border-b border-stone-200">
                   <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-stone-400">Product</th>
                   <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-stone-400 text-right">Stock</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-stone-100">
                 {products.map(p => (
                   <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                     <td className="px-8 py-6 flex items-center space-x-4">
                       <img src={p.images?.[0]} className="w-10 h-14 object-cover rounded-sm grayscale" alt="" />
                       <div>
                         <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">{p.brand}</span>
                         <p className="text-xs font-medium text-stone-900">{p.name}</p>
                       </div>
                     </td>
                     <td className="px-8 py-6 text-right">
                       <span className={`text-sm font-bold ${p.stock <= 0 ? 'text-red-600' : p.stock < 5 ? 'text-amber-600' : 'text-stone-900'}`}>{p.stock} units</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {displayedOrders.length === 0 ? (
              <div className="bg-white border border-stone-200 p-32 text-center rounded-sm">
                <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <ShoppingCart size={32} className="text-stone-200" />
                </div>
                <h3 className="text-2xl font-bold mb-2 serif italic">No Orders Yet</h3>
                <p className="text-stone-400 text-xs uppercase tracking-widest">Awaiting customer requests.</p>
              </div>
            ) : (
              displayedOrders.map((order) => (
                <div key={order.id} className="bg-white border border-stone-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
                  <div className="p-8 border-b border-stone-100 flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-stone-400">#{order.id}</span>
                        <span className={`px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-full ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold">{order.customerName}</h3>
                      <div className="flex flex-col space-y-1 mt-2">
                        <a href={`mailto:${order.customerEmail}`} className="text-xs text-stone-400 hover:gold-text flex items-center">
                          <Mail size={12} className="mr-2" /> {order.customerEmail}
                        </a>
                        <p className="text-xs text-stone-400 flex items-center">
                          <Phone size={12} className="mr-2" /> {order.customerPhone}
                        </p>
                        <p className="text-xs text-stone-400 flex items-center">
                          <MapPin size={12} className="mr-2" /> {order.customerAddress}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest mb-1">{new Date(order.date).toLocaleString()}</p>
                      <p className="text-2xl font-bold">N{order.total.toLocaleString()}</p>
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                        className="mt-4 text-[9px] font-bold uppercase tracking-widest p-2 bg-stone-50 border border-stone-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                      >
                        <option value="Pending">Mark Pending</option>
                        <option value="Shipped">Mark Shipped</option>
                        <option value="Delivered">Mark Delivered</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="bg-stone-50/30 p-8">
                    <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">Items Curated</h4>
                    <div className="space-y-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between border-b border-stone-100 pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center space-x-4">
                            <img src={item.images?.[0]} className="w-10 h-14 object-cover rounded-sm grayscale" alt="" />
                            <div>
                              <p className="text-[10px] font-bold text-stone-900">{item.name}</p>
                              <p className="text-[9px] text-stone-400 uppercase">{item.brand} • Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="text-xs font-bold text-stone-600">N{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-12 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: 'Total Revenue', value: `N${analyticsSummary.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-stone-900' },
                { label: 'Total Orders', value: analyticsSummary.totalOrders, icon: ShoppingCart, color: 'text-stone-900' },
                { label: 'Product Impressions', value: analyticsSummary.totalViews, icon: Eye, color: 'text-stone-900' },
                { label: 'Avg Order Value', value: `N${Math.round(analyticsSummary.avgOrderValue).toLocaleString()}`, icon: TrendingUp, color: 'gold-text' }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 border border-stone-200 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center">
                    <stat.icon size={20} className="text-stone-400" />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 bg-white border border-stone-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-stone-100">
                  <h3 className="text-[10px] font-bold tracking-widest uppercase flex items-center">
                    <TrendingUp size={16} className="mr-2 gold-text" /> Popular Piece Engagement
                  </h3>
                </div>
                <div className="p-8 space-y-8">
                  {viewStats.length === 0 ? (
                    <p className="text-center py-10 text-stone-400 italic">No view data available yet.</p>
                  ) : (
                    viewStats.slice(0, 10).map((stat) => (
                      <div key={stat.id} className="space-y-2">
                        <div className="flex justify-between items-end">
                          <div className="flex items-center space-x-3">
                            <img src={stat.image} className="w-8 h-10 object-cover grayscale rounded-sm" alt="" />
                            <div>
                              <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">{stat.brand}</p>
                              <p className="text-xs font-bold text-stone-900">{stat.name}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest gold-text">{stat.views} views</span>
                        </div>
                        <div className="h-1 bg-stone-50 overflow-hidden rounded-full">
                          <div 
                            className="h-full bg-[#C5A059]" 
                            style={{ width: `${(stat.views / Math.max(...viewStats.map(s => s.views), 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-8">
             <div className="bg-white border border-stone-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-100">
                      <th className="px-8 py-4 text-[8px] font-bold uppercase tracking-[0.2em] text-stone-400">Product</th>
                      <th className="px-8 py-4 text-[8px] font-bold uppercase tracking-[0.2em] text-stone-400">Customer Email</th>
                      <th className="px-8 py-4 text-[8px] font-bold uppercase tracking-[0.2em] text-stone-400 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {restockRequests.map((req) => {
                      const product = products.find(p => p.id === req.productId);
                      return (
                        <tr key={req.id}>
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-3">
                              <img src={product?.images?.[0]} className="w-8 h-10 object-cover rounded-sm grayscale" alt="" />
                              <div>
                                <p className="text-[8px] font-bold gold-text uppercase">{product?.brand}</p>
                                <p className="text-xs font-medium">{product?.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-xs text-stone-600 font-medium">{req.customerEmail}</td>
                          <td className="px-8 py-6 text-right">
                            <button onClick={() => deleteRestockRequest(req.id)} className="text-stone-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
