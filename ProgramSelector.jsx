import React from 'react';
import { X, GraduationCap, Check } from 'lucide-react';

export const PROGRAM_OPTIONS = [
  {
    id: 'GENERAL',
    name_ar: 'General',
    name_en: 'General',
    desc: 'المواد العامة والمشتركة بين جميع التخصصات',
  },
  {
    id: 'CS',
    name_ar: 'علوم الحاسب (CS)',
    name_en: 'Computer Science',
    desc: 'تخصص علوم الحاسب والخوارزميات',
  },
  {
    id: 'DS',
    name_ar: 'دعم القرار (DS)',
    name_en: 'Decision Support',
    desc: 'تخصص بحوث العمليات وإحصاء وتحليل بيانات',
  },
  {
    id: 'IS',
    name_ar: 'نظم المعلومات (IS)',
    name_en: 'Information Systems',
    desc: 'تخصص نظم وقواعد البيانات والأعمال',
  },
  {
    id: 'IT',
    name_ar: 'تكنولوجيا المعلومات (IT)',
    name_en: 'Information Technology',
    desc: 'تخصص شبكات وأمن وحوسبة سحابية',
  },
  {
    id: 'GIS',
    name_ar: 'الجيومعلوماتية (GIS)',
    name_en: 'Geoinformatics',
    desc: 'تخصص نظم المعلومات الجغرافية والرقمية',
  },
];

export default function ProgramSelector({ isOpen, onClose, selectedProgram, onSelectProgram }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in dir-rtl">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full max-h-[calc(100dvh-1rem)] overflow-y-auto p-3.5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-slate-900">اختر برنامجك الدراسي</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">اختر التخصص لعرض حالة إجبارية/اختيارية المواد بدقة</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Options List */}
        <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {PROGRAM_OPTIONS.map((prog) => {
            const isSelected = selectedProgram === prog.id;
            return (
              <button
                key={prog.id}
                onClick={() => {
                  onSelectProgram(prog.id);
                  if (onClose) onClose();
                }}
                className={`w-full p-3.5 rounded-2xl border text-right transition flex items-center justify-between group min-h-[44px] ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">
                      {prog.name_ar}
                    </span>
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500">{prog.desc}</div>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                ) : (
                  <span className="text-xs font-mono text-slate-400 group-hover:text-blue-600 dir-ltr shrink-0">
                    {prog.id}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-400 text-center pt-2">
          يمكنك تغيير تخصصك في أي وقت لاحقاً من الشريط العلوي.
        </div>
      </div>
    </div>
  );
}
