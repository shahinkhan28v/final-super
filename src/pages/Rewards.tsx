import React from 'react';
import { motion } from 'motion/react';
import { 
  Clipboard, 
  Check, 
  FileText, 
  Globe, 
  Gamepad2, 
  Download, 
  Star,
  ChevronRight,
  TrendingUp,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { addEarnings } from '../lib/dataService';
import { useState } from 'react';
import { cn } from '../lib/utils';

export default function Rewards() {
  const { profile } = useAuth();
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});

  const handleClaim = async (id: string, name: string, points: number) => {
    if (!profile?.uid) return;
    if (claimed[id]) return;
    
    try {
      await addEarnings(profile.uid, name, points, 'task');
      setClaimed(prev => ({ ...prev, [id]: true }));
    } catch (err) {
      console.error(err);
    }
  };

  const tasks = [
    { id: 't1', icon: FileText, title: 'Complete Survey', desc: 'Answer simple profile questions', points: 250, type: 'survey', color: 'text-emerald-600 bg-emerald-50' },
    { id: 't2', icon: Globe, title: 'Visit Website', desc: 'Browse for 30 seconds', points: 100, type: 'web', color: 'text-blue-600 bg-blue-50' },
    { id: 't3', icon: Gamepad2, title: 'Play Game', desc: 'Spend 5 minutes playing', points: 500, type: 'game', color: 'text-purple-600 bg-purple-50' },
    { id: 't4', icon: Download, title: 'App Install', desc: 'Install and open for 1 minute', points: 1000, type: 'install', color: 'text-amber-600 bg-amber-50' },
    { id: 't5', icon: Star, title: 'Leave Review', desc: 'Rate us on the App Store', points: 300, type: 'review', color: 'text-rose-600 bg-rose-50' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Reward Shop</h2>
        <div className="flex items-center gap-2 bg-indigo-50 px-2 py-1 rounded-md">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          <span className="text-[10px] font-bold text-indigo-700 uppercase">New Tasks Available</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {tasks.map((task, idx) => (
          <motion.div 
            key={task.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-4 relative overflow-hidden group shadow-sm transition-all hover:border-indigo-300"
          >
            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center shrink-0", task.color.replace('emerald', 'indigo').replace('blue', 'indigo').replace('purple', 'indigo').replace('amber', 'indigo').replace('rose', 'indigo'))}>
              <task.icon className="w-6 h-6" />
            </div>
            
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 text-sm leading-tight">{task.title}</h4>
              <p className="text-[10px] text-slate-500 font-medium">{task.desc}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-indigo-600 font-black text-xs">+{task.points} PTS</span>
              </div>
            </div>

            <button 
              onClick={() => handleClaim(task.id, task.title, task.points)}
              disabled={claimed[task.id]}
              className={cn(
                "h-9 px-4 rounded-lg flex items-center justify-center transition-all font-bold text-xs uppercase tracking-tight",
                claimed[task.id] 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                  : "bg-indigo-600 text-white shadow-md shadow-indigo-100 active:scale-95 hover:bg-indigo-700"
              )}
            >
              {claimed[task.id] ? <Check className="w-4 h-4" /> : 'Claim'}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 p-6 rounded-2xl text-white flex flex-col items-center text-center gap-3 relative overflow-hidden shadow-lg">
         <div className="absolute top-[-10%] right-[-5%] opacity-10">
            <LayoutGrid className="w-32 h-32" />
         </div>
         <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md relative z-10">
            <LayoutGrid className="w-6 h-6 text-indigo-300" />
         </div>
         <div className="relative z-10">
           <h3 className="text-lg font-black tracking-tight">Partner Offer Wall</h3>
           <p className="text-indigo-200 text-[10px] font-medium uppercase tracking-widest mt-1">Earn Massive Rewards</p>
         </div>
         <p className="text-indigo-100/70 text-[11px] max-w-[240px] relative z-10">Complete premium offers, surveys, and app installs from our curated partners.</p>
         <button className="bg-white text-indigo-900 px-6 py-2.5 rounded-lg font-bold text-xs shadow-xl active:scale-95 transition-all relative z-10 hover:bg-indigo-50">Explore Offers</button>
      </div>
    </div>
  );
}
