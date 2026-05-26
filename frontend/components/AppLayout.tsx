import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, Bell, MessageCircle, ShoppingBag } from 'lucide-react';
import Sidebar from './Sidebar';
import { useApp } from '../services/AppContext';
import { settingsAPI, notificationsAPI } from '../services/api';
import { adaptText } from '../services/transliterate';
import Logo from './Logo';
import Avatar from './Avatar';

const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [settings, setSettings] = useState<any>({});
  const { user, lang, t } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    settingsAPI.get().then(setSettings).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    const load = () => notificationsAPI.unreadCount().then(setUnread).catch(() => {});
    load();
    const iv = setInterval(load, 10000);
    return () => clearInterval(iv);
  }, [user]);

  useEffect(() => {
    if (sidebarOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div onClick={() => setSidebarOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className={`absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] transform transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      <main className="min-h-screen">
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 py-2.5">
          <div className="flex items-center gap-2 max-w-6xl mx-auto">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-95"
            >
              <Menu size={22} />
            </button>

            <Logo size={32} className="ml-1" />

            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-95 ml-1"
            >
              <Bell size={20} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            <div className="flex-1" />

            <a
              href={settings.qa_group_link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition"
            >
              <MessageCircle size={16} />
              <span className="text-sm font-semibold">{adaptText(t('qa_group'), lang)}</span>
            </a>

            <button
              onClick={() => navigate('/premium')}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl shadow font-semibold active:scale-95"
            >
              <ShoppingBag size={16} />
              <span className="text-xs sm:text-sm">{lang === 'kr' ? 'Обуна' : 'Obuna'}</span>
            </button>

            <button onClick={() => navigate('/profile')} className="ml-1 active:scale-95 transition">
              <Avatar user={user} size={32} />
            </button>
          </div>
        </header>

        <div className="p-3 sm:p-5 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
