import React, { useEffect } from 'react';
import { X, GitFork, ChevronLeft } from 'lucide-react';
import { getCourseRequirementLabel } from './courseSearch.js';

export default function FullFlowModal({ course, courseMap, selectedProgram, onClose, onSelectCourse }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!course) return null;

  // Upstream prerequisites chain
  const getUpstreamChain = (c, visited = new Set()) => {
    if (visited.has(c.code)) return [];
    visited.add(c.code);

    const parents = (c.prerequisites || []).map((code) => courseMap[code]).filter(Boolean);
    let chain = [...parents];
    parents.forEach((p) => {
      chain = [...chain, ...getUpstreamChain(p, visited)];
    });
    return chain;
  };

  // Downstream unlocks chain
  const getDownstreamChain = (c, visited = new Set()) => {
    if (visited.has(c.code)) return [];
    visited.add(c.code);

    const children = (c.unlocks || []).map((code) => courseMap[code]).filter(Boolean);
    let chain = [...children];
    children.forEach((ch) => {
      chain = [...chain, ...getDownstreamChain(ch, visited)];
    });
    return chain;
  };

  const upstream = getUpstreamChain(course);
  const downstream = getDownstreamChain(course);

  const displayCode = (course.codes_by_program && course.codes_by_program[selectedProgram]) || course.code;
  const courseReqLabel = getCourseRequirementLabel(course, selectedProgram);
  const isCompulsory = courseReqLabel === 'إجباري';

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-fade-in dir-rtl"
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-2 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 break-words">
                المسار الدراسي الشامل (Full Course Path)
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {displayCode} — {course.name_ar} ({courseReqLabel})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            title="إغلاق (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-3.5 sm:p-6 space-y-6">
          {/* UPSTREAM PREREQUISITES CHAIN */}
          <div>
            <h4 className="font-bold text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 mb-3 inline-block">
              1. سلسلة المتطلبات السابقة الكاملة ({upstream.length} مادة)
            </h4>

            {upstream.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {upstream.map((item) => {
                  const itemCode = (item.codes_by_program && item.codes_by_program[selectedProgram]) || item.code;
                  const itemReqLabel = getCourseRequirementLabel(item, selectedProgram);
                  const isItemComp = itemReqLabel === 'إجباري';
                  return (
                    <button
                      key={item.code}
                      onClick={() => {
                        onSelectCourse(item);
                      }}
                      className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl text-right transition group flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-900 text-white rounded dir-ltr">
                            {itemCode}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              isItemComp
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {isItemComp ? 'Required / إجباري' : 'Elective / اختياري'}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600">
                          {item.name_ar}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {item.is_non_credit ? '0 Hours' : `${item.credit_hours} Hours`}
                        </div>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition shrink-0" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
                لا توجد متطلبات سابقة في السلسلة
              </div>
            )}
          </div>

          {/* TARGET COURSE (FOCUS) */}
          <div className="p-4 rounded-2xl bg-blue-600 text-white text-center shadow-md">
            <span className="font-mono font-extrabold text-sm px-2.5 py-0.5 bg-slate-900 text-blue-300 rounded dir-ltr inline-block mb-1">
              {displayCode}
            </span>
            <div className="font-bold text-lg">{course.name_ar} ({courseReqLabel})</div>
            <div className="text-xs font-mono text-blue-100 dir-ltr mb-1">{course.name_en}</div>
            <div className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded bg-white/20 text-white">
              {course.is_non_credit ? '0 Hours' : `${course.credit_hours} Hours`}
            </div>
          </div>

          {/* DOWNSTREAM UNLOCKS CHAIN */}
          <div>
            <h4 className="font-bold text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 mb-3 inline-block">
              2. سلسلة المقررات الناتجة والفتح المباشر وغير المباشر ({downstream.length} مادة)
            </h4>

            {downstream.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {downstream.map((item) => {
                  const itemCode = (item.codes_by_program && item.codes_by_program[selectedProgram]) || item.code;
                  const itemReqLabel = getCourseRequirementLabel(item, selectedProgram);
                  const isItemComp = itemReqLabel === 'إجباري';
                  return (
                    <button
                      key={item.code}
                      onClick={() => {
                        onSelectCourse(item);
                      }}
                      className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-xl text-right transition group flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-900 text-white rounded dir-ltr">
                            {itemCode}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              isItemComp
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {isItemComp ? 'Required / إجباري' : 'Elective / اختياري'}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-600">
                          {item.name_ar}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {item.is_non_credit ? '0 Hours' : `${item.credit_hours} Hours`}
                        </div>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:-translate-x-1 transition shrink-0" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
                لا تتوقف عليها أي مواد أخرى لاحقاً في الخطة
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
