import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  UserMinus, 
  Search, 
  AlertCircle,
  Mail,
  Shield,
  Clock,
  Settings,
  Lock,
  Plus,
  X,
  CheckCircle2,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { getAllAdmins, addAdmin, updateAdmin, deleteAdmin, getAllUsers } from '../../lib/dataService';
import { AdminRecord, AdminPermission, UserProfile } from '../../types';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const ALL_PERMISSIONS: { id: AdminPermission; label: string; description: string }[] = [
  { id: 'manage_tasks', label: 'Tasks', description: 'Create and edit earning tasks' },
  { id: 'manage_withdrawals', label: 'Withdrawals', description: 'Approve or reject payouts' },
  { id: 'manage_users', label: 'Users', description: 'View and manage user accounts' },
  { id: 'manage_banners', label: 'Banners', description: 'Update homepage promotions' },
  { id: 'manage_settings', label: 'System Settings', description: 'Change conversion rates & economy' },
  { id: 'manage_support', label: 'Support', description: 'Reply to customer queries' },
  { id: 'manage_admins', label: 'Admin Management', description: 'Manage other admin accounts' },
];

export default function AdminAdmins() {
  const { profile, hasPermission } = useAuth();
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // New Admin Form State
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    role: 'moderator' as 'super_admin' | 'moderator',
    permissions: [] as AdminPermission[]
  });

  const isSuperAdmin = profile?.role === 'super_admin' || profile?.email === 'shahinkhan28v@gmail.com';

  useEffect(() => {
    loadAdmins();
  }, []);

  async function loadAdmins() {
    setLoading(true);
    const data = await getAllAdmins();
    if (data) setAdmins(data);
    setLoading(false);
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.email) return;
    setSaving(true);
    try {
      await addAdmin({
        email: newAdmin.email.toLowerCase(),
        role: newAdmin.role,
        permissions: newAdmin.role === 'super_admin' ? ALL_PERMISSIONS.map(p => p.id) : newAdmin.permissions,
        addedAt: new Date().toISOString()
      });
      setShowAddModal(false);
      setNewAdmin({ email: '', role: 'moderator', permissions: [] });
      loadAdmins();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error adding admin');
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (permId: AdminPermission) => {
    setNewAdmin(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const handleDeleteAdmin = async (admin: AdminRecord) => {
    if (admin.email === profile?.email) {
      alert("You cannot remove yourself.");
      return;
    }
    if (confirm(`Revoke all admin access for ${admin.email}?`)) {
      await deleteAdmin(admin.id!);
      loadAdmins();
    }
  };

  const handleUpdateRole = async (admin: AdminRecord, role: 'super_admin' | 'moderator') => {
    const permissions = role === 'super_admin' ? ALL_PERMISSIONS.map(p => p.id) : admin.permissions;
    await updateAdmin(admin.id!, { role, permissions });
    loadAdmins();
  };

  if (loading && admins.length === 0) return (
    <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            Admin Network
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] uppercase tracking-widest rounded-full border border-indigo-100">
              Internal Roles
            </span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage staff privileges and modular access control</p>
        </div>
        {isSuperAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Add New Admin
          </button>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="bg-amber-50 border-2 border-amber-100 p-6 rounded-3xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-amber-900 text-sm">Restricted Interface</h3>
            <p className="text-xs text-amber-700/80 leading-relaxed font-medium">
              You are viewing the administration matrix as a <span className="font-black underline uppercase">Moderator</span>. 
              Role modification and personnel management are restricted to Super Admins only.
            </p>
          </div>
        </div>
      )}

      {/* Admins Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border-2 border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Identity & Role</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Permissions Matrix</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Joined</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border-2 shadow-sm transition-transform group-hover:scale-110",
                        admin.role === 'super_admin' ? "bg-indigo-50 border-indigo-100 text-indigo-600" : "bg-slate-50 border-slate-100 text-slate-400"
                      )}>
                        {admin.role === 'super_admin' ? <ShieldCheck className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm">{admin.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                           <span className={cn(
                             "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                             admin.role === 'super_admin' ? "bg-indigo-500 text-white border-indigo-400" : "bg-slate-100 text-slate-500 border-slate-200"
                           )}>
                             {admin.role.replace('_', ' ')}
                           </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-wrap gap-1.5 max-w-sm">
                      {admin.role === 'super_admin' ? (
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                          Full System Access
                        </span>
                      ) : (
                        admin.permissions.map(p => (
                          <span key={p} className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 uppercase">
                            {p.replace('manage_', '')}
                          </span>
                        ))
                      )}
                      {admin.role === 'moderator' && admin.permissions.length === 0 && (
                        <span className="text-[10px] font-bold text-rose-400 italic">No Permissions Assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold">{new Date(admin.addedAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {isSuperAdmin && admin.email !== profile?.email && (
                         <>
                           <button 
                             onClick={() => handleDeleteAdmin(admin)}
                             className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                             title="Revoke Admin Access"
                           >
                              <UserMinus className="w-5 h-5" />
                           </button>
                           <button 
                             onClick={() => handleUpdateRole(admin, admin.role === 'super_admin' ? 'moderator' : 'super_admin')}
                             className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                             title="Change Role"
                           >
                              <Settings className="w-5 h-5" />
                           </button>
                         </>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Provision New Admin</h2>
                  <p className="text-slate-400 text-sm font-medium">Configure identity and access scopes</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddAdmin} className="p-8 space-y-8">
                 <div className="space-y-4">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Email Address</label>
                    <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                       <input 
                         type="email"
                         required
                         value={newAdmin.email}
                         onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                         placeholder="e.g. admin@pointhub.com"
                         className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={() => setNewAdmin(prev => ({ ...prev, role: 'moderator' }))}
                      className={cn(
                        "p-6 rounded-[2rem] border-2 text-left transition-all",
                        newAdmin.role === 'moderator' ? "bg-indigo-50 border-indigo-600 ring-4 ring-indigo-50" : "bg-slate-50 border-transparent opacity-60"
                      )}
                    >
                       <Shield className={cn("w-8 h-8 mb-4", newAdmin.role === 'moderator' ? "text-indigo-600" : "text-slate-400")} />
                       <p className="font-black text-slate-800 text-xs uppercase tracking-widest">Moderator</p>
                       <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">Partial access to assigned modules only.</p>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewAdmin(prev => ({ ...prev, role: 'super_admin' }))}
                      className={cn(
                        "p-6 rounded-[2rem] border-2 text-left transition-all",
                        newAdmin.role === 'super_admin' ? "bg-rose-50 border-rose-600 ring-4 ring-rose-50" : "bg-slate-50 border-transparent opacity-60"
                      )}
                    >
                       <ShieldCheck className={cn("w-8 h-8 mb-4", newAdmin.role === 'super_admin' ? "text-rose-600" : "text-slate-400")} />
                       <p className="font-black text-slate-800 text-xs uppercase tracking-widest">Super Admin</p>
                       <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">Unrestricted access to all system modules.</p>
                    </button>
                 </div>

                 {newAdmin.role === 'moderator' && (
                    <div className="space-y-4">
                       <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Capabilities</label>
                       <div className="grid grid-cols-2 gap-3">
                          {ALL_PERMISSIONS.filter(p => p.id !== 'manage_admins').map((perm) => (
                            <button 
                              key={perm.id}
                              type="button"
                              onClick={() => togglePermission(perm.id)}
                              className={cn(
                                "p-4 rounded-2xl border flex items-start gap-3 transition-all text-left group",
                                newAdmin.permissions.includes(perm.id) 
                                  ? "bg-emerald-50 border-emerald-200 ring-2 ring-emerald-50" 
                                  : "bg-slate-50 border-slate-100"
                              )}
                            >
                               <div className={cn(
                                 "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                                 newAdmin.permissions.includes(perm.id) ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400 group-hover:bg-slate-300"
                               )}>
                                  {newAdmin.permissions.includes(perm.id) ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-3 h-3" />}
                               </div>
                               <div>
                                  <p className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{perm.label}</p>
                                  <p className="text-[9px] text-slate-400 font-medium mt-0.5 line-clamp-1">{perm.description}</p>
                               </div>
                            </button>
                          ))}
                       </div>
                    </div>
                 )}

                 <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={saving}
                      className="w-full bg-slate-900 text-white h-16 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {saving ? <Plus className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                      {saving ? 'Provisioning...' : 'Activate Admin Status'}
                    </button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
