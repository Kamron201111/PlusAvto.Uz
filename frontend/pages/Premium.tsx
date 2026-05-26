import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../services/AppContext';
import { settingsAPI, premiumAPI } from '../services/api';
import { adaptText } from '../services/transliterate';
import { Copy, CreditCard, Check, ArrowLeft, Upload, Send, X, Image as ImageIcon } from 'lucide-react';

const Premium: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useApp();
  const [settings, setSettings] = useState<any>({});
  const [copied, setCopied] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [receipt, setReceipt] = useState<string>('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { settingsAPI.get().then(setSettings); }, []);

  const plans = [
    { label: lang === 'uz' ? '1 Hafta' : '1 Ҳафта', price: settings.price_week  || '15000',  days: 7 },
    { label: lang === 'uz' ? '1 Oy' : '1 Ой',        price: settings.price_month || '49000',  days: 30, popular: true },
    { label: lang === 'uz' ? '1 Yil' : '1 Йил',      price: settings.price_year  || '350000', days: 365 },
  ];

  const copyCard = () => {
    navigator.clipboard.writeText((settings.card_number || '').replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("Fayl 5 MB dan katta"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setReceipt(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (selectedPlan === null) { alert(lang === 'kr' ? "Тарифни танланг" : "Tarifni tanlang"); return; }
    if (!amount.trim()) { alert(lang === 'kr' ? "Миқдор" : "Miqdorni kiriting"); return; }
    if (!receipt) { alert(lang === 'kr' ? "Чек юкланг" : "Chek yuklang"); return; }
    setLoading(true);
    try {
      await premiumAPI.request({ amount, plan_label: plans[selectedPlan].label, receipt, comment });
      setSent(true);
      setTimeout(() => navigate('/'), 2500);
    } catch (e: any) {
      alert(e.response?.data?.error || "Xato");
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto py-10 text-center">
        <div className="w-20 h-20 bg-emerald-500 rounded-full mx-auto flex items-center justify-center mb-4">
          <Check className="text-white" size={40}/>
        </div>
        <h2 className="text-xl font-bold mb-2">{lang === 'kr' ? "Сўров юборилди!" : "So'rov yuborildi!"}</h2>
        <p className="text-sm text-slate-500">{lang === 'kr' ? "Админ тез фаоллаштиради" : "Admin tez orada faollashtiradi"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 text-sm">
        <ArrowLeft size={16}/> {adaptText(t('back'), lang)}
      </button>

      <div className="mb-5">
        <p className="text-sky-500 font-semibold text-sm mb-1">PlusAvto.Uz</p>
        <h1 className="text-2xl font-bold mb-2">{adaptText(t('premium_title'), lang)}</h1>
        <p className="text-sm text-slate-500">{adaptText(t('premium_desc'), lang)}</p>
      </div>

      <p className="text-xs uppercase text-slate-500 font-bold mb-2">{lang === 'kr' ? '1. Тарифни танланг' : "1. Tarifni tanlang"}</p>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {plans.map((p, i) => (
          <button key={i} onClick={() => { setSelectedPlan(i); setAmount(p.price); }}
            className={`rounded-2xl p-3 sm:p-4 text-center relative ${
              selectedPlan === i ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white ring-4 ring-sky-300'
              : p.popular ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}>
            {p.popular && <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">🔥</span>}
            <p className="font-bold text-xs sm:text-sm mb-1">{p.label}</p>
            <p className="text-lg sm:text-2xl font-black">{parseInt(p.price).toLocaleString()}</p>
            <p className="text-[10px] sm:text-xs opacity-80">{lang === 'kr' ? 'сўм' : "so'm"}</p>
          </button>
        ))}
      </div>

      <p className="text-xs uppercase text-slate-500 font-bold mb-2">{lang === 'kr' ? '2. Картага тўлов' : "2. Kartaga to'lov"}</p>
      <div className="bg-gradient-to-br from-sky-500 to-blue-700 rounded-2xl p-5 text-white mb-5">
        <div className="flex items-center gap-3 mb-3">
          <CreditCard size={28}/>
          <div>
            <p className="text-xs opacity-80">{adaptText(t('card_number'), lang)}</p>
            <p className="text-lg sm:text-xl font-black tracking-wider break-all">{settings.card_number}</p>
          </div>
        </div>
        <p className="text-sm opacity-90 mb-3"><strong>{adaptText(t('card_owner'), lang)}:</strong> {settings.card_owner}</p>
        <button onClick={copyCard} className="w-full py-2.5 bg-white text-sky-700 rounded-xl font-bold flex items-center justify-center gap-2">
          {copied ? <Check size={16}/> : <Copy size={16}/>}
          {copied ? adaptText(t('copied'), lang) : adaptText(t('copy'), lang)}
        </button>
      </div>

      <p className="text-xs uppercase text-slate-500 font-bold mb-2">{lang === 'kr' ? "3. Тўлов маълумотларини юборинг" : "3. To'lov ma'lumotlarini yuboring"}</p>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 mb-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5">{lang === 'kr' ? "Тўлаган миқдор (сўм)" : "To'lagan miqdor (so'm)"}</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="15000" className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-base"/>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">{lang === 'kr' ? "Чек/Квитанция расми" : "Chek/Kvitansiya rasmi"}</label>
          {receipt ? (
            <div className="relative">
              <img src={receipt} alt="" className="w-full max-h-64 object-contain rounded-xl border border-slate-200 dark:border-slate-700"/>
              <button onClick={() => setReceipt('')} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full"><X size={16}/></button>
            </div>
          ) : (
            <label className="block w-full py-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center cursor-pointer hover:border-sky-500">
              <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden"/>
              <ImageIcon className="mx-auto text-slate-400 mb-2" size={32}/>
              <p className="text-sm text-slate-500 font-semibold"><Upload className="inline mr-1" size={14}/>{lang === 'kr' ? "Расм юклаш" : "Rasm yuklash"}</p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG (max 5MB)</p>
            </label>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">{lang === 'kr' ? "Изоҳ" : "Izoh"}</label>
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2}
            placeholder={lang === 'kr' ? "Қўшимча..." : "Qo'shimcha..."}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm"/>
        </div>
      </div>

      <button onClick={submit} disabled={loading}
        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
        <Send size={18}/> {loading ? '...' : (lang === 'kr' ? "Админга юбориш" : "Adminga yuborish")}
      </button>
    </div>
  );
};

export default Premium;
