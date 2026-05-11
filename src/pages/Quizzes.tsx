import React, { useEffect, useState } from 'react';
import { 
  Puzzle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Trophy,
  Zap,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getAllQuizzes, getUserQuizAttempts, submitQuizAttempt } from '../lib/dataService';
import { Quiz, UserQuizAttempt } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';

export default function Quizzes() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<UserQuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    const [qData, aData] = await Promise.all([
      getAllQuizzes(true),
      getUserQuizAttempts(user.uid)
    ]);
    if (qData) {
      const now = new Date();
      setQuizzes(qData.filter(q => !q.expiresAt || new Date(q.expiresAt) > now));
    }
    if (aData) setAttempts(aData);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [user]);

  const isCompleted = (quizId: string) => attempts.some(a => a.quizId === quizId);
  const getAttempt = (quizId: string) => attempts.find(a => a.quizId === quizId);

  if (loading) return (
    <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6 pb-32">
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Daily Quizzes</h1>
          <p className="text-slate-400 text-xs font-bold uppercase mt-0.5 tracking-widest">Test knowledge & earn</p>
        </div>
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
           <Zap className="w-6 h-6 text-indigo-600 fill-indigo-600 animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quizzes.map((quiz) => {
          const attempt = getAttempt(quiz.id!);
          const completed = !!attempt;

          return (
            <div key={quiz.id} className="bg-white rounded-[2rem] p-6 border-2 border-slate-50 shadow-sm relative overflow-hidden group">
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                     <div className={cn(
                       "w-12 h-12 rounded-2xl flex items-center justify-center border transition-colors",
                       completed ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-indigo-50 border-indigo-100 text-indigo-600"
                     )}>
                        {completed ? <Trophy className="w-6 h-6" /> : <Puzzle className="w-6 h-6" />}
                     </div>
                     <div className="flex flex-col items-end gap-2">
                        {completed && (
                          <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-emerald-100">
                             <CheckCircle2 className="w-3.5 h-3.5" />
                             Done
                          </div>
                        )}
                        {!completed && quiz.expiresAt && (
                          <div className="bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                             <Clock className="w-3.5 h-3.5" />
                             <Countdown date={quiz.expiresAt} onComplete={load} />
                          </div>
                        )}
                     </div>
                  </div>

                  <h3 className="font-black text-slate-800 text-lg leading-tight mb-2">{quiz.title}</h3>
                  <p className="text-slate-500 text-xs font-medium line-clamp-2 mb-6">{quiz.description}</p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                     <div className="flex items-center gap-4">
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reward</p>
                           <p className="text-sm font-black text-indigo-600">+{quiz.points} <span className="text-[10px]">PTS</span></p>
                        </div>
                        <div className="h-8 w-px bg-slate-100" />
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Questions</p>
                           <p className="text-sm font-black text-slate-700">{quiz.questions.length}</p>
                        </div>
                     </div>

                     {!completed ? (
                       <Link 
                         to={`/quiz/${quiz.id}`}
                         className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all"
                       >
                          Attempt
                          <ArrowRight className="w-3.5 h-3.5" />
                       </Link>
                     ) : (
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Score</p>
                          <p className="text-sm font-black text-emerald-600">{attempt.score}/{attempt.totalQuestions}</p>
                       </div>
                     )}
                  </div>
               </div>

               <div className="absolute -right-4 -bottom-4 opacity-[0.02] transform rotate-12 transition-transform group-hover:scale-125">
                  <Puzzle className="w-32 h-32" />
               </div>
            </div>
          );
        })}

        {quizzes.length === 0 && (
          <div className="col-span-full py-20 text-center space-y-4 bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-200">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 mx-auto">
                <Puzzle className="w-8 h-8 text-slate-300" />
             </div>
             <div>
                <h3 className="font-black text-slate-800">No Active Challenges</h3>
                <p className="text-xs text-slate-400 font-medium">Coming soon! Check back later for new trivia.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Countdown({ date, onComplete }: { date: string, onComplete: () => void }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(date).getTime();
      const diff = target - now;

      if (diff <= 0) {
        clearInterval(timer);
        onComplete();
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${h}h ${m}m ${s}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [date, onComplete]);

  return <span>{timeLeft || 'Ending...'}</span>;
}
