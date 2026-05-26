import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Ticket, ClipboardCheck, HelpCircle,
  Video, ShoppingBag, Bell, Users, Settings, LogOut, Menu, X, User as UserIcon,
  ListTodo,
} from 'lucide-react';
import { useApp } from '../services/AppContext';
import Logo from './Logo';
import Avatar from './Avatar';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, lang } = useApp();
  const [open, setOpen] = useState(false);

  const items = [
    { path: '/admin',                 icon: LayoutDashboard, label: lang === 'uz' ? 'Bosh sahifa' : 'Бош саҳифа',     exact: true },
    { path: '/admin/topics',          icon: BookOpen,        label: lang === 'uz' ? 'Mavzular' : 'Мавзулар' },
    { path: '/admin/tickets',         icon: Ticket,          label: lang === 'uz' ? 'Biletlar' : 'Билетлар' },
    { path: '/admin/interims',        icon: ClipboardCheck,  label: lang === 'uz' ? 'Oraliq nazorat' : 'Оралиқ' },
    { path: '/admin/vazifalar',       icon: ListTodo,        label: lang === 'uz' ? 'Vazifalar' : 'Вазифалар' },
    { path: '/admin/questions',       icon: HelpCircle,      label: lang === 'uz' ? 'Savollar' : 'Саволлар' },
    { path: '/admin/courses',         icon: Video,           label: lang === 'uz' ? 'Video kurslar' : 'Видео' },
    { path: '/admin/subscription',    icon: ShoppingBag,     label: lang === 'uz' ? 'Obuna' : 'Обуна' },
    { path: '/admin/notifications',   icon: Bell,            label: lang === 'uz' ? "Habarlar" : 'Хабарлар' },
    { path: '/admin/users',           icon: Users,           label: lang === 'uz' ? 'Foydalanuvchilar' : 'Фойдаланувчилар' },
    { path: '/admin/settings',        icon: Settings,        label: lang === 'uz' ? 'Sozlamalar' : 'Созламалар' },
  ];

  const isActive = (p: string, exact?: boolean) =>
    exact ? location.pathname === p : location.pathname.startsWith(p);
  const go = (p: string) => { navigate(p); setOpen(false); };
  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div onClick={() => setOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <aside className={`absolute left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col transform transition-transform duration-300 ease-out border-r border-slate-200 dark:border-slate-800 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-4 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
            <Logo size={40} />
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-sm">PlusAvto.Uz</h2>
              <p className="text-xs text-emerald-500">Admin Panel</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
              <X size={20}/>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {items.map(it => {
              const Icon = it.icon;
              const active = isActive(it.path, it.exact);
              return (
                <button
                  key={it.path}
                  onClick={() => go(it.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                    active
                      ? 'bg-sky-500 text-white font-semibold shadow'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm">{it.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => go('/topics')}
              className="w-full flex items-center gap-3 px-3 py-2.5 mt-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold"
            >
              <UserIcon size={18} />
              <span className="text-sm">{lang === 'uz' ? 'Foydalanuvchi rejimi' : 'Фойдаланувчи режими'}</span>
            </button>
          </nav>

          <div className="p-3 border-t border-slate-200 dark:border-slate-800">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition">
              <LogOut size={16} />
              <span className="text-sm font-semibold">{lang === 'uz' ? 'Chiqish' : 'Чиқиш'}</span>
            </button>
          </div>
        </aside>
      </div>

      <main className="min-h-screen">
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 py-2.5">
          <div className="flex items-center gap-2 max-w-6xl mx-auto">
            <button onClick={() => setOpen(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg active:scale-95">
              <Menu size={22} />
            </button>
            <Logo size={32} />
            <span className="font-bold text-sm sm:text-base truncate">PlusAvto.Uz Admin</span>
            <div className="flex-1"/>
            <button
              onClick={() => navigate('/topics')}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 active:scale-95"
            >
              <UserIcon size={14}/>
              <span className="hidden sm:inline">{lang === 'uz' ? "Foydalanuvchi" : "Фойдаланувчи"}</span>
            </button>
            <Avatar user={user} size={32}/>
          </div>
        </header>

        <div className="p-3 sm:p-5 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
