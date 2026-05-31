import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../services/AppContext';
import { adaptText } from '../services/transliterate';
import { CheckCircle2, XCircle, Home, RotateCcw, Award, Zap, AlertCircle, ChevronRight } from 'lucide-react';

const Result: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, t } = useApp();
  const state = location.state as any;
  const [selectedQ, setSelectedQ] = useState<any>(null);

  if (!state) {
    return <div className="text-center py-20"><button onClick={() => navigate('/topics')} className="px-4 py-2 bg-sky-500 text-white rounded">Bosh sahifa</button></div>;
  }

  const { correct, wrong, total, score, passed, questions, answers, isMarathon } = state;
  const unanswered = total - correct - wrong;

  // Marafon uchun - xato va javobsiz savollarni topish
  const problemQuestions = (questions || []).map((q: any, idx: number) => {
    const userAns = answers?.[q.id];
    const isWrong = userAns && userAns !== q.correct_answer;
    const isSkipped = !userAns;
    return { ...q, index: idx + 1, userAns, isWrong, isSkipped };
  }).filter((q: any) => q.isWrong || q.isSkipped);

  const getQText = (q: any) => (lang === 'kr' && q.text_kr) ? q.text_kr : q.text;
  const getQExplanation = (q: any) => (lang === 'kr' && q.explanation_kr) ? q.explanation_kr : q.explanation;
  const getOptions = (q: any) => {
    const optsKr = q.options_kr;
    const source = (lang === 'kr' && optsKr) ? optsKr : (q.options || {});
    const result: { key: string; value: string }[] = [];
    ['f1','f2','f3','f4','f5','f6'].forEach(k => {
      const v = source[k];
      if (v) result.push({ key: k, value: v });
    });
    return result;
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-3">
      <div className={`rounded-3xl p-6 sm:p-8 text-white text-center shadow-2xl mb-5 ${
        isMarathon
          ? 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500'
          : passed
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-700'
            : 'bg-gradient-to-br from-red-500 to-red-700'
      }`}>
        {isMarathon ? <Zap size={56} className="mx-auto mb-3" fill="white"/> : <Award size={56} className="mx-auto mb-3"/>}
        <div className="text-5xl sm:text-6xl font-black mb-2">{score}%</div>
        <p className="text-base sm:text-lg font-bold">
          {isMarathon
            ? '🔥 ' + adaptText(t('marathon_finished'), lang)
            : adaptText(passed ? t('passed') : t('failed'), lang)}
        </p>
        {isMarathon && (
          <p className="text-sm opacity-90 mt-1">{total} {lang === 'kr' ? 'та саволдан' : 'ta savoldan'}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
        <Box icon={<CheckCircle2 className="text-emerald-500" size={22}/>} value={correct} label={adaptText(t('correct'), lang)} color="emerald"/>
        <Box icon={<XCircle className="text-red-500" size={22}/>} value={wrong} label={adaptText(t('wrong'), lang)} color="red"/>
        <Box icon={<AlertCircle className="text-slate-500" size={22}/>} value={unanswered} label={lang === 'kr' ? 'Жавобсиз' : 'Javobsiz'} color="slate"/>
      </div>

      {/* Marafon uchun xato va qoldirilgan savollar ro'yxati */}
      {isMarathon && problemQuestions.length > 0 && (
        <div className="mb-5">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            <AlertCircle className="text-amber-500" size={20}/>
            {adaptText(t('fix_questions'), lang)}
            <span className="text-sm font-normal text-slate-500">({problemQuestions.length})</span>
          </h3>
          <div className="space-y-2">
            {problemQuestions.map((q: any) => (
              <button
                key={q.id}
                onClick={() => setSelectedQ(q)}
                className={`w-full text-left bg-white dark:bg-slate-900 border rounded-xl p-3 flex items-center gap-3 hover:shadow-md transition active:scale-[0.98] ${
                  q.isWrong
                    ? 'border-red-200 dark:border-red-500/30'
                    : 'border-amber-200 dark:border-amber-500/30'
                }`}
              >
                {/* Yuqorida qaysi raqamda kelgan bo'lsa - o'sha raqam ko'rsatiladi */}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 text-white ${
                  q.isWrong ? 'bg-red-500' : 'bg-amber-500'
                }`}>
                  {q.index}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold line-clamp-2">{adaptText(getQText(q), lang)}</p>
                  <p className={`text-xs mt-0.5 font-semibold ${q.isWrong ? 'text-red-500' : 'text-amber-500'}`}>
                    {q.isWrong
                      ? '✗ ' + adaptText(t('wrong_answer'), lang)
                      : '○ ' + adaptText(t('skipped'), lang)}
                  </p>
                </div>
                <ChevronRight size={18} className="text-slate-400"/>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 sm:gap-3">
        <button onClick={() => navigate(-2)} className="flex-1 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
          <RotateCcw size={18}/> {adaptText(t('retry'), lang)}
        </button>
        <button onClick={() => navigate('/topics')} className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold flex items-center justify-center gap-2">
          <Home size={18}/> {adaptText(t('home'), lang)}
        </button>
      </div>

      {/* Tanlangan savol detallari */}
      {selectedQ && (
        <div onClick={() => setSelectedQ(null)} className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 overflow-y-auto">
          <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm text-white ${
                  selectedQ.isWrong ? 'bg-red-500' : 'bg-amber-500'
                }`}>
                  {selectedQ.index}
                </div>
                <span className="font-bold">
                  {selectedQ.isWrong
                    ? adaptText(t('wrong_answer'), lang)
                    : adaptText(t('skipped'), lang)}
                </span>
              </div>
              <button onClick={() => setSelectedQ(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <XCircle size={20}/>
              </button>
            </div>

            <div className="bg-sky-500 text-white rounded-xl p-3 mb-3">
              <p className="font-bold text-sm sm:text-base leading-snug">{adaptText(getQText(selectedQ), lang)}</p>
            </div>

            {selectedQ.image && (
              <img src={selectedQ.image} alt="" className="w-full max-h-64 object-contain rounded-xl mb-3"/>
            )}

            <div className="space-y-2 mb-3">
              {getOptions(selectedQ).map((opt, i) => {
                const isCorrect = opt.key === selectedQ.correct_answer;
                const isUserChoice = selectedQ.userAns === opt.key;
                let cls = 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
                if (isCorrect) cls = 'bg-emerald-500 border-emerald-500 text-white';
                else if (isUserChoice) cls = 'bg-red-500 border-red-500 text-white';
                return (
                  <div key={opt.key} className={`p-3 rounded-xl border-2 flex items-center gap-2 ${cls}`}>
                    <span className="bg-white/30 font-bold text-xs px-2 py-1 rounded">F{i+1}</span>
                    <span className="text-sm flex-1">{adaptText(opt.value, lang)}</span>
                    {isCorrect && <CheckCircle2 size={18}/>}
                    {isUserChoice && !isCorrect && <XCircle size={18}/>}
                  </div>
                );
              })}
            </div>

            {getQExplanation(selectedQ) && (
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl text-sm">
                <p className="font-bold text-amber-700 dark:text-amber-400 mb-1">
                  💡 {lang === 'kr' ? 'Изоҳ' : 'Izoh'}
                </p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{adaptText(getQExplanation(selectedQ), lang)}</p>
              </div>
            )}
          </div>
        </div>
      )}
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
      <div className="mx-auto mb-1 flex justify-center">{icon}</div>
      <div className="text-xl sm:text-2xl font-bold">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
};

export default Result;
