import React, { useEffect, useState } from 'react';
import { 
  Puzzle, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Layout
} from 'lucide-react';
import { subscribeToAllQuizzes, addQuiz, updateQuiz, deleteQuiz } from '../../lib/dataService';
import { Quiz, QuizQuestion } from '../../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    const unsub = subscribeToAllQuizzes((data) => {
      setQuizzes(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this quiz? All user attempts will remain but references might break.')) {
      await deleteQuiz(id);
    }
  };

  const handleToggleActive = async (quiz: Quiz) => {
    await updateQuiz(quiz.id!, { isActive: !quiz.isActive });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            Quiz Master
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] uppercase tracking-widest rounded-full border border-indigo-100">
              Interactive Rewards
            </span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Create engaging surveys and multi-step knowledge challenges</p>
        </div>
        <button 
          onClick={() => {
            setEditingQuiz(null);
            setShowAddModal(true);
          }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create New Quiz
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-[2rem] p-6 border-2 border-slate-50 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all group relative">
             <div className="flex justify-between items-start mb-4">
                <div className={cn(
                  "p-3 rounded-2xl",
                  quiz.isActive ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-400"
                )}>
                   <Puzzle className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => handleToggleActive(quiz)}
                     className={cn(
                       "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all",
                       quiz.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                     )}
                   >
                      {quiz.isActive ? 'Live' : 'Draft'}
                   </button>
                </div>
             </div>

             <h3 className="font-black text-slate-800 text-lg leading-tight mb-2">{quiz.title}</h3>
             <p className="text-slate-500 text-xs font-medium line-clamp-2 mb-6">{quiz.description}</p>

             <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center gap-4">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payout</p>
                      <p className="text-sm font-black text-indigo-600">{quiz.points} <span className="text-[10px]">PTS</span></p>
                   </div>
                   <div className="h-8 w-px bg-slate-100" />
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Steps</p>
                      <p className="text-sm font-black text-slate-700">{quiz.questions.length} <span className="text-[10px]">Q</span></p>
                   </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                     onClick={() => {
                       setEditingQuiz(quiz);
                       setShowAddModal(true);
                     }}
                     className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                   >
                      <Edit3 className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => handleDelete(quiz.id!)}
                     className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                   >
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
             </div>
          </div>
        ))}

        {quizzes.length === 0 && !loading && (
          <div className="col-span-full py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center px-6">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6">
                <Puzzle className="w-8 h-8 text-slate-300" />
             </div>
             <h3 className="text-slate-800 font-black text-xl">No Quizzes Created</h3>
             <p className="text-slate-400 text-sm max-w-xs mt-2 font-medium">Create interactive challenges to keep your users engaged and earning more.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <QuizFormModal 
            onClose={() => setShowAddModal(false)}
            onSave={() => {}}
            quiz={editingQuiz}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function QuizFormModal({ onClose, onSave, quiz }: { onClose: () => void, onSave: () => void, quiz: Quiz | null }) {
  const [formData, setFormData] = useState<Omit<Quiz, 'id' | 'createdAt'>>({
    title: quiz?.title || '',
    description: quiz?.description || '',
    points: quiz?.points || 10,
    questions: quiz?.questions || [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }],
    isActive: quiz?.isActive ?? true,
    expiresAt: quiz?.expiresAt || ''
  });
  const [saving, setSaving] = useState(false);

  const handleAddQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? { ...q, [field]: value } : q)
    }));
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === qIndex ? {
        ...q,
        options: q.options.map((o, j) => j === oIndex ? value : o)
      } : q)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (quiz?.id) {
        await updateQuiz(quiz.id, formData);
      } else {
        await addQuiz({ ...formData, createdAt: new Date().toISOString() });
      }
      onSave();
      onClose();
    } catch (e) {
      alert('Error saving quiz');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
               {quiz ? 'Modify Quiz Structure' : 'Engineer New Challenge'}
            </h2>
            <p className="text-slate-400 text-sm font-medium">Define metadata and question hierarchy</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
           {/* Basic Meta */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Quiz Title</label>
                 <input 
                   required
                   value={formData.title}
                   onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                   className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                   placeholder="e.g. Daily Tech Trivia"
                 />
              </div>
              <div className="space-y-4">
                 <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Reward Multiplier (PTS)</label>
                 <input 
                   type="number"
                   required
                   value={formData.points}
                   onChange={(e) => setFormData(prev => ({ ...prev, points: Number(e.target.value) }))}
                   className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                 />
              </div>
              <div className="space-y-4">
                 <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiration Window (Optional)</label>
                 <input 
                   type="datetime-local"
                   value={formData.expiresAt ? new Date(formData.expiresAt).toISOString().slice(0, 16) : ''}
                   onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
                   className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                 />
              </div>
              <div className="col-span-full space-y-4">
                 <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Instructional Text</label>
                 <textarea 
                   required
                   value={formData.description}
                   onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                   rows={2}
                   className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl p-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-600 outline-none transition-all resize-none"
                   placeholder="Briefly explain what this quiz is about..."
                 />
              </div>
           </div>

           {/* Questions Section */}
           <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    Question Hierarchy
                    <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded text-[10px]">{formData.questions.length}</span>
                 </h3>
                 <button 
                   type="button"
                   onClick={handleAddQuestion}
                   className="text-xs font-black text-indigo-600 flex items-center gap-2 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all"
                 >
                    <Plus className="w-4 h-4" />
                    Add Step
                 </button>
              </div>

              <div className="space-y-8">
                 {formData.questions.map((q, qIndex) => (
                    <div key={qIndex} className="bg-slate-50/50 rounded-[2rem] p-6 border-2 border-slate-100 relative group">
                       <button 
                         type="button"
                         onClick={() => handleRemoveQuestion(qIndex)}
                         className="absolute -top-3 -right-3 w-8 h-8 bg-white border-2 border-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                       >
                          <X className="w-4 h-4" />
                       </button>

                       <div className="space-y-6">
                          <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Question {qIndex + 1}</label>
                             <input 
                               required
                               value={q.question}
                               onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                               className="w-full bg-white border-2 border-transparent rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-indigo-600 outline-none transition-all"
                               placeholder="Enter your question here..."
                             />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {q.options.map((opt, oIndex) => (
                               <div key={oIndex} className="relative group/opt">
                                  <input 
                                    required
                                    value={opt}
                                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                    className={cn(
                                      "w-full bg-white border-2 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold transition-all outline-none",
                                      q.correctAnswer === oIndex ? "border-emerald-500 ring-2 ring-emerald-50" : "border-slate-100 focus:border-indigo-600"
                                    )}
                                    placeholder={`Option ${oIndex + 1}`}
                                  />
                                  <button 
                                    type="button"
                                    onClick={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                                    className={cn(
                                      "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md flex items-center justify-center transition-all",
                                      q.correctAnswer === oIndex ? "bg-emerald-500 text-white shadow-md shadow-emerald-100" : "bg-slate-100 text-slate-300 hover:bg-slate-200"
                                    )}
                                  >
                                     <CheckCircle2 className="w-3 h-3" />
                                  </button>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="pt-8 border-t border-slate-100 sticky bottom-0 bg-white pb-2 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                 <button 
                   type="button"
                   onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                   className={cn(
                     "flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all text-xs font-black uppercase tracking-widest",
                     formData.isActive ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-50 border-slate-100 text-slate-400"
                   )}
                 >
                    {formData.isActive ? 'Status: Active' : 'Status: Hidden'}
                 </button>
              </div>
              <button 
                type="submit"
                disabled={saving}
                className="bg-slate-900 text-white h-14 px-10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : <Save className="w-4 h-4" />}
                {saving ? 'Syncing...' : 'Publish Challenge'}
              </button>
           </div>
        </form>
      </motion.div>
    </div>
  );
}
