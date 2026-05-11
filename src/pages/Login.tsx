import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Wallet, TrendingUp, ShieldCheck, AlertCircle, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';

type LoginMethod = 'google' | 'email';
type EmailMode = 'signin' | 'signup';

export default function Login() {
  const { user, signIn, signInEmail, signUpEmail, loading } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState<LoginMethod>('google');
  const [emailMode, setEmailMode] = useState<EmailMode>('signin');
  const [error, setError] = useState<string | null>(null);
  const [referralInput, setReferralInput] = useState('');
  
  // Email states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedRef = sessionStorage.getItem('referralCode');
    if (savedRef) {
      setReferralInput(savedRef);
    }
  }, []);

  if (user) return <Navigate to="/" />;

  const handleGoogleSignIn = async () => {
    saveReferral();
    try {
      await signIn();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please try again.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    saveReferral();
    if (!email || !password) return setError('Please fill in all fields.');
    if (emailMode === 'signup' && !name) return setError('Please enter your name.');

    try {
      if (emailMode === 'signin') {
        await signInEmail(email, password);
      } else {
        await signUpEmail(email, password, name);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const saveReferral = () => {
    if (referralInput) {
      sessionStorage.setItem('referralCode', referralInput.toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col p-6 overflow-hidden relative">
      <div id="root"></div>
      
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-slate-500/10 blur-[100px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col justify-center items-center text-center max-w-sm mx-auto w-full z-10 py-10"
      >
        <div className="w-16 h-16 bg-indigo-600 rounded-3xl rotate-12 flex items-center justify-center mb-6 shadow-xl shadow-indigo-100">
          <Gift className="w-8 h-8 text-white -rotate-12" />
        </div>
        
        <h1 className="text-3xl font-black tracking-tight mb-2 text-indigo-700">
          PointHub
        </h1>
        <p className="text-slate-500 font-medium mb-8 text-xs">
          Join 50,000+ users earning real rewards daily. Complete simple tasks and withdraw instantly.
        </p>

        {/* MLM Referral Input */}
        <div className="w-full space-y-2 mb-6 text-left">
           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Referral Code (Optional)</label>
           <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                 <Gift className="w-4 h-4" />
              </div>
              <input 
                type="text"
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value)}
                placeholder="ENTER CODE"
                className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-black text-slate-700 outline-none focus:border-indigo-500 transition-all uppercase tracking-widest placeholder:text-slate-200"
              />
           </div>
        </div>

        {/* Login Method Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full mb-6">
          {(['google', 'email'] as LoginMethod[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMethod(m); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                method === m ? 'bg-white shadow-sm text-indigo-600 scale-105' : 'text-slate-400'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {method === 'google' && (
            <motion.div
              key="google"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-full"
            >
              <button 
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white border-2 border-slate-100 text-slate-700 h-14 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-indigo-500 transition-colors flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-all disabled:opacity-50"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 rounded-sm" />
                {loading ? 'Authenticating...' : 'Continue with Google'}
              </button>
              <p className="mt-4 text-[10px] text-slate-400 font-bold px-4">
                Recommended for fastest setup. Use a standard browser for best experience.
              </p>
            </motion.div>
          )}

          {method === 'email' && (
            <motion.form
              key="email"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleEmailAuth}
              className="w-full space-y-3"
            >
              <div className="flex bg-slate-100 p-1 rounded-lg w-full mb-2">
                <button
                  type="button"
                  onClick={() => setEmailMode('signin')}
                  className={`flex-1 py-1.5 rounded-md text-[9px] font-bold uppercase ${emailMode === 'signin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setEmailMode('signup')}
                  className={`flex-1 py-1.5 rounded-md text-[9px] font-bold uppercase ${emailMode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                >
                  Create Account
                </button>
              </div>

              {emailMode === 'signup' && (
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="FULL NAME" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border-2 border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm font-bold outline-none focus:border-indigo-500 transition-all uppercase tracking-widest"
                  />
                </div>
              )}

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="EMAIL ADDRESS" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border-2 border-slate-100 rounded-xl py-3 pl-11 pr-4 text-sm font-bold outline-none focus:border-indigo-500 transition-all uppercase tracking-widest"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="PASSWORD" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border-2 border-slate-100 rounded-xl py-3 pl-11 pr-12 text-sm font-bold outline-none focus:border-indigo-500 transition-all tracking-widest"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white h-12 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Please wait...' : (emailMode === 'signin' ? 'Login Now' : 'Join PointHub')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 text-rose-500 text-[10px] font-bold bg-rose-50 p-3 rounded-lg border border-rose-100 w-full justify-center"
          >
             <AlertCircle className="w-4 h-4 flex-shrink-0" />
             <span className="text-left">{error}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-3 w-full mt-10">
          <FeatureCard icon={TrendingUp} label="MLM Rewards" />
          <FeatureCard icon={Wallet} label="Fast Payouts" />
        </div>
      </motion.div>

      <footer className="mt-auto text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest py-8 z-10">
        Trusted by 50,000+ Active Users Worldwide
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col items-center gap-2 shadow-sm transition-transform hover:scale-105">
      <Icon className="w-6 h-6 text-indigo-600" />
      <span className="text-[9px] font-black text-slate-700 uppercase tracking-wider">{label}</span>
    </div>
  );
}

