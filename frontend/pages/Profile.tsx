import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../services/AppContext';
import { authAPI, premiumAPI } from '../services/api';
import { adaptText } from '../services/transliterate';
import { Camera, Save, ArrowLeft, Lock, Eye, EyeOff, X, Phone } from 'lucide-react';
import Avatar from '../components/Avatar';
import PhoneInput from '../components/PhoneInput';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser, lang, t } = useApp();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    telegram: user?.telegram || '',
  });
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saved, setSaved] = useState(false);
  const [showPassChange, setShowPassChange] = useState(false);
  const [showPhoneChange, setShowPhoneChange] = useState(false);
  const [premiumInfo, setPremiumInfo] = useState<any>({ active: false });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    premiumAPI.status().then(setPremiumInfo).catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      const u = await authAPI.updateProfile({ ...form, avatar });
      setUser(u);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      alert(e.response?.data?.error || "Xato");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert(lang === 'kr' ? 'Расм 3 МБ дан катта' : "Rasm 3 MB dan katta"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 text-sm">
        <ArrowLeft size={16}/> {adaptText(t('back'), lang)}
      </button>

      <div className="mb-5">
        <p className="text-sky-500 font-semibold text-sm mb-1">PlusAvto.Uz</p>
        <h1 className="text-2xl font-bold mb-2">{adaptText(t('profile'), lang)}</h1>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="mb-3">
              {avatar ? (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-slate-100 dark:ring-slate-700">
                  <img src={avatar} alt="" className="w-full h-full object-cover"/>
                </div>
              ) : (
                <Avatar user={user} size={128} className="ring-4 ring-slate-100 dark:ring-slate-700"/>
              )}
            </div>
            <button onClick={() => fileRef.current?.click()} className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold flex items-center gap-1">
              <Camera size={14}/> {adaptText(t('upload_photo'), lang)}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden"/>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 w-full">
            <Field label={t('name')} value={form.name} onChange={v => setForm({...form, name: v})} lang={lang}/>
            <Field label={t('phone')} value={user?.phone || ''} onChange={() => {}} lang={lang} readOnly/>
            <Field label={t('email')} value={form.email} onChange={v => setForm({...form, email: v})} lang={lang}/>
            <Field label={t('telegram')} value={form.telegram} onChange={v => setForm({...form, telegram: v})} lang={lang}/>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 mb-0.5">{adaptText(t('subscription_status'), lang)}</p>
              <p className={`font-bold ${premiumInfo.active ? 'text-emerald-500' : 'text-red-500'}`}>
                {adaptText(premiumInfo.active ? t('active') : t('not_active'), lang)}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 mb-0.5">{adaptText(t('subscription_expires'), lang)}</p>
              <p className="font-bold">{premiumInfo.expires_at ? new Date(premiumInfo.expires_at).toLocaleDateString() : '-'}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={handleSave} className="flex-1 min-w-[180px] py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
            <Save size={18}/> {saved ? '✓ Saqlandi' : adaptText(t('save'), lang)}
          </button>
          <button onClick={() => setShowPassChange(true)} className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex items-center gap-2">
            <Lock size={18}/> {lang === 'kr' ? "Парол" : "Parol"}
          </button>
          <button onClick={() => setShowPhoneChange(true)} className="px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold flex items-center gap-2">
            <Phone size={18}/> {lang === 'kr' ? "Телефон" : "Telefon"}
          </button>
        </div>
      </div>

      {showPassChange && <PasswordChangeModal onClose={() => setShowPassChange(false)} lang={lang}/>}
      {showPhoneChange && <PhoneChangeModal onClose={() => setShowPhoneChange(false)} lang={lang} currentPhone={user?.phone || ''}/>}
    </div>
  );
};

const Field: React.FC<any> = ({label, value, onChange, lang, readOnly}) => (
  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700">
    <p className="text-xs text-slate-500 mb-1">{adaptText(label, lang)}</p>
    <input value={value} onChange={e => onChange(e.target.value)} readOnly={readOnly}
      placeholder="-"
      className="w-full bg-transparent outline-none font-bold text-base"/>
  </div>
);

