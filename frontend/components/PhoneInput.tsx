import React from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

const PhoneInput: React.FC<Props> = ({ value, onChange, className = "", placeholder, required }) => {
  // Foydalanuvchi koradigan qism — +998 dan keyingi qismi
  const digitsAfter = value.startsWith('+998') ? value.slice(4) : value.replace(/\D/g, '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    // Faqat raqamlarni qoldirish
    input = input.replace(/\D/g, '');
    // Max 9 raqam (telefon raqami 9 ta)
    if (input.length > 9) input = input.slice(0, 9);
    onChange('+998' + input);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-0 top-0 bottom-0 px-3 flex items-center bg-slate-700/40 rounded-l-xl pointer-events-none select-none border-r border-slate-600">
        <span className="font-bold text-white">+998</span>
      </div>
      <input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        value={digitsAfter}
        onChange={handleChange}
        placeholder={placeholder || "901234567"}
        required={required}
        maxLength={9}
        className="w-full pl-20 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 outline-none"
      />
    </div>
  );
};

export default PhoneInput;
