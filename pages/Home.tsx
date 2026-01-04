
import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Phone, Mail, MessageCircle, ChevronDown, Star, Quote } from 'lucide-react';
import { Product, Review } from '../types';
import ProductCard from '../components/ProductCard';
import Logo from '../components/Logo';
import { REVIEWS_STORAGE_KEY } from '../constants';
import { motion } from 'framer-motion';

interface HomeProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onLogView: (id: string) => void;
}

const Home: React.FC<HomeProps> = ({ products, onAddToCart, onLogView }) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (saved) {
      setReviews(JSON.parse(saved).slice(0, 3));
    }
  }, []);

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
          className="relative z-10 text-center px-4 max-w-5xl flex flex-col items-center"
        >
          <motion.span 
            initial={{ letterSpacing: "0.2em", opacity: 0 }}
            animate={{ letterSpacing: "0.4em", opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="gold-text font-bold text-[10px] uppercase block mb-6"
          >
            Premium ZARA UK Shopper
          </motion.span>
          <h1 className="text-6xl md:text-9xl text-white mb-8 font-bold tracking-tighter leading-none">
            Original ZARA <br /><span className="italic font-light serif text-stone-200">London Boutique</span>
          </h1>
          <p className="text-lg md:text-2xl text-stone-100/90 mb-10 font-light tracking-[0.1em] uppercase max-w-2xl mx-auto leading-relaxed">
            Personalized luxury shopping delivering global excellence.
          </p>
          
          <div className="flex flex-col items-center">
            <a
              href="#brands"
              className="inline-flex items-center space-x-6 bg-white text-stone-900 px-16 py-6 text-[11px] font-bold tracking-[0.4em] hover:bg-stone-100 transition-all shadow-2xl group border border-white mb-6"
            >
              <span>EXPLORE SHOWROOM</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
            </a>

            {/* Discover Indicator - Tightened Spacing */}
            <div 
              onClick={() => document.getElementById('brands')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex flex-col items-center gap-1 cursor-pointer group opacity-60 hover:opacity-100 transition-opacity"
            >
              <span className="text-[9px] font-bold tracking-[0.5em] text-white uppercase group-hover:gold-text transition-colors">Discover</span>
              <ChevronDown size={18} className="text-white float group-hover:gold-text" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Boutique Section */}
      <section id="brands" className="max-w-7xl mx-auto px-4 py-40 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24 text-center"
        >
          <span className="gold-text font-bold text-[10px] tracking-[0.5em] uppercase block mb-6">Seasonal Edit</span>
          <h2 className="text-6xl md:text-7xl font-bold tracking-tighter uppercase">The Boutique</h2>
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

      {/* Accessories Section */}
      <section id="accessories" className="bg-stone-900 text-white py-40 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <span className="gold-text font-bold text-[10px] tracking-[0.5em] uppercase block mb-6">Finishing Touches</span>
            <h2 className="text-6xl md:text-7xl font-bold tracking-tighter uppercase">Boutique Accents</h2>
            <p className="text-stone-400 font-light mt-6 tracking-widest uppercase text-[10px]">Watches, Perfumes & Curated Accessories</p>
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

      {/* Testimonials Section */}
      {reviews.length > 0 && (
        <section className="bg-stone-50 py-40 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <span className="gold-text font-bold text-[10px] tracking-[0.5em] uppercase block mb-8">Social Proof</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-20 tracking-tight serif italic">Boutique Testimonials</h2>
            <div className="grid md:grid-cols-3 gap-12">
              {reviews.map((review) => (
                <motion.div 
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white p-10 border border-stone-100 shadow-sm relative text-left"
                >
                  <Quote className="absolute top-6 right-6 w-8 h-8 text-stone-50" />
                  <div className="flex mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} size={12} fill="#C5A059" className="text-[#C5A059]" />
                    ))}
                  </div>
                  <p className="text-stone-600 text-sm font-light italic leading-relaxed mb-6">"{review.comment}"</p>
                  <div className="border-t border-stone-50 pt-4">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-stone-900">{review.customerName}</p>
                    <p className="text-[8px] text-stone-400 uppercase tracking-widest mt-1">Verified Patron</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="bg-white py-40 border-t border-stone-100 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 tracking-tight uppercase tracking-[0.2em]">The Newsletter</h2>
          <p className="text-stone-500 font-light mb-12 text-lg italic serif">Subscribe to receive exclusive access to the latest boutique ZARA drops and private collection previews.</p>
          <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="YOUR EMAIL ADDRESS" 
              className="flex-grow px-8 py-5 bg-stone-50 border border-stone-100 focus:outline-none focus:ring-1 focus:ring-[#C5A059] text-[10px] font-bold tracking-widest uppercase"
            />
            <button className="bg-stone-900 text-white px-10 py-5 text-[10px] font-bold tracking-[0.3em] hover:bg-[#C5A059] transition-all uppercase whitespace-nowrap">
              Join the Circle
            </button>
          </form>
        </div>
      </section>

      {/* Footer & Contact Section */}
      <footer id="contact" className="bg-white pt-20 pb-20 px-4 relative">
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
              <h3 className="text-[10px] font-bold tracking-[0.4em] uppercase text-stone-400">Boutique Lines</h3>
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
                      WHATSAPP SUPPORT
                    </span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-16 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 opacity-60">
            <p className="text-[8px] text-stone-400 tracking-[0.5em] uppercase font-bold">© 2024 ZARHRAH LUXURY BOUTIQUE • LONDON / LAGOS</p>
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
