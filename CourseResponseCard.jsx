import React, { useState } from 'react';
import { Copy, Lock, Unlock, Clock, BookOpen, Layers, GitFork, Info, ChevronLeft } from 'lucide-react';
import VisualFlowGraph from './VisualFlowGraph.jsx';
import { formatCourseForCopy, getCourseRequirementLabel } from './courseSearch.js';

const LEVEL_NAMES = {
  1: 'السنة الأولى (First Year)',
  2: 'السنة الثانية (Second Year)',
  3: 'السنة الثالثة (Third Year)',
  4: 'السنة الرابعة (Fourth Year)',
};

export default function CourseResponseCard({ course, courseMap, selectedProgram, onSelectCourse, onOpenFullFlow, onCopy }) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'prereqs' | 'unlocks' | 'details'

  if (!course) return null;

  const displayCode = (course.codes_by_program && course.codes_by_program[selectedProgram]) || course.code;

  // Requirement status for selected program
  const reqInfo = (course.requirements_by_program && course.requirements_by_program[selectedProgram]) || {
    type: course.requirement_type || 'compulsory',
    label_ar: course.requirement_type_ar || 'إجباري',
    label_en: course.requirement_type_en || 'Compulsory'
  };

  const reqCategory = (course.elective_category_by_program && course.elective_category_by_program[selectedProgram]) || course.elective_category;

  const isCompulsory = reqInfo.type === 'compulsory';

  const prereqCourses = (course.prerequisites || []).map((c) => courseMap[c]).filter(Boolean);
  const unlockCourses = (course.unlocks || []).map((c) => courseMap[c]).filter(Boolean);

  const handleCopyText = () => {
    const text = formatCourseForCopy(course, courseMap, selectedProgram);
    navigator.clipboard.writeText(text);
    if (onCopy) onCopy('تم نسخ معلومات المادة بنجاح');
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-4 text-right dir-rtl">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {/* Program Requirement Badge (Text + Color) */}
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                isCompulsory
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-purple-50 text-purple-700 border-purple-200'
              }`}
            >
              [{reqInfo.label_ar} — {reqInfo.label_en}]
            </span>

            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {LEVEL_NAMES[course.level]}
            </span>
          </div>

          <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 leading-tight">
            {course.name_ar} <span className="text-base font-bold text-slate-500 font-sans">({reqInfo.label_ar})</span>
          </h3>
          <p className="text-xs sm:text-sm font-mono font-medium text-slate-500 dir-ltr text-right">
            {course.name_en}
          </p>
        </div>

        {/* Code badge & Copy button */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="font-mono font-extrabold text-sm sm:text-base px-3 py-1 bg-slate-900 text-white rounded-xl tracking-wider dir-ltr shadow-xs">
            {displayCode}
          </span>
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition border border-slate-200"
            title="نسخ النص"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>نسخ</span>
          </button>
        </div>
      </div>

      {/* Course Metadata Summary */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
        <span className="flex items-center gap-1 font-medium">
          <Clock className="w-3.5 h-3.5 text-blue-500" />
          {course.is_non_credit ? (
            <span className="text-amber-600 font-bold">غير مخصصة ساعات (نجاح/رسوب)</span>
          ) : (
            <span>{course.credit_hours} ساعات معتمدة ({course.lecture_hours} مح + {course.lab_hours} عم)</span>
          )}
        </span>

        {reqCategory && (
          <span className="flex items-center gap-1 text-slate-500 font-medium">
            <span>•</span>
            <span className="text-purple-700 font-semibold">{reqCategory}</span>
          </span>
        )}
      </div>

      {/* Quick Action Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          عرض النظرة العامة
        </button>
        <button
          onClick={() => setActiveTab('prereqs')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'prereqs'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-800 border border-amber-200/60 hover:bg-amber-100'
          }`}
        >
          إيه اللي قبلها؟ ({prereqCourses.length})
        </button>
        <button
          onClick={() => setActiveTab('unlocks')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'unlocks'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 hover:bg-emerald-100'
          }`}
        >
          بتفتح إيه؟ ({unlockCourses.length})
        </button>
        <button
          onClick={() => onOpenFullFlow(course)}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 flex items-center gap-1"
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>عرض المسار كامل</span>
        </button>
      </div>

      {/* TAB CONTENTS */}
      {activeTab === 'all' && (
        <>
          {/* Visual Dependency Flow Graph */}
          <VisualFlowGraph
            course={course}
            courseMap={courseMap}
            selectedProgram={selectedProgram}
            onSelectCourse={onSelectCourse}
          />
        </>
      )}

      {activeTab === 'prereqs' && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
            <Lock className="w-4 h-4" />
            <span>المتطلبات السابقة المباشرة التي يجب دراستها أولاً:</span>
          </div>

          {prereqCourses.length > 0 ? (
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
              {prereqCourses.map((req) => {
                const reqCode = (req.codes_by_program && req.codes_by_program[selectedProgram]) || req.code;
                const reqLabel = getCourseRequirementLabel(req, selectedProgram);
                return (
                  <button
                    key={req.code}
                    onClick={() => onSelectCourse(req)}
                    className="p-3 bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200 rounded-2xl text-right transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5 dir-ltr">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 bg-slate-900 text-white rounded">
                          {reqCode}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">{req.name_en}</span>
                      </div>
                      <div className="font-bold text-sm text-slate-900 group-hover:text-amber-800">
                        {req.name_ar} <span className="text-xs font-semibold text-amber-900/80">({reqLabel})</span>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-amber-600 group-hover:-translate-x-1 transition" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 text-slate-500 text-xs text-center">
              لا توجد متطلبات سابقة لهذا المقرر (يمكن تسجيله مباشرة)
            </div>
          )}
        </div>
      )}

      {activeTab === 'unlocks' && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
            <Unlock className="w-4 h-4" />
            <span>المقــررات التي تفتح مباشرة بعد اجتياز هذه المادة (المستوى التالي فقط):</span>
          </div>

          {unlockCourses.length > 0 ? (
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
              {unlockCourses.map((unl) => {
                const unlCode = (unl.codes_by_program && unl.codes_by_program[selectedProgram]) || unl.code;
                const unlLabel = getCourseRequirementLabel(unl, selectedProgram);
                return (
                  <button
                    key={unl.code}
                    onClick={() => onSelectCourse(unl)}
                    className="p-3 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl text-right transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-0.5 dir-ltr">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 bg-slate-900 text-white rounded">
                          {unlCode}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">{unl.name_en}</span>
                      </div>
                      <div className="font-bold text-sm text-slate-900 group-hover:text-emerald-800">
                        {unl.name_ar} <span className="text-xs font-semibold text-emerald-900/80">({unlLabel})</span>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-emerald-600 group-hover:-translate-x-1 transition" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 text-slate-500 text-xs text-center">
              هذا المقرر لا يفتح أي مواد أخرى لاحقاً مباشرة
            </div>
          )}
        </div>
      )}
    </div>
  );
}
