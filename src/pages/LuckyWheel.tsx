import React, { useEffect, useState, useRef } from 'react';
import { 
  Zap, 
  RotateCw, 
  Trophy, 
  Share2, 
  ArrowLeft,
  ArrowRight,
  Star,
  Info,
  Gift
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getAppSettings, useLuckySpin } from '../lib/dataService';
import { AppSettings, WheelSlice } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';

export default function LuckyWheel() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<WheelSlice | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      drawWheel();
    }
  }, [settings, rotation]);

  async function loadSettings() {
    const data = await getAppSettings();
    setSettings(data);
  }

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas || !settings) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const slices = settings.luckyWheel.slices;
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 10;
    const sliceAngle = (2 * Math.PI) / slices.length;

    ctx.clearRect(0, 0, size, size);
    
    // Draw slices
    slices.forEach((slice, i) => {
      const angle = i * sliceAngle + rotation;
      
      ctx.beginPath();
      ctx.fillStyle = slice.color;
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + sliceAngle);
      ctx.lineTo(center, center);
      ctx.fill();
      
      // Add text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Inter';
      ctx.fillText(slice.label, radius - 15, 5);
      ctx.restore();
    });

    // Draw center peg
    ctx.beginPath();
    ctx.fillStyle = '#ffffff';
    ctx.arc(center, center, 15, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw arrow/indicator
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(size - 30, center);
    ctx.lineTo(size, center - 15);
    ctx.lineTo(size, center + 15);
    ctx.closePath();
    ctx.fill();
  };

  const handleSpin = async () => {
    if (!user || isSpinning || (profile?.spins || 0) < 1) return;

    setIsSpinning(true);
    setResult(null);

    try {
      const res = await useLuckySpin(user.uid);
      
      const slices = settings?.luckyWheel.slices || [];
      const sliceIndex = slices.findIndex(s => s.label === res.slice.label);
      const sliceAngle = (2 * Math.PI) / slices.length;
      
      // Calculate target rotation
      // Random extra rotations + target slice position
      const extraSpins = 5 + Math.floor(Math.random() * 5);
      // We want the indicator (on the right at angle 0 relative to canvas?) 
      // Actually indicator is at size-30, center.
      // The slice at index i starts at rotation + i*sliceAngle.
      // To landing slice i at the pointer (0 angle), rotation + i*sliceAngle + offset = 0
      // So targetRotation = - (i * sliceAngle + sliceAngle / 2)
      const targetRotation = 2 * Math.PI * extraSpins - (sliceIndex * sliceAngle + sliceAngle / 2);
      
      let currentRotation = rotation;
      const startTime = performance.now();
      const duration = 4000;

      const animate = (time: number) => {
        const elapsed = time - startTime;
        const p = Math.min(elapsed / duration, 1);
        
        // Custom easing (easeOutQuart)
        const ease = 1 - Math.pow(1 - p, 4);
        const newRotation = currentRotation + (targetRotation - currentRotation) * ease;
        
        setRotation(newRotation % (2 * Math.PI));
        
        if (p < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsSpinning(false);
          setResult(res.slice);
        }
      };

      requestAnimationFrame(animate);
    } catch (err) {
      setIsSpinning(false);
      alert('Error spinning the wheel');
    }
  };

  return (
    <div className="space-y-8 pb-32">
       {/* Header */}
       <div className="flex items-center justify-between px-2">
          <div className="w-10 h-10"></div>
          <div className="text-center">
             <h1 className="text-xl font-black text-slate-800 tracking-tight">Lucky Wheel</h1>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Spin to win rewards</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
             <Zap className="w-6 h-6 text-indigo-600 fill-indigo-600 animate-pulse" />
          </div>
       </div>

       {/* Wheel Container */}
       <div className="flex flex-col items-center justify-center gap-10 py-10 relative">
          <div className="relative group">
             <div className="absolute inset-0 bg-indigo-600/5 blur-[80px] rounded-full" />
             <canvas 
               ref={canvasRef} 
               width={320} 
               height={320} 
               className="relative z-10 drop-shadow-2xl"
             />
             
             <div className={cn(
               "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 bg-white rounded-full flex flex-col items-center justify-center shadow-xl border-4 border-slate-50 transition-transform",
               isSpinning && "scale-110"
             )}>
                <p className="text-[8px] font-black text-slate-400 uppercase leading-none">Spins</p>
                <p className="text-lg font-black text-slate-800">{profile?.spins || 0}</p>
             </div>
          </div>

          <div className="w-full max-w-sm space-y-6 px-4">
             <button 
               disabled={isSpinning || (profile?.spins || 0) < 1}
               onClick={handleSpin}
               className="w-full h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xs font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-black transition-all disabled:opacity-40 disabled:grayscale relative overflow-hidden group/btn"
             >
                <div className="relative z-10 flex items-center gap-3">
                   <RotateCw className={cn("w-4 h-4", isSpinning && "animate-spin")} />
                   {isSpinning ? 'Wheel spinning...' : 'Activate Spin'}
                </div>
                {!isSpinning && (profile?.spins || 0) > 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                )}
             </button>

             <Link 
               to="/refer"
               className="w-full py-4 border-2 border-dashed border-indigo-100 rounded-2xl flex items-center justify-center gap-3 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all"
             >
                <Share2 className="w-4 h-4" />
                Invite Friends for more spins
             </Link>
          </div>
       </div>

       {/* Results Modal */}
       <AnimatePresence>
          {result && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setResult(null)}
                 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden text-center"
               >
                  <div className={cn(
                    "p-10 space-y-6",
                    result.value > 0 ? "bg-gradient-to-br from-indigo-600 to-indigo-800" : "bg-slate-900"
                  )}>
                     <div className="w-20 h-20 bg-white/10 rounded-[2rem] border border-white/20 flex items-center justify-center mx-auto backdrop-blur-md">
                        {result.value > 0 ? <Trophy className="w-10 h-10 text-white" /> : <FrownFace />}
                     </div>
                     <div className="space-y-2">
                        <h2 className="text-white font-black text-2xl tracking-tight">
                           {result.value > 0 ? 'Jackpot!' : 'Try Again'}
                        </h2>
                        <p className="text-indigo-100/70 text-[10px] font-bold uppercase tracking-[0.2em]">
                           {result.value > 0 ? `You won ${result.value} Points` : 'Better luck next time!'}
                        </p>
                     </div>
                  </div>

                  <div className="p-8 space-y-4">
                     {result.value > 0 && (
                       <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-left">
                          <Star className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-emerald-700 font-bold leading-relaxed">
                             Rewards have been added to your vault. Keep spinning to maximize your daily earnings!
                          </p>
                       </div>
                     )}

                     <button 
                       onClick={() => setResult(null)}
                       className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl"
                     >
                        Claim Prize
                     </button>
                  </div>
               </motion.div>
            </div>
          )}
       </AnimatePresence>

       {/* How to Earn */}
       <div className="px-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <Info className="w-4 h-4 text-indigo-600" />
             <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">How to earn spins?</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
             <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                      <Gift className="w-4 h-4" />
                   </div>
                   <div>
                      <p className="text-xs font-black text-slate-800">Complete Missions</p>
                      <p className="text-[10px] text-slate-400 font-medium">Earn {settings?.luckyWheel.spinsPerTask} spin per task</p>
                   </div>
                </div>
                <Link to="/tasks" className="text-indigo-600">
                   <ArrowRight className="w-4 h-4" />
                </Link>
             </div>

             <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                      <Puzzle className="w-4 h-4" />
                   </div>
                   <div>
                      <p className="text-xs font-black text-slate-800">Knowledge Quizzes</p>
                      <p className="text-[10px] text-slate-400 font-medium">Earn {settings?.luckyWheel.spinsPerQuiz} spins per quiz</p>
                   </div>
                </div>
                <Link to="/quizzes" className="text-indigo-600">
                   <ArrowRight className="w-4 h-4" />
                </Link>
             </div>
          </div>
       </div>
    </div>
  );
}

function FrownFace() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
      <circle cx="12" cy="12" r="10" />
      <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );
}

function Puzzle(props: any) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11.75 10.5c.5.5 1 .5 1.5 0 .5-.5.5-1.5 0-2-.5-.5-1.5-.5-2 0-.5.5-.5 1.5 0 2 .5.5 1 .5 1.5 0z" />
      <path d="M11.75 10.5c-.5.5-1 .5-1.5 0-.5-.5-.5-1.5 0-2 .5-.5 1.5-.5 2 0 .5.5.5 1.5 0 2-.5.5-1 .5-1.5 0z" />
      <path d="M4 8V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
      <path d="M2 15h2.5c.3 0 .5.2.5.5v.5c0 .3-.2.5-.5.5H2" />
      <path d="M2 9h2.5c.3 0 .5.2.5.5v.5c0 .3-.2.5-.5.5H2" />
      <path d="M15 2v2.5c0 .3-.2.5-.5.5h-.5c-.3 0-.5-.2-.5-.5V2" />
      <path d="M9 2v2.5c0 .3-.2.5-.5.5h-.5c-.3 0-.5-.2-.5-.5V2" />
    </svg>
  );
}
