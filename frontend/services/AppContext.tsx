import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authAPI, premiumAPI } from './api';
import { Lang, t as tt } from './i18n';

interface User {
  id: number;
  phone: string;
  name: string;
  email?: string;
  telegram?: string;
  avatar?: string;
  role: 'user' | 'admin';
}

interface AppCtx {
  user: User | null;
  setUser: (u: User | null) => void;
  login: (phone: string, password: string) => Promise<void>;
  register: (phone: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (t: 'light' | 'dark' | 'system') => void;
  t: (key: any) => string;
  premium: boolean;
  refreshPremium: () => void;
  loading: boolean;
}

const Ctx = createContext<AppCtx>({} as AppCtx);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem('pa_lang') as Lang) || 'uz');
  const [theme, setThemeState] = useState<'light' | 'dark' | 'system'>(() =>
    (localStorage.getItem('pa_theme') as any) || 'light'
  );
  const [premium, setPremium] = useState(false);

  // Avto login from token
  useEffect(() => {
    const token = localStorage.getItem('pa_token');
    if (!token) { setLoading(false); return; }
    authAPI.me()
      .then(u => setUserState(u))
      .catch(() => localStorage.removeItem('pa_token'))
      .finally(() => setLoading(false));
  }, []);

  const refreshPremium = async () => {
    if (!user) { setPremium(false); return; }
    try {
      const r = await premiumAPI.status();
      setPremium(r.active);
    } catch {
      setPremium(false);
    }
  };

  useEffect(() => { refreshPremium(); }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    };
    apply();
    localStorage.setItem('pa_theme', theme);
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme]);

  useEffect(() => { localStorage.setItem('pa_lang', lang); }, [lang]);

  const setUser = (u: User | null) => {
    setUserState(u);
  };

  const login = async (phone: string, password: string) => {
    const r = await authAPI.login(phone, password);
    localStorage.setItem('pa_token', r.token);
    setUserState(r.user);
  };

  const register = async (phone: string, password: string, name: string) => {
    const r = await authAPI.register(phone, password, name);
    localStorage.setItem('pa_token', r.token);
    setUserState(r.user);
  };

  const logout = () => {
    localStorage.removeItem('pa_token');
    setUserState(null);
  };

  return (
    <Ctx.Provider value={{
      user, setUser, login, register, logout,
      lang, setLang: setLangState,
      theme, setTheme: setThemeState,
      t: (key) => tt(lang, key),
      premium, refreshPremium,
      loading,
    }}>
      {children}
    </Ctx.Provider>
  );
};

export const useApp = () => useContext(Ctx);
