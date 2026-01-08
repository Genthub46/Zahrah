
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Package, ShoppingCart, Plus, LogOut, Trash2, 
  Search, BarChart3, Edit3, X, BellRing, 
  Loader2, Lock, Eye, Calendar, Mail, Palette,
  CheckCircle2, Layers, PenTool, Sparkles, LayoutGrid, ToggleLeft, ToggleRight, EyeOff, Image as ImageIcon, AlertTriangle, TrendingUp, TrendingDown, Activity, DollarSign, Target, Award, ArrowUp, ArrowDown, GripVertical, User, MapPin, Phone, ExternalLink, Clock, Send, FileText, Info
} from 'lucide-react';
import { Product, Order, ViewLog, RestockRequest, HomeLayoutConfig, SectionConfig, FooterPage } from '../types';
import Logo from '../components/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";

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
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics' | 'requests' | 'correspondence' | 'layout' | 'pages'>('products');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const timeoutRef = useRef<any>(null);
  
  // Layout Management State
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [productSearchInLayout, setProductSearchInLayout] = useState('');

  // Pages State
  const [editingPageSlug, setEditingPageSlug] = useState<string | null>(null);
  const [pageFormData, setPageFormData] = useState<Partial<FooterPage>>({
    title: '',
    slug: '',
    content: '',
    category: 'Customer Services'
  });

  // States for product form handling
  const [priceInput, setPriceInput] = useState<string>('');
  const [imageInput, setImageInput] = useState('');
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
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
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

  const addImage = () => {
    if (!imageInput) return;
    setFormData(prev => ({ ...prev, images: [...(prev.images || []), imageInput] }));
    setImageInput('');
  };

  const removeImage = (idx: number) => {
    setFormData(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = parseFloat(priceInput);
    if (!formData.name || isNaN(numericPrice) || !formData.images?.length) {
      alert("Validation Error: Product designation and gallery assets required.");
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
    else setProducts(prev => [...prev, finalProduct]);
    
    cancelEdit();
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData(product);
    setPriceInput(product.price.toString());
    setTagInput(product.tags.join(', '));
    setSizeInput(product.sizes?.join(', ') || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setPriceInput('');
    setFormData({ name: '', brand: 'ASHLUXE', price: 0, images: [], description: '', category: 'Apparel', stock: 0, tags: [], colors: [], sizes: [] });
    setTagInput(''); setSizeInput('');
  };

  // --- Pages Management ---
  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageFormData.slug || !pageFormData.title) return;
    
    setFooterPages(prev => {
      const exists = prev.some(p => p.slug === pageFormData.slug);
      if (exists) {
        return prev.map(p => p.slug === pageFormData.slug ? { ...p, ...pageFormData } as FooterPage : p);
      }
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

  // --- Layout Tab Operations ---
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

  const deleteSection = (id: string) => {
    if (!confirm('Destroy this section architect?')) return;
    setLayoutConfig(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }));
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const idx = layoutConfig.sections.findIndex(s => s.id === id);
    if (idx === -1) return;
    const newSections = [...layoutConfig.sections];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;
    [newSections[idx], newSections[targetIdx]] = [newSections[targetIdx], newSections[idx]];
    setLayoutConfig(prev => ({ ...prev, sections: newSections }));
  };

  const toggleSectionVisibility = (id: string) => {
    setLayoutConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s)
    }));
  };

  // --- Analytics & Formatting ---
  const analyticsData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    });

    const salesPerDay = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const startOfDay = new Date(d.setHours(0,0,0,0)).getTime();
      const endOfDay = new Date(d.setHours(23,59,59,999)).getTime();
      return orders
        .filter(order => {
          const orderTime = new Date(order.date).getTime();
          return orderTime >= startOfDay && orderTime <= endOfDay;
        })
        .reduce((sum, order) => sum + order.items.reduce((iSum, item) => iSum + item.quantity, 0), 0);
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const conversionRate = viewLogs.length > 0 ? (orders.length / viewLogs.length) * 100 : 0;

    return {
      labels: last7Days,
      sales: salesPerDay,
      totalRevenue,
      avgOrderValue,
      conversionRate
    };
  }, [viewLogs, orders]);

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
      <aside className="hidden lg:flex w-72 bg-white border-r border-stone-100 fixed h-full flex-col z-[100] pt-40">
        <div className="p-8">
          <nav className="space-y-4">
            {[
              { id: 'products', label: 'Products', icon: Package },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'requests', label: 'Waitlist', icon: BellRing },
              { id: 'pages', label: 'Boutique Pages', icon: FileText },
              { id: 'layout', label: 'Home Layout', icon: LayoutGrid }
            ].map((tab) => (
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
            <span>Terminate</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-72 p-8 lg:p-20 pt-32 lg:pt-44">
        <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div>
              <h1 className="text-6xl font-bold serif text-stone-900 tracking-tight italic">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('pages', 'Boutique Pages')}</h1>
              <div className="flex items-center mt-3 space-x-3">
                <span className="w-6 h-[2px] bg-[#C5A059]" />
                <p className="text-[10px] text-stone-400 uppercase tracking-[0.4em] font-bold">ZARHRAH EXECUTIVE SUITE</p>
              </div>
           </div>
           <div className="relative w-full md:w-80">
              <input type="text" placeholder="QUERY COLLECTION..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-stone-50 border border-stone-100 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase focus:outline-none" />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
           </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'pages' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               <div className="grid lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-5">
                    <div className="bg-white border border-stone-100 p-10 rounded-[2.5rem] shadow-sm sticky top-44">
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
                        {editingPageSlug && (
                          <button type="button" onClick={() => { setEditingPageSlug(null); setPageFormData({ title: '', slug: '', content: '', category: 'Customer Services' }); }} className="w-full text-[9px] font-black uppercase tracking-widest text-stone-300">Cancel Edit</button>
                        )}
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

          {activeTab === 'products' && (
            <div className="grid lg:grid-cols-12 gap-16">
              <div className="lg:col-span-5 bg-white p-12 border border-stone-100 shadow-xl rounded-[3rem] h-fit sticky top-44 overflow-y-auto no-scrollbar max-h-[75vh]">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Brand Identity</label>
                    <select value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="w-full px-6 py-4.5 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none">
                      {LUXURY_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Product Designation</label>
                    <input type="text" placeholder="DESIGNATION" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4.5 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Market Price (NGN)</label>
                      <input type="text" placeholder="190000" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} className="w-full px-6 py-4.5 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1">Studio Stock</label>
                      <input type="number" placeholder="20" min="0" value={formData.stock} onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})} className="w-full px-6 py-4.5 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1 flex items-center">
                      Internal Tags <Info size={10} className="ml-1 opacity-50" />
                    </label>
                    <input 
                      type="text" placeholder="e.g. men, t-shirts, new" value={tagInput} onChange={(e) => setTagInput(e.target.value)} 
                      className="w-full px-6 py-4.5 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold tracking-widest focus:outline-none" 
                    />
                    <p className="text-[8px] text-stone-400 uppercase tracking-widest mt-1">
                      Use comma-separated tags to align with footer category links.
                    </p>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-stone-50">
                    <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest ml-1 flex items-center">
                      <ImageIcon size={14} className="mr-2 text-[#C5A059]" /> Asset Gallery
                    </label>
                    <div className="flex gap-4">
                      <input type="text" placeholder="IMAGE URL..." value={imageInput} onChange={(e) => setImageInput(e.target.value)} className="flex-1 px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl text-[10px] font-bold focus:outline-none" />
                      <button type="button" onClick={addImage} className="bg-stone-900 text-white px-6 rounded-2xl"><Plus size={18} /></button>
                    </div>
                  </div>
                  <div className="pt-10">
                     <button type="submit" className="w-full bg-[#1c1917] text-white py-8 rounded-[1.5rem] text-sm font-bold tracking-[0.3em] uppercase shadow-2xl hover:scale-105 transition-all">
                        {editingId ? "Update Portfolio" : "Deploy Drop"}
                     </button>
                  </div>
                </form>
              </div>
              <div className="lg:col-span-7 space-y-8">
                 {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                   <div key={p.id} className="bg-white p-8 border border-stone-100 rounded-[2.5rem] flex items-center justify-between group hover:shadow-xl transition-all">
                      <div className="flex items-center space-x-8">
                         <div className="w-24 h-28 bg-stone-50 rounded-[1.5rem] border border-stone-100 p-4 flex items-center justify-center">
                            <img src={p.images[0]} className="max-h-full max-w-full object-contain" />
                         </div>
                         <div>
                            <h3 className="text-xl font-bold text-stone-900 tracking-tight leading-tight">{p.name}</h3>
                            <div className="flex items-center space-x-3 mt-2">
                               <span className="text-[9px] font-black gold-text uppercase tracking-widest">{p.brand}</span>
                               <span className="text-stone-200">•</span>
                               <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">N{p.price.toLocaleString()}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex space-x-2">
                         <button onClick={() => startEdit(p)} className="p-4 text-stone-300 hover:text-stone-900"><Edit3 size={20} /></button>
                         <button onClick={() => { if(confirm('Delete?')) setProducts(prev => prev.filter(pr => pr.id !== p.id)) }} className="p-4 text-stone-300 hover:text-red-500"><Trash2 size={20} /></button>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

const StatMetric = ({ icon: Icon, label, value, trend, positive }: { icon: any, label: string, value: string, trend?: string, positive?: boolean }) => (
  <div className="bg-stone-50/50 border border-stone-100 p-8 rounded-[2.5rem] shadow-sm transition-all hover:translate-y-[-4px] hover:shadow-md">
    <div className="flex justify-between items-start mb-6">
       <div className="p-4 bg-white rounded-2xl text-stone-900 shadow-sm"><Icon size={20} /></div>
       {trend && <div className={`text-[9px] font-black uppercase tracking-widest ${positive ? 'text-green-600' : 'text-red-500'}`}>{trend}</div>}
    </div>
    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.3em] mb-2">{label}</p>
    <h4 className="text-2xl font-black text-stone-900 tracking-tight">{value}</h4>
  </div>
);

