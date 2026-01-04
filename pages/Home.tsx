
import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Phone, Mail, MessageCircle, ChevronDown } from 'lucide-react';
import { Product, StyleAdvice } from '../types';
import ProductCard from '../components/ProductCard';
import Logo from '../components/Logo';
import { getStyleAdvice, generateMoodboard } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="pt-0 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1920&q=80"
            alt="ZARA UK Luxury"
            className="w-full h-full object-cover animate-kenburns"
          />
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[1px]" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 text-center px-4 max-w-5xl"
        >
          <motion.span 
            initial={{ letterSpacing: "0.2em", opacity: 0 }}
            animate={{ letterSpacing: "0.4em", opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="gold-text font-bold text-[10px] uppercase block mb-8"
          >
            Premium ZARA UK Shopper
          </motion.span>
          <h1 className="text-6xl md:text-9xl text-white mb-10 font-bold tracking-tighter leading-none">
            Original ZARA <br /><span className="italic font-light serif">London Curated</span>
          </h1>
          <p className="text-lg md:text-2xl text-stone-100/90 mb-14 font-light tracking-[0.1em] uppercase max-w-2xl mx-auto leading-relaxed">
            Personalized luxury shopping experience delivering global excellence.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <a
              href="#brands"
              className="inline-flex items-center space-x-3 bg-white text-stone-900 px-12 py-5 text-[10px] font-bold tracking-[0.3em] hover:bg-[#C5A059] hover:text-white transition-all shadow-2xl group"
            >
              <span>EXPLORE ATELIER</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 flex flex-col items-center gap-2 float cursor-pointer">
          <span className="text-[8px] font-bold tracking-[0.4em] uppercase">Discover</span>
          <ChevronDown size={20} />
        </div>
      </section>

      {/* Style Assistant */}
      <section className="bg-stone-50 py-40 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center justify-center p-4 bg-white border border-stone-100 rounded-full shadow-sm mb-8">
              <Sparkles className="w-6 h-6 gold-text" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight">Concierge Stylist</h2>
            <p className="text-stone-600 mb-12 font-light text-xl leading-relaxed max-w-lg">
              Describe your vision, and our AI-powered atelier will curate the perfect ensemble from the latest London collections.
            </p>
            <form onSubmit={handleGetAdvice} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#C5A059]/0 to-[#C5A059]/20 rounded-sm blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <input
                type="text"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                placeholder="e.g. A sunset wedding in Cap d'Antibes..."
                className="relative w-full px-10 py-7 bg-white border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all shadow-sm font-light text-lg pr-48"
              />
              <button
                disabled={loadingAdvice}
                className="absolute right-3 top-3 bottom-3 bg-stone-900 text-white px-8 py-2 text-[10px] font-bold tracking-widest hover:bg-[#C5A059] transition-all flex items-center gap-2"
              >
                {loadingAdvice ? (
                  <span className="animate-pulse">STYLING...</span>
                ) : (
                  <><span>GET LOOK</span> <ArrowRight size={14} /></>
                )}
              </button>
            </form>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              {advice ? (
                <motion.div 
                  key="advice"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05, y: -20 }}
                  className="bg-white p-12 border border-stone-100 shadow-2xl relative z-10"
                >
                  <div className="flex justify-between items-start mb-8">
                    <h3 className="gold-text font-bold tracking-[0.4em] text-[10px] uppercase">Stylist Recommendation</h3>
                    <div className="flex gap-1">
                      {advice.suggestedColors?.map(color => (
                        <div key={color} className="w-4 h-4 rounded-full border border-stone-100 shadow-sm" style={{ backgroundColor: color.toLowerCase() }} title={color} />
                      ))}
                    </div>
                  </div>
                  <p className="text-stone-900 text-2xl font-light italic leading-relaxed mb-10 serif">"{advice.advice}"</p>
                  {moodboard && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-8 border-stone-50 overflow-hidden shadow-inner grayscale hover:grayscale-0 transition-all duration-700 cursor-crosshair"
                    >
                      <img src={moodboard} alt="Moodboard" className="w-full h-64 object-cover" />
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  className="aspect-square border border-stone-200/50 rounded-sm flex flex-col items-center justify-center p-20 text-center"
                >
                  <div className="w-20 h-20 border border-stone-100 rounded-full flex items-center justify-center mb-6 opacity-30">
                     <Logo size={40} className="grayscale" />
                  </div>
                  <p className="text-stone-300 font-serif italic text-2xl">Awaiting your vision.</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Decorative shapes */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-stone-100/50 rounded-full -z-10 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#C5A059]/5 rounded-full -z-10 blur-3xl" />
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section id="brands" className="max-w-7xl mx-auto px-4 py-40 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24 text-center"
        >
          <span className="gold-text font-bold text-[10px] tracking-[0.5em] uppercase block mb-6">Seasonal Edit</span>
          <h2 className="text-6xl md:text-7xl font-bold tracking-tighter">The Boutique</h2>
          <div className="w-20 h-px bg-stone-200 mx-auto mt-10"></div>
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-24 gap-x-12"
        >
          {brandProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart} 
              onLogView={onLogView}
            />
          ))}
        </motion.div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto py-10 opacity-10">
        <div className="h-px bg-stone-900 w-full flex items-center justify-center">
            <Logo size={30} />
        </div>
      </div>

      {/* Accessories Section */}
      <section id="accessories" className="bg-stone-900 text-white py-40 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <span className="gold-text font-bold text-[10px] tracking-[0.5em] uppercase block mb-6">Finishing Touches</span>
            <h2 className="text-6xl md:text-7xl font-bold tracking-tighter">Accoutrements</h2>
            <p className="text-stone-400 font-light mt-6 tracking-widest uppercase text-[10px]">Watches, Perfumes & Luxuries</p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-24 gap-x-12">
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
      <footer id="contact" className="bg-white pt-40 pb-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-24 mb-32">
            <div className="space-y-10">
              <Logo size={140} />
              <p className="text-stone-500 font-light leading-relaxed text-lg serif italic pr-10">
                A bridge between London's high street and global luxury standards. Curating ZARA's finest for the discerning few.
              </p>
              <div className="flex items-center space-x-4 pt-4">
                <div className="w-10 h-10 rounded-full border border-stone-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 gold-text" />
                </div>
                <span className="text-[10px] text-stone-400 font-bold tracking-[0.2em] uppercase">
                  Verified London Shopper
                </span>
              </div>
            </div>

            <div className="space-y-12">
              <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-stone-400">Atelier Lines</h3>
              <div className="space-y-8">
                <div className="group">
                  <p className="text-[8px] font-bold text-stone-300 uppercase tracking-widest mb-1 group-hover:gold-text transition-colors">United Kingdom</p>
                  <a href="tel:+447574442681" className="text-2xl font-light hover:gold-text transition-colors tracking-tighter">+44 (757) 444 2681</a>
                </div>
                <div className="group">
                  <p className="text-[8px] font-bold text-stone-300 uppercase tracking-widest mb-1 group-hover:gold-text transition-colors">Nigeria</p>
                  <a href="tel:+2348186626350" className="text-2xl font-light hover:gold-text transition-colors tracking-tighter">+234 (818) 662 6350</a>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-stone-400">Correspondence</h3>
              <div className="space-y-10">
                <div className="group">
                  <p className="text-[8px] font-bold text-stone-300 uppercase tracking-widest mb-1 group-hover:gold-text transition-colors">Digital Mail</p>
                  <a href="mailto:zarhrahluxurycollections1@gmail.com" className="text-lg font-medium hover:gold-text transition-colors break-all uppercase text-[11px] tracking-widest">Zarhrahluxurycollections1</a>
                </div>
                <div className="pt-6">
                  <a 
                    href="https://wa.me/2348186626350" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between bg-stone-900 text-white px-10 py-6 text-[10px] font-bold tracking-[0.4em] hover:bg-[#C5A059] transition-all shadow-xl"
                  >
                    <span className="flex items-center gap-3">
                      <MessageCircle className="w-4 h-4" />
                      WHATSAPP CONCIERGE
                    </span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-16 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 opacity-60">
            <p className="text-[8px] text-stone-400 tracking-[0.5em] uppercase font-bold">© 2024 ZARHRAH LUXURY ATELIER • LONDON / LAGOS</p>
            <div className="flex space-x-12 text-[8px] text-stone-400 font-bold tracking-[0.3em] uppercase">
              <span className="hover:text-stone-900 cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-stone-900 cursor-pointer transition-colors">Terms</span>
              <span className="hover:text-stone-900 cursor-pointer transition-colors">Logistics</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
