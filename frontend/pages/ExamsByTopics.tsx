import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../services/AppContext';
import { topicsAPI } from '../services/api';
import { adaptText } from '../services/transliterate';
import { ArrowLeft, Loader2 } from 'lucide-react';

const ExamsByTopics: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useApp();
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    topicsAPI.list().then(setTopics).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32}/></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <ArrowLeft size={16}/> {adaptText(t('back'), lang)}
        </button>
        <h1 className="text-base sm:text-xl font-bold text-center flex-1 px-2">{adaptText(t('exam_by_topics'), lang)}</h1>
        <div className="w-20 hidden sm:block"/>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-20 text-slate-500">{adaptText(t('no_data'), lang)}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-3">
          {topics.map(topic => (
            <button key={topic.id} onClick={() => navigate(`/quiz?mode=topic&topicId=${topic.id}&examType=topic-exam`)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 hover:border-sky-400 hover:shadow-lg transition text-left flex items-start gap-3 active:scale-[0.97]">
              <div className="w-9 h-9 bg-sky-500 text-white rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">{topic.number}</div>
              <p className="font-semibold text-sm leading-snug flex-1">{adaptText(topic.name, lang)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamsByTopics;
