import React, { useEffect, useState } from 'react';
import { 
  Puzzle, 
  ArrowRight, 
  CheckCircle2, 
  Trophy,
  Zap,
  ArrowLeft,
  X,
  Star,
  Frown,
  PartyPopper
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getAllQuizzes, submitQuizAttempt } from '../lib/dataService';
import { Quiz, UserQuizAttempt } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function QuizPlayer() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getAllQuizzes(true);
      const found = data?.find(q => q.id === id);
      if (found) {
        setQuiz(found);
      } else {
        navigate('/quizzes');
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleNext = async () => {
    if (!quiz) return;
    
    // Increment score if correct
    if (selectedOption === quiz.questions[currentStep].correctAnswer) {
      setScore(prev => prev + 1);
    }

    if (currentStep < quiz.questions.length - 1) {
      setCurrentStep(prev => prev + 1);
      setSelectedOption(null);
    } else {
      await finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (!user || !quiz) return;
    setSubmitting(true);
    
    // Final score calculation must include the last question
    const finalScore = selectedOption === quiz.questions[currentStep].correctAnswer ? score + 1 : score;
    setScore(finalScore);
    
    await submitQuizAttempt(user.uid, quiz, finalScore);
    setIsFinished(true);
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center">
       <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!quiz) return null;

  if (isFinished) {
    const percentage = (score / quiz.questions.length) * 100;
    const earned = Math.floor((score / quiz.questions.length) * quiz.points);

    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-8">
         <motion.div 
           initial={{ scale: 0.5, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className={cn(
             "w-32 h-32 rounded-[2.5rem] flex items-center justify-center shadow-2xl relative",
             percentage >= 50 ? "bg-emerald-500 text-white shadow-emerald-100" : "bg-indigo-600 text-white shadow-indigo-100"
           )}
         >
            {percentage >= 50 ? <PartyPopper className="w-16 h-16" /> : <Frown className="w-16 h-16" />}
            <div className="absolute -top-4 -right-4 bg-white text-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-slate-50 font-black">
               {Math.round(percentage)}%
            </div>
         </motion.div>

         <div className="space-y-4">
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
               {percentage === 100 ? 'Absolute Legend!' : percentage >= 50 ? 'Great Performance!' : 'Keep Practicing!'}
            </h1>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">
               You correctly answered <span className="font-black text-slate-800">{score} out of {quiz.questions.length}</span> questions. 
               Your rewards have been synced with your vault.
            </p>
         </div>

         <div className="bg-white rounded-[2.5rem] p-6 border-2 border-slate-50 shadow-sm w-full max-w-sm">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                     <Star className="w-5 h-5 fill-amber-500" />
                  </div>
                  <div className="text-left">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Earnings</p>
                     <p className="text-sm font-black text-slate-800 mb-[-2px]">Experience Points</p>
                  </div>
               </div>
               <p className="text-xl font-black text-indigo-600">+{earned} <span className="text-xs">PTS</span></p>
            </div>
         </div>

         <div className="pt-8 w-full max-w-sm space-y-4">
            <Link 
              to="/quizzes" 
              className="block w-full h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all"
            >
               Return to Hub
            </Link>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Rewards credited instantly</p>
         </div>
      </div>
    );
  }

  const q = quiz.questions[currentStep];
  const progress = ((currentStep + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen py-8 space-y-8 flex flex-col">
       {/* Header */}
       <div className="flex items-center justify-between px-2 shrink-0">
          <div className="w-10 h-10"></div>
          <div className="text-center">
             <h2 className="text-sm font-black text-slate-800 tracking-tight">{quiz.title}</h2>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Knowledge Burst</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs">
             {currentStep + 1}
          </div>
       </div>

       {/* Progress Bar */}
       <div className="px-2 shrink-0">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               className="h-full bg-indigo-600"
             />
          </div>
       </div>

       {/* Question Content */}
       <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full px-2 py-8">
          <AnimatePresence mode="wait">
             <motion.div 
               key={currentStep}
               initial={{ x: 20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               exit={{ x: -20, opacity: 0 }}
               className="space-y-10"
             >
                <div className="space-y-2 text-center">
                   <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Question {currentStep + 1} of {quiz.questions.length}</span>
                   <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                      {q.question}
                   </h1>
                </div>

                <div className="grid grid-cols-1 gap-3">
                   {q.options.map((opt, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setSelectedOption(idx)}
                        className={cn(
                          "w-full p-5 sm:p-6 rounded-[2rem] border-2 text-center transition-all group relative",
                          selectedOption === idx 
                            ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-100 scale-[1.01]" 
                            : "bg-white border-slate-50 hover:border-indigo-100 hover:bg-slate-50/50"
                        )}
                      >
                         <p className={cn(
                           "font-black text-sm sm:text-base leading-tight",
                           selectedOption === idx ? "text-white" : "text-slate-800"
                         )}>
                            {opt}
                         </p>
                      </button>
                   ))}
                </div>
             </motion.div>
          </AnimatePresence>
       </div>

       {/* Action Area */}
       <div className="pt-12 px-2 shrink-0">
          <button 
            disabled={selectedOption === null || submitting}
            onClick={handleNext}
            className="w-full h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all disabled:opacity-30 disabled:grayscale disabled:scale-95 flex items-center gap-3"
          >
             {submitting ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             ) : (
               <>
                 {currentStep < quiz.questions.length - 1 ? 'Next Question' : 'Complete Challenge'}
                 <ArrowRight className="w-4 h-4" />
               </>
             )}
          </button>
       </div>
    </div>
  );
}
