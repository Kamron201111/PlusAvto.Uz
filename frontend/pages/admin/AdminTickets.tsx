import React, { useEffect, useState } from 'react';
import { ticketsAPI, questionsAPI } from '../../services/api';
import { Plus, Edit2, Trash2, X, Save, Ticket as TicketIcon, Search, Loader2 } from 'lucide-react';

const AdminTickets: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    const [t, q] = await Promise.all([ticketsAPI.list(), questionsAPI.list()]);
    setItems(t); setAllQuestions(q);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try { const t = await ticketsAPI.create({ mode: 'auto', question_ids: [] }); setCreating(false); load(); setEditing({...t}); }
    catch (e: any) { alert(e.response?.data?.error || "Xato"); }
  };

  const handleSave = async () => {
    try {
      await ticketsAPI.update(editing.id, {
        name: editing.name, number: editing.number,
        mode: editing.mode, question_ids: editing.question_ids || [],
      });
      setEditing(null); load();
    } catch (e: any) { alert(e.response?.data?.error || "Xato"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await ticketsAPI.delete(id); load();
  };

  const toggleQ = (qId: number) => {
    if (!editing) return;
    const ids = editing.question_ids || [];
    setEditing({
      ...editing,
      question_ids: ids.includes(qId) ? ids.filter((x: number) => x !== qId) : [...ids, qId],
    });
  };

  const filtered = allQuestions.filter(q => q.text.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32}/></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold flex items-center gap-2"><TicketIcon className="text-blue-500"/> Biletlar</h1>
        <button onClick={handleCreate} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold flex items-center gap-2">
          <Plus size={18}/> Qo'shish
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-slate-500"><TicketIcon className="mx-auto text-slate-300 mb-3" size={48}/><p>Biletlar yo'q</p></div>
      ) : (
        <div className="space-y-2">
          {items.map(t => (
            <div key={t.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">{t.number}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-base">{t.name}</p>
                <p className="text-xs text-slate-500">{t.mode === 'auto' ? 'Auto (20 ta random)' : `${(t.question_ids || []).length} ta tanlangan`}</p>
              </div>
              <button onClick={() => setEditing({...t, question_ids: t.question_ids || []})} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sky-500"><Edit2 size={16}/></button>
              <button onClick={() => handleDelete(t.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg text-red-500"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div onClick={() => setEditing(null)} className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Bilet tahrirlash</h3>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-red-100 rounded-lg text-red-500"><X size={20}/></button>
            </div>
            <div className="overflow-y-auto flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Bilet raqami</label>
                  <input type="number" value={editing.number} onChange={e => setEditing({...editing, number: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Nomi</label>
                  <input value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"/>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Rejim</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setEditing({...editing, mode: 'auto'})}
                    className={`py-3 rounded-xl font-semibold ${editing.mode === 'auto' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    Auto (20 ta random)
                  </button>
                  <button onClick={() => setEditing({...editing, mode: 'manual'})}
                    className={`py-3 rounded-xl font-semibold ${editing.mode === 'manual' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    Qo'lda tanlash
                  </button>
                </div>
              </div>

              {editing.mode === 'manual' && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Savollar ({(editing.question_ids || []).length} ta tanlangan)</label>
                  <div className="relative mb-2">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm"/>
                  </div>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl max-h-60 overflow-y-auto">
                    {filtered.length === 0 ? <p className="p-4 text-center text-sm text-slate-500">Savollar yo'q</p> :
                      filtered.map(q => {
                        const selected = (editing.question_ids || []).includes(q.id);
                        return (
                          <button key={q.id} onClick={() => toggleQ(q.id)}
                            className={`w-full text-left p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-start gap-2 ${selected ? 'bg-sky-50 dark:bg-sky-500/10' : ''}`}>
                            <input type="checkbox" checked={selected} readOnly className="mt-1"/>
                            <p className="text-sm flex-1">{q.text}</p>
                          </button>
                        );
                      })
                    }
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditing(null)} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 rounded-xl font-semibold">Bekor</button>
                <button onClick={handleSave} className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
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

export default AdminTickets;
