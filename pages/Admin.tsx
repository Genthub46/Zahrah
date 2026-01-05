
import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { 
  Package, ShoppingCart, Plus, LogOut, Trash2, ArrowUpDown, 
  Search, BarChart3, Edit3, X, ShieldCheck, BellRing, 
  Loader2, Lock, Eye, Calendar, User, Phone, Mail, Tag, DollarSign,
  CheckCircle2, ChevronRight, Layers, Database, Send, Sparkles, PenTool, Clock,
  ExternalLink, UserPlus, Inbox, History, MessageSquare, ClipboardList
} from 'lucide-react';
import { Product, Order, ViewLog, RestockRequest } from '../types';
import Logo from '../components/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";

interface AdminProps {
  products: Product[];
  orders: Order[];
  viewLogs: ViewLog[];
  restockRequests: RestockRequest[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setRestockRequests: React.Dispatch<React.SetStateAction<RestockRequest[]>>;
}

interface SentEmail {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  date: string;
  method: 'Internal' | 'Gmail' | 'Native';
}

const ADMIN_SESSION_KEY = 'ZARHRAH_ADMIN_SESSION';
const EMAILS_STORAGE_KEY = 'ZARHRAH_SENT_EMAILS';
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
const LUXURY_BRANDS = ['ASHLUXE', 'ZARA UK', 'GUCCI', 'CUSTOM'];

const Admin: React.FC<AdminProps> = ({ 
  products = [], 
  orders = [], 
  viewLogs = [], 
  restockRequests = [], 
  setProducts, 
  setOrders, 
  setRestockRequests 
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'products' | 'inventory' | 'orders' | 'analytics' | 'requests' | 'correspondence'>('products');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customBrand, setCustomBrand] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<any>(null);
  
  // Correspondence State
  const [emailView, setEmailView] = useState<'compose' | 'history'>('compose');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [receivedContext, setReceivedContext] = useState(''); // New: To paste received mails for AI to analyze
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentHistory, setSentHistory] = useState<SentEmail[]>([]);
  const [emailSuccess, setEmailSuccess] = useState(false);

  const [priceInput, setPriceInput] = useState<string>('');
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

  const [tagInput, setTagInput] = useState('');
  const [sizeInput, setSizeInput] = useState('');

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (isLoggedIn) {
      timeoutRef.current = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [isLoggedIn, handleLogout]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handler = () => resetInactivityTimer();
    events.forEach(event => document.addEventListener(event, handler));
    resetInactivityTimer();
    return () => {
      events.forEach(event => document.removeEventListener(event, handler));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetInactivityTimer]);

  useEffect(() => {
    const savedSession = localStorage.getItem(ADMIN_SESSION_KEY);
    if (savedSession) {
      const { expiry } = JSON.parse(savedSession);
      if (Date.now() < expiry) setIsLoggedIn(true);
      else localStorage.removeItem(ADMIN_SESSION_KEY);
    }
    const savedEmails = localStorage.getItem(EMAILS_STORAGE_KEY);
    if (savedEmails) setSentHistory(JSON.parse(savedEmails));
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

  // AI Email Logic
  const generateEmailWithAi = async () => {
    if (!aiPrompt && !receivedContext) return;
    setIsAiLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const contextPrompt = receivedContext 
      ? `Analysis of received email from client: "${receivedContext}". Respond to this email. `
      : "";

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Draft a luxury brand email for Zarhrah Luxury. ${contextPrompt} Instruction: ${aiPrompt}. Tone: Elegant, professional, high-end. Provide response as JSON with "subject" and "body".`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              body: { type: Type.STRING }
            },
            required: ["subject", "body"]
          }
        }
      });
      
      const result = JSON.parse(response.text || '{}');
      setSubject(result.subject || '');
      setBody(result.body || '');
      setAiPrompt('');
      setReceivedContext('');
    } catch (error) {
      console.error("AI Email Error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const openGmailThread = (email: string) => {
    if (!email) return;
    // This deep links to the Gmail search for this specific user in your business account
    const searchUrl = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(email)}`;
    window.open(searchUrl, '_blank');
  };

  const handleSendEmail = (method: 'Internal' | 'Gmail' | 'Native') => {
    if (!recipient || !subject || !body) return;
    
    // Log the email regardless of method
    const newEmail: SentEmail = {
      id: `EMAIL-${Date.now()}`,
      recipient,
      subject,
      body,
      date: new Date().toISOString(),
      method
    };
    
    const updatedHistory = [newEmail, ...sentHistory];
    setSentHistory(updatedHistory);
    localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(updatedHistory));

    if (method === 'Gmail') {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipient)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(gmailUrl, '_blank');
    } else if (method === 'Native') {
      const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
    }

    setEmailSuccess(true);
    setTimeout(() => {
      setEmailSuccess(false);
      setRecipient('');
      setSubject('');
      setBody('');
    }, 3000);
  };

