import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../services/AppContext';
import { notificationsAPI } from '../services/api';
import { adaptText } from '../services/transliterate';
import { ArrowLeft, Bell, Loader2 } from 'lucide-react';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useApp();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsAPI.list().then(setItems).finally(() => setLoading(false));
    notificationsAPI.markRead().catch(() => {});
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32}/></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <ArrowLeft size={16}/> {adaptText(t('back'), lang)}
        </button>
        <h1 className="text-base sm:text-xl font-bold">{lang === 'kr' ? 'Хабарлар' : 'Habarlar'}</h1>
        <div className="w-20 hidden sm:block"/>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="mx-auto text-slate-300 mb-3" size={48}/>
          <p className="text-sm text-slate-500">{lang === 'kr' ? "Хабарлар йўқ" : "Habarlar yo'q"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(n => (
            <div key={n.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-sky-100 dark:bg-sky-500/20 text-sky-500 rounded-xl flex items-center justify-center"><Bell size={18}/></div>
                <div className="flex-1">
                  <p className="font-bold mb-1">{adaptText(n.title, lang)}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{adaptText(n.message, lang)}</p>
                  <p className="text-xs text-slate-400 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
