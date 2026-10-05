import React from 'react';
import { GraduationCap, Info, ChevronDown } from 'lucide-react';
import { PROGRAM_OPTIONS } from './ProgramSelector.jsx';

export default function Header({ selectedProgram, onOpenProgramSelector, onOpenReport, totalCourses }) {
  const currentProg = PROGRAM_OPTIONS.find((p) => p.id === selectedProgram) || PROGRAM_OPTIONS[0];

  return (
    <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md sticky top-0 z-30 dir-rtl">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        {/* App Title */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-inner shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-sm sm:text-lg tracking-tight text-white leading-tight truncate">
              مساعد مقررات الحاسبات
            </h1>
            <p className="hidden sm:block text-xs text-slate-300 font-medium truncate">
              FCI Zagazig Course Assistant
            </p>
          </div>
        </div>

        {/* Right Side: Program Selector Button & Info Report */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Program Switcher Button (Short Code Only) */}
          <button
            onClick={onOpenProgramSelector}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 border border-blue-400/40 text-[11px] sm:text-sm font-bold text-blue-100 hover:text-white transition shadow-xs min-h-[44px]"
            title="تغيير التخصص الدراسي"
          >
            <span className="font-mono tracking-wide dir-ltr">
              {currentProg.id === 'GENERAL' ? 'General' : currentProg.id}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-blue-300 shrink-0" />
          </button>

          {/* Audit Report Button */}
          <button
            onClick={onOpenReport}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition border border-white/10"
            title="تقرير توثيق اللائحة"
          >
            <Info className="w-4 h-4 text-blue-300" />
          </button>
        </div>
      </div>
    </header>
  );
}
