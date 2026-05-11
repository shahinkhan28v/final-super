import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { subscribeToAppSettings } from '../lib/dataService';
import { AppSettings, CustomPage } from '../types';
import { 
  ChevronLeft, 
  Clock, 
  Share2, 
  Info,
  RefreshCw,
  Layout,
  Briefcase,
  Network,
  Wallet,
  ShieldCheck,
  HelpCircle,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

import { useLanguage } from '../lib/LanguageContext';

const ICON_MAP: { [key: string]: any } = {
  jobs: Briefcase,
  network: Network,
  payouts: Wallet,
  terms: FileText,
  privacy: ShieldCheck,
  support: HelpCircle,
};

export default function InfoPage() {
  const { pageId } = useParams<{ pageId: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAppSettings((data) => {
      setSettings(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    // Add click listener to handle internal links from HTML content
    const handleInternalLinks = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.getAttribute('href')?.startsWith('/')) {
        e.preventDefault();
        const path = anchor.getAttribute('href');
        if (path) navigate(path);
      }
    };

    document.addEventListener('click', handleInternalLinks);
    return () => document.removeEventListener('click', handleInternalLinks);
  }, [navigate]);

  const page = settings?.footerPages?.[pageId || ''];
  const Icon = pageId && ICON_MAP[pageId] ? ICON_MAP[pageId] : Info;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-300 mb-6">
           <Layout className="w-10 h-10" />
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight mb-2">{t('page_not_found')}</h1>
        <p className="text-slate-500 text-sm mb-6">{t('page_not_found_desc') || 'The requested information page does not exist or has been removed.'}</p>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all hover:scale-105 active:scale-95"
        >
          {t('return_home')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Dynamic Header */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-slate-900">
        {page.imageUrl ? (
          <img 
            src={page.imageUrl} 
            className="w-full h-full object-cover opacity-60 scale-105 hover:scale-110 transition-transform duration-1000" 
            alt={page.title} 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 opacity-100" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent" />
        
        <div className="absolute top-6 left-6 z-20">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/30 transition-all active:scale-95 group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="absolute bottom-10 left-6 right-6 z-10 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end gap-6"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-3xl shadow-2xl flex items-center justify-center text-indigo-600 shrink-0">
               <Icon className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <div className="mb-2">
               <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter leading-none mb-2">
                 {page.title}
               </h1>
               <div className="flex items-center gap-4 text-slate-500 text-[10px] md:text-xs">
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-widest">
                    <Clock className="w-3.5 h-3.5" />
                    {t('updated')} {page.lastUpdated ? new Date(page.lastUpdated).toLocaleDateString() : t('recently')}
                  </div>
                  <div className="w-1 h-1 bg-slate-300 rounded-full" />
                  <div className="flex items-center gap-1.5 font-bold uppercase tracking-widest cursor-pointer hover:text-indigo-600 transition-colors">
                    <Share2 className="w-3.5 h-3.5" />
                    {t('share_page')}
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-6 -mt-4 relative z-20">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-indigo-200/20 border border-slate-100"
        >
          <div className="prose prose-slate max-w-none">
             <div 
               className="text-slate-600 font-medium leading-relaxed md:text-lg whitespace-pre-wrap info-page-content"
               dangerouslySetInnerHTML={{ __html: page.content }}
             />
          </div>

          <div className="mt-12 pt-12 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 shrink-0">
                   <Info className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('verify_info')}</p>
                   <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
                     All platform information is updated by the administrative office. If you find any discrepancies, please reach out to support.
                   </p>
                </div>
             </div>
             
             <button 
               onClick={() => navigate('/support')}
               className="px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2 group"
             >
               {t('need_help')} 
               <HelpCircle className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
             </button>
          </div>
        </motion.div>
      </div>

      <style>{`
        .info-page-content h1, .info-page-content h2, .info-page-content h3 {
           font-weight: 900;
           tracking-tight: -0.05em;
           color: #0f172a;
           margin-top: 1.5em;
           margin-bottom: 0.5em;
        }
        .info-page-content h1 { font-size: 2rem; }
        .info-page-content h2 { font-size: 1.5rem; }
        .info-page-content h3 { font-size: 1.25rem; }
        .info-page-content p { margin-bottom: 1.5em; }
        .info-page-content img {
           border-radius: 1.5rem;
           margin: 2rem 0;
           box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
        }
        .jobs-grid {
           display: grid;
           grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
           gap: 1.5rem;
           margin-top: 2rem;
        }
        .job-card {
           background: #f8fafc;
           padding: 2rem;
           border-radius: 2rem;
           border: 1px solid #f1f5f9;
           transition: all 0.3s ease;
        }
        .job-card:hover {
           background: #ffffff;
           box-shadow: 0 10px 30px -10px rgba(79, 70, 229, 0.1);
           border-color: #e0e7ff;
           transform: translateY(-5px);
        }
        .job-card h3 {
           margin-top: 0 !important;
           color: #4f46e5 !important;
           font-size: 1.1rem !important;
        }
        .job-card p {
           font-size: 0.9rem !important;
           color: #64748b !important;
           margin-bottom: 1.5rem !important;
        }
        .job-card .btn {
           display: inline-block;
           padding: 0.75rem 1.5rem;
           background: #4f46e5;
           color: white !important;
           text-decoration: none !important;
           border-radius: 1rem;
           font-size: 0.8rem;
           font-weight: 900;
           text-transform: uppercase;
           letter-spacing: 0.05em;
           transition: all 0.2s;
        }
        .job-card .btn:hover {
           background: #4338ca;
           box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.2);
        }
      `}</style>
    </div>
  );
}
