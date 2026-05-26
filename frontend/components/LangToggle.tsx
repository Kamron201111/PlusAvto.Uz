import React from 'react';
import { useApp } from '../services/AppContext';

const LangToggle: React.FC = () => {
  const { lang, setLang } = useApp();
  return (
    <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs">
      <button
        onClick={() => setLang('uz')}
        className={`px-2 py-1 rounded font-bold transition ${
          lang === 'uz' ? 'bg-sky-500 text-white' : 'text-slate-600 dark:text-slate-400'
        }`}
      >
        Uzbek
      </button>
      <button
        onClick={() => setLang('kr')}
        className={`px-2 py-1 rounded font-bold transition ${
          lang === 'kr' ? 'bg-sky-500 text-white' : 'text-slate-600 dark:text-slate-400'
        }`}
      >
        Кирилл
      </button>
    </div>
  );
};

export default LangToggle;
