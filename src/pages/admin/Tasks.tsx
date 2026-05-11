import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ExternalLink, 
  Clock, 
  Gift, 
  CheckCircle,
  X,
  Youtube,
  Globe,
  FileText,
  Smartphone,
  Eye,
  EyeOff,
  History
} from 'lucide-react';
import { subscribeToAllTasks, addTask, updateTask, deleteTask } from '../../lib/dataService';
import { Task, TaskType } from '../../types';
import { cn } from '../../lib/utils';

export default function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
    title: '',
    description: '',
    type: 'visit_website',
    targetUrl: '',
    requiredSeconds: 30,
    rewardPoints: 50,
    isActive: true,
    category: 'General',
    expiresAt: ''
  });

  useEffect(() => {
    const unsub = subscribeToAllTasks((data) => {
      setTasks(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id!, newTask);
      } else {
        await addTask(newTask);
      }
      setShowAddModal(false);
      setEditingTask(null);
      setNewTask({
        title: '',
        description: '',
        type: 'visit_website',
        targetUrl: '',
        requiredSeconds: 30,
        rewardPoints: 50,
        isActive: true,
        category: 'General',
        expiresAt: ''
      });
    } catch (error) {
      console.error(error);
      alert('Failed to save task');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Delete this task permanently?')) return;
    try {
      await deleteTask(id);
    } catch (error) {
      console.error(error);
      alert('Failed to delete task');
    }
  };

  const handleDeleteExpired = async () => {
    const expired = tasks.filter(t => t.expiresAt && new Date(t.expiresAt) < new Date());
    if (expired.length === 0) {
      alert('No expired tasks found.');
      return;
    }
    if (!window.confirm(`Delete all ${expired.length} expired tasks?`)) return;
    
    setActionLoading(true);
    try {
      await Promise.all(expired.map(t => deleteTask(t.id!)));
      alert(`${expired.length} expired tasks deleted.`);
    } catch (error) {
      console.error(error);
      alert('Some tasks could not be deleted');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      description: task.description,
      type: task.type,
      targetUrl: task.targetUrl,
      requiredSeconds: task.requiredSeconds,
      rewardPoints: task.rewardPoints,
      isActive: task.isActive,
      category: task.category,
      expiresAt: task.expiresAt || ''
    });
    setShowAddModal(true);
  };

  const handleToggleActive = async (task: Task) => {
    if (!task.id) return;
    await updateTask(task.id, { isActive: !task.isActive });
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, isActive: !t.isActive } : t));
  };

  const getTypeIcon = (type: TaskType) => {
    switch(type) {
      case 'visit_website': return <Globe className="w-5 h-5" />;
      case 'watch_youtube': return <Youtube className="w-5 h-5" />;
      case 'submit_form': return <FileText className="w-5 h-5" />;
      case 'download_app': return <Smartphone className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  if (loading && tasks.length === 0) return (
    <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Syncing Rewards Matrix...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Task Management</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Design rewarding experiences and verification loops</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDeleteExpired}
            disabled={actionLoading}
            className="px-6 py-3 bg-white text-rose-600 border border-rose-100 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm flex items-center gap-2 hover:bg-rose-50 active:scale-95 transition-all disabled:opacity-50"
          >
            <History className="w-4 h-4" />
            Cleanup Expired
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create New Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <div key={task.id} className={cn(
            "bg-white p-6 rounded-3xl shadow-sm border-2 transition-all relative group",
            task.isActive ? "border-slate-50 hover:border-indigo-100" : "border-slate-100 grayscale opacity-60"
          )}>
            <div className="absolute top-4 right-4">
               <button 
                 onClick={() => handleToggleActive(task)}
                 className={cn(
                   "p-2 rounded-xl transition-colors",
                   task.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                 )}
               >
                 {task.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
               </button>
            </div>

            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors",
              task.isActive ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-400"
            )}>
              {getTypeIcon(task.type)}
            </div>

            <h3 className="font-bold text-slate-800 text-lg mb-1 leading-tight">{task.title}</h3>
            <p className="text-slate-500 text-xs line-clamp-2 mb-4 font-medium">{task.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
               <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 text-center">Reward</p>
                  <p className="text-sm font-black text-emerald-600 text-center">{task.rewardPoints} Pts</p>
               </div>
               <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 text-center">Required</p>
                  <p className="text-sm font-black text-indigo-600 text-center">{task.requiredSeconds}s</p>
               </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                 <Globe className="w-3.5 h-3.5" />
                 <span className="truncate">{task.targetUrl}</span>
               </div>
               <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                    {task.type.replace('_', ' ')}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditClick(task)}
                      className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task.id!)}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
               </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
             <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-slate-300" />
             </div>
             <h3 className="font-bold text-slate-800">No Rewards Configure yet</h3>
             <p className="text-sm text-slate-500 mt-2">Start adding tasks to populate the marketplace.</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-900 text-xl tracking-tight">Create Reward Task</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure user actions and value</p>
              </div>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTask(null);
                }} 
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-600 border border-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddTask} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Category</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Social, Video"
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                      className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Task Type</label>
                    <select 
                      value={newTask.type}
                      onChange={(e) => setNewTask({ ...newTask, type: e.target.value as TaskType })}
                      className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 transition-all outline-none"
                    >
                      <option value="visit_website">Website Visit</option>
                      <option value="watch_youtube">YouTube Watch</option>
                      <option value="submit_form">Form Submission</option>
                      <option value="download_app">App Install</option>
                    </select>
                  </div>
               </div>

               <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Task Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Watch our new feature video"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 transition-all outline-none"
                  />
               </div>

               <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Detailed Instructions</label>
                  <textarea 
                    required
                    placeholder="Explain exactly what the user needs to do..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 transition-all outline-none resize-none"
                  />
               </div>

               <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Target Action URL</label>
                  <div className="relative">
                    <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="url" 
                      required
                      placeholder="https://..."
                      value={newTask.targetUrl}
                      onChange={(e) => setNewTask({ ...newTask, targetUrl: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 transition-all outline-none"
                    />
                  </div>
               </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Reward Points</label>
                     <div className="relative">
                       <Gift className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                         type="number" 
                         required
                         value={newTask.rewardPoints}
                         onChange={(e) => setNewTask({ ...newTask, rewardPoints: Number(e.target.value) })}
                         className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 transition-all outline-none text-emerald-600"
                       />
                     </div>
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Timer (Seconds)</label>
                     <div className="relative">
                       <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                         type="number" 
                         required
                         value={newTask.requiredSeconds}
                         onChange={(e) => setNewTask({ ...newTask, requiredSeconds: Number(e.target.value) })}
                         className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 transition-all outline-none text-indigo-600"
                       />
                     </div>
                   </div>
                </div>

                <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Expiration Window (Optional)</label>
                   <input 
                     type="datetime-local"
                     value={newTask.expiresAt ? new Date(newTask.expiresAt).toISOString().slice(0, 16) : ''}
                     onChange={(e) => setNewTask({ ...newTask, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                     className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold focus:border-indigo-600 transition-all outline-none"
                   />
                </div>

               <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingTask(null);
                    }}
                    className="flex-1 py-4 border-2 border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {editingTask ? 'Update Task' : 'Publish Task'}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
