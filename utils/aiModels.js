/**
 * Unified AI Models Configuration
 * منصة الجُنيدي التعليمية - إعدادات نماذج الذكاء الاصطناعي المعتمدة
 * تم توحيد النماذج على فئة Flash فائقة السرعة والاستقرار واقتصادية التكلفة
 */

export const UNIFIED_AI_MODELS = [
  { 
    id: 'gemini-2.0-flash', 
    name: 'Gemini 2.0 Flash (الأحدث وفائق السرعة)',
    tier: 'flash',
    badge: 'الأحدث'
  },
  { 
    id: 'gemini-1.5-flash', 
    name: 'Gemini 1.5 Flash (مستقر وعالي الدقة)',
    tier: 'flash',
    badge: 'مستقر'
  },
  { 
    id: 'gemini-flash-latest', 
    name: 'Gemini Flash Latest (تحديث مستمر)',
    tier: 'flash',
    badge: 'الافتراضي'
  },
  { 
    id: 'gemini-2.0-flash-lite', 
    name: 'Gemini 2.0 Flash-Lite (خفيف واقتصادي)',
    tier: 'lite',
    badge: 'خفيف'
  }
];

export const DEFAULT_AI_MODEL = 'gemini-2.0-flash';
