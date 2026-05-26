import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../services/AppContext';
import { adaptText } from '../services/transliterate';
import { settingsAPI, favoritesAPI, mistakesAPI, questionsAPI } from '../services/api';
import {
  BookOpen, Ticket, Shuffle, Heart, XCircle, BarChart3,
  FileCheck, AlertCircle, Lock, ListTodo,
} from 'lucide-react';
import RandomCountModal from '../components/RandomCountModal';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t, premium, user } = useApp();
  const [settings, setSettings] = useState<any>({});
  const [favCount, setFavCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [wrongPercent, setWrongPercent] = useState(0);
  const [showRandom, setShowRandom] = useState(false);

  const isAdmin = user?.role === 'admin';
  const canAccess = premium || isAdmin;

  useEffect(() => {
    settingsAPI.get().then(setSettings).catch(() => {});
    Promise.all([
      favoritesAPI.list().catch(() => []),
      mistakesAPI.list().catch(() => []),
      questionsAPI.list().catch(() => []),
    ]).then(([fav, mis, all]) => {
      setFavCount(fav.length);
      setMistakeCount(mis.length);
      setWrongPercent(all.length > 0 ? Math.round((mis.length / all.length) * 100) : 0);
    });
  }, []);

  const handlePremium = (action: () => void) => {
    if (!canAccess) { navigate('/premium'); return; }
    action();
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <p className="text-sky-500 font-semibold text-sm mb-1">{settings.app_name || 'PlusAvto.Uz'}</p>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{adaptText(t('menu_topic'), lang)}</h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{adaptText(t('app_desc'), lang)}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        <button onClick={() => navigate('/favorites')} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 flex items-center gap-3 hover:shadow-lg active:scale-[0.98]">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-500"><Heart size={20}/></div>
          <div className="flex-1 text-left">
            <p className="text-xs text-slate-500">{adaptText(t('my_favorite'), lang)}</p>
            <p className="text-2xl font-bold">{favCount}</p>
          </div>
        </button>

        <button onClick={() => navigate('/mistakes')} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 flex items-center gap-3 hover:shadow-lg active:scale-[0.98]">
          <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-500"><XCircle size={20}/></div>
          <div className="flex-1 text-left">
            <p className="text-xs text-slate-500">{adaptText(t('my_mistakes'), lang)}</p>
            <p className="text-2xl font-bold">{mistakeCount}</p>
          </div>
        </button>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-500"><BarChart3 size={20}/></div>
          <div className="flex-1">
            <p className="text-xs text-slate-500">{adaptText(t('all_mistakes'), lang)}</p>
            <p className="text-2xl font-bold">{wrongPercent}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        <Card onClick={() => navigate('/topics-list')} icon={<BookOpen size={22}/>} color="sky" label={adaptText(t('topic_training'), lang)} />
        <Card onClick={() => handlePremium(() => navigate('/tickets'))} icon={<Ticket size={22}/>} color="blue" label={adaptText(t('ticket_training'), lang)} locked={!canAccess}/>
        <Card onClick={() => handlePremium(() => navigate('/exams'))} icon={<FileCheck size={22}/>} color="emerald" label={adaptText(t('exam_topshirish'), lang)} locked={!canAccess}/>
        <Card onClick={() => handlePremium(() => navigate('/vazifalar'))} icon={<ListTodo size={22}/>} color="orange" label={adaptText(t('vazifa_topshirish'), lang)} locked={!canAccess}/>
        <Card onClick={() => handlePremium(() => setShowRandom(true))} icon={<Shuffle size={22}/>} color="purple" label={adaptText(t('random_test'), lang)} locked={!canAccess}/>
        <Card onClick={() => navigate('/mistakes')} icon={<AlertCircle size={22}/>} color="red" label={adaptText(t('my_mistakes'), lang)}/>
      </div>

      {showRandom && (
        <RandomCountModal
          onClose={() => setShowRandom(false)}
          onSelect={(count) => { setShowRandom(false); navigate(`/quiz?mode=random&count=${count}`); }}
        />
      )}
    </div>
  );
};

const Card: React.FC<{ onClick: () => void; icon: React.ReactNode; color: string; label: string; locked?: boolean }> = ({ onClick, icon, color, label, locked }) => {
  const colorMap: any = {
    sky: 'bg-sky-100 dark:bg-sky-500/20 text-sky-500',
    blue: 'bg-blue-100 dark:bg-blue-500/20 text-blue-500',
    emerald: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500',
    orange: 'bg-orange-100 dark:bg-orange-500/20 text-orange-500',
    purple: 'bg-purple-100 dark:bg-purple-500/20 text-purple-500',
    red: 'bg-red-100 dark:bg-red-500/20 text-red-500',
  };
  return (
    <button onClick={onClick} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center gap-3 hover:shadow-lg hover:border-sky-400 transition text-left active:scale-[0.98]">
      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>{icon}</div>
      <p className="font-bold text-sm sm:text-base flex-1">{label}</p>
      {locked && <Lock size={16} className="text-amber-500"/>}
    </button>
  );
};

export default HomePage;
