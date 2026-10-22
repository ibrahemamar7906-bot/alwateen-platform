/**
 * Unified Question Helper for Al-Goneidy Educational Platform
 * Handles normalization, CSV/Excel parsing, bulk text importing, and cross-component synchronization.
 */

/**
 * Normalizes a single question object to guarantee consistent shape and prevent runtime errors.
 */
export function normalizeQuestion(q) {
  if (!q) return null;

  const text = (q.text || q.question || q.sentence || '').toString().trim();
  const answer = (q.answer || q.correctAnswer || q.correct || '').toString().trim();

  if (!text && !answer) return null;

  // Extract all available options
  let rawOpts = [];
  if (Array.isArray(q.options) && q.options.length > 0) {
    rawOpts = q.options.map(o => (o || '').toString().trim()).filter(Boolean);
  } else {
    const rawList = [
      answer,
      q.w1 || q.wrongOption1 || q.wrong1 || q.rawOptions?.w1,
      q.w2 || q.wrongOption2 || q.wrong2 || q.rawOptions?.w2,
      q.w3 || q.wrongOption3 || q.wrong3 || q.rawOptions?.w3
    ];
    rawOpts = rawList.map(o => (o || '').toString().trim()).filter(Boolean);
  }

  // Remove duplicates while keeping answer
  const uniqueOpts = Array.from(new Set(rawOpts));

  // Ensure correct answer is in options
  if (answer && !uniqueOpts.includes(answer)) {
    uniqueOpts.unshift(answer);
  }

  // Fill up if fewer than 2 options
  if (uniqueOpts.length < 2) {
    uniqueOpts.push('خيار بديل');
  }

  // Extract wrong options for rawOptions
  const wrongOpts = uniqueOpts.filter(o => o !== answer);
  const w1 = wrongOpts[0] || (q.w1 || q.rawOptions?.w1 || 'خيار 1');
  const w2 = wrongOpts[1] || (q.w2 || q.rawOptions?.w2 || 'خيار 2');
  const w3 = wrongOpts[2] || (q.w3 || q.rawOptions?.w3 || 'خيار 3');

  // Shuffle options for the game
  const shuffledOptions = [...uniqueOpts].sort(() => Math.random() - 0.5);

  return {
    text: text || 'سؤال بدون عنوان',
    answer: answer || (uniqueOpts[0] || 'إجابة'),
    options: shuffledOptions,
    rawOptions: {
      w1: (w1 || '').toString().trim(),
      w2: (w2 || '').toString().trim(),
      w3: (w3 || '').toString().trim()
    }
  };
}

/**
 * Normalizes an array of question objects.
 */
export function normalizeQuestions(questions) {
  if (!Array.isArray(questions)) return [];
  return questions.map(normalizeQuestion).filter(Boolean);
}

/**
 * Robust CSV/Excel parser supporting commas, semicolons, tabs, Arabic commas, and quotes.
 */
export function parseQuestionsFromCSV(content) {
  if (!content || typeof content !== 'string') return [];

  // Remove UTF-8 BOM
  let cleanContent = content.replace(/^\uFEFF/, '').trim();
  if (!cleanContent) return [];

  // Split lines while respecting potential quoted multiline entries
  const rawLines = cleanContent.split(/\r?\n/);
  const parsedQuestions = [];

  // Detect delimiter from first line (, ; \t)
  const firstLine = rawLines[0] || '';
  let delimiter = ',';
  if (firstLine.includes(';') && !firstLine.includes(',')) {
    delimiter = ';';
  } else if (firstLine.includes('\t')) {
    delimiter = '\t';
  }

  const parseLine = (text, delim) => {
    // Regex for CSV split handling quotes
    const re = new RegExp(
      `(?:${delim}|\\n|^)("(?:(?:"")*[^"]*)*"|[^"${delim}\\n]*|(?:\n|$))`,
      'g'
    );
    const matches = [];
    let match;
    while ((match = re.exec(text))) {
      let val = match[1] || '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      matches.push(val.trim());
      if (re.lastIndex >= text.length) break;
    }
    return matches.filter((m, idx) => idx < matches.length);
  };

  let startIndex = 0;
  // Check if first row is header
  const lowerFirst = firstLine.toLowerCase();
  if (
    lowerFirst.includes('سؤال') ||
    lowerFirst.includes('question') ||
    lowerFirst.includes('إجابة') ||
    lowerFirst.includes('answer') ||
    lowerFirst.includes('نص')
  ) {
    startIndex = 1;
  }

  for (let i = startIndex; i < rawLines.length; i++) {
    const line = rawLines[i].trim();
    if (!line) continue;

    let cols = [];
    if (line.includes(delimiter)) {
      cols = parseLine(line, delimiter);
    } else if (line.includes('،')) {
      cols = line.split('،').map(c => c.trim().replace(/^"|"$/g, ''));
    } else if (line.includes('|')) {
      cols = line.split('|').map(c => c.trim().replace(/^"|"$/g, ''));
    } else {
      cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    }

    cols = cols.map(c => (c || '').replace(/^"|"$/g, '').trim());

    if (cols.length >= 2 && cols[0] && cols[1]) {
      const qText = cols[0];
      const qAnswer = cols[1];
      const wrongs = cols.slice(2).filter(Boolean);

      const normalized = normalizeQuestion({
        text: qText,
        answer: qAnswer,
        w1: wrongs[0] || 'خيار 1',
        w2: wrongs[1] || 'خيار 2',
        w3: wrongs[2] || 'خيار 3',
        options: [qAnswer, ...wrongs]
      });

      if (normalized) {
        parsedQuestions.push(normalized);
      }
    }
  }

  return parsedQuestions;
}