  // Helper to start a draft from a waitlist request
  const startWaitlistDraft = (reqEmail: string) => {
    setRecipient(reqEmail);
    setSubject('ZARHRAH LUXURY: Your Stock Request Update');
    setActiveTab('correspondence');
    setEmailView('compose');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Automatically open the Gmail history so admin can see context
    setTimeout(() => {
       if (window.confirm(`Synchronize Gmail history for ${reqEmail}?`)) {
          openGmailThread(reqEmail);
       }
    }, 500);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      for (const file of Array.from(e.target.files)) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setFormData(prev => ({ ...prev, images: [...(prev.images || []), ev.target?.result as string] }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = parseFloat(priceInput);
    if (!formData.name || isNaN(numericPrice) || !formData.images?.length) {
      alert("Please provide the Product Name, Price, and Asset Images.");
      return;
    }
    const finalProduct = {
      ...formData,
      price: numericPrice,
      id: editingId || `p-${Date.now()}`,
      brand: formData.brand === 'CUSTOM' ? customBrand.toUpperCase() : formData.brand,
      tags: tagInput.split(',').map(t => t.trim()).filter(t => t),
      sizes: sizeInput.split(',').map(s => s.trim()).filter(s => s),
    } as Product;

    if (editingId) setProducts(prev => prev.map(p => p.id === editingId ? finalProduct : p));
    else setProducts(prev => [...prev, finalProduct]);
    alert('Boutique catalog updated successfully.');
    cancelEdit();
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData(product);
    setPriceInput(product.price.toString());
    setTagInput(product.tags.join(', '));
    setSizeInput(product.sizes?.join(', ') || '');
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setPriceInput('');
    setFormData({ name: '', brand: 'ASHLUXE', price: 0, images: [], description: '', category: 'Apparel', stock: 0, tags: [], colors: [], sizes: [], features: [], composition: [], specifications: [] });
    setTagInput(''); setSizeInput(''); setCustomBrand('');
  };

  const analyticsData = useMemo(() => {
    const counts: Record<string, number> = {};
    viewLogs.forEach(log => { counts[log.productId] = (counts[log.productId] || 0) + 1; });
    return products.map(p => ({ ...p, views: counts[p.id] || 0 })).sort((a, b) => b.views - a.views);
  }, [products, viewLogs]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center p-6 pt-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
          <div className="bg-[#141211] p-12 border border-stone-800 shadow-2xl rounded-sm flex flex-col items-center">
            <Logo size={120} className="mb-12" />
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold tracking-[0.2em] text-white uppercase serif italic mb-2">Private Sourcing</h2>
              <p className="text-stone-500 text-[9px] font-bold tracking-[0.3em] uppercase">Administrative Access Only</p>
            </div>
            <form onSubmit={handleLogin} className="w-full space-y-6">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-700" size={16} />
                <input 
                  type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="ENTER PASSCODE"
                  className="w-full pl-12 pr-6 py-4 bg-stone-900 border border-stone-800 focus:border-[#C5A059] focus:outline-none text-white text-[10px] font-bold tracking-[0.4em]"
                />
              </div>
              <button disabled={isLoggingIn || !passcode} className="w-full bg-[#C5A059] text-white py-4 text-[10px] font-bold tracking-[0.4em] uppercase shadow-xl hover:bg-[#B38E46] transition-all">
                {isLoggingIn ? <Loader2 className="animate-spin" size={16} /> : "Authenticate"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-80 bg-white border-r border-stone-200 fixed h-full flex-col z-50 pt-32">
        <div className="p-10 flex-1">
          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.4em] mb-10 px-4">Management</p>
          <nav className="space-y-4">
            {[
              { id: 'products', label: 'Drop Catalog', icon: Package },
              { id: 'inventory', label: 'Stock Levels', icon: Layers },
              { id: 'orders', label: 'Sales Ledger', icon: ShoppingCart },
              { id: 'requests', label: 'Waitlist Inbox', icon: BellRing },
              { id: 'analytics', label: 'Growth Metrics', icon: BarChart3 },
              { id: 'correspondence', label: 'Correspondence', icon: Mail }
            ].map((tab) => (
              <button 
                key={tab.id} onClick={() => { setActiveTab(tab.id as any); resetInactivityTimer(); }}
                className={`flex items-center space-x-4 w-full p-4 rounded-2xl text-[10px] font-bold tracking-widest uppercase transition-all ${activeTab === tab.id ? 'bg-stone-900 text-white shadow-xl translate-x-2' : 'text-stone-400 hover:bg-stone-50 hover:text-stone-900'}`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-12 px-4">
             <a href="https://mail.google.com" target="_blank" rel="noreferrer" className="flex items-center space-x-4 w-full p-4 rounded-2xl bg-[#EA4335]/10 text-[#EA4335] text-[9px] font-bold tracking-widest uppercase hover:bg-[#EA4335]/20 transition-all">
                <Mail size={16} />
                <span>Business Gmail Inbox</span>
             </a>
          </div>
        </div>
        <div className="p-10 border-t border-stone-100 bg-stone-50/50">
          <button onClick={handleLogout} className="flex items-center space-x-4 text-[10px] font-bold tracking-widest uppercase text-red-500 hover:text-red-700 w-full transition-colors">
            <LogOut size={16} />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Mobile Segments */}
      <div className="lg:hidden sticky top-[64px] z-[9000] bg-white border-b border-stone-200 p-3 overflow-x-auto no-scrollbar shadow-sm">
        <div className="flex bg-stone-100 p-1 rounded-2xl min-w-max">
          {[
            { id: 'products', label: 'Catalog' },
            { id: 'inventory', label: 'Stock' },
            { id: 'orders', label: 'Sales' },
            { id: 'requests', label: 'Waitlist' },
            { id: 'analytics', label: 'Metrics' },
            { id: 'correspondence', label: 'Emails' }
          ].map((tab) => (
            <button 
              key={tab.id} onClick={() => { setActiveTab(tab.id as any); resetInactivityTimer(); }}
              className={`px-6 py-3 rounded-xl text-[9px] font-bold tracking-[0.1em] uppercase transition-all ${activeTab === tab.id ? 'bg-white text-stone-900 shadow-sm font-black' : 'text-stone-400'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 lg:ml-80 p-6 lg:p-16 pt-32 lg:pt-40">
        <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-stone-200 pb-12">
           <div>
              <h1 className="text-5xl font-bold serif italic capitalize text-stone-900 tracking-tight">{activeTab}</h1>
              <div className="flex items-center mt-3 space-x-3">
                <span className="w-8 h-[2px] bg-[#C5A059]" />
                <p className="text-[10px] text-stone-400 uppercase tracking-[0.5em] font-bold">Zarhrah Executive Suite</p>
              </div>
           </div>
           {activeTab !== 'correspondence' && (
             <div className="relative w-full md:w-96">
                <input type="text" placeholder="QUERY COLLECTION..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4.5 bg-white border border-stone-200 rounded-2xl text-[10px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:ring-1 focus:ring-[#C5A059] shadow-sm" />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
             </div>
           )}
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'correspondence' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
               {/* Internal Correspondence Nav */}
               <div className="flex space-x-4 mb-8">
                  <button 
                    onClick={() => setEmailView('compose')}
                    className={`px-8 py-3 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all ${emailView === 'compose' ? 'bg-stone-900 text-white shadow-xl' : 'bg-white border border-stone-200 text-stone-400'}`}
                  >
                    Compose Drafting
                  </button>
                  <button 
                    onClick={() => setEmailView('history')}
                    className={`px-8 py-3 text-[10px] font-bold uppercase tracking-widest rounded-full transition-all ${emailView === 'history' ? 'bg-stone-900 text-white shadow-xl' : 'bg-white border border-stone-200 text-stone-400'}`}
                  >
                    Sent History Ledger
                  </button>
               </div>

               {emailView === 'compose' ? (
                 <div className="grid lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 bg-white p-12 rounded-[2.5rem] border border-stone-200 shadow-sm relative overflow-hidden">
                       <AnimatePresence>
                         {emailSuccess && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-stone-900/10 backdrop-blur-md flex flex-col items-center justify-center text-center p-12">
                               <CheckCircle2 size={64} className="text-[#C5A059] mb-4" />
                               <h3 className="text-2xl font-bold serif text-stone-900">Boutique Draft Dispatched</h3>
                               <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-2">Opened in external mail client</p>
                            </motion.div>
                         )}
                       </AnimatePresence>

                       <div className="space-y-8">
                          <div className="flex flex-col md:flex-row gap-8">
                             <div className="flex-1 space-y-2">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex justify-between">
                                  <span>Client Recipient</span>
                                  {recipient && (
                                    <button onClick={() => openGmailThread(recipient)} className="flex items-center text-[#EA4335] hover:underline transition-all">
                                      <History size={12} className="mr-1" />
                                      Sync History
                                    </button>
                                  )}
                                </label>
                                <input type="email" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="CLIENT@LUXURY.COM" className="w-full bg-stone-50 border border-stone-100 p-4 rounded-xl text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-[#C5A059]" />
                             </div>
                             <div className="md:w-64 space-y-2">
                                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Waitlist Pick</label>
                                <select 
                                  className="w-full bg-stone-50 border border-stone-100 p-4 rounded-xl text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-[#C5A059]"
                                  onChange={(e) => setRecipient(e.target.value)}
                                  value={recipient}
                                >
                                  <option value="">MANUAL ENTRY</option>
                                  {restockRequests.map(r => (
                                    <option key={r.id} value={r.customerEmail}>{r.customerEmail.split('@')[0].toUpperCase()}</option>
                                  ))}
                                </select>
                             </div>
                          </div>

                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Subject Protocol</label>
                             <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="ZARHRAH BOUTIQUE: COLLECTION PREVIEW" className="w-full bg-stone-50 border border-stone-100 p-4 rounded-xl text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-[#C5A059]" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Body Narrative</label>
                             <textarea rows={10} value={body} onChange={(e) => setBody(e.target.value)} placeholder="EDITORIAL CORRESPONDENCE..." className="w-full bg-stone-50 border border-stone-100 p-6 rounded-xl text-[11px] leading-relaxed italic text-stone-600 focus:outline-none focus:border-[#C5A059] resize-none" />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button 
                              onClick={() => handleSendEmail('Gmail')} 
                              disabled={!recipient || !subject || !body} 
                              className="bg-[#141211] text-white py-6 text-[11px] font-bold uppercase tracking-[0.4em] rounded-2xl shadow-xl flex items-center justify-center space-x-4 hover:bg-stone-800 transition-all disabled:opacity-30"
                            >
                               <Mail size={16} className="text-[#C5A059]" />
                               <span>Open in Gmail App</span>
                            </button>
                            <button 
                              onClick={() => handleSendEmail('Native')} 
                              disabled={!recipient || !subject || !body} 
                              className="bg-white border border-stone-200 text-stone-900 py-6 text-[11px] font-bold uppercase tracking-[0.4em] rounded-2xl shadow-xl flex items-center justify-center space-x-4 hover:bg-stone-50 transition-all disabled:opacity-30"
                            >
                               <ExternalLink size={16} className="text-[#C5A059]" />
                               <span>Default Mail Client</span>
                            </button>
                          </div>
                       </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                       <div className="bg-[#141211] p-10 rounded-[2.5rem] border border-stone-800 border-l-4 border-l-[#C5A059] shadow-2xl">
                          <div className="flex items-center space-x-3 mb-6">
                             <Sparkles className="text-[#C5A059]" size={20} />
                             <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.4em]">Drafting Assistant</h3>
                          </div>

                          <div className="mb-6">
                             <label className="text-[9px] font-black text-stone-600 uppercase tracking-widest mb-2 block">Analyze Received Email (Optional)</label>
                             <textarea value={receivedContext} onChange={(e) => setReceivedContext(e.target.value)} placeholder="PASTE RECEIVED CLIENT EMAIL HERE..." className="w-full bg-stone-900/50 border border-stone-800 p-4 rounded-xl text-[9px] font-bold tracking-widest text-stone-400 focus:outline-none focus:border-[#C5A059] resize-none h-24 mb-2" />
                             <p className="text-[8px] text-stone-700 italic">AI will analyze context to draft an appropriate response.</p>
                          </div>

                          <div className="mb-6">
                             <label className="text-[9px] font-black text-stone-600 uppercase tracking-widest mb-2 block">Response Intent</label>
                             <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="RESPONSE GOAL (e.g. Confirm stock availability)..." className="w-full bg-stone-900/50 border border-stone-800 p-5 rounded-2xl text-[10px] font-bold tracking-widest text-stone-300 focus:outline-none focus:border-[#C5A059] resize-none h-32 mb-6" />
                          </div>

                          <button onClick={generateEmailWithAi} disabled={isAiLoading || (!aiPrompt && !receivedContext)} className="w-full bg-[#C5A059] text-white py-5 text-[10px] font-bold uppercase tracking-[0.4em] rounded-2xl shadow-xl flex items-center justify-center space-x-3 hover:bg-[#B38E46] transition-all disabled:opacity-50">
                             {isAiLoading ? <Loader2 className="animate-spin" size={14} /> : <PenTool size={14} />}
                             <span>Generate Boutique Draft</span>
                          </button>
                       </div>

                       <div className="bg-white p-10 rounded-[2.5rem] border border-stone-200">
                          <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em] mb-6">Waitlist Directory</h4>
                          <div className="space-y-3 max-h-80 overflow-y-auto no-scrollbar pr-2">
                             {restockRequests.length === 0 ? (
                               <p className="text-[9px] text-stone-300 uppercase italic">Directory Pristine</p>
                             ) : (
                               restockRequests.map(r => (
                                 <button 
                                  key={r.id} 
                                  onClick={() => setRecipient(r.customerEmail)}
                                  className={`w-full text-left p-4 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all flex items-center justify-between group ${recipient === r.customerEmail ? 'bg-stone-900 text-white' : 'bg-stone-50 border border-stone-100 text-stone-500 hover:border-[#C5A059] hover:text-stone-900'}`}
                                 >
                                   <div className="flex items-center space-x-3">
                                      <User size={12} className={recipient === r.customerEmail ? 'text-[#C5A059]' : ''} />
                                      <span className="truncate max-w-[120px]">{r.customerEmail}</span>
                                   </div>
                                   <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                 </button>
                               ))
                             )}
                          </div>
                       </div>
                    </div>
                 </div>
               ) : (
                 <div className="bg-white border border-stone-200 rounded-[3rem] overflow-hidden shadow-sm">
                    <div className="p-10 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                       <h4 className="text-[12px] font-bold uppercase tracking-[0.5em] text-stone-900">Communication Ledger</h4>
                       <span className="text-[11px] font-black bg-stone-900 text-white px-5 py-2 rounded-full shadow-lg">{sentHistory.length} Recorded</span>
                    </div>
                    <div className="divide-y divide-stone-100">
                       {sentHistory.length === 0 ? (
                         <div className="p-32 text-center text-stone-300 italic serif text-xl">No historical correspondence found.</div>
                       ) : (
                         sentHistory.map(email => (
                           <div key={email.id} className="p-10 hover:bg-stone-50 transition-colors group">
                              <div className="flex justify-between items-start mb-4">
                                 <div>
                                    <div className="flex items-center space-x-3 mb-1">
                                       <button onClick={() => openGmailThread(email.recipient)} className="text-[10px] font-black gold-text uppercase tracking-widest hover:underline flex items-center">
                                          {email.recipient}
                                          <ExternalLink size={10} className="ml-2" />
                                       </button>
                                       <span className="text-[8px] font-bold px-2 py-0.5 bg-stone-100 text-stone-400 rounded uppercase tracking-tighter">{email.method}</span>
                                    </div>
                                    <h5 className="text-xl font-bold text-stone-900 tracking-tight">{email.subject}</h5>
                                 </div>
                                 <div className="flex items-center space-x-4">
                                    <span className="text-[9px] text-stone-300 uppercase font-bold tracking-[0.2em]">{new Date(email.date).toLocaleDateString()}</span>
                                    <button onClick={() => {
                                      const updated = sentHistory.filter(e => e.id !== email.id);
                                      setSentHistory(updated);
                                      localStorage.setItem(EMAILS_STORAGE_KEY, JSON.stringify(updated));
                                    }} className="p-2 text-stone-200 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                 </div>
                              </div>
                              <p className="text-[11px] text-stone-400 italic leading-relaxed line-clamp-2 max-w-4xl">"{email.body}"</p>
                              <div className="flex space-x-6">
                                <button onClick={() => { setRecipient(email.recipient); setSubject(`Follow-up: ${email.subject}`); setBody(email.body); setEmailView('compose'); }} className="mt-4 text-[9px] font-bold uppercase gold-text opacity-0 group-hover:opacity-100 transition-opacity">Reuse Template</button>
                                <button onClick={() => { setRecipient(email.recipient); setSubject(email.subject); setBody(email.body); handleSendEmail('Gmail'); }} className="mt-4 text-[9px] font-bold uppercase text-stone-900 opacity-0 group-hover:opacity-100 transition-opacity flex items-center"><ExternalLink size={10} className="mr-1" /> Re-send via Gmail</button>
                              </div>
                           </div>
                         ))
                       )}
                    </div>
                 </div>
               )}
            </motion.div>
          )}

          {activeTab === 'requests' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              {restockRequests.length === 0 ? (
                <div className="bg-white p-32 text-center border border-dashed border-stone-200 rounded-[3rem]">
                  <BellRing size={56} className="mx-auto text-stone-100 mb-8" />
                  <p className="text-stone-400 italic serif text-2xl font-light">The boutique waitlist is currently pristine.</p>
                </div>
              ) : (
                <div className="bg-white border border-stone-200 rounded-[3rem] overflow-hidden shadow-sm">
                   <div className="p-10 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
                      <div>
                        <h4 className="text-[12px] font-bold uppercase tracking-[0.5em] text-stone-900">Waitlist Intelligence</h4>
                        <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-1.5">Priority Notifications</p>
                      </div>
                      <span className="text-[11px] font-black bg-stone-900 text-white px-5 py-2 rounded-full shadow-lg">{restockRequests.length} Active</span>
                   </div>
                   <div className="divide-y divide-stone-100">
                      {restockRequests.map(req => {
                        const product = products.find(p => p.id === req.productId);
                        return (
                          <div key={req.id} className="p-10 flex flex-col md:flex-row md:items-center justify-between gap-10 hover:bg-stone-50/50 transition-all group">
                             <div className="flex items-center space-x-8">
                                <div className="w-20 h-20 bg-white border border-stone-100 rounded-3xl flex items-center justify-center text-[#C5A059] shadow-md group-hover:scale-110 transition-transform"><Mail size={32} /></div>
                                <div>
                                   <div className="flex items-center space-x-4">
                                      <p className="text-base font-bold text-stone-900 tracking-tight">{req.customerEmail}</p>
                                      <button onClick={() => openGmailThread(req.customerEmail)} className="text-[#EA4335] p-2 hover:bg-[#EA4335]/10 rounded-full transition-all" title="Sync Gmail History">
                                        <History size={16} />
                                      </button>
                                   </div>
                                   <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.3em] mt-2 flex items-center"><Calendar size={12} className="mr-3 text-[#C5A059]" /> Captured {new Date(req.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</p>
                                </div>
                             </div>
                             <div className="flex items-center space-x-8 px-8 py-5 bg-white border border-stone-200 rounded-3xl shadow-lg border-l-4 border-l-[#C5A059]">
                                <img src={product?.images[0]} className="w-12 h-16 object-contain" alt="" />
                                <div className="text-left">
                                   <span className="text-sm font-bold tracking-tight text-stone-900 block">{product?.name || "Unlisted Artifact"}</span>
                                   <span className="text-[9px] gold-text font-black uppercase tracking-[0.3em] mt-1 block">{product?.brand} Portfolio</span>
                                </div>
                             </div>
                             <div className="flex space-x-3">
                                <button onClick={() => startWaitlistDraft(req.customerEmail)} className="p-5 text-stone-900 hover:bg-[#C5A059] hover:text-white bg-white border border-stone-100 rounded-full transition-all shadow-sm flex items-center group-hover:shadow-xl">
                                  <PenTool size={20} className="mr-2" />
                                  <span className="text-[9px] font-bold uppercase tracking-widest hidden lg:block">Draft & Sync History</span>
                                </button>
                                <button onClick={() => setRestockRequests(prev => prev.filter(r => r.id !== req.id))} className="p-5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all shadow-sm"><Trash2 size={20} /></button>
                             </div>
                          </div>
                        );
                      })}
                   </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
               <div className="grid md:grid-cols-3 gap-10">
                  <div className="bg-[#141211] text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-48 h-48 bg-[#C5A059]/15 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" />
                     <div className="flex items-center justify-between mb-10 relative z-10">
                        <Eye className="text-[#C5A059]" size={40} />
                        <span className="text-[11px] font-black uppercase tracking-[0.5em] opacity-40">Engagement</span>
                     </div>
                     <h3 className="text-7xl font-black tracking-tighter relative z-10 mb-2">{viewLogs.length}</h3>
                     <p className="text-[11px] uppercase tracking-[0.4em] text-[#C5A059] font-black relative z-10">Unique Boutique views</p>
                  </div>
                  <div className="bg-white border border-stone-200 p-12 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-700">
                     <div className="flex items-center justify-between mb-10">
                        <ShoppingCart className="text-stone-900" size={40} />
                        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-stone-400">Yield</span>
                     </div>
                     <h3 className="text-7xl font-black tracking-tighter text-stone-900 mb-2">{orders.length}</h3>
                     <p className="text-[11px] uppercase tracking-[0.4em] text-stone-400 font-bold">Successful Sourcing</p>
                  </div>
                  <div className="bg-white border border-stone-200 p-12 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-700">
                     <div className="flex items-center justify-between mb-10">
                        <Package className="text-[#C5A059]" size={40} />
                        <span className="text-[11px] font-black uppercase tracking-[0.5em] text-stone-400">Portfolio</span>
                     </div>
                     <h3 className="text-7xl font-black tracking-tighter text-stone-900 mb-2">{products.length}</h3>
                     <p className="text-[11px] uppercase tracking-[0.4em] text-stone-400 font-bold">Active Collection drops</p>
                  </div>
               </div>

               <div className="bg-white border border-stone-200 rounded-[3rem] overflow-hidden shadow-sm">
                  <div className="p-10 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                     <div className="flex items-center space-x-5">
                        <div className="p-3 bg-[#C5A059] text-white rounded-2xl shadow-lg shadow-[#C5A059]/30">
                          <BarChart3 size={24} />
                        </div>
                        <h4 className="text-[12px] font-bold uppercase tracking-[0.5em] text-stone-900">Sourcing Intelligence Report</h4>
                     </div>
                     <span className="text-[10px] text-stone-400 uppercase font-black tracking-[0.4em]">Sorted by Impact</span>
                  </div>
                  <div className="divide-y divide-stone-100">
                     {analyticsData.map((p, idx) => (
                        <div key={p.id} className="p-10 flex items-center justify-between hover:bg-stone-50/50 transition-all group">
                           <div className="flex items-center space-x-12">
                              <span className="text-3xl font-black text-stone-100 group-hover:text-[#C5A059]/20 transition-colors serif italic">{idx + 1}</span>
                              <div className="w-20 h-24 bg-white border border-stone-100 p-3 rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                                 <img src={p.images[0]} className="max-h-full max-w-full object-contain" alt="" />
                              </div>
                              <div>
                                 <h5 className="text-xl font-bold text-stone-900 tracking-tight">{p.name}</h5>
                                 <div className="flex items-center space-x-4 mt-3">
                                    <span className="text-[10px] font-black gold-text uppercase tracking-[0.3em]">{p.brand}</span>
                                    <span className="w-1 h-1 bg-stone-300 rounded-full" />
                                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{p.category}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-5xl font-black text-stone-900 tracking-tighter">{p.views}</p>
                              <p className="text-[10px] font-black text-[#C5A059] uppercase tracking-[0.4em] mt-2">Executive Views</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-2 gap-16">
              <div className="bg-white p-12 border border-stone-200 shadow-sm rounded-[2.5rem] space-y-10 h-fit sticky top-40">
                <div className="flex justify-between items-center border-b border-stone-100 pb-8">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-stone-900 rounded-xl text-white">
                      {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
                    </div>
                    <div>
                      <h3 className="text-[12px] font-bold uppercase tracking-[0.3em] text-stone-900">
                        {editingId ? 'Modify Selection' : 'Create New Drop'}
                      </h3>
                      <p className="text-[9px] text-stone-400 uppercase tracking-widest mt-1">Catalog Entry Protocol</p>
                    </div>
                  </div>
                  {editingId && <button onClick={cancelEdit} className="p-3 bg-stone-50 text-stone-400 hover:text-stone-900 rounded-full transition-colors"><X size={20} /></button>}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-stone-900 uppercase tracking-widest ml-1">Brand Identity</label>
                      <select value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="w-full p-4.5 bg-stone-50 border border-stone-100 text-[10px] font-bold tracking-widest rounded-2xl focus:outline-none focus:border-[#C5A059] appearance-none">
                        {LUXURY_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-stone-900 uppercase tracking-widest ml-1">Classification</label>
                      <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value as any})} className="w-full p-4.5 bg-stone-50 border border-stone-100 text-[10px] font-bold tracking-widest rounded-2xl focus:outline-none focus:border-[#C5A059] appearance-none">
                        {['Apparel', 'Footwear', 'Bags', 'Accessories', 'Watches', 'Perfumes'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-stone-900 uppercase tracking-widest ml-1">Product Designation</label>
                    <input type="text" placeholder="e.g. GUCCI GG SUPREME DUFFLE" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-4.5 bg-stone-50 border border-stone-100 text-[10px] font-bold tracking-widest rounded-2xl focus:outline-none focus:border-[#C5A059]" />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-stone-900 uppercase tracking-widest ml-1">Market Price (NGN)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                        <input 
                          type="text" 
                          placeholder="PRICE (NGN)" 
                          value={priceInput} 
                          onChange={(e) => setPriceInput(e.target.value)} 
                          className="w-full pl-10 pr-4 py-4.5 bg-stone-50 border border-stone-100 text-[11px] font-bold tracking-widest rounded-2xl focus:outline-none focus:border-[#C5A059]" 
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-stone-900 uppercase tracking-widest ml-1">Inventory Allocation</label>
                      <input type="number" placeholder="STOCK LEVEL" value={formData.stock || ''} onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})} className="w-full p-4.5 bg-stone-50 border border-stone-100 text-[11px] font-bold tracking-widest rounded-2xl focus:outline-none focus:border-[#C5A059]" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-stone-900 uppercase tracking-widest ml-1">Editorial Narrative</label>
                    <textarea placeholder="EDITORIAL DESCRIPTION..." rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-5 bg-stone-50 border border-stone-100 text-[11px] font-medium leading-relaxed rounded-2xl focus:outline-none focus:border-[#C5A059] resize-none" />
                  </div>
                  
                  <div className="pt-10 border-t border-stone-100 grid grid-cols-2 gap-6">
                    <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 py-8 text-[9px] font-bold uppercase tracking-[0.4em] text-stone-400 rounded-3xl hover:border-stone-900 hover:text-stone-900 transition-all bg-stone-50/50">
                      <Plus size={20} className="mb-2" />
                      Add Assets
                    </button>
                    <button type="submit" className="bg-stone-900 text-white py-8 text-[11px] font-bold uppercase tracking-[0.5em] rounded-3xl shadow-2xl hover:bg-stone-800 transition-all">
                      {editingId ? 'Save Edits' : 'Deploy Drop'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {formData.images?.map((img, i) => (
                      <div key={i} className="relative group w-20 h-24 rounded-xl overflow-hidden border border-stone-100 shadow-sm bg-stone-50">
                        <img src={img} className="w-full h-full object-cover" alt="" />
                        <button type="button" onClick={() => setFormData({...formData, images: formData.images?.filter((_, idx) => idx !== i)})} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} className="text-white" /></button>
                      </div>
                    ))}
                  </div>
                </form>
              </div>

              <div className="space-y-8">
                 <div className="flex items-center justify-between px-2">
                    <h3 className="text-[12px] font-bold uppercase tracking-[0.5em] text-stone-400">Live Collection</h3>
                    <span className="text-[10px] font-bold text-stone-300 uppercase">{products.length} Drops</span>
                 </div>
                 <div className="space-y-5 max-h-[1200px] overflow-y-auto pr-4 no-scrollbar">
                   {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                     <div key={p.id} className="bg-white p-6 border border-stone-200 flex items-center justify-between rounded-[2rem] group hover:border-[#C5A059] hover:shadow-2xl transition-all duration-500">
                        <div className="flex items-center space-x-8">
                          <div className="w-20 h-24 bg-stone-50 rounded-2xl overflow-hidden p-3 flex items-center justify-center border border-stone-100">
                            <img src={p.images[0]} className="max-h-full max-w-full object-contain" alt="" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-3 mb-1.5">
                              <span className="text-[9px] font-black gold-text uppercase tracking-[0.3em]">{p.brand}</span>
                              <span className="w-1 h-1 bg-stone-300 rounded-full" />
                              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{p.category}</span>
                            </div>
                            <p className="text-lg font-bold text-stone-900 tracking-tight">{p.name}</p>
                            <div className="flex items-center mt-2.5 space-x-4">
                              <span className="text-xs font-bold text-stone-900">₦{p.price.toLocaleString()}</span>
                              <span className={`px-3 py-1 text-[8px] font-bold rounded-full uppercase tracking-widest ${p.stock < 5 ? 'bg-red-50 text-red-500' : 'bg-stone-50 text-stone-400'}`}>
                                {p.stock} Units Sourced
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-2">
                          <button onClick={() => startEdit(p)} className="p-4 text-stone-300 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-all"><Edit3 size={20} /></button>
                          <button onClick={() => { if(window.confirm('Strike this drop from the catalog?')) setProducts(prev => prev.filter(pr => pr.id !== p.id)); }} className="p-4 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"><Trash2 size={20} /></button>
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               {/* Mobile View Card Grid */}
               <div className="lg:hidden grid gap-4">
                  {products.map(p => (
                    <div key={p.id} className="bg-white p-6 rounded-3xl border border-stone-200 flex flex-col space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex space-x-4">
                          <img src={p.images[0]} className="w-12 h-16 object-contain bg-stone-50 rounded-xl" alt="" />
                          <div>
                            <h4 className="font-bold text-stone-900 text-sm">{p.name}</h4>
                            <p className="text-[9px] text-stone-400 uppercase tracking-widest">{p.brand}</p>
                          </div>
                        </div>
                        <span className={`font-black text-lg ${p.stock < 5 ? 'text-red-500' : 'text-stone-900'}`}>{p.stock}</span>
                      </div>
                    </div>
                  ))}
               </div>

               {/* Desktop Table View */}
               <div className="hidden lg:block bg-white border border-stone-200 shadow-sm rounded-[3rem] overflow-hidden">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold uppercase text-stone-400 tracking-[0.4em]">
                       <th className="px-12 py-10">Sourced Artifact</th>
                       <th className="px-12 py-10">Brand Index</th>
                       <th className="px-12 py-10">Category</th>
                       <th className="px-12 py-10 text-right">Unit Reserve</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-stone-100">
                     {products.map(p => (
                       <tr key={p.id} className="text-[12px] hover:bg-stone-50/50 transition-colors group">
                         <td className="px-12 py-10 flex items-center space-x-8">
                           <div className="w-14 h-18 bg-stone-50 rounded-2xl p-2 flex items-center justify-center border border-stone-100 group-hover:scale-105 transition-transform">
                              <img src={p.images[0]} className="max-h-full max-w-full object-contain" alt="" />
                           </div>
                           <div>
                             <p className="font-bold text-stone-900 text-base tracking-tight">{p.name}</p>
                             <p className="text-stone-300 uppercase tracking-widest text-[9px] mt-1.5 font-bold">ZLH-{p.id.split('-')[1]}</p>
                           </div>
                         </td>
                         <td className="px-12 py-10">
                            <span className="text-[10px] font-black gold-text uppercase tracking-[0.3em] bg-stone-50 px-5 py-2.5 rounded-full border border-stone-100 shadow-sm">{p.brand}</span>
                         </td>
                         <td className="px-12 py-10 text-stone-500 font-medium uppercase tracking-widest">{p.category}</td>
                         <td className="px-12 py-10 text-right">
                           <div className="flex flex-col items-end">
                              <span className={`text-2xl font-black ${p.stock < 5 ? 'text-red-500' : 'text-stone-900'}`}>{p.stock}</span>
                              <span className="text-[9px] text-stone-300 font-bold uppercase tracking-[0.2em] mt-1">In Studio</span>
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              {orders.length === 0 ? (
                <div className="bg-white p-32 text-center border border-dashed border-stone-200 rounded-[3rem]">
                  <Database size={56} className="mx-auto text-stone-100 mb-8" />
                  <p className="text-stone-400 italic serif text-2xl font-light">No transaction records currently in the vault.</p>
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-10">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white border border-stone-200 p-12 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-700 group relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-48 h-48 bg-stone-50 rounded-full -mr-24 -mt-24 group-hover:scale-125 transition-transform duration-700 opacity-50" />
                       <div className="flex justify-between items-start mb-10 relative z-10">
                          <div>
                             <span className="text-[10px] font-black uppercase tracking-[0.4em] bg-stone-900 text-white px-5 py-2 rounded-full mb-4 block w-fit shadow-lg">{order.id}</span>
                             <h4 className="text-3xl font-bold text-stone-900 tracking-tighter">{order.customerName}</h4>
                          </div>
                          <div className="text-right">
                             <p className="text-3xl font-black gold-text">₦{order.total.toLocaleString()}</p>
                             <p className="text-[10px] text-stone-300 uppercase tracking-[0.4em] font-bold mt-2">Executive Total</p>
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-8 mb-10 text-[12px] relative z-10">
                          <div className="space-y-5">
                             <div className="flex items-center space-x-4 text-stone-500 font-bold"><Mail size={16} className="text-[#C5A059]" /> <span className="tracking-tight">{order.customerEmail}</span></div>
                             <div className="flex items-center space-x-4 text-stone-500 font-bold"><Phone size={16} className="text-[#C5A059]" /> <span className="tracking-tight">{order.customerPhone}</span></div>
                          </div>
                          <div className="space-y-5">
                             <div className="flex items-center space-x-4 text-stone-500 font-bold"><Calendar size={16} className="text-[#C5A059]" /> <span className="tracking-tight">{new Date(order.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                             <div className="flex items-center space-x-4 text-stone-500 font-bold"><CheckCircle2 size={16} className="text-[#C5A059]" /> <span className="tracking-tight">Authentic Check</span></div>
                          </div>
                       </div>
                       <div className="border-t border-stone-100 pt-10 relative z-10">
                          <div className="flex items-center justify-between mb-6">
                            <p className="text-[11px] font-bold uppercase tracking-[0.5em] text-stone-400">Acquisition List</p>
                            <span className="text-[10px] font-bold text-stone-300">{order.items.length} Unique Items</span>
                          </div>
                          <div className="space-y-4">
                             {order.items.map((item, idx) => (
                               <div key={idx} className="flex justify-between items-center bg-stone-50/50 p-5 rounded-3xl border border-stone-50 hover:bg-white hover:shadow-md transition-all">
                                  <div className="flex items-center space-x-5">
                                     <div className="w-10 h-10 flex items-center justify-center bg-white border border-stone-100 rounded-xl text-[11px] font-black text-stone-900 shadow-sm">{item.quantity}</div>
                                     <div className="text-left">
                                       <span className="text-stone-900 font-bold text-sm tracking-tight block">{item.name}</span>
                                       <span className="text-[9px] gold-text font-black uppercase tracking-widest">{item.brand}</span>
                                     </div>
                                  </div>
                                  <span className="text-stone-400 font-black text-xs">₦{(item.price * item.quantity).toLocaleString()}</span>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Admin;
