import React, { useEffect, useState } from 'react';
import { notificationsAPI } from '../../services/api';
import { Plus, Trash2, X, Send, Bell, Loader2 } from 'lucide-react';

const AdminNotifications: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const load = () => notificationsAPI.list().then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) { alert('Sarlavha va matn'); return; }
    await notificationsAPI.create(title, message);
    setTitle(''); setMessage(''); setShowCreate(false);
    alert('Xabar yuborildi');
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirish?")) return;
    await notificationsAPI.delete(id); load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32}/></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Bell className="text-amber-500"/> Habarlar</h1>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold flex items-center gap-2">
          <Plus size={18}/> Yuborish
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-slate-500"><Bell className="mx-auto text-slate-300 mb-3" size={48}/><p>Habarlar yo'q</p></div>
      ) : (
        <div className="space-y-2">
          {items.map(n => (
            <div key={n.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-start gap-3">
              <div className="w-9 h-9 bg-amber-100 dark:bg-amber-500/20 text-amber-500 rounded-lg flex items-center justify-center flex-shrink-0"><Bell size={18}/></div>
              <div className="flex-1 min-w-0">
                <p className="font-bold mb-1">{n.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap line-clamp-2">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => handleDelete(n.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg text-red-500"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div onClick={() => setShowCreate(false)} className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Hammaga xabar yuborish</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-red-100 rounded-lg text-red-500"><X size={20}/></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Sarlavha</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Sarlavha"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"/>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Matn</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="Habar matni..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none resize-none"/>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 rounded-xl font-semibold">Bekor</button>
                <button onClick={handleSend} className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"><Send size={16}/> Yuborish</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
