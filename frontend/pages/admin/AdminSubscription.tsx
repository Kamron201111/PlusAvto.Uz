import React, { useEffect, useState } from 'react';
import { settingsAPI, premiumAPI } from '../../services/api';
import { Save, CreditCard, Check, X, Clock, Eye, Trash2, ShoppingBag, Loader2 } from 'lucide-react';

const AdminSubscription: React.FC = () => {
  const [settings, setSettings] = useState<any>({});
  const [saved, setSaved] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewReceipt, setViewReceipt] = useState<string | null>(null);
  const [tab, setTab] = useState<'requests' | 'settings'>('requests');

  const load = async () => {
    const [s, r] = await Promise.all([settingsAPI.get(), premiumAPI.requests()]);
    setSettings(s); setRequests(r); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleSaveSettings = async () => {
    await settingsAPI.update({
      card_number: settings.card_number,
      card_owner: settings.card_owner,
      price_week: settings.price_week,
      price_month: settings.price_month,
      price_year: settings.price_year,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const approve = async (r: any) => {
    if (!confirm("Tasdiqlash?")) return;
    await premiumAPI.approve(r.id); load();
  };
  const reject = async (r: any) => {
    if (!confirm("Rad etish?")) return;
    await premiumAPI.reject(r.id); load();
  };
  const remove = async (id: number) => {
    if (!confirm("O'chirish?")) return;
    await premiumAPI.deleteRequest(id); load();
  };

  const pending = requests.filter(r => r.status === 'pending');

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32}/></div>;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2"><ShoppingBag className="text-purple-500"/> Obuna</h1>

      <div className="flex gap-2 mb-4 border-b border-slate-200 dark:border-slate-800">
        <button onClick={() => setTab('requests')} className={`px-4 py-2 font-semibold ${tab === 'requests' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-slate-500'}`}>
          So'rovlar {pending.length > 0 && <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{pending.length}</span>}
        </button>
        <button onClick={() => setTab('settings')} className={`px-4 py-2 font-semibold ${tab === 'settings' ? 'text-sky-500 border-b-2 border-sky-500' : 'text-slate-500'}`}>Sozlamalar</button>
      </div>

      {tab === 'settings' ? (
        <div className="space-y-3">
          <h2 className="font-bold text-lg flex items-center gap-2"><CreditCard className="text-sky-500" size={20}/> Karta va narxlar</h2>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <Field label="Karta raqami" value={settings.card_number || ''} onChange={v => setSettings({...settings, card_number: v})}/>
            <Field label="Karta egasi" value={settings.card_owner || ''} onChange={v => setSettings({...settings, card_owner: v})}/>
            <Field label="1 hafta (so'm)" value={settings.price_week || ''} onChange={v => setSettings({...settings, price_week: v})}/>
            <Field label="1 oy (so'm)" value={settings.price_month || ''} onChange={v => setSettings({...settings, price_month: v})}/>
            <Field label="1 yil (so'm)" value={settings.price_year || ''} onChange={v => setSettings({...settings, price_year: v})}/>
          </div>
          <button onClick={handleSaveSettings} className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
            <Save size={18}/> {saved ? '✓ Saqlandi' : 'Saqlash'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="text-center py-12 text-slate-500">So'rovlar yo'q</div>
          ) : requests.map(r => (
            <div key={r.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base truncate">{r.user_name}</p>
                  <p className="text-sm text-slate-500">{r.user_phone}</p>
                </div>
                <StatusBadge status={r.status}/>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                  <p className="text-xs text-slate-500">Tarif</p>
                  <p className="font-bold">{r.plan_label}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg">
                  <p className="text-xs text-slate-500">Miqdor</p>
                  <p className="font-bold">{parseInt(r.amount || '0').toLocaleString()} so'm</p>
                </div>
              </div>
              {r.comment && (
                <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg mb-3 text-sm">
                  <p className="text-xs text-slate-500 mb-0.5">Izoh</p>
                  <p>{r.comment}</p>
                </div>
              )}
              <p className="text-xs text-slate-400 mb-3">{new Date(r.created_at).toLocaleString()}</p>

              <div className="flex flex-wrap gap-2">
                {r.receipt && (
                  <button onClick={() => setViewReceipt(r.receipt)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-semibold flex items-center gap-1">
                    <Eye size={14}/> Chek
                  </button>
                )}
                {r.status === 'pending' && (
                  <>
                    <button onClick={() => approve(r)} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1"><Check size={14}/> Tasdiqlash</button>
                    <button onClick={() => reject(r)} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1"><X size={14}/> Rad</button>
                  </>
                )}
                <button onClick={() => remove(r.id)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-lg text-sm font-semibold flex items-center gap-1 ml-auto"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewReceipt && (
        <div onClick={() => setViewReceipt(null)} className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <img src={viewReceipt} alt="" className="max-h-[95vh] max-w-[95vw] object-contain"/>
          <button onClick={() => setViewReceipt(null)} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white"><X size={22}/></button>
        </div>
      )}
    </div>
  );
};

const Field: React.FC<any> = ({label, value, onChange}) => (
  <div>
    <label className="block text-sm font-semibold mb-1">{label}</label>
    <input value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-sky-500"/>
  </div>
);

const StatusBadge: React.FC<{status: string}> = ({status}) => {
  const map: any = {
    pending:  { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', icon: Clock,  text: 'Kutilmoqda' },
    approved: { bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400', icon: Check, text: 'Tasdiqlangan' },
    rejected: { bg: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400', icon: X, text: 'Rad etilgan' },
  };
  const s = map[status] || map.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${s.bg}`}>
      <Icon size={12}/> {s.text}
    </span>
  );
};

export default AdminSubscription;
