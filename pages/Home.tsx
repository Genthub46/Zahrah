
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, MessageCircle, ChevronDown, Quote, Star, ShieldCheck, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Product, Review } from '../types';
import ProductCard from '../components/ProductCard';
import Logo from '../components/Logo';
import { REVIEWS_STORAGE_KEY } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface HomeProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
  onLogView: (id: string) => void;
  onToggleWishlist: (product: Product) => void;
  wishlist: Product[];
}

const Home: React.FC<HomeProps> = ({ products, onAddToCart, onLogView, onToggleWishlist, wishlist }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const bundleRef = useRef<HTMLDivElement>(null);
  const arrivalsRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const brandFilter = searchParams.get('brand');

  useEffect(() => {
    const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (saved) {
      setReviews(JSON.parse(saved).slice(0, 3));
    }
  }, []);

  const bundleProducts = useMemo(() => 
    products.filter(p => p.tags.includes('bundle') && (!brandFilter || p.brand.toLowerCase() === brandFilter.toLowerCase())), 
  [products, brandFilter]);

  const newArrivals = useMemo(() => 
    products.filter(p => p.tags.includes('new') && (!brandFilter || p.brand.toLowerCase() === brandFilter.toLowerCase())), 
  [products, brandFilter]);

  const filteredCatalog = useMemo(() => 
    products.filter(p => !brandFilter || p.brand.toLowerCase() === brandFilter.toLowerCase()), 
  [products, brandFilter]);

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const clearFilter = () => {
    navigate('/');
  };

  const isWishlisted = (id: string) => wishlist.some(p => p.id === id);

  return (
    <div className="pt-0 bg-[#F9F9F9]">
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1549037173-e3b717902c57?auto=format&fit=crop&w=1920&q=80"
            alt="ZARA UK Luxury"
            className="w-full h-full object-cover animate-kenburns"
          />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 text-center px-4 max-w-5xl flex flex-col items-center"
        >
          <motion.span 
            initial={{ letterSpacing: "0.2em", opacity: 0 }}
            animate={{ letterSpacing: "0.4em", opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-white font-bold text-[10px] uppercase block mb-6 tracking-[0.5em]"
          >
            Personalized luxury shopping delivering global excellence.
          </motion.span>
          <h1 className="text-6xl md:text-9xl text-white mb-8 font-bold tracking-tighter leading-none">
            Elite Style <br /><span className="italic font-light serif text-stone-200">Curated Daily</span>
          </h1>
          
          <div className="flex flex-col items-center mt-8">
            <a
              href="#bundles"
              className="inline-flex items-center space-x-6 bg-white text-stone-900 px-16 py-6 text-[11px] font-bold tracking-[0.4em] hover:bg-stone-100 transition-all shadow-2xl group mb-12"
            >
              <span>DISCOVER DROPS</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
            </a>

            <div 
              onClick={() => document.getElementById('bundles')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex flex-col items-center gap-1 cursor-pointer group animate-bounce"
            >
              <ChevronDown size={24} className="text-white" />
            </div>
          </div>
        </motion.div>
      </section>

      <AnimatePresence>
        {brandFilter && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white border-b border-stone-200 py-6 px-4 sticky top-16 z-30"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Filtering by Brand:</span>
                <span className="text-lg font-bold serif italic uppercase gold-text">{brandFilter}</span>
              </div>
              <button 
                onClick={clearFilter}
                className="flex items-center space-x-2 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:text-stone-900 transition-colors"
              >
                <X size={14} />
                <span>Clear Filter</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section id="bundles" className="py-24 px-4 sm:px-6 lg:px-12 max-w-[1600px] mx-auto overflow-hidden">
        <div className="flex justify-between items-end mb-12">
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-stone-900 mb-2">
              {brandFilter ? `${brandFilter} Bundles` : 'Bundles Deals'}
            </h2>
            <div className="absolute -bottom-2 left-0 w-full h-[3px] bg-stone-900" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button onClick={() => scroll(bundleRef, 'left')} className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-white transition-all"><ChevronLeft size={18} /></button>
              <button onClick={() => scroll(bundleRef, 'right')} className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-white transition-all"><ChevronRight size={18} /></button>
            </div>
          </div>
        </div>

        <div ref={bundleRef} className="flex space-x-6 overflow-x-auto no-scrollbar scroll-smooth pb-8">
          {bundleProducts.length === 0 ? (
            <div className="w-full py-12 text-center text-stone-400 italic serif">No bundles available.</div>
          ) : (
            bundleProducts.map((product) => (
              <div key={product.id} className="w-[300px] md:w-[380px] flex-shrink-0">
                <ProductCard 
                  product={product} 
                  onAddToCart={onAddToCart} 
                  onLogView={onLogView} 
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={isWishlisted(product.id)}
                />
              </div>
            ))
          )}
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-12 max-w-[1600px] mx-auto overflow-hidden border-t border-stone-100">
        <div className="flex justify-between items-end mb-12">
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-stone-900 mb-2">
               {brandFilter ? `${brandFilter} New Drops` : 'New Arrivals'}
            </h2>
            <div className="absolute -bottom-2 left-0 w-24 h-[3px] bg-stone-900" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button onClick={() => scroll(arrivalsRef, 'left')} className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-white transition-all"><ChevronLeft size={18} /></button>
              <button onClick={() => scroll(arrivalsRef, 'right')} className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center hover:bg-white transition-all"><ChevronRight size={18} /></button>
            </div>
          </div>
        </div>

        <div ref={arrivalsRef} className="flex space-x-6 overflow-x-auto no-scrollbar scroll-smooth pb-8">
          {newArrivals.length === 0 ? (
            <div className="w-full py-12 text-center text-stone-400 italic serif">No new arrivals.</div>
          ) : (
            newArrivals.map((product) => (
              <div key={product.id} className="w-[300px] md:w-[380px] flex-shrink-0">
                <ProductCard 
                  product={product} 
                  onAddToCart={onAddToCart} 
                  onLogView={onLogView} 
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={isWishlisted(product.id)}
                />
              </div>
            ))
          )}
        </div>
      </section>

      <section id="catalog" className="py-32 bg-white px-4 sm:px-6 lg:px-12">
        <div className="text-center mb-16">
          <span className="text-stone-400 font-bold text-[9px] uppercase tracking-[0.6em] block mb-4">Complete Selection</span>
          <h2 className="text-5xl font-bold tracking-tighter uppercase serif italic">
            {brandFilter ? `${brandFilter} Boutique` : 'Full Catalog'}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-20">
          {filteredCatalog.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={onAddToCart} 
              onLogView={onLogView}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={isWishlisted(product.id)}
            />
          ))}
        </div>
      </section>

      <section className="bg-stone-900 py-32 text-white px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 tracking-tight serif italic">The Inner Circle</h2>
          <p className="text-stone-400 font-light mb-12 text-lg italic serif">Receive private collection drops and boutique previews direct from London.</p>
          <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="YOUR EMAIL" 
              className="flex-grow px-8 py-5 bg-white/5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-[#C5A059] text-[10px] font-bold tracking-widest uppercase text-white"
            />
            <button className="bg-white text-stone-900 px-10 py-5 text-[10px] font-bold tracking-[0.3em] hover:bg-[#C5A059] hover:text-white transition-all uppercase whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <footer id="contact" className="bg-white pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-24 mb-24">
            <div className="space-y-8">
              <Logo size={100} />
              <p className="text-stone-500 font-light leading-relaxed text-sm serif italic">
                Bridging London style with global luxury standards. Premium shopping, personalized for you.
              </p>
            </div>

            <div className="space-y-8">
              <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-stone-400">Direct Lines</h3>
              <div className="space-y-4">
                <a href="tel:+447574442681" className="block text-xl font-light hover:text-[#C5A059] transition-colors tracking-tighter">+44 (757) 444 2681</a>
                <a href="tel:+2348186626350" className="block text-xl font-light hover:text-[#C5A059] transition-colors tracking-tighter">+234 (818) 662 6350</a>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-stone-400">Support</h3>
              <a 
                href="https://wa.me/2348186626350" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 bg-stone-900 text-white px-8 py-5 text-[10px] font-bold tracking-[0.4em] hover:bg-[#C5A059] transition-all rounded-full shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WHATSAPP SUPPORT</span>
              </a>
            </div>
          </div>

          <div className="pt-12 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center opacity-60 text-center md:text-left">
            <p className="text-[8px] text-stone-400 tracking-[0.5em] uppercase font-bold">© 2024 ZARHRAH LUXURY • LONDON / LAGOS</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
