import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../services/AppContext';
import { adaptText } from '../services/transliterate';
import { ArrowLeft, FileCheck, BookOpen, ClipboardCheck, X } from 'lucide-react';

const ExamsHome: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useApp();
  const [showFinalChooser, setShowFinalChooser] = useState(false);

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 text-sm">
        <ArrowLeft size={16}/> {adaptText(t('back'), lang)}
      </button>

      <div className="mb-5">
        <p className="text-sky-500 font-semibold text-sm mb-1">PlusAvto.Uz</p>
        <h1 className="text-2xl font-bold mb-2">{adaptText(t('exam_topshirish'), lang)}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <button onClick={() => navigate('/exams/by-topics')} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-sky-400 hover:shadow-lg transition text-left flex items-start gap-3 active:scale-[0.98]">
          <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center text-sky-500"><BookOpen size={24}/></div>
          <p className="font-bold text-base flex-1">{adaptText(t('exam_by_topics'), lang)}</p>
        </button>
        <button onClick={() => navigate('/exams/interim')} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-sky-400 hover:shadow-lg transition text-left flex items-start gap-3 active:scale-[0.98]">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-500"><ClipboardCheck size={24}/></div>
          <p className="font-bold text-base flex-1">{adaptText(t('interim_control'), lang)}</p>
        </button>
        <button onClick={() => setShowFinalChooser(true)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-sky-400 hover:shadow-lg transition text-left flex items-start gap-3 active:scale-[0.98]">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-500"><FileCheck size={24}/></div>
          <p className="font-bold text-base flex-1">{adaptText(t('exam_topshirish'), lang)}</p>
        </button>
      </div>

      {showFinalChooser && (
        <div onClick={() => setShowFinalChooser(false)} className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl p-5 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{adaptText(t('choose'), lang)}</h3>
              <button onClick={() => setShowFinalChooser(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><X size={18}/></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate('/quiz?mode=final&examType=final&count=20')} className="py-4 bg-sky-500 hover:bg-sky-600 rounded-xl text-white font-bold">20 {lang === 'kr' ? 'та' : 'ta'}</button>
              <button onClick={() => navigate('/quiz?mode=final&examType=final&count=50')} className="py-4 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-white font-bold">50 {lang === 'kr' ? 'та' : 'ta'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsHome;
