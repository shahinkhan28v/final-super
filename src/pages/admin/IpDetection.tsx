import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  Search, 
  Filter, 
  ChevronRight, 
  Smartphone, 
  Globe,
  MapPin,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { UserProfile } from '../../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

interface IpGroup {
  ip: string;
  users: UserProfile[];
}

export default function IpDetection() {
  const [loading, setLoading] = useState(true);
  const [ipGroups, setIpGroups] = useState<IpGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'suspicious'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), orderBy('joinedAt', 'desc'));
      const snap = await getDocs(q);
      const allUsers = snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));

      // Group users by IP
      const groups: Record<string, UserProfile[]> = {};
      allUsers.forEach(user => {
        if (user.lastIp) {
          if (!groups[user.lastIp]) groups[user.lastIp] = [];
          groups[user.lastIp].push(user);
        }
      });

      const sortedGroups = Object.entries(groups)
        .map(([ip, users]) => ({ ip, users }))
        .sort((a, b) => b.users.length - a.users.length);

      setIpGroups(sortedGroups);
    } catch (e) {
      console.error("Load IP data error:", e);
    }
    setLoading(false);
  };

  const filteredGroups = ipGroups.filter(g => {
    const matchesSearch = g.ip.includes(searchTerm) || g.users.some(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || g.users.length > 1;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldAlert className="text-indigo-600" size={32} />
            IP Detection Panel
          </h1>
          <p className="text-slate-500 font-medium mt-1">Monitor multi-account usage and prevent fraud.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search IP or User..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium w-64 focus:ring-2 ring-indigo-50 outline-none transition-all"
              />
           </div>
           <button 
             onClick={loadData}
             className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95"
           >
             Refresh
           </button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
         <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Filter:</span>
         </div>
         <div className="flex gap-2">
            <button 
              onClick={() => setFilterType('all')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                filterType === 'all' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              All IPs
            </button>
            <button 
              onClick={() => setFilterType('suspicious')}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                filterType === 'suspicious' ? "bg-rose-600 text-white shadow-lg shadow-rose-100" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              Multi-Account (2+)
            </button>
         </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="bg-white p-20 rounded-[2.5rem] border border-slate-200 text-center">
           <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-10 h-10" />
           </div>
           <h3 className="text-lg font-black text-slate-900">No data found</h3>
           <p className="text-slate-500 text-sm">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={group.ip} 
              className={cn(
                "bg-white rounded-[2.5rem] border overflow-hidden shadow-sm flex flex-col group transition-all duration-300",
                group.users.length > 1 ? "border-rose-100 hover:border-rose-200 hover:shadow-rose-50" : "border-slate-100 hover:border-indigo-100"
              )}
            >
              <div className={cn(
                "p-6 flex items-center justify-between",
                group.users.length > 1 ? "bg-rose-50/50" : "bg-slate-50/50"
              )}>
                <div className="flex items-center gap-3">
                   <div className={cn(
                     "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg",
                     group.users.length > 1 ? "bg-rose-600 text-white shadow-rose-200" : "bg-indigo-600 text-white shadow-indigo-200"
                   )}>
                      {group.users.length > 1 ? <AlertTriangle size={24} /> : <Globe size={24} />}
                   </div>
                   <div>
                      <h3 className="text-lg font-black text-slate-800 tracking-tight">{group.ip}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                         <MapPin size={10} className="text-slate-400" />
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                           {group.users[0]?.location?.city || 'Unknown'}, {group.users[0]?.location?.country || 'Unknown'}
                         </p>
                      </div>
                      <p className={cn("text-[10px] font-bold uppercase tracking-widest mt-1", group.users.length > 1 ? "text-rose-500" : "text-indigo-500")}>
                        {group.users.length} {group.users.length === 1 ? 'Account' : 'Accounts'} Linked
                      </p>
                   </div>
                </div>
              </div>

              <div className="p-6 flex-1 space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex justify-between items-center">
                    <span>Linked Users</span>
                    {group.users.length > 1 && <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[8px]">Collision Detected</span>}
                  </p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    {group.users.map((user) => (
                      <div key={user.uid} className="flex flex-col p-3 bg-slate-50 rounded-2xl border border-slate-100 group/item hover:bg-white hover:border-indigo-100 transition-all">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black overflow-hidden flex-shrink-0">
                                 {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : user.name.substring(0,2).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-xs font-bold text-slate-800 line-clamp-1">{user.name}</span>
                                 <span className="text-[9px] font-medium text-slate-400">{user.points.toLocaleString()} Pts</span>
                              </div>
                           </div>
                           <Link 
                             to={`/admin/users?uid=${user.uid}`}
                             className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all opacity-0 group-hover/item:opacity-100"
                           >
                             <ExternalLink size={14} />
                           </Link>
                        </div>
                        {user.location && (
                           <div className="mt-2 pt-2 border-t border-slate-100/50 flex items-center gap-1.5">
                              <MapPin size={10} className="text-indigo-400" />
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                                 {user.location.city}, {user.location.country}
                              </span>
                           </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {group.users.length > 1 && (
                  <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                     <p className="text-[10px] font-bold text-rose-600 leading-relaxed">
                       Warning: Multiple accounts detected from this single IP address. This might indicate systematic multi-accounting.
                     </p>
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active System</span>
                </div>
                <Smartphone size={16} className="text-slate-300" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
