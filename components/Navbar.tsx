
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Menu, X, Shield, ChevronDown, LayoutDashboard, LogOut, ChevronRight, Heart } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, wishlistCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      if (scrolled !== isScrolled) setIsScrolled(scrolled);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBrandsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const navigateToBrand = (brand: string) => {
    setIsBrandsOpen(false);
    setIsOpen(false);
    navigate(`/?brand=${brand.toLowerCase()}`);
    setTimeout(() => {
      const productsEl = document.getElementById('bundles') || document.getElementById('catalog');
      productsEl?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  const navItemClasses = (isScrolled || location.pathname !== '/' ? 'text-stone-900' : 'text-white') + ' text-[9px] font-bold tracking-[0.4em] transition-all uppercase hover:gold-text flex items-center cursor-pointer';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[10000] transition-all duration-500 ${isScrolled || isAdmin ? 'glass py-3 border-b border-stone-200/50 shadow-sm' : 'bg-transparent py-8'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center group">
              <Logo size={isScrolled || isAdmin ? 40 : 65} className="transition-all duration-500 group-hover:scale-105" />
              <div className="ml-3 flex flex-col justify-center leading-none">
                <span className={`text-[12px] font-bold tracking-[0.3em] transition-colors duration-500 ${isScrolled || location.pathname !== '/' ? 'text-stone-900' : 'text-white'}`}>ZARHRAH</span>
                <span className="text-[8px] gold-text font-bold tracking-[0.2em] opacity-80 uppercase">London • Lagos</span>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-12">
            {!isAdmin && (
              <>
                <Link to="/" className={navItemClasses}>Home</Link>
                <div className="relative" ref={dropdownRef}>
                  <button onMouseEnter={() => setIsBrandsOpen(true)} onClick={() => setIsBrandsOpen(!isBrandsOpen)} className={navItemClasses}>
                    <span>Brands</span>
                    <ChevronDown size={10} className={`ml-2 transition-transform duration-300 ${isBrandsOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isBrandsOpen && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} onMouseLeave={() => setIsBrandsOpen(false)} className="absolute top-full left-0 mt-4 w-56 bg-white border border-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden py-4 z-[9999]">
                        {['Ashluxe', 'Zara UK', 'Gucci'].map((brand) => (
                          <button key={brand} onClick={() => navigateToBrand(brand)} className="w-full text-left px-8 py-4 text-[9px] font-bold tracking-[0.3em] uppercase text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-all border-l-2 border-transparent hover:border-[#C5A059] cursor-pointer">{brand}</button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <a href="#accessories" onClick={(e) => handleNavClick(e, 'catalog')} className={navItemClasses}>Boutique</a>
                <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className={navItemClasses}>Contact</a>
              </>
            )}
            
            {isAdmin && (
              <div className="flex items-center space-x-12">
                <Link to="/" className={navItemClasses}>Public Boutique</Link>
                <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-[#C5A059]">Admin Control</span>
              </div>
            )}
            
            <div className={`h-4 w-px bg-stone-200 mx-2 ${!isScrolled && !isAdmin && location.pathname === '/' ? 'opacity-20' : ''}`} />
            
            {!isAdmin ? (
              <div className="flex items-center space-x-8">
                <Link to="/wishlist" className="relative group p-2 cursor-pointer">
                  <Heart className={`w-5 h-5 transition-colors duration-500 ${isScrolled || location.pathname !== '/' ? 'text-stone-900' : 'text-white'} group-hover:text-red-500`} />
                  {wishlistCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-lg scale-110">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link to="/checkout" className="relative group p-2 cursor-pointer">
                  <ShoppingBag className={`w-5 h-5 transition-colors duration-500 ${isScrolled || location.pathname !== '/' ? 'text-stone-900' : 'text-white'} group-hover:gold-text`} />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 gold-bg text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-lg scale-110">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <Link to="/admin" className={`text-[9px] font-bold tracking-[0.4em] transition-all uppercase flex items-center hover:gold-text ${isScrolled || location.pathname !== '/' ? 'text-stone-400' : 'text-white/40'}`}>
                  <Shield size={11} className="mr-2" /> Admin
                </Link>
              </div>
            ) : (
              <button 
                onClick={() => { localStorage.removeItem('ZARHRAH_ADMIN_SESSION'); navigate('/admin'); window.location.reload(); }}
                className="text-[9px] font-bold tracking-[0.4em] transition-all uppercase flex items-center text-red-400 hover:text-red-600"
              >
                <LogOut size={11} className="mr-2" /> Sign Out
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-6">
            {!isAdmin && (
              <div className="flex items-center space-x-4">
                <Link to="/wishlist" className="relative group cursor-pointer">
                  <Heart className={`w-6 h-6 ${isScrolled || location.pathname !== '/' ? 'text-stone-900' : 'text-white'}`} />
                  {wishlistCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">{wishlistCount}</span>}
                </Link>
                <Link to="/checkout" className="relative group cursor-pointer">
                  <ShoppingBag className={`w-6 h-6 ${isScrolled || location.pathname !== '/' ? 'text-stone-900' : 'text-white'}`} />
                  {cartCount > 0 && <span className="absolute -top-2 -right-2 gold-bg text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">{cartCount}</span>}
                </Link>
              </div>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className={`${isScrolled || location.pathname !== '/' ? 'text-stone-900' : 'text-white'} cursor-pointer`}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: '100%' }} 
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[11000] md:hidden bg-white overflow-y-auto px-8 pt-24 pb-12"
          >
            <div className="absolute top-8 right-8">
              <button onClick={() => setIsOpen(false)} className="text-stone-900">
                <X size={32} />
              </button>
            </div>

            <div className="flex flex-col space-y-12">
              <div className="space-y-1">
                <Link to="/" onClick={() => setIsOpen(false)} className="block text-2xl font-black tracking-[0.2em] uppercase text-stone-900">HOME</Link>
              </div>

              {!isAdmin && (
                <div className="space-y-6">
                  <p className="text-[10px] font-bold tracking-[0.4em] text-stone-400 uppercase">EXPLORE BRANDS</p>
                  <div className="flex flex-col space-y-5 ml-2">
                    {['ASHLUXE', 'ZARA UK', 'GUCCI'].map((brand) => (
                      <button key={brand} onClick={() => navigateToBrand(brand)} className="text-left text-xl font-black tracking-[0.2em] uppercase text-stone-900 flex items-center group">
                        <span>{brand}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <a href="#accessories" onClick={(e) => handleNavClick(e, 'catalog')} className="block text-2xl font-black tracking-[0.2em] uppercase text-stone-900">BOUTIQUE</a>
              </div>

              <div className="pt-8 border-t border-stone-100 flex flex-col space-y-10">
                <Link to="/wishlist" onClick={() => setIsOpen(false)} className="block text-sm font-black tracking-[0.3em] uppercase text-red-500 flex items-center">
                  <Heart size={16} className="mr-3" /> MY WISHLIST ({wishlistCount})
                </Link>
                <div className="space-y-6">
                  <p className="text-[10px] font-bold tracking-[0.4em] text-stone-400 uppercase">ADMIN ACCESS</p>
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-sm font-black tracking-[0.3em] uppercase text-[#C5A059] flex items-center">
                    <Shield size={16} className="mr-3" /> ADMINISTRATIVE PORTAL
                  </Link>
                </div>
                
                {!isAdmin && (
                  <Link to="/checkout" onClick={() => setIsOpen(false)} className="block text-xl font-black tracking-[0.2em] gold-text uppercase">MY BAG ({cartCount})</Link>
                )}

                {isAdmin && (
                  <button 
                    onClick={() => { localStorage.removeItem('ZARHRAH_ADMIN_SESSION'); navigate('/admin'); window.location.reload(); }}
                    className="block text-sm font-black tracking-[0.3em] uppercase text-red-500 flex items-center"
                  >
                    <LogOut size={16} className="mr-3" /> END PRIVATE SESSION
                  </button>
                )}
              </div>
            </div>

            <div className="mt-20 pt-12 border-t border-stone-50">
              <div className="flex flex-col items-center space-y-4">
                <Logo size={80} className="opacity-10 grayscale" />
                <p className="text-[8px] text-stone-300 font-bold tracking-[0.5em] uppercase text-center">ZARHRAH LUXURY • LONDON / LAGOS</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
