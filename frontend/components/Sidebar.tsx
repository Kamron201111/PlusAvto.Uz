import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../services/AppContext';
import { languages } from '../services/i18n';
import { adaptText } from '../services/transliterate';
import {
  LogOut, Sun, Moon, Monitor, User as UserIcon, BookOpen,
  FileCheck, X, Video, ShoppingBag, AlertCircle, Shield, ClipboardCheck,
} from 'lucide-react';
import Logo from './Logo';
import Avatar from './Avatar';

interface Props { onClose: () => void; }

const Sidebar: React.FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, lang, setLang, theme, setTheme, t, premium } = useApp();

  const items = [
    { path: '/topics-list', icon: BookOpen,    label: t('menu_topic')    },
    { path: '/exams',       icon: FileCheck,   label: t('menu_exam')     },
    { path: '/vazifalar',   icon: ClipboardCheck, label: t('menu_vazifalar') },
    { path: '/mistakes',    icon: AlertCircle, label: t('menu_mistakes') },
    { path: '/courses',     icon: Video,       label: t('menu_courses')  },
    { path: '/premium',     icon: ShoppingBag, label: t('menu_premium')  },
    { path: '/profile',     icon: UserIcon,    label: t('menu_profile')  },
  ];

  const isActive = (p: string) => location.pathname.startsWith(p);
  const go = (p: string) => { navigate(p); onClose(); };
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="w-full h-full flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">
      <div className="p-4 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
        <Logo size={48} />
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-base truncate">PlusAvto.Uz</h2>
          <p className={`text-xs font-semibold ${premium ? 'text-emerald-500' : 'text-red-500'}`}>
            {premium ? t('active') : t('not_active')}
          </p>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
          <X size={18} className="text-slate-500"/>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {items.map(item => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => go(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${
                active
                  ? 'bg-sky-500 text-white font-semibold shadow'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm leading-tight">{adaptText(item.label, lang)}</span>
            </button>
          );
        })}

        {user?.role === 'admin' && (
          <button
            onClick={() => go('/admin')}
            className="w-full flex items-center gap-3 px-3 py-3 mt-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow"
          >
            <Shield size={20} />
            <span className="text-sm">Admin Panel</span>
          </button>
        )}
      </nav>

      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="bg-slate-200 dark:bg-slate-800 rounded-xl p-1 grid grid-cols-2 gap-1">
          {languages.map(l => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                lang === l.code ? 'bg-sky-500 text-white shadow' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="bg-slate-200 dark:bg-slate-800 rounded-xl p-1 grid grid-cols-3 gap-1">
          {[
            { val: 'light',  icon: Sun,     label: t('theme_light')  },
            { val: 'system', icon: Monitor, label: t('theme_system') },
            { val: 'dark',   icon: Moon,    label: t('theme_dark')   },
          ].map(item => {
            const Icon = item.icon;
            const active = theme === item.val;
            return (
              <button
                key={item.val}
                onClick={() => setTheme(item.val as any)}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                  active ? 'bg-sky-500 text-white shadow' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon size={13} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <button onClick={() => go('/profile')} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition">
          <Avatar user={user} size={36} />
          <div className="flex-1 text-left min-w-0">
            <p className="font-semibold text-sm truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.phone}</p>
          </div>
        </button>

        <button onClick={handleLogout} className="w-full mt-2 flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition">
          <LogOut size={18} />
          <span className="text-sm font-semibold">{adaptText(t('logout'), lang)}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
