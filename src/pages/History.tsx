import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { getUserEarnings } from '../lib/dataService';
import { EarningLog, WithdrawalRequest } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  XCircle,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function History() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'earnings' | 'withdrawals'>('earnings');
  const [earnings, setEarnings] = useState<EarningLog[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;
    
    // Earnings remain one-time fetch or you can add snapshot later
    async function loadEarnings() {
      const eData = await getUserEarnings(profile!.uid);
      if (eData) setEarnings(eData);
    }
    loadEarnings();

    // Withdrawals real-time snapshot
    const wQuery = query(
      collection(db, 'withdrawals'),
      where('userId', '==', profile.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(wQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawalRequest));
      setWithdrawals(data);
      setLoading(false);
    }, (error) => {
      console.error("History fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.uid]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800 tracking-tight">Transaction History</h2>

      {/* Tabs */}
      <div className="bg-slate-100 p-1.5 rounded-xl border border-slate-200 flex shadow-inner">
        <button 
          onClick={() => setActiveTab('earnings')}
          className={cn(
            "flex-1 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-tight transition-all",
            activeTab === 'earnings' ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200" : "text-slate-400"
          )}
        >
          Earnings
        </button>
        <button 
          onClick={() => setActiveTab('withdrawals')}
          className={cn(
            "flex-1 py-1.5 rounded-lg font-bold text-[11px] uppercase tracking-tight transition-all",
            activeTab === 'withdrawals' ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200" : "text-slate-400"
          )}
        >
          Withdrawals
        </button>
      </div>

      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center pt-20 gap-3">
             <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Querying Records...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'earnings' ? (
              <motion.div 
                key="earnings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-4 py-2.5 font-medium">Source</th>
                        <th className="px-4 py-2.5 font-medium text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {earnings.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="py-8 px-4"><EmptyState icon={TrendingUp} label="No earnings yet" /></td>
                        </tr>
                      ) : (
                        earnings.map((e) => (
                          <tr key={e.id} className="hover:bg-indigo-50/30 transition-colors">
                            <td className="px-4 py-3">
                              <h4 className="font-bold text-slate-800 text-xs leading-tight">{e.taskName}</h4>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {new Date(e.timestamp).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-emerald-600 font-black text-xs">+{e.points}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="withdrawals"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-4 py-2.5 font-medium">Method</th>
                        <th className="px-4 py-2.5 font-medium">Status</th>
                        <th className="px-4 py-2.5 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {withdrawals.length === 0 ? (
                         <tr>
                           <td colSpan={3} className="py-8 px-4"><EmptyState icon={CreditCard} label="No withdrawals yet" /></td>
                         </tr>
                      ) : (
                        withdrawals.map((w) => (
                          <tr key={w.id} className="hover:bg-indigo-50/30 transition-colors">
                            <td className="px-4 py-3">
                              <h4 className="font-bold text-slate-800 text-xs leading-tight">{w.method}</h4>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {new Date(w.timestamp).toLocaleDateString()}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn(
                                "text-[9px] font-bold uppercase tracking-tight px-1.5 py-0.5 rounded shadow-sm",
                                w.status === 'pending' ? "bg-orange-100 text-orange-600" :
                                w.status === 'approved' ? "bg-emerald-100 text-emerald-600" :
                                "bg-rose-100 text-rose-600"
                              )}>
                                {w.status}
                              </span>
                              {w.status === 'rejected' && w.reason && (
                                <div className="mt-1 flex items-center gap-1 text-rose-400">
                                   <AlertCircle className="w-2.5 h-2.5" />
                                   <span className="text-[8px] font-bold truncate max-w-[80px]">{w.reason}</span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-slate-800 font-black text-xs">${w.amount / 100}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex flex-col items-center justify-center pt-20 text-center gap-4 opacity-30">
      <Icon className="w-16 h-16 text-zinc-300" />
      <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">{label}</p>
    </div>
  );
}
