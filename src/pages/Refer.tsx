import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Copy, 
  Check, 
  Gift,
  ArrowRight,
  TrendingUp,
  Share2,
  ChevronRight,
  ChevronDown,
  Coins,
  History,
  Network
} from 'lucide-react';
import { cn } from '../lib/utils';
import { getAppSettings, getReferralsWithStats } from '../lib/dataService';
import { AppSettings, UserProfile } from '../types';

interface ReferralWithBonus extends UserProfile {
  earnedFromUser: number;
}

export default function Refer() {
  const { profile } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [referrals, setReferrals] = useState<ReferralWithBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [level2Referrals, setLevel2Referrals] = useState<Record<string, ReferralWithBonus[]>>({});

  useEffect(() => {
    getAppSettings().then(setSettings);
    if (profile?.uid) {
      loadReferrals();
    }
  }, [profile?.uid]);

  const loadReferrals = async () => {
    setLoading(true);
    const data = await getReferralsWithStats(profile!.uid);
    setReferrals(data as ReferralWithBonus[]);
    setLoading(false);
  };

  const toggleLevel2 = async (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }

    if (!level2Referrals[userId]) {
      const data = await getReferralsWithStats(userId);
      setLevel2Referrals(prev => ({ ...prev, [userId]: data as ReferralWithBonus[] }));
    }
    setExpandedUser(userId);
  };

  const shareUrl = `${window.location.origin}/?ref=${profile?.referralCode || ''}`;

  const handleCopyLink = () => {
    if (profile?.referralCode) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyCode = () => {
    if (profile?.referralCode) {
      navigator.clipboard.writeText(profile.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const mlmLevels = [
    { level: 'Level 1', count: profile?.referralCountL1 || 0, label: 'Direct', color: 'bg-indigo-600' },
    { level: 'Level 2', count: profile?.referralCountL2 || 0, label: 'Indirect', color: 'bg-emerald-500' },
    { level: 'Level 3', count: profile?.referralCountL3 || 0, label: 'Bonus', color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6 pb-20 max-w-lg mx-auto">
      <div className="text-center space-y-1 mb-8 pt-4">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Refer & Earn</h2>
        <p className="text-slate-500 text-sm font-medium">Build your network and earn passive income!</p>
      </div>

      {/* MLM Stats Overview */}
      <div className="grid grid-cols-3 gap-3">
        {mlmLevels.map((lvl, index) => (
          <div key={index} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-2">
             <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/5", lvl.color)}>
                <Users className="w-5 h-5" />
             </div>
             <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lvl.level}</p>
                <p className="text-lg font-black text-slate-800">{lvl.count}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Network Stats Card */}
      <div className="bg-indigo-600 rounded-[2.5rem] p-6 text-white shadow-xl shadow-indigo-100 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
               <Network className="w-6 h-6 text-white" />
            </div>
            <div>
               <h3 className="text-lg font-black tracking-tight leading-none">Total Referrals</h3>
               <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mt-1">Full Network Data</p>
            </div>
         </div>
         <div className="text-right">
            <p className="text-2xl font-black">{(profile?.referralCountL1 || 0) + (profile?.referralCountL2 || 0)}</p>
            <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest leading-none">Members</p>
         </div>
      </div>

      {/* Dedicated Referral Code Box */}
      <div className="bg-white p-6 rounded-[2.5rem] border-4 border-dashed border-indigo-100 flex flex-col items-center gap-4 shadow-sm relative group overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
           <Gift className="w-12 h-12 text-indigo-600" />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Your Referral Code</p>
        <div className="flex items-center gap-4">
           <div className="bg-indigo-50 px-8 py-4 rounded-3xl border-2 border-indigo-100">
              <code className="text-4xl font-black tracking-[0.2em] text-indigo-700">{profile?.referralCode || '------'}</code>
           </div>
           <button 
             onClick={handleCopyCode}
             className="w-14 h-14 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-90 transition-all"
           >
             {copiedCode ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
           </button>
        </div>
        {copiedCode && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-black text-indigo-500 uppercase tracking-widest"
          >
            Code Copied to Clipboard!
          </motion.p>
        )}
      </div>

      {/* Referral Link Card */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full"></div>
        
        <div className="relative z-10 flex flex-col items-center gap-6">
           <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-white border border-white/20">
              <Share2 className="w-10 h-10" />
           </div>

           <div className="text-center space-y-2 w-full">
              <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.2em]">Invitation Link</p>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 pl-4 rounded-2xl w-full text-left overflow-hidden">
                 <code className="text-xs font-bold text-white truncate flex-1 opacity-80">{shareUrl}</code>
                 <button 
                   onClick={handleCopyLink}
                   className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center hover:bg-indigo-600 transition-all active:scale-90 shrink-0"
                 >
                   {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* My Network Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="font-black text-slate-800 tracking-tight">Total Referrals</h3>
          </div>
          <span className="text-[10px] font-black text-slate-400 border border-slate-200 px-2 py-1 rounded-md uppercase tracking-widest bg-white shadow-sm">
            {profile?.referralCountL1 || 0} Direct
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : referrals.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm text-center space-y-4">
             <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8" />
             </div>
             <div>
                <p className="text-sm font-bold text-slate-800">No network yet</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Share your code to start earning!</p>
             </div>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((user) => (
              <div key={user.uid} className="space-y-2">
                <div 
                  onClick={() => toggleLevel2(user.uid)}
                  className={cn(
                    "bg-white p-4 rounded-3xl border transition-all duration-300 cursor-pointer group",
                    expandedUser === user.uid ? "border-indigo-200 shadow-indigo-100 shadow-lg ring-1 ring-indigo-50" : "border-slate-100 hover:border-indigo-100 shadow-sm"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0">
                        {user.profilePic ? (
                          <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className={cn("w-full h-full flex items-center justify-center font-black text-xs", 
                            user.points > 1000 ? "bg-amber-100 text-amber-600" : "bg-slate-200 text-slate-500"
                          )}>
                            {user.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-sm font-black text-slate-800 tracking-tight line-clamp-1">{user.name}</h4>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                             <Coins className="w-3 h-3" />
                             <span>{user.points.toLocaleString()} pts</span>
                          </div>
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                          <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">
                            L1 Referral
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="text-right">
                          <p className="text-xs font-black text-emerald-600">+{user.earnedFromUser}</p>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Commission</p>
                       </div>
                       <div className={cn("p-1.5 rounded-lg bg-slate-50 text-slate-400 transition-transform", expandedUser === user.uid && "rotate-90 bg-indigo-50 text-indigo-600")}>
                          <ChevronRight className="w-4 h-4" />
                       </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedUser === user.uid && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden ml-6 space-y-2 border-l-2 border-indigo-50 pl-4"
                    >
                      <div className="pb-2">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Network className="w-3 h-3" />
                          {user.name.split(' ')[0]}'s Network (Level 2)
                        </p>
                      </div>
                      
                      {!level2Referrals[user.uid] ? (
                        <div className="h-10 bg-slate-50 animate-pulse rounded-2xl" />
                      ) : level2Referrals[user.uid].length === 0 ? (
                        <div className="p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center">
                           <p className="text-[10px] font-bold text-slate-400 italic">No level 2 referrals found</p>
                        </div>
                      ) : (
                        level2Referrals[user.uid].map((l2) => (
                          <div key={l2.uid} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-400">
                                   {l2.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                   <p className="text-[11px] font-bold text-slate-700">{l2.name}</p>
                                   <p className="text-[9px] font-medium text-slate-400">{l2.points} Points</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-black text-emerald-600">+{l2.earnedFromUser}</p>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">L2 Profit</p>
                             </div>
                          </div>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Commission Structure */}
      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
         <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Commission</h4>
         </div>
         <div className="space-y-2">
            {[
              { label: 'Level 1 (Direct)', value: `${settings?.mlmLevel1Percent || 10}%` },
              { label: 'Level 2 (Indirect)', value: `${settings?.mlmLevel2Percent || 5}%` },
              { label: 'Level 3 (Bonus)', value: `${settings?.mlmLevel3Percent || 2}%` },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 px-4">
                 <span className="text-xs font-bold text-slate-600">{row.label}</span>
                 <span className="text-xs font-black text-indigo-600">{row.value}</span>
              </div>
            ))}
         </div>
         <p className="text-[10px] text-slate-500 font-medium text-center mt-4">
           Passive earnings are calculated automatically on every task your network completes.
         </p>
      </div>
    </div>
  );
}