const PasswordChangeModal: React.FC<{onClose: () => void; lang: any}> = ({onClose, lang}) => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr('');
    if (!oldPass || newPass.length < 4) {
      setErr(lang === 'kr' ? "Тўлдиринг" : "Maydonlarni to'ldiring");
      return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword(oldPass, newPass);
      alert(lang === 'kr' ? "Парол ўзгартирилди" : "Parol o'zgartirildi");
      onClose();
    } catch (e: any) {
      setErr(e.response?.data?.error || "Xato");
    }
    setLoading(false);
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl p-5 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{lang === 'kr' ? "Парол ўзгартириш" : "Parolni o'zgartirish"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><X size={18}/></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1">{lang === 'kr' ? "Эски парол" : "Eski parol"}</label>
            <div className="relative">
              <input type={showOld ? 'text' : 'password'} value={oldPass} onChange={e => setOldPass(e.target.value)}
                className="w-full px-3 py-2 pr-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"/>
              <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showOld ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">{lang === 'kr' ? "Янги парол" : "Yangi parol"}</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)}
                className="w-full px-3 py-2 pr-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"/>
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showNew ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>
          {err && <div className="px-3 py-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm">{err}</div>}
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 rounded-xl font-semibold">{lang === 'kr' ? "Бекор" : "Bekor"}</button>
            <button onClick={submit} disabled={loading} className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold">
              {loading ? '...' : (lang === 'kr' ? "Сақлаш" : "Saqlash")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PhoneChangeModal: React.FC<{onClose: () => void; lang: any; currentPhone: string}> = ({onClose, lang, currentPhone}) => {
  const { setUser } = useApp();
  const [password, setPassword] = useState('');
  const [newPhone, setNewPhone] = useState('+998');
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr('');
    if (!password) { setErr(lang === 'kr' ? "Паролни киритинг" : "Parolni kiriting"); return; }
    if (newPhone.length !== 13) { setErr(lang === 'kr' ? "Телефон тўлиқ эмас" : "Telefon to'liq emas"); return; }
    if (newPhone === currentPhone) { setErr(lang === 'kr' ? "Янги рақам эскисидек" : "Yangi raqam eskisi bilan bir xil"); return; }

    setLoading(true);
    try {
      const r = await authAPI.changePhone(password, newPhone);
      if (r.token) localStorage.setItem('pa_token', r.token);
      if (r.user) setUser(r.user);
      alert(lang === 'kr' ? "Телефон рақам ўзгартирилди" : "Telefon raqam o'zgartirildi");
      onClose();
    } catch (e: any) {
      setErr(e.response?.data?.error || "Xato");
    }
    setLoading(false);
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl p-5 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">{lang === 'kr' ? "Телефонни ўзгартириш" : "Telefonni o'zgartirish"}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"><X size={18}/></button>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          {lang === 'kr' ? "Жорий рақам: " : "Joriy raqam: "}<strong>{currentPhone}</strong>
        </p>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1">{lang === 'kr' ? "Янги телефон рақам" : "Yangi telefon raqam"}</label>
            <PhoneInput value={newPhone} onChange={setNewPhone}/>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">{lang === 'kr' ? "Жорий парол (тасдиқлаш учун)" : "Joriy parol (tasdiqlash uchun)"}</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder={lang === 'kr' ? "Паролингиз" : "Parolingiz"}
                className="w-full px-3 py-2 pr-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"/>
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>
          {err && <div className="px-3 py-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-sm">{err}</div>}
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 rounded-xl font-semibold">{lang === 'kr' ? "Бекор" : "Bekor"}</button>
            <button onClick={submit} disabled={loading} className="flex-1 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold">
              {loading ? '...' : (lang === 'kr' ? "Сақлаш" : "Saqlash")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
