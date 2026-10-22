/**
 * بنك الأسئلة والتدريبات النحوية التفاعلية الشامل - الصف الأول الإعدادي (المنهج الجديد)
 * الفهرس الموحد لجميع دروس النحو:
 * ١- أسئلة تثبيت القواعد السريعة (MCQ) - 100 سؤال صامت ومباشر.
 * ٢- قطع نحوية امتحانية متكاملة مع أسئلة الإعراب والاستخراج والتصحيح التلقائي - 15 قطعة و 120 سؤالاً.
 */

import { grammarLesson1 } from './lesson1';
import { grammarLesson2 } from './lesson2';
import { grammarLesson3 } from './lesson3';
import { grammarLesson4 } from './lesson4';
import { grammarLesson5 } from './lesson5';

export const PREP1_GRAMMAR_BANK = {
  'grammar-1': grammarLesson1,
  'grammar-2': grammarLesson2,
  'grammar-3': grammarLesson3,
  'grammar-4': grammarLesson4,
  'grammar-5': grammarLesson5,
};

/**
 * دالة جلب جميع دروس النحو
 */
export const getAllPrep1GrammarLessons = () => {
  return [
    grammarLesson1,
    grammarLesson2,
    grammarLesson3,
    grammarLesson4,
    grammarLesson5,
  ];
};

/**
 * دالة جلب درس محدد بالمعرف
 */
export const getPrep1GrammarLesson = (lessonId) => {
  return PREP1_GRAMMAR_BANK[lessonId] || null;
};
