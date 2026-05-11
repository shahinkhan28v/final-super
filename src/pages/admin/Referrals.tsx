import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Share2, 
  Save, 
  TrendingUp, 
  Gift, 
  Target,
  Trophy,
  PieChart,
  Settings
} from 'lucide-react';
import { getAppSettings, updateAppSettings, getAllUsers } from '../../lib/dataService';
import { AppSettings, UserProfile } from '../../types';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export default function AdminReferrals() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [sData, uData] = await Promise.all([
      getAppSettings(),
      getAllUsers()
    ]);
    if (sData) setSettings(sData);
    if (uData) setUsers(uData);
    setLoading(false);
  }

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await updateAppSettings(settings);
      alert('Referral & MLM settings updated!');
    } catch (e) {
      alert('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) return (
    <div className="flex items-center justify-center min-h-[400px]">
       <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalReferrals = users.reduce((acc, u) => acc + (u.referralCountL1 || 0), 0);
  const topReferrers = [...users]
    .sort((a, b) => (b.referralCountL1 || 0) - (a.referralCountL1 || 0))
    .slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32">
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
             <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                MLM Architect
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] uppercase tracking-widest rounded-full border border-indigo-100">
                   Multi-Level Engine
                </span>
             </h1>
             <p className="text-slate-500 text-sm font-medium mt-1">Configure multi-level referral commissions and growth logistics</p>
          </div>
          
          <button 
            disabled={saving}
            onClick={handleSave}
            className="h-12 px-8 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
          >
             {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
             Commit Changes
          </button>
       </div>

       {/* Stats Grid */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Top Tier Users" value={users.length} color="indigo" />
          <StatCard icon={Share2} label="Network Links" value={totalReferrals} color="emerald" />
          <StatCard icon={TrendingUp} label="Growth Rate" value="+12%" color="blue" />
          <StatCard icon={PieChart} label="MLM Active" value="Level 3" color="orange" />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3">
                   <Settings className="w-6 h-6 text-indigo-600" />
                   <h2 className="font-black text-slate-800 text-lg tracking-tight uppercase">Base Logistics</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Direct Signup Bonus (PTS)</label>
                      <div className="relative">
                         <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <Gift className="w-4 h-4 text-indigo-600" />
                         </div>
                         <input 
                           type="number"
                           value={settings.referralBonus}
                           onChange={(e) => setSettings({ ...settings, referralBonus: Number(e.target.value) })}
                           className="w-full pl-16 pr-6 h-16 bg-slate-50 border-2 border-transparent rounded-[1.25rem] text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Daily Bonus Base (PTS)</label>
                      <div className="relative">
                         <div className="absolute left-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <Target className="w-4 h-4 text-indigo-600" />
                         </div>
                         <input 
                           type="number"
                           value={settings.dailyBonusBase}
                           onChange={(e) => setSettings({ ...settings, dailyBonusBase: Number(e.target.value) })}
                           className="w-full pl-16 pr-6 h-16 bg-slate-50 border-2 border-transparent rounded-[1.25rem] text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                         />
                      </div>
                   </div>
                </div>
             </div>

             <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-8 overflow-hidden relative">
                <div className="relative z-10 space-y-8">
                   <div className="flex items-center gap-3">
                      <PieChart className="w-6 h-6 text-indigo-400" />
                      <h2 className="font-black text-white text-lg tracking-tight uppercase">MLM Commission Structure</h2>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <MLMInput 
                        level="1" 
                        value={settings.mlmLevel1Percent} 
                        onChange={(v) => setSettings({ ...settings, mlmLevel1Percent: v })}
                        color="indigo"
                      />
                      <MLMInput 
                        level="2" 
                        value={settings.mlmLevel2Percent} 
                        onChange={(v) => setSettings({ ...settings, mlmLevel2Percent: v })}
                        color="blue"
                      />
                      <MLMInput 
                        level="3" 
                        value={settings.mlmLevel3Percent} 
                        onChange={(v) => setSettings({ ...settings, mlmLevel3Percent: v })}
                        color="emerald"
                      />
                   </div>

                   <p className="text-white/40 text-[10px] font-medium leading-relaxed italic border-t border-white/10 pt-4">
                      Commissions are calculated as a percentage of secondary user earnings. Level 1 is a direct referral, Level 2 is their referral, and Level 3 is the next downline tier.
                   </p>
                </div>
                
                <PieChart className="absolute -right-20 -bottom-20 w-80 h-80 text-white/5 opacity-50" />
             </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
             <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm space-y-6">
                <h3 className="font-black text-slate-800 text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                   <Trophy className="w-4 h-4 text-indigo-600" />
                   Network Leaders
                </h3>

                <div className="space-y-4">
                   {topReferrers.map((u, i) => (
                      <div key={u.uid} className="flex items-center gap-3 group">
                         <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            {i + 1}
                         </div>
                         <div className="flex-1">
                            <p className="text-[11px] font-black text-slate-800 line-clamp-1">{u.name}</p>
                            <p className="text-[9px] font-bold text-slate-400">{u.referralCountL1 || 0} Directs</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2rem] p-6 text-white space-y-2 relative overflow-hidden shadow-xl shadow-indigo-100">
                <div className="relative z-10">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">System Health</p>
                   <h4 className="font-black text-lg">Network verified</h4>
                   <p className="text-xs font-medium text-indigo-100/70 mt-2">All referral loops are protected by circularity guards.</p>
                </div>
                <Users className="absolute -right-6 -bottom-6 w-32 h-32 text-white/10" />
             </div>
          </div>
       </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colors: any = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-50",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50",
    blue: "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-50",
    orange: "bg-orange-50 text-orange-600 border-orange-100 shadow-orange-50",
  };

  return (
    <div className={cn("bg-white p-6 rounded-[2rem] border shadow-sm space-y-4", colors[color])}>
       <div className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center shadow-sm">
          <Icon className="w-5 h-5" />
       </div>
       <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-1">{label}</p>
          <h4 className="text-2xl font-black tracking-tight">{value}</h4>
       </div>
    </div>
  );
}

function MLMInput({ level, value, onChange, color }: { level: string, value: number, onChange: (v: number) => void, color: string }) {
  const colors: any = {
    indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30 ring-indigo-500/20",
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/30 ring-blue-500/20",
    emerald: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 ring-emerald-500/20",
  };

  return (
    <div className="space-y-3">
       <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Level {level}</span>
          <span className="text-[10px] font-black text-white">{value}%</span>
       </div>
       <div className="relative group">
          <input 
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className={cn(
              "w-full h-14 pr-4 pl-12 bg-white/5 border border-white/10 rounded-2xl text-sm font-black text-white focus:bg-white/10 focus:border-white/20 outline-none transition-all placeholder:text-white/20",
              "group-hover:border-white/20"
            )}
            placeholder="%"
          />
          <div className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center border text-[9px] font-black",
            colors[color]
          )}>
             L{level}
          </div>
       </div>
       <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(value, 100)}%` }}
            className="h-full bg-indigo-500"
          />
       </div>
    </div>
  );
}
