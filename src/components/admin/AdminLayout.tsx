import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Search, Bell, User, ChevronLeft, Menu } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import BackButton from '../BackButton';

export default function AdminLayout() {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isDashboard = location.pathname === '/admin' || location.pathname === '/admin/';

  const roleLabel = profile?.role === 'super_admin' ? 'Super Admin' : (profile?.role === 'admin' ? 'Administrator' : 'Moderator');

  return (
    <div className="flex h-[100dvh] bg-slate-50 font-sans text-slate-800 overflow-hidden">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Header */}
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-2 lg:gap-4 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-500 active:scale-95 transition-all"
              id="admin-mobile-menu"
            >
              <Menu size={24} />
            </button>

            {!isDashboard && (
              <button 
                onClick={() => navigate(-1)}
                className="hidden lg:flex p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-indigo-600 transition-all items-center gap-2 mr-2 border border-transparent hover:border-slate-200"
                id="admin-back-button"
              >
                <ChevronLeft size={20} />
                <span className="text-xs font-bold uppercase tracking-wider">Back</span>
              </button>
            )}

            <div className="relative flex-1 max-w-xs lg:max-w-md group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6 ml-4">
            <button className="relative p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-all active:scale-95">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-[1.5px] bg-slate-200 hidden sm:block"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black leading-none text-slate-900">{profile?.name || 'Admin'}</p>
                <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mt-1.5 px-2 py-0.5 bg-indigo-50 rounded-full inline-block">{roleLabel}</p>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-xl shadow-indigo-200 border-2 border-white ring-1 ring-indigo-100 uppercase text-sm lg:text-lg">
                {profile?.name?.[0] || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
