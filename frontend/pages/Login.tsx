import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../services/AppContext';
import { adaptText } from '../services/transliterate';
import { Eye, EyeOff, X } from 'lucide-react';
import Logo from '../components/Logo';
import PhoneInput from '../components/PhoneInput';
import { authAPI } from '../services/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, lang, t } = useApp();
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (phone.length !== 13) { setError(lang === 'kr' ? "Телефон рақамни тўлиқ киритинг" : "Telefon raqamni to'liq kiriting"); return; }
    setLoading(true);
    try {
      await login(phone, password);
      // redirect handled by router based on user role
      navigate('/topics');
    } catch (e: any) {
      setError(e.response?.data?.error || (lang === 'kr' ? "Хатолик" : "Xatolik"));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-sm bg-slate-800/60 backdrop-blur border border-slate-700 rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-center mb-5"><Logo size={80} /></div>
        <h1 className="text-2xl font-bold text-white text-center mb-6">{adaptText(t('login_title'), lang)}</h1>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">{adaptText(t('phone'), lang)}</label>
            <PhoneInput value={phone} onChange={setPhone} required />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">{adaptText(t('password'), lang)}</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={adaptText(t('password_placeholder'), lang)}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 outline-none pr-12"
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1">
                {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>

          {error && (
            <div className="px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm">{error}</div>
          )}

          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-lg">
            {loading ? '...' : adaptText(t('login_btn'), lang)}
          </button>

          <p className="text-center text-sm text-slate-400">
            {adaptText(t('no_account'), lang)}{' '}
            <Link to="/register" className="text-sky-400 hover:text-sky-300 font-semibold">{adaptText(t('register_link'), lang)}</Link>
          </p>

          <button type="button" onClick={() => setShowForgot(true)} className="w-full text-center text-sm text-sky-400 hover:text-sky-300 font-semibold">
            {adaptText(t('forgot_password'), lang)}
          </button>
        </form>
      </div>

      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
    </div>
  );
};

const ForgotPasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lang } = useApp();
  const [phone, setPhone] = useState('+998');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    if (phone.length !== 13) { setError(lang === 'kr' ? "Телефон тўлиқ эмас" : "Telefon to'liq emas"); return; }
    if (newPassword.length < 4) { setError(lang === 'kr' ? "Парол кам 4 белги" : "Parol kamida 4 belgi"); return; }
    setLoading(true);
    try {
      await authAPI.resetPassword(phone, newPassword);
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (e: any) {
      setError(e.response?.data?.error || "Xato");
    }
    setLoading(false);
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div onClick={e => e.stopPropagation()} className="bg-slate-800 rounded-2xl p-5 w-full max-w-sm border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-lg">{lang === 'kr' ? 'Паролни тиклаш' : "Parolni tiklash"}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
        </div>

        {success ? (
          <div className="text-center py-4">
            <p className="text-emerald-400 font-bold mb-2">✓ {lang === 'kr' ? 'Парол ўзгартирилди!' : "Parol o'zgartirildi!"}</p>
            <p className="text-sm text-slate-300">{lang === 'kr' ? 'Энди янги парол билан киринг' : "Endi yangi parol bilan kiring"}</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-300 mb-4">
              {lang === 'kr' ? "Телефон рақамни ва янги паролни киритинг" : "Telefon raqamingizni va yangi parolni kiriting"}
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{lang === 'kr' ? 'Телефон рақам' : "Telefon raqam"}</label>
                <PhoneInput value={phone} onChange={setPhone} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">{lang === 'kr' ? 'Янги парол' : "Yangi parol"}</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder={lang === 'kr' ? "Янги парол" : "Yangi parol"}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-sky-500 outline-none"
                />
              </div>
              {error && <div className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold">
                {lang === 'kr' ? 'Бекор' : 'Bekor'}
              </button>
              <button onClick={submit} disabled={loading} className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white rounded-xl font-semibold">
                {loading ? '...' : (lang === 'kr' ? 'Сақлаш' : 'Saqlash')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
