import React from 'react';
import { 
  MessageSquare, 
  HelpCircle, 
  FileText, 
  ChevronRight, 
  Mail, 
  ShieldCheck,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Support() {
  const navigate = useNavigate();

  const options = [
    {
      title: 'Live Chat Support',
      desc: 'Talk to our team in real-time for instant help',
      icon: MessageSquare,
      color: 'bg-indigo-50 text-indigo-600',
      action: () => navigate('/support/chat')
    },
    {
      title: 'Help Center & FAQs',
      desc: 'Read our documentation and common questions',
      icon: FileText,
      color: 'bg-emerald-50 text-emerald-600',
      action: () => navigate('/terms')
    },
    {
      title: 'Email Support',
      desc: 'Send us an email for complex issues',
      icon: Mail,
      color: 'bg-amber-50 text-amber-600',
      action: () => window.location.href = 'mailto:support@pointhub.com'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
         <div className="absolute top-0 right-0 p-12 opacity-10">
            <HelpCircle className="w-48 h-48" />
         </div>
         <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tight">How can we help?</h1>
            <p className="text-indigo-100 font-medium mt-2 max-w-[240px]">Our support team is available to assist you with any questions or technical issues.</p>
         </div>
      </div>

      <div className="space-y-3">
         {options.map((option, idx) => (
           <motion.button
             key={option.title}
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: idx * 0.1 }}
             onClick={option.action}
             className="w-full bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4 hover:border-indigo-300 transition-all group group shadow-sm active:scale-[0.98]"
           >
             <div className={`w-12 h-12 ${option.color} rounded-xl flex items-center justify-center shrink-0`}>
                <option.icon className="w-6 h-6" />
             </div>
             <div className="flex-1 text-left">
                <h4 className="font-black text-slate-800 text-sm leading-tight">{option.title}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">{option.desc}</p>
             </div>
             <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
           </motion.button>
         ))}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center">
         <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-3" />
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Security & Privacy</p>
         <p className="text-xs text-slate-500 font-medium px-4">Your data is secured using enterprise-grade encryption. We never share your personal information with third parties.</p>
      </div>
    </div>
  );
}
