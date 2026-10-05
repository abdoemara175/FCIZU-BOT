import React from 'react';
import { GraduationCap, Info, ChevronDown } from 'lucide-react';
import { PROGRAM_OPTIONS } from './ProgramSelector.jsx';

export default function Header({ selectedProgram, onOpenProgramSelector, onOpenReport, totalCourses }) {
  const currentProg = PROGRAM_OPTIONS.find((p) => p.id === selectedProgram) || PROGRAM_OPTIONS[0];

  return (
    <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md sticky top-0 z-30 dir-rtl">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* App Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-inner shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg tracking-tight text-white leading-tight">
              مساعد مقررات الحاسبات
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-300 font-medium">
              FCI Zagazig Course Assistant
            </p>
          </div>
        </div>

        {/* Right Side: Program Selector Button & Info Report */}
        <div className="flex items-center gap-2">
          {/* Program Switcher Button (Short Code Only) */}
          <button
            onClick={onOpenProgramSelector}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 border border-blue-400/40 text-xs sm:text-sm font-bold text-blue-100 hover:text-white transition shadow-xs min-h-[44px]"
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
