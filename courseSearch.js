// Smart Arabic + English Fuzzy Search & Deterministic Intent Detection Engine for FCI-ZU Curriculum

export function normalizeText(text) {
  if (!text) return '';
  let str = text.toLowerCase();
  
  // Convert Eastern Arabic-Indic digits (٠-٩) to Western digits (0-9)
  str = str.replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));

  // Normalize Arabic letters
  str = str
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u064B-\u0652]/g, '') // remove tashkeel / diacritics
    .replace(/[-_.,!?()/\\:]/g, ' '); // replace punctuation with spaces

  // Convert standalone Roman numerals to Western digits for consistent course name matching
  str = str
    .replace(/\biii\b/g, '3')
    .replace(/\bii\b/g, '2')
    .replace(/\biv\b/g, '4')
    .replace(/\bvi\b/g, '6')
    .replace(/\bv\b/g, '5')
    .replace(/\bi\b/g, '1');

  str = str.replace(/\s+/g, ' ').trim();

  return str;
}

export function extractNumericTokens(text) {
  if (!text) return [];
  const matches = text.match(/\b\d+\b/g);
  return matches ? matches : [];
}

// Strip Arabic article "ال" from token for flexible matching
export function stripArabicArticle(token) {
  if (token.startsWith('ال') && token.length > 3) {
    return token.slice(2);
  }
  return token;
}

