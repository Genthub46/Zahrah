
import React from 'react';
import { ShoppingBag, Menu, X, Shield } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';

interface NavbarProps {
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ cartCount }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <Logo size={64} className="hover:scale-105 transition-transform" />
              <div className="ml-2 flex flex-col justify-center leading-none">
                <span className="text-sm font-bold tracking-[0.2em] text-stone-900">ZARHRAH</span>
                <span className="text-[10px] gold-text font-bold tracking-[0.1em]">COLLECTIONS</span>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-10">
            <Link to="/" className="text-[10px] font-bold tracking-[0.3em] hover:text-[#C5A059] transition-colors uppercase">Home</Link>
            <a 
              href="#brands" 
              onClick={(e) => handleNavClick(e, 'brands')}
              className="text-[10px] font-bold tracking-[0.3em] hover:text-[#C5A059] transition-colors uppercase"
            >
              Brands
            </a>
            <a 
              href="#accessories" 
              onClick={(e) => handleNavClick(e, 'accessories')}
              className="text-[10px] font-bold tracking-[0.3em] hover:text-[#C5A059] transition-colors uppercase"
            >
              Accessories
            </a>
            <Link to="/admin" className="text-[10px] font-bold tracking-[0.3em] text-stone-300 hover:text-[#C5A059] transition-colors uppercase flex items-center">
              <Shield size={12} className="mr-1" /> Admin
            </Link>
            <Link to="/checkout" className="relative group pl-4">
              <ShoppingBag className="w-5 h-5 text-stone-900 group-hover:text-[#C5A059] transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 gold-bg text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          <div className="md:hidden flex items-center space-x-6">
            <Link to="/checkout" className="relative group">
              <ShoppingBag className="w-6 h-6 text-stone-900" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 gold-bg text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-stone-900">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 py-8 px-6 space-y-6">
          <Link to="/" onClick={() => setIsOpen(false)} className="block text-xs font-bold tracking-[0.3em] uppercase">HOME</Link>
          <a href="#brands" onClick={(e) => handleNavClick(e, 'brands')} className="block text-xs font-bold tracking-[0.3em] uppercase">BRANDS</a>
          <a href="#accessories" onClick={(e) => handleNavClick(e, 'accessories')} className="block text-xs font-bold tracking-[0.3em] uppercase">ACCESSORIES</a>
          <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-xs font-bold tracking-[0.3em] uppercase text-stone-400">ADMIN</Link>
          <Link to="/checkout" onClick={() => setIsOpen(false)} className="block text-xs font-bold tracking-[0.3em] uppercase">MY BAG</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
