'use client'

import { useState, useEffect, useRef } from 'react'
import { speakWhenReady } from '../../../utils/tts'

const ARABIC_DATA = [
  { letter: 'أ', name: 'ألف', forms: 'أ إأ', word: 'أسمر', emoji: '🌞' },
  { letter: 'ب', name: 'باء', forms: 'ب بـ ـبـ ـب', word: 'بيت', emoji: '🏠' },
  { letter: 'ت', name: 'تاء', forms: 'ت تـ ـتـ ـت', word: 'تفاحة', emoji: '🍎' },
  { letter: 'ث', name: 'ثاء', forms: 'ث ثـ ـثـ ـث', word: 'ثعلب', emoji: '🦊' },
  { letter: 'ج', name: 'جيم', forms: 'ج جـ ـجـ ـج', word: 'جمل', emoji: '🐪' },
  { letter: 'ح', name: 'حاء', forms: 'ح حـ ـحـ ـح', word: 'حمار', emoji: '🐴' },
  { letter: 'خ', name: 'خاء', forms: 'خ خـ ـخـ ـخ', word: 'خروف', emoji: '🐑' },
  { letter: 'د', name: 'دال', forms: 'د ـد', word: 'دجاج', emoji: '🐔' },
  { letter: 'ذ', name: 'ذال', forms: 'ذ ـذ', word: 'ذئب', emoji: '🐺' },
  { letter: 'ر', name: 'راء', forms: 'ر ـر', word: 'رمانة', emoji: '🍎' },
  { letter: 'ز', name: 'زاي', forms: 'ز ـز', word: 'زرافة', emoji: '🦒' },
  { letter: 'س', name: 'سين', forms: 'س سـ ـسـ ـس', word: 'سمكة', emoji: '🐟' },
  { letter: 'ش', name: 'شين', forms: 'ش شـ ـشـ ـش', word: 'شمس', emoji: '☀️' },
  { letter: 'ص', name: 'صاد', forms: 'ص صـ ـصـ ـص', word: 'صقر', emoji: '🦅' },
  { letter: 'ض', name: 'ضاد', forms: 'ض ضـ ـضـ ـض', word: 'ضفدع', emoji: '🐸' },
  { letter: 'ط', name: 'طاء', forms: 'ط طـ ـطـ ـط', word: 'طاووس', emoji: '🦚' },
  { letter: 'ظ', name: 'ظاء', forms: 'ظ ظـ ـظـ ـظ', word: 'ظبي', emoji: '🦌' },
  { letter: 'ع', name: 'عين', forms: 'ع عـ ـعـ ـع', word: 'عصفور', emoji: '🐦' },
  { letter: 'غ', name: 'غين', forms: 'غ غـ ـغـ ـغ', word: 'غزالة', emoji: '🦌' },
  { letter: 'ف', name: 'فاء', forms: 'ف فـ ـفـ ـف', word: 'فيل', emoji: '🐘' },
  { letter: 'ق', name: 'قاف', forms: 'ق قـ ـقـ ـق', word: 'قطة', emoji: '🐱' },
  { letter: 'ك', name: 'كاف', forms: 'ك كـ ـكـ ـك', word: 'كلب', emoji: '🐶' },
  { letter: 'ل', name: 'لام', forms: 'ل لـ ـلـ ـل', word: 'ليمون', emoji: '🍋' },
  { letter: 'م', name: 'ميم', forms: 'م مـ ـمـ ـم', word: 'مكتب', emoji: '🖊️' },
  { letter: 'ن', name: 'نون', forms: 'ن نـ ـنـ ـن', word: 'نمر', emoji: '🐯' },
  { letter: 'هـ', name: 'هاء', forms: 'هـ هـ ـهـ ـه', word: 'هلال', emoji: '🌙' },
  { letter: 'و', name: 'واو', forms: 'و ـو', word: 'وردة', emoji: '🌹' },
  { letter: 'ي', name: 'ياء', forms: 'ي يـ ـيـ ـي', word: 'يد', emoji: '🤚' }
]
