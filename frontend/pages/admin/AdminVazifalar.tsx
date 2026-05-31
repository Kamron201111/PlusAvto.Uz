import React, { useEffect, useState } from 'react';
import { vazifalarAPI, topicsAPI, questionsAPI, ticketsAPI } from '../../services/api';
import { Plus, Edit2, Trash2, X, Save, ListTodo, Search, Loader2, BookOpen, Ticket } from 'lucide-react';

const AdminVazifalar: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [allTopics, setAllTopics] = useState<any[]>([]);
  const [allTickets, setAllTickets] = useState<any[]>([]);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    const [v, t, tk, q] = await Promise.all([
      vazifalarAPI.list(), topicsAPI.list(), ticketsAPI.list(), questionsAPI.list()
    ]);
    setItems(v); setAllTopics(t); setAllTickets(tk); setAllQuestions(q); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    const v = await vazifalarAPI.create({ mode: 'topics', topic_ids: [], question_ids: [], ticket_ids: [] });
    load();
    setEditing({...v, topic_ids: [], question_ids: [], ticket_ids: []});
  };

  const handleSave = async () => {
    if (!editing.name?.trim()) { alert('Nom kerak'); return; }
    await vazifalarAPI.update(editing.id, {
      name: editing.name,
      number: editing.number,
      mode: editing.mode,
      topic_ids: editing.topic_ids || [],
      question_ids: editing.question_ids || [],
      ticket_ids: editing.ticket_ids || [],
    });
    setEditing(null); load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirishni tasdiqlaysizmi?")) return;
    await vazifalarAPI.delete(id); load();
  };

  const toggleTopic = (id: number) => {
    if (!editing) return;
    const ids = editing.topic_ids || [];
    setEditing({...editing, topic_ids: ids.includes(id) ? ids.filter((x: number) => x !== id) : [...ids, id]});
  };

  const toggleTicket = (id: number) => {
    if (!editing) return;
    const ids = editing.ticket_ids || [];
    setEditing({...editing, ticket_ids: ids.includes(id) ? ids.filter((x: number) => x !== id) : [...ids, id]});
  };

  const toggleQ = (qId: number) => {
    if (!editing) return;
    const ids = editing.question_ids || [];
    setEditing({...editing, question_ids: ids.includes(qId) ? ids.filter((x: number) => x !== qId) : [...ids, qId]});
  };

  const filteredQs = allQuestions.filter(q => q.text.toLowerCase().includes(search.toLowerCase()));

  // Hisoblash - tanlangan mavzulardagi jami savollar
  const calcTotalFromTopics = (topicIds: number[]) => {
    return allQuestions.filter(q => topicIds.includes(q.topic_id)).length;
  };

  // Hisoblash - tanlangan biletlardagi jami savollar
  const calcTotalFromTickets = (ticketIds: number[]) => {
    let total = 0;
    let hasAuto = false;
    ticketIds.forEach(id => {
      const t = allTickets.find(x => x.id === id);
      if (!t) return;
      if (t.mode === 'auto') hasAuto = true;
      else if (t.question_ids) total += t.question_ids.length;
    });
    if (hasAuto) return allQuestions.length; // auto biletlar = hamma savol
    return total;
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32}/></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold flex items-center gap-2"><ListTodo className="text-orange-500"/> Vazifalar</h1>
        <button onClick={handleCreate} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold flex items-center gap-2">
          <Plus size={18}/> Yangi vazifa
        </button>
      </div>

      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl">
        <p className="text-xs text-blue-700 dark:text-blue-400">
          💡 <strong>Vazifa yaratishning 3 usuli:</strong> 1) <strong>Mavzulardan</strong> — bir nechta mavzu tanlanadi, ulardagi BARCHA savollar avtomatik aralashtirilib beriladi.
          2) <strong>Biletlardan</strong> — bir nechta bilet tanlanadi, ulardagi savollar yig'iladi va aralashtirilib beriladi.
          3) <strong>Qo'lda</strong> — savollarni bittadan tanlaysiz.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <ListTodo className="mx-auto text-slate-300 mb-3" size={48}/>
          <p>Vazifalar yo'q</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(v => (
            <div key={v.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">{v.number}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-base">{v.name}</p>
                <p className="text-xs text-slate-500">
                  {v.mode === 'topics' && `${(v.topic_ids || []).length} ta mavzu, ${calcTotalFromTopics(v.topic_ids || [])} ta savol`}
                  {v.mode === 'tickets' && `${(v.ticket_ids || []).length} ta bilet, ${calcTotalFromTickets(v.ticket_ids || [])} ta savol`}
                  {v.mode === 'manual' && `${(v.question_ids || []).length} ta qo'lda tanlangan`}
                </p>
              </div>
              <button onClick={() => setEditing({
                ...v,
                topic_ids: v.topic_ids || [],
                question_ids: v.question_ids || [],
                ticket_ids: v.ticket_ids || [],
              })} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sky-500"><Edit2 size={16}/></button>
              <button onClick={() => handleDelete(v.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg text-red-500"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div onClick={() => setEditing(null)} className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Vazifa tahrirlash</h3>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-red-100 rounded-lg text-red-500"><X size={20}/></button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">Vazifa raqami</label>
                  <input type="number" value={editing.number} onChange={e => setEditing({...editing, number: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"/>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Vazifa nomi</label>
                  <input value={editing.name || ''} onChange={e => setEditing({...editing, name: e.target.value})}
                    placeholder="Vazifa nomi"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"/>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Savollar manbasi</label>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setEditing({...editing, mode: 'topics'})}
                    className={`py-3 rounded-xl font-semibold text-sm ${editing.mode === 'topics' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    Mavzulardan
                  </button>
                  <button onClick={() => setEditing({...editing, mode: 'tickets'})}
                    className={`py-3 rounded-xl font-semibold text-sm ${editing.mode === 'tickets' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    Biletlardan
                  </button>
                  <button onClick={() => setEditing({...editing, mode: 'manual'})}
                    className={`py-3 rounded-xl font-semibold text-sm ${editing.mode === 'manual' ? 'bg-sky-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    Qo'lda
                  </button>
                </div>
              </div>

              {editing.mode === 'topics' && (
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Mavzular ({(editing.topic_ids || []).length} ta tanlangan, jami: <span className="text-sky-500 font-bold">{calcTotalFromTopics(editing.topic_ids || [])} ta savol</span>)
                  </label>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl max-h-60 overflow-y-auto">
                    {allTopics.length === 0 ? <p className="p-4 text-center text-sm text-slate-500">Mavzular yo'q</p> :
                      allTopics.map(topic => {
                        const selected = (editing.topic_ids || []).includes(topic.id);
                        const count = allQuestions.filter(q => q.topic_id === topic.id).length;
                        return (
                          <button key={topic.id} onClick={() => toggleTopic(topic.id)}
                            className={`w-full text-left p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-center gap-2 ${selected ? 'bg-sky-50 dark:bg-sky-500/10' : ''}`}>
                            <input type="checkbox" checked={selected} readOnly/>
                            <BookOpen size={14} className="text-sky-500"/>
                            <span className="text-sm flex-1"><strong>{topic.number}.</strong> {topic.name}</span>
                            <span className="text-xs text-slate-500">{count} savol</span>
                          </button>
                        );
                      })
                    }
                  </div>
                </div>
              )}

              {editing.mode === 'tickets' && (
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Biletlar ({(editing.ticket_ids || []).length} ta tanlangan, jami: <span className="text-sky-500 font-bold">{calcTotalFromTickets(editing.ticket_ids || [])} ta savol</span>)
                  </label>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl max-h-60 overflow-y-auto">
                    {allTickets.length === 0 ? <p className="p-4 text-center text-sm text-slate-500">Biletlar yo'q</p> :
                      allTickets.map(ticket => {
                        const selected = (editing.ticket_ids || []).includes(ticket.id);
                        const count = ticket.mode === 'auto' ? allQuestions.length : (ticket.question_ids?.length || 0);
                        return (
                          <button key={ticket.id} onClick={() => toggleTicket(ticket.id)}
                            className={`w-full text-left p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-center gap-2 ${selected ? 'bg-sky-50 dark:bg-sky-500/10' : ''}`}>
                            <input type="checkbox" checked={selected} readOnly/>
                            <Ticket size={14} className="text-blue-500"/>
                            <span className="text-sm flex-1"><strong>{ticket.number}.</strong> {ticket.name}</span>
                            <span className="text-xs text-slate-500">{count} savol</span>
                          </button>
                        );
                      })
                    }
                  </div>
                </div>
              )}

              {editing.mode === 'manual' && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Savollar ({(editing.question_ids || []).length} ta tanlangan)</label>
                  <div className="relative mb-2">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm"/>
                  </div>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl max-h-60 overflow-y-auto">
                    {filteredQs.map(q => {
                      const selected = (editing.question_ids || []).includes(q.id);
                      return (
                        <button key={q.id} onClick={() => toggleQ(q.id)}
                          className={`w-full text-left p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 flex items-start gap-2 ${selected ? 'bg-sky-50 dark:bg-sky-500/10' : ''}`}>
                          <input type="checkbox" checked={selected} readOnly className="mt-1"/>
                          <p className="text-sm flex-1">{q.text}</p>
                        </button>
                      );
                    })}
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

export default AdminVazifalar;
