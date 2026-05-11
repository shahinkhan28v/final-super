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
  ChevronUp,
  Layout,
  Image as ImageIcon
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
  const [selectedPageId, setSelectedPageId] = useState<string>('jobs');

  const PAGE_OPTIONS = [
    { id: 'jobs', name: 'Jobs (কাজের বিস্তারিত)' },
    { id: 'network', name: 'Network (নেটওয়ার্ক)' },
    { id: 'payouts', name: 'Payouts (পেমেন্ট প্রুফ)' },
    { id: 'terms', name: 'Terms of Use (শর্তাবলী)' },
    { id: 'privacy', name: 'Privacy Shield (প্রাইভেসি)' },
    { id: 'support', name: 'Support Info (সহায়তা)' }
  ];

  const currentPage = settings?.footerPages?.[selectedPageId] || {
    id: selectedPageId,
    title: PAGE_OPTIONS.find(p => p.id === selectedPageId)?.name || '',
    content: '',
    imageUrl: ''
  };

  const updatePageField = (field: 'title' | 'content' | 'imageUrl', value: string) => {
    if (!settings) return;
    const pages = { ...(settings.footerPages || {}) };
    pages[selectedPageId] = {
      ...currentPage,
      [field]: value,
      id: selectedPageId,
      lastUpdated: new Date().toISOString()
    };
    updateField('footerPages', pages);
  };

  const initializeDefaultPages = () => {
    if (!settings) return;
    const defaultPages = {
      jobs: {
        id: 'jobs',
        title: 'Jobs (কাজের বিস্তারিত)',
        content: `<h2>আমাদের অর্থ উপার্জনের মাধ্যমসমূহ</h2>
<p>PointHub-এ আপনি বিভিন্নভাবে পয়েন্ট অর্জন করতে পারেন এবং তা নগদে রূপান্তর করতে পারেন।</p>

<div class="jobs-grid">
  <div class="job-card">
    <h3>টাস্ক সেন্টার (Task Center)</h3>
    <p>প্রতিদিন নতুন নতুন ওয়েবসাইট ভিজিট করুন এবং ভিডিও দেখে সহজ কাজ সম্পূর্ণ করে পয়েন্ট পান।</p>
    <a href="/tasks" class="btn">কাজ শুরু করুন</a>
  </div>
  
  <div class="job-card">
    <h3>রিওয়ার্ড শপ (Reward Shop)</h3>
    <p>অ্যাপ ডাউনলোড করা বা ছোট কাজ সম্পূর্ণ করে তাৎক্ষণিক বড় রিওয়ার্ড পয়েন্ট অর্জন করুন।</p>
    <a href="/rewards" class="btn">রিওয়ার্ড দেখুন</a>
  </div>
  
  <div class="job-card">
    <h3>রেফারাল (Referral)</h3>
    <p>আপনার বন্ধুদের আমন্ত্রণ জানান এবং তাদের উপার্জনের ১০% বোনাস আজীবন পেতে থাকুন।</p>
    <a href="/refer" class="btn">বন্ধু ইনভাইট করুন</a>
  </div>
</div>`,
        imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80',
        lastUpdated: new Date().toISOString()
      },
      network: {
        id: 'network',
        title: 'Network (নেটওয়ার্ক)',
        content: `<h2>সাফল্যের নেটওয়ার্ক এবং রেফারাল সিস্টেম</h2>
<p>PointHub-এ আমরা বিশ্বাস করি একসাথে এগিয়ে চলায়। আমাদের মাল্টি-লেভেল রেফারাল সিস্টেমের মাধ্যমে আপনি বিশাল একটি টিম তৈরি করতে পারেন।</p>

<h3>কিভাবে এটি কাজ করে?</h3>
<ul>
  <li><strong>লেভেল ১ (Direct Referral):</strong> আপনি যাকে সরাসরি ইনভাইট করবেন, তার উপার্জনের ১০% আপনি পাবেন।</li>
  <li><strong>লেভেল ২ (Indirect Referral):</strong> আপনার বন্ধু যখন অন্য কাউকে ইনভাইট করবে, সেখান থেকেও ৫% বোনাস আপনার একাউন্টে যোগ হবে।</li>
</ul>

<p>এভাবে যত বড় আপনার নেটওয়ার্ক, তত বেশি আপনার নিষ্ক্রিয় আয় (Passive Income)।</p>`,
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80',
        lastUpdated: new Date().toISOString()
      },
      payouts: {
        id: 'payouts',
        title: 'Payouts (পেমেন্ট প্রুফ)',
        content: `<h2>পেমেন্ট এবং পয়েন্ট কনভার্ট সিস্টেম</h2>
<p>আপনার পরিশ্রমের প্রতিটি পয়েন্ট আমাদের কাছে অত্যন্ত মূল্যবান। নিচে আমাদের পেমেন্ট সিস্টেম সম্পর্কে বিস্তারিত আলোচনা করা হল:</p>

<h3>পয়েন্ট কনভার্ট রেট</h3>
<p>বর্তমানে ১০০ পয়েন্ট সমান ১ টাকা (BDT)। এই রেট সময়ের সাথে এবং মার্কেট অনুযায়ী পরিবর্তন হতে পারে যা এডমিন প্যানেল থেকে নিয়ন্ত্রিত হয়।</p>

<h3>কিভাবে উইথড্র করবেন?</h3>
<ol>
  <li>আপনার ব্যালেন্সে নূন্যতম ১০০০০ পয়েন্ট থাকতে হবে।</li>
  <li>উইথড্র অপশনে যান এবং আপনার কাঙ্ক্ষিত পেমেন্ট মেথড (বিকাশ, নগদ, রকেট) সিলেক্ট করুন।</li>
  <li>আপনার একাউন্ট নম্বর এবং পয়েন্টের পরিমাণ লিখে আবেদন করুন।</li>
  <li>২৪-৪৮ ঘণ্টার মধ্যে আমাদের টিম আপনার পেমেন্ট প্রসেস করবে।</li>
</ol>`,
        imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80',
        lastUpdated: new Date().toISOString()
      },
      terms: {
        id: 'terms',
        title: 'Terms of Use (শর্তাবলী)',
        content: `<h2>PointHub ব্যবহারের শর্তাবলী</h2>
<p>PointHub ব্যবহার করার মাধ্যমে আপনি নিচের শর্তগুলো মেনে চলছেন বলে গণ্য হবে:</p>
<ol>
  <li>প্রতিটি ডিভাইসে শুধুমাত্র একটি একাউন্ট ব্যবহারের অনুমতি রয়েছে। মাল্টিপল একাউন্ট ব্লক করা হবে।</li>
  <li>ভিপিএন (VPN) ব্যবহার করে কাজ করা বিশেষ ক্ষেত্রে অনুমোদিত কিন্তু ফেক আইপি ব্যবহার নিষিদ্ধ।</li>
  <li>যেকোনো ধরণের অটোমেশন বা বট টুল ব্যবহার করলে একাউন্ট আজীবন ব্লক করা হবে।</li>
  <li>উইথড্রয়াল প্রসেসে ভুল তথ্য দিলে পেমেন্ট রিফান্ড করা হবে না।</li>
</ol>`,
        imageUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80',
        lastUpdated: new Date().toISOString()
      },
      privacy: {
        id: 'privacy',
        title: 'Privacy Shield (প্রাইভেসি)',
        content: `<h2>আপনার তথ্য আমাদের কাছে সুরক্ষিত</h2>
<p>PointHub-এ আপনার তথ্য কিভাবে সুরক্ষিত থাকে তা নিচে বিস্তারিত দেওয়া হলো:</p>
<ul>
  <li>আমরা শুধুমাত্র আপনার নাম এবং ইমেইল সংগ্রহ করি একাউন্ট শনাক্তকরণের জন্য।</li>
  <li>আপনার পেমেন্ট নম্বর শুধুমাত্র ট্রানজেকশন প্রসেসের জন্য ব্যবহৃত হয়।</li>
  <li>আমরা তৃতীয় কোনো পক্ষের কাছে আপনার তথ্য বিক্রি বা হস্তান্তর করি না।</li>
  <li>আপনার সকল ডাটা এনক্রিপ্টেড অবস্থায় আমাদের সার্ভারে সংরক্ষিত থাকে।</li>
</ul>`,
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80',
        lastUpdated: new Date().toISOString()
      },
      support: {
        id: 'support',
        title: 'Support Info (সহায়তা)',
        content: `<h2>সহায়তা কেন্দ্র (Support Center)</h2>
<p>আপনার যেকোনো জিজ্ঞাসায় আমাদের টিম সবসময় পাশে আছে। নিচে আমাদের সাথে যোগাযোগের মাধ্যমগুলো দেওয়া হলো:</p>

<div class="jobs-grid">
  <div class="job-card">
    <h3>লাইভ চ্যাট</h3>
    <p>এডমিনের সাথে সরাসরি কথা বলতে এবং আপনার সমস্যার তাতক্ষনিক সমাধান পেতে লাইভ চ্যাট শুরু করুন।</p>
    <a href="/support" class="btn">চ্যাট শুরু করুন</a>
  </div>
  
  <div class="job-card">
    <h3>পেমেন্ট সাপোর্ট</h3>
    <p>যদি পেমেন্ট পেতে দেরি হয় বা অন্য কোনো ট্রানজেকশন সমস্যা থাকে, তবে আপনার ট্রানজেকশন আইডি সহ মেসেজ দিন।</p>
    <a href="/support" class="btn">রিপোর্ট করুন</a>
  </div>
</div>`,
        imageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2923216?auto=format&fit=crop&q=80',
        lastUpdated: new Date().toISOString()
      }
    };
    updateField('footerPages', defaultPages);
    alert('Default pages have been initialized in memory. Please click "Save Changes" to persist.');
  };

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

        {/* Dynamic Content Pages */}
        <CollapsibleSection 
          title="Dynamic Page Editor"
          subtitle="Footer Links Content"
          icon={<Layout className="w-5 h-5" />}
          iconColor="bg-sky-50 text-sky-600 border-sky-100"
          isOpen={openSection === 'pages'}
          onToggle={() => toggleSection('pages')}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Select Page to Edit</label>
              <button 
                onClick={initializeDefaultPages}
                className="text-[9px] font-black uppercase text-sky-600 bg-sky-50 px-2 py-1 rounded border border-sky-100 hover:bg-sky-100 transition-colors"
              >
                Initialize Default Content
              </button>
            </div>
            <div className="relative">
                <select 
                  value={selectedPageId}
                  onChange={(e) => setSelectedPageId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-bold text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all appearance-none cursor-pointer"
                >
                  {PAGE_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Page Display Title</label>
                <input 
                  type="text"
                  value={currentPage.title}
                  onChange={(e) => updatePageField('title', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Header Image URL (Optional)</label>
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    value={currentPage.imageUrl || ''}
                    onChange={(e) => updatePageField('imageUrl', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-3 font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Page Content (HTML/Text Supported)</label>
                <textarea 
                  value={currentPage.content}
                  onChange={(e) => updatePageField('content', e.target.value)}
                  rows={10}
                  placeholder="Describe the page content here..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-medium text-[11px] leading-relaxed resize-y min-h-[200px]"
                />
              </div>

              <div className="bg-sky-50 rounded-xl p-4 flex items-start gap-3">
                 <Info className="w-4 h-4 text-sky-500 mt-0.5" />
                 <p className="text-[10px] text-sky-600 font-bold uppercase leading-relaxed tracking-tight">
                   Note: This content will be shown when users click on "{PAGE_OPTIONS.find(p => p.id === selectedPageId)?.name}" in the dashboard footer.
                 </p>
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
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">App Download Link</label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={settings?.appDownloadUrl || ''}
                  onChange={(e) => updateField('appDownloadUrl', e.target.value)}
                  placeholder="https://play.google.com/store/apps/details?id=..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-3 font-bold text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 font-medium italic">Link shown in user sidebar for app download</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Terms & Conditions</label>
              <textarea 
                value={settings?.termsAndConditions || ''}
                onChange={(e) => updateField('termsAndConditions', e.target.value)}
                rows={6}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-medium text-[11px] leading-relaxed"
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
