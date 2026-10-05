import React from 'react';
import { Clock, Lock, Unlock, ChevronLeft } from 'lucide-react';

const LEVEL_NAMES = {
  1: 'السنة الأولى (First Year)',
  2: 'السنة الثانية (Second Year)',
  3: 'السنة الثالثة (Third Year)',
  4: 'السنة الرابعة (Fourth Year)',
};

export default function CourseCard({ course, onClick, selectedProgram = 'GENERAL' }) {
  const hasPrereqs = course.prerequisites && course.prerequisites.length > 0;
  const hasUnlocks = course.unlocks && course.unlocks.length > 0;

  const reqInfo = (course.requirements_by_program && course.requirements_by_program[selectedProgram]) || {
    type: course.requirement_type || 'compulsory',
    label_ar: course.requirement_type_ar || 'إجباري'
  };
  const isCompulsory = reqInfo.type === 'compulsory' || reqInfo.label_ar === 'إجباري';

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
    >
      {/* Top row: Code badge, Required/Elective badge, Level badge */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="font-mono font-bold text-sm sm:text-base px-2.5 py-0.5 rounded-md bg-slate-900 text-white tracking-wider">
            {course.code}
          </span>

          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                isCompulsory
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}
            >
              {isCompulsory ? 'Required / إجباري' : 'Elective / اختياري'}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-700">
              {LEVEL_NAMES[course.level] || `المستوى ${course.level}`}
            </span>
          </div>
        </div>

        {/* Course Names */}
        <h3 className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-0.5">
          {course.name_ar}
        </h3>
        <p className="text-xs sm:text-sm font-medium text-slate-500 font-mono tracking-tight mb-3">
          {course.name_en}
        </p>
      </div>

      {/* Meta info & Relationships */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {course.is_non_credit ? (
              <span className="text-amber-600 font-bold">0 Hours</span>
            ) : (
              <span>{course.credit_hours} Hours</span>
            )}
          </span>
        </div>

        {/* Badges for Prerequisites & Unlocks */}
        <div className="flex items-center gap-2">
          {hasPrereqs && (
            <span
              className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200"
              title="متطلبات سابقة"
            >
              <Lock className="w-3 h-3 text-amber-600" />
              <span>{course.prerequisites.length} متطلب</span>
            </span>
          )}

          {hasUnlocks && (
            <span
              className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"
              title="تفتح مقررات قادمة"
            >
              <Unlock className="w-3 h-3 text-emerald-600" />
              <span>تفتح {course.unlocks.length}</span>
            </span>
          )}

          <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
}
