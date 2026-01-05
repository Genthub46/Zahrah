
import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Trash2, 
  CheckCircle, 
  Loader2,
  PenTool,
  Clock,
  ShieldCheck,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";

interface SentEmail {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  date: string;
}

const STORAGE_KEY = 'ZARHRAH_SENT_EMAILS';

const MailApp: React.FC = () => {
  const [view, setView] = useState<'compose' | 'history'>('compose');
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sentHistory, setSentHistory] = useState<SentEmail[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setSentHistory(JSON.parse(saved));
  }, []);

  const generateWithAi = async () => {
    if (!prompt) return;
    setIsAiLoading(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Draft a luxury brand email for Zarhrah Luxury (Premium Zara UK Shopper). Context: ${prompt}. The tone should be elegant, professional, and high-end. Provide the response as JSON with fields "subject" and "body".`,
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
      setPrompt('');
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSend = () => {
    if (!recipient || !subject || !body) return;
    setIsSending(true);
    
    setTimeout(() => {
      const newEmail: SentEmail = {
        id: Date.now().toString(),
        recipient,
        subject,
        body,
        date: new Date().toISOString()
      };
      
      const updatedHistory = [newEmail, ...sentHistory];
      setSentHistory(updatedHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      
      setIsSending(false);
      setShowSuccess(true);
      
      // Reset form
      setTimeout(() => {
        setShowSuccess(false);
        setRecipient('');
        setSubject('');
        setBody('');
      }, 3000);
    }, 2000);
  };

  const deleteHistory = (id: string) => {
    const updated = sentHistory.filter(e => e.id !== id);
    setSentHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0c0a09]">
      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-[#141211] border-r border-stone-800 p-8 flex flex-col min-h-screen">
        <div className="mb-12">
          <h1 className="text-2xl font-bold tracking-[0.3em] gold-text serif uppercase">Zarhrah</h1>
          <p className="text-[9px] tracking-[0.4em] opacity-40 uppercase mt-2">Client Portal</p>
        </div>

        <nav className="flex-1 space-y-4">
          <button 
            onClick={() => setView('compose')}
            className={`w-full flex items-center space-x-4 px-6 py-4 text-[10px] font-bold tracking-widest uppercase transition-all rounded-sm ${view === 'compose' ? 'bg-[#C5A059] text-white shadow-xl' : 'text-stone-500 hover:text-stone-200 hover:bg-stone-900'}`}
          >
            <PenTool size={16} />
            <span>Compose</span>
          </button>
          <button 
            onClick={() => setView('history')}
            className={`w-full flex items-center space-x-4 px-6 py-4 text-[10px] font-bold tracking-widest uppercase transition-all rounded-sm ${view === 'history' ? 'bg-[#C5A059] text-white shadow-xl' : 'text-stone-500 hover:text-stone-200 hover:bg-stone-900'}`}
          >
            <Clock size={16} />
            <span>Sent History</span>
          </button>
        </nav>

        <div className="mt-auto pt-8 border-t border-stone-800 opacity-40">
          <p className="text-[8px] tracking-widest uppercase mb-4 text-stone-400">Draft Templates</p>
          <div className="space-y-3">
            {['Collection Launch', 'Order Follow-up', 'Styling Session'].map(t => (
              <button 
                key={t}
                onClick={() => setPrompt(`Draft a ${t} email for a VIP client interested in Zara UK premium drops.`)}
                className="text-[9px] block text-stone-500 hover:text-stone-200 transition-colors uppercase tracking-widest"
              >
                • {t}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 md:p-16 relative">
        <AnimatePresence mode="wait">
          {view === 'compose' ? (
            <motion.div 
              key="compose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <header className="mb-12">
                <h2 className="text-4xl font-bold serif italic mb-2">New Correspondence</h2>
                <p className="text-stone-500 text-xs uppercase tracking-[0.2em]">Crafting global excellence.</p>
              </header>

              <div className="grid lg:grid-cols-12 gap-12">
                {/* Editor */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-[#141211] p-10 border border-stone-800 shadow-2xl relative">
                    <AnimatePresence>
                      {showSuccess && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-[#C5A059]/10 backdrop-blur-md z-20 flex flex-col items-center justify-center text-center p-8"
                        >
                          <CheckCircle size={48} className="text-[#C5A059] mb-4" />
                          <h3 className="text-2xl font-bold serif text-white">Message Dispatched</h3>
                          <p className="text-white/60 text-[10px] uppercase tracking-widest mt-2">The client will receive this shortly.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-8">
                      <div className="group">
                        <label className="block text-[9px] font-bold text-stone-600 uppercase tracking-widest mb-2 group-focus-within:text-[#C5A059] transition-colors">Recipient</label>
                        <input 
                          type="email"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          placeholder="client@luxury.com"
                          className="w-full bg-transparent border-b border-stone-800 py-3 text-sm focus:outline-none focus:border-[#C5A059] transition-all text-stone-200"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[9px] font-bold text-stone-600 uppercase tracking-widest mb-2 group-focus-within:text-[#C5A059] transition-colors">Subject</label>
                        <input 
                          type="text"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          placeholder="ZARA UK Boutique: Exclusive Preview"
                          className="w-full bg-transparent border-b border-stone-800 py-3 text-sm focus:outline-none focus:border-[#C5A059] transition-all text-stone-200"
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[9px] font-bold text-stone-600 uppercase tracking-widest mb-2 group-focus-within:text-[#C5A059] transition-colors">Email Content</label>
                        <textarea 
                          rows={12}
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                          placeholder="Drafting the finest details..."
                          className="w-full bg-[#0c0a09] border-stone-800 border p-6 text-sm focus:outline-none focus:border-[#C5A059] transition-all resize-none font-serif leading-relaxed italic text-stone-300"
                        />
                      </div>
                    </div>

                    <div className="mt-12 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <ShieldCheck className="text-[#C5A059] opacity-50" size={16} />
                        <span className="text-[8px] text-stone-600 font-bold uppercase tracking-widest">Signed: Zarhrah Boutique Admin</span>
                      </div>
                      <button 
                        onClick={handleSend}
                        disabled={isSending || !recipient || !subject || !body}
                        className="bg-white text-stone-900 px-12 py-4 text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-[#C5A059] hover:text-white transition-all shadow-xl flex items-center space-x-3 disabled:opacity-20"
                      >
                        {isSending ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                        <span>Send Message</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Assistant */}
                <div className="lg:col-span-4">
                  <div className="bg-[#141211] p-8 border border-stone-800 border-l-4 border-l-[#C5A059] shadow-xl sticky top-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <Sparkles className="gold-text" size={18} />
                      <h3 className="text-[10px] font-bold tracking-widest uppercase">Communication AI</h3>
                    </div>
                    <p className="text-[10px] text-stone-500 mb-6 font-light leading-relaxed">
                      Enter the message intent (e.g., "Follow up on the suede loafers") and let the Luxury AI generate a sophisticated draft.
                    </p>
                    <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Email intent..."
                      className="w-full bg-black/40 border border-stone-800 p-4 text-xs focus:outline-none focus:border-[#C5A059] mb-4 h-32 resize-none text-stone-300"
                    />
                    <button 
                      onClick={generateWithAi}
                      disabled={isAiLoading || !prompt}
                      className="w-full bg-stone-800 text-white py-4 text-[9px] font-bold tracking-[0.3em] uppercase hover:bg-[#C5A059] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isAiLoading ? <Loader2 className="animate-spin" size={12} /> : <PenTool size={12} />}
                      <span>Generate Draft</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-4xl mx-auto"
            >
              <header className="mb-12 flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-bold serif italic mb-2">Sent Communications</h2>
                  <p className="text-stone-500 text-xs uppercase tracking-[0.2em]">Record of excellence.</p>
                </div>
                <div className="bg-stone-900 px-6 py-3 border border-stone-800 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Total Sent: {sentHistory.length}
                </div>
              </header>

              <div className="space-y-6">
                {sentHistory.length === 0 ? (
                  <div className="py-32 text-center border border-dashed border-stone-800 bg-[#141211]/50">
                    <Mail className="mx-auto text-stone-800 mb-6" size={48} />
                    <p className="text-stone-500 serif italic">No communications logged yet.</p>
                    <button onClick={() => setView('compose')} className="mt-8 gold-text text-[9px] font-bold uppercase tracking-widest hover:underline">Compose your first email</button>
                  </div>
                ) : (
                  sentHistory.map((email) => (
                    <motion.div 
                      layout
                      key={email.id}
                      className="bg-[#141211] border border-stone-800 p-8 group hover:border-[#C5A059] transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5A059]/5 blur-3xl rounded-full -mr-12 -mt-12" />
                      
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div>
                          <p className="text-[#C5A059] text-[10px] font-bold uppercase tracking-widest mb-1">{email.recipient}</p>
                          <h3 className="text-lg font-bold text-stone-200">{email.subject}</h3>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-[9px] text-stone-600 uppercase tracking-widest font-mono">{new Date(email.date).toLocaleDateString()}</span>
                          <button 
                            onClick={() => deleteHistory(email.id)}
                            className="text-stone-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-stone-500 text-xs italic serif line-clamp-2 mb-6 leading-relaxed relative z-10">"{email.body}"</p>
                      
                      <button 
                        onClick={() => { 
                          setRecipient(email.recipient); 
                          setSubject(`Follow-up: ${email.subject}`); 
                          setBody(email.body);
                          setView('compose'); 
                        }}
                        className="text-[9px] font-bold uppercase tracking-widest gold-text opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2"
                      >
                        <PenTool size={10} />
                        <span>Reuse as Template</span>
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default MailApp;
