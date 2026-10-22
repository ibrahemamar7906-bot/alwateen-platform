const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('prep3_curriculum_safe.txt', 'utf8');
const sections = content.split('###').filter(s => s.trim().length > 0);

function cleanText(str) {
  if (!str) return '';
  return str.replace(/`/g, "'").replace(/\r/g, '').trim();
}

function extractPart(section, startStrs, nextStrList) {
  let startIndex = -1;
  for (let s of startStrs) {
    startIndex = section.indexOf(s);
    if (startIndex !== -1) break;
  }
  if (startIndex === -1) return '';
  startIndex = section.indexOf('\n', startIndex);
  if (startIndex === -1) return '';

  let endIndex = section.length;
  for (let nextStr of nextStrList) {
    let nIdx = section.indexOf(nextStr, startIndex);
    if (nIdx !== -1 && nIdx < endIndex) {
      endIndex = nIdx;
    }
  }
  return section.substring(startIndex, endIndex).trim();
}

function parseVocab(vocabText) {
  if (!vocabText) return [];
  const lines = vocabText.split('\n');
  const items = [];
  for (let line of lines) {
    let clean = line.replace(/^\*?\s*/, '').replace(/>/g, '').trim();
    if (!clean) continue;
    
    let word = '', meaning = '', opposite = '', plural = '';
    
    // Check patterns like: كلمة = معنى أو كلمة : معنى
    let parts = clean.split(/[:=]/);
    if (parts.length >= 2) {
      word = parts[0].replace(/[\*\(\)]/g, '').trim();
      let rest = parts.slice(1).join(':').replace(/\*/g, '').trim();
      
      // Check for (المضاد: ...)
      let oppMatch = rest.match(/[\(\[]\s*المضاد\s*:\s*([^\]\)]+)[\)\]]/);
      if (oppMatch) {
        opposite = oppMatch[1].trim();
        rest = rest.replace(/[\(\[]\s*المضاد\s*:\s*([^\]\)]+)[\)\]]/, '').trim();
      }
      
      // Check for (الجمع: ...)
      let plMatch = rest.match(/[\(\[]\s*الجمع\s*:\s*([^\]\)]+)[\)\]]/);
      if (plMatch) {
        plural = plMatch[1].trim();
        rest = rest.replace(/[\(\[]\s*الجمع\s*:\s*([^\]\)]+)[\)\]]/, '').trim();
      }
      
      meaning = rest.replace(/[\(\)\.]/g, '').trim();
      if (word && (meaning || opposite || plural)) {
        items.push({ word, meaning, opposite, plural });
      }
    }
  }
  return items;
}

function parseQuestions(qText) {
  if (!qText) return [];
  const qBlocks = qText.split(/(?=\n\d+\.\s+)/).filter(q => q.trim().length > 0);
  const result = [];
  for (let block of qBlocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    let question = lines[0].replace(/^\d+\.\s*/, '').replace(/[\*\"]/g, '').trim();
    let options = [];
    let correct = '';
    for (let i = 1; i < lines.length; i++) {
      let line = lines[i];
      if (line.startsWith('*') || line.startsWith('-')) {
        let opt = line.replace(/^[\*\-]\s*[أ-د]\)\s*/, '').trim();
        if (opt === '---' || opt.startsWith('---')) continue;
        let isCorrect = opt.includes('الإجابة الصحيحة');
        // Clean opt from any comments in parentheses like (الإجابة الصحيحة - ...)
        opt = opt.replace(/\*?\s*[\(\[]\s*الإجابة الصحيحة[^\)\]]*[\)\]]\s*\*?/g, '').replace(/[\*"]/g, '').trim();
        if (opt && opt !== '---') {
          options.push(opt);
          if (isCorrect) correct = opt;
        }
      }
    }

    // Specific corrections for accuracy:
    if (question.includes('هذا الشاب') || (options.some(o => o.includes('جريء')))) {
      options = options.map(o => o.includes('جريء') ? 'جريء' : o);
      correct = 'جريء';
    }
    if (question.includes('مصدر لفعل رباعي') || question.includes('همزته همزة قطع')) {
      correct = 'إكرام';
    }
    if (question.includes('أمر لفعل خماسي') || question.includes('استمع إلى نصيحة') || question.includes('ألف وصل')) {
      correct = 'استمع';
    }
    if (question.includes('كتابة صحيحة') && options.includes('جريء')) {
      correct = 'جريء';
    }
    if (question.includes('وقف') && (question.includes('اسم الزمان') || question.includes('اسم المكان'))) {
      const mawqifOpt = options.find(o => o.includes('مَوْقِف') || o.includes('مَفْعِل'));
      if (mawqifOpt) correct = mawqifOpt;
    }

    if (options.length >= 2) {
      if (!correct || !options.includes(correct)) {
        correct = options.find(o => o === correct) || options[0];
      }
      result.push({ question, options, correct });
    }
  }
  return result;
}

function parseGuide(guideText) {
  if (!guideText) return [];
  const lines = guideText.split('\n').map(l => l.replace(/>/g, '').trim()).filter(Boolean);
  const qa = [];
  let currentQ = '';
  let currentA = '';
  for (let l of lines) {
    if (l.startsWith('* **') && (l.includes('؟') || l.includes(':'))) {
      if (currentQ && currentA) {
        qa.push({ q: currentQ, a: currentA });
      }
      currentQ = l.replace(/[\*\:]/g, '').trim();
      currentA = '';
    } else {
      if (currentQ) {
        currentA += (currentA ? ' ' : '') + l.replace(/\*/g, '').trim();
      }
    }
  }
  if (currentQ && currentA) {
    qa.push({ q: currentQ, a: currentA });
  }
  return qa;
}

// Map each section index
const readingLessonsMap = [
  { secIdx: 1, dir: 'lesson-1', subtitle: 'أساسيات التحليل - الوحدة الأولى (قضايا أسرية)' },
  { secIdx: 2, dir: 'lesson-2', subtitle: 'عناصر التذوق البلاغي - الوحدة الأولى (قضايا أسرية)' },
  { secIdx: 3, dir: 'lesson-3', subtitle: 'نص استماع - الوحدة الأولى (قضايا أسرية)' },
  { secIdx: 4, dir: 'lesson-4', subtitle: 'درس قراءة - الوحدة الأولى (قضايا أسرية)' },
  { secIdx: 5, dir: 'lesson-5', subtitle: 'درس قراءة - الوحدة الأولى (قضايا أسرية)' },
  { secIdx: 6, dir: 'lesson-6', subtitle: 'نص شعري - الوحدة الأولى (قضايا أسرية)' },
  { secIdx: 7, dir: 'lesson-7', subtitle: 'نص استماع - الوحدة الثانية (العلم والعمل)' },
  { secIdx: 8, dir: 'lesson-8', subtitle: 'درس قراءة - الوحدة الثانية (العلم والعمل)' },
  { secIdx: 9, dir: 'lesson-9', subtitle: 'درس قراءة - الوحدة الثانية (العلم والعمل)' },
  { secIdx: 10, dir: 'lesson-10', subtitle: 'نص شعري - الوحدة الثانية (العلم والعمل)' },
  { secIdx: 11, dir: 'lesson-11', subtitle: 'نص استماع وقراءة - الوحدة الثالثة (مصر وبناء المستقبل)' },
  { secIdx: 13, dir: 'lesson-12', subtitle: 'قراءة وشعر - الوحدة الثالثة (مصر وبناء المستقبل)' }
];

const grammarLessonsMap = [
  { secIdx: 15, dir: 'lesson-1', title: 'اسم الفاعل', subtitle: 'فرع النحو (المشتقات) - الصف الثالث الإعدادي' },
  { secIdx: 16, dir: 'lesson-2', title: 'صيغ المبالغة', subtitle: 'فرع النحو (المشتقات) - الصف الثالث الإعدادي' },
  { secIdx: 17, dir: 'lesson-3', title: 'اسم المفعول', subtitle: 'فرع النحو (المشتقات) - الصف الثالث الإعدادي' },
  { secIdx: 18, dir: 'lesson-4', title: 'اسما الزمان والمكان', subtitle: 'فرع النحو (المشتقات) - الصف الثالث الإعدادي' },
  { secIdx: 19, dir: 'lesson-5', title: 'اسم الآلة', subtitle: 'فرع النحو (المشتقات) - الصف الثالث الإعدادي' }
];

const dictationLessonsMap = [
  { secIdx: 20, dir: 'lesson-1', title: 'همزة القطع وألف الوصل', subtitle: 'قواعد الإملاء - الصف الثالث الإعدادي' },
  { secIdx: 21, dir: 'lesson-2', title: 'كتابة الهمزة المتوسطة', subtitle: 'قواعد الإملاء - الصف الثالث الإعدادي' },
  { secIdx: 22, dir: 'lesson-3', title: 'كتابة الهمزة المتطرفة', subtitle: 'قواعد الإملاء - الصف الثالث الإعدادي' },
  { secIdx: 23, dir: 'writing-1', title: 'فن كتابة التقرير الصحفي', subtitle: 'التعبير الكتابي الوظيفي - الصف الثالث الإعدادي' }
];

// Bank of all quizzes for prep3
const allQuizzes = {};

// 1. Generate Reading Lessons
for (let item of readingLessonsMap) {
  const sec = sections[item.secIdx];
  const firstLine = sec.trim().split('\n')[0].replace(/\*\*/g, '').trim();
  let title = firstLine.replace(/^(الدرس\s+[^\:]+\:\s*|أولاً\:\s*|ثانياً\:\s*)/, '').trim();
  title = title.replace(/\s*\([^\)]+\)$/, '').trim();
  
  const originalText = extractPart(sec, ['**النص الأصلي', '**النص الأدبي', '**النص المعلوماتي', '**نص الدرس', '**الدرس الأول', '**الدرس الثاني', '**الدرس الثالث'], ['**معاني المفردات', '**اللغويات', '**💡 دليل الطالب', '**📝 أسئلة']).replace(/>/g, '').trim();
  const vocabText = extractPart(sec, ['**معاني المفردات', '**اللغويات'], ['**💡 دليل الطالب', '**📝 أسئلة']).trim();
  const guideText = extractPart(sec, ['**💡 دليل الطالب'], ['**📝 أسئلة']).replace(/>/g, '').trim();
  const questionsText = extractPart(sec, ['**📝 أسئلة'], []).trim();

  const vocab = parseVocab(vocabText);
  const questions = parseQuestions(questionsText);
  const guide = parseGuide(guideText);

  allQuizzes[`reading_${item.dir}`] = questions;

  // Split original text into paragraphs
  const rawParagraphs = originalText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const paragraphs = rawParagraphs.map((p, idx) => ({
    id: `p${idx + 1}`,
    title: `الفقرة ${idx + 1}`,
    text: p.replace(/\*\*/g, '')
  }));

  const lessonDir = path.join(__dirname, '..', 'app', 'prep-3', 'reading-and-texts', item.dir);
  fs.mkdirSync(lessonDir, { recursive: true });

  const pageContent = `'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Headphones, BookOpen, Sparkles, Award } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import VocabularySection from '../../components/VocabularySection'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'

export default function LessonPage() {
  const title = ${JSON.stringify(title)};
  const subtitle = ${JSON.stringify(item.subtitle)};

  const paragraphs = ${JSON.stringify(paragraphs, null, 2)};

  const vocabList = ${JSON.stringify(vocab, null, 2)};

  const questions = ${JSON.stringify(guide, null, 2)};

  const quizzes = ${JSON.stringify(questions, null, 2)};

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-3/reading-and-texts" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <BookOpen size={18} />
                <span>{subtitle}</span>
              </div>
              <h1 className={styles.title}>{title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        {/* Paragraphs Section */}
        {paragraphs.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px', color: '#064e3b' }}>
              📖 نص الدرس والتلاوة الصوتية
            </h2>
            {paragraphs.map((p) => (
              <ParagraphCard key={p.id} id={p.id} title={p.title} text={p.text} />
            ))}
          </div>
        )}

        {/* Vocabulary Section */}
        {vocabList.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px', color: '#064e3b' }}>
              💡 معاني المفردات واللغويات
            </h2>
            <VocabularySection vocabList={vocabList} />
          </div>
        )}

        {/* Analysis & Student Guide */}
        {questions.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px', color: '#064e3b' }}>
              🔍 دليل الفهم والتحليل وأسئلة المناقشة
            </h2>
            <QuestionsCard questions={questions} />
          </div>
        )}

        {/* Interactive Quiz */}
        {quizzes.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px', color: '#064e3b' }}>
              🎯 الاختبار التفاعلي السريع للدرس
            </h2>
            <InteractiveQuiz questions={quizzes} lessonTitle={title} />
          </div>
        )}
      </div>
    </div>
  )
}
`;
  fs.writeFileSync(path.join(lessonDir, 'page.js'), pageContent, 'utf8');
  console.log(`Generated reading lesson: ${item.dir} - ${title}`);
}

// 2. Generate Grammar Lessons
for (let item of grammarLessonsMap) {
  const sec = sections[item.secIdx];
  const firstLine = sec.trim().split('\n')[0].replace(/\*\*/g, '').trim();
  let title = item.title;
  
  const originalText = extractPart(sec, ['**النص الأصلي', '**القاعدة النحوية', '**الشرح', '**شرح الدرس'], ['**💡 دليل الطالب', '**📝 أسئلة']).replace(/>/g, '').trim();
  const guideText = extractPart(sec, ['**💡 دليل الطالب'], ['**📝 أسئلة']).replace(/>/g, '').trim();
  const questionsText = extractPart(sec, ['**📝 أسئلة'], []).trim();

  const questions = parseQuestions(questionsText);
  const guide = parseGuide(guideText);
  allQuizzes[`grammar_${item.dir}`] = questions;

  const rawParagraphs = originalText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const paragraphs = rawParagraphs.map((p, idx) => ({
    id: `g${idx + 1}`,
    title: `القاعدة والتفصيل ${idx + 1}`,
    text: p.replace(/\*\*/g, '')
  }));

  const lessonDir = path.join(__dirname, '..', 'app', 'prep-3', 'grammar', item.dir);
  fs.mkdirSync(lessonDir, { recursive: true });

  const pageContent = `'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, PenTool, Sparkles, Award } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'

