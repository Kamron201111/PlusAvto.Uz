import React from 'react';

interface Props {
  user: { name?: string; avatar?: string } | null;
  size?: number;
  className?: string;
}

const Avatar: React.FC<Props> = ({ user, size = 40, className = "" }) => {
  if (user?.avatar) {
    return (
      <div
        className={`rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }
  const initial = (user?.name || '?')[0].toUpperCase();
  return (
    <div
      className={`rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      {initial}
    </div>
  );
};

export default Avatar;
