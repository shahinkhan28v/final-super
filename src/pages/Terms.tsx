import React, { useEffect, useState } from 'react';
import { FileText, Shield, Info, RefreshCw } from 'lucide-react';
import { getAppSettings } from '../lib/dataService';
import { AppSettings } from '../types';
import { motion } from 'motion/react';

export default function Terms() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppSettings().then(data => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
      <RefreshCw className="w-8 h-8 animate-spin mb-4" />
      <p className="font-bold text-sm uppercase tracking-widest">Loading Policies...</p>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Shield className="w-32 h-32" />
        </div>
        
        <div className="flex items-center gap-4 mb-6">
           <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FileText className="w-6 h-6" />
           </div>
           <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Terms of Use</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol & User Guidelines</p>
           </div>
        </div>

        <div className="prose prose-slate max-w-none">
           <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium">
              {settings?.termsAndConditions || "No terms and conditions have been defined yet."}
           </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex gap-4">
         <Info className="w-6 h-6 text-amber-600 shrink-0" />
         <div>
            <h4 className="font-bold text-amber-900 text-sm">Policy Update</h4>
            <p className="text-amber-700 text-xs mt-1 leading-relaxed">We reserve the right to update these terms at any time. Continued use of PointHub constitutes acceptance of the latest protocols.</p>
         </div>
      </div>
    </div>
  );
}