// Normalize Course Codes: "CS 200", "cs 200", "cs-200" -> "CS200"
export function normalizeCode(codeStr) {
  if (!codeStr) return '';
  return codeStr.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Levenshtein Distance similarity score (0.0 to 1.0)
export function calculateSimilarity(str1, str2) {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);

  if (s1 === s2) return 1.0;
  if (!s1 || !s2) return 0.0;

  const len1 = s1.length;
  const len2 = s2.length;
  const maxLen = Math.max(len1, len2);

  const matrix = Array.from({ length: len1 + 1 }, () => new Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const distance = matrix[len1][len2];
  return 1.0 - distance / maxLen;
}

// Character-level & stem fuzzy token similarity
export function calculateTokenCharacterSimilarity(qTok, candTok) {
  if (!qTok || !candTok) return 0;
  if (qTok === candTok) return 1.0;

  const sQ = stripArabicArticle(qTok.toLowerCase());
  const sC = stripArabicArticle(candTok.toLowerCase());

  if (sQ === sC) return 1.0;
  if (!sQ || !sC) return 0;

  // Prevent character-level fuzzy matching for tokens shorter than 3 characters
  if (sQ.length < 3 || sC.length < 3) {
    return (sQ === sC || qTok === candTok) ? 1.0 : 0;
  }

  // 1. Direct Levenshtein similarity on raw or article-stripped strings
  const levRaw = calculateSimilarity(qTok, candTok);
  const levStripped = calculateSimilarity(sQ, sC);
  let bestSim = Math.max(levRaw, levStripped);

  if (bestSim >= 0.80) return bestSim;

  // 2. Common Prefix & Stem Similarity (e.g. "رياضه" vs "رياضيات")
  let commonPrefixLen = 0;
  const maxLen = Math.min(sQ.length, sC.length);
  while (commonPrefixLen < maxLen && sQ[commonPrefixLen] === sC[commonPrefixLen]) {
    commonPrefixLen++;
  }

  if (commonPrefixLen >= 3) {
    const minTokenLen = Math.min(sQ.length, sC.length);
    const prefixRatio = commonPrefixLen / minTokenLen;
    // If they share at least 3 characters covering >= 70% of shorter token
    if (prefixRatio >= 0.70) {
      const stemScore = 0.85;
      bestSim = Math.max(bestSim, stemScore);
    }
  }

  // 3. Substring / Sub-token Inclusion (e.g. "رسم" inside "الرسم" or "حاسب" inside "بالحاسب")
  if (sQ.length >= 3 && sC.length >= 3) {
    if (sC.includes(sQ) || sQ.includes(sC)) {
      const lenRatio = Math.min(sQ.length, sC.length) / Math.max(sQ.length, sC.length);
      const subScore = 0.80 + 0.15 * lenRatio;
      bestSim = Math.max(bestSim, subScore);
    }
  }

  return bestSim;
}

export function getDatasetProgramKey(progId) {
  if (progId === 'GIS') return 'GI';
  return progId || 'GENERAL';
}

export function isCourseInProgram(course, targetProgram) {
  if (!course || !course.programs) return false;
  if (targetProgram === 'GENERAL') {
    return (
      course.programs.includes('GENERAL') ||
      course.programs.includes('ALL') ||
      course.programs.length >= 5 ||
      (course.note && /general|university|faculty/i.test(course.note))
    );
  }
  const dsKey = getDatasetProgramKey(targetProgram);
  return (
    course.programs.includes(dsKey) ||
    course.programs.includes(targetProgram) ||
    course.programs.includes('ALL')
  );
}

export function getCourseRequirementLabel(course, selectedProgram) {
  if (!course) return 'إجباري';
  const dsKey = getDatasetProgramKey(selectedProgram);

  if (selectedProgram === 'GENERAL') {
    if (course.requirements_by_program && course.requirements_by_program.GENERAL) {
      return course.requirements_by_program.GENERAL.label_ar || 'إجباري';
    }
    if (isCourseInProgram(course, 'GENERAL')) {
      return 'إجباري';
    }
    return 'عام';
  }

  if (course.requirements_by_program && course.requirements_by_program[dsKey]) {
    return course.requirements_by_program[dsKey].label_ar || 'إجباري';
  }
  if (course.requirements_by_program && course.requirements_by_program[selectedProgram]) {
    return course.requirements_by_program[selectedProgram].label_ar || 'إجباري';
  }
  if (course.requirement_type_ar) return course.requirement_type_ar;
  return course.requirement_type === 'elective' ? 'اختياري' : 'إجباري';
}

import { matchAcademicRuleIntent } from './academicRules.js';

export function detectQueryIntent(rawQuery, selectedProgram) {
  const norm = normalizeText(rawQuery);
  const normCode = normalizeCode(rawQuery);

  // 0. Check for Academic Rules Intent
  const academicRuleIntent = matchAcademicRuleIntent(norm, rawQuery);
  if (academicRuleIntent) {
    return academicRuleIntent;
  }

  // 1. Check for Academic Level indicators (matching normalized form where ى->ي and ة->ه)
  let detectedLevel = null;
  if (/(اولي|اول|الاولى|الاول|سنه اولي|فرقه اولي|فرقة اولى|المستوي الاول|المستوى الاول|first year|level 1|level1)/.test(norm)) {
    detectedLevel = 1;
  } else if (/(تانيه|تاني|ثانيه|ثاني|الثانيه|التانيه|الثاني|التاني|سنه تانيه|فرقه تانيه|فرقة ثانية|المستوي الثاني|المستوى الثاني|second year|level 2|level2)/.test(norm)) {
    detectedLevel = 2;
  } else if (/(تالته|تالت|ثالثه|ثالث|الثالثه|التالته|الثالث|التالث|سنه تالته|فرقه تالته|فرقة ثالثة|المستوي الثالث|المستوى الثالث|third year|level 3|level3)/.test(norm)) {
    detectedLevel = 3;
  } else if (/(رابعه|رابع|الرابعه|الرابع|سنه رابعه|فرقه رابعه|فرقة رابعة|المستوي الرابع|المستوى الرابع|fourth year|level 4|level4)/.test(norm)) {
    detectedLevel = 4;
  }

  // 2. Check Requirement Type indicators
  let detectedReqType = 'ALL';
  if (/(اجباري|إجباري|الاجباري|الإجباري|اجبارية|إجبارية|الزامي|إلزامي|compulsory)/.test(norm)) {
    detectedReqType = 'compulsory';
  } else if (/(اختياري|الاختياري|اختيارية|مواد اختيارية|elective)/.test(norm)) {
    detectedReqType = 'elective';
  }

  // 3. Check for List Question Signals
  const isListQuery =
    detectedLevel !== null ||
    /(مواد|مقررات|خطه|خطة|جدول|احسن مواد|courses|subjects|what courses)/.test(norm);

  // 4. Check for explicit Program Overrides in query
  let overrideProgram = null;
  if (/\b(في cs|قسم cs|علوم الحاسب)\b/.test(norm)) overrideProgram = 'CS';
  else if (/\b(في is|قسم is|نظم المعلومات)\b/.test(norm)) overrideProgram = 'IS';
  else if (/\b(في gi|في gis|قسم gi|قسم gis|الجيومعلوماتية)\b/.test(norm)) overrideProgram = 'GIS';
  else if (/\b(في it|قسم it|تكنولوجيا المعلومات)\b/.test(norm)) overrideProgram = 'IT';
  else if (/\b(في ds|قسم ds|دعم القرار)\b/.test(norm)) overrideProgram = 'DS';
  else if (/\b(عام|العامة|المواد العامة|general)\b/.test(norm)) overrideProgram = 'GENERAL';

  // If list signals are present and not a specific course code search
  if (isListQuery && !/^[a-z]{2}\d{3}$/i.test(normCode)) {
    return {
      type: 'COURSE_LIST',
      level: detectedLevel,
      reqType: detectedReqType,
      targetProgram: overrideProgram || selectedProgram,
    };
  }

  // 5. Check Single Course Action Question Signals
  if (/(المواد اللي قبل|اي اللي قبل|ايه اللي قبل|ما هي متطلبات|متطلبات|قبل|prerequisites of|prerequisites|before)/.test(norm)) {
    const cleanedQuery = norm.replace(/(المواد اللي قبل|اي اللي قبل|ايه اللي قبل|ما هي متطلبات|متطلبات|قبل|prerequisites of|prerequisites|before)/g, '').trim();
    return { type: 'PREREQUISITES', searchQuery: cleanedQuery || rawQuery };
  }

  if (/(الماده اللي بعدها|المواد اللي بعدها|بتفتح ايه|تفتح ايه|ماذا يفتح|يفتح ايه|تفتح كام|what does|unlocks of|unlocks|unlock|after)/.test(norm)) {
    const cleanedQuery = norm.replace(/(الماده اللي بعدها|المواد اللي بعدها|بتفتح ايه|تفتح ايه|ماذا يفتح|يفتح ايه|تفتح كام|what does|unlocks of|unlocks|unlock|after)/g, '').trim();
    return { type: 'DIRECT_UNLOCKS', searchQuery: cleanedQuery || rawQuery };
  }

  if (/(مسار|شجرة|المسار الكامل|full path|tree)/.test(norm)) {
    const cleanedQuery = norm.replace(/(مسار|شجرة|المسار الكامل|full path|tree)/g, '').trim();
    return { type: 'FULL_PATH', searchQuery: cleanedQuery || rawQuery };
  }

  if (/(تفاصيل|معلومات|details of|details)/.test(norm)) {
    const cleanedQuery = norm.replace(/(تفاصيل|معلومات|details of|details)/g, '').trim();
    return { type: 'COURSE_DETAILS', searchQuery: cleanedQuery || rawQuery };
  }

  return { type: 'SINGLE_COURSE', searchQuery: rawQuery };
}

// ----------------------------------------------------------------------
// SMART FUZZY SEARCH & SCORING ENGINE
// ----------------------------------------------------------------------

export function smartSearchCourses(query, coursesList, selectedProgram) {
  if (!query || !query.trim()) return { matches: [], confidence: 'NONE' };

  const rawQuery = query.trim();
  const normQuery = normalizeText(rawQuery);
  const normCodeQuery = normalizeCode(rawQuery);

  const queryTokens = normQuery.split(' ').filter(Boolean);
  const strippedQueryTokens = queryTokens.map(stripArabicArticle);
  const queryNumTokens = extractNumericTokens(normQuery);

  const isPureNumericQuery = queryTokens.length > 0 && queryTokens.every((t) => /^\d+$/.test(t));
  const hasTextTokens = queryTokens.some((t) => !/^\d+$/.test(t));

  const scoredCourses = coursesList.map((course) => {
    let score = 0;

    // Check code in main code or program alias code
    const dsKey = getDatasetProgramKey(selectedProgram);
    const programCode = (course.codes_by_program && (course.codes_by_program[dsKey] || course.codes_by_program[selectedProgram])) || course.code;
    const normCourseCode = normalizeCode(course.code);
    const normProgCode = normalizeCode(programCode);

    const normAr = normalizeText(course.name_ar);
    const normEn = normalizeText(course.name_en);

    // SIGNAL 1: Exact Normalized Course Code (Score 100)
    if (normCodeQuery && (normCourseCode === normCodeQuery || normProgCode === normCodeQuery)) {
      score = 100;
    }
    // SIGNAL 2: Exact Name Match (Score 95)
    else if (normAr === normQuery || normEn === normQuery) {
      score = 95;
    }
    // Pure numeric queries (e.g. "2") without course code match do NOT match text names
    else if (isPureNumericQuery) {
      score = 0;
    }
    else {
      // SIGNAL 3: Token Overlap & Character-Level Fuzzy Matching
      const arTokens = normAr.split(' ').filter(Boolean);
      const enTokens = normEn.split(' ').filter(Boolean);
      const strippedArTokens = arTokens.map(stripArabicArticle);

      let matchedTokenCount = 0;
      queryTokens.forEach((qTok, i) => {
        const strippedQTok = strippedQueryTokens[i];

        // Check exact token or stripped article token
        const matchArExact = arTokens.some((t, idx) => t === qTok || strippedArTokens[idx] === strippedQTok);
        const matchEnExact = enTokens.some((t) => t === qTok);

        if (matchArExact || matchEnExact) {
          matchedTokenCount += 1.0;
        } else {
          // Check character-level fuzzy token match (Skip pure numeric tokens)
          if (!/^\d+$/.test(qTok)) {
            let bestTokSim = 0;
            arTokens.forEach((t) => {
              if (!/^\d+$/.test(t)) {
                const sim = calculateTokenCharacterSimilarity(qTok, t);
                if (sim > bestTokSim) bestTokSim = sim;
              }
            });
            enTokens.forEach((t) => {
              if (!/^\d+$/.test(t)) {
                const sim = calculateTokenCharacterSimilarity(qTok, t);
                if (sim > bestTokSim) bestTokSim = sim;
              }
            });

            if (bestTokSim >= 0.70) {
              matchedTokenCount += bestTokSim;
            }
          }
        }
      });

      if (queryTokens.length > 0) {
        const tokenRatio = matchedTokenCount / queryTokens.length;
        if (tokenRatio >= 0.99) {
          score = 88;
        } else if (tokenRatio >= 0.66) {
          score = 75 + Math.round(tokenRatio * 10);
        } else if (tokenRatio >= 0.5) {
          score = 65;
        }
      }

      // SIGNAL 4: Partial Substring Match (Score 70..80)
      if (score < 70 && hasTextTokens) {
        if (normAr.includes(normQuery) || normEn.includes(normQuery)) {
          score = 75;
        } else if (normQuery.length >= 3 && (normCourseCode.includes(normCodeQuery) || normProgCode.includes(normCodeQuery))) {
          score = 72;
        }
      }

      // SIGNAL 5: Full String Fuzzy Similarity (Levenshtein)
      if (score < 60 && hasTextTokens) {
        const simAr = calculateSimilarity(normAr, normQuery);
        const simEn = calculateSimilarity(normEn, normQuery);
        const maxSim = Math.max(simAr, simEn);

        if (maxSim >= 0.75) {
          score = Math.round(maxSim * 80);
        }
      }
    }

    // NUMERIC TOKEN CONSISTENCY ENFORCEMENT & PENALTY
    // If query contains numeric tokens (e.g. "1", "2", "3", "200") and score > 0
    if (queryNumTokens.length > 0 && score > 0 && normCourseCode !== normCodeQuery && normProgCode !== normCodeQuery) {
      const candArNums = extractNumericTokens(normAr);
      const candEnNums = extractNumericTokens(normEn);
      const candNameNums = Array.from(new Set([...candArNums, ...candEnNums]));

      // If candidate course has numbers in its name (e.g. ["1"] for Mathematics 1)
      if (candNameNums.length > 0) {
        const hasMatchingNum = queryNumTokens.some((qNum) => candNameNums.includes(qNum));
        if (!hasMatchingNum) {
          // Explicit numeric mismatch (e.g., query requested "2", candidate name has "1")
          score = Math.max(0, score - 70); // Heavily penalize so wrong numeric candidate is eliminated
        }
      } else {
        // Candidate course has no numeric tokens in name, but query explicitly asked for a number
        score = Math.max(0, score - 20);
      }
    }

    // Boost score slightly if course belongs to currently selected program
    const isProgramMatch = isCourseInProgram(course, selectedProgram);
    if (isProgramMatch && score > 0) {
      score += 2;
    }

    return { course, score };
  });

  // Filter out non-matching candidates (score < 50) and sort descending
  const validScored = scoredCourses.filter((item) => item.score >= 50).sort((a, b) => b.score - a.score);

  if (validScored.length === 0) {
    return { matches: [], confidence: 'NONE' };
  }

  const topScore = validScored[0].score;

  // Determine Confidence Level
  if (topScore >= 85) {
    // High confidence single match or top tier candidates
    const topMatches = validScored.filter((item) => item.score >= topScore - 5).map((item) => item.course);
    return {
      matches: topMatches,
      confidence: topMatches.length === 1 ? 'HIGH' : 'MEDIUM_DISAMBIGUATION',
      topScore,
    };
  } else if (topScore >= 60) {
    // Medium confidence ("هل تقصد؟") candidates
    const candidates = validScored.slice(0, 3).map((item) => item.course);
    return {
      matches: candidates,
      confidence: 'MEDIUM_SUGGESTION',
      topScore,
    };
  }

  return {
    matches: validScored.slice(0, 3).map((item) => item.course),
    confidence: 'LOW',
    topScore,
  };
}

// ----------------------------------------------------------------------
// COURSE LIST QUERY ENGINE
// ----------------------------------------------------------------------

export function getCoursesListForQuery({ level, reqType, targetProgram }, coursesList) {
  const dsKey = getDatasetProgramKey(targetProgram);

  const filtered = coursesList.filter((course) => {
    // 1. Program match
    const inProg = isCourseInProgram(course, targetProgram);
    if (!inProg) return false;

    // 2. Level match
    if (level !== null && course.level !== level) {
      return false;
    }

    // 3. Requirement type match based on selected program
    if (reqType !== 'ALL') {
      if (targetProgram === 'GENERAL') {
        if (reqType === 'compulsory') return true;
      } else {
        const pReq = course.requirements_by_program && (course.requirements_by_program[dsKey] || course.requirements_by_program[targetProgram]);
        if (!pReq || pReq.type !== reqType) {
          return false;
        }
      }
    }

    return true;
  });

  // Sort by Level then Course Code
  filtered.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.code.localeCompare(b.code);
  });

  // Calculate totals
  const totalCoursesCount = filtered.length;
  const totalCreditHours = filtered.reduce((acc, c) => acc + (c.credit_hours || 0), 0);

  // Group by compulsory vs elective if reqType is ALL
  const compulsoryCourses = [];
  const electiveCourses = [];

  filtered.forEach((c) => {
    if (targetProgram === 'GENERAL') {
      compulsoryCourses.push(c);
    } else {
      const pReq = c.requirements_by_program && (c.requirements_by_program[dsKey] || c.requirements_by_program[targetProgram]);
      if (pReq && pReq.type === 'compulsory') {
        compulsoryCourses.push(c);
      } else {
        electiveCourses.push(c);
      }
    }
  });

  return {
    courses: filtered,
    totalCoursesCount,
    totalCreditHours,
    compulsoryCourses,
    electiveCourses,
    targetProgram,
    level,
    reqType,
  };
}

