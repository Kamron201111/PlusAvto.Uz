import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../services/AppContext';
import { adaptText } from '../services/transliterate';
import { CheckCircle2, XCircle, Home, RotateCcw, Award } from 'lucide-react';

const Result: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, t } = useApp();
  const state = location.state as any;

  if (!state) {
    return <div className="text-center py-20"><button onClick={() => navigate('/topics')} className="px-4 py-2 bg-sky-500 text-white rounded">Bosh sahifa</button></div>;
  }

  const { correct, wrong, total, score, passed } = state;
  const unanswered = total - correct - wrong;

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className={`rounded-3xl p-6 sm:p-8 text-white text-center shadow-2xl mb-5 ${passed ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' : 'bg-gradient-to-br from-red-500 to-red-700'}`}>
        <Award size={56} className="mx-auto mb-3"/>
        <div className="text-5xl sm:text-6xl font-black mb-2">{score}%</div>
        <p className="text-base sm:text-lg font-bold">{adaptText(passed ? t('passed') : t('failed'), lang)}</p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
        <Box icon={<CheckCircle2 className="text-emerald-500" size={22}/>} value={correct} label={adaptText(t('correct'), lang)} color="emerald"/>
        <Box icon={<XCircle className="text-red-500" size={22}/>} value={wrong} label={adaptText(t('wrong'), lang)} color="red"/>
        <Box icon={<span className="text-slate-500 text-2xl">—</span>} value={unanswered} label={lang === 'kr' ? 'Жавобсиз' : 'Javobsiz'} color="slate"/>
      </div>

      <div className="flex gap-2 sm:gap-3">
        <button onClick={() => navigate(-2)} className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
          <RotateCcw size={18}/> {adaptText(t('retry'), lang)}
        </button>
        <button onClick={() => navigate('/topics')} className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold flex items-center justify-center gap-2">
          <Home size={18}/> {adaptText(t('home'), lang)}
        </button>
      </div>
    </div>
  );
};

const Box: React.FC<{icon: any; value: number; label: string; color: string}> = ({icon, value, label, color}) => {
  const map: any = {
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
    red: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400',
    slate: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
  };
  return (
    <div className={`rounded-2xl p-3 sm:p-4 text-center border ${map[color]}`}>
      <div className="mx-auto mb-1">{icon}</div>
      <div className="text-xl sm:text-2xl font-bold">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
};

export default Result;
