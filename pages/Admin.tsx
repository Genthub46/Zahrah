
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { LayoutDashboard, Package, ShoppingCart, Plus, LogOut, Trash2, ArrowUpDown, Upload, Edit3, X, RefreshCcw, Search, BarChart3, MapPin, Phone, Mail, User, Eye, TrendingUp, Download, ArrowLeft, History, CheckCircle2, Truck, ShieldCheck, Tag, Ban } from 'lucide-react';
import { Product, Order, ViewLog } from '../types';
import Logo from '../components/Logo';

interface AdminProps {
  products: Product[];
  orders: Order[];
  viewLogs: ViewLog[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const ADMIN_SESSION_KEY = 'ZARHRAH_ADMIN_SESSION';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const Admin: React.FC<AdminProps> = ({ products, orders, viewLogs, setProducts, setOrders }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'inventory' | 'orders' | 'analytics'>('products');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductIdsInGraph, setShowProductIdsInGraph] = useState(false);
  const [viewingCustomerEmail, setViewingCustomerEmail] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    brand: '',
    price: 0,
    image: '',
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
      id: p.id
    })).sort((a, b) => b.views - a.views);
  }, [viewLogs, products]);

  const maxViews = Math.max(...viewStats.map(s => s.views), 1);
  const totalViews = Math.max(viewLogs.length, 1);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'LUXE2024') {
      setIsLoggedIn(true);
      if (rememberMe) {
        const session = {
          authenticated: true,
          expiry: Date.now() + SESSION_DURATION
        };
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      }
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

    // Process Tags
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
        image: productData.image as string,
        description: productData.description || '',
        category: (productData.category as any) || 'Apparel',
        stock: Number(productData.stock) || 0,
        tags: productData.tags as string[]
      };
      setProducts(prev => [...prev, product]);
      alert('Product added successfully');
    }
    setFormData({ name: '', brand: '', price: 0, image: '', description: '', category: 'Apparel', stock: 0, tags: [] });
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
    setFormData({ name: '', brand: '', price: 0, image: '', description: '', category: 'Apparel', stock: 0, tags: [] });
    setTagInput('');
  };

  const deleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
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
    if (viewingCustomerEmail) {
      return orders.filter(o => o.customerEmail === viewingCustomerEmail);
    }
    return orders;
  }, [orders, viewingCustomerEmail]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 px-4">
        <div className="max-w-md w-full bg-white p-12 rounded-sm shadow-2xl animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-10">
            <Logo size={100} className="mx-auto mb-6" />
            <h2 className="text-2xl font-bold tracking-[0.3em] uppercase mb-2 text-stone-900">Atelier Access</h2>
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
        <header className="mb-16">
          <span className="gold-text font-bold text-[10px] tracking-[0.4em] uppercase block mb-2">Zarhrah Atelier</span>
          <h1 className="text-4xl font-bold capitalize">{activeTab} Management</h1>
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
                  <label className="block text-[9px] font-bold tracking-widest uppercase text-stone-400 mb-2">Brand / Origin</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full p-4 bg-stone-50 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] text-xs"
                    placeholder="e.g. ZARA UK, Tom Ford, Atelier ZL"
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
                    placeholder="e.g. Minimalist Linen Blazer"
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
                      <option value="Apparel">Apparel (Clothes)</option>
                      <option value="Footwear">Footwear (Shoes)</option>
                      <option value="Watches">Watches</option>
                      <option value="Perfumes">Perfumes</option>
                      <option value="Bags">Bags & Luggage</option>
                      <option value="Accessories">Other Accessories</option>
                      <option value="Beauty">Beauty & Skincare</option>
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
                  <label className="block text-[9px] font-bold tracking-widest uppercase text-stone-400 mb-2">Labels / Tags (Comma separated)</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="w-full p-4 pl-10 bg-stone-50 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] text-xs"
                      placeholder="e.g. luxury, summer, limited-edition, zara"
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
                    className={`w-full p-4 border focus:outline-none text-xs transition-colors ${formData.stock === 0 ? 'bg-red-50 border-red-200 focus:ring-red-400' : 'bg-stone-50 border-stone-200 focus:ring-[#C5A059]'}`}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold tracking-widest uppercase text-stone-400 mb-2">Upload Image</label>
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-stone-200 p-8 text-center hover:border-[#C5A059] transition-colors cursor-pointer group">
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    {formData.image ? (
                      <img src={formData.image} className="h-32 mx-auto object-cover rounded-sm shadow-md" alt="Preview" />
                    ) : (
                      <div className="space-y-2">
                        <Upload size={24} className="mx-auto text-stone-300 group-hover:text-[#C5A059] transition-colors" />
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Choose Photo</p>
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
                <h3 className="text-[10px] font-bold tracking-widest uppercase">Catalog Lookup</h3>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Search name, brand, tag..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-4 py-2 bg-stone-100 border-none focus:ring-1 focus:ring-[#C5A059] text-[10px] uppercase font-bold tracking-widest rounded-sm w-56"
                  />
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                </div>
              </div>
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-4">
                {filteredProducts.map(p => (
                  <div key={p.id} className={`bg-white p-4 flex items-center justify-between border group transition-all ${p.stock <= 0 ? 'border-red-100 bg-red-50/20' : 'border-stone-200'}`}>
                    <div className="flex items-center space-x-4">
                      <img src={p.image} className={`w-12 h-16 object-cover rounded-sm ${p.stock <= 0 ? 'grayscale' : 'bg-stone-50'}`} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-[8px] font-bold gold-text uppercase tracking-widest">{p.brand}</p>
                          {p.stock <= 0 && <span className="text-[7px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full uppercase tracking-tighter flex items-center"><Ban size={8} className="mr-1"/> SOLD OUT</span>}
                        </div>
                        <p className={`text-xs font-bold ${p.stock <= 0 ? 'text-stone-400' : 'text-stone-900'}`}>{p.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[7px] bg-stone-100 text-stone-500 px-1 rounded-sm uppercase">{tag}</span>
                          ))}
                        </div>
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
           <div className="bg-white border border-stone-200 overflow-hidden shadow-sm">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-stone-50 border-b border-stone-200">
                   <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-stone-400">Brand & Product</th>
                   <th className="px-8 py-5 text-[9px] font-bold uppercase tracking-widest text-stone-400 text-right">Stock Level</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-stone-100">
                 {products.map(p => (
                   <tr key={p.id} className={`hover:bg-stone-50/50 transition-colors ${p.stock <= 0 ? 'bg-red-50/30' : ''}`}>
                     <td className="px-8 py-6 flex items-center space-x-3">
                       <span className={`w-2 h-2 rounded-full ${p.stock <= 0 ? 'bg-red-500 animate-pulse' : p.stock < 5 ? 'bg-amber-500' : 'bg-green-500'}`} />
                       <div className="flex flex-col">
                         <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">{p.brand}</span>
                         <span className={`text-xs font-medium ${p.stock <= 0 ? 'text-stone-400 italic' : 'text-stone-900'}`}>{p.name} {p.stock <= 0 ? '(Sold Out)' : ''}</span>
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
      </main>
    </div>
  );
};

export default Admin;
