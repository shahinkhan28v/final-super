import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { processDailyCheckIn, addEarnings, subscribeToAppSettings } from '../lib/dataService';
import { motion } from 'motion/react';
import { 
  Zap, 
  PlayCircle, 
  CircleHelp, 
  Gift,
  RotateCw, 
  Share2, 
  Calendar,
  ChevronRight,
  TrendingUp,
  Target,
  ShieldCheck,
  Settings,
  Megaphone,
  CreditCard,
  FileText,
  Shield,
  ExternalLink,
  Puzzle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import BannerSlider from '../components/BannerSlider';
import { AppSettings } from '../types';

export default function Dashboard() {
  const { profile } = useAuth();
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInMsg, setCheckInMsg] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    const unsub = subscribeToAppSettings((data) => {
      setSettings(data);
    });
    return () => unsub();
  }, []);

  const handleDailyCheckIn = async () => {
    if (!profile?.uid) return;
    setCheckingIn(true);
    try {
      const bonus = await processDailyCheckIn(profile.uid);
      if (bonus) {
        setCheckInMsg(`Claimed ${bonus} bonus points!`);
      } else {
        setCheckInMsg('Already checked in today.');
      }
      setTimeout(() => setCheckInMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <BannerSlider />
      
      {/* Promotional Marquee */}
      {settings?.promotionalText && (
        <div className="bg-indigo-600 overflow-hidden py-2 rounded-xl shadow-lg shadow-indigo-100 flex items-center">
          <div className="flex items-center gap-2 px-4 border-r border-indigo-400 shrink-0">
             <Megaphone className="w-4 h-4 text-white animate-bounce" />
             <span className="text-[10px] font-black text-indigo-100 uppercase tracking-widest">News</span>
          </div>
          <div className="flex-1 overflow-hidden">
             <motion.p 
               animate={{ x: [400, -800] }}
               transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
               className="whitespace-nowrap text-xs font-black text-white"
             >
               {settings.promotionalText}
             </motion.p>
          </div>
        </div>
      )}

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-indigo-500">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Balance</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-black text-indigo-700">{profile?.points || 0}</p>
            <span className="text-[10px] font-medium text-slate-400">pts</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">≈ ${((profile?.points || 0) / (settings?.pointsPerUsd || settings?.conversionRate || 100)).toFixed(2)} USD</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-emerald-500">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Earnings</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-black text-emerald-600">+{profile?.totalEarnings || 0}</p>
            <span className="text-[10px] font-medium text-slate-400">pts</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">≈ ৳{((profile?.totalEarnings || 0) / (settings?.pointsPerBdt || 1)).toFixed(2)} BDT</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Referrals</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-black text-orange-600">{(profile?.referralCountL1 || 0) + (profile?.referralCountL2 || 0)}</p>
            <span className="text-[10px] font-medium text-slate-400">Total</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">L1 & L2 Network</p>
        </div>
      </div>

      {/* Daily Bonus Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Daily Check-in</h3>
            <p className="text-slate-400 text-[10px] font-medium uppercase">Earn extra pts daily</p>
          </div>
        </div>
        <button 
          onClick={handleDailyCheckIn}
          disabled={checkingIn}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
        >
          {checkingIn ? '...' : (checkInMsg || 'Claim')}
        </button>
      </div>

      {/* Adsterra Dashboard Banner */}
      {settings?.adsterraDashboardBanner && (
        <a 
          href={settings.adsterraDashboardBanner} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full bg-slate-100 rounded-xl overflow-hidden border-2 border-indigo-50/50 hover:border-indigo-200 transition-colors"
        >
           <div className="py-8 px-6 bg-gradient-to-r from-slate-900 to-indigo-950 flex flex-col items-center justify-center text-center gap-2 group">
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">Sponsored Result</span>
              <h4 className="text-white font-black text-lg tracking-tight group-hover:scale-105 transition-transform">Get Exclusive Rewards Now!</h4>
              <p className="text-slate-400 text-[10px] font-bold uppercase mt-1">Click to reveal special bonus code</p>
              <div className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <ExternalLink className="w-3 h-3" />
                 Visit Offer
              </div>
           </div>
        </a>
      )}

      {/* Interactive Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ActionCard 
          icon={Puzzle} 
          title="Daily Quiz" 
          desc="Test your knowledge and earn rewards" 
          badge="Interactive"
          path="/quizzes"
          isIndigo
        />
        <ActionCard 
          icon={Gift} 
          title="Task Center" 
          desc="Visit sites and watch videos" 
          badge="HOT"
          path="/tasks"
          isEmerald
        />
        <ActionCard 
          icon={RotateCw} 
          title="Lucky Wheel" 
          desc="Spin to win up to 500 points" 
          badge="LUCKY"
          path="/wheel"
          isOrange
        />
        <ActionCard 
          icon={Share2} 
          title="Refer & Earn" 
          desc="Get 10% of their earnings" 
          badge="POPULAR"
          path="/refer"
          isIndigo
          isGradient
        />
      </div>

      {/* Quick Section: Referral info */}
      <Link to="/refer" className="block bg-slate-900 p-6 rounded-2xl text-white relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Growth Program</span>
          </div>
          <h4 className="text-xl font-bold mb-1">Invite & Earn 500 Points</h4>
          <p className="text-slate-400 text-xs">Share your code with friends and get bonus.</p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12 transition-transform group-hover:scale-110">
            <Target className="w-40 h-40" />
        </div>
      </Link>

      {/* Dashboard Footer Component */}
      <DashboardFooter settings={settings} />

    </div>
  );
}

function DashboardFooter({ settings }: { settings: AppSettings | null }) {
  return (
    <footer className="mt-12 space-y-8 bg-white/50 rounded-3xl p-6 border border-slate-100 pb-20">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                   <Target className="w-4 h-4 text-white" />
                </div>
                <span className="font-black text-slate-800 text-sm uppercase tracking-tighter">Pointhub</span>
             </div>
             <p className="text-xs text-slate-500 leading-relaxed font-bold">
                {settings?.footerAbout || 'Pointhub is the leading micro-task reward platform.'}
             </p>
             <div className="flex flex-wrap gap-2 pt-2">
                {['BKash', 'Nagad', 'Rocket', 'Upay', 'Binance'].map(method => (
                  <span key={method} className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded border border-slate-200">
                    {method}
                  </span>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-4">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Platform</h5>
                <div className="flex flex-col gap-3">
                   <FooterLink to="/tasks" icon={Gift} label="Jobs" />
                   <FooterLink to="/refer" icon={Share2} label="Network" />
                   <FooterLink to="/withdraw" icon={CreditCard} label="Payouts" />
                </div>
             </div>
             <div className="space-y-4">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Governance</h5>
                <div className="flex flex-col gap-3">
                   <button onClick={() => alert(settings?.termsAndConditions || 'Terms not updated')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-[11px] font-bold">
                      <FileText className="w-3.5 h-3.5" />
                      Terms of Use
                   </button>
                   <button onClick={() => alert(settings?.privacyPolicy || 'Privacy policy not updated')} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-[11px] font-bold">
                      <Shield className="w-3.5 h-3.5" />
                      Privacy Shield
                   </button>
                   <FooterLink to="/support" icon={Settings} label="Support" />
                </div>
             </div>
          </div>
       </div>

       <div className="pt-8 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
             &copy; {new Date().getFullYear()} Pointhub System &bull; All Rights Reserved
          </p>
       </div>
    </footer>
  );
}

function FooterLink({ to, icon: Icon, label }: { to: string, icon: any, label: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-[11px] font-bold">
       <Icon className="w-3.5 h-3.5" />
       {label}
    </Link>
  );
}

function ActionCard({ 
  icon: Icon, 
  title, 
  desc, 
  badge, 
  path, 
  isIndigo, 
  isEmerald, 
  isOrange, 
  isGradient 
}: { 
  icon: any, 
  title: string, 
  desc: string, 
  badge: string, 
  path: string, 
  isIndigo?: boolean,
  isEmerald?: boolean, 
  isOrange?: boolean,
  isGradient?: boolean 
}) {
  return (
    <Link to={path} className={cn(
      "bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between overflow-hidden relative active:scale-95 transition-all group",
      isGradient && "bg-gradient-to-br from-white to-indigo-50"
    )}>
      <div className="z-10 relative">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <span className={cn(
            "text-[10px] px-2 py-0.5 rounded font-bold uppercase",
            isIndigo ? "bg-indigo-100 text-indigo-600" :
            isEmerald ? "bg-emerald-100 text-emerald-600" :
            isOrange ? "bg-orange-100 text-orange-600" :
            "bg-slate-100 text-slate-600"
          )}>
            {badge}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1 max-w-[80%]">{desc}</p>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
          isIndigo ? "bg-indigo-50 text-indigo-600" :
          isEmerald ? "bg-emerald-50 text-emerald-600" :
          isOrange ? "bg-orange-50 text-orange-600" :
          "bg-slate-50 text-slate-600"
        )}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="text-indigo-600">
           <ChevronRight className="w-5 h-5" />
        </div>
      </div>

      <div className="absolute -right-4 -bottom-4 opacity-[0.03] transition-transform group-hover:scale-125">
         <Icon className="w-20 h-20" />
      </div>
    </Link>
  );
}