/**
 * Parses questions pasted from Word / WhatsApp formatted with pipe, dash, or commas.
 */
export function parseQuestionsFromBulkText(text) {
  if (!text || typeof text !== 'string') return [];

  const lines = text.split(/\r?\n/);
  const parsed = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let parts = [];
    if (trimmed.includes('|')) parts = trimmed.split('|');
    else if (trimmed.includes(' - ')) parts = trimmed.split(' - ');
    else if (trimmed.includes('،')) parts = trimmed.split('،');
    else parts = trimmed.split(',');

    parts = parts.map(p => p.trim()).filter(Boolean);

    if (parts.length >= 2) {
      const normalized = normalizeQuestion({
        text: parts[0],
        answer: parts[1],
        w1: parts[2] || 'خيار 1',
        w2: parts[3] || 'خيار 2',
        w3: parts[4] || 'خيار 3',
        options: [parts[1], ...parts.slice(2)]
      });
      if (normalized) parsed.push(normalized);
    }
  });

  return parsed;
}

/**
 * Loads active custom questions from localStorage with normalization safety.
 */
export function loadActiveCustomQuestions() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('active_live_custom_questions');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const normalized = normalizeQuestions(parsed);
      return normalized.length > 0 ? normalized : null;
    }
    return null;
  } catch (e) {
    console.error('Error loading active custom questions:', e);
    return null;
  }
}

/**
 * Saves active custom questions to localStorage and broadcasts update event across the browser.
 */
export function saveActiveCustomQuestions(questions) {
  if (typeof window === 'undefined') return null;
  try {
    if (Array.isArray(questions) && questions.length > 0) {
      const normalized = normalizeQuestions(questions);
      localStorage.setItem('active_live_custom_questions', JSON.stringify(normalized));
      window.dispatchEvent(new CustomEvent('customQuestionsUpdated', { detail: normalized }));
      return normalized;
    } else {
      localStorage.removeItem('active_live_custom_questions');
      window.dispatchEvent(new CustomEvent('customQuestionsUpdated', { detail: null }));
      return null;
    }
  } catch (e) {
    console.error('Error saving active custom questions:', e);
    return null;
  }
}

/**
 * Saves questions for a specific specialty slot.
 * Key: `live_questions_<specialty>`
 */
export function saveQuestionsBySpecialty(specialty, questions) {
  if (typeof window === 'undefined' || !specialty) return;
  try {
    if (Array.isArray(questions) && questions.length > 0) {
      const normalized = normalizeQuestions(questions);
      localStorage.setItem(`live_questions_${specialty}`, JSON.stringify(normalized));
    } else {
      localStorage.removeItem(`live_questions_${specialty}`);
    }
  } catch (e) {
    console.error('Error saving specialty questions:', e);
  }
}

/**
 * Loads saved questions for a specific specialty.
 * Returns null if none saved.
 */