const TrendChart = ({ labels, data }: { labels: string[], data: number[] }) => {
  const max = Math.max(...data, 1);
  const padding = 50;
  const width = 600;
  const height = 300;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const points = data.map((d, i) => ({
    x: padding + (i / (data.length - 1)) * usableWidth,
    y: padding + usableHeight - (d / max) * usableHeight
  }));
  let d = `M${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cp1x = curr.x + (next.x - curr.x) / 2;
    const cp1y = curr.y;
    const cp2x = curr.x + (next.x - curr.x) / 2;
    const cp2y = next.y;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }
  return (
    <svg viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#BF953F" />
          <stop offset="50%" stopColor="#FCF6BA" />
          <stop offset="100%" stopColor="#AA771C" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="white" strokeWidth="1" opacity="0.15"/>
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="white" strokeWidth="1" opacity="0.15"/>
      <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut" }} d={d} stroke="url(#goldGradient)" strokeWidth="5" fill="none" filter="url(#glow)" strokeLinecap="round" />
      {points.map((p, i) => (
        <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.15 }}>
          {i === points.length - 1 ? (
            <><circle cx={p.x} cy={p.y} r="8" fill="#D4AF37" stroke="white" strokeWidth="2" /><circle cx={p.x} cy={p.y} r="12" stroke="#D4AF37" strokeWidth="1" opacity="0.3"><animate attributeName="r" values="8;16;8" dur="3s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" /></circle></>
          ) : (<circle cx={p.x} cy={p.y} r="4" fill="white" />)}
        </motion.g>
      ))}
      <foreignObject x="0" y={height - padding + 15} width={width} height="30">
        <div className="flex justify-between w-full px-[50px]">
          {labels.map((l, i) => (<span key={i} className="text-[10px] font-black text-stone-500 uppercase tracking-widest">{l}</span>))}
        </div>
      </foreignObject>
    </svg>
  );
};

export default Admin;
