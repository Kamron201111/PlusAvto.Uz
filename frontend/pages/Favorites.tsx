import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../services/AppContext';
import { favoritesAPI } from '../services/api';
import { adaptText } from '../services/transliterate';
import { ArrowLeft, Heart, Play, Loader2 } from 'lucide-react';

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useApp();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    favoritesAPI.list().then(setItems).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32}/></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <ArrowLeft size={16}/> {adaptText(t('back'), lang)}
        </button>
        <h1 className="text-base sm:text-xl font-bold">{adaptText(t('my_favorite'), lang)}</h1>
        <div className="w-20 hidden sm:block"/>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="mx-auto text-slate-300 mb-3" size={48}/>
          <p className="text-sm text-slate-500">{lang === 'kr' ? "Севимли саволлар йўқ" : "Sevimli savollar yo'q"}</p>
        </div>
      ) : (
        <>
          <button onClick={() => navigate('/quiz?mode=favorites')}
            className="w-full mb-4 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">
            <Play size={18}/> {items.length} {lang === 'kr' ? "та севимли" : "ta sevimli"}
          </button>
          <div className="space-y-2">
            {items.map((q, i) => (
              <div key={q.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex gap-3">
                <span className="w-7 h-7 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">{i+1}</span>
                <p className="text-sm flex-1">{adaptText(q.text, lang)}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Favorites;
