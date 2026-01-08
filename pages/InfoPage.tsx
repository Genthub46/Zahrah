
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FooterPage } from '../types';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';

interface InfoPageProps {
  footerPages: FooterPage[];
}

const InfoPage: React.FC<InfoPageProps> = ({ footerPages }) => {
  const { slug } = useParams();
  const page = footerPages.find(p => p.slug === slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (!page) {
    return (
      <div className="pt-48 pb-32 px-8 flex flex-col items-center justify-center text-center">
        <Logo size={80} className="opacity-10 mb-8" />
        <h1 className="text-3xl font-bold serif italic">Artifact Not Found</h1>
        <p className="text-stone-400 mt-4 max-w-md mx-auto">The boutique page you are looking for does not exist or has been archived.</p>
        <Link to="/" className="mt-12 text-[10px] font-black uppercase tracking-[0.4em] gold-text border-b border-[#C5A059] pb-2">Return to Boutique</Link>
      </div>
    );
  }

  return (
    <div className="pt-48 pb-32 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-8">
        <Link 
          to="/" 
          className="inline-flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.4em] text-stone-400 hover:text-stone-900 transition-colors mb-20 group"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-2" />
          <span>Exit Document</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="space-y-4">
            <span className="text-[10px] font-black gold-text uppercase tracking-[0.5em]">{page.category}</span>
            <h1 className="text-6xl font-bold serif italic tracking-tighter text-stone-900">{page.title}</h1>
          </div>

          <div className="prose prose-stone max-w-none">
            <p className="text-xl text-stone-500 leading-relaxed font-light whitespace-pre-wrap">
              {page.content}
            </p>
          </div>

          <div className="pt-32 border-t border-stone-50">
             <div className="flex flex-col items-center space-y-6">
                <Logo size={60} className="opacity-20" />
                <p className="text-[9px] text-stone-300 font-black uppercase tracking-[0.6em] text-center">ZARHRAH LUXURY • OFFICIAL DOCUMENTATION • London / Lagos</p>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InfoPage;
