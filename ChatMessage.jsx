import React, { useState } from 'react';
import { User, Bot, Copy, Check, ChevronLeft, HelpCircle, BookOpen, Layers, Clock } from 'lucide-react';
import CourseResponseCard from './CourseResponseCard.jsx';
import { getCourseRequirementLabel } from './courseSearch.js';

export default function ChatMessage({ message, courseMap, selectedProgram, onSelectCourse, onOpenFullFlow, onCopy }) {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopyUserText = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    if (onCopy) onCopy('تم نسخ السؤال');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTextResponse = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    if (onCopy) onCopy('تم نسخ الإجابة');
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex justify-start mb-4 dir-rtl animate-slide-up">
        <div className="flex items-start gap-2.5 max-w-[88%] sm:max-w-[78%]">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="group relative bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 shadow-xs text-sm">
            <p className="font-medium leading-relaxed">{message.text}</p>
            <button
              onClick={handleCopyUserText}
              className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-blue-200 hover:text-white flex items-center gap-1 min-h-[24px]"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // BOT RESPONSES
  return (
    <div className="flex justify-end mb-5 dir-rtl animate-slide-up">
      <div className="flex items-start gap-2.5 max-w-[95%] sm:max-w-[88%] w-full">
        <div className="w-8 h-8 rounded-full bg-slate-900 text-blue-400 border border-slate-700 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-1">
          <Bot className="w-4 h-4" />
        </div>

        <div className="w-full space-y-3">
          {/* TYPE 1: STRUCTURED COURSE RESPONSE */}
          {message.type === 'course' && message.course && (
            <CourseResponseCard
              course={message.course}
              courseMap={courseMap}
              selectedProgram={selectedProgram}
              initialTab={message.initialTab || 'all'}
              onSelectCourse={onSelectCourse}
              onOpenFullFlow={onOpenFullFlow}
              onCopy={onCopy}
            />
          )}

          {/* TYPE 2: DISAMBIGUATION / SUGGESTIONS (DID YOU MEAN?) */}
          {(message.type === 'disambiguation' || message.type === 'suggestion') && message.options && (
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3 animate-scale-up">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  {message.type === 'suggestion' ? 'هل تقصد إحدى المواد التالية؟ (Did you mean?)' : 'وجدت أكثر من مادة مطابقة، اختر المادة المطلوبة:'}
                </span>
              </div>
              <div className="grid gap-2 grid-cols-1">
                {message.options.map((item) => {
                  const displayCode = (item.codes_by_program && item.codes_by_program[selectedProgram]) || item.code;
                  const reqLabel = getCourseRequirementLabel(item, selectedProgram);
                  return (
                    <button
                      key={item.code}
                      onClick={() => onSelectCourse(item)}
                      className="p-3 bg-slate-50 hover:bg-blue-50/80 active:scale-[0.99] border border-slate-200/90 rounded-2xl text-right transition-all flex items-center justify-between group min-h-[44px]"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-xs px-2.5 py-1 bg-slate-900 text-white rounded-lg dir-ltr">
                          {displayCode}
                        </span>
                        <div>
                          <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">
                            {item.name_ar} <span className="text-xs font-semibold text-slate-600 font-sans">({reqLabel})</span>
                          </div>
                          <div className="text-xs font-mono text-slate-400 dir-ltr text-right">
                            {item.name_en}
                          </div>
                        </div>
                      </div>
                      <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TYPE 3: COURSE LIST RESPONSE */}
          {message.type === 'course_list' && message.listData && (
            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-4 animate-scale-up">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                  {message.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  اضغط على أي مادة لعرض متطلباتها والمواد التي تفتحها
                </p>
              </div>

              {/* Grouped lists or single list */}
              {message.listData.reqType === 'ALL' && message.listData.compulsoryCourses.length > 0 && message.listData.electiveCourses.length > 0 ? (
                <div className="space-y-4">
                  {/* Compulsory Group */}
                  <div>
                    <h4 className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg inline-block mb-2">
                      المقررات الإجبارية ({message.listData.compulsoryCourses.length} مادة)
                    </h4>
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                      {message.listData.compulsoryCourses.map((item) => (
                        <CourseListItem key={item.code} item={item} selectedProgram={selectedProgram} onSelectCourse={onSelectCourse} />
                      ))}
                    </div>
                  </div>

                  {/* Elective Group */}
                  <div>
                    <h4 className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-lg inline-block mb-2">
                      المقررات الاختيارية ({message.listData.electiveCourses.length} مادة)
                    </h4>
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                      {message.listData.electiveCourses.map((item) => (
                        <CourseListItem key={item.code} item={item} selectedProgram={selectedProgram} onSelectCourse={onSelectCourse} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                  {message.listData.courses.map((item) => (
                    <CourseListItem key={item.code} item={item} selectedProgram={selectedProgram} onSelectCourse={onSelectCourse} />
                  ))}
                </div>
              )}

              {/* Footer Totals */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600 bg-slate-50 px-3.5 py-2 rounded-2xl">
                <span>إجمالي المواد: <strong className="text-blue-600 font-mono">{message.listData.totalCoursesCount}</strong> مادة</span>
                <span>إجمالي الساعات: <strong className="text-blue-600 font-mono">{message.listData.totalCreditHours}</strong> ساعة معتمدة</span>
              </div>
            </div>
          )}

          {/* TYPE 4: TEXT / ACADEMIC RULE / SYSTEM NOTICE */}
          {(message.type === 'text' || message.type === 'academic_rule') && (
            <div className="bg-white rounded-2xl rounded-tl-none p-4 sm:p-5 border border-slate-200/90 text-slate-800 text-sm shadow-xs space-y-2 animate-scale-up">
              {message.type === 'academic_rule' && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50/90 px-2.5 py-1 rounded-lg w-fit mb-1 border border-blue-100">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>القواعد الأكاديمية اللائحية</span>
                </div>
              )}
              <p className="leading-relaxed font-medium whitespace-pre-line text-slate-800">{message.text}</p>
              {message.copyable && (
                <button
                  onClick={handleCopyTextResponse}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1 pt-1 min-h-[24px]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'تم النسخ!' : 'نسخ الإجابة'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseListItem({ item, selectedProgram, onSelectCourse }) {
  const displayCode = (item.codes_by_program && item.codes_by_program[selectedProgram]) || item.code;
  const reqInfo = (item.requirements_by_program && item.requirements_by_program[selectedProgram]) || {
    label_ar: item.requirement_type_ar || 'إجباري'
  };

  return (
    <button
      onClick={() => onSelectCourse(item)}
      className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200/90 rounded-2xl text-right transition flex items-center justify-between group"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono font-bold text-xs px-2 py-0.5 bg-slate-900 text-white rounded dir-ltr">
            {displayCode}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded-full">
            {reqInfo.label_ar}
          </span>
        </div>
        <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">
          {item.name_ar} <span className="text-xs font-semibold text-slate-600">({reqInfo.label_ar})</span>
        </div>
        <div className="text-[11px] font-mono text-slate-400 dir-ltr text-right">
          {item.name_en} ({item.credit_hours} ساعات)
        </div>
      </div>
      <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:-translate-x-1 transition shrink-0" />
    </button>
  );
}
