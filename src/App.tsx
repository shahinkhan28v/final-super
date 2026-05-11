import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Rewards from './pages/Rewards';
import Refer from './pages/Refer';
import Account from './pages/Account';
import History from './pages/History';
import Withdraw from './pages/Withdraw';
import Login from './pages/Login';
import AdminGuard from './components/AdminGuard';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminWithdrawals from './pages/admin/Withdrawals';
import AdminSettings from './pages/admin/Settings';
import Tasks from './pages/Tasks';
import AdminBanners from './pages/admin/Banners';
import AdminTasks from './pages/admin/Tasks';
import AdminAdmins from './pages/admin/Admins';
import AdminQuizzes from './pages/admin/Quizzes';
import AdminLuckyWheel from './pages/admin/LuckyWheel';
import AdminReferrals from './pages/admin/Referrals';
import AdminIpDetection from './pages/admin/IpDetection';
import Quizzes from './pages/Quizzes';
import QuizPlayer from './pages/QuizPlayer';
import LuckyWheel from './pages/LuckyWheel';
import AdminSupport from './pages/admin/Support';
import SupportChatPage from './pages/SupportChat';

function ReferralTracker() {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      sessionStorage.setItem('referralCode', ref.toUpperCase());
    }
  }, [searchParams]);
  
  return null;
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  return user ? <>{children}</> : <Navigate to="/login" />;
}

import { AdminPermission } from './types';

function PermissionRoute({ permission, children }: { permission: AdminPermission; children: React.ReactNode }) {
  const { hasPermission, loading } = useAuth();
  if (loading) return null;
  return hasPermission(permission) ? <>{children}</> : <Navigate to="/admin" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ReferralTracker />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* User Routes */}
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="quizzes" element={<Quizzes />} />
            <Route path="quiz/:id" element={<QuizPlayer />} />
            <Route path="wheel" element={<LuckyWheel />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="refer" element={<Refer />} />
            <Route path="account" element={<Account />} />
            <Route path="support/chat" element={<SupportChatPage />} />
            <Route path="history" element={<History />} />
            <Route path="withdraw" element={<Withdraw />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminGuard />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<PermissionRoute permission="manage_users"><AdminUsers /></PermissionRoute>} />
              <Route path="withdrawals" element={<PermissionRoute permission="manage_withdrawals"><AdminWithdrawals /></PermissionRoute>} />
              <Route path="admins" element={<PermissionRoute permission="manage_admins"><AdminAdmins /></PermissionRoute>} />
              <Route path="quizzes" element={<PermissionRoute permission="manage_tasks"><AdminQuizzes /></PermissionRoute>} />
              <Route path="wheel" element={<PermissionRoute permission="manage_settings"><AdminLuckyWheel /></PermissionRoute>} />
              <Route path="banners" element={<PermissionRoute permission="manage_banners"><AdminBanners /></PermissionRoute>} />
              <Route path="tasks" element={<PermissionRoute permission="manage_tasks"><AdminTasks /></PermissionRoute>} />
              <Route path="support" element={<PermissionRoute permission="manage_support"><AdminSupport /></PermissionRoute>} />
              <Route path="settings" element={<PermissionRoute permission="manage_settings"><AdminSettings /></PermissionRoute>} />
              <Route path="referrals" element={<PermissionRoute permission="manage_settings"><AdminReferrals /></PermissionRoute>} />
              <Route path="ip-detect" element={<PermissionRoute permission="manage_users"><AdminIpDetection /></PermissionRoute>} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
