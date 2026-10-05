// Academic Rules Static Data & Intent Engine for FCI-ZU Curriculum App

export const ACADEMIC_RULES_DATA = {
  transferRequirements: [
    {
      fromLevel: 1,
      toLevel: 2,
      fromNameAr: 'الفرقة الأولى',
      toNameAr: 'الفرقة الثانية',
      requiredCredits: 28,
      answerAr: 'الانتقال من الفرقة الأولى إلى الفرقة الثانية يتطلب اجتياز 28 ساعة معتمدة.'
    },
    {
      fromLevel: 2,
      toLevel: 3,
      fromNameAr: 'الفرقة الثانية',
      toNameAr: 'الفرقة الثالثة',
      requiredCredits: 60,
      answerAr: 'الانتقال من الفرقة الثانية إلى الفرقة الثالثة يتطلب اجتياز 60 ساعة معتمدة.'
    },
    {
      fromLevel: 3,
      toLevel: 4,
      fromNameAr: 'الفرقة الثالثة',
      toNameAr: 'الفرقة الرابعة',
      requiredCredits: 92,
      answerAr: 'الانتقال من الفرقة الثالثة إلى الفرقة الرابعة يتطلب اجتياز 92 ساعة معتمدة.'
    }
  ],
  generalTransferSummaryAr: `متطلبات الانتقال بين الفرق الدراسية:
• من الفرقة الأولى إلى الثانية: 28 ساعة معتمدة.
• من الفرقة الثانية إلى الثالثة: 60 ساعة معتمدة.
• من الفرقة الثالثة إلى الرابعة: 92 ساعة معتمدة.`,

  gpaDismissal: {
    gpaThreshold: 2.00,
    semestersAllowed: 4,
    answerAr: 'إذا كان الـGPA أقل من 2.00 لمدة 4 فصول دراسية، يكون الطالب معرضًا للفصل الأكاديمي وفقًا لهذه القاعدة. وإذا انتقل الطالب من فرقة دراسية إلى فرقة أعلى خلال فترة الاحتساب، يبدأ احتساب الأربع فصول من جديد (يتصفر العداد عند الانتقال لفرقة أعلى).'
  },

  regularSemesterHours: {
    lowGpaMax: 12,
    highGpaMax: 18,
    answerAr: `الحد الأقصى لتسجيل الساعات في الفصل الدراسي العادي حسب الـGPA:
• إذا كان الـGPA أقل من 2.00: الحد المتاح للتسجيل هو 12 ساعة معتمدة (حوالي 4 مواد).
• إذا كان الـGPA يساوي 2.00 أو أكثر: الحد المتاح للتسجيل هو 18 ساعة معتمدة.`
  },

  summerSemester: {
    isOptional: true,
    answerAr: 'لا، الفصل الصيفي (Summer) اختياري وليس إجباريًا. ويأتي بعد انتهاء السنة الدراسية وقبل بداية السنة الدراسية التالية، وهو فصل مستقل ولا يحسب ضمن الفصول الدراسية الأساسية الثمانية.'
  },

  summerHours: {
    level123Max: 9,
    level4GraduationMax: 12,
    answerAr: `عدد الساعات المسموح بتسجيلها في الفصل الصيفي:
• الفرقة الأولى والثانية والثالثة: الحد الأقصى 9 ساعات معتمدة.
• الفرقة الرابعة / حالات التخرج: الحد الأقصى 12 ساعة معتمدة.`
  },

  yearStructure: {
    totalYears: 4,
    mainSemestersPerYear: 2,
    totalMainSemesters: 8,
    answerAr: 'تحتوي السنة الدراسية على فصلين دراسيين أساسيين (ترم أول وترم ثاني)، والبرنامج الأكاديمي يتكون من 4 سنوات (إجمالي 8 فصول دراسية أساسية). بالإضافة إلى فصل صيفي اختياري مستقل بعد انتهاء كل سنة دراسية لا يحسب ضمن الـ8 فصول الأساسية.'
  }
};

/**
 * Match Academic Rule Intent based on normalized query text and raw query string.
 * Returns an intent object if matched, or null if query is not an academic rule.
 */
