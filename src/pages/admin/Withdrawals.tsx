import React, { useEffect, useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search,
  ExternalLink,
  MoreVertical,
  HelpCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { updateWithdrawalStatus, subscribeToAllUsers, subscribeToAllWithdrawals } from '../../lib/dataService';
import { WithdrawalRequest, UserProfile } from '../../types';
import { cn } from '../../lib/utils';

export default function AdminWithdrawals() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  useEffect(() => {
    const unsubUsers = subscribeToAllUsers((uData) => {
      setUsers(uData);
    });

    const unsubWithdrawals = subscribeToAllWithdrawals((data) => {
      setRequests(data);
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubWithdrawals();
    };
  }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    setProcessingId(id);
    try {
      await updateWithdrawalStatus(id, status, reason);
      setShowRejectModal(null);
      setRejectReason('');
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = requests.filter(r => activeTab === 'pending' ? r.status === 'pending' : r.status === activeTab);

  const getUsername = (uid: string) => users.find(u => u.uid === uid)?.name || 'Unknown User';

  return (
    <div className="space-y-6">
      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col gap-6">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                 <XCircle className="w-8 h-8" />
              </div>
              <div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tight">Reject Request</h3>
                 <p className="text-slate-500 text-sm font-medium mt-1">Please provide a reason for rejecting this payout. This will be visible to the user.</p>
              </div>
              <textarea 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Invalid account details, Suspicious activity..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-sm font-bold outline-none focus:border-rose-500 transition-all min-h-[100px] resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                 <button 
                   onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                   className="py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={() => handleAction(showRejectModal, 'rejected', rejectReason)}
                   disabled={!rejectReason.trim()}
                   className="py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-rose-700 disabled:opacity-50 transition-all"
                 >
                   Submit Reject
                 </button>
              </div>
           </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Payout Requests</h1>
          <p className="text-slate-500 text-sm font-medium">Review and process user withdrawal claims</p>
        </div>
        <div className="flex p-1 bg-slate-100 border border-slate-200 rounded-xl">
           {(['pending', 'approved', 'rejected'] as const).map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={cn(
                 "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-tight transition-all",
                 activeTab === tab ? "bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200" : "text-slate-400 hover:text-slate-600"
               )}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
             <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-xs font-bold uppercase tracking-widest text-center">Syncing transaction ledger...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-2 text-slate-300">
             <CreditCard className="w-12 h-12 opacity-20" />
             <p className="font-bold text-sm">No {activeTab} requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4 font-bold">Withdrawal Item</th>
                  <th className="px-6 py-4 font-bold">Request Time</th>
                  <th className="px-6 py-4 font-bold">Payable Amount</th>
                  <th className="px-6 py-4 font-bold">Method & Details</th>
                  <th className="px-6 py-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shadow-inner">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 leading-none">{getUsername(req.userId)}</h4>
                          <p className="text-[10px] text-slate-400 font-bold tracking-tight mt-1 uppercase">ID: {req.userId.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2 text-slate-500">
                          <Clock className="w-3.5 h-3.5 opacity-50" />
                          <span className="text-[11px] font-bold">{new Date(req.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-baseline gap-1">
                          <span className="text-sm font-black text-emerald-600">
                             {req.currency === 'BDT' ? '৳' : '$'}{req.amount.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{req.currency}</span>
                       </div>
                       <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Spent: {req.points?.toLocaleString() || (req.amount * 100).toLocaleString()} pts</p>
                    </td>
                    <td className="px-6 py-4">
                       <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between min-w-[200px]">
                          <div className="max-w-[220px]">
                             <div className="flex items-center gap-1.5 mb-1">
                                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tight leading-none bg-indigo-50 px-1.5 py-0.5 rounded">{req.method}</span>
                             </div>
                             <p className="text-[11px] font-bold text-slate-700 leading-normal break-words">{req.details}</p>
                          </div>
                          <ExternalLink className="w-3 h-3 text-slate-300 shrink-0" />
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       {activeTab === 'pending' ? (
                         <div className="flex items-center justify-center gap-2">
                           <button 
                             onClick={() => handleAction(req.id!, 'approved')}
                             disabled={!!processingId}
                             className="h-8 px-3 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-tight shadow-md shadow-emerald-100 hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-50"
                           >
                             Approve
                           </button>
                           <button 
                             onClick={() => setShowRejectModal(req.id!)}
                             disabled={!!processingId}
                             className="h-8 px-3 bg-rose-100 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-tight border border-rose-200 hover:bg-rose-200 active:scale-95 transition-all disabled:opacity-50"
                           >
                             Reject
                           </button>
                         </div>
                       ) : (
                         <div className="flex flex-col items-center justify-center gap-1">
                             <span className={cn(
                               "text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 rounded shadow-sm flex items-center gap-1",
                               activeTab === 'approved' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
                             )}>
                               {activeTab === 'approved' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                               {activeTab}
                             </span>
                             {req.reason && <p className="text-[8px] text-rose-400 font-bold max-w-[100px] truncate">{req.reason}</p>}
                         </div>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-start gap-3">
           <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
           <p className="text-[10px] text-slate-500 leading-normal font-medium italic">
             Reviewing Payouts: Approval results in permanent point deduction. Rejection automatically refunds points to user balance.
             Ensure payment details match your banking records before final approval.
           </p>
        </div>
      </div>
    </div>
  );
}