export default function GrammarLessonPage() {
  const title = ${JSON.stringify(title)};
  const subtitle = ${JSON.stringify(item.subtitle)};
  const paragraphs = ${JSON.stringify(paragraphs, null, 2)};
  const guide = ${JSON.stringify(guide, null, 2)};
  const quizzes = ${JSON.stringify(questions, null, 2)};

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-3/grammar" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <PenTool size={18} />
                <span>{subtitle}</span>
              </div>
              <h1 className={styles.title}>{title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        {/* Explanation */}
        {paragraphs.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px', color: '#064e3b' }}>
              ⚖️ القواعد النحوية والشرح التطبيقي
            </h2>
            {paragraphs.map((p) => (
              <ParagraphCard key={p.id} id={p.id} title={p.title} text={p.text} />
            ))}
          </div>
        )}

        {/* Student Guide */}
        {guide.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px', color: '#064e3b' }}>
              💡 شفرات واستراتيجيات الإعراب السريع
            </h2>
            <QuestionsCard questions={guide} />
          </div>
        )}

        {/* Interactive Quiz */}
        {quizzes.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px', color: '#064e3b' }}>
              🎯 تدريب نحوي وتطبيق إلكتروني فوري
            </h2>
            <InteractiveQuiz questions={quizzes} lessonTitle={title} />
          </div>
        )}
      </div>
    </div>
  )
}
`;
  fs.writeFileSync(path.join(lessonDir, 'page.js'), pageContent, 'utf8');
  console.log(`Generated grammar lesson: ${item.dir} - ${title}`);
}

// 3. Generate Dictation Lessons
for (let item of dictationLessonsMap) {
  const sec = sections[item.secIdx];
  let title = item.title;
  
  const originalText = extractPart(sec, ['**النص الأصلي', '**القاعدة', '**الشرح'], ['**💡 دليل الطالب', '**📝 أسئلة']).replace(/>/g, '').trim();
  const guideText = extractPart(sec, ['**💡 دليل الطالب'], ['**📝 أسئلة']).replace(/>/g, '').trim();
  const questionsText = extractPart(sec, ['**📝 أسئلة'], []).trim();

  const questions = parseQuestions(questionsText);
  const guide = parseGuide(guideText);
  allQuizzes[`dictation_${item.dir}`] = questions;

  const rawParagraphs = originalText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const paragraphs = rawParagraphs.map((p, idx) => ({
    id: `d${idx + 1}`,
    title: `قواعد الرسم والتطبيق ${idx + 1}`,
    text: p.replace(/\*\*/g, '')
  }));

  const lessonDir = path.join(__dirname, '..', 'app', 'prep-3', 'dictation', item.dir);
  fs.mkdirSync(lessonDir, { recursive: true });

  const pageContent = `'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Book, Sparkles } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'

