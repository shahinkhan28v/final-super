import React, { useEffect, useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  DollarSign, 
  Target, 
  Gift, 
  Video,
  Info,
  CheckCircle,
  Database,
  Lock,
  Mail,
  Smartphone,
  Network,
  FileText,
  ExternalLink,
  Megaphone,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { subscribeToAppSettings, updateAppSettings } from '../../lib/dataService';
import { AppSettings } from '../../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface CollapsibleProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconColor: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ title, subtitle, icon, iconColor, isOpen, onToggle, children }: CollapsibleProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all">
      <button 
        type="button"
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", iconColor)}>
            {icon}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100"
          >
            <div className="p-6 space-y-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [openSection, setOpenSection] = useState<string | null>('economy');

  useEffect(() => {
    const unsub = subscribeToAppSettings((data) => {
      setSettings(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await updateAppSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof AppSettings, value: any) => {
    setSettings(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
      <RefreshCw className="w-8 h-8 animate-spin mb-4" />
      <p className="font-bold text-sm">Synchronizing Real-time Config...</p>
    </div>
  );

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="max-w-4xl space-y-8 pb-24">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-800">System Control Center</h1>
        <p className="text-slate-500 text-sm font-medium">Manage conversion algorithms, networking, and system behavior in real-time.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Economy & Conversion */}
        <CollapsibleSection 
          title="Point Converter Settings"
          subtitle="Exchange Rates & Limits"
          icon={<DollarSign className="w-5 h-5" />}
          iconColor="bg-emerald-50 text-emerald-600 border-emerald-100"
          isOpen={openSection === 'economy'}
          onToggle={() => toggleSection('economy')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Points per $1.00 USD</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={settings?.pointsPerUsd || settings?.conversionRate || 100}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateField('pointsPerUsd', val);
                      updateField('conversionRate', val);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 tracking-tighter">PTS/USD</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium italic">Used for International & Dollar-based withdrawals</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Points per ৳1.00 BDT</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={settings?.pointsPerBdt || 1}
                    onChange={(e) => updateField('pointsPerBdt', Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 tracking-tighter">PTS/BDT</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium italic">Used for local Bangladesh (bKash/Nagad) withdrawals</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Minimum Withdrawal Requirement</label>
            <div className="relative">
              <input 
                type="number"
                value={settings?.minWithdrawal}
                onChange={(e) => updateField('minWithdrawal', Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 tracking-tighter">POINTS</span>
            </div>
          </div>
        </CollapsibleSection>

        {/* MLM & Referral */}
        <CollapsibleSection 
          title="Multi-Level Marketing"
          subtitle="Referral Logic & Bonuses"
          icon={<Network className="w-5 h-5" />}
          iconColor="bg-indigo-50 text-indigo-600 border-indigo-100"
          isOpen={openSection === 'mlm'}
          onToggle={() => toggleSection('mlm')}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Base Signup Bonus</label>
              <div className="relative">
                <input 
                  type="number"
                  value={settings?.referralBonus}
                  onChange={(e) => updateField('referralBonus', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 tracking-tighter">PTS</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(level => (
                <div key={level} className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Level {level} %</label>
                  <input 
                    type="number"
                    value={settings?.[`mlmLevel${level}Percent` as keyof AppSettings]}
                    onChange={(e) => updateField(`mlmLevel${level}Percent` as keyof AppSettings, Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center font-black text-indigo-600 text-sm focus:border-indigo-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </CollapsibleSection>

        {/* Ads & Content */}
        <CollapsibleSection 
          title="Ads & Promotions"
          subtitle="External Links & News"
          icon={<Megaphone className="w-5 h-5" />}
          iconColor="bg-orange-50 text-orange-600 border-orange-100"
          isOpen={openSection === 'ads'}
          onToggle={() => toggleSection('ads')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Notice Message (Withdraw Page)</label>
              <textarea 
                value={settings?.withdrawalNotice || ''}
                onChange={(e) => updateField('withdrawalNotice', e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-medium text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Display URL (Dashboard)</label>
                <input 
                  type="text"
                  value={settings?.adsterraDashboardBanner || ''}
                  onChange={(e) => updateField('adsterraDashboardBanner', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-bold text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Display URL (Task Popup)</label>
                <input 
                  type="text"
                  value={settings?.adsterraTaskPopupBanner || ''}
                  onChange={(e) => updateField('adsterraTaskPopupBanner', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-bold text-xs"
                />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* System & Policy */}
        <CollapsibleSection 
          title="System Policy"
          subtitle="Legal & Support"
          icon={<Smartphone className="w-5 h-5" />}
          iconColor="bg-slate-50 text-slate-600 border-slate-100"
          isOpen={openSection === 'system'}
          onToggle={() => toggleSection('system')}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Support Email</label>
                  <input 
                    type="email"
                    value={settings?.supportEmail || ''}
                    onChange={(e) => updateField('supportEmail', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-bold text-sm"
                  />
               </div>
               <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Footer About</label>
                  <input 
                    type="text"
                    value={settings?.footerAbout || ''}
                    onChange={(e) => updateField('footerAbout', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-bold text-sm"
                  />
               </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Terms & Conditions</label>
              <textarea 
                value={settings?.termsAndConditions || ''}
                onChange={(e) => updateField('termsAndConditions', e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-medium text-[10px]"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Footer Fixed Actions */}
        <div className="sticky bottom-4 z-50 mt-8">
          <div className="bg-white/80 backdrop-blur-xl p-4 border border-indigo-100 rounded-2xl shadow-xl shadow-indigo-500/10 flex items-center justify-between">
            <div className="flex items-center gap-3 ml-2">
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                saving ? "bg-amber-500" : success ? "bg-emerald-500" : "bg-indigo-500"
              )} />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {saving ? "Syncing Logic..." : success ? "Real-time State Updated" : "Master System Control"}
              </p>
            </div>
            
            <button 
              type="submit"
              disabled={saving}
              className={cn(
                "px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg transition-all flex items-center gap-3",
                success ? "bg-emerald-500 text-white shadow-emerald-100 scale-95" : "bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700 active:scale-95"
              )}
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : 
               success ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : success ? 'Config Applied' : 'Commit Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
