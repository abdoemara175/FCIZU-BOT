import React from 'react';
import { ArrowDown, ArrowLeft, GitCommit, Lock, Unlock } from 'lucide-react';
import { getCourseRequirementLabel } from './courseSearch.js';

function getCourseInfo(course, selectedProgram) {
  const displayCode = (course.codes_by_program && course.codes_by_program[selectedProgram]) || course.code;
  const label = getCourseRequirementLabel(course, selectedProgram);
  const isCompulsory = label === 'إجباري';

  return {
    displayCode,
    label,
    isCompulsory,
    hours: course.is_non_credit ? '0 Hours / نجاح ورسوب' : `${course.credit_hours} ساعات معتمدة`,
  };
}

function RelationCard({ course, selectedProgram, tone, onSelectCourse }) {
  const info = getCourseInfo(course, selectedProgram);
  const palette = tone === 'amber'
    ? {
        card: 'border-amber-400/40 bg-amber-950/40 hover:bg-amber-900/60',
        code: 'border-amber-400/40 bg-amber-500/20 text-amber-200',
        title: 'text-amber-100 group-hover:text-white',
        meta: 'text-amber-200/80 border-amber-500/20',
        icon: 'text-amber-300',
      }
    : {
        card: 'border-emerald-400/40 bg-emerald-950/40 hover:bg-emerald-900/60',
        code: 'border-emerald-400/40 bg-emerald-500/20 text-emerald-200',
        title: 'text-emerald-100 group-hover:text-white',
        meta: 'text-emerald-200/80 border-emerald-500/20',
        icon: 'text-emerald-300',
      };

  return (
    <button
      type="button"
      onClick={() => onSelectCourse && onSelectCourse(course)}
      className={`group w-full text-right rounded-2xl border p-3.5 transition-all cursor-pointer shadow-sm hover:-translate-y-0.5 hover:shadow-lg ${palette.card}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`font-mono text-xs font-extrabold px-2 py-1 rounded-lg border dir-ltr shrink-0 ${palette.code}`}>
          {info.displayCode}
        </span>
        <span className={`text-[10px] leading-4 font-bold px-2 py-0.5 rounded-md border text-right ${
          info.isCompulsory
            ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40'
            : 'bg-amber-500/20 text-amber-200 border-amber-400/40'
        }`}>
          {info.label}
        </span>
      </div>

      <div className={`font-bold text-sm leading-relaxed break-words ${palette.title}`}>
        {course.name_ar}
      </div>
      <div className={`font-mono text-[11px] leading-relaxed dir-ltr text-right break-words mt-0.5 ${palette.icon}`}>
        {course.name_en}
      </div>

      <div className={`mt-2 pt-2 border-t flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] font-medium ${palette.meta}`}>
        <span>{info.hours}</span>
        <span>المستوى {course.level}</span>
      </div>
      {course.category && (
        <div className={`mt-1 text-[10px] leading-relaxed break-words ${palette.icon}`}>
          التصنيف: {course.category}
        </div>
      )}
    </button>
  );
}

function FlowConnector({ tone, label }) {
  const color = tone === 'amber' ? 'text-amber-300 border-amber-400/40 bg-amber-500/10' : 'text-emerald-300 border-emerald-400/40 bg-emerald-500/10';
  return (
    <div className="flex shrink-0 items-center justify-center py-1 sm:py-0 sm:px-1">
      <div className={`flex flex-col sm:flex-row items-center gap-1 rounded-full border px-2.5 py-1.5 text-[10px] font-bold ${color}`}>
        <span className="hidden sm:block whitespace-nowrap">{label}</span>
        <ArrowLeft className="hidden sm:block w-5 h-5" />
        <ArrowDown className="sm:hidden w-5 h-5" />
      </div>
    </div>
  );
}

function RelationColumn({ title, subtitle, icon: Icon, tone, courses, selectedProgram, onSelectCourse }) {
  const titleColor = tone === 'amber' ? 'text-amber-300' : 'text-emerald-300';
  return (
    <section className="flex w-full min-w-0 flex-col gap-2">
      <div className={`flex items-start gap-2 ${titleColor}`}>
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <h5 className="text-xs font-extrabold leading-relaxed">{title}</h5>
          <p className="text-[10px] font-medium text-slate-400 leading-relaxed">{subtitle}</p>
        </div>
        <span className="mr-auto rounded-full bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">
          {courses.length}
        </span>
      </div>

      {courses.length > 0 ? (
        <div className="flex flex-col gap-2">
          {courses.map((course) => (
            <RelationCard
              key={course.code}
              course={course}
              selectedProgram={selectedProgram}
              tone={tone}
              onSelectCourse={onSelectCourse}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-700/70 bg-slate-800/60 px-3 py-4 text-center text-xs leading-relaxed text-slate-400">
          لا توجد مواد في هذه الجهة
        </div>
      )}
    </section>
  );
}

export default function FlowVisualization({ currentCourse, courseMap, selectedProgram = 'GENERAL', onSelectCourse }) {
  if (!currentCourse) return null;

  const prereqs = (currentCourse.prerequisites || []).map((code) => courseMap[code]).filter(Boolean);
  const unlocks = (currentCourse.unlocks || []).map((code) => courseMap[code]).filter(Boolean);
  const currentInfo = getCourseInfo(currentCourse, selectedProgram);

  return (
    <div className="my-4 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-white shadow-inner dir-rtl">
      <div className="border-b border-slate-800 bg-slate-900/70 px-3.5 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <GitCommit className="h-4 w-4 text-blue-400" />
            <h4 className="text-sm font-extrabold sm:text-base">تسلسل العلاقات بين المواد</h4>
          </div>
          <span className="rounded-full border border-slate-700 bg-slate-800/70 px-2.5 py-1 text-[10px] font-medium text-slate-400">
            اضغط على أي مادة لعرض تفاصيلها
          </span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
          الترتيب يوضح المتطلبات المباشرة للمادة الحالية، ثم المواد التي تفتحها مباشرة بعد اجتيازها.
        </p>
      </div>

      <div className="overflow-x-hidden">
        <div className="grid min-w-0 grid-cols-1 gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.1fr)_auto_minmax(0,1fr)] sm:items-start sm:p-5">
          <RelationColumn
            title="المتطلبات السابقة"
            subtitle="يجب اجتيازها قبل تسجيل المادة"
            icon={Lock}
            tone="amber"
            courses={prereqs}
            selectedProgram={selectedProgram}
            onSelectCourse={onSelectCourse}
          />

          <FlowConnector tone="amber" label="تؤدي إلى" />

          <section className="w-full min-w-0 rounded-2xl border-2 border-blue-400/60 bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 p-4 shadow-lg">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="rounded-md bg-blue-400/30 px-2 py-1 text-[10px] font-extrabold text-blue-100">
                المادة الحالية
              </span>
              <span className="rounded-lg border border-blue-300/50 bg-slate-950/70 px-2 py-1 font-mono text-xs font-extrabold text-blue-200 dir-ltr">
                {currentInfo.displayCode}
              </span>
            </div>
            <div className="mb-1 text-sm font-extrabold leading-relaxed text-white break-words">
              {currentCourse.name_ar}
            </div>
            <div className="font-mono text-[11px] leading-relaxed text-blue-100 dir-ltr text-right break-words">
              {currentCourse.name_en}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-md border border-blue-300/40 bg-blue-400/20 px-2 py-1 text-[10px] font-bold text-blue-100">
                {currentInfo.label}
              </span>
              <span className="rounded-md border border-blue-300/40 bg-blue-400/20 px-2 py-1 text-[10px] font-bold text-blue-100">
                {currentInfo.hours}
              </span>
              <span className="rounded-md border border-blue-300/40 bg-blue-400/20 px-2 py-1 text-[10px] font-bold text-blue-100">
                المستوى {currentCourse.level}
              </span>
            </div>
            {currentCourse.category && (
              <div className="mt-2 border-t border-blue-300/30 pt-2 text-[10px] leading-relaxed text-blue-100 break-words">
                التصنيف: {currentCourse.category}
              </div>
            )}
          </section>

          <FlowConnector tone="emerald" label="تفتح" />

          <RelationColumn
            title="المواد المفتوحة مباشرة"
            subtitle="تصبح متاحة بعد اجتياز المادة الحالية"
            icon={Unlock}
            tone="emerald"
            courses={unlocks}
            selectedProgram={selectedProgram}
            onSelectCourse={onSelectCourse}
          />
        </div>
      </div>
    </div>
  );
}
