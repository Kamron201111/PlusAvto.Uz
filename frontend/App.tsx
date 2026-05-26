import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './services/AppContext';
import { Loader2 } from 'lucide-react';

// Public
import Login from './pages/Login';
import Register from './pages/Register';

// Layouts
import AppLayout from './components/AppLayout';
import AdminLayout from './components/AdminLayout';

// User pages
import HomePage from './pages/HomePage';
import TopicsList from './pages/TopicsList';
import TicketsList from './pages/TicketsList';
import Quiz from './pages/Quiz';
import Result from './pages/Result';
import Mistakes from './pages/Mistakes';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Premium from './pages/Premium';
import Notifications from './pages/Notifications';
import Courses from './pages/Courses';
import ExamsHome from './pages/ExamsHome';
import ExamsByTopics from './pages/ExamsByTopics';
import ExamsInterim from './pages/ExamsInterim';
import VazifalarList from './pages/VazifalarList';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTopics from './pages/admin/AdminTopics';
import AdminTickets from './pages/admin/AdminTickets';
import AdminInterims from './pages/admin/AdminInterims';
import AdminVazifalar from './pages/admin/AdminVazifalar';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminCourses from './pages/admin/AdminCourses';
import AdminSubscription from './pages/admin/AdminSubscription';
import AdminNotifications from './pages/admin/AdminNotifications';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, loading } = useApp();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="animate-spin text-sky-500" size={40}/></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/topics" replace />;
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useApp();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="animate-spin text-sky-500" size={40}/></div>;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/topics'} replace />;
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
      <Route path="/result" element={<ProtectedRoute><Result /></ProtectedRoute>} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/topics" element={<HomePage />} />
        <Route path="/topics-list" element={<TopicsList />} />
        <Route path="/tickets" element={<TicketsList />} />
        <Route path="/mistakes" element={<Mistakes />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/exams" element={<ExamsHome />} />
        <Route path="/exams/by-topics" element={<ExamsByTopics />} />
        <Route path="/exams/interim" element={<ExamsInterim />} />
        <Route path="/vazifalar" element={<VazifalarList />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="topics" element={<AdminTopics />} />
        <Route path="tickets" element={<AdminTickets />} />
        <Route path="interims" element={<AdminInterims />} />
        <Route path="vazifalar" element={<AdminVazifalar />} />
        <Route path="questions" element={<AdminQuestions />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="subscription" element={<AdminSubscription />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="/" element={<Navigate to="/topics" replace />} />
      <Route path="*" element={<Navigate to="/topics" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;
