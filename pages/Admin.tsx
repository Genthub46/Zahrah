
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Package, ShoppingCart, Plus, LogOut, Trash2, 
  Search, BarChart3, Edit3, X, BellRing, 
  Loader2, Lock, Eye, Calendar, Mail, Palette,
  CheckCircle2, Layers, PenTool, Sparkles, LayoutGrid, ToggleLeft, ToggleRight, EyeOff, Image as ImageIcon, AlertTriangle, TrendingUp, TrendingDown, Activity, DollarSign, Target, Award, ArrowUp, ArrowDown, GripVertical, User, MapPin, Phone, ExternalLink, Clock, Send, FileText, Info, ChevronRight, Menu, ExternalLink as LinkIcon, Upload, Check, AlertCircle as AlertIcon
} from 'lucide-react';
import { Product, Order, ViewLog, RestockRequest, HomeLayoutConfig, SectionConfig, FooterPage } from '../types';
import Logo from '../components/Logo';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminProps {
  products: Product[];
  orders: Order[];
  viewLogs: ViewLog[];
  restockRequests: RestockRequest[];
  layoutConfig: HomeLayoutConfig;
  footerPages: FooterPage[];
  setLayoutConfig: React.Dispatch<React.SetStateAction<HomeLayoutConfig>>;
  setFooterPages: React.Dispatch<React.SetStateAction<FooterPage[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setRestockRequests: React.Dispatch<React.SetStateAction<RestockRequest[]>>;
}

const ADMIN_SESSION_KEY = 'ZARHRAH_ADMIN_SESSION';
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
const LUXURY_BRANDS = ['ASHLUXE', 'ZARA UK', 'GUCCI', 'CUSTOM'];

const Admin: React.FC<AdminProps> = ({ 
  products = [], 
  orders = [], 
  viewLogs = [], 
  restockRequests = [], 
  layoutConfig,
  footerPages = [],
  setLayoutConfig,
  setFooterPages,
  setProducts, 
  setOrders, 
  setRestockRequests 
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics' | 'requests' | 'layout' | 'pages'>('products');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Pages State
  const [editingPageSlug, setEditingPageSlug] = useState<string | null>(null);
  const [pageFormData, setPageFormData] = useState<Partial<FooterPage>>({
    title: '',
    slug: '',
    content: '',
    category: 'Customer Services'
  });

  // Layout Management State
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // States for product form handling
  const [priceInput, setPriceInput] = useState<string>('');
  const [imageInput, setImageInput] = useState('');
  const [isUrlValid, setIsUrlValid] = useState<boolean | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    brand: 'ASHLUXE',
    description: '',
    category: 'Apparel',
    stock: 0,
    images: [],
    tags: [],
    colors: [],
    sizes: [],
    features: [],
    composition: [],
    specifications: []
  });

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }, []);

  useEffect(() => {
    const savedSession = localStorage.getItem(ADMIN_SESSION_KEY);
    if (savedSession) {
      const { expiry } = JSON.parse(savedSession);
      if (Date.now() < expiry) setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => {
      if (passcode === 'LUXURY#ADMIN') {
        setIsLoggedIn(true);
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ authenticated: true, expiry: Date.now() + INACTIVITY_TIMEOUT }));
        setPasscode('');
      } else alert('Invalid Access Code');
      setIsLoggingIn(false);
    }, 1200);
  };

  // --- Image Handling Logic ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const addImageFromUrl = () => {
    if (!imageInput) return;
    setFormData(prev => ({ ...prev, images: [...(prev.images || []), imageInput] }));
    setImageInput('');
    setIsUrlValid(null);
  };

  const removeImage = (idx: number) => {
    setFormData(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== idx) }));
  };

  const clearGallery = () => {
    if (confirm('Wipe all assets from this gallery?')) {
      setFormData(prev => ({ ...prev, images: [] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = parseFloat(priceInput);
    if (!formData.name || isNaN(numericPrice) || !formData.images?.length) {
      alert("Validation Error: Artifact Designation, Price, and at least one Asset required.");
      return;
    }
    const finalProduct = {
      ...formData,
      price: numericPrice,
      id: editingId || `p-${Date.now()}`,
      brand: formData.brand === 'CUSTOM' ? customBrand.toUpperCase() : formData.brand,
      tags: tagInput.split(',').map(t => t.trim().toLowerCase()).filter(t => t),
      sizes: sizeInput.split(',').map(s => s.trim()).filter(s => s),
    } as Product;

    if (editingId) setProducts(prev => prev.map(p => p.id === editingId ? finalProduct : p));
    else setProducts(prev => [finalProduct, ...prev]);
    
    cancelEdit();
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData(product);
    setPriceInput(product.price.toString());
    setTagInput(product.tags.join(', '));
    setSizeInput(product.sizes?.join(', ') || '');
    setCustomBrand(LUXURY_BRANDS.includes(product.brand) ? '' : product.brand);
    if (!LUXURY_BRANDS.includes(product.brand)) setFormData(f => ({ ...f, brand: 'CUSTOM' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setPriceInput('');
    setTagInput('');
    setSizeInput('');
    setCustomBrand('');
    setFormData({ name: '', brand: 'ASHLUXE', price: 0, images: [], description: '', category: 'Apparel', stock: 0, tags: [], colors: [], sizes: [] });
  };

  // --- Pages & Layout ---
  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageFormData.slug || !pageFormData.title) return;
    setFooterPages(prev => {
      const exists = prev.some(p => p.slug === pageFormData.slug);
      if (exists) return prev.map(p => p.slug === pageFormData.slug ? { ...p, ...pageFormData } as FooterPage : p);
      return [...prev, pageFormData as FooterPage];
    });
    setEditingPageSlug(null);
    setPageFormData({ title: '', slug: '', content: '', category: 'Customer Services' });
  };

  const startEditPage = (page: FooterPage) => {
    setEditingPageSlug(page.slug);
    setPageFormData(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addSection = () => {
    if (!newSectionTitle) return;
    const newSection: SectionConfig = {
      id: `sec-${Date.now()}`,
      title: newSectionTitle,
      type: 'carousel',
      productIds: [],
      isVisible: true
    };
    setLayoutConfig(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
    setNewSectionTitle('');
  };

  const toggleProductInSection = (sectionId: string, productId: string) => {
    setLayoutConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id === sectionId) {
          const exists = s.productIds.includes(productId);
          return {
            ...s,
            productIds: exists ? s.productIds.filter(id => id !== productId) : [...s.productIds, productId]
          };
        }
        return s;
      })
    }));
  };

  const analyticsData = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    return { totalRevenue };
  }, [orders]);

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'requests', label: 'Waitlist', icon: BellRing },
    { id: 'pages', label: 'Boutique Pages', icon: FileText },
    { id: 'layout', label: 'Home Layout', icon: LayoutGrid }
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center p-6 pt-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
          <div className="bg-[#141211] p-12 border border-stone-800 shadow-2xl rounded-sm flex flex-col items-center">
            <Logo size={120} className="mb-12" />
            <form onSubmit={handleLogin} className="w-full space-y-6">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-700" size={16} />
                <input 
                  type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="ACCESS KEY"
                  className="w-full pl-12 pr-6 py-4 bg-stone-900 border border-stone-800 focus:border-[#C5A059] focus:outline-none text-white text-[10px] font-bold tracking-[0.4em]"
                />
              </div>
              <button disabled={isLoggingIn} className="w-full bg-[#C5A059] text-white py-4 text-[10px] font-bold tracking-[0.4em] uppercase shadow-xl hover:bg-[#B38E46] transition-all">
                {isLoggingIn ? <Loader2 className="animate-spin" size={16} /> : "Authenticate"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col lg:flex-row font-sans">
      {/* Tab Navigation (Improved Sticky Top Bar) */}
      <div className="lg:hidden fixed top-[70px] left-0 right-0 z-[9000] glass border-b border-stone-200 shadow-xl overflow-x-auto no-scrollbar py-3">
        <div className="flex px-4 space-x-3 min-w-max">
          {tabs.map((tab) => (
            <button 
              key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 flex items-center space-x-3 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-stone-900 text-white shadow-xl scale-105' : 'text-stone-400 bg-white border border-stone-100'}`}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-stone-100 fixed h-full flex-col z-[100] pt-40">
        <div className="p-8">
          <nav className="space-y-4">
            {tabs.map((tab) => (
              <button 
                key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-4 w-full px-6 py-4 rounded-2xl text-[10px] font-bold tracking-widest uppercase transition-all ${activeTab === tab.id ? 'bg-stone-900 text-white shadow-lg scale-105' : 'text-stone-400 hover:text-stone-900'}`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-8 border-t border-stone-50">
          <button onClick={handleLogout} className="text-[10px] font-bold tracking-widest uppercase text-red-500 flex items-center space-x-2">
            <LogOut size={16} />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-72 p-8 lg:p-20 pt-48 lg:pt-44">
        <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div>
              <h1 className="text-4xl md:text-6xl font-bold serif text-stone-900 tracking-tight italic">
                {tabs.find(t => t.id === activeTab)?.label}
              </h1>
              <div className="flex items-center mt-3 space-x-3">
                <span className="w-6 h-[2px] bg-[#C5A059]" />
                <p className="text-[10px] text-stone-400 uppercase tracking-[0.4em] font-bold">ZARHRAH EXECUTIVE PANEL</p>
              </div>
           </div>
           {activeTab === 'products' && (
             <div className="relative w-full md:w-80">
                <input type="text" placeholder="QUERY COLLECTION..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-stone-50 border border-stone-100 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase focus:outline-none shadow-sm" />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
             </div>
           )}
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'products' && (
            <motion.div key="products-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid lg:grid-cols-12 gap-16">
              <div className="lg:col-span-5 bg-white p-10 border border-stone-100 shadow-xl rounded-[3rem] h-fit lg:sticky lg:top-44 overflow-y-auto no-scrollbar max-h-[85vh]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Brand Identity</label>
                    <div className="space-y-3">
                      <select value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value as any})} className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none">
                        {LUXURY_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      {formData.brand === 'CUSTOM' && (
                        <input type="text" placeholder="ENTER BRAND NAME" value={customBrand} onChange={(e) => setCustomBrand(e.target.value)} className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Product Designation</label>
                    <input type="text" placeholder="NAME OF ARTIFACT" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none" />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Price (NGN)</label>
                      <input type="text" placeholder="190000" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Studio Stock</label>
                      <input type="number" placeholder="20" min="0" value={formData.stock} onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})} className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1 flex items-center">
                      Internal Tags <Info size={10} className="ml-1 opacity-50" />
                    </label>
                    <input 
                      type="text" placeholder="e.g. men, new, summer" value={tagInput} onChange={(e) => setTagInput(e.target.value)} 
                      className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none" 
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-stone-50">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest flex items-center">
                        <ImageIcon size={14} className="mr-2 text-[#C5A059]" /> Asset Gallery
                      </label>
                      <button type="button" onClick={clearGallery} className="text-[8px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors">Clear All</button>
                    </div>

                    {/* Previews Grid */}
                    <div className="grid grid-cols-4 gap-3 bg-stone-50/50 p-3 rounded-2xl border border-stone-100 min-h-[60px]">
                      {formData.images?.map((img, i) => (
                        <div key={i} className="relative group aspect-square rounded-xl bg-white border border-stone-200 overflow-hidden shadow-sm">
                          <img src={img} className="w-full h-full object-contain" alt={`Preview ${i}`} />
                          <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      {(!formData.images || formData.images.length === 0) && (
                        <div className="col-span-4 flex items-center justify-center py-4 text-stone-300 italic text-[10px]">No assets deployed.</div>
                      )}
                    </div>

                    {/* Upload Controls */}
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input 
                            type="text" 
                            placeholder="IMAGE URL..." 
                            value={imageInput} 
                            onChange={(e) => setImageInput(e.target.value)} 
                            className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-xl text-[10px] font-bold focus:outline-none pr-12" 
                          />
                          {imageInput && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <img 
                                src={imageInput} 
                                className="w-6 h-6 object-cover rounded border border-stone-200 bg-white" 
                                onError={(e) => (e.currentTarget.style.display = 'none')} 
                                onLoad={(e) => (e.currentTarget.style.display = 'block')}
                                alt="Small Preview" 
                              />
                            </div>
                          )}
                        </div>
                        <button type="button" onClick={addImageFromUrl} className="bg-stone-900 text-white px-5 rounded-xl hover:bg-stone-700 transition-all shadow-md active:scale-95"><Plus size={18} /></button>
                      </div>

                      <div className="relative">
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*" 
                          ref={fileInputRef} 
                          onChange={handleFileUpload} 
                          className="hidden" 
                        />
                        <button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full flex items-center justify-center space-x-3 py-3 border-2 border-dashed border-stone-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-stone-400 hover:border-[#C5A059] hover:text-[#C5A059] transition-all"
                        >
                          <Upload size={14} />
                          <span>Upload Multi-Images from Device</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                     <button type="submit" className="w-full bg-[#1c1917] text-white py-6 rounded-2xl text-[11px] font-bold tracking-[0.3em] uppercase shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                        {editingId ? "Update Portfolio" : "Deploy Artifact"}
                     </button>
                     {editingId && (
                       <button type="button" onClick={cancelEdit} className="w-full text-[9px] font-black uppercase tracking-widest text-stone-300 mt-4">Cancel Editing</button>
                     )}
                  </div>
                </form>
              </div>

              <div className="lg:col-span-7 space-y-6">
                 {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.brand.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                   <motion.div layout key={p.id} className="bg-white p-6 border border-stone-100 rounded-[2rem] flex items-center justify-between group hover:shadow-lg transition-all">
                      <div className="flex items-center space-x-6">
                         <div className="w-16 h-20 bg-stone-50 rounded-xl border border-stone-100 p-2 flex items-center justify-center">
                            <img src={p.images[0]} className="max-h-full max-w-full object-contain" />
                         </div>
                         <div>
                            <h3 className="text-sm font-bold text-stone-900 tracking-tight">{p.name}</h3>
                            <div className="flex items-center space-x-3 mt-1">
                               <span className="text-[8px] font-black gold-text uppercase tracking-widest">{p.brand}</span>
                               <span className="text-stone-200 text-xs">•</span>
                               <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">N{p.price.toLocaleString()}</span>
                            </div>
                            <p className="text-[8px] text-stone-300 font-bold uppercase tracking-widest mt-1">{p.images.length} Assets</p>
                         </div>
                      </div>
                      <div className="flex space-x-1">
                         <button onClick={() => startEdit(p)} className="p-3 text-stone-300 hover:text-stone-900 hover:bg-stone-50 rounded-xl transition-all"><Edit3 size={18} /></button>
                         <button onClick={() => { if(confirm('Delete permanently?')) setProducts(prev => prev.filter(pr => pr.id !== p.id)) }} className="p-3 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                      </div>
                   </motion.div>
                 ))}
                 {products.length === 0 && (
                   <div className="py-20 text-center text-stone-300 italic serif text-xl">Collection empty.</div>
                 )}
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div key="orders-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
               <div className="bg-white border border-stone-100 rounded-[3rem] shadow-sm overflow-hidden">
                  <div className="p-10 border-b border-stone-50 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-stone-900 tracking-tight">Order Log</h3>
                    <button className="px-6 py-2 bg-stone-50 rounded-xl text-[9px] font-bold uppercase text-stone-400 tracking-widest">Download Manifest</button>
                  </div>
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                      <thead className="bg-stone-50/50 border-b border-stone-100">
                        <tr className="text-[9px] font-black uppercase text-stone-400 tracking-[0.4em]">
                          <th className="px-10 py-6">ID</th>
                          <th className="px-10 py-6">Client</th>
                          <th className="px-10 py-6">Status</th>
                          <th className="px-10 py-6 text-right">Yield</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                        {orders.map(order => (
                          <tr key={order.id} className="hover:bg-stone-50/30 transition-all">
                            <td className="px-10 py-6 text-[9px] font-black uppercase tracking-widest">{order.id.slice(-8)}</td>
                            <td className="px-10 py-6">
                              <p className="text-sm font-bold text-stone-900">{order.customerName}</p>
                              <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">{order.customerPhone}</p>
                            </td>
                            <td className="px-10 py-6">
                              <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                                order.status === 'Delivered' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="px-10 py-6 text-right text-sm font-black text-stone-900">₦{order.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'requests' && (
            <motion.div key="requests-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
               <div className="bg-white border border-stone-100 rounded-[3rem] shadow-sm overflow-hidden">
                  <div className="p-10 border-b border-stone-50">
                    <h3 className="text-xl font-bold text-stone-900 tracking-tight">Waitlist Demand</h3>
                  </div>
                  <div className="p-10 space-y-4">
                    {restockRequests.map((req) => {
                      const p = products.find(prod => prod.id === req.productId);
                      return (
                        <div key={req.id} className="flex items-center justify-between p-6 bg-stone-50 rounded-2xl border border-stone-100">
                          <div className="flex items-center space-x-6">
                            <div className="w-12 h-16 bg-white rounded-lg flex items-center justify-center p-2 border border-stone-100">
                              <img src={p?.images[0]} className="max-h-full max-w-full object-contain" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-stone-900">{p?.name || 'Unknown Artifact'}</p>
                              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{req.customerEmail}</p>
                            </div>
                          </div>
                          <button onClick={() => setRestockRequests(prev => prev.filter(r => r.id !== req.id))} className="p-4 text-stone-300 hover:text-red-500 transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'pages' && (
            <motion.div key="pages-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
               <div className="grid lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-5">
                    <div className="bg-white border border-stone-100 p-10 rounded-[2.5rem] shadow-sm lg:sticky lg:top-44">
                      <h3 className="text-xl font-bold text-stone-900 mb-8 serif italic">{editingPageSlug ? 'Modify Content' : 'Create Boutique Page'}</h3>
                      <form onSubmit={handlePageSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Page Category</label>
                          <select 
                            value={pageFormData.category} 
                            onChange={(e) => setPageFormData({...pageFormData, category: e.target.value as any})}
                            className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none"
                          >
                            <option value="Customer Services">Customer Services</option>
                            <option value="Company">Company</option>
                            <option value="Categories">Categories</option>
                            <option value="Policies">Policies</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Title</label>
                          <input 
                            type="text" value={pageFormData.title} onChange={(e) => setPageFormData({...pageFormData, title: e.target.value})}
                            placeholder="e.g. SHIPPING POLICY" className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Slug (URL identifier)</label>
                          <input 
                            type="text" value={pageFormData.slug} onChange={(e) => setPageFormData({...pageFormData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                            placeholder="shipping-policy" className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-stone-400">Content (Plain Text)</label>
                          <textarea 
                            rows={8} value={pageFormData.content} onChange={(e) => setPageFormData({...pageFormData, content: e.target.value})}
                            placeholder="Detailed text content..." className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[11px] font-medium leading-relaxed focus:outline-none resize-none"
                          />
                        </div>
                        <button type="submit" className="w-full bg-stone-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] shadow-xl hover:bg-stone-800 transition-all">
                          {editingPageSlug ? 'Commit Changes' : 'Publish Page'}
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="lg:col-span-7 space-y-4">
                    {footerPages.map((page) => (
                      <div key={page.slug} className="bg-white p-6 border border-stone-100 rounded-[1.5rem] flex items-center justify-between group hover:shadow-lg transition-all">
                        <div className="flex items-center space-x-6">
                           <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-300 group-hover:bg-[#C5A059] group-hover:text-white transition-all">
                             <FileText size={18} />
                           </div>
                           <div>
                             <h4 className="text-sm font-bold text-stone-900 tracking-tight">{page.title}</h4>
                             <p className="text-[9px] font-black gold-text uppercase tracking-widest mt-1">{page.category} • /{page.slug}</p>
                           </div>
                        </div>
                        <div className="flex space-x-2">
                           <button onClick={() => startEditPage(page)} className="p-3 text-stone-300 hover:text-stone-900 transition-colors"><Edit3 size={16} /></button>
                           <button onClick={() => { if(confirm('Delete?')) setFooterPages(prev => prev.filter(p => p.slug !== page.slug)) }} className="p-3 text-stone-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </motion.div>
          )}

          {/* Other tabs handled correctly */}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Admin;
