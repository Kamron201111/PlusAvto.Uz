import React, { useEffect, useState } from 'react';
import { questionsAPI, topicsAPI, ticketsAPI } from '../../services/api';
import { Plus, Edit2, Trash2, X, Save, Upload, FileJson, Search, HelpCircle, Loader2, Ticket } from 'lucide-react';

const AdminQuestions: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [showJson, setShowJson] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState<string>('all');

  const load = async () => {
    const [q, t, tk] = await Promise.all([questionsAPI.list(), topicsAPI.list(), ticketsAPI.list()]);
    setItems(q); setTopics(t); setTickets(tk); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const blank = () => ({
    text: '', options: { f1: '', f2: '', f3: '', f4: '' },
    correct_answer: 'f1', explanation: '', topic_id: topics[0]?.id || null,
    image: null, ticket_id: null,
  });

  const handleSave = async () => {
    if (!editing.text?.trim()) { alert('Savol matni kerak'); return; }
    const ops = editing.options || {};
    if (!ops.f1?.trim() || !ops.f2?.trim()) { alert('Kamida 2 ta variant'); return; }
    try {
      const data: any = {
        text: editing.text,
        options: editing.options,
        correct_answer: editing.correct_answer,
        image: editing.image,
        explanation: editing.explanation,
        topic_id: editing.topic_id,
      };
      if (editing.id) {
        await questionsAPI.update(editing.id, data);
      } else {
        // Faqat yangi savol qo'shganda bilet'ga ham qo'shamiz
        data.ticket_id = editing.ticket_id || null;
        await questionsAPI.create(data);
      }
      setEditing(null); load();
    } catch (e: any) { alert(e.response?.data?.error || "Xato"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirish?")) return;
    await questionsAPI.delete(id); load();
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert('Rasm 3 MB dan katta'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setEditing({...editing, image: ev.target?.result});
    reader.readAsDataURL(file);
  };

  const handleJsonImport = async () => {
    try {
      const data = JSON.parse(jsonText);
      if (!Array.isArray(data)) { alert('JSON array bo\'lishi kerak'); return; }
      const r = await questionsAPI.bulk(data);
      alert(`${r.count} ta savol qo'shildi`);
      setShowJson(false); setJsonText(''); load();
    } catch (e: any) { alert('JSON noto\'g\'ri: ' + e.message); }
  };

  const filtered = items.filter(q => {
    if (search && !q.text.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterTopic !== 'all' && q.topic_id != filterTopic) return false;
    return true;
  });

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32}/></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 gap-2">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2"><HelpCircle className="text-emerald-500"/> Savollar ({items.length})</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowJson(true)} className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold flex items-center gap-1.5 text-sm">
            <FileJson size={16}/> <span className="hidden sm:inline">JSON</span>
          </button>
          <button onClick={() => setEditing(blank())} className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold flex items-center gap-1.5 text-sm">
            <Plus size={16}/> Qo'shish
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..."
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm"/>
        </div>
        <select value={filterTopic} onChange={e => setFilterTopic(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm">
          <option value="all">Barcha mavzular</option>
          {topics.map(t => <option key={t.id} value={t.id}>{t.number}. {t.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <HelpCircle className="mx-auto text-slate-300 mb-3" size={48}/>
          <p>{items.length === 0 ? "Savollar yo'q" : "Topilmadi"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.slice(0, 100).map((q, i) => {
            const topic = topics.find(t => t.id === q.topic_id);
            return (
              <div key={q.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-start gap-3">
                <span className="w-7 h-7 bg-sky-500/20 text-sky-500 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">{i+1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2">{q.text}</p>
                  <div className="flex flex-wrap gap-2 mt-1 text-xs">
                    {topic && <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 rounded">{topic.name}</span>}
                    {q.image && <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded">🖼</span>}
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded">{q.correct_answer?.toUpperCase()}</span>
                  </div>
                </div>
                <button onClick={() => setEditing({...q, options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options})}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sky-500"><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(q.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg text-red-500"><Trash2 size={16}/></button>
              </div>
            );
          })}
          {filtered.length > 100 && <p className="text-center text-sm text-slate-500 py-3">{filtered.length} dan dastlabki 100 ta</p>}
        </div>
      )}

      {editing && (
        <div onClick={() => setEditing(null)} className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center p-4 overflow-y-auto">
          <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-2xl my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{editing.id ? 'Tahrirlash' : 'Yangi savol'}</h3>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-red-100 rounded-lg text-red-500"><X size={20}/></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Mavzu *</label>
                <select value={editing.topic_id || ''} onChange={e => setEditing({...editing, topic_id: e.target.value ? parseInt(e.target.value) : null})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none">
                  <option value="">-- Mavzusiz --</option>
                  {topics.map(t => <option key={t.id} value={t.id}>{t.number}. {t.name}</option>)}
                </select>
              </div>

              {/* Bilet tanlash - faqat yangi savol qo'shganda (ixtiyoriy) */}
              {!editing.id && (
                <div>
                  <label className="block text-sm font-semibold mb-1 flex items-center gap-1">
                    <Ticket size={14} className="text-blue-500"/>
                    Bilet (ixtiyoriy)
                  </label>
                  <select value={editing.ticket_id || ''} onChange={e => setEditing({...editing, ticket_id: e.target.value ? parseInt(e.target.value) : null})}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none">
                    <option value="">-- Bilet tanlamasdan qo'shish --</option>
                    {tickets.map(tk => {
                      const count = tk.question_ids?.length || 0;
                      return (
                        <option key={tk.id} value={tk.id}>
                          {tk.number}. {tk.name} ({count} ta savol)
                        </option>
                      );
                    })}
                  </select>
                  {editing.ticket_id && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      ℹ️ Savol shu biletga qo'shiladi
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-1">Savol matni *</label>
                <textarea value={editing.text} onChange={e => setEditing({...editing, text: e.target.value})} rows={3}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none resize-none"/>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Rasm (ixtiyoriy)</label>
                <div className="flex items-center gap-3">
                  {editing.image && (
                    <div className="relative">
                      <img src={editing.image} alt="" className="w-20 h-20 object-cover rounded-lg"/>
                      <button onClick={() => setEditing({...editing, image: null})}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><X size={10}/></button>
                    </div>
                  )}
                  <label className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl cursor-pointer text-sm font-semibold flex items-center gap-1">
                    <Upload size={14}/> Yuklash
                    <input type="file" accept="image/*" onChange={handleImage} className="hidden"/>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Variantlar (to'g'risini tanlang)</label>
                <div className="space-y-2">
                  {['f1','f2','f3','f4','f5','f6'].map((k, i) => {
                    const isCorrect = editing.correct_answer === k;
                    return (
                      <div key={k} className="flex items-center gap-2">
                        <button onClick={() => setEditing({...editing, correct_answer: k})}
                          className={`w-12 py-2 rounded-lg font-bold text-sm ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>F{i+1}</button>
                        <input value={editing.options?.[k] || ''}
                          onChange={e => setEditing({...editing, options: {...editing.options, [k]: e.target.value}})}
                          placeholder={`Variant F${i+1}`}
                          className={`flex-1 px-3 py-2 border rounded-xl outline-none ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}/>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Izoh (ixtiyoriy)</label>
                <textarea value={editing.explanation || ''} onChange={e => setEditing({...editing, explanation: e.target.value})} rows={2}
                  placeholder="Bu savolga izoh..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none resize-none"/>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditing(null)} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 rounded-xl font-semibold flex items-center justify-center gap-2"><X size={16}/> Bekor</button>
                <button onClick={handleSave} className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"><Save size={16}/> Saqlash</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showJson && (
        <div onClick={() => setShowJson(false)} className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2"><FileJson className="text-purple-500"/> JSON orqali qo'shish</h3>
              <button onClick={() => setShowJson(false)} className="p-2 hover:bg-red-100 rounded-lg text-red-500"><X size={20}/></button>
            </div>
            <p className="text-sm text-slate-500 mb-2">Format:</p>
            <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded-xl mb-3 overflow-x-auto">{`[
  {
    "text": "Savol?",
    "options": {"f1": "A", "f2": "B", "f3": "C", "f4": "D"},
    "correct_answer": "f1",
    "explanation": "Izoh",
    "topic_id": 1
  }
]`}</pre>
            <textarea value={jsonText} onChange={e => setJsonText(e.target.value)} rows={10}
              placeholder='[...]'
              className="flex-1 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-mono text-xs"/>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setShowJson(false)} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 rounded-xl font-semibold">Bekor</button>
              <button onClick={handleJsonImport} className="flex-1 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold">Import</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuestions;
