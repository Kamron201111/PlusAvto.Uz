import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  usersAPI, topicsAPI, ticketsAPI, interimsAPI, questionsAPI,
  coursesAPI, premiumAPI, vazifalarAPI,
} from '../../services/api';
import {
  BookOpen, Ticket, ClipboardCheck, HelpCircle, Video,
  Users, ShoppingBag, ListTodo,
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0, topics: 0, tickets: 0, interims: 0,
    questions: 0, courses: 0, vazifalar: 0, pendingRequests: 0,
  });

  useEffect(() => {
    Promise.all([
      usersAPI.list().catch(() => []),
      topicsAPI.list().catch(() => []),
      ticketsAPI.list().catch(() => []),
      interimsAPI.list().catch(() => []),
      questionsAPI.list().catch(() => []),
      coursesAPI.list().catch(() => []),
      vazifalarAPI.list().catch(() => []),
      premiumAPI.requests().catch(() => []),
    ]).then(([u, t, tk, i, q, c, v, pr]) => {
      setStats({
        users: u.length, topics: t.length, tickets: tk.length,
        interims: i.length, questions: q.length, courses: c.length,
        vazifalar: v.length, pendingRequests: pr.filter((r: any) => r.status === 'pending').length,
      });
    });
  }, []);

  const cards = [
    { label: 'Foydalanuvchilar', count: stats.users,    icon: Users,         color: 'from-blue-500 to-blue-700',     path: '/admin/users' },
    { label: 'Mavzular',         count: stats.topics,   icon: BookOpen,      color: 'from-sky-500 to-cyan-600',      path: '/admin/topics' },
    { label: 'Biletlar',         count: stats.tickets,  icon: Ticket,        color: 'from-indigo-500 to-purple-600', path: '/admin/tickets' },
    { label: 'Oraliq',           count: stats.interims, icon: ClipboardCheck,color: 'from-amber-500 to-orange-600',  path: '/admin/interims' },
    { label: 'Vazifalar',        count: stats.vazifalar,icon: ListTodo,      color: 'from-orange-500 to-red-600',    path: '/admin/vazifalar' },
    { label: 'Savollar',         count: stats.questions,icon: HelpCircle,    color: 'from-emerald-500 to-teal-600',  path: '/admin/questions' },
    { label: 'Video kurslar',    count: stats.courses,  icon: Video,         color: 'from-red-500 to-pink-600',      path: '/admin/courses' },
    { label: "Obuna so'rovlari", count: stats.pendingRequests, icon: ShoppingBag, color: 'from-purple-500 to-fuchsia-600', path: '/admin/subscription', highlight: stats.pendingRequests > 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Dashboard</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <button key={i} onClick={() => navigate(c.path)}
              className={`bg-gradient-to-br ${c.color} text-white rounded-2xl p-4 sm:p-5 text-left shadow-lg hover:shadow-xl transition active:scale-[0.97] relative ${c.highlight ? 'ring-4 ring-amber-400' : ''}`}>
              {c.highlight && <span className="absolute top-2 right-2 w-3 h-3 bg-amber-400 rounded-full animate-pulse"/>}
              <Icon size={28} className="mb-3 opacity-90"/>
              <p className="text-3xl font-black">{c.count}</p>
              <p className="text-xs sm:text-sm opacity-90 mt-1">{c.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;
