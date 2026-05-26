import React, { useEffect, useState } from 'react';
import { coursesAPI } from '../../services/api';
import { Plus, Edit2, Trash2, X, Save, Video, Loader2 } from 'lucide-react';

const AdminCourses: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);

  const load = () => coursesAPI.list().then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const blank = () => ({ title: '', description: '', video_url: '' });

  const handleSave = async () => {
    if (!editing.title?.trim() || !editing.video_url?.trim()) { alert('Sarlavha va URL kerak'); return; }
    try {
      if (editing.id) await coursesAPI.update(editing.id, editing);
      else await coursesAPI.create(editing);
      setEditing(null); load();
    } catch (e: any) { alert(e.response?.data?.error || "Xato"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("O'chirish?")) return;
    await coursesAPI.delete(id); load();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32}/></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Video className="text-red-500"/> Video kurslar</h1>
        <button onClick={() => setEditing(blank())} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold flex items-center gap-2"><Plus size={18}/> Qo'shish</button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-slate-500"><Video className="mx-auto text-slate-300 mb-3" size={48}/><p>Video kurslar yo'q</p></div>
      ) : (
        <div className="space-y-2">
          {items.map(c => (
            <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">{c.number}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-base">{c.title}</p>
                <p className="text-xs text-slate-500 truncate">{c.video_url}</p>
              </div>
              <button onClick={() => setEditing(c)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sky-500"><Edit2 size={16}/></button>
              <button onClick={() => handleDelete(c.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg text-red-500"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div onClick={() => setEditing(null)} className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{editing.id ? 'Tahrirlash' : 'Yangi video'}</h3>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-red-100 rounded-lg text-red-500"><X size={20}/></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-1">Sarlavha *</label>
                <input value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"/>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Tavsif</label>
                <textarea value={editing.description || ''} onChange={e => setEditing({...editing, description: e.target.value})} rows={2}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none resize-none"/>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">YouTube URL *</label>
                <input value={editing.video_url} onChange={e => setEditing({...editing, video_url: e.target.value})}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"/>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditing(null)} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 rounded-xl font-semibold">Bekor</button>
                <button onClick={handleSave} className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"><Save size={16}/> Saqlash</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
