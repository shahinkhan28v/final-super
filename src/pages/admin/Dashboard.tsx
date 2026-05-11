import React, { useEffect, useState } from 'react';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

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

        unsubUsers = subscribeToAllUsers((users) => {
          allUsers = users;
          updateCharts();
          setStats(prev => prev ? ({ ...prev, totalUsers: users.length }) : prev);
        });

        unsubWithdrawals = subscribeToAllWithdrawals((withdrawals) => {
          allWithdrawals = withdrawals;
          updateCharts();
          const pending = withdrawals.filter(w => w.status === 'pending').length;
          setStats(prev => prev ? ({ ...prev, pendingWithdrawals: pending }) : prev);
        });

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
  }, []);

  if (loading) return <div>Loading...</div>;

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', change: '+12%', up: true },
    { label: 'Points in Circ.', value: stats?.totalPointsInCirculation.toLocaleString() || 0, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+2.4%', up: true },
    { label: 'Today Earnt', value: stats?.todayEarnings.toLocaleString() || 0, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50', change: '-5%', up: false },
    { label: 'Pending Payouts', value: stats?.pendingWithdrawals || 0, icon: CreditCard, color: 'text-rose-600', bg: 'bg-rose-50', change: '8 Needs attention', up: false },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">System Overview</h1>
          <p className="text-slate-500 text-sm font-medium">Real-time performance metrics for PointHub</p>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 flex items-center gap-2">
             <Clock className="w-3 h-3" />
             Last sync: Just now
           </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group hover:border-indigo-300 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", card.bg, card.color)}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className={cn(
                "flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full",
                card.up ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {card.up ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                {card.change}
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.label}</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{card.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">New User Registrations</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 7 Days</span>
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
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Withdrawal Transactions (USD)</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last 7 Days</span>
          </div>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="withdrawals" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
