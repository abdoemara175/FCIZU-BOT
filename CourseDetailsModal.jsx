import React, { useEffect } from 'react';
import { X, Clock, BookOpen, Layers, Lock, Unlock, ChevronLeft } from 'lucide-react';
import FlowVisualization from './FlowVisualization.jsx';

const LEVEL_NAMES = {
  1: 'السنة الأولى (First Year)',
  2: 'السنة الثانية (Second Year)',
  3: 'السنة الثالثة (Third Year)',
  4: 'السنة الرابعة (Fourth Year)',
};

export default function CourseDetailsModal({ course, courseMap, selectedProgram, onClose, onSelectCourse }) {
  // Handle Escape key press
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

  const displayCode = (course.codes_by_program && course.codes_by_program[selectedProgram]) || course.code;

  // Requirement status for current selected program
  const reqInfo = (course.requirements_by_program && course.requirements_by_program[selectedProgram]) || {
    type: course.requirement_type || 'compulsory',
    label_ar: course.requirement_type_ar || 'إجباري',
    label_en: course.requirement_type_en || 'Compulsory',
  };
  const isCompulsory = reqInfo.type === 'compulsory' || reqInfo.label_ar === 'إجباري';

  const prereqCourses = (course.prerequisites || []).map((code) => courseMap[code]).filter(Boolean);
  const unlockCourses = (course.unlocks || []).map((code) => courseMap[code]).filter(Boolean);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-fade-in dir-rtl"
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl border border-slate-200 flex flex-col">
        {/* Sticky Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-2 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="font-mono font-extrabold text-sm sm:text-base px-3 py-1 bg-slate-900 text-white rounded-xl tracking-wider dir-ltr shadow-xs">
              {displayCode}
            </span>
            <div>
              <h3 className="font-bold text-sm sm:text-lg text-slate-900 break-words">
                {course.name_ar}
              </h3>
              <p className="text-xs font-mono text-slate-500 dir-ltr text-right">
                {course.name_en}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            title="إغلاق (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-3.5 sm:p-6 space-y-5">
          {/* Requirement Badge (Text + Color) & Level */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                isCompulsory
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}
            >
              {isCompulsory ? 'إجباري / Required' : 'اختياري / Elective'}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              {LEVEL_NAMES[course.level] || `المستوى ${course.level}`}
            </span>
            {course.category && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                {course.category}
              </span>
            )}
          </div>

          {/* Key Course Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
              <div className="text-xs text-slate-500 mb-1 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>الساعات المعتمدة</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-900">
                {course.is_non_credit ? '0 (نجاح/رسوب)' : `${course.credit_hours} Hours / ${course.credit_hours} ساعات`}
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
              <div className="text-xs text-slate-500 mb-1 flex items-center gap-1 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>محاضرة / تمارين</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-900">
                {course.lecture_hours} مح + {course.lab_hours} عم
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-50 rounded-2xl p-3 border border-slate-100">
              <div className="text-xs text-slate-500 mb-1 flex items-center gap-1 font-medium">
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                <span>المستوى الدراسي</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-slate-900">
                المستوى {course.level}
              </div>
            </div>
          </div>

          {course.note && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm p-3.5 rounded-2xl font-medium">
              💡 <strong>ملاحظة:</strong> {course.note}
            </div>
          )}

          {/* Direct Prerequisites */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>المتطلبات السابقة المباشرة ({prereqCourses.length}):</span>
            </div>
            {prereqCourses.length > 0 ? (
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                {prereqCourses.map((req) => {
                  const rCode = (req.codes_by_program && req.codes_by_program[selectedProgram]) || req.code;
                  const rReqInfo = (req.requirements_by_program && req.requirements_by_program[selectedProgram]) || { type: req.requirement_type || 'compulsory' };
                  const rIsComp = rReqInfo.type === 'compulsory' || rReqInfo.label_ar === 'إجباري';
                  return (
                    <button
                      key={req.code}
                      onClick={() => onSelectCourse(req)}
                      className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-2xl text-right transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 bg-slate-900 text-white rounded dir-ltr">
                            {rCode}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              rIsComp
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {rIsComp ? 'Required' : 'Elective'}
                          </span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition">
                          {req.name_ar}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {req.is_non_credit ? '0 Hours' : `${req.credit_hours} Hours`}
                        </div>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
                لا توجد متطلبات سابقة (متاح للتسجيل المباشر)
              </div>
            )}
          </div>

          {/* Direct Unlocks */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Unlock className="w-4 h-4 text-emerald-600" />
              <span>المقــررات المفتوحة مباشرة ({unlockCourses.length}):</span>
            </div>
            {unlockCourses.length > 0 ? (
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                {unlockCourses.map((unl) => {
                  const uCode = (unl.codes_by_program && unl.codes_by_program[selectedProgram]) || unl.code;
                  const uReqInfo = (unl.requirements_by_program && unl.requirements_by_program[selectedProgram]) || { type: unl.requirement_type || 'compulsory' };
                  const uIsComp = uReqInfo.type === 'compulsory' || uReqInfo.label_ar === 'إجباري';
                  return (
                    <button
                      key={unl.code}
                      onClick={() => onSelectCourse(unl)}
                      className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-2xl text-right transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 bg-slate-900 text-white rounded dir-ltr">
                            {uCode}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              uIsComp
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {uIsComp ? 'Required' : 'Elective'}
                          </span>
                        </div>
                        <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-600 transition">
                          {unl.name_ar}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {unl.is_non_credit ? '0 Hours' : `${unl.credit_hours} Hours`}
                        </div>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:-translate-x-1 transition" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
                لا يفتح أي مواد أخرى مباشرة
              </div>
            )}
          </div>

          {/* Horizontal RTL Flow Graph inside Modal */}
          <FlowVisualization
            currentCourse={course}
            courseMap={courseMap}
            selectedProgram={selectedProgram}
            onSelectCourse={onSelectCourse}
          />
        </div>
      </div>
    </div>
  );
}