export default function DictationLessonPage() {
  const title = ${JSON.stringify(title)};
  const subtitle = ${JSON.stringify(item.subtitle)};
  const paragraphs = ${JSON.stringify(paragraphs, null, 2)};
  const guide = ${JSON.stringify(guide, null, 2)};
  const quizzes = ${JSON.stringify(questions, null, 2)};

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-3/dictation" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <Book size={18} />
                <span>{subtitle}</span>
              </div>
              <h1 className={styles.title}>{title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        {paragraphs.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px', color: '#064e3b' }}>
              ✍️ القواعد الإملائية والتطبيقية
            </h2>
            {paragraphs.map((p) => (
              <ParagraphCard key={p.id} id={p.id} title={p.title} text={p.text} />
            ))}
          </div>
        )}

        {guide.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px', color: '#064e3b' }}>
              💡 نصائح ذهبية لتجنب الخطأ
            </h2>
            <QuestionsCard questions={guide} />
          </div>
        )}

        {quizzes.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px', color: '#064e3b' }}>
              🎯 اختبار إملائي تفاعلي
            </h2>
            <InteractiveQuiz questions={quizzes} lessonTitle={title} />
          </div>
        )}
      </div>
    </div>
  )
}
`;
  fs.writeFileSync(path.join(lessonDir, 'page.js'), pageContent, 'utf8');
  console.log(`Generated dictation lesson: ${item.dir} - ${title}`);
}

// 4. Save prep3 quizzes data
const dataDir = path.join(__dirname, '..', 'app', 'prep-3', 'data');
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(
  path.join(dataDir, 'prep3_quizzes.js'),
  `export const PREP3_QUIZZES = ${JSON.stringify(allQuizzes, null, 2)};\n`,
  'utf8'
);
console.log('Saved prep3_quizzes.js successfully!');
