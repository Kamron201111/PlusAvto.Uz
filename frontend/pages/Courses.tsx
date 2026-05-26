import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../services/AppContext';
import { coursesAPI } from '../services/api';
import { adaptText } from '../services/transliterate';
import { ArrowLeft, Play, Video, X, Lock, Loader2 } from 'lucide-react';

const Courses: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t, premium, user } = useApp();
  const [items, setItems] = useState<any[]>([]);
  const [active, setActive] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const canAccess = premium || user?.role === 'admin';

  useEffect(() => {
    if (!canAccess) { setLoading(false); return; }
    coursesAPI.list().then(setItems).finally(() => setLoading(false));
  }, [canAccess]);

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  if (!canAccess) {
    return (
      <div className="max-w-md mx-auto py-10 text-center">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <Lock className="text-white" size={36}/>
        </div>
        <h2 className="text-xl font-bold mb-2">{adaptText(t('premium_required'), lang)}</h2>
        <p className="text-sm text-slate-500 mb-6">{lang === 'kr' ? "Видео курслар фақат премиум учун" : "Video kurslar faqat premium uchun"}</p>
        <button onClick={() => navigate('/premium')} className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold shadow-lg">
          {adaptText(t('buy_premium_btn'), lang)}
        </button>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32}/></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <ArrowLeft size={16}/> {adaptText(t('back'), lang)}
        </button>
        <h1 className="text-base sm:text-xl font-bold">{adaptText(t('menu_courses'), lang)}</h1>
        <div className="w-20 hidden sm:block"/>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Video className="mx-auto text-slate-300 mb-3" size={48}/>
          <p className="text-sm text-slate-500">{adaptText(t('no_data'), lang)}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(c => (
            <button key={c.id} onClick={() => setActive(c)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-sky-400 hover:shadow-lg transition text-left active:scale-[0.98]">
              <div className="aspect-video bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 rounded-xl flex items-center justify-center mb-3">
                <Play size={36} className="text-sky-500"/>
              </div>
              <p className="font-bold text-sm">{c.number}. {adaptText(c.title, lang)}</p>
              {c.description && <p className="text-xs text-slate-500 mt-1">{adaptText(c.description, lang)}</p>}
            </button>
          ))}
        </div>
      )}

      {active && (
        <div onClick={() => setActive(null)} className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="w-full max-w-3xl bg-slate-900 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-3">
              <h3 className="font-bold text-white">{active.number}. {adaptText(active.title, lang)}</h3>
              <button onClick={() => setActive(null)} className="p-1 hover:bg-slate-800 rounded text-white"><X size={20}/></button>
            </div>
            <div className="aspect-video">
              <iframe src={getEmbedUrl(active.video_url)} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
