
import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Phone, Mail, MessageCircle } from 'lucide-react';
import { Product, StyleAdvice } from '../types';
import ProductCard from '../components/ProductCard';
import Logo from '../components/Logo';
import { getStyleAdvice, generateMoodboard } from '../services/geminiService';

interface HomeProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onLogView: (id: string) => void;
}

const Home: React.FC<HomeProps> = ({ products, onAddToCart, onLogView }) => {
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

  const brandProducts = products.filter(p => p.category === 'Apparel' || p.category === 'Footwear');
  const accessoryProducts = products.filter(p => p.category === 'Accessories' || p.category === 'Beauty' || p.category === 'Travel' || p.category === 'Watches' || p.category === 'Perfumes' || p.category === 'Bags');

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80"
            alt="ZARA UK Luxury"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-stone-900/40" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <span className="gold-text font-bold text-[10px] tracking-[0.4em] uppercase block mb-6">Premium ZARA UK Shopper</span>
          <h1 className="text-5xl md:text-8xl text-white mb-8 font-bold tracking-tight">
            Original ZARA <br /><span className="italic font-light opacity-90">London Curated</span>
          </h1>
          <p className="text-lg md:text-xl text-stone-100 mb-12 font-light tracking-widest uppercase">
            Zarhrah Luxury: High-end clothing brand delivering ZARA UK excellence.
          </p>
          <a
            href="#brands"
            className="inline-flex items-center space-x-2 bg-white text-stone-900 px-12 py-5 text-[10px] font-bold tracking-[0.3em] hover:bg-[#C5A059] hover:text-white transition-all shadow-2xl"
          >
            <span>SHOP BRANDS</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Style Assistant */}
      <section className="bg-stone-50 py-32 px-4 border-y border-stone-200">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="inline-flex items-center justify-center p-3 gold-bg/10 rounded-full mb-6">
              <Sparkles className="w-6 h-6 gold-text" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Premium Stylist</h2>
            <p className="text-stone-600 mb-12 font-light text-lg leading-relaxed">
              Zarhrah Luxury is your personal bridge to ZARA UK. Describe your event, and let us curate the perfect ensemble from the latest London collections.
            </p>
            <form onSubmit={handleGetAdvice} className="relative">
              <input
                type="text"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                placeholder="e.g. A formal gala in Lagos..."
                className="w-full px-8 py-6 bg-white border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all shadow-sm font-light pr-40"
              />
              <button
                disabled={loadingAdvice}
                className="absolute right-2 top-2 bottom-2 bg-stone-900 text-white px-6 py-2 text-[10px] font-bold tracking-widest hover:bg-[#C5A059] transition-all"
              >
                {loadingAdvice ? 'STYLING...' : 'GET LOOK'}
              </button>
            </form>
          </div>

          <div className="min-h-[300px]">
            {advice ? (
              <div className="bg-white p-10 border border-stone-100 shadow-xl animate-in fade-in slide-in-from-right-8 duration-700">
                <h3 className="gold-text font-bold mb-4 tracking-[0.3em] text-[10px] uppercase">Curated Vision</h3>
                <p className="text-stone-900 text-xl font-light italic leading-relaxed mb-6">"{advice.advice}"</p>
                {moodboard && (
                  <div className="border-4 border-stone-50 overflow-hidden shadow-inner">
                    <img src={moodboard} alt="Moodboard" className="w-full h-48 object-cover" />
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-stone-200 rounded-sm flex items-center justify-center p-12 opacity-40">
                <p className="text-stone-400 font-serif italic text-xl">Your luxury recommendation awaits.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section id="brands" className="max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8">
        <div className="mb-20">
          <span className="gold-text font-bold text-xs tracking-[0.4em] uppercase block mb-4">Original ZARA UK</span>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight">The Brands</h2>
          <p className="text-stone-500 font-light mt-4 tracking-widest uppercase text-xs">Premium Apparel & Footwear</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-20 gap-x-12">
          {brandProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart} 
              onLogView={onLogView}
            />
          ))}
        </div>
      </section>

      {/* Accessories Section */}
      <section id="accessories" className="bg-stone-900 text-white py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <span className="gold-text font-bold text-xs tracking-[0.4em] uppercase block mb-4">Finishing Touches</span>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight">Accessories</h2>
            <p className="text-stone-400 font-light mt-4 tracking-widest uppercase text-xs">Watches, Perfumes & Travel Essentials</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-20 gap-x-12">
            {accessoryProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={onAddToCart} 
                onLogView={onLogView}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer & Contact Section */}
      <footer id="contact" className="bg-white border-t border-stone-200 pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-16 mb-24">
            {/* Column 1: Brand */}
            <div className="space-y-8">
              <Logo size={120} />
              <p className="text-stone-500 font-light leading-relaxed italic pr-8">
                High-end clothing brand and premium shopper affiliated with ZARA UK. Delivering original ZARA products directly from London to your door.
              </p>
              <div className="flex items-center space-x-3 pt-4">
                <ShieldCheck className="w-5 h-5 gold-text" />
                <span className="text-[10px] text-stone-400 font-bold tracking-widest uppercase py-2 border-y border-stone-100 px-4">
                  Verified ZARA UK Affiliate
                </span>
              </div>
            </div>

            {/* Column 2: Quick Links & Contact Details */}
            <div className="space-y-10">
              <h3 className="text-sm font-bold tracking-[0.3em] uppercase border-b border-stone-100 pb-4">Our Atelier</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Phone className="w-5 h-5 text-stone-400 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">United Kingdom</p>
                    <a href="tel:+447574442681" className="text-lg font-medium hover:gold-text transition-colors">+44 (757) 444 2681</a>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Phone className="w-5 h-5 text-stone-400 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Nigeria</p>
                    <a href="tel:+2348186626350" className="text-lg font-medium hover:gold-text transition-colors">+234 (818) 662 6350</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Communication */}
            <div className="space-y-10">
              <h3 className="text-sm font-bold tracking-[0.3em] uppercase border-b border-stone-100 pb-4">Connect</h3>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <Mail className="w-5 h-5 text-stone-400 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Email Enquiries</p>
                    <a href="mailto:zarhrahluxurycollections1@gmail.com" className="text-lg font-medium hover:gold-text transition-colors break-all uppercase text-sm tracking-tighter">Zarhrahluxurycollections1</a>
                  </div>
                </div>
                <div className="pt-4">
                  <a 
                    href="https://wa.me/2348186626350" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-3 bg-stone-900 text-white px-8 py-4 text-[10px] font-bold tracking-[0.3em] hover:bg-[#C5A059] transition-all w-full justify-center group"
                  >
                    <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>INSTANT WHATSAPP CONCIERGE</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <p className="text-[9px] text-stone-400 tracking-[0.3em] uppercase">© 2024 ZARHRAH LUXURY ATELIER</p>
            <div className="flex space-x-8 text-[9px] text-stone-400 font-bold tracking-widest uppercase">
              <span className="hover:text-stone-900 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-stone-900 cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-stone-900 cursor-pointer transition-colors">Shipping & Returns</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
