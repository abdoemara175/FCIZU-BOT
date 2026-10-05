import React from 'react';
import { Search, X, Filter, BookOpen } from 'lucide-react';

const LEVEL_LABELS = [
  { id: 0, ar: 'الكل', en: 'All' },
  { id: 1, ar: 'السنة الأولى', en: 'First Year' },
  { id: 2, ar: 'السنة الثانية', en: 'Second Year' },
  { id: 3, ar: 'السنة الثالثة', en: 'Third Year' },
  { id: 4, ar: 'السنة الرابعة', en: 'Fourth Year' },
];

const CATEGORIES = [
  { id: 'ALL', label: 'جميع الأقسام / All Departments' },
  { id: 'CS', label: 'علوم الحاسب (CS)' },
  { id: 'IS', label: 'نظم المعلومات (IS)' },
  { id: 'IT', label: 'تكنولوجيا المعلومات (IT)' },
  { id: 'GI', label: 'الجيومعلوماتية (GI)' },
  { id: 'DS', label: 'دعم القرار (DS)' },
  { id: 'REQ', label: 'متطلبات الكلية والجامعة' },
];

export default function SearchFilterBar({
  searchQuery,
  setSearchQuery,
  selectedLevel,
  setSelectedLevel,
  selectedCategory,
  setSelectedCategory,
  resultsCount,
}) {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-[60px] sm:top-[68px] z-20 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-3 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المقرر بالعربي أو الإنجليزي أو الكود (مثال: برمجة, CS101, Data)..."
            className="w-full pr-11 pl-10 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-xl text-sm transition outline-none shadow-xs text-slate-900 placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Level Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar scroll-smooth">
          {LEVEL_LABELS.map((lvl) => {
            const isActive = selectedLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                onClick={() => setSelectedLevel(lvl.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                <span>{lvl.ar}</span>
                <span className={`text-[10px] opacity-75 font-mono dir-ltr ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                  ({lvl.en})
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Dropdown & Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-700 font-medium text-xs border-0 outline-none cursor-pointer hover:text-blue-600 transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="font-medium text-slate-600">
            تم العثور على <span className="font-bold text-blue-600">{resultsCount}</span> مقرر
          </div>
        </div>
      </div>
    </div>
  );
}
