import React, { useEffect } from 'react';
import { ArrowRight, Lock, Unlock, Clock, BookOpen, Layers, CheckCircle2, ChevronLeft } from 'lucide-react';
import FlowVisualization from './FlowVisualization.jsx';

const LEVEL_NAMES = {
  1: 'السنة الأولى (First Year)',
  2: 'السنة الثانية (Second Year)',
  3: 'السنة الثالثة (Third Year)',
  4: 'السنة الرابعة (Fourth Year)',
};

export default function CourseDetails({ course, courseMap, onBack, onSelectCourse }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [course]);

  if (!course) return null;

  const prereqCourses = (course.prerequisites || []).map((code) => courseMap[code]).filter(Boolean);
  const unlockCourses = (course.unlocks || []).map((code) => courseMap[code]).filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-6">
      {/* Top Navigation / Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition shadow-xs text-sm"
        >
          <ArrowRight className="w-4 h-4 text-slate-500" />
          <span>العودة للمقررات</span>
        </button>

        <span className="font-mono font-bold text-xs sm:text-sm px-3 py-1 bg-slate-900 text-white rounded-lg tracking-wider">
          {course.code}
        </span>
      </div>

      {/* Main Course Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {LEVEL_NAMES[course.level]}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              {course.category}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {course.name_ar}
          </h2>
          <p className="text-sm sm:text-base font-mono font-semibold text-slate-500 mt-1">
            {course.name_en}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
            <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>الساعات المعتمدة</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-900">
              {course.is_non_credit ? (
                <span className="text-amber-600 text-sm">0 (نجاح/رسوب)</span>
              ) : (
                <span>{course.credit_hours} ساعات</span>
              )}
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
            <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>ساعات المحاضرة/التمارين</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-900">
              {course.lecture_hours} مح + {course.lab_hours} عم
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
            <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              <span>المستوى الدراسي</span>
            </div>
            <div className="text-base sm:text-lg font-bold text-slate-900">
              المستوى {course.level}
            </div>
          </div>
        </div>

        {course.note && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm p-3.5 rounded-xl font-medium">
            💡 <strong>ملاحظة:</strong> {course.note}
          </div>
        )}
      </div>

      {/* SECTION 1: PREREQUISITES (REQUIRED BEFORE THIS) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900">
                المتطلبات السابقة (Required Before)
              </h3>
              <p className="text-xs text-slate-500">
                يجب إتمام هذه المقررات بنجاح قبل تسجيل هذا المقرر
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
            {prereqCourses.length} متطلب
          </span>
        </div>

        {prereqCourses.length > 0 ? (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {prereqCourses.map((req) => (
              <div
                key={req.code}
                onClick={() => onSelectCourse(req)}
                className="group bg-slate-50 hover:bg-blue-50/50 rounded-2xl p-4 border border-slate-200/80 hover:border-blue-300 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-900 text-white">
                      {req.code}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{req.name_en}</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">
                    {req.name_ar}
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition" />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-xs sm:text-sm text-center">
            لا توجد متطلبات سابقة لهذا المقرر (يمكن دراسته مباشرة)
          </div>
        )}
      </div>

      {/* SECTION 2: UNLOCKS (NEXT COURSES) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Unlock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900">
                المقررات التي يفتحها هذا المقرر (Unlocks Next)
              </h3>
              <p className="text-xs text-slate-500">
                بعد اجتياز هذا المقرر، تصبح المقررات التالية متاحة للتسجيل
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            تفتح {unlockCourses.length}
          </span>
        </div>

        {unlockCourses.length > 0 ? (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
            {unlockCourses.map((unl) => (
              <div
                key={unl.code}
                onClick={() => onSelectCourse(unl)}
                className="group bg-slate-50 hover:bg-emerald-50/50 rounded-2xl p-4 border border-slate-200/80 hover:border-emerald-300 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-900 text-white">
                      {unl.code}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{unl.name_en}</span>
                  </div>
                  <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition">
                    {unl.name_ar}
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:-translate-x-1 transition" />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-xs sm:text-sm text-center">
            هذا المقرر لا يتوقف عليه أي مقرر آخر لاحقاً في الخطة
          </div>
        )}
      </div>

      {/* SECTION 3: VISUAL FLOW GRAPH */}
      <FlowVisualization
        currentCourse={course}
        courseMap={courseMap}
        onSelectCourse={onSelectCourse}
      />
    </div>
  );
}
