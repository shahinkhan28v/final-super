import React, { useEffect, useState } from 'react';
import { 
  Gift, 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  CheckCircle, 
  XCircle,
  Clock,
  LayoutGrid,
  Save,
  X,
  RefreshCw,
  ExternalLink,
  Type,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Send,
  Smartphone,
  Globe,
  UserPlus,
  Link
} from 'lucide-react';
import { subscribeToAllRewardTasks, addRewardTask, updateRewardTask, deleteRewardTask } from '../../lib/dataService';
import { RewardTask } from '../../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function RewardTasks() {
  const [tasks, setTasks] = useState<RewardTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<RewardTask | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  const taskTypes = [
    { label: 'Facebook Follow', value: 'facebook', icon: 'Facebook' },
    { label: 'Telegram Join', value: 'telegram', icon: 'Send' },
    { label: 'YouTube Subscribe', value: 'youtube', icon: 'Youtube' },
    { label: 'Twitter Follow', value: 'twitter', icon: 'Twitter' },
    { label: 'Instagram Follow', value: 'instagram', icon: 'Instagram' },
    { label: 'App Download', value: 'download', icon: 'Smartphone' },
    { label: 'Website Visit', value: 'web', icon: 'Globe' },
    { label: 'User Signup', value: 'signup', icon: 'UserPlus' },
    { label: 'Other / Custom', value: 'custom', icon: 'Gift' },
  ];

  const [formData, setFormData] = useState<Omit<RewardTask, 'id'>>({
    title: '',
    description: '',
    icon: 'Gift',
    link: '',
    points: 100,
    type: 'web',
    waitMinutes: 5,
    isActive: true,
    orderIndex: 0
  });

  const handleTypeChange = (typeValue: string) => {
    const selectedType = taskTypes.find(t => t.value === typeValue);
    setFormData({
      ...formData,
      type: typeValue,
      icon: selectedType?.icon || 'Gift'
    });
  };

  useEffect(() => {
    const unsub = subscribeToAllRewardTasks((data) => {
      setTasks(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingTask?.id) {
        await updateRewardTask(editingTask.id, formData);
      } else {
        await addRewardTask({ ...formData, orderIndex: tasks.length });
      }
      setShowModal(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        icon: 'Gift',
        points: 100,
        type: 'web',
        waitMinutes: 5,
        isActive: true,
        orderIndex: tasks.length
      });
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (task: RewardTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      icon: task.icon || 'Gift',
      link: task.link || '',
      points: task.points,
      type: task.type,
      waitMinutes: task.waitMinutes,
      isActive: task.isActive,
      orderIndex: task.orderIndex
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this task from shop?')) {
      await deleteRewardTask(id);
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
      <RefreshCw className="w-8 h-8 animate-spin mb-4" />
      <p className="font-bold text-sm uppercase tracking-widest">Loading Rewards Engine...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">Reward Shop Manager</h1>
          <p className="text-slate-500 text-sm font-medium italic">Control tasks and redemption logic in the Rewards Shop</p>
        </div>
        <button 
          onClick={() => {
            setEditingTask(null);
              setFormData({
                title: '',
                description: '',
                icon: 'Gift',
                link: '',
                points: 100,
                type: 'web',
                waitMinutes: 5,
                isActive: true,
                orderIndex: tasks.length
              });
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-3"
        >
          <Plus className="w-4 h-4" />
          Add Shop Task
        </button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text"
            placeholder="FILTER REWARD TASKS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold outline-none focus:border-indigo-500 shadow-sm transition-all tracking-widest"
          />
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-4 flex items-center justify-between">
           <div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active Rewards</p>
              <h3 className="text-2xl font-black text-emerald-700">{tasks.filter(t => t.isActive).length}</h3>
           </div>
           <LayoutGrid className="w-8 h-8 text-emerald-200" />
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Task Detail</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reward</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Wait Time</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                          <Gift className="w-5 h-5" />
                       </div>
                       <div>
                          <h4 className="font-black text-slate-800 text-sm leading-tight">{task.title}</h4>
                          <p className="text-[10px] text-slate-400 font-bold max-w-[200px] truncate">{task.description}</p>
                       </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black">
                       <CheckCircle className="w-3 h-3" />
                       {task.points} PTS
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                       <Clock className="w-3 h-3" />
                       {task.waitMinutes} mins
                    </div>
                  </td>
                  <td className="p-6">
                    {task.isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 text-[10px] font-black uppercase">
                        <CheckCircle className="w-3 h-3" />
                        Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-slate-400 text-[10px] font-black uppercase">
                        <XCircle className="w-3 h-3" />
                        Paused
                      </span>
                    )}
                  </td>
                  <td className="p-6">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                        onClick={() => handleEdit(task)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                       >
                         <Edit2 className="w-4 h-4" />
                       </button>
                       <button 
                        onClick={() => handleDelete(task.id!)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                     <Gift className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] italic">Empty Shop Manifest</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowModal(false)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden"
             >
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                   <div>
                      <h3 className="text-xl font-black text-slate-800">{editingTask ? 'Edit Task Logic' : 'New Shop Task'}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{editingTask ? 'Modify redemption parameters' : 'Define new point-earning sequence'}</p>
                   </div>
                   <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl transition-all">
                      <X className="w-6 h-6 text-slate-400" />
                   </button>
                </div>
                
                <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4 md:col-span-2">
                         <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Task Type</label>
                         <select 
                            value={formData.type}
                            onChange={(e) => handleTypeChange(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold outline-none focus:border-indigo-500"
                         >
                            {taskTypes.map(type => (
                               <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                         </select>
                      </div>

                      <div className="space-y-4 md:col-span-2">
                         <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Task Title</label>
                         <div className="relative">
                            <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                               type="text"
                               required
                               value={formData.title}
                               onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                               placeholder="e.g., JOIN TELEGRAM COMMUNITY"
                               className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-11 pr-4 text-xs font-bold outline-none focus:border-indigo-500"
                            />
                         </div>
                      </div>

                      <div className="space-y-4 md:col-span-2">
                         <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Action Link (URL)</label>
                         <div className="relative">
                            <Link className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                               type="url"
                               required
                               value={formData.link}
                               onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                               placeholder="https://facebook.com/..."
                               className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-11 pr-4 text-xs font-bold outline-none focus:border-indigo-500"
                            />
                         </div>
                      </div>

                      <div className="space-y-4 md:col-span-2">
                         <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Description</label>
                         <textarea 
                            required
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Helpful details for the user..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-bold outline-none focus:border-indigo-500 resize-none"
                         />
                      </div>

                      <div className="space-y-4">
                         <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Reward Points</label>
                         <input 
                            type="number"
                            required
                            value={formData.points}
                            onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-black text-indigo-600 outline-none focus:border-indigo-500"
                         />
                      </div>

                      <div className="space-y-4">
                         <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Wait Time (Mins)</label>
                         <input 
                            type="number"
                            required
                            value={formData.waitMinutes}
                            onChange={(e) => setFormData({ ...formData, waitMinutes: Number(e.target.value) })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-black text-indigo-600 outline-none focus:border-indigo-500"
                         />
                      </div>
                   </div>

                   <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div>
                         <p className="text-[12px] font-black text-slate-800">Task Visibility</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Instantly publish to shop</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          formData.isActive ? "bg-emerald-500 shadow-lg shadow-emerald-200" : "bg-slate-200"
                        )}
                      >
                         <div className={cn(
                           "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                           formData.isActive ? "left-7" : "left-1"
                         )} />
                      </button>
                   </div>

                   <button 
                    type="submit"
                    disabled={saving}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3"
                   >
                     {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                     {saving ? 'Synchronizing State...' : 'Commit to Rewards Shop'}
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
