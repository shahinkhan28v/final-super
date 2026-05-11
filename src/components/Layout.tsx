import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Gift, 
  Users, 
  User, 
  MoreHorizontal, 
  ArrowLeft,
  Settings,
  History as HistoryIcon,
  Wallet,
  LogOut,
  HelpCircle,
  FileText,
  ShieldCheck,
  ChevronLeft,
  Smartphone,
  Download,
  MoreVertical,
  Info as InfoIcon
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useLanguage } from '../lib/LanguageContext';
import { getAppSettings } from '../lib/dataService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { AppSettings } from '../types';
import BackButton from './BackButton';

export default function Layout() {
  const { locale, t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    async function load() {
      const data = await getAppSettings();
      setSettings(data);
    }
    load();
  }, []);

  const isHome = location.pathname === '/';

  const menuItems = [
    { name: t('home'), icon: Home, path: '/' },
    { name: t('earning_tasks'), icon: ShieldCheck, path: '/tasks' },
    { name: t('reward_shop'), icon: Gift, path: '/rewards' },
    { name: t('refer'), icon: Users, path: '/refer' },
    { name: t('support'), icon: HelpCircle, path: '/support' },
    { name: t('terms_of_use'), icon: FileText, path: '/terms' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-indigo-700 h-14 flex items-center justify-between px-6 shadow-md sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-4 text-white">
          {!isHome ? (
            <button 
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-indigo-600 rounded-md transition-colors flex items-center gap-1"
              id="header-back-button"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-indigo-600 rounded-md transition-colors"
              id="header-menu-button"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          <span className="font-bold text-xl tracking-tight">PointHub</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Three-dot dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className="p-2 hover:bg-indigo-600 rounded-md transition-colors text-white"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {isMoreOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMoreOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                  >
                    <div className="p-2">
                      {[
                        { label: t('jobs_tasks'), path: '/info/jobs', icon: Gift },
                        { label: t('our_network'), path: '/info/network', icon: Users },
                        { label: t('payout_info'), path: '/info/payouts', icon: Wallet },
                        { label: t('support_info'), path: '/info/support', icon: HelpCircle },
                        { label: t('terms_of_use'), path: '/info/terms', icon: FileText },
                      ].map((item) => (
                        <button
                          key={item.path}
                          onClick={() => {
                            navigate(item.path);
                            setIsMoreOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl transition-colors"
                        >
                          <item.icon className="w-4 h-4 text-indigo-500" />
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-3 text-white cursor-pointer hover:bg-indigo-600 p-1 px-2 rounded-lg transition-colors"
          >
          <div className="text-right hidden sm:block">
            <p className="text-[10px] opacity-80 uppercase font-bold tracking-wider">{t('welcome_back')}</p>
            <p className="text-sm font-semibold leading-tight">{profile?.name || t('account')}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-300 border-2 border-white flex items-center justify-center text-indigo-800 font-bold shadow-sm overflow-hidden shrink-0">
            {profile?.profilePic ? (
              <img src={profile.profilePic} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              profile?.name?.[0] || 'U'
            )}
          </div>
        </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden pt-4 pb-20 px-4 max-w-4xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center shrink-0 z-30 max-w-4xl mx-auto">
        <NavButton to="/" icon={Home} label={t('home')} />
        <NavButton to="/tasks" icon={Gift} label={t('tasks')} />
        <NavButton to="/refer" icon={Users} label={t('refer')} />
        <NavButton to="/account" icon={Settings} label={t('account')} />
      </nav>

      {/* Side Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <span className="font-bold text-xl text-emerald-600">{t('menu')}</span>
                <button onClick={() => setIsMenuOpen(false)}>
                  <X className="w-6 h-6 text-zinc-400" />
                </button>
              </div>
              <div className="flex-1 py-4 overflow-y-auto">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 transition-colors text-zinc-600 hover:text-emerald-600 group"
                  >
                    <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}

                {settings?.appDownloadUrl && (
                  <div className="mx-4 mt-6">
                    <a 
                      href={settings.appDownloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-indigo-600 rounded-2xl p-6 text-white flex flex-col gap-3 relative overflow-hidden shadow-lg group block"
                    >
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Smartphone className="w-16 h-16" />
                      </div>
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-sm uppercase tracking-wider">{t('official_app')}</h4>
                        <p className="text-indigo-100 text-[10px] font-medium leading-relaxed mt-1">{t('app_desc')}</p>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mt-2 border-t border-white/10 pt-3">
                         <Download className="w-3 h-3" />
                         {t('download_now')}
                      </div>
                    </a>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-zinc-100">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-4 text-rose-600 font-medium w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Profile Drawer */}
      <AnimatePresence>
        {isProfileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <span className="font-bold text-xl text-emerald-600">{t('profile')}</span>
                <button onClick={() => setIsProfileOpen(false)}>
                  <X className="w-6 h-6 text-zinc-400" />
                </button>
              </div>
              
              <div className="p-6 flex flex-col items-center border-b border-zinc-100">
                <div className="w-24 h-24 rounded-full border-4 border-emerald-50 mb-4 overflow-hidden shadow-inner">
                   {profile?.profilePic ? (
                    <img src={profile.profilePic} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-white text-3xl font-bold">
                      {profile?.name?.[0]}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-zinc-900">{profile?.name}</h3>
                <p className="text-zinc-500 text-sm mb-4">{profile?.email}</p>
                
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-emerald-50 p-3 rounded-2xl text-center">
                    <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider mb-1">{t('points')}</p>
                    <p className="text-lg font-bold text-emerald-700">{profile?.points}</p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-2xl text-center">
                    <p className="text-xs text-amber-600 font-medium uppercase tracking-wider mb-1">{t('total')}</p>
                    <p className="text-lg font-bold text-amber-700">${((profile?.totalEarnings || 0) / (settings?.pointsPerUsd || settings?.conversionRate || 100)).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 py-4 px-2">
                <ProfileLink to="/withdraw" icon={Wallet} label={t('withdraw')} onClick={() => setIsProfileOpen(false)} />
                <ProfileLink to="/history" icon={HistoryIcon} label={t('history')} onClick={() => setIsProfileOpen(false)} />
                <ProfileLink to="/account" icon={Settings} label={t('account')} onClick={() => setIsProfileOpen(false)} />
              </div>

              <div className="p-6 text-center text-xs text-zinc-400">
                Joined: {profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString() : '-'}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ to, icon: Icon, label }: { to: string, icon: any, label: string }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => cn(
        "flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-200 h-full",
        isActive ? "text-indigo-600 bg-indigo-50/50" : "text-slate-400 hover:text-indigo-500"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </NavLink>
  );
}

function ProfileLink({ to, icon: Icon, label, onClick }: { to: string, icon: any, label: string, onClick: () => void }) {
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className="flex items-center justify-between p-4 hover:bg-zinc-50 rounded-2xl transition-colors group mb-1"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-semibold text-zinc-700 group-hover:text-zinc-900">{label}</span>
      </div>
      <ArrowLeft className="w-5 h-5 text-zinc-300 rotate-180" />
    </Link>
  );
}
