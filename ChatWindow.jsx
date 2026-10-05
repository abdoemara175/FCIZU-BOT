import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, RefreshCw, Bot, ChevronDown } from 'lucide-react';
import ChatMessage from './ChatMessage.jsx';
import {
  searchCourses,
  smartSearchCourses,
  detectQueryIntent,
  getCoursesListForQuery,
} from './courseSearch.js';
import { PROGRAM_OPTIONS } from './ProgramSelector.jsx';

const PREDEFINED_SUGGESTION_POOL = [
  { label: 'إيه مواد الفرقة الأولى الإجباري؟', query: 'إيه مواد الفرقة الأولى الإجباري؟' },
  { label: 'كام ساعة عشان أنقل من أولى لتانية؟', query: 'كام ساعة عشان أنقل من أولى لتانية؟' },
  { label: 'مادة Data Structures بتفتح إيه؟', query: 'مادة CS200 بتفتح إيه؟' },
  { label: 'هل الفصل الصيفي إجباري؟', query: 'هل الصيفي إجباري؟' },
  { label: 'إيه متطلبات قواعد البيانات IS200؟', query: 'إيه متطلبات IS200؟' },
  { label: 'لو الـ GPA أقل من 2 أسجل كام ساعة؟', query: 'لو GPA أقل من 2 أقدر أسجل كام ساعة؟' },
  { label: 'المواد الاختيارية في الفرقة الثالثة', query: 'إيه المواد الاختيارية في الفرقة الثالثة؟' },
  { label: 'عدد ساعات الصيفي كام؟', query: 'الصيفي كام ساعة؟' },
  { label: 'اعرضلي المسار الكامل لـ CS202', query: 'المسار الكامل لمادة CS202' },
  { label: 'متى يكون الفصل الصيفي؟', query: 'الصيفي بيكون إمتى؟' },
  { label: 'قاعدة الـ GPA والفصل (أقل من 2)', query: 'لو GPA أقل من 2 كام ترم عشان أفصل؟' },
  { label: 'تفاصيل مادة Software Engineering', query: 'تفاصيل مادة CS300' },
  { label: 'إيه المواد اللي بيفتحها CS102؟', query: 'إيه المواد اللي بيفتحها CS102؟' },
  { label: 'إيه المواد اللي قبل هياكل البيانات؟', query: 'إيه المواد اللي قبل هياكل البيانات؟' },
  { label: 'هياكل البيانات CS200', query: 'CS200' },
  { label: 'الذكاء الاصطناعي CS304', query: 'CS304' },
  { label: 'أمان الشبكات IT402', query: 'IT402' },
  { label: 'مادة بحوث العمليات المتقدمة DS302', query: 'بحوث العمليات المتقدمة' },
  { label: 'البرمجة الهيكلية CS100', query: 'CS100' },
  { label: 'الجيومعلوماتية GI300', query: 'GI300' },
  { label: 'مواد السنة الثانية الإجباري', query: 'مواد السنة الثانية إجباري' },
];

