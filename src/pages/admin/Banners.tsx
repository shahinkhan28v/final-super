import React, { useEffect, useState } from 'react';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Edit2, 
  ExternalLink, 
  ArrowUp, 
  ArrowDown,
  ToggleLeft,
  ToggleRight,
  Info,
  Clock,
  Save,
  X,
  Target,
  Globe,
  Sparkles
} from 'lucide-react';
import { getAllBanners, addBanner, updateBanner, deleteBanner, getAppSettings, updateAppSettings } from '../../lib/dataService';
import { Banner, AppSettings } from '../../types';
import { cn } from '../../lib/utils';

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBanner, setNewBanner] = useState<Omit<Banner, 'id'>>({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    buttonText: 'Check it out',
    type: 'promotion',
    orderIndex: 0,
    isActive: true
  });

  useEffect(() => {
    async function load() {
      const [bData, sData] = await Promise.all([
        getAllBanners(),
        getAppSettings()
      ]);
      if (bData) setBanners(bData);
      if (sData) setSettings(sData);
      setLoading(false);
    }
    load();
  }, []);

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await addBanner({ ...newBanner, orderIndex: banners.length });
    const data = await getAllBanners();
    if (data) setBanners(data);
    setShowAddModal(false);
    setNewBanner({ title: '', imageUrl: '', linkUrl: '', orderIndex: 0, isActive: true });
    setLoading(false);
  };

  const handleToggleActive = async (banner: Banner) => {
    if (!banner.id) return;
    await updateBanner(banner.id, { isActive: !banner.isActive });
    setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: !b.isActive } : b));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this banner?')) return;
    await deleteBanner(id);
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  const handleUpdateSettings = async (field: keyof AppSettings, value: any) => {
    if (!settings) return;
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    await updateAppSettings(newSettings);
  };

  const moveBanner = async (index: number, direction: 'up' | 'down') => {
    const newBanners = [...banners];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    const updatedWithIndex = newBanners.map((b, i) => ({ ...b, orderIndex: i }));
    setBanners(updatedWithIndex);
    await Promise.all(updatedWithIndex.map(b => b.id && updateBanner(b.id, { orderIndex: b.orderIndex })));
  };

  const handleSeedDemos = async () => {
    setLoading(true);
    const demoBanners: Omit<Banner, 'id'>[] = [
      {
        title: 'Weekly Bonus Mission',
        description: 'Complete 10 quizzes this week to unlock a massive 5000 point reward plus a premium badge.',
        imageUrl: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1200',
        linkUrl: '/tasks',
        buttonText: 'View Mission',
        type: 'offer',
        orderIndex: 0,
        isActive: true
      },
      {
        title: 'Invite Friends, Earn Real Cash',
        description: 'For every friend who joins using your link, you get 10% of their earnings forever. No limits.',
        imageUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1200',
        linkUrl: '/referrals',
        buttonText: 'Get My Link',
        type: 'promotion',
        orderIndex: 1,
        isActive: true
      },
      {
        title: 'New Video Rewards Live',
        description: 'We just added 20 new high-paying video partner tasks. Watch now and withdraw by tonight!',
        imageUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=1200',
        linkUrl: '/tasks',
        buttonText: 'Watch Videos',
        type: 'news',
        orderIndex: 2,
        isActive: true
      }
    ];

    for (const b of demoBanners) {
      await addBanner(b);
    }
    
    const data = await getAllBanners();
    if (data) setBanners(data);
    setLoading(false);
  };

  if (loading && banners.length === 0) return (
    <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-bold uppercase tracking-widest">Loading Media Assets...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Banner Management</h1>
          <p className="text-slate-500 text-sm font-medium">Configure home sliders, promotional tiles, and navigation highlights</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Banner
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Banner List */}
        <div className="lg:col-span-2 space-y-4">
          {banners.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center text-center">
               <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                 <ImageIcon className="w-8 h-8 text-indigo-200" />
               </div>
               <h3 className="font-black text-slate-800 text-lg tracking-tight">Your slider is empty</h3>
               <p className="text-sm text-slate-500 max-w-xs mt-2 mb-8">Create your first banner or use our professionally designed templates to get started.</p>
               
               <div className="flex flex-col sm:flex-row gap-3">
                 <button 
                   onClick={() => setShowAddModal(true)}
                   className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                 >
                   Create Manually
                 </button>
                 <button 
                  onClick={handleSeedDemos}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                 >
                   Seed Demo Banners
                 </button>
               </div>
            </div>
          ) : (
            banners.map((banner, idx) => (
              <div key={banner.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 group">
                <div className="flex flex-col gap-1">
                   <button 
                     onClick={() => moveBanner(idx, 'up')}
                     disabled={idx === 0}
                     className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                   >
                     <ArrowUp className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => moveBanner(idx, 'down')}
                     disabled={idx === banners.length - 1}
                     className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-20"
                   >
                     <ArrowDown className="w-4 h-4" />
                   </button>
                </div>
                
                <div className="w-32 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                  <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-sm truncate">{banner.title || 'Untitled Banner'}</h3>
                    <div className="flex items-center gap-1">
                      {banner.isActive ? (
                        <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Live</span>
                      ) : (
                        <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">Hidden</span>
                      )}
                      <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                        <Target className="w-2.5 h-2.5" />
                        {banner.clickCount || 0} Taps
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium truncate mt-1">{banner.linkUrl || 'No link attached'}</p>
                  <div className="flex items-center gap-3 mt-2">
                     <button 
                       onClick={() => handleToggleActive(banner)}
                       className="text-[10px] font-black uppercase tracking-tight text-indigo-600 hover:underline"
                     >
                       {banner.isActive ? 'Deactivate' : 'Activate'}
                     </button>
                     <button 
                       onClick={() => handleDelete(banner.id!)}
                       className="text-[10px] font-black uppercase tracking-tight text-rose-500 hover:underline"
                     >
                       Delete
                     </button>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit2 className="w-4 h-4 text-slate-300" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="font-bold text-sm tracking-tight text-slate-800">Site Identity</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Website Branding</p>
                </div>
             </div>

             <div className="space-y-4">
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Official Logo URL</label>
                   <input type="text" placeholder="https://..." className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none" />
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Welcome Message</label>
                   <input type="text" placeholder="Hey, Welcome Back!" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium outline-none" />
                </div>
                <button className="w-full py-2 bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-colors">
                  Save Identity
                </button>
             </div>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl shadow-indigo-900/10 border border-slate-800">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                   <h3 className="font-bold text-sm tracking-tight">Slider Configuration</h3>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Runtime Settings</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-xs font-bold">Auto-Slide Carousel</p>
                      <p className="text-[10px] text-slate-400 font-medium">Banners change automatically</p>
                   </div>
                   <button 
                     onClick={() => handleUpdateSettings('bannerAutoSlide', !settings?.bannerAutoSlide)}
                     className="text-indigo-400"
                   >
                     {settings?.bannerAutoSlide ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-slate-600" />}
                   </button>
                </div>

                <div className="space-y-2">
                   <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transition Interval</label>
                      <span className="text-xs font-black text-indigo-400">{settings?.bannerInterval || 7}s</span>
                   </div>
                   <input 
                     type="range" 
                     min="3" 
                     max="15" 
                     value={settings?.bannerInterval || 7}
                     onChange={(e) => handleUpdateSettings('bannerInterval', Number(e.target.value))}
                     className="w-full accent-indigo-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                   />
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-start gap-3">
                   <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                   <p className="text-[10px] text-slate-400 leading-relaxed italic">
                     These settings are global and update instantly for all users across mobile and web platforms.
                   </p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-black text-slate-800 tracking-tight">Create Highlight Banner</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddBanner} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
               <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Promotion Type</label>
                  <select 
                    value={newBanner.type}
                    onChange={(e) => setNewBanner({ ...newBanner, type: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all outline-none"
                  >
                    <option value="promotion">Promotion</option>
                    <option value="offer">Special Offer</option>
                    <option value="news">App News</option>
                    <option value="alert">System Alert</option>
                  </select>
               </div>

               <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Banner Image URL</label>
                  <div className="relative group">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type="url" 
                      required
                      placeholder="https://images.unsplash.com/promo-art..."
                      value={newBanner.imageUrl}
                      onChange={(e) => setNewBanner({ ...newBanner, imageUrl: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all outline-none"
                    />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Title</label>
                    <input 
                      type="text" 
                      placeholder="Mega Bonus"
                      value={newBanner.title}
                      onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Button Label</label>
                    <input 
                      type="text" 
                      placeholder="Claim Points"
                      value={newBanner.buttonText}
                      onChange={(e) => setNewBanner({ ...newBanner, buttonText: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all outline-none"
                    />
                  </div>
               </div>

               <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Short Description</label>
                  <textarea 
                    placeholder="Earn double points on all quiz tasks..."
                    value={newBanner.description}
                    onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all outline-none resize-none"
                  />
               </div>

               <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Link / URL</label>
                  <div className="relative group">
                    <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                    <input 
                      type="url" 
                      placeholder="https://pointhub.com/claim-reward"
                      value={newBanner.linkUrl}
                      onChange={(e) => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all outline-none"
                    />
                  </div>
               </div>

               <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    Add Asset
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
