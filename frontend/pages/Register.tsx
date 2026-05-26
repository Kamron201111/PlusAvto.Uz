import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../services/AppContext';
import { adaptText } from '../services/transliterate';
import Logo from '../components/Logo';
import PhoneInput from '../components/PhoneInput';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, lang, t } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError(lang === 'kr' ? "Исмингизни киритинг" : "Ismingizni kiriting"); return; }
    if (phone.length !== 13) { setError(lang === 'kr' ? "Телефон тўлиқ эмас" : "Telefon to'liq emas"); return; }
    if (password.length < 4) { setError(lang === 'kr' ? "Парол кам 4 белги" : "Parol kamida 4 belgi"); return; }
    setLoading(true);
    try {
      await register(phone, password, name);
      navigate('/topics');
    } catch (e: any) {
      setError(e.response?.data?.error || "Xato");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-sm bg-slate-800/60 backdrop-blur border border-slate-700 rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-center mb-5"><Logo size={80} /></div>
        <h1 className="text-2xl font-bold text-white text-center mb-6">{adaptText(t('register_title'), lang)}</h1>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">{adaptText(t('your_name'), lang)}</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder={adaptText(t('name_placeholder'), lang)} required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-sky-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">{adaptText(t('phone'), lang)}</label>
            <PhoneInput value={phone} onChange={setPhone} required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">{adaptText(t('password'), lang)}</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder={adaptText(t('new_password_placeholder'), lang)} required
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-sky-500 outline-none"
            />
          </div>

          {error && <div className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}

          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg">
            {loading ? '...' : adaptText(t('register_btn'), lang)}
          </button>

          <p className="text-center text-sm text-slate-400">
            {adaptText(t('already_have'), lang)}{' '}
            <Link to="/login" className="text-sky-400 hover:text-sky-300 font-semibold">{adaptText(t('login_link'), lang)}</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
