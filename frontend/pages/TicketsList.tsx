import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsAPI } from '../services/api';
import { useApp } from '../services/AppContext';
import { adaptText } from '../services/transliterate';
import { ArrowLeft, Loader2 } from 'lucide-react';

const TicketsList: React.FC = () => {
  const navigate = useNavigate();
  const { lang, t } = useApp();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketsAPI.list().then(setTickets).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-sky-500" size={32}/></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl">
          <ArrowLeft size={16}/> {adaptText(t('back'), lang)}
        </button>
        <h1 className="text-base sm:text-xl font-bold text-center flex-1 px-2">{adaptText(t('ticket_training'), lang)}</h1>
        <div className="w-20 hidden sm:block"/>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-20 text-slate-500"><p>{adaptText(t('no_data'), lang)}</p></div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2.5 sm:gap-3">
          {tickets.map(ticket => (
            <button
              key={ticket.id}
              onClick={() => navigate(`/quiz?mode=ticket&ticketId=${ticket.id}`)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 hover:border-sky-400 hover:shadow-lg transition flex flex-col items-center justify-center gap-2 aspect-square active:scale-[0.97]"
            >
              <div className="text-2xl font-bold text-sky-500">{ticket.number}</div>
              <div className="text-xs text-slate-500 font-semibold">{adaptText(ticket.name, lang)}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketsList;
