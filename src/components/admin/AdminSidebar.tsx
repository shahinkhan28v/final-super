import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  Gift, 
  LogOut,
  RotateCw,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Share2,
  ShieldCheck,
  Image as ImageIcon,
  MessageSquare,
  Puzzle,
  X,
  Sidebar as SidebarIcon,
  ChevronLeft
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../lib/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

import { AdminPermission } from '../../types';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  icon: any;
  label: string;
  permission?: AdminPermission;
}

interface Category {
  label: string;
  items: NavItem[];
}

interface Category {
  label: string;
  items: NavItem[];
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { logout, hasPermission } = useAuth();
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([]);

  const categories: Category[] = [
    {
      label: 'Main Ops',
      items: [
        { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
        { to: '/admin/users', icon: Users, label: 'User Hub', permission: 'manage_users' },
        { to: '/admin/admins', icon: ShieldCheck, label: 'Staff Team', permission: 'manage_admins' },
        { to: '/admin/withdrawals', icon: CreditCard, label: 'Cashouts', permission: 'manage_withdrawals' },
      ]
    },
    {
      label: 'Content & Rewards',
      items: [
        { to: '/admin/tasks', icon: Gift, label: 'Task Center', permission: 'manage_tasks' },
        { to: '/admin/quizzes', icon: Puzzle, label: 'Quiz Engine', permission: 'manage_tasks' },
        { to: '/admin/wheel', icon: RotateCw, label: 'Win Lab', permission: 'manage_settings' },
        { to: '/admin/banners', icon: ImageIcon, label: 'Ad Media', permission: 'manage_banners' },
      ]
    },
    {
      label: 'System & Intel',
      items: [
        { to: '/admin/support', icon: MessageSquare, label: 'Help Desk', permission: 'manage_support' },
        { to: '/admin/referrals', icon: Share2, label: 'Growth/MLM', permission: 'manage_settings' },
        { to: '/admin/settings', icon: Settings, label: 'Global Config', permission: 'manage_settings' },
        { to: '/admin/ip-detect', icon: ShieldCheck, label: 'Anti-Fraud', permission: 'manage_users' },
      ]
    }
  ];

  const toggleCategory = (label: string) => {
    setCollapsedCategories(prev => 
      prev.includes(label) ? prev.filter(c => c !== label) : [...prev, label]
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-[101] w-[280px] bg-white border-r border-slate-200 flex flex-col h-full transition-transform duration-300 ease-in-out transform",
        "lg:translate-x-0 lg:static lg:z-0 lg:w-72 shadow-sm",
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-100">
              PH
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 font-black tracking-tight leading-none text-lg">PointHub</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Admin Control</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {categories.map((cat) => {
            const visibleItems = cat.items.filter(item => !item.permission || hasPermission(item.permission));
            if (visibleItems.length === 0) return null;
            
            const isCollapsed = collapsedCategories.includes(cat.label);

            return (
              <div key={cat.label} className="space-y-1">
                <button 
                  onClick={() => toggleCategory(cat.label)}
                  className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors"
                >
                  {cat.label}
                  {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </button>
                
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-1"
                    >
                      {visibleItems.map((item) => (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.to === '/admin'}
                          onClick={() => {
                            if (window.innerWidth < 1024) onClose();
                          }}
                          className={({ isActive }) => cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all group",
                            isActive 
                              ? "bg-slate-900 text-white shadow-lg" 
                              : "text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                          )}
                        >
                          {({ isActive }) => (
                            <>
                              <item.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-indigo-600")} />
                              <span className="flex-1 tracking-wider">{item.label}</span>
                              <ChevronRight className={cn("w-3 h-3 opacity-0 transition-all", "group-hover:opacity-100 group-hover:translate-x-1")} />
                            </>
                          )}
                        </NavLink>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider text-rose-500 hover:bg-rose-50 transition-all group"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>Exit Admin</span>
          </button>
        </div>
      </aside>
    </>
  );
}
