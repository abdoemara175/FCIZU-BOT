import React from 'react';
import { Check } from 'lucide-react';

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-bounce border border-slate-700 dir-rtl">
      <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
        <Check className="w-3 h-3" />
      </div>
      <span>{message}</span>
    </div>
  );
}
