import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, RestockRequest } from '../types';
import { 
  ArrowLeft, Share2, Check, ShoppingBag, Ban, 
  Mail, Bell, Truck, Globe, Award, Sparkles, Send,
  Plus, Minus, Heart, ChevronDown, ChevronUp, X, ChevronLeft, ChevronRight, Maximize2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';

interface ProductDetailProps {
  products: Product[];
  onAddToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
  onLogView: (id: string) => void;
  onAddRestockRequest: (request: RestockRequest) => void;
  onToggleWishlist: (product: Product) => void;
  wishlist: Product[];
}

const ProductDetail: React.FC<ProductDetailProps> = ({ 
  products, 
  onAddToCart, 
  onLogView, 
  onAddRestockRequest,
  onToggleWishlist,
  wishlist
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeSection, setActiveSection] = useState<string | null>('description');
  const [copied, setCopied] = useState(false);
  const [restockEmail, setRestockEmail] = useState('');
  const [isRestockSubmitted, setIsRestockSubmitted] = useState(false);
  
  // Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const product = useMemo(() => products.find(p => p.id === id), [products, id]);
  const isSoldOut = product ? product.stock <= 0 : false;
  const isWishlisted = product ? wishlist.some(p => p.id === product.id) : false;

  // Selection Logic
  const needsColor = product?.colors && product.colors.length > 0;
  const needsSize = product?.sizes && product.sizes.length > 0;
  const isSelectionComplete = (!needsColor || selectedColor) && (!needsSize || selectedSize);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  useEffect(() => {
    if (product) {
      onLogView(product.id);
    }
  }, [id, product, onLogView]);

  const handleNextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (product) {
      setActiveImgIdx((prev) => (prev + 1) % product.images.length);
    }
  }, [product]);

  const handlePrevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (product) {
      setActiveImgIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === 'Escape') setIsLightboxOpen(false);
        if (e.key === 'ArrowRight') handleNextImage();
        if (e.key === 'ArrowLeft') handlePrevImage();
      } else {
        if (e.key === 'ArrowRight') handleNextImage();
        if (e.key === 'ArrowLeft') handlePrevImage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handleNextImage, handlePrevImage]);

  if (!product) return null;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const relatedProducts = products
    .filter(p => p.id !== product.id && p.brand === product.brand)
    .slice(0, 4);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className="pt-24 pb-24 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 mt-8">
          {/* Gallery Sidebar - Desktop only */}
          <div className="lg:col-span-1 hidden lg:flex flex-col space-y-4">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImgIdx(idx)}
                className={`w-full aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all p-1 bg-stone-50 ${activeImgIdx === idx ? 'border-stone-900' : 'border-transparent opacity-60'}`}
              >
                <img src={img} className="w-full h-full object-contain" alt="" />
              </button>
            ))}
          </div>

          {/* Main Carousel Area */}
          <div className="lg:col-span-6 space-y-6">
            <div className="relative group">
              <motion.div 
                layoutId={`product-img-${product.id}`}
                onClick={() => setIsLightboxOpen(true)}
                className="aspect-[4/5] bg-stone-100 rounded-[2rem] md:rounded-[3rem] overflow-hidden flex items-center justify-center p-8 cursor-zoom-in relative"
              >
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeImgIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    src={product.images[activeImgIdx]} 
                    alt={product.name} 
                    className={`max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-105 ${isSoldOut ? 'grayscale' : ''}`}
                  />
                </AnimatePresence>
                
                {/* Overlay with Maximize icon */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center pointer-events-none">
                  <Maximize2 size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                </div>

                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                      className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-stone-900 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                      className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-stone-900 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </motion.div>

              {/* Sold Out Badge */}
              {isSoldOut && (
                <div className="absolute top-8 left-8">
                  <span className="bg-red-500 text-white px-5 py-2 text-[10px] font-black tracking-widest uppercase rounded-full shadow-2xl">Sold Out</span>
                </div>
              )}
            </div>

            {/* Pagination Dots */}
            {product.images.length > 1 && (
              <div className="flex justify-center items-center space-x-3">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIdx(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${activeImgIdx === idx ? 'w-8 bg-stone-900' : 'w-2 bg-stone-200 hover:bg-stone-300'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-black gold-text uppercase tracking-[0.4em]">{product.brand}</span>
                <span className="w-1 h-1 bg-stone-300 rounded-full" />
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{product.category}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-stone-900 leading-tight serif">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-stone-900">
                N{product.price.toLocaleString()}
              </p>
            </div>

            {/* Attributes Selection */}
            <div className="space-y-8 py-6 border-t border-stone-100">
              {needsColor && (
                <div className="space-y-4">
                  <span className={`text-[10px] font-bold uppercase tracking-widest block transition-colors ${!selectedColor ? 'text-[#C5A059]' : 'text-stone-400'}`}>
                    Select Colour {!selectedColor && <span className="ml-2 lowercase font-light italic">(Required)</span>}
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {product.colors?.map((c) => (
                      <button 
                        key={c.name}
                        onClick={() => setSelectedColor(c.name)}
                        className={`group relative flex flex-col items-center space-y-2`}
                      >
                        <div 
                          className={`w-10 h-10 rounded-full border-2 p-0.5 transition-all ${selectedColor === c.name ? 'border-stone-900 scale-110 shadow-lg' : 'border-stone-100 hover:border-stone-300'}`}
                        >
                          <div className="w-full h-full rounded-full border border-stone-200" style={{ backgroundColor: c.hex }} />
                        </div>
                        <span className={`text-[8px] font-bold uppercase tracking-widest ${selectedColor === c.name ? 'text-stone-900' : 'text-stone-400'}`}>
                          {c.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {needsSize && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${!selectedSize ? 'text-[#C5A059]' : 'text-stone-400'}`}>
                      Select Size {!selectedSize && <span className="ml-2 lowercase font-light italic">(Required)</span>}
                    </span>
                    <button className="text-[10px] font-bold text-stone-900 border-b border-stone-900 uppercase tracking-widest">Size Chart</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes?.map((s) => (
                      <button 
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest border-2 transition-all rounded-sm ${selectedSize === s ? 'border-stone-900 bg-stone-900 text-white shadow-xl' : 'border-stone-100 text-stone-400 hover:border-stone-400'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-4 flex items-center justify-between border-2 border-stone-100 px-4 py-4 rounded-sm">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="text-stone-400 hover:text-stone-900"><Minus size={16} /></button>
                  <span className="text-sm font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="text-stone-400 hover:text-stone-900"><Plus size={16} /></button>
                </div>
                <button 
                  onClick={() => !isSoldOut && isSelectionComplete && onAddToCart(product, quantity, selectedColor, selectedSize)}
                  disabled={isSoldOut || !isSelectionComplete}
                  className={`col-span-8 py-4 text-[11px] font-bold tracking-[0.2em] uppercase rounded-sm shadow-sm transition-all flex items-center justify-center space-x-3 ${isSoldOut ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : isSelectionComplete ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-stone-50 text-stone-400 border border-stone-200 cursor-not-allowed'}`}
                >
                  {!isSelectionComplete && !isSoldOut && <AlertCircle size={14} className="gold-text" />}
                  {isSoldOut ? <Ban size={18} /> : <ShoppingBag size={18} />}
                  <span>
                    {isSoldOut ? 'Out of Stock' : !isSelectionComplete ? 'Complete Selection' : 'Add to Cart'}
                  </span>
                </button>
              </div>

              <div className="flex space-x-4">
                <button 
                  onClick={() => onToggleWishlist(product)}
                  className={`flex-1 flex items-center justify-center space-x-3 py-4 border-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${isWishlisted ? 'border-red-500 bg-red-50 text-red-500' : 'border-stone-200 text-stone-900 hover:border-stone-400'}`}
                >
                  <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
                  <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                </button>
                <button 
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center space-x-3 py-4 border-2 border-stone-200 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:border-stone-400 transition-all"
                >
                  {copied ? <Check size={16} className="text-green-600" /> : <Share2 size={16} />}
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Waitlist for Sold Out */}
            {isSoldOut && (
               <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 mt-8">
                <h4 className="text-[10px] font-bold tracking-widest uppercase mb-4 flex items-center text-stone-900">
                  <Bell size={16} className="mr-3" /> Join the Boutique Waitlist
                </h4>
                <AnimatePresence mode="wait">
                  {!isRestockSubmitted ? (
                    <motion.form 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      onSubmit={(e) => {
                        e.preventDefault();
                        onAddRestockRequest({ id: Date.now().toString(), productId: product.id, customerEmail: restockEmail, date: new Date().toISOString() });
                        setIsRestockSubmitted(true);
                      }} 
                      className="space-y-3"
                    >
                      <input 
                        type="email" required placeholder="EMAIL ADDRESS" value={restockEmail} onChange={(e) => setRestockEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-stone-200 text-[10px] font-bold tracking-widest uppercase rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                      />
                      <button className="w-full bg-stone-900 text-white py-3 text-[10px] font-bold tracking-widest uppercase rounded-lg hover:bg-stone-800 transition-all">Notify Me</button>
                    </motion.form>
                  ) : (
                    <motion.p initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-[10px] font-bold text-green-700 uppercase">You've been added to the waitlist.</motion.p>
                  )}
                </AnimatePresence>
               </div>
            )}

            {/* Accordion Sections */}
            <div className="pt-10 space-y-0 border-t border-stone-100">
              <Accordion 
                title="Product Description" 
                isOpen={activeSection === 'description'} 
                onToggle={() => toggleSection('description')}
              >
                <div className="space-y-6">
                  <p className="text-stone-500 leading-relaxed font-light">{product.description}</p>
                  
                  {product.features && (
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-widest">Features</h4>
                      <ul className="space-y-2">
                        {product.features.map((f, i) => (
                          <li key={i} className="text-stone-500 text-xs flex items-start">
                            <span className="mr-2 text-stone-300">•</span> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Accordion>
            </div>
          </div>
        </div>

        {/* Recommended Grid */}
        <section className="mt-32 pt-24 border-t border-stone-100">
          <div className="flex justify-between items-end mb-16">
             <h2 className="text-4xl font-bold tracking-tight text-stone-900 serif">Customers also viewed</h2>
             <Link to="/" className="text-[10px] font-bold uppercase tracking-widest border-b border-stone-900 pb-2">View Catalog</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onToggleWishlist={onToggleWishlist} isWishlisted={wishlist.some(wi => wi.id === p.id)} />
            ))}
          </div>
        </section>
      </div>

      {/* Luxury Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[20000] bg-stone-900/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
            onClick={() => setIsLightboxOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative max-w-5xl w-full h-full flex items-center justify-center p-4 md:p-12"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-0 right-0 md:-top-12 md:-right-12 p-4 text-stone-400 hover:text-white transition-colors"
              >
                <X size={40} strokeWidth={1} />
              </button>

              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage}
                    className="absolute left-0 p-4 text-stone-400 hover:text-white transition-colors hidden md:block"
                  >
                    <ChevronLeft size={64} strokeWidth={1} />
                  </button>
                  <button 
                    onClick={handleNextImage}
                    className="absolute right-0 p-4 text-stone-400 hover:text-white transition-colors hidden md:block"
                  >
                    <ChevronRight size={64} strokeWidth={1} />
                  </button>
                </>
              )}

              {/* Counter */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 text-stone-500 font-bold text-[10px] uppercase tracking-[0.4em] mb-4">
                {String(activeImgIdx + 1).padStart(2, '0')} / {String(product.images.length).padStart(2, '0')}
              </div>

              {/* Image Container */}
              <div className="w-full h-full flex items-center justify-center pointer-events-none">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeImgIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    src={product.images[activeImgIdx]}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain drop-shadow-2xl"
                  />
                </AnimatePresence>
              </div>

              {/* Mobile swipe controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-8 md:hidden">
                <button onClick={handlePrevImage} className="p-4 text-white"><ChevronLeft size={32} /></button>
                <button onClick={handleNextImage} className="p-4 text-white"><ChevronRight size={32} /></button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Accordion = ({ title, children, isOpen, onToggle }: { title: string; children: React.ReactNode; isOpen: boolean; onToggle: () => void }) => (
  <div className="border-b border-stone-100">
    <button 
      onClick={onToggle}
      className="w-full py-6 flex justify-between items-center group"
    >
      <span className="text-xl font-bold tracking-tight text-stone-900 serif">{title}</span>
      {isOpen ? <ChevronUp className="text-stone-400 group-hover:text-stone-900 transition-colors" /> : <ChevronDown className="text-stone-400 group-hover:text-stone-900 transition-colors" />}
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden pb-8"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default ProductDetail;