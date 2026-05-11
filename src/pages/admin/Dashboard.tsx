import React, { useEffect, useState } from 'react';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { subscribeToAllUsers, subscribeToAllWithdrawals, getAdminStats } from '../../lib/dataService';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/AuthContext';

export default function AdminDashboard() {
  const { hasPermission, adminRecord } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  const isSuperAdmin = adminRecord?.role === 'super_admin';
  const canSeeUsers = isSuperAdmin || hasPermission('manage_users');
  const canSeeWithdrawals = isSuperAdmin || hasPermission('manage_withdrawals');
  const canSeeEconomy = isSuperAdmin || hasPermission('manage_settings');

  useEffect(() => {
    let unsubUsers: (() => void) | null = null;
    let unsubWithdrawals: (() => void) | null = null;

    async function init() {
      try {
        const initialStats = await getAdminStats();
        setStats(initialStats);
        
        let allUsers: any[] = [];
        let allWithdrawals: any[] = [];

        const updateCharts = () => {
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
          }).reverse();

          const dailyData = last7Days.map(date => {
            const joined = allUsers.filter(u => u.joinedAt?.startsWith(date)).length || 0;
            const withdrawn = allWithdrawals.filter(w => w.timestamp?.startsWith(date) && w.status === 'approved')
              .reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
            return {
              name: date.split('-').slice(1).join('/'),
              users: joined,
              withdrawals: withdrawn
            };
          });
          setChartData(dailyData);
        };

        if (canSeeUsers) {
          unsubUsers = subscribeToAllUsers((users) => {
            allUsers = users;
            updateCharts();
            setStats(prev => prev ? ({ ...prev, totalUsers: users.length }) : prev);
          });
        }

        if (canSeeWithdrawals) {
          unsubWithdrawals = subscribeToAllWithdrawals((withdrawals) => {
            allWithdrawals = withdrawals;
            updateCharts();
            const pending = withdrawals.filter(w => w.status === 'pending').length;
            setStats(prev => prev ? ({ ...prev, pendingWithdrawals: pending }) : prev);
          });
        }

        setLoading(false);
      } catch (e) {
        console.error(e);
      }
    }

    init();

    return () => {
      if (unsubUsers) unsubUsers();
      if (unsubWithdrawals) unsubWithdrawals();
    };
  }, [canSeeUsers, canSeeWithdrawals]);

  if (loading) return (
    <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const cards = [
    { 
      label: 'Total Users', 
      value: stats?.totalUsers || 0, 
      icon: Users, 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50', 
      change: '+12%', 
      up: true,
      visible: canSeeUsers
    },
    { 
      label: 'Points in Circ.', 
      value: stats?.totalPointsInCirculation.toLocaleString() || 0, 
      icon: Activity, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      change: '+2.4%', 
      up: true,
      visible: canSeeEconomy 
    },
    { 
      label: 'Today Earnt', 
      value: stats?.todayEarnings.toLocaleString() || 0, 
      icon: TrendingUp, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50', 
      change: '-5%', 
      up: false,
      visible: canSeeEconomy
    },
    { 
      label: 'Pending Payouts', 
      value: stats?.pendingWithdrawals || 0, 
      icon: CreditCard, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50', 
      change: 'Needs attention', 
      up: false,
      visible: canSeeWithdrawals
    },
  ].filter(c => c.visible);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            {isSuperAdmin ? 'Admin Dashboard' : 'Moderator Portal'}
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {isSuperAdmin ? 'Full system control and performance metrics' : 'Accessing assigned functional areas'}
          </p>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 shadow-sm">
             <Clock className="w-3 h-3" />
             Last sync: Just now
           </span>
        </div>
      </div>

      {cards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border-2 border-slate-50 group hover:border-indigo-300 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm", card.bg, card.color)}>
                  <card.icon className="w-6 h-6" />
                </div>
                <div className={cn(
                  "flex items-center text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                  card.up ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                  {card.up ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                  {card.change}
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{card.value}</h3>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-indigo-50 border-2 border-indigo-100 p-8 rounded-[2rem] text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-indigo-400 mx-auto" />
          <h3 className="text-lg font-black text-indigo-900">Workspace Optimized</h3>
          <p className="text-sm font-medium text-indigo-700/70 max-w-md mx-auto">
            You don't have global statistics permissions. Please use the sidebar to access your assigned management modules.
          </p>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {canSeeUsers && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-slate-50 transition-all hover:border-indigo-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-black text-slate-800 text-lg">User Growth</h3>
                <p className="text-xs text-slate-400 font-medium">Daily registrations trend</p>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Last 7 Days</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: '900' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {canSeeWithdrawals && (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-slate-50 transition-all hover:border-emerald-100">
             <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-black text-slate-800 text-lg">Cashflow Velocity</h3>
                <p className="text-xs text-slate-400 font-medium">Approved payouts volume</p>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Last 7 Days</span>
            </div>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: '900' }}
                  />
                  <Bar dataKey="withdrawals" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
