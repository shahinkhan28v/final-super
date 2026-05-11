import React, { useEffect, useState } from 'react';
import { 
  RotateCw, 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle,
  Hash,
  Palette,
  Settings
} from 'lucide-react';
import { getAppSettings, updateAppSettings } from '../../lib/dataService';
import { AppSettings, WheelSlice } from '../../types';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

export default function AdminLuckyWheel() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const data = await getAppSettings();
    // Ensure luckyWheel exists to prevent crashes
    if (!data.luckyWheel) {
      data.luckyWheel = {
        spinsPerTask: 1,
        spinsPerQuiz: 2,
        slices: [
          { label: '5 PTS', value: 5, probability: 0.3, color: '#4f46e5' },
          { label: '10 PTS', value: 10, probability: 0.25, color: '#7c3aed' },
          { label: '20 PTS', value: 20, probability: 0.15, color: '#2563eb' },
          { label: '50 PTS', value: 50, probability: 0.1, color: '#059669' },
          { label: '100 PTS', value: 100, probability: 0.05, color: '#d97706' },
          { label: 'Better luck!', value: 0, probability: 0.15, color: '#64748b' }
        ]
      };
    }
    setSettings(data);
  }

  const handleUpdateSlice = (index: number, field: keyof WheelSlice, value: any) => {
    if (!settings) return;
    const newSlices = [...settings.luckyWheel.slices];
    newSlices[index] = { ...newSlices[index], [field]: value };
    setSettings({
      ...settings,
      luckyWheel: { ...settings.luckyWheel, slices: newSlices }
    });
  };

  const handleRemoveSlice = (index: number) => {
    if (!settings) return;
    const newSlices = settings.luckyWheel.slices.filter((_, i) => i !== index);
    setSettings({
      ...settings,
      luckyWheel: { ...settings.luckyWheel, slices: newSlices }
    });
  };

  const handleAddSlice = () => {
    if (!settings) return;
    const newSlice: WheelSlice = { label: 'New Slice', value: 0, probability: 0, color: '#6366f1' };
    setSettings({
      ...settings,
      luckyWheel: { ...settings.luckyWheel, slices: [...settings.luckyWheel.slices, newSlice] }
    });
  };

  const handleSave = async () => {
    if (!settings) return;
    
    // Validate probabilities
    const sum = settings.luckyWheel.slices.reduce((acc, s) => acc + s.probability, 0);
    if (Math.abs(sum - 1) > 0.01) {
      setError(`Probabilities must sum to 1.0 (Current: ${sum.toFixed(2)})`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updateAppSettings(settings);
      alert('Wheel settings updated successfully!');
    } catch (e) {
      setError('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
       <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
             Wheel Architect
             <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] uppercase tracking-widest rounded-full border border-indigo-100">
                Random Rewards
             </span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Configure probability distributions and reward slices for the user lucky wheel</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[2rem] p-6 border-2 border-slate-50 shadow-sm space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <Settings className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Grant Logistics</h3>
             </div>
             
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Spins per Task Complete</label>
                   <input 
                     type="number"
                     value={settings.luckyWheel.spinsPerTask}
                     onChange={(e) => setSettings({ ...settings, luckyWheel: { ...settings.luckyWheel, spinsPerTask: Number(e.target.value) } })}
                     className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Spins per Quiz Complete</label>
                   <input 
                     type="number"
                     value={settings.luckyWheel.spinsPerQuiz}
                     onChange={(e) => setSettings({ ...settings, luckyWheel: { ...settings.luckyWheel, spinsPerQuiz: Number(e.target.value) } })}
                     className="w-full bg-slate-50 border-2 border-transparent rounded-2xl p-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                   />
                </div>
             </div>
          </div>

          <div className="bg-indigo-900 rounded-[2rem] p-8 text-white relative overflow-hidden flex flex-col justify-center">
             <div className="relative z-10 space-y-4">
                <h4 className="font-black text-lg tracking-tight">Probability Guard</h4>
                <p className="text-indigo-200 text-xs font-medium leading-relaxed">
                   The sum of all slice probabilities must equal exactly 1.00. This ensures the random number generator functions correctly across all reward tiers.
                </p>
                <div className="pt-2">
                   <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/10">
                      <Hash className="w-4 h-4 text-white" />
                      <span className="text-sm font-black">Sum: {settings.luckyWheel.slices.reduce((acc, s) => acc + s.probability, 0).toFixed(2)}</span>
                   </div>
                </div>
             </div>
             <RotateCw className="absolute -right-10 -bottom-10 w-40 h-40 text-white/5" />
          </div>
       </div>

       <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-3">
                Slice Configuration
                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px]">{settings.luckyWheel.slices.length} Slices</span>
             </h3>
             <button 
               onClick={handleAddSlice}
               className="text-indigo-600 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white px-4 py-2 rounded-xl transition-all"
             >
                <Plus className="w-4 h-4" />
                Add Reward Tier
             </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
             {settings.luckyWheel.slices.map((slice, idx) => (
                <div key={idx} className="bg-white rounded-[1.5rem] p-5 border-2 border-slate-50 shadow-sm flex flex-wrap items-center gap-6 group">
                   <div className="flex items-center gap-3 min-w-[200px] flex-1">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" 
                        style={{ backgroundColor: slice.color }}
                      >
                         <Palette className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                         <input 
                           type="text"
                           value={slice.label}
                           onChange={(e) => handleUpdateSlice(idx, 'label', e.target.value)}
                           className="bg-transparent border-none p-0 text-sm font-black text-slate-800 outline-none w-full"
                           placeholder="Label..."
                         />
                         <input 
                           type="text"
                           value={slice.color}
                           onChange={(e) => handleUpdateSlice(idx, 'color', e.target.value)}
                           className="bg-transparent border-none p-0 text-[10px] font-bold text-slate-400 outline-none w-full"
                         />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
                      <div>
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Points</label>
                         <input 
                           type="number"
                           value={slice.value}
                           onChange={(e) => handleUpdateSlice(idx, 'value', Number(e.target.value))}
                           className="bg-slate-50 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 w-20 outline-none focus:bg-white focus:ring-2 ring-indigo-50"
                         />
                      </div>
                      <div>
                         <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1 ml-1">Weight</label>
                         <input 
                           type="number"
                           step="0.01"
                           value={slice.probability}
                           onChange={(e) => handleUpdateSlice(idx, 'probability', Number(e.target.value))}
                           className="bg-slate-50 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 w-20 outline-none focus:bg-white focus:ring-2 ring-indigo-50"
                         />
                      </div>
                   </div>

                   <button 
                     onClick={() => handleRemoveSlice(idx)}
                     className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                   >
                      <Trash2 className="w-5 h-5" />
                   </button>
                </div>
             ))}
          </div>
       </div>

       {error && (
         <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold">
            <AlertCircle className="w-5 h-5" />
            {error}
         </div>
       )}

       <div className="pt-8 border-t border-slate-100 sticky bottom-0 bg-slate-50/80 backdrop-blur-md pb-8 flex items-center justify-end">
          <button 
            disabled={saving}
            onClick={handleSave}
            className="bg-slate-900 text-white h-14 px-12 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
             {saving ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             ) : (
               <Save className="w-4 h-4" />
             )}
             {saving ? 'Saving System' : 'Commit Changes'}
          </button>
       </div>
    </div>
  );
}
