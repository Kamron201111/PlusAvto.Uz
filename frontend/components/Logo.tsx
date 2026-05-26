import React from 'react';

interface Props { size?: number; className?: string; }

const Logo: React.FC<Props> = ({ size = 40, className = "" }) => {
  return (
    <div
      className={`rounded-full overflow-hidden bg-white shadow flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/logo.png"
        alt="PlusAvto"
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
          const parent = (e.target as HTMLImageElement).parentElement;
          if (parent) {
            parent.style.background = 'linear-gradient(135deg, #0ea5e9, #2563eb)';
            parent.innerHTML = '<span style="color:white;font-weight:900;font-size:' + (size * 0.45) + 'px;">P</span>';
          }
        }}
      />
    </div>
  );
};

export default Logo;
