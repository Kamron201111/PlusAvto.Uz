import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../services/AppContext';
import { adaptText } from '../services/transliterate';
import {
  questionsAPI, mistakesAPI, favoritesAPI, topicsAPI, ticketsAPI, interimsAPI, vazifalarAPI,
} from '../services/api';
import { Bookmark, X, ChevronLeft, ChevronRight, Lightbulb, Loader2 } from 'lucide-react';
import LangToggle from '../components/LangToggle';

const Quiz: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { lang, t, user, premium } = useApp();

  const mode = params.get('mode') || 'random';
  const topicId = params.get('topicId');
  const ticketId = params.get('ticketId');
  const interimId = params.get('interimId');
  const vazifaId = params.get('vazifaId');
  const countParam = parseInt(params.get('count') || '20');
  const examType = params.get('examType');

  const isAdmin = user?.role === 'admin';

  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showExplain, setShowExplain] = useState(false);
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [favStatus, setFavStatus] = useState(false);
  const [title, setTitle] = useState('');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const isExamMode = examType === 'final' || examType === 'topic-exam' || examType === 'interim' || examType === 'vazifa';

  // Title va savollarni yuklash
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let qs: any[] = [];
        let titleText = t('random_test');

        if (mode === 'topic' && topicId) {
          qs = await questionsAPI.list({ topic_id: topicId });
          // shuffle
          for (let i = qs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [qs[i], qs[j]] = [qs[j], qs[i]]; }
          const all = await topicsAPI.list();
          const tp = all.find((x: any) => x.id == topicId);
          if (tp) titleText = `${tp.number}. ${tp.name}`;
        } else if (mode === 'ticket' && ticketId) {
          qs = await questionsAPI.list({ ticket_id: ticketId });
          const all = await ticketsAPI.list();
          const tk = all.find((x: any) => x.id == ticketId);
          if (tk) titleText = tk.name;
        } else if (mode === 'interim' && interimId) {
          qs = await questionsAPI.list({ interim_id: interimId });
          const all = await interimsAPI.list();
          const it = all.find((x: any) => x.id == interimId);
          if (it) titleText = `${it.number}. ${it.name}`;
        } else if (mode === 'vazifa' && vazifaId) {
          qs = await vazifalarAPI.getQuestions(Number(vazifaId));
          const all = await vazifalarAPI.list();
          const v = all.find((x: any) => x.id == vazifaId);
          if (v) titleText = `${v.number}. ${v.name}`;
        } else if (mode === 'mistakes') {
          qs = await mistakesAPI.list();
          titleText = t('my_mistakes');
        } else if (mode === 'favorites') {
          qs = await favoritesAPI.list();
          titleText = t('my_favorite');
        } else if (mode === 'random' || mode === 'final') {
          qs = await questionsAPI.random(countParam);
          titleText = mode === 'final' ? t('exam_topshirish') : t('random_test');
        }
        setQuestions(qs);
        setTitle(titleText);
      } catch (e) {
        console.error('Failed to load questions:', e);
      }
      setLoading(false);
    })();
  }, [mode, topicId, ticketId, interimId, vazifaId, countParam, lang]);

  useEffect(() => {
    if (!isExamMode || questions.length === 0) return;
    const iv = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { finishTest(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [isExamMode, questions]);

  const currentQ = questions[currentIdx];

  useEffect(() => {
    setShowExplain(false);
    // Check favorite
    if (!currentQ) return;
    favoritesAPI.list().then(favs => {
      setFavStatus(favs.some((f: any) => f.id === currentQ.id));
    }).catch(() => setFavStatus(false));
  }, [currentIdx, currentQ?.id]);

  const options = useMemo(() => {
    if (!currentQ) return [];
    const opts = currentQ.options || {};
    // Til bo'yicha alohida options bo'lsa
    const optsKr = currentQ.options_kr;
    const source = (lang === 'kr' && optsKr) ? optsKr : opts;
    const result: { key: string; value: string }[] = [];
    ['f1','f2','f3','f4','f5','f6'].forEach(k => {
      const v = source[k];
      if (v) result.push({ key: k, value: v });
    });
    return result;
  }, [currentQ?.id, lang]);

  const handleAnswer = async (optionKey: string) => {
    if (!currentQ || answers[currentQ.id]) return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: optionKey }));
    try {
      if (optionKey !== currentQ.correct_answer) {
        await mistakesAPI.add(currentQ.id);
      } else {
        await mistakesAPI.remove(currentQ.id);
      }
    } catch (e) { console.error(e); }
  };

  const toggleFav = async () => {
    if (!currentQ) return;
    try {
      const r = await favoritesAPI.toggle(currentQ.id);
      setFavStatus(r.favorited);
    } catch (e) { console.error(e); }
  };

  const finishTest = () => {
    const correct = questions.filter(q => answers[q.id] === q.correct_answer).length;
    const wrong = questions.filter(q => answers[q.id] && answers[q.id] !== q.correct_answer).length;
    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    navigate('/result', { state: { correct, wrong, total: questions.length, score, passed: score >= 80, questions, answers } });
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // Savol matnini lang bo'yicha olish — agar baza alohida saqlangan bo'lsa
  const getQText = (q: any) => (lang === 'kr' && q.text_kr) ? q.text_kr : q.text;
  const getQExplanation = (q: any) => (lang === 'kr' && q.explanation_kr) ? q.explanation_kr : q.explanation;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-sky-500" size={40}/>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-lg font-bold mb-2">{lang === 'kr' ? "Саволлар йўқ" : "Savollar yo'q"}</p>
          <p className="text-sm text-slate-500 mb-5">{lang === 'kr' ? "Бу бўлим учун саволлар қўшилмаган" : "Bu bo'lim uchun savollar qo'shilmagan"}</p>
          <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold">
            {adaptText(t('back'), lang)}
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;
  const userAnswer = answers[currentQ.id];
  const isAnswered = !!userAnswer;

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex flex-col z-40">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-2 sm:px-3 py-2 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => { if (confirm(lang === 'kr' ? "Тестни тугатасизми?" : "Testni tugatasizmi?")) navigate(-1); }}
          className="px-2 sm:px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold"
        >{adaptText(t('finish_test'), lang)}</button>

        <span className="text-xs sm:text-sm font-bold truncate max-w-[100px] sm:max-w-none">{adaptText(title, lang)}</span>

        {isExamMode && (
          <div className="px-2 py-1 bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded-lg text-xs font-bold">
            ⏱ {formatTime(timeLeft)}
          </div>
        )}

        <LangToggle />

        <button onClick={toggleFav} className={`p-1.5 rounded-lg ${favStatus ? 'text-amber-500' : 'text-slate-400'}`}>
          <Bookmark size={18} fill={favStatus ? 'currentColor' : 'none'}/>
        </button>

        <div className="flex-1 flex items-center gap-1 overflow-x-auto scroll-hidden">
          {questions.map((q, i) => {
            const ans = answers[q.id];
            let bg = 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
            if (ans) bg = ans === q.correct_answer ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white';
            if (i === currentIdx) bg = 'bg-sky-500 text-white ring-2 ring-sky-300';
            return (
              <button key={q.id} onClick={() => setCurrentIdx(i)}
                className={`min-w-[26px] h-6 sm:min-w-[28px] sm:h-7 rounded text-xs font-bold flex-shrink-0 ${bg}`}>
                {i + 1}
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex-1 overflow-auto p-2 sm:p-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-sky-500 text-white rounded-xl p-3 sm:p-4 mb-3 text-center">
            <h2 className="font-bold text-sm sm:text-base md:text-lg leading-snug">{adaptText(getQText(currentQ), lang)}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {currentQ.image && (
              <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
                <img src={currentQ.image} alt="" onClick={() => setZoomImage(currentQ.image)}
                  className="w-full max-h-[400px] object-contain cursor-zoom-in"/>
              </div>
            )}

            <div className={`space-y-2 ${!currentQ.image ? 'lg:col-span-2' : ''}`}>
              {options.map((opt, i) => {
                const isSelected = userAnswer === opt.key;
                const isCorrectOpt = opt.key === currentQ.correct_answer;
                let cls = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-400 text-slate-800 dark:text-slate-200';
                if (isAnswered) {
                  if (isCorrectOpt) cls = 'bg-emerald-500 border-emerald-500 text-white';
                  else if (isSelected && !isCorrectOpt) cls = 'bg-red-500 border-red-500 text-white';
                  else cls = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60';
                }
                return (
                  <button key={opt.key} onClick={() => handleAnswer(opt.key)} disabled={isAnswered}
                    className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${cls}`}>
                    <span className="bg-sky-500 text-white font-bold text-xs px-2 py-1 rounded">F{i+1}</span>
                    <span className="text-sm flex-1">{adaptText(opt.value, lang)}</span>
                  </button>
                );
              })}

              {isAnswered && getQExplanation(currentQ) && (
                <>
                  <button onClick={() => setShowExplain(!showExplain)}
                    className="w-full p-3 bg-amber-100 dark:bg-amber-500/20 hover:bg-amber-200 dark:hover:bg-amber-500/30 border border-amber-300 dark:border-amber-500/30 rounded-xl text-left text-sm font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <Lightbulb size={16}/>
                    {showExplain ? adaptText(t('hide_explanation'), lang) : adaptText(t('view_explanation'), lang)}
                  </button>
                  {showExplain && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-sm leading-relaxed">
                      {adaptText(getQExplanation(currentQ), lang)}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-4 sm:mt-5 flex items-center justify-between gap-2">
            <button onClick={() => setCurrentIdx(p => Math.max(0, p - 1))} disabled={currentIdx === 0}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold flex items-center gap-1 disabled:opacity-40 text-sm">
              <ChevronLeft size={16}/> <span className="hidden sm:inline">{adaptText(t('previous'), lang)}</span>
            </button>

            {currentIdx === questions.length - 1 ? (
              <button onClick={finishTest} className="px-4 sm:px-5 py-2 sm:py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm">
                {adaptText(t('finish_test'), lang)}
              </button>
            ) : (
              <button onClick={() => setCurrentIdx(p => Math.min(questions.length - 1, p + 1))}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold flex items-center gap-1 text-sm">
                <span className="hidden sm:inline">{adaptText(t('next'), lang)}</span> <ChevronRight size={16}/>
              </button>
            )}
          </div>
        </div>
      </div>

      {zoomImage && (
        <div onClick={() => setZoomImage(null)} className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2 cursor-zoom-out">
          <img src={zoomImage} alt="" className="max-h-[95vh] max-w-[95vw] object-contain"/>
          <button onClick={() => setZoomImage(null)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white">
            <X size={22}/>
          </button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
