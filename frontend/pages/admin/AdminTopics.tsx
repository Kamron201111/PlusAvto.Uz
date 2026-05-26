import React, { useEffect, useState } from 'react';
import { topicsAPI } from '../../services/api';
import { Plus, Edit2, Trash2, X, Save, BookOpen, Loader2 } from 'lucide-react';

const AdminTopics: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  const load = () => topicsAPI.list().then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) { alert('Nom kerak'); return; }
    try { await topicsAPI.create(name); setName(''); setCreating(false); load(); }
    catch (e: any) { alert(e.response?.data?.error || "Xato"); }
  };

  const handleUpdate = async () => {
    if (!editing.name.trim()) { alert('Nom kerak'); return; }
    try { await topicsAPI.update(editing.id, { name: editing.name, number: editing.number }); setEditing(null); load(); }
    catch (e: any) { alert(e.response?.data?.error || "Xato"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await topicsAPI.delete(id); load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32}/></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="text-sky-500"/> Mavzular</h1>
        <button onClick={() => setCreating(true)} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold flex items-center gap-2">
          <Plus size={18}/> Qo'shish
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <BookOpen className="mx-auto text-slate-300 dark:text-slate-700 mb-3" size={48}/>
          <p>Mavzular yo'q</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(topic => (
            <div key={topic.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-500 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">{topic.number}</div>
              <p className="flex-1 font-semibold text-sm sm:text-base">{topic.name}</p>
              <button onClick={() => setEditing({...topic})} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sky-500"><Edit2 size={16}/></button>
              <button onClick={() => handleDelete(topic.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg text-red-500"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <div onClick={() => { setCreating(false); setEditing(null); }} className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{editing ? 'Tahrirlash' : 'Yangi mavzu'}</h3>
              <button onClick={() => { setCreating(false); setEditing(null); }} className="p-2 hover:bg-red-100 rounded-lg text-red-500"><X size={20}/></button>
            </div>
            <div className="space-y-3">
              {editing && (
                <div>
                  <label className="block text-sm font-semibold mb-1">Mavzu raqami</label>
                  <input type="number" value={editing.number} onChange={e => setEditing({...editing, number: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"/>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold mb-1">Mavzu nomi</label>
                <input type="text" value={editing ? editing.name : name} onChange={e => editing ? setEditing({...editing, name: e.target.value}) : setName(e.target.value)}
                  placeholder="Mavzu nomi"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"/>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setCreating(false); setEditing(null); }} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 rounded-xl font-semibold">Bekor</button>
                <button onClick={editing ? handleUpdate : handleCreate} className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                  <Save size={16}/> Saqlash
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTopics;
