import React, { useEffect } from 'react';
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
  LayoutGrid,
  RefreshCw,
  Clock,
  HelpCircle,
  Gift,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Send,
  Smartphone,
  UserPlus,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { addEarnings, subscribeToAllRewardTasks, getUserRewardTasks, startRewardTask, claimRewardTask } from '../lib/dataService';
import { useState } from 'react';
import { cn } from '../lib/utils';
import { RewardTask, UserRewardTaskStatus } from '../types';
import { useNavigate } from 'react-router-dom';

const ICON_MAP: Record<string, any> = {
  FileText,
  Globe,
  Gamepad2,
  Download,
  Star,
  Clipboard,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Send,
  Smartphone,
  UserPlus,
  Gift: Star
};

export default function Rewards() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<RewardTask[]>([]);
  const [userTasks, setUserTasks] = useState<Record<string, UserRewardTaskStatus>>({});
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToAllRewardTasks((data) => {
      setTasks(data.filter(t => t.isActive));
      setLoading(false);
    });

    if (profile?.uid) {
      getUserRewardTasks(profile.uid).then(setUserTasks);
    }

    return () => unsub();
  }, [profile?.uid]);

  const handleAction = async (task: RewardTask) => {
    if (!profile?.uid) return;
    const status = userTasks[task.id!];

    if (!status) {
      // Start task
      if (task.link) {
        window.open(task.link, '_blank');
      }
      await startRewardTask(profile.uid, task.id!);
      const updated = await getUserRewardTasks(profile.uid);
      setUserTasks(updated);
      alert("Verification started! Please wait for the required time and keep the browser open.");
    } else if (status.status === 'verifying') {
      // Claim task
      setClaiming(task.id!);
      try {
        const result = await claimRewardTask(profile.uid, task);
        if (result.success) {
          const updated = await getUserRewardTasks(profile.uid);
          setUserTasks(updated);
        } else {
          alert(result.message);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setClaiming(null);
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400">
      <RefreshCw className="w-8 h-8 animate-spin mb-4" />
      <p className="font-bold text-xs uppercase tracking-widest">Sycing Shop Inventory...</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Reward Shop</h2>
        <button 
           onClick={() => navigate('/support')}
           className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          <span className="text-[10px] font-bold text-indigo-700 uppercase">Support</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {tasks.map((task, idx) => {
          const status = userTasks[task.id!];
          const Icon = ICON_MAP[task.icon || 'Gift'] || Star;
          const isCompleted = status?.status === 'completed';
          const isVerifying = status?.status === 'verifying';

          return (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-4 relative overflow-hidden group shadow-sm transition-all hover:border-indigo-300",
                isCompleted && "opacity-60 bg-slate-50"
              )}
            >
              <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
                <Icon className="w-6 h-6" />
              </div>
              
              <div className="flex-1">
                <h4 className="font-black text-slate-800 text-sm leading-tight">{task.title}</h4>
                <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{task.description}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-indigo-600 font-black text-xs">+{task.points} PTS</span>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                     <Clock className="w-3 h-3" />
                     {task.waitMinutes}min
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleAction(task)}
                disabled={isCompleted || claiming === task.id}
                className={cn(
                  "h-9 px-5 rounded-lg flex items-center justify-center transition-all font-black text-[10px] uppercase tracking-wider relative overflow-hidden",
                  isCompleted 
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                    : isVerifying
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100 animate-pulse"
                      : "bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : 
                 isVerifying ? 'Verifying...' : 
                 claiming === task.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Get Points'}
                
                {isVerifying && (
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: '100%' }}
                     transition={{ duration: task.waitMinutes * 60, ease: 'linear' }}
                     className="absolute bottom-0 left-0 h-0.5 bg-white/40"
                   />
                )}
              </button>
            </motion.div>
          );
        })}
        
        {tasks.length === 0 && (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center">
             <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-6 h-6 text-slate-300" />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Active Rewards Currently</p>
          </div>
        )}
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
