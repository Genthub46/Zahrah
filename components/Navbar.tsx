
import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Shield } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';

interface NavbarProps {
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled ? 'glass py-4 border-b border-stone-200' : 'bg-transparent py-8'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center group">
              <Logo size={isScrolled ? 50 : 70} className="transition-all duration-700 group-hover:scale-105" />
              <div className="ml-3 flex flex-col justify-center leading-none">
                <span className={`text-sm font-bold tracking-[0.3em] transition-colors duration-700 ${isScrolled || location.pathname !== '/' ? 'text-stone-900' : 'text-white'}`}>ZARHRAH</span>
                <span className="text-[9px] gold-text font-bold tracking-[0.2em] opacity-80">COLLECTIONS</span>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-12">
            {[
              { label: 'Home', id: 'top', type: 'link', to: '/' },
              { label: 'Brands', id: 'brands', type: 'anchor' },
              { label: 'Accessories', id: 'accessories', type: 'anchor' },
              { label: 'Contact', id: 'contact', type: 'anchor' }
            ].map((item) => (
              item.type === 'link' ? (
                <Link key={item.label} to={item.to!} className={`text-[9px] font-bold tracking-[0.4em] transition-all uppercase hover:gold-text ${isScrolled || location.pathname !== '/' ? 'text-stone-900' : 'text-white'}`}>{item.label}</Link>
              ) : (
                <a 
                  key={item.label}
                  href={`#${item.id}`} 
                  onClick={(e) => handleNavClick(e, item.id)}
                  className={`text-[9px] font-bold tracking-[0.4em] transition-all uppercase hover:gold-text ${isScrolled || location.pathname !== '/' ? 'text-stone-900' : 'text-white'}`}
                >
                  {item.label}
                </a>
              )
            ))}
            
            <div className={`h-4 w-px bg-stone-200 mx-2 ${!isScrolled && location.pathname === '/' ? 'opacity-20' : ''}`} />
            
            <Link to="/admin" className={`text-[9px] font-bold tracking-[0.4em] transition-all uppercase flex items-center hover:gold-text ${isScrolled || location.pathname !== '/' ? 'text-stone-400' : 'text-white/40'}`}>
              <Shield size={11} className="mr-2" /> Admin
            </Link>
            
            <Link to="/checkout" className="relative group p-2">
              <ShoppingBag className={`w-5 h-5 transition-colors duration-700 ${isScrolled || location.pathname !== '/' ? 'text-stone-900' : 'text-white'} group-hover:gold-text`} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 gold-bg text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-lg scale-110">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          <div className="md:hidden flex items-center space-x-6">
            <Link to="/checkout" className="relative group">
              <ShoppingBag className={`w-6 h-6 ${isScrolled || location.pathname !== '/' ? 'text-stone-900' : 'text-white'}`} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 gold-bg text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className={isScrolled || location.pathname !== '/' ? 'text-stone-900' : 'text-white'}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass border-b border-stone-200 py-12 px-8 space-y-8 animate-in slide-in-from-top duration-500">
          <Link to="/" onClick={() => setIsOpen(false)} className="block text-sm font-bold tracking-[0.4em] uppercase">HOME</Link>
          <a href="#brands" onClick={(e) => handleNavClick(e, 'brands')} className="block text-sm font-bold tracking-[0.4em] uppercase">BRANDS</a>
          <a href="#accessories" onClick={(e) => handleNavClick(e, 'accessories')} className="block text-sm font-bold tracking-[0.4em] uppercase">ACCESSORIES</a>
          <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="block text-sm font-bold tracking-[0.4em] uppercase">CONTACT</a>
          <div className="pt-8 border-t border-stone-100 flex flex-col space-y-8">
            <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-xs font-bold tracking-[0.4em] uppercase text-stone-400">ADMIN ACCESS</Link>
            <Link to="/checkout" onClick={() => setIsOpen(false)} className="block text-sm font-bold tracking-[0.4em] gold-text uppercase">MY BAG ({cartCount})</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
