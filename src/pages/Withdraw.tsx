import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { requestWithdrawal, subscribeToAppSettings } from '../lib/dataService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  ArrowRight, 
  CheckCircle2, 
  CreditCard,
  Building,
  Smartphone,
  Info,
  RefreshCcw,
  X,
  Bell,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { AppSettings } from '../types';

export default function Withdraw() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState('');
  const [amount, setAmount] = useState<number>(500); // Default to min
  const [details, setDetails] = useState('');
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    branchName: '',
    routingNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showNotice, setShowNotice] = useState(false);
  
  // Converter State
  const [convertPoints, setConvertPoints] = useState<string>('100');
  const [targetCurrency, setTargetCurrency] = useState<'USD' | 'BDT'>('BDT');
  
  const minWithdrawal = settings?.minWithdrawal || 500;

  useEffect(() => {
    const unsub = subscribeToAppSettings((data) => {
      setSettings(data);
      if (data.withdrawalNotice) {
        setShowNotice(true);
      }
    });
    return () => unsub();
  }, []);

  const getCurrencyValue = (pts: number) => {
    if (!settings) return 0;
    if (targetCurrency === 'BDT') {
      const rate = settings.pointsPerBdt || 1;
      return (pts / rate).toFixed(2);
    }
    const rate = settings.pointsPerUsd || settings.conversionRate || 100;
    return (pts / rate).toFixed(2);
  };

  const paymentMethods = [
    { id: 'bkash', name: 'bkash', icon: Smartphone, color: 'text-[#D12053] bg-[#FDE8EE]' },
    { id: 'nagad', name: 'Nagad', icon: Smartphone, color: 'text-[#F15A22] bg-[#FEF0E9]' },
    { id: 'rocket', name: 'Rocket', icon: Smartphone, color: 'text-[#8C3494] bg-[#F4EBF5]' },
    { id: 'paypal', name: 'PayPal', icon: CreditCard, color: 'text-[#003087] bg-[#E6EBF3]' },
    { id: 'upi', name: 'UPI (India)', icon: CreditCard, color: 'text-[#097939] bg-[#E7F2EB]' },
    { id: 'bank', name: 'Bank Transfer', icon: Building, color: 'text-zinc-600 bg-zinc-100' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid || !settings) return;

    if (amount < minWithdrawal) {
      setError(`Minimum withdrawal is ${minWithdrawal} points`);
      return;
    }
    if (profile.points < amount) {
      setError('Insufficient points');
      return;
    }

    let finalDetails = details;
    if (method === 'Bank Transfer') {
      if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.accountName) {
        setError('Please fill required bank details');
        return;
      }
      finalDetails = `Bank: ${bankDetails.bankName}, A/C: ${bankDetails.accountName}, No: ${bankDetails.accountNumber}, Branch: ${bankDetails.branchName}, Routing: ${bankDetails.routingNumber}`;
    } else {
      if (!method || !details) {
        setError('Please fill all fields');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const convertedValue = Number(getCurrencyValue(amount));
      await requestWithdrawal(profile.uid, amount, convertedValue, targetCurrency, method, finalDetails);
      setSuccess(true);
      setTimeout(() => navigate('/history'), 2000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDetailsField = () => {
    if (method === 'Bank Transfer') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bank Name</label>
            <input 
              type="text" 
              value={bankDetails.bankName}
              onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
              className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold focus:ring-4 ring-indigo-500/5 transition-all"
              placeholder="e.g. Dutch Bangla Bank"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Account Holder Name</label>
            <input 
              type="text" 
              value={bankDetails.accountName}
              onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
              className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold focus:ring-4 ring-indigo-500/5 transition-all"
              placeholder="Full Name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Account Number</label>
            <input 
              type="text" 
              value={bankDetails.accountNumber}
              onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
              className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold focus:ring-4 ring-indigo-500/5 transition-all"
              placeholder="XXXX-XXXX-XXXX"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Branch/Routing (Opt)</label>
            <input 
              type="text" 
              value={bankDetails.branchName}
              onChange={(e) => setBankDetails({...bankDetails, branchName: e.target.value})}
              className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-bold focus:ring-4 ring-indigo-500/5 transition-all"
              placeholder="Branch Details"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
          {method === 'PayPal' ? 'PayPal Email Address' : 'Mobile Banking Number'}
        </label>
        <div className="relative group/input">
          <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-indigo-600 transition-colors" />
          <input 
            type={method === 'PayPal' ? 'email' : 'text'}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all"
            placeholder={method === 'PayPal' ? 'example@email.com' : '01XXXXXXXXX'}
          />
        </div>
      </div>
    );
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-6 px-4">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-emerald-200"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-black text-zinc-900">Request Submitted!</h2>
          <p className="text-zinc-500 mt-2">Your withdrawal request is being processed. It usually takes 24-48 hours to approve.</p>
        </div>
        <button 
          onClick={() => navigate('/history')}
          className="bg-zinc-900 text-white px-8 py-3 rounded-2xl font-bold"
        >
          View History
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <AnimatePresence>
        {showNotice && settings?.withdrawalNotice && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-amber-50 border-b-4 border-amber-500 p-5 rounded-[2rem] shadow-xl shadow-amber-100/50 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <button onClick={() => setShowNotice(false)} className="p-1 hover:bg-amber-100 rounded-full transition-colors text-amber-900/50">
                <X size={18} />
              </button>
            </div>
            <div className="flex gap-4">
               <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-200">
                  <Bell className="w-6 h-6 animate-bounce" />
               </div>
               <div className="text-left pr-6">
                  <h3 className="font-black text-amber-900 text-sm uppercase tracking-tight">Withdrawal Notice</h3>
                  <p className="text-[11px] font-bold text-amber-800/70 mt-1 leading-relaxed whitespace-pre-line">
                    {settings.withdrawalNotice}
                  </p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Withdrawal Center</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <RefreshCcw className="w-3 h-3 text-indigo-500" />
            24-48h Approval Window
          </p>
        </div>
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
           <Wallet className="w-6 h-6" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-center">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Current Balance</p>
          <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-800 tracking-tighter">{profile?.points || 0}</span>
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Points</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
             <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                ≈ ${((profile?.points || 0) / (settings?.conversionRate || 100)).toFixed(2)} USD
             </div>
          </div>
        </div>

        {/* Real-time Converter */}
        <div className="bg-indigo-600 rounded-[2.5rem] p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
              <RefreshCcw size={80} />
           </div>
           <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                 <h3 className="text-sm font-black uppercase tracking-widest text-indigo-200">Point Converter</h3>
                 <div className="flex bg-white/20 p-1 rounded-xl backdrop-blur-sm">
                    <button 
                      onClick={() => setTargetCurrency('BDT')}
                      className={cn("px-2 py-1 rounded-lg text-[9px] font-black tracking-widest transition-all", targetCurrency === 'BDT' ? "bg-white text-indigo-600 shadow-sm" : "text-white/60 hover:text-white")}
                    >BDT</button>
                    <button 
                      onClick={() => setTargetCurrency('USD')}
                      className={cn("px-2 py-1 rounded-lg text-[9px] font-black tracking-widest transition-all", targetCurrency === 'USD' ? "bg-white text-indigo-600 shadow-sm" : "text-white/60 hover:text-white")}
                    >USD</button>
                 </div>
              </div>

              <div className="flex items-center gap-3">
                 <input 
                   type="number" 
                   value={convertPoints}
                   onChange={(e) => setConvertPoints(e.target.value)}
                   className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 h-12 text-xl font-black focus:outline-none focus:ring-2 ring-white/50 transition-all placeholder:text-white/30"
                   placeholder="100"
                 />
                 <div className="w-12 h-12 shrink-0 bg-white text-indigo-600 rounded-2xl flex items-center justify-center animate-pulse">
                    <ArrowRight size={24} />
                 </div>
                 <div className="w-full bg-white/20 border border-white/10 rounded-2xl px-4 h-12 flex items-center justify-center backdrop-blur-sm">
                    <span className="text-xl font-black tracking-tight">
                       {targetCurrency === 'BDT' ? '৳' : '$'}{getCurrencyValue(Number(convertPoints) || 0)}
                    </span>
                 </div>
              </div>
              <p className="text-[10px] font-bold text-indigo-200/80 italic text-center px-4">
                Rate: {targetCurrency === 'BDT' ? 
                  `${settings?.pointsPerBdt || 1} Pts = ৳1 BDT` : 
                  `${settings?.pointsPerUsd || settings?.conversionRate || 100} Pts = $1 USD`}
              </p>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
            Select Payout Destination
          </label>
          <div className="grid grid-cols-3 gap-3">
            {paymentMethods.map((pm) => (
              <button
                key={pm.id}
                type="button"
                onClick={() => setMethod(pm.name)}
                className={cn(
                  "p-4 rounded-[1.5rem] border-2 transition-all flex flex-col items-center gap-2 group/btn",
                  method === pm.name ? "border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-100" : "border-slate-50 bg-slate-50/30 hover:border-slate-200"
                )}
              >
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center text-xs shadow-sm transition-transform group-hover/btn:scale-110", pm.color)}>
                  <pm.icon className="w-6 h-6" />
                </div>
                <span className={cn("text-[10px] font-black truncate w-full px-1 uppercase tracking-tighter", method === pm.name ? "text-indigo-800" : "text-slate-500")}>{pm.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Points to Burn</label>
            <div className="relative">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-5 font-black text-lg text-slate-800 focus:outline-none focus:ring-4 ring-indigo-500/5 focus:bg-white focus:border-indigo-500 transition-all"
                placeholder={String(minWithdrawal)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MIN: {minWithdrawal}</span>
              </div>
            </div>
          </div>

          {method && renderDetailsField()}
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold"
          >
            <div className="w-8 h-8 bg-rose-600 text-white rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-rose-200">
               <Info className="w-5 h-5" />
            </div>
            {error}
          </motion.div>
        )}

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white h-16 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-200 flex items-center justify-center gap-4 hover:bg-slate-900 active:scale-95 disabled:opacity-50 transition-all group"
        >
          {isSubmitting ? (
            <RefreshCcw className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Confirm Withdrawal
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover:translate-x-1 transition-transform">
                 <ArrowRight className="w-5 h-5" />
              </div>
            </>
          )}
        </button>
      </form>

      <div className="p-6 bg-slate-900 rounded-[2.5rem] text-white flex items-start gap-4 shadow-xl shadow-slate-200 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <Info size={100} />
        </div>
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
           <Info className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="relative z-10">
           <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-1">Compliance & Security</h4>
           <p className="text-[10px] text-zinc-400 leading-relaxed font-bold italic">
             All withdrawal requests undergo systematic fraud checks via IP Detection and Network Analysis. 
             Providing false account details may result in permanent forfeiture of accumulated points. 
             Please ensure your payout method is active and verified before requesting funds.
           </p>
        </div>
      </div>
    </div>
  );
}
