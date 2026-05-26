import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../services/AppContext';
import { interimsAPI } from '../services/api';
import { adaptText } from '../services/transliterate';
import { ArrowLeft, ClipboardCheck, Loader2 } from 'lucide-react';

const ExamsInterim: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useApp();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interimsAPI.list().then(setItems).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32}/></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <ArrowLeft size={16}/> {adaptText(t('back'), lang)}
        </button>
        <h1 className="text-base sm:text-xl font-bold text-center flex-1 px-2">{adaptText(t('interim_control'), lang)}</h1>
        <div className="w-20 hidden sm:block"/>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <ClipboardCheck className="mx-auto text-slate-300 mb-3" size={48}/>
          <p className="text-sm text-slate-500">{adaptText(t('no_data'), lang)}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {items.map(it => (
            <button key={it.id} onClick={() => navigate(`/quiz?mode=interim&interimId=${it.id}&examType=interim`)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 hover:border-sky-400 hover:shadow-lg transition text-left flex items-start gap-3 active:scale-[0.97]">
              <div className="w-9 h-9 bg-amber-500 text-white rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">{it.number}</div>
              <p className="font-semibold text-sm leading-snug flex-1">{adaptText(it.name, lang)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamsInterim;
