
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, RestockRequest } from '../types';
import { ArrowLeft, Share2, Check, ShoppingBag, ShieldCheck, Tag, Ban, Mail, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductDetailProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onLogView: (id: string) => void;
  onAddRestockRequest: (request: RestockRequest) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ products, onAddToCart, onLogView, onAddRestockRequest }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [restockEmail, setRestockEmail] = useState('');
  const [isRestockSubmitted, setIsRestockSubmitted] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  
  const product = products.find(p => p.id === id);
  const isSoldOut = product ? product.stock <= 0 : false;

  useEffect(() => {
    if (product) {
      onLogView(product.id);
      window.scrollTo(0, 0);
    }
  }, [product, onLogView]);

  if (!product) {
    return (
      <div className="pt-40 pb-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Product Not Found</h2>
        <p className="text-stone-500 mb-8">This piece may have been removed from the current collection.</p>
        <Link to="/" className="text-xs font-bold gold-text border-b border-[#C5A059] pb-2 tracking-[0.3em]">RETURN TO CATALOG</Link>
      </div>
    );
  }

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockEmail || !restockEmail.includes('@')) return;

    const request: RestockRequest = {
      id: `rr-${Date.now()}`,
      productId: product.id,
      customerEmail: restockEmail,
      date: new Date().toISOString()
    };

    onAddRestockRequest(request);
    setIsRestockSubmitted(true);
  };

  const nextImage = () => {
    setActiveImgIdx((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setActiveImgIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="pt-20 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-stone-400 hover:text-stone-900 transition-colors mb-12 uppercase tracking-widest text-[10px] font-bold group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Return to Collection</span>
        </button>

        <div className="grid lg:grid-cols-12 gap-16 items-start">
          {/* Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-stone-50 group">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={activeImgIdx}
                  src={product.images[activeImgIdx]} 
                  alt={product.name} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`w-full h-full object-cover ${isSoldOut ? 'grayscale contrast-75' : ''}`}
                />
              </AnimatePresence>

              {product.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              <div className="absolute top-6 left-6 flex flex-col space-y-2 pointer-events-none">
                <span className="bg-white/90 backdrop-blur-md px-4 py-2 text-[9px] font-bold tracking-[0.3em] uppercase border border-stone-200 self-start">
                  {product.category}
                </span>
                <span className="bg-stone-900 text-white px-4 py-2 text-[9px] font-bold tracking-[0.3em] uppercase self-start">
                  {product.brand}
                </span>
              </div>
              
              {isSoldOut && (
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="bg-stone-900 text-white px-8 py-4 text-[12px] font-bold tracking-[0.5em] uppercase shadow-2xl border border-white/20">
                    Currently Unavailable
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-6 gap-4">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImgIdx(idx)}
                    className={`aspect-[3/4] rounded-sm overflow-hidden border-2 transition-all ${activeImgIdx === idx ? 'border-[#C5A059]' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 sticky top-32">
            <div className="mb-8">
              <span className="gold-text font-bold text-[10px] tracking-[0.4em] uppercase block mb-2">{product.brand} Boutique</span>
              <div className="flex justify-between items-start mb-4">
                <h1 className={`text-4xl md:text-5xl font-bold tracking-tight ${isSoldOut ? 'text-stone-400' : 'text-stone-900'}`}>
                  {product.name}
                </h1>
                {!isSoldOut && (
                  <button 
                    onClick={handleShare}
                    className="p-3 hover:bg-stone-50 transition-colors rounded-full relative group"
                    title="Share Piece"
                  >
                    {copied ? <Check className="text-green-600" /> : <Share2 className="text-stone-900" />}
                  </button>
                )}
              </div>
              <p className={`text-2xl font-bold ${isSoldOut ? 'text-stone-300' : 'gold-text'}`}>
                N{product.price.toLocaleString()}
              </p>
            </div>

            <div className="space-y-8 py-8 border-y border-stone-100">
              <div>
                <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-stone-400 mb-4">The Detail</h3>
                <p className="text-stone-600 leading-relaxed font-light text-lg italic mb-6">
                  "{product.description}"
                </p>
                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map(tag => (
                      <span key={tag} className="flex items-center px-3 py-1 bg-stone-50 border border-stone-200 rounded-full text-[9px] font-bold text-stone-400 uppercase tracking-widest">
                        <Tag size={10} className="mr-1.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-6 text-[10px] font-bold tracking-[0.2em] uppercase text-stone-400">
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-3 ${isSoldOut ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                  {isSoldOut ? 'Sold Out' : `In Stock (${product.stock} units)`}
                </div>
                <div>•</div>
                <div>Authentic {product.brand}</div>
              </div>
            </div>

            <div className="mt-12 space-y-6">
              {!isSoldOut ? (
                <button
                  onClick={() => onAddToCart(product)}
                  className="w-full bg-stone-900 text-white py-6 text-[11px] font-bold tracking-[0.4em] hover:bg-stone-800 transition-all shadow-2xl uppercase flex items-center justify-center space-x-3"
                >
                  <ShoppingBag size={16} />
                  <span>Add to Shopping Bag</span>
                </button>
              ) : (
                <div className="bg-stone-50 p-8 rounded-sm border border-stone-100 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase mb-4 flex items-center">
                    <Bell size={14} className="mr-2 gold-text" /> 
                    Restock Notification
                  </h4>
                  <p className="text-xs text-stone-500 font-light italic mb-6 leading-relaxed">
                    This selection is currently out of stock. Leave your email and be the first to know when it returns to our London boutique.
                  </p>
                  
                  <AnimatePresence mode="wait">
                    {!isRestockSubmitted ? (
                      <motion.form 
                        key="restock-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleRestockSubmit} 
                        className="space-y-4"
                      >
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={14} />
                          <input 
                            type="email" 
                            required
                            placeholder="YOUR EMAIL ADDRESS"
                            value={restockEmail}
                            onChange={(e) => setRestockEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-4 bg-white border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#C5A059] text-[10px] font-bold tracking-widest uppercase transition-all"
                          />
                        </div>
                        <button 
                          type="submit"
                          className="w-full bg-[#C5A059] text-white py-4 text-[10px] font-bold tracking-[0.3em] hover:bg-stone-900 transition-all uppercase"
                        >
                          Notify Me
                        </button>
                      </motion.form>
                    ) : (
                      <motion.div 
                        key="restock-success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-4"
                      >
                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Check className="text-green-600" size={20} />
                        </div>
                        <p className="text-[10px] font-bold tracking-[0.2em] text-stone-900 uppercase">Patron Secured</p>
                        <p className="text-[9px] text-stone-400 mt-1 uppercase tracking-widest">We'll alert you via {restockEmail}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              
              <div className="flex items-center justify-center space-x-3 py-6 bg-stone-50 border border-stone-100 rounded-sm">
                <ShieldCheck className="w-5 h-5 gold-text" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500">
                  Secure Boutique Shipping from London
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