function getRandomSuggestions(count = 6, excludeQueries = []) {
  const candidates = PREDEFINED_SUGGESTION_POOL.filter(
    (item) => !excludeQueries.includes(item.query)
  );
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function ChatWindow({
  coursesData,
  courseMap,
  selectedProgram,
  onOpenProgramSelector,
  onOpenFullFlow,
  onSelectCourse,
  onCopy,
}) {
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState('جاري البحث في اللائحة...');
  const [suggestions, setSuggestions] = useState(() => getRandomSuggestions(6));
  const messagesEndRef = useRef(null);

  const currentProg = PROGRAM_OPTIONS.find((p) => p.id === selectedProgram) || PROGRAM_OPTIONS[0];
  const hasMessages = messages.length > 0;

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (hasMessages) {
      scrollToBottom();
    }
  }, [messages, isTyping, hasMessages]);

  // Handle user query submission
  const handleSendQuery = (queryText) => {
    const q = queryText || inputQuery;
    if (!q || !q.trim()) return;

    const userText = q.trim();
    setInputQuery('');

    // 1. Append user message
    const userMsg = { id: Date.now(), sender: 'user', text: userText };
    setMessages((prev) => [...prev, userMsg]);

    // 2. Detect Intent & Set Intent-based Thinking State
    const intent = detectQueryIntent(userText, selectedProgram);

    let thinkingText = 'جاري البحث في اللائحة الرسمية...';
    let delayMs = 250; // Fast default delay for quick lookups

    if (intent.type === 'COURSE_LIST') {
      thinkingText = 'جاري تحليل الخطة الدراسية وتجميع المقررات...';
      delayMs = 850;
    } else if (intent.type === 'FULL_PATH') {
      thinkingText = 'جاري تتبع شجرة الخطة والمسار الكامل...';
      delayMs = 800;
    } else if (intent.type === 'PREREQUISITES') {
      thinkingText = 'جاري دراسة المتطلبات السابقة المباشرة للمادة...';
      delayMs = 600;
    } else if (intent.type === 'DIRECT_UNLOCKS') {
      thinkingText = 'جاري الكشف عن المقررات الناتجة والمفتوحة...';
      delayMs = 600;
    }

    setThinkingMessage(thinkingText);
    setIsTyping(true);

    // 3. Process Result after thinking delay
    setTimeout(() => {
      setIsTyping(false);

      // SCENARIO 0: Academic Rules Queries
      if (intent.type === 'ACADEMIC_RULES') {
        const ruleMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          type: 'academic_rule',
          text: intent.answer,
          copyable: true,
        };
        setMessages((prev) => [...prev, ruleMsg]);
        return;
      }

      // SCENARIO A: Course List Queries (e.g., "مواد السنة الأولى الإجباري")
      if (intent.type === 'COURSE_LIST') {
        const listData = getCoursesListForQuery(intent, coursesData);
        let levelTitle = '';
        if (intent.level === 1) levelTitle = 'السنة الأولى';
        else if (intent.level === 2) levelTitle = 'السنة الثانية';
        else if (intent.level === 3) levelTitle = 'السنة الثالثة';
        else if (intent.level === 4) levelTitle = 'السنة الرابعة';
        else levelTitle = 'جميع السنوات';

        let reqTitle = '';
        if (intent.reqType === 'compulsory') reqTitle = ' الإجبارية';
        else if (intent.reqType === 'elective') reqTitle = ' الاختيارية';

        const title = `قائمة مواد ${levelTitle}${reqTitle} — برنامج [${intent.targetProgram}]`;

        if (listData.courses.length === 0) {
          const emptyMsg = {
            id: Date.now() + 1,
            sender: 'bot',
            type: 'text',
            text: `لم أجد مواد مطابقة لطلبك في برنامج [${intent.targetProgram}].`,
            copyable: false,
          };
          setMessages((prev) => [...prev, emptyMsg]);
        } else {
          const listMsg = {
            id: Date.now() + 1,
            sender: 'bot',
            type: 'course_list',
            title,
            listData,
          };
          setMessages((prev) => [...prev, listMsg]);
        }
        return;
      }

      // SCENARIO B: Single Course Searches & Action Questions
      const searchQuery = intent.searchQuery || userText;
      const searchResult = smartSearchCourses(searchQuery, coursesData, selectedProgram);

      if (searchResult.confidence === 'HIGH') {
        if (searchResult.matches.length === 1) {
          const course = searchResult.matches[0];
          let initialTab = 'all';
          if (intent.type === 'PREREQUISITES') initialTab = 'prereqs';
          else if (intent.type === 'DIRECT_UNLOCKS') initialTab = 'unlocks';
          else if (intent.type === 'FULL_PATH') initialTab = 'tree';

          const botMsg = {
            id: Date.now() + 1,
            sender: 'bot',
            type: 'course',
            course: course,
            initialTab: initialTab,
          };

          const inProg = course.programs.includes(selectedProgram) || course.programs.includes('ALL');
          if (!inProg) {
            const noticeMsg = {
              id: Date.now() + 2,
              sender: 'bot',
              type: 'text',
              text: `💡 ملاحظة: مادة "${course.name_ar}" (${course.code}) غير مدرجة في خطة برنامج [${currentProg.name_ar}] الحالي.`,
            };
            setMessages((prev) => [...prev, botMsg, noticeMsg]);
          } else {
            setMessages((prev) => [...prev, botMsg]);
          }
        } else {
          // Disambiguation
          const disambigMsg = {
            id: Date.now() + 1,
            sender: 'bot',
            type: 'disambiguation',
            options: searchResult.matches,
          };
          setMessages((prev) => [...prev, disambigMsg]);
        }
      } else if (searchResult.confidence === 'MEDIUM_DISAMBIGUATION') {
        const disambigMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          type: 'disambiguation',
          options: searchResult.matches,
        };
        setMessages((prev) => [...prev, disambigMsg]);
      } else if (searchResult.confidence === 'MEDIUM_SUGGESTION') {
        const suggestionMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          type: 'suggestion',
          options: searchResult.matches,
        };
        setMessages((prev) => [...prev, suggestionMsg]);
      } else {
        // Fallback legacy search
        const legacyResults = searchCourses(userText, coursesData, selectedProgram);
        if (legacyResults.length === 1) {
          const course = legacyResults[0];
          const botMsg = {
            id: Date.now() + 1,
            sender: 'bot',
            type: 'course',
            course: course,
          };
          setMessages((prev) => [...prev, botMsg]);
        } else if (legacyResults.length > 1) {
          const disambigMsg = {
            id: Date.now() + 1,
            sender: 'bot',
            type: 'disambiguation',
            options: legacyResults,
          };
          setMessages((prev) => [...prev, disambigMsg]);
        } else {
          const errorMsg = {
            id: Date.now() + 1,
            sender: 'bot',
            type: 'text',
            text: `لم أجد مادة مطابقة لـ "${userText}".\nجرّب البحث باسم المادة بالعربي (مثال: "هياكل البيانات"), بالإنجليزي (مثال: "Data Structures"), أو الكود (مثال: "CS200"), أو استفسر عن المقررات (مثال: "مواد السنة الأولى إجباري").`,
            copyable: true,
          };
          setMessages((prev) => [...prev, errorMsg]);
        }
      }
    }, delayMs);
  };

  // Direct Course Select from cards or disambiguation -> Open Details Modal
  const handleSelectCourse = (course) => {
    if (onSelectCourse) {
      onSelectCourse(course);
    } else {
      const userMsg = { id: Date.now(), sender: 'user', text: `${course.name_ar} (${course.code})` };
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        type: 'course',
        course: course,
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    const exclude = suggestions.map((s) => s.query);
    setSuggestions(getRandomSuggestions(6, exclude));
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] max-w-4xl mx-auto w-full min-w-0 dir-rtl bg-slate-50 transition-all duration-300">
      {/* Top Banner / Program Status */}
      <div className="bg-white border-b border-slate-200/90 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 shadow-2xs z-10">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] sm:text-xs text-slate-600 font-medium whitespace-nowrap">البرنامج المحدد:</span>
          <button
            onClick={onOpenProgramSelector}
            className="text-[11px] sm:text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 px-2 py-1 rounded-md flex items-center gap-1 min-h-[36px] shrink-0 transition-colors"
          >
            <span>{currentProg.id === 'GENERAL' ? 'General' : currentProg.id}</span>
            <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
          </button>
        </div>

        {hasMessages && (
          <button
            onClick={handleClearChat}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 flex items-center gap-1 transition px-1.5 sm:px-2 py-1 rounded-lg hover:bg-slate-100 min-h-[32px] shrink-0"
            title="مسح المحادثة"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>محادثة جديدة</span>
          </button>
        )}
      </div>

      {/* CHAT AREA: CENTERED INITIAL STATE OR ACTIVE SCROLL CONVERSATION */}
      {!hasMessages ? (
        /* 1. CENTERED EMPTY CHAT STATE */
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 py-8 sm:py-6 max-w-2xl mx-auto w-full min-h-0 animate-fade-in text-center overflow-y-auto">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-inner mb-4 animate-scale-up">
            <MessageSquare className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <h1 className="font-extrabold text-lg sm:text-3xl text-slate-900 tracking-tight leading-tight px-2">
            مساعد مقررات الحاسبات والمعلومات
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md font-medium leading-relaxed">
            أدخل اسم المقرر أو كود المادة لمعرفة متطلباتها والمواد التي تفتحها، أو استفسر عن خطة السنة الدراسية.
          </p>

          {/* MAIN CENTERED COMPOSER FORM */}
          <div className="w-full my-4 sm:my-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendQuery();
              }}
              className="relative w-full shadow-sm hover:shadow-md focus-within:shadow-md transition-all rounded-2xl bg-white border border-slate-200/90 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 p-1.5 flex items-center gap-1.5 sm:gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="ابحث باسم المادة أو الكود (مثل: هياكل البيانات, CS200)..."
                className="w-full min-w-0 pr-3 sm:pr-4 pl-1 py-3 bg-transparent text-[13px] sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium outline-none"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className="w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition shadow-xs shrink-0 min-h-[44px]"
                title="إرسال"
              >
                <Send className="w-5 h-5 dir-rtl:rotate-180" />
              </button>
            </form>
          </div>

          {/* RANDOMIZED SUGGESTION CHIPS */}
          <div className="w-full space-y-2.5 pt-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              استفسارات مقترحة للبدء:
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
              {suggestions.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendQuery(ex.query)}
                  className="px-2.5 sm:px-3.5 py-2.5 rounded-2xl bg-white hover:bg-blue-50/80 active:scale-95 text-slate-700 hover:text-blue-700 font-medium text-[11px] sm:text-xs transition border border-slate-200/80 shadow-2xs flex items-center gap-1.5 min-h-[44px] max-w-full"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>{ex.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 2. ACTIVE CONVERSATION MESSAGES AREA */
        <div className="flex-1 min-h-0 overflow-y-auto px-2.5 sm:px-4 py-3 sm:py-4 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                courseMap={courseMap}
                selectedProgram={selectedProgram}
                onSelectCourse={handleSelectCourse}
                onOpenFullFlow={onOpenFullFlow}
                onCopy={onCopy}
              />
            ))}

            {isTyping && (
              <div className="flex justify-end mb-4 dir-rtl animate-slide-up">
                <div className="flex items-center gap-2.5 bg-white border border-slate-200/90 px-4 py-3 rounded-2xl text-xs text-slate-600 font-medium shadow-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping shrink-0"></span>
                  <span className="font-semibold text-slate-700">{thinkingMessage}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* STICKY BOTTOM COMPOSER (WHEN ACTIVE CONVERSATION) */}
      {hasMessages && (
        <div className="bg-white/90 backdrop-blur-md border-t border-slate-200/90 px-2.5 sm:p-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] sm:pb-4 sticky bottom-0 z-20 animate-slide-up">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
              className="relative max-w-4xl mx-auto flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="اكتب مادة أخرى أو كود (مثل: هياكل البيانات, CS200)..."
              className="w-full min-w-0 pr-3 sm:pr-4 pl-12 py-3 bg-slate-100 focus:bg-white border border-slate-200/90 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl text-[13px] sm:text-sm transition-all outline-none shadow-xs text-slate-900 placeholder:text-slate-400 font-medium"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim()}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-700 active:scale-95 transition shadow-xs shrink-0 min-h-[44px] min-w-[44px]"
              title="إرسال"
            >
              <Send className="w-4 h-4 dir-rtl:rotate-180" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
