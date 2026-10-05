import React from 'react';
import { ArrowLeft, GitCommit, Lock, Unlock } from 'lucide-react';
import { getCourseRequirementLabel } from './courseSearch.js';

export default function FlowVisualization({ currentCourse, courseMap, selectedProgram = 'GENERAL', onSelectCourse }) {
  if (!currentCourse) return null;

  const prereqs = (currentCourse.prerequisites || []).map((code) => courseMap[code]).filter(Boolean);
  const unlocks = (currentCourse.unlocks || []).map((code) => courseMap[code]).filter(Boolean);

  const displayCode = (currentCourse.codes_by_program && currentCourse.codes_by_program[selectedProgram]) || currentCourse.code;
  const currentReqInfo = (currentCourse.requirements_by_program && currentCourse.requirements_by_program[selectedProgram]) || {
    type: currentCourse.requirement_type || 'compulsory',
    label_ar: currentCourse.requirement_type_ar || 'إجباري'
  };
  const isCurrentCompulsory = currentReqInfo.type === 'compulsory' || currentReqInfo.label_ar === 'إجباري';

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-inner border border-slate-800 my-4 dir-rtl overflow-hidden">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-blue-400" />
          <h4 className="font-bold text-sm sm:text-base text-white">
            مسار العلاقات المباشرة (Horizontal RTL Course Flow)
          </h4>
        </div>
        <span className="text-[11px] font-medium text-slate-400 font-mono">
          RTL (يمين إلى يسار)
        </span>
      </div>

      {/* Horizontal Flow Container (Scrollable on smaller screens) */}
      <div className="overflow-x-auto custom-scrollbar pb-2">
        <div className="flex items-center gap-3 sm:gap-5 min-w-max py-2 px-1">
          {/* 1. DIRECT PREREQUISITES (FAR RIGHT IN RTL) */}
          {prereqs.length > 0 && (
            <div className="flex flex-col gap-2 shrink-0 min-w-[200px] max-w-[240px]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-0.5">
                <Lock className="w-3.5 h-3.5" />
                <span>المتطلبات السابقة (Required Before)</span>
              </div>
              {prereqs.map((p) => {
                const pCode = (p.codes_by_program && p.codes_by_program[selectedProgram]) || p.code;
                const pReqInfo = (p.requirements_by_program && p.requirements_by_program[selectedProgram]) || {
                  type: p.requirement_type || 'compulsory',
                  label_ar: p.requirement_type_ar || 'إجباري'
                };
                const isComp = pReqInfo.type === 'compulsory' || pReqInfo.label_ar === 'إجباري';
                return (
                  <div
                    key={p.code}
                    onClick={() => onSelectCourse && onSelectCourse(p)}
                    className="bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 rounded-xl p-3 text-right transition cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                        {pCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isComp
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {isComp ? 'Required / إجباري' : 'Elective / اختياري'}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-amber-100 group-hover:text-white transition line-clamp-1">
                      {p.name_ar}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-amber-300/80 font-mono mt-1 pt-1 border-t border-amber-500/20">
                      <span>{p.is_non_credit ? '0 Hours' : `${p.credit_hours} Hours`}</span>
                      <span className="text-amber-200/60 text-[10px] font-mono truncate max-w-[100px]">{p.name_en}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ARROW LEFT BETWEEN PREREQS AND CURRENT COURSE */}
          {prereqs.length > 0 && (
            <div className="flex items-center text-amber-400 shrink-0">
              <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/30 text-amber-300 text-xs font-mono">
                <ArrowLeft className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            </div>
          )}

          {/* 2. CURRENT / STARTING COURSE (MIDDLE / RIGHT) */}
          <div className="shrink-0 min-w-[220px] max-w-[260px] bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-4 border-2 border-blue-400/60 shadow-lg text-right relative overflow-hidden">
            <div className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-400/30 text-blue-100 rounded-md inline-block mb-1.5">
              المقرر الحالي (Selected)
            </div>

            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-sm font-extrabold px-2.5 py-0.5 bg-slate-950/80 text-blue-300 rounded-md border border-blue-400/40">
                {displayCode}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  isCurrentCompulsory
                    ? 'bg-emerald-400/20 text-emerald-200 border-emerald-400/40'
                    : 'bg-amber-400/20 text-amber-200 border-amber-400/40'
                }`}
              >
                {isCurrentCompulsory ? 'Required / إجباري' : 'Elective / اختياري'}
              </span>
            </div>

            <h4 className="font-extrabold text-sm sm:text-base text-white mb-0.5 leading-snug">
              {currentCourse.name_ar}
            </h4>
            <p className="font-mono text-[11px] text-blue-200 font-medium mb-2 dir-ltr text-right">
              {currentCourse.name_en}
            </p>

            <div className="pt-2 border-t border-blue-400/30 text-[11px] font-semibold text-blue-100 flex items-center justify-between font-mono">
              <span>{currentCourse.is_non_credit ? '0 Hours' : `${currentCourse.credit_hours} Hours`}</span>
              <span>المستوى {currentCourse.level}</span>
            </div>
          </div>

          {/* ARROW LEFT BETWEEN CURRENT COURSE AND DIRECT UNLOCKS */}
          {unlocks.length > 0 && (
            <div className="flex items-center text-emerald-400 shrink-0">
              <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                <ArrowLeft className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
          )}

          {/* 3. DIRECT UNLOCKS (EXTENDING TO THE LEFT) */}
          {unlocks.length > 0 ? (
            <div className="flex flex-col gap-2 shrink-0 min-w-[200px] max-w-[240px]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-0.5">
                <Unlock className="w-3.5 h-3.5" />
                <span>المقــررات المفتوحة مباشرة (Direct Unlocks)</span>
              </div>
              {unlocks.map((u) => {
                const uCode = (u.codes_by_program && u.codes_by_program[selectedProgram]) || u.code;
                const uReqInfo = (u.requirements_by_program && u.requirements_by_program[selectedProgram]) || {
                  type: u.requirement_type || 'compulsory',
                  label_ar: u.requirement_type_ar || 'إجباري'
                };
                const isComp = uReqInfo.type === 'compulsory' || uReqInfo.label_ar === 'إجباري';
                return (
                  <div
                    key={u.code}
                    onClick={() => onSelectCourse && onSelectCourse(u)}
                    className="bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-xl p-3 text-right transition cursor-pointer group shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                        {uCode}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isComp
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {isComp ? 'Required / إجباري' : 'Elective / اختياري'}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-emerald-100 group-hover:text-white transition line-clamp-1">
                      {u.name_ar}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-emerald-300/80 font-mono mt-1 pt-1 border-t border-emerald-500/20">
                      <span>{u.is_non_credit ? '0 Hours' : `${u.credit_hours} Hours`}</span>
                      <span className="text-emerald-200/60 text-[10px] font-mono truncate max-w-[100px]">{u.name_en}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-slate-400 bg-slate-800/60 rounded-xl px-4 py-3 border border-slate-700/50 shrink-0">
              هذا المقرر لا يفتح مقررات أخرى مباشرة
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
