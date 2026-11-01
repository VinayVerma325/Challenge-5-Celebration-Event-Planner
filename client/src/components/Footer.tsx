import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" aria-hidden="true" />
            <span className="font-semibold text-slate-800">Celebration & Event Planner</span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">Intelligent Celebration Architecture</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Powered by Google Gemini GenAI</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" aria-hidden="true" />
            <span>for unforgettable moments</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
