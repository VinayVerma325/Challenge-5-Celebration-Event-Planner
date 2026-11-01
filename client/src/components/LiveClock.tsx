import React, { useState, useEffect, memo } from 'react';

/**
 * Isolated LiveClock Component
 * Manages its own 1-second interval to prevent re-rendering the parent dashboard.
 */
export const LiveClock: React.FC = memo(() => {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = (hours % 12 || 12).toString().padStart(2, '0');
  const dateFormatted = now.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="flex items-baseline gap-1.5">
        <span className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight font-mono select-none drop-shadow-xs">
          {displayHours}:{minutes}
        </span>
        <span className="text-xs sm:text-sm font-bold text-slate-400 select-none">
          {ampm}
        </span>
      </div>
      <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 select-none">
        {dateFormatted}
      </p>
    </div>
  );
});

LiveClock.displayName = 'LiveClock';
