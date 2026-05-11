import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldCheck, 
  Ban, 
  Mail, 
  Calendar,
  Wallet,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { subscribeToAllUsers, updateUserAdminStatus, updateUserDetails } from '../../lib/dataService';
import { UserProfile } from '../../types';
import { cn } from '../../lib/utils';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';

export default function AdminUsers() {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('uid') || '');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'admin' | 'blocked'>('all');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    const unsub = subscribeToAllUsers((data) => {
      setUsers(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' ? true :
                          statusFilter === 'admin' ? u.isAdmin :
                          statusFilter === 'blocked' ? u.isBlocked :
                          statusFilter === 'active' ? u.points > 0 : true;
    return matchesSearch && matchesFilter;
  });

  const toggleAdmin = async (uid: string, current: boolean) => {
    await updateUserAdminStatus(uid, !current);
  };

  const handleEditClick = (user: UserProfile) => {
    setEditingUser(user);
    setEditFormData({
        name: user.name,
        points: user.points,
        totalEarnings: user.totalEarnings,
        spins: user.spins
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    await updateUserDetails(editingUser.uid, {
        ...editFormData,
        points: Number(editFormData.points),
        totalEarnings: Number(editFormData.totalEarnings),
        spins: Number(editFormData.spins)
    });
    setShowEditModal(false);
    setEditingUser(null);
  };

  const toggleBlock = async (user: UserProfile) => {
    const confirmMsg = user.isBlocked ? "Do you want to unblock this user?" : "Are you sure you want to block this user? They will lose access to the application.";
    if (window.confirm(confirmMsg)) {
        await updateUserDetails(user.uid, { isBlocked: !user.isBlocked });
    }
  };

  const toggleWithdrawal = async (user: UserProfile) => {
    const confirmMsg = user.withdrawalsDisabled ? "Enable withdrawals for this user?" : "Disable withdrawals for this user?";
    if (window.confirm(confirmMsg)) {
        await updateUserDetails(user.uid, { withdrawalsDisabled: !user.withdrawalsDisabled });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">User Management</h1>
          <p className="text-slate-500 text-sm font-medium">Manage accounts, permissions, and status</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-100 flex items-center gap-2">
             <UserIcon className="w-3.5 h-3.5" />
             Export Users
           </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {/* Table Header / Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-full sm:w-80 group focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500" />
            <input 
              type="text" 
              placeholder="Filter by name, email, or UID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none text-xs font-medium focus:outline-none w-full text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Filter By:</span>
            <div className="flex p-1 bg-slate-50 border border-slate-200 rounded-lg">
              {(['all', 'active', 'admin', 'blocked'] as const).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setStatusFilter(tag)}
                  className={cn(
                    "px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight transition-all",
                    statusFilter === tag ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold uppercase tracking-widest">Fetching user directory...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4 font-bold">User Information</th>
                  <th className="px-6 py-4 font-bold">Joined Date</th>
                  <th className="px-6 py-4 font-bold">Points Balance</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className={cn(
                    "hover:bg-slate-50/50 transition-colors group",
                    user.isBlocked && "opacity-60 bg-rose-50/10"
                  )}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold overflow-hidden border border-slate-200">
                          {user.profilePic ? (
                            <img src={user.profilePic} alt="" className="w-full h-full object-cover" />
                          ) : (
                            user.name[0]
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-800 leading-none">{user.name}</h4>
                            {user.isAdmin && (
                              <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase rounded border border-indigo-100">
                                {user.role?.replace('_', ' ') || 'Admin'}
                              </span>
                            )}
                            {user.isBlocked && (
                               <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[8px] font-black uppercase rounded border border-rose-100">
                                 Blocked
                               </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-3.5 h-3.5 opacity-50" />
                        <span className="text-[11px] font-bold">{new Date(user.joinedAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-black text-slate-800">{user.points.toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">pts</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Earnings: {user.totalEarnings.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                       <div className="space-y-1">
                          <span className={cn(
                            "text-[8px] font-bold uppercase tracking-tight px-2 py-0.5 rounded shadow-sm block w-fit",
                            user.points > 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-400"
                          )}>
                            {user.points > 0 ? 'Active' : 'Dormant'}
                          </span>
                          {user.withdrawalsDisabled && (
                             <span className="text-[8px] font-bold uppercase tracking-tight px-2 py-0.5 rounded shadow-sm block w-fit bg-amber-50 text-amber-600 border border-amber-100">
                               Withdraw Disabled
                             </span>
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEditClick(user)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                            title="Edit User"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button 
                             onClick={() => toggleAdmin(user.uid, !!user.isAdmin)}
                             className={cn(
                               "p-1.5 rounded-lg transition-colors",
                               user.isAdmin ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                             )}
                             title={user.isAdmin ? "Remove Admin" : "Make Admin"}
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                          <button 
                             onClick={() => toggleWithdrawal(user)}
                             className={cn(
                               "p-1.5 rounded-lg transition-colors",
                               user.withdrawalsDisabled ? "text-amber-600 bg-amber-50" : "text-slate-400 hover:text-amber-600 hover:bg-slate-100"
                             )}
                             title={user.withdrawalsDisabled ? "Enable Withdrawal" : "Disable Withdrawal"}
                          >
                            <Wallet className="w-4 h-4" />
                          </button>
                          <button 
                             onClick={() => toggleBlock(user)}
                             className={cn(
                               "p-1.5 rounded-lg transition-colors",
                               user.isBlocked ? "text-rose-600 bg-rose-50" : "text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                             )}
                             title={user.isBlocked ? "Unblock User" : "Block User"}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer / Pagination */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing {filteredUsers.length} of {users.length} registered users
          </p>
          <div className="flex gap-2">
            <button className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:bg-white disabled:opacity-50" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:bg-white disabled:opacity-50" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-indigo-200/20"
           >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h3 className="font-black text-slate-900 text-lg">Edit User Profile</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{editingUser.email}</p>
                 </div>
                 <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white rounded-xl text-slate-300 hover:text-slate-600">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              <form onSubmit={handleSaveEdit} className="p-8 space-y-6">
                 <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Display Name</label>
                    <input 
                      type="text" 
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500"
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Balance (Points)</label>
                        <input 
                          type="number" 
                          value={editFormData.points}
                          onChange={(e) => setEditFormData({ ...editFormData, points: Number(e.target.value) })}
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Total Earnings</label>
                        <input 
                          type="number" 
                          value={editFormData.totalEarnings}
                          onChange={(e) => setEditFormData({ ...editFormData, totalEarnings: Number(e.target.value) })}
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500"
                        />
                    </div>
                 </div>

                 <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Available Spins</label>
                    <input 
                      type="number" 
                      value={editFormData.spins}
                      onChange={(e) => setEditFormData({ ...editFormData, spins: Number(e.target.value) })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-indigo-500"
                    />
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button 
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                      Save Changes
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}
    </div>
  );
}
