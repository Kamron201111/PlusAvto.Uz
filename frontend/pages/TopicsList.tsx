import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { topicsAPI } from '../services/api';
import { useApp } from '../services/AppContext';
import { adaptText } from '../services/transliterate';
import { ArrowLeft, Lock, Loader2 } from 'lucide-react';

const TopicsList: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t, premium, user } = useApp();
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';
  const canAccessAll = premium || isAdmin;

  useEffect(() => {
    topicsAPI.list().then(setTopics).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32}/></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl">
          <ArrowLeft size={16}/> {adaptText(t('back'), lang)}
        </button>
        <h1 className="text-base sm:text-xl font-bold text-center flex-1 px-2">{adaptText(t('topic_training'), lang)}</h1>
        <div className="w-20 hidden sm:block"/>
      </div>

      {!canAccessAll && topics.length > 1 && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl flex items-center gap-3">
          <Lock className="text-amber-500" size={20}/>
          <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 flex-1">
            {lang === 'kr' ? "Бепул фойдаланувчилар учун фақат 1-мавзу очиқ." : "Bepul foydalanuvchilar uchun faqat 1-mavzu ochiq."}
          </p>
          <button onClick={() => navigate('/premium')} className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg font-semibold">
            {lang === 'kr' ? "Сотиб олиш" : "Sotib olish"}
          </button>
        </div>
      )}

      {topics.length === 0 ? (
        <div className="text-center py-20 text-slate-500"><p>{adaptText(t('no_data'), lang)}</p></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
          {topics.map((topic, idx) => {
            const locked = !canAccessAll && idx > 0;
            return (
              <button
                key={topic.id}
                onClick={() => locked ? navigate('/premium') : navigate(`/quiz?mode=topic&topicId=${topic.id}`)}
                className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 transition text-left flex items-start gap-3 active:scale-[0.97] ${
                  locked ? 'opacity-60' : 'hover:border-sky-400 hover:shadow-lg'
                }`}
              >
                <div className="w-9 h-9 bg-sky-500 text-white rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">{topic.number}</div>
                <div className="flex-1 min-w-0"><p className="font-semibold text-sm leading-snug">{adaptText(topic.name, lang)}</p></div>
                {locked && <Lock size={14} className="text-amber-500 flex-shrink-0"/>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopicsList;