export function loadQuestionsBySpecialty(specialty) {
  if (typeof window === 'undefined' || !specialty) return null;
  try {
    const raw = localStorage.getItem(`live_questions_${specialty}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return normalizeQuestions(parsed);
    }
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Built-in default questions per specialty (ready-to-use without teacher input).
 */
export function getBuiltinQuestions(specialty) {
  const arabic = [
    { text: 'أي من الكلمات التالية فعل مضارع؟', answer: 'يكتبُ', options: ['يكتبُ', 'الكتابُ', 'مكتوبٌ', 'كتابةً'] },
    { text: 'ما إعراب كلمة "الطالبُ" في جملة: جاء الطالبُ؟', answer: 'فاعل مرفوع', options: ['فاعل مرفوع', 'مبتدأ مرفوع', 'خبر مرفوع', 'مفعول به منصوب'] },
    { text: 'ما المقصود بالاسم النكرة؟', answer: 'اسم غير محدد', options: ['اسم غير محدد', 'اسم محدد', 'اسم مؤنث', 'اسم جمع'] },
    { text: 'أي الكلمات التالية مذكر؟', answer: 'قلم', options: ['قلم', 'حقيبة', 'مدرسة', 'طاولة'] },
    { text: 'ما جمع كلمة "كتاب"؟', answer: 'كتب', options: ['كتب', 'أكاتيب', 'مكاتب', 'كتبة'] },
    { text: 'ما ضد كلمة "سعيد"؟', answer: 'حزين', options: ['حزين', 'كبير', 'بعيد', 'سريع'] },
    { text: 'أي الجمل التالية تحتوي على مبتدأ وخبر؟', answer: 'الجوُّ جميلٌ', options: ['الجوُّ جميلٌ', 'ذهب محمدٌ', 'كتبَ الطالبُ', 'أكلَ الولدُ'] },
    { text: 'ما حرف الجر في جملة: ذهبتُ إلى المدرسة؟', answer: 'إلى', options: ['إلى', 'في', 'على', 'من'] },
    { text: 'ما علامة إعراب الاسم المجرور؟', answer: 'الكسرة', options: ['الكسرة', 'الضمة', 'الفتحة', 'السكون'] },
    { text: 'أي الكلمات التالية اسم إشارة؟', answer: 'هذا', options: ['هذا', 'أنا', 'هو', 'أين'] },
  ];
  const english = [
    { text: 'What is the plural of "child"?', answer: 'children', options: ['children', 'childs', 'childes', 'childer'] },
    { text: 'Choose the correct verb: She ___ to school every day.', answer: 'goes', options: ['goes', 'go', 'gone', 'going'] },
    { text: 'What is the past tense of "run"?', answer: 'ran', options: ['ran', 'runned', 'run', 'ranned'] },
    { text: 'Which is an adjective?', answer: 'beautiful', options: ['beautiful', 'quickly', 'run', 'happiness'] },
    { text: 'Translate: "مدرسة"', answer: 'School', options: ['School', 'House', 'Book', 'Pen'] },
    { text: 'Translate: "كتاب"', answer: 'Book', options: ['Book', 'Bag', 'Chair', 'Table'] },
    { text: 'What letter comes after "M" in the alphabet?', answer: 'N', options: ['N', 'O', 'L', 'P'] },
    { text: 'Which word rhymes with "cat"?', answer: 'bat', options: ['bat', 'dog', 'cup', 'pen'] },
    { text: 'How many vowels are in the English alphabet?', answer: '5', options: ['5', '6', '4', '7'] },
    { text: 'What is the opposite of "big"?', answer: 'small', options: ['small', 'tall', 'fast', 'old'] },
  ];
  const math = [
    { text: '7 + 8 = ?', answer: '15', options: ['15', '14', '16', '13'] },
    { text: '12 - 5 = ?', answer: '7', options: ['7', '6', '8', '9'] },
    { text: '4 × 6 = ?', answer: '24', options: ['24', '22', '20', '26'] },
    { text: '18 ÷ 3 = ?', answer: '6', options: ['6', '5', '7', '4'] },
    { text: 'ما هو الرقم الناقص: 2، 4، 6، __؟', answer: '8', options: ['8', '7', '9', '10'] },
    { text: '25 + 37 = ?', answer: '62', options: ['62', '60', '63', '61'] },
    { text: '9 × 9 = ?', answer: '81', options: ['81', '72', '90', '80'] },
    { text: 'ما هو نصف العدد 50؟', answer: '25', options: ['25', '20', '30', '15'] },
    { text: 'كم يساوي 100 - 43؟', answer: '57', options: ['57', '56', '58', '47'] },
    { text: '3 × 7 + 2 = ?', answer: '23', options: ['23', '21', '25', '20'] },
  ];

  const map = { arabic, english, math };
  const list = map[specialty] || [...arabic, ...english, ...math];
  return normalizeQuestions(list.map(q => ({ ...q, options: [...q.options].sort(() => Math.random() - 0.5) })));
}
