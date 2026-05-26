import React, { useEffect, useState } from 'react';
import { settingsAPI } from '../../services/api';
import { Save, Settings, Loader2 } from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    settingsAPI.get().then(s => { setSettings(s); setLoading(false); });
  }, []);

  const handleSave = async () => {
    await settingsAPI.update({
      app_name: settings.app_name,
      qa_group_link: settings.qa_group_link,
      admin_telegram: settings.admin_telegram,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32}/></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-5 flex items-center gap-2"><Settings className="text-slate-500"/> Sozlamalar</h1>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <Field label="Sayt nomi" value={settings.app_name || ''} onChange={v => setSettings({...settings, app_name: v})} help="Sidebar va bosh sahifada"/>
        <Field label="Savol-javob guruhi (Telegram)" value={settings.qa_group_link || ''} onChange={v => setSettings({...settings, qa_group_link: v})} help="Yuqori barda tugma"/>
        <Field label="Admin Telegram" value={settings.admin_telegram || ''} onChange={v => setSettings({...settings, admin_telegram: v})} help="Bog'lanish uchun"/>
      </div>

      <button onClick={handleSave} className="mt-4 w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
        <Save size={18}/> {saved ? '✓ Saqlandi' : 'Saqlash'}
      </button>
    </div>
  );
};

const Field: React.FC<any> = ({label, value, onChange, help}) => (
  <div>
    <label className="block text-sm font-semibold mb-1">{label}</label>
    <input value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-sky-500"/>
    {help && <p className="text-xs text-slate-500 mt-1">{help}</p>}
  </div>
);

export default AdminSettings;
