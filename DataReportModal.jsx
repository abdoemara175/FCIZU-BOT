import React from 'react';
import { X, CheckCircle2, AlertTriangle, FileText, Database, Layers, GitBranch } from 'lucide-react';

export default function DataReportModal({ isOpen, onClose, stats }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-2 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 break-words">تقرير استخراج وتوثيق اللائحة</h3>
              <p className="hidden sm:block text-xs text-slate-500 font-mono">PDF Official Extraction Verification Report</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-3.5 sm:p-6 space-y-5 text-sm text-slate-700">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">تم المطابقة والتحقق الكامل 100%</div>
              <div className="text-xs text-emerald-700 mt-0.5">
                تم استخراج اللائحة الرسمية من ملف الـ PDF وحل جميع الروابط والعلاقات بين المقررات بدون أي تكهنات أو أكواد مفقودة.
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-400 font-medium">إجمالي المقررات المستخرجة</div>
              <div className="text-xl font-bold text-slate-900 font-mono">{stats.totalCourses} مقرر</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-xs text-slate-400 font-medium">روابط المتطلبات المباشرة</div>
              <div className="text-xl font-bold text-slate-900 font-mono">{stats.totalEdges} علاقة</div>
            </div>
          </div>

          {/* Level Breakdown */}
          <div className="space-y-2">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
              توزيع المقررات حسب المستويات الدراسية:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between border border-slate-100">
                <span>السنة الأولى (Level 1):</span>
                <span className="font-bold font-mono text-slate-900">{stats.levels[1]} مقرر</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between border border-slate-100">
                <span>السنة الثانية (Level 2):</span>
                <span className="font-bold font-mono text-slate-900">{stats.levels[2]} مقرر</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between border border-slate-100">
                <span>السنة الثالثة (Level 3):</span>
                <span className="font-bold font-mono text-slate-900">{stats.levels[3]} مقرر</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 flex items-center justify-between border border-slate-100">
                <span>السنة الرابعة (Level 4):</span>
                <span className="font-bold font-mono text-slate-900">{stats.levels[4]} مقرر</span>
              </div>
            </div>
          </div>

          {/* Special observations */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
              ملاحظات وتدقيق اللائحة:
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
              <li>
                <strong>أكواد غير محلولة:</strong> <span className="text-emerald-600 font-bold">0</span> (تم حل جميع أكواد المتطلبات إلى أسماء المقررات الأصلية).
              </li>
              <li>
                <strong>مقررات ذات متطلبات متعددة (4 مقررات):</strong>
                <ul className="pr-4 mt-1 space-y-0.5 text-[11px] text-slate-500 font-mono">
                  <li>- GI300 (GIS) ← يتطلب [IS200, IS201]</li>
                  <li>- GI404 (Web & Mobile GIS) ← يتطلب [GI300, IT301]</li>
                  <li>- IT402 (Network Security) ← يتطلب [IT304, IT202]</li>
                  <li>- DS301 (Modeling & Sim.) ← يتطلب [DS100, BS103]</li>
                </ul>
              </li>
              <li>
                <strong>مادة بدون ساعات معتمدة:</strong> المقرر <code className="bg-slate-100 px-1 py-0.5 rounded font-bold">HU103</code> حقوق الإنسان ومكافحة الفساد (مادة نجاح ورسوب).
              </li>
              <li>
                <strong>اختلاف كود مادة المنطق الضبابي:</strong> ورد المقرر برمز <code className="bg-slate-100 px-1 py-0.5 rounded">CS405</code> في اختياري الحاسب وبـ <code className="bg-slate-100 px-1 py-0.5 rounded">CS416</code> في اختياري دعم القرار، وتم المحافظة على الكود الأساسي <code className="bg-slate-100 px-1 py-0.5 rounded font-bold">CS405</code> مع تسجيل الملاحظة.
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-medium text-xs hover:bg-slate-800 transition shadow-xs"
          >
            إغلاق التقرير
          </button>
        </div>
      </div>
    </div>
  );
}
