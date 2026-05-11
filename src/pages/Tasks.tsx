import React, { useEffect, useState } from 'react';
import { 
  Globe, 
  Youtube, 
  FileText, 
  Smartphone, 
  CheckCircle, 
  ArrowRight, 
  Clock,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Gift,
  X,
  Zap,
  Info
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getAllTasks, getUserTasks, startUserTask, verifyUserTask, getAppSettings } from '../lib/dataService';
import { Task, UserTask, TaskStatus, AppSettings } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function TaskList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userTasks, setUserTasks] = useState<UserTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  
  const [showAdPopup, setShowAdPopup] = useState<{ active: boolean, task: Task | null }>({ active: false, task: null });

  const loadData = async () => {
    if (!user) return;
    const [tData, utData, sData] = await Promise.all([
      getAllTasks(true),
      getUserTasks(user.uid),
      getAppSettings()
    ]);
    if (tData) {
      // Client side filter for extra protection
      const now = new Date();
      setTasks(tData.filter(t => !t.expiresAt || new Date(t.expiresAt) > now));
    }
    if (utData) setUserTasks(utData);
    if (sData) setSettings(sData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const getTaskStatus = (taskId: string): TaskStatus => {
    const ut = userTasks.find(t => t.taskId === taskId);
    return ut ? ut.status : 'pending';
  };

  const handleTaskAction = (task: Task) => {
    if (settings?.adsterraTaskPopupBanner) {
      setShowAdPopup({ active: true, task });
    } else {
      handleFinalStart(task);
    }
  };

  const handleFinalStart = async (task: Task) => {
    if (!user || !task.id) return;
    setShowAdPopup({ active: false, task: null });
    await startUserTask(user.uid, task.id);
    window.open(task.targetUrl, '_blank');
    if (settings?.adsterraTaskPopupBanner) {
      window.open(settings.adsterraTaskPopupBanner, '_blank');
    }
    await loadData();
  };

  const handleVerifyTask = async (task: Task) => {
    if (!user || !task.id) return;
    setVerifying(task.id);
    const result = await verifyUserTask(user.uid, task);
    if (result.success) {
      await loadData();
      alert(result.message);
    } else {
      alert(result.message);
    }
    setVerifying(null);
  };

  function Countdown({ date, onComplete }: { date: string, onComplete: () => void }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(date).getTime();
      const diff = target - now;

      if (diff <= 0) {
        clearInterval(timer);
        onComplete();
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [date, onComplete]);

  return <span>{timeLeft || 'Ending...'}</span>;
}

const getTypeIcon = (type: string) => {
    switch(type) {
      case 'visit_website': return <Globe className="w-5 h-5" />;
      case 'watch_youtube': return <Youtube className="w-5 h-5" />;
      case 'submit_form': return <FileText className="w-5 h-5" />;
      case 'download_app': return <Smartphone className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  if (loading) return (
    <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-widest">Loading Rewards...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20">
         <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tight mb-2">Reward Marketplace</h1>
            <p className="text-slate-400 text-sm font-medium">Complete daily missions to fuel your points balance.</p>
         </div>
         <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-[30deg]">
            <Gift className="w-48 h-48 text-indigo-400" />
         </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tasks.map((task) => {
          const status = getTaskStatus(task.id!);
          return (
            <div key={task.id} className={cn(
              "bg-white p-5 rounded-3xl shadow-sm border-2 transition-all flex flex-col sm:flex-row sm:items-center gap-4",
              status === 'completed' ? "border-emerald-100 bg-emerald-50/20" : "border-slate-50 hover:border-indigo-100"
            )}>
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                status === 'completed' ? "bg-emerald-100 text-emerald-600" : "bg-indigo-50 text-indigo-600"
              )}>
                {status === 'completed' ? <CheckCircle className="w-7 h-7" /> : getTypeIcon(task.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-800 text-lg leading-tight truncate">{task.title}</h3>
                  <span className="text-[9px] font-black uppercase tracking-tight text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                    {task.category}
                  </span>
                  {task.expiresAt && (
                    <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-tight text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 ml-auto">
                       <Clock className="w-2.5 h-2.5" />
                       <Countdown date={task.expiresAt} onComplete={loadData} />
                    </div>
                  )}
                </div>
                <p className="text-slate-500 text-xs font-medium line-clamp-1">{task.description}</p>
                <div className="flex items-center gap-4 mt-2">
                   <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {task.rewardPoints} Pts
                   </div>
                   <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      {task.requiredSeconds}s Wait
                   </div>
                </div>
              </div>

              <div className="flex sm:flex-col gap-2 shrink-0">
                {status === 'pending' && (
                  <button 
                    onClick={() => handleTaskAction(task)}
                    className="flex-1 sm:w-32 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    Start Task
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
                {status === 'started' && (
                  <button 
                    onClick={() => handleVerifyTask(task)}
                    disabled={verifying === task.id}
                    className="flex-1 sm:w-32 py-3 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-100 hover:bg-amber-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {verifying === task.id ? 'Verifying...' : 'Verify Now'}
                    <ShieldCheck className="w-3 h-3" />
                  </button>
                )}
                {status === 'completed' && (
                  <div className="sm:w-32 py-3 bg-emerald-100 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-emerald-200">
                    Claimed
                    <CheckCircle className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
             <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
             <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs">No Active Tasks</h3>
             <p className="text-sm text-slate-500 mt-2">Check back later for new earning opportunities.</p>
          </div>
        )}
      </div>

      {/* Ad Modal */}
      <AnimatePresence>
        {showAdPopup.active && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowAdPopup({ active: false, task: null })}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
             >
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-center relative overflow-hidden">
                   <div className="relative z-10 space-y-4">
                      <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto border border-white/20 backdrop-blur-md">
                         <Zap className="w-8 h-8 text-white fill-white animate-pulse" />
                      </div>
                      <div>
                        <h2 className="text-white font-black text-xl tracking-tight">Accessing Reward Pool</h2>
                        <p className="text-indigo-100/70 text-[10px] font-bold uppercase tracking-widest mt-1">Verifying Human Presence</p>
                      </div>
                   </div>
                   <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                </div>

                <div className="p-8 space-y-6">
                   <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                         <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                         <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                            Click 'Enable Reward' to start this mission. You will be redirected to an advertisement stream first to fund your points.
                         </p>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <button 
                        onClick={() => showAdPopup.task && handleFinalStart(showAdPopup.task)}
                        className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2"
                      >
                         Enable Reward
                         <ArrowRight className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setShowAdPopup({ active: false, task: null })}
                        className="w-full py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-600 transition-colors"
                      >
                         Cancel
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
