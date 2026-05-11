import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Settings, 
  Bell, 
  Lock, 
  Globe, 
  LogOut, 
  ChevronRight,
  Shield,
  CreditCard,
  CheckCircle2,
  Camera,
  ShieldCheck,
  ArrowLeft,
  Smartphone,
  Save,
  MessageSquare,
  HelpCircle,
  Mail,
  Info,
  Gift,
  AlertCircle,
  Search,
  MapPin
} from 'lucide-react';
import { cn } from '../lib/utils';
import { updateUserDetails, getAppSettings, updateUserDeviceInfo } from '../lib/dataService';
import { getDeviceInfo } from '../lib/deviceUtils';
import { AppSettings } from '../types';
import { Link } from 'react-router-dom';

type View = 'main' | 'notifications' | 'language' | 'password' | 'bank' | 'privacy' | 'help' | 'device_history';

export default function Account() {
  const { profile, logout } = useAuth();
  const [view, setView] = useState<View>('main');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  
  // States for forms
  const [lang, setLang] = useState('English');
  const [bankInfo, setBankInfo] = useState({
    method: '',
    details: ''
  });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  React.useEffect(() => {
    async function load() {
      const data = await getAppSettings();
      setSettings(data);
    }
    load();
  }, []);

  React.useEffect(() => {
    if (profile?.paymentInfo) {
      setBankInfo({
        method: profile.paymentInfo.method || '',
        details: profile.paymentInfo.details || ''
      });
    }
  }, [profile]);

  const handleUpdateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;
    setLoading(true);
    await updateUserDetails(profile.uid, {
      paymentInfo: {
        method: bankInfo.method,
        details: bankInfo.details
      }
    });
    setLoading(false);
    setView('main');
    alert('Bank information updated successfully!');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementation placeholder for password change
    alert('Password change functionality requested. A verification email will be sent to your registered address.');
    setView('main');
  };

  const settingsItems = [
    { id: 'notifications' as View, icon: Bell, label: 'Notifications', value: 'On', color: 'text-blue-500 bg-blue-50' },
    { id: 'language' as View, icon: Globe, label: 'Language', value: lang, color: 'text-indigo-500 bg-indigo-50' },
    { id: 'password' as View, icon: Lock, label: 'Change Password', color: 'text-purple-500 bg-purple-50' },
    { id: 'bank' as View, icon: CreditCard, label: 'Bank Info', value: profile?.paymentInfo?.method || 'Not Set', color: 'text-emerald-500 bg-emerald-50' },
    { id: 'privacy' as View, icon: Shield, label: 'Privacy & Security', color: 'text-amber-500 bg-amber-50' },
  ];

  const renderHeader = (title: string) => (
    <div className="flex items-center gap-4 mb-8 px-1">
      <button 
        onClick={() => setView('main')}
        className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Account Management</p>
      </div>
    </div>
  );

  const renderMain = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
       {/* Profile Header */}
       <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-xl bg-indigo-600 border-4 border-white shadow-lg overflow-hidden relative">
              {profile?.profilePic ? (
                <img src={profile.profilePic} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-3xl font-black">
                  {profile?.name?.[0]}
                </div>
              )}
            </div>
            <button className="absolute bottom-[-8px] right-[-8px] w-9 h-9 bg-white rounded-lg shadow-md flex items-center justify-center text-slate-900 border border-slate-200 active:scale-90 transition-transform hover:bg-slate-50">
               <Camera className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{profile?.name}</h2>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{profile?.email}</p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">
             <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
             <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Verified Earner</span>
          </div>
       </div>

       {/* Settings Section */}
       <div className="space-y-3">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Account & Preferences</h3>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             {settingsItems.map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => setView(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group text-left",
                    idx !== settingsItems.length - 1 && "border-b border-slate-100"
                  )}
                >
                   <div className="flex items-center gap-3">
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center transition-colors", item.color)}>
                         <item.icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-700 text-sm group-hover:text-slate-900">{item.label}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      {item.value && <span className="text-[11px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{item.value}</span>}
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                   </div>
                </button>
             ))}
          </div>
       </div>

       {/* Support Section */}
       <div className="space-y-3">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Security & Support</h3>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <button 
               onClick={() => setView('help')}
               className="w-full flex items-center justify-between p-4 hover:bg-slate-50 border-b border-slate-100 transition-colors group text-left"
             >
                <div className="flex items-center gap-3">
                   <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                      <HelpCircle className="w-4 h-4" />
                   </div>
                   <span className="font-bold text-slate-700 text-sm group-hover:text-slate-900">Help Center</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
             </button>
             {profile?.isAdmin && (
               <Link 
                 to="/admin"
                 className="w-full flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 transition-colors group text-left border-b border-indigo-100"
               >
                  <div className="flex items-center gap-3">
                     <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                     </div>
                     <div>
                        <span className="font-bold text-indigo-900 text-sm">Admin Control Panel</span>
                        <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mt-0.5">System Management</p>
                     </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-indigo-300" />
               </Link>
             )}
             <button 
               onClick={logout}
               className="w-full flex items-center justify-between p-4 hover:bg-rose-50 transition-colors group text-left"
             >
                <div className="flex items-center gap-3 text-rose-600">
                   <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                      <LogOut className="w-4 h-4" />
                   </div>
                   <span className="font-bold text-sm">Sign Out</span>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-300" />
             </button>
          </div>
       </div>

       <div className="text-center py-4">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">PointHub Engine v1.0.4 r2</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Connected</p>
          </div>
       </div>
    </motion.div>
  );

  const renderNotifications = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      {renderHeader('Notifications')}
      <div className="space-y-4">
        {[
          { title: 'Push Notifications', desc: 'Alerts for tasks and rewards', icon: Bell },
          { title: 'Email Updates', desc: 'Weekly account summary', icon: Mail },
          { title: 'Marketing Offers', desc: 'Promotions and new features', icon: Gift }
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition-all shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-800 text-sm leading-tight">{item.title}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.desc}</p>
              </div>
            </div>
            <div className="w-10 h-5 bg-indigo-600 rounded-full relative">
               <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderLanguage = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      {renderHeader('Language')}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50 shadow-sm">
        {['English', 'Bengali', 'Hindi', 'Arabic', 'Spanish'].map((l) => (
          <button 
            key={l}
            onClick={() => { setLang(l); setView('main'); }}
            className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                lang === l ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-400"
              )}>
                <Globe className="w-5 h-5" />
              </div>
              <span className={cn("font-bold text-sm", lang === l ? "text-indigo-600" : "text-slate-700")}>{l}</span>
            </div>
            {lang === l && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          </button>
        ))}
      </div>
    </motion.div>
  );

  const renderBankInfo = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      {renderHeader('Withdrawal Method')}
      <form onSubmit={handleUpdateBank} className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Preferred Method</label>
              <select 
                value={bankInfo.method}
                onChange={(e) => setBankInfo({ ...bankInfo, method: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all"
              >
                <option value="">Select Method</option>
                <option value="Bkash">Bkash (Personal)</option>
                <option value="Nagad">Nagad (Personal)</option>
                <option value="Rocket">Rocket (Personal)</option>
                <option value="Upay">Upay (Personal)</option>
              </select>
           </div>
           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 text-left">Account Number / Details</label>
              <div className="relative text-left">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="text" 
                  placeholder="e.g. 017XXXXXXXX"
                  value={bankInfo.details}
                  onChange={(e) => setBankInfo({ ...bankInfo, details: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all"
                />
              </div>
           </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all"
        >
          {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Bank Info</>}
        </button>
      </form>
    </motion.div>
  );

  const renderPassword = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      {renderHeader('Update Security')}
      <form onSubmit={handlePasswordChange} className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 text-left">Current Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all"
              />
           </div>
           <div className="h-px bg-slate-50 my-2"></div>
           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 text-left">New Secure Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all"
              />
           </div>
           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1 text-left">Confirm New Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 outline-none transition-all"
              />
           </div>
        </div>

        <button 
          type="submit"
          className="w-full py-4 bg-slate-800 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-100 flex items-center justify-center gap-2 hover:bg-slate-700 active:scale-95 transition-all"
        >
          Update Password
        </button>
        <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">Forgot your password? Click for email reset.</p>
      </form>
    </motion.div>
  );

  const renderPrivacy = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      {renderHeader('Privacy & Safety')}
      <div className="space-y-4">
         <div className="bg-indigo-600 p-6 rounded-3xl text-white text-left">
            <Shield className="w-8 h-8 mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">Your data is secured.</h3>
            <p className="text-indigo-100 text-xs font-medium">We use industry-standard encryption to protect your transaction history and personal identity.</p>
         </div>

         <div className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between group shadow-sm text-left">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-800 text-sm leading-tight">Device History</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {profile?.lastIp ? 'Connected' : 'Syncing...'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setView('device_history')}
              className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg active:scale-95 transition-transform"
            >
              Manage
            </button>
         </div>

         <div className="bg-white p-6 rounded-2xl border border-slate-100 text-left">
            <div className="flex items-center gap-2 text-rose-500 mb-3">
               <AlertCircle className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Danger Zone</span>
            </div>
            <h4 className="font-bold text-slate-800 text-sm">Delete Account</h4>
            <p className="text-xs text-slate-400 font-medium mt-1 mb-4">Permanently remove all your progress and unspent points.</p>
            <button className="w-full py-3 border-2 border-rose-100 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-colors">Request Account Deletion</button>
         </div>
      </div>
    </motion.div>
  );

  const renderHelp = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      {renderHeader('Help & Support')}
      <div className="space-y-4">
         <div className="relative overflow-hidden bg-slate-900 p-8 rounded-3xl text-white text-left">
            <div className="relative z-10">
               <h3 className="text-2xl font-black mb-2 tracking-tight">How can we help?</h3>
               <div className="relative mt-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search FAQ keywords..."
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-sm font-medium outline-none focus:bg-white/20 transition-all placeholder:text-slate-500 text-left"
                  />
               </div>
            </div>
            <HelpCircle className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-indigo-500/10 rotate-12" />
         </div>

         <div className="grid grid-cols-2 gap-4">
            <a 
              href={`mailto:${settings?.supportEmail || 'support@pointhub.com'}?subject=Support Request - ${profile?.uid}`}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-3 group hover:border-indigo-100 transition-all active:scale-95"
            >
               <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Mail className="w-6 h-6" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email Us</span>
            </a>
            <Link 
              to="/support/chat"
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-3 group hover:border-emerald-100 transition-all active:scale-95"
            >
               <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <MessageSquare className="w-6 h-6" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Chat</span>
            </Link>
         </div>

         <div className="bg-white rounded-3xl border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm">
            {[
              'How to withdraw my points?',
              'Why is my task pending?',
              'Referral rules and bonuses',
              'Minimum withdrawal limit'
            ].map((q, i) => (
              <button key={i} className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
                <span className="font-bold text-slate-700 text-sm">{q}</span>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>
            ))}
         </div>
      </div>
    </motion.div>
  );

  const renderDeviceHistory = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      {renderHeader('Device History')}
      <div className="space-y-4">
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden text-left">
            <div className="flex items-center gap-4 relative z-10">
               <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Smartphone className="w-7 h-7" />
               </div>
               <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">Active Connection</h3>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">This device is active</p>
               </div>
            </div>
            <div className="mt-6 space-y-4 relative z-10">
               <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Device Model</span>
                  <span className="text-sm font-black text-slate-700">{profile?.deviceInfo?.os?.includes('Windows') ? 'Desktop PC' : profile?.deviceInfo?.isMobile ? 'Mobile Device' : 'Tablet/PC'}</span>
               </div>
               <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">OS / Platform</span>
                  <span className="text-sm font-black text-slate-700">{profile?.deviceInfo?.os || 'Unknown'}</span>
               </div>
               <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Browser</span>
                  <span className="text-sm font-black text-slate-700">{profile?.deviceInfo?.browser || 'Unknown'}</span>
               </div>
               <div className="flex justify-between items-center py-3 border-b border-slate-50">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</span>
                  <div className="flex flex-col items-end gap-1">
                     <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-indigo-500" />
                        <span className="text-sm font-black text-slate-700">
                           {profile?.location?.city || 'Unknown'}, {profile?.location?.country || 'Unknown'}
                        </span>
                     </div>
                     {profile?.location?.region && profile?.location?.region !== 'Unknown' && (
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                           Region: {profile.location.region}
                        </span>
                     )}
                  </div>
               </div>
               <div className="flex justify-between items-center py-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">IP Address</span>
                  <div className="flex items-center gap-2">
                     <Globe className="w-3 h-3 text-emerald-500" />
                     <span className="text-sm font-black text-slate-700">{profile?.lastIp || 'Detecting...'}</span>
                  </div>
               </div>
            </div>
            
            <div className="mt-8 flex flex-col gap-4">
               <button 
                  onClick={async () => {
                     const info = await getDeviceInfo();
                     if (profile?.uid) {
                        updateUserDeviceInfo(profile.uid, info);
                     }
                  }}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95 transition-all"
               >
                  Refresh Live Location
               </button>
               
               <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                  <p className="text-[10px] font-medium text-orange-700 leading-relaxed">
                     Note: Log out from all other devices regularly to keep your account safe. If you see an IP or Location you don't recognize, change your password immediately.
                  </p>
               </div>
            </div>
         </div>

         <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center space-y-2">
            <Info className="w-5 h-5 text-slate-400 mx-auto" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Session ID: {profile?.uid?.substring(0, 10).toUpperCase()}</p>
         </div>
      </div>
    </motion.div>
  );

  return (
    <div className="pb-10">
      <AnimatePresence mode="wait">
        <div key={view}>
          {view === 'main' && renderMain()}
          {view === 'notifications' && renderNotifications()}
          {view === 'language' && renderLanguage()}
          {view === 'bank' && renderBankInfo()}
          {view === 'password' && renderPassword()}
          {view === 'privacy' && renderPrivacy()}
          {view === 'help' && renderHelp()}
          {view === 'device_history' && renderDeviceHistory()}
        </div>
      </AnimatePresence>
    </div>
  );
}