// Legacy export compatibility for simple search
export function searchCourses(query, coursesList, selectedProgram) {
  const result = smartSearchCourses(query, coursesList, selectedProgram);
  return result.matches;
}

// Format course text for clean clipboard copying
export function formatCourseForCopy(course, courseMap, selectedProgram) {
  const reqInfo = (course.requirements_by_program && course.requirements_by_program[selectedProgram]) || {
    label_ar: course.requirement_type_ar || 'إجباري',
    label_en: course.requirement_type_en || 'Compulsory'
  };

  const reqCategory = (course.elective_category_by_program && course.elective_category_by_program[selectedProgram]) || course.elective_category;
  const displayCode = (course.codes_by_program && course.codes_by_program[selectedProgram]) || course.code;

  let text = `مادة: ${course.name_ar}
${course.name_en}
كود المادة: ${displayCode}
الساعات المعتمدة: ${course.credit_hours} ساعات (${course.lecture_hours} محاضرة + ${course.lab_hours} تمارين/عملي)
المستوى الدراسي: المستوى ${course.level} (السنة ${getLevelNameAr(course.level)})
النوع: ${reqInfo.label_ar} — ${reqInfo.label_en}`;

  if (reqCategory) {
    text += `\nالمجموعة الاختيارية: ${reqCategory}`;
  }

  // Prerequisites
  const prereqs = (course.prerequisites || []).map((code) => courseMap[code]).filter(Boolean);
  text += `\n\nالمتطلبات السابقة (Required Before):`;
  if (prereqs.length > 0) {
    prereqs.forEach((p) => {
      text += `\n- ${p.code} — ${p.name_ar} (${p.name_en})`;
    });
  } else {
    text += `\n- لا توجد متطلبات سابقة (متاح للتسجيل المباشر)`;
  }

  // Direct Unlocks
  const unlocks = (course.unlocks || []).map((code) => courseMap[code]).filter(Boolean);
  text += `\n\nالمواد التي تفتحها مباشرة (Unlocks Next):`;
  if (unlocks.length > 0) {
    unlocks.forEach((u) => {
      text += `\n- ${u.code} — ${u.name_ar} (${u.name_en})`;
    });
  } else {
    text += `\n- لا تتوقف عليها مواد أخرى لاحقاً في الخطة`;
  }

  return text;
}

function getLevelNameAr(level) {
  switch (level) {
    case 1: return 'الأولى';
    case 2: return 'الثانية';
    case 3: return 'الثالثة';
    case 4: return 'الرابعة';
    default: return `${level}`;
  }
}
