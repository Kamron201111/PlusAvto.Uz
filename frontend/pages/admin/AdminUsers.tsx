import React, { useEffect, useState } from 'react';
import { usersAPI, premiumAPI } from '../../services/api';
import { Users, Trash2, Crown, X, Search, Loader2 } from 'lucide-react';

const AdminUsers: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => usersAPI.list().then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Foydalanuvchini o'chirish?")) return;
    await usersAPI.delete(id); load();
  };

  const handleGrant = async (id: number) => {
    const daysStr = prompt('Necha kunga premium? (7, 30, 90, 365)', '30');
    if (!daysStr) return;
    const days = parseInt(daysStr);
    if (isNaN(days) || days <= 0) return alert("Noto'g'ri raqam");
    await premiumAPI.grant(id, days);
    load();
    alert(`Premium ${days} kunga berildi`);
  };

  const handleRevoke = async (id: number) => {
    if (!confirm("Premium ni olib qo'yasizmi?")) return;
    await premiumAPI.revoke(id); load();
  };

  const isPremiumActive = (u: any) => u.premium_expires_at && new Date(u.premium_expires_at) > new Date();

  const filtered = items.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32}/></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="text-blue-500"/> Foydalanuvchilar ({items.length})</h1>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..."
          className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm"/>
      </div>

      <div className="space-y-2">
        {filtered.map(u => {
          const premium = isPremiumActive(u);
          const isAdmin = u.role === 'admin';
          return (
            <div key={u.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3 flex-wrap">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isAdmin ? 'bg-purple-500' : 'bg-gradient-to-br from-sky-400 to-blue-500'}`}>
                {u.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm sm:text-base flex items-center gap-2">
                  {u.name}
                  {isAdmin && <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded">Admin</span>}
                  {premium && <Crown size={14} className="text-amber-500"/>}
                </p>
                <p className="text-xs text-slate-500">{u.phone}</p>
                {premium && <p className="text-xs text-emerald-500">Premium: {new Date(u.premium_expires_at).toLocaleDateString()} gacha</p>}
              </div>
              {!isAdmin && (
                <>
                  {premium ? (
                    <button onClick={() => handleRevoke(u.id)} className="px-3 py-1.5 bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <X size={14}/> Olib qo'yish
                    </button>
                  ) : (
                    <button onClick={() => handleGrant(u.id)} className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <Crown size={14}/> Premium berish
                    </button>
                  )}
                  <button onClick={() => handleDelete(u.id)} className="p-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg text-red-500"><Trash2 size={16}/></button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminUsers;
