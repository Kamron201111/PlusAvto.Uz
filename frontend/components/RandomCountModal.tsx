import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../services/AppContext';
import { adaptText } from '../services/transliterate';

interface Props {
  onClose: () => void;
  onSelect: (count: number) => void;
}

const RandomCountModal: React.FC<Props> = ({ onClose, onSelect }) => {
  const { lang, t } = useApp();
  const [selected, setSelected] = useState(20);

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 animate-fade-in">
      <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-2xl p-5 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{adaptText(t('choose'), lang)}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
            <X size={18}/>
          </button>
        </div>

        <select
          value={selected}
          onChange={e => setSelected(parseInt(e.target.value))}
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-sky-500 rounded-xl outline-none mb-4 font-semibold"
        >
          {[20, 30, 40, 50].map(n => (
            <option key={n} value={n}>{n} {lang === 'kr' ? 'та' : 'ta'}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 rounded-xl font-semibold">
            {adaptText(t('cancel'), lang)}
          </button>
          <button onClick={() => onSelect(selected)} className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-semibold">
            {adaptText(t('save'), lang)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RandomCountModal;