export function matchAcademicRuleIntent(normQuery, rawQuery) {
  if (!normQuery) return null;
  const rawLower = (rawQuery || '').toLowerCase().trim();
  const text = normQuery.toLowerCase().trim();

  // Safeguard 1: Explicit course code search (e.g., "CS200", "IS100", "CS 100") -> Not an Academic Rule
  if (/\b[a-z]{2}\s*\d{3}\b/i.test(rawLower)) {
    return null;
  }

  // Helper regex patterns for level names (accounting for normText where ة -> ه, أ/إ/آ -> ا)
  const L1 = '(اولى|أولى|الاولى|الأولى|first year|year 1|level 1)';
  const L2 = '(تانية|تانيه|ثانية|ثانيه|الثانية|الثانيه|التانية|التانيه|second year|year 2|level 2)';
  const L3 = '(تالتة|تالته|ثالثة|ثالثه|الثالثة|الثالثه|التالتة|التالته|third year|year 3|level 3)';
  const L4 = '(رابعة|رابعه|الرابعة|الرابعه|fourth year|year 4|level 4)';

  // 1. REGULAR SEMESTER HOURS BY GPA (حد التسجيل في الفصل العادي حسب الـ GPA)
  if ((/(gpa|معدل|1\.8|2\.5)/i.test(text) || /(الحد الاقصى للساعات|الحد الأقصى للساعات)/i.test(text)) &&
      /(اسجل|أسجل|اخد|أخد|تسجيل|ساعة|ساعه|ساعات|مادة|ماده|مواد|hours|credits)/i.test(text) &&
      !/(صيفي|summer|فصل|تفصل|يتفصل|dismissed|dismissal)/i.test(text)) {
    if (/(اقل من 2|أقل من 2|below 2|1\.8|less than 2)/i.test(text)) {
      return {
        type: 'ACADEMIC_RULES',
        subType: 'REGULAR_SEMESTER_HOURS',
        gpaCase: 'LOW',
        answer: 'إذا كان الـGPA أقل من 2.00، فإن الحد المتاح للتسجيل في الفصل الدراسي العادي هو 12 ساعة معتمدة (حوالي 4 مواد).',
      };
    }
    if (/(فوق 2|2 او اكتر|2 أو أكتر|أكتر من 2|اكتر من 2|2\.5|above 2|higher than 2)/i.test(text)) {
      return {
        type: 'ACADEMIC_RULES',
        subType: 'REGULAR_SEMESTER_HOURS',
        gpaCase: 'HIGH',
        answer: 'إذا كان الـGPA يساوي 2.00 أو أكثر، فإن الحد المتاح للتسجيل في الفصل الدراسي العادي هو 18 ساعة معتمدة.',
      };
    }
    return {
      type: 'ACADEMIC_RULES',
      subType: 'REGULAR_SEMESTER_HOURS',
      answer: ACADEMIC_RULES_DATA.regularSemesterHours.answerAr,
    };
  }

  // 2. GPA DISMISSAL RULES & COUNTER RESET (الفصل الأكاديمي وتصفير العداد عند الانتقال لفرقة أعلى)
  // Check this BEFORE Transfer Requirements so questions about "عداد الأربع فصول" or "count reset" match dismissal
  if (/(يتفصل|تفصل|أتفصل|اتفصل|فصل|dismissed|dismissal|العداد|عداد|بيتصفر|يتصفر|يبدا من جديد|يبدأ من جديد|عداد الأربع|عداد الاربع|اربع ترمات|أربع ترمات|4 ترمات|4 فصول|اربع فصول|أربع فصول|reset)/i.test(text) ||
      (/(gpa|معدل)/i.test(text) && /(فصل|تفصل|افصل|أفصل|سنتين|العد|العداد|انتقال|يبدأ من جديد|يبدا من جديد|dismissed|reset)/i.test(text)) ||
      /(gpa اقل من 2|gpa أقل من 2|gpa below 2|below 2 gpa|semesters below 2)/i.test(text)) {
    return {
      type: 'ACADEMIC_RULES',
      subType: 'GPA_DISMISSAL',
      answer: ACADEMIC_RULES_DATA.gpaDismissal.answerAr,
    };
  }

  // 3. TRANSFER REQUIREMENTS (متطلبات الانتقال بين الفرق)
  const isTransferKeyword = /(انتقال|أنقل|انقل|أطلع|اطلع|شروط الانتقال|متطلبات الانتقال|move from|move to|reach fourth|reach 4th|required for second|to move from|credits for second)/i.test(text);
  const isCreditHourLevelQuery = /(كام ساعة|كم ساعة|كام ساعه|كم ساعه|محتاج كام|credit|credits|hours)/i.test(text) &&
    new RegExp(`${L1}|${L2}|${L3}|${L4}`, 'i').test(text) &&
    !/(صيفي|summer|مادة|ماده|gpa|معدل)/i.test(text);

  if (isTransferKeyword || isCreditHourLevelQuery) {
    // Level 1 -> 2
    if (new RegExp(`${L1}.*${L2}`, 'i').test(text) ||
        /(من اولى لتانية|من اولى لتانيه|من الأولى للثانية|من الاولى للثانية|من اولى الى تانية|من اولى الى تانيه|الانتقال لتانية|الانتقال لتانيه|الانتقال للثانية|الانتقال للثانيه|شروط تانية|شروط تانيه|شروط الفرقة الثانية)/i.test(text) ||
        /(move from first|to second year|credits for second year|required for second year)/i.test(text)) {
      return {
        type: 'ACADEMIC_RULES',
        subType: 'TRANSFER_REQUIREMENTS',
        targetLevel: 2,
        answer: ACADEMIC_RULES_DATA.transferRequirements[0].answerAr,
      };
    }

    // Level 2 -> 3
    if (new RegExp(`${L2}.*${L3}`, 'i').test(text) ||
        /(من تانية لتالتة|من تانية لتالته|من تانيه لتالتة|من تانيه لتالته|من الثانية للثالثة|من الثانيه للثالثه|الانتقال لتالتة|الانتقال لتالته|الانتقال للثالثة|الانتقال للثالثه|شروط تالتة|شروط تالته|شروط الفرقة الثالثة)/i.test(text) ||
        /(move from year 2|to year 3|to third year|move from 2 to 3)/i.test(text)) {
      return {
        type: 'ACADEMIC_RULES',
        subType: 'TRANSFER_REQUIREMENTS',
        targetLevel: 3,
        answer: ACADEMIC_RULES_DATA.transferRequirements[1].answerAr,
      };
    }

    // Level 3 -> 4
    if (new RegExp(`${L3}.*${L4}`, 'i').test(text) ||
        /(من تالتة لرابعة|من تالته لرابعه|من الثالثة للرابعة|من الثالثة للرابعه|من تالتة الى رابعة|الانتقال لرابعة|الانتقال لرابعه|الانتقال للرابعة|الانتقال للرابعه|شروط رابعة|شروط رابعه|نوصل رابعة|نوصل رابعه|شروط الفرقة الرابعة)/i.test(text) ||
        /(reach fourth|reach 4th|to fourth year|to year 4|reach 4)/i.test(text)) {
      return {
        type: 'ACADEMIC_RULES',
        subType: 'TRANSFER_REQUIREMENTS',
        targetLevel: 4,
        answer: ACADEMIC_RULES_DATA.transferRequirements[2].answerAr,
      };
    }

    // Generic transfer query
    return {
      type: 'ACADEMIC_RULES',
      subType: 'TRANSFER_REQUIREMENTS',
      targetLevel: null,
      answer: ACADEMIC_RULES_DATA.generalTransferSummaryAr,
    };
  }

  // 4. SUMMER SEMESTER MANDATORY OR TIMING (هل الصيفي إجباري؟ ومتى يكون؟)
  if (/(صيفي|summer)/i.test(text) && /(اجباري|إجباري|اختياري|لازم|mandatory|optional|امتى|امتي|متى|متي|يكون|بعد انهي|ترمين اساسيين|جزء من)/i.test(text)) {
    return {
      type: 'ACADEMIC_RULES',
      subType: 'SUMMER_SEMESTER',
      answer: ACADEMIC_RULES_DATA.summerSemester.answerAr,
    };
  }

  // 5. SUMMER MAX CREDIT HOURS (ساعات الفصل الصيفي)
  if (/(صيفي|summer)/i.test(text) && /(كام ساعة|كم ساعة|كام ساعه|كم ساعه|عدد ساعات|ساعات|حالة تخرج|حاله تخرج|رابعة|رابعه|اولى|أولى|تانية|تانيه|تالتة|تالته|hours|credits)/i.test(text)) {
    if (/(رابعة|رابعه|تخرج|graduation|fourth|4th)/i.test(text)) {
      return {
        type: 'ACADEMIC_RULES',
        subType: 'SUMMER_HOURS',
        targetLevel: 4,
        answer: 'في الفصل الصيفي للفرقة الرابعة وحالات التخرج: الحد الأقصى المسموح به هو 12 ساعة معتمدة.',
      };
    }
    if (/(اولى|أولى|تانية|تانيه|ثانية|ثانيه|تالتة|تالته|ثالثة|ثالثه|first|second|third)/i.test(text)) {
      return {
        type: 'ACADEMIC_RULES',
        subType: 'SUMMER_HOURS',
        targetLevel: 1,
        answer: 'في الفصل الصيفي للفرق الأولى والثانية والثالثة: الحد الأقصى المسموح به هو 9 ساعات معتمدة.',
      };
    }
    return {
      type: 'ACADEMIC_RULES',
      subType: 'SUMMER_HOURS',
      answer: ACADEMIC_RULES_DATA.summerHours.answerAr,
    };
  }

  // 6. ACADEMIC YEAR & SEMESTER STRUCTURE (عدد الفصول الدراسية)
  if (/(السنة فيها كام|فيها كام ترم|كام ترم اساسيات|كام ترم أساسي|كام ترم في الاربع|كام ترم في الأربع|8 ترمات|فصول دراسية في السنة|عدد الفصول)/i.test(text) ||
      (/(كام ترم|كم ترم|كم فصل|عدد الترمات)/i.test(text) && /(سنة|سنوات|البرنامج|الأربع|الاربع)/i.test(text))) {
    return {
      type: 'ACADEMIC_RULES',
      subType: 'ACADEMIC_YEAR_STRUCTURE',
      answer: ACADEMIC_RULES_DATA.yearStructure.answerAr,
    };
  }

  return null;
}
