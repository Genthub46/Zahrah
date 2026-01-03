
import React, { useState } from 'react';
import { Sparkles, ArrowRight, Eye } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { Product, StyleAdvice } from '../types';
import ProductCard from '../components/ProductCard';
import Concierge from '../components/Concierge';
import { getStyleAdvice, generateMoodboard } from '../services/geminiService';

interface HomeProps {
  onAddToCart: (product: Product) => void;
}

const Home: React.FC<HomeProps> = ({ onAddToCart }) => {
  const [occasion, setOccasion] = useState('');
  const [advice, setAdvice] = useState<StyleAdvice | null>(null);
  const [moodboard, setMoodboard] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const handleGetAdvice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!occasion.trim()) return;
    setLoadingAdvice(true);
    setAdvice(null);
    setMoodboard(null);
    
    const adviceResult = await getStyleAdvice(occasion);
    if (adviceResult) {
      setAdvice(adviceResult);
      const moodboardUrl = await generateMoodboard(adviceResult.advice);
      setMoodboard(moodboardUrl);
    }
    setLoadingAdvice(false);
  };

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1920&q=80"
            alt="Luxury Abaya Hero"
            className="w-full h-full object-cover grayscale-[20%]"
          />
          <div className="absolute inset-0 bg-stone-900/40" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-5xl md:text-8xl text-white mb-6 font-bold tracking-tight">
            Elegance in <br /><span className="italic font-light opacity-90">Modernity</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-200 mb-10 font-light tracking-widest uppercase">
            Luxury abayas and premium fabrics for the modern woman.
          </p>
          <a
            href="#shop"
            className="inline-flex items-center space-x-2 bg-white text-stone-900 px-10 py-4 text-sm font-bold tracking-[0.2em] hover:bg-[#C5A059] hover:text-white transition-all shadow-xl"
          >
            <span>EXPLORE NOW</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Style Assistant Section */}
      <section className="bg-stone-50 py-32 px-4 border-y border-stone-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="max-w-xl">
              <div className="inline-flex items-center justify-center p-3 gold-bg/10 rounded-full mb-6">
                <Sparkles className="w-6 h-6 gold-text" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Personal Style Assistant</h2>
              <p className="text-stone-600 mb-12 font-light text-lg leading-relaxed">
                Describe your upcoming event, from a private gallery opening to a desert gala. Our AI will curate a look including fabrics, silhouettes, and a visual mood board.
              </p>
              
              <form onSubmit={handleGetAdvice} className="relative mb-8">
                <input
                  type="text"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  placeholder="e.g. A sunset wedding in Morocco..."
                  className="w-full px-8 py-6 bg-white border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all shadow-sm font-light pr-40"
                />
                <button
                  disabled={loadingAdvice}
                  className="absolute right-2 top-2 bottom-2 bg-stone-900 text-white px-6 py-2 text-[10px] font-bold tracking-widest hover:bg-[#C5A059] transition-all disabled:opacity-50"
                >
                  {loadingAdvice ? 'STYLING...' : 'CURATE LOOK'}
                </button>
              </form>
            </div>

            <div className="min-h-[400px]">
              {loadingAdvice ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4 bg-white border border-stone-100 rounded-sm p-12">
                   <div className="w-12 h-12 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
                   <p className="text-xs font-bold tracking-widest text-stone-400">DESIGNING YOUR VISION...</p>
                </div>
              ) : advice ? (
                <div className="bg-white border border-stone-100 rounded-sm p-10 shadow-2xl animate-in fade-in slide-in-from-right-8 duration-700">
                  <h3 className="gold-text font-bold mb-4 tracking-[0.3em] text-[10px] uppercase">Curated Vision</h3>
                  <p className="text-stone-900 text-xl font-light italic leading-relaxed mb-8">"{advice.advice}"</p>
                  
                  <div className="flex flex-wrap gap-2 mb-10">
                    {advice.suggestedColors.map((color, idx) => (
                      <span key={idx} className="bg-stone-50 text-stone-500 px-5 py-2 text-[10px] font-bold border border-stone-100 uppercase tracking-widest">
                        {color}
                      </span>
                    ))}
                  </div>

                  {moodboard && (
                    <div className="relative group overflow-hidden border-4 border-stone-50">
                       <img src={moodboard} alt="Generated Moodboard" className="w-full h-64 object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-700" />
                       <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 text-[8px] font-bold tracking-widest uppercase">Visual Inspiration</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full border-2 border-dashed border-stone-200 rounded-sm flex items-center justify-center p-12">
                   <p className="text-stone-300 font-serif italic text-xl">Your style recommendation will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section id="shop" className="max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <span className="gold-text font-bold text-xs tracking-[0.4em] uppercase block mb-6">Meticulously Crafted</span>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight">The Boutique</h2>
          </div>
          <div className="flex space-x-8 border-b border-stone-200 pb-2">
            {['ALL', 'ABAYAS', 'FABRICS'].map(cat => (
              <button key={cat} className={`text-[10px] font-bold tracking-[0.3em] pb-3 transition-all ${cat === 'ALL' ? 'border-b-2 border-stone-900 text-stone-900' : 'text-stone-400 hover:text-stone-900'}`}>{cat}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-20 gap-x-12">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      </section>

      <footer className="bg-stone-900 text-white py-32 px-4 border-t border-stone-800">
        <div className="max-w-4xl mx-auto text-center">
           <h2 className="text-3xl font-bold tracking-[0.5em] mb-12">RHRAH<span className="gold-text font-light">LUXURY</span></h2>
           <p className="text-stone-500 font-light mb-12 leading-loose">Empowering elegance through modern design and traditional craftsmanship. Join our exclusive inner circle for seasonal launches.</p>
           <div className="flex justify-center space-x-12 mb-16">
              {['INSTAGRAM', 'WHATSAPP', 'SHOWROOM'].map(l => (
                <a key={l} href="#" className="text-[10px] font-bold tracking-[0.4em] text-stone-400 hover:gold-text transition-colors">{l}</a>
              ))}
           </div>
           <p className="text-[9px] text-stone-600 tracking-[0.3em] uppercase">© 2024 RHRAH LUXURY ATELIER</p>
        </div>
      </footer>

      {/* Live Concierge */}
      <Concierge />
    </div>
  );
};

export default Home;
