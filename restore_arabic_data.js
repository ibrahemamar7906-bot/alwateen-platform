const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveArabicBoardTeacher.js';
let content = fs.readFileSync(file, 'utf8');

// Find the export default function line
const exportIdx = content.indexOf('export default function LiveArabicBoardTeacher');

const cleanData = `'use client'

import { useState, useEffect, useRef } from 'react'
import { speakWhenReady } from '../../../utils/tts'

const ARABIC_DATA = [
  { letter: 'أ', name: 'ألف', forms: 'أ إأ', word: 'أرنب', emoji: '🐇' },
  { letter: 'ب', name: 'باء', forms: 'ب بـ ـبـ ـب', word: 'بيت', emoji: '🏠' },
  { letter: 'ت', name: 'تاء', forms: 'ت تـ ـتـ ـت', word: 'تفاحة', emoji: '🍎' },
  { letter: 'ث', name: 'ثاء', forms: 'ث ثـ ـثـ ـث', word: 'ثعلب', emoji: '🦊' },
  { letter: 'ج', name: 'جيم', forms: 'ج جـ ـجـ ـج', word: 'جمل', emoji: '🐪' },
  { letter: 'ح', name: 'حاء', forms: 'ح حـ ـحـ ـح', word: 'حمار', emoji: '🐴' },
  { letter: 'خ', name: 'خاء', forms: 'خ خـ ـخـ ـخ', word: 'خروف', emoji: '🐑' },
  { letter: 'د', name: 'دال', forms: 'د ـد', word: 'دجاجة', emoji: '🐔' },
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
];

const ARABIC_CURRICULUM_P1_T1 = [
  {
    theme: 'المحور الأول: من أكون',
    subjects: [
      {
        title: 'الموضوع الأول: أسرتي',
        sightWords: ['أنا', 'نحن', 'أبي', 'أمي', 'أخي'],
        letters: ['أ', 'م', 'ب']
      },
      {
        title: 'الموضوع الثاني: عالمي الصغير',
        sightWords: ['هذا', 'هذه'],
        letters: ['ف', 'ن', 'ل', 'ح', 'ر', 'ت']
      }
    ]
  },
  {
    theme: 'المحور الثاني: العالم من حولي',
    subjects: [
      {
        title: 'الموضوع الأول: عالمي الكبير',
        sightWords: ['قال', 'قالت'],
        letters: ['س', 'ج', 'ز', 'د', 'ق', 'ط', 'ش']
      },
      {
        title: 'الموضوع الثاني: أكتشف عالمي',
        sightWords: ['أيضاً', 'في'],
        letters: ['ذ', 'ع', 'و', 'ث', 'خ', 'ص', 'ض', 'ك', 'ي', 'هـ', 'غ', 'ظ']
      }
    ]
  }
];

const ARABIC_CURRICULUM_PREP1 = [
  {
    theme: 'الظواهر اللغوية',
    subjects: [
      {
        title: 'الأسماء الموصولة',
        sightWords: ['الذي', 'التي', 'اللذان', 'اللتان', 'الذين', 'اللاتي', 'اللواتي'],
        letters: []
      },
      {
        title: 'أسماء الإشارة',
        sightWords: ['هذا', 'هذه', 'هذان', 'هاتان', 'هؤلاء', 'ذلك', 'تلك', 'أولئك'],
        letters: []
      }
    ]
  }
];

const ARABIC_CURRICULUM_PREP2 = [
  {
    theme: 'النحو والصرف',
    subjects: [
      {
        title: 'الإعراب والبناء',
        sightWords: ['المعرب من الأسماء', 'المبني من الأسماء', 'المعرب من الأفعال', 'المبني من الأفعال'],
        letters: []
      }
    ]
  }
];

`;

const newContent = cleanData + content.substring(exportIdx);

// Also fix harakat if they were corrupted by my script
let finalContent = newContent.replace(/label: '\?\?\?\?\?\?\?\?\?\?\?\?\?\? \( \?\?\?\? \)', name: '\?\?\?\?\?\?\?\?'/g, "label: 'فتحة ( ـَ )', name: 'فتحة'");
finalContent = finalContent.replace(/label: '\?\?\?\?\?\?\?\?\?\?\?\? \( \?\?\?\? \)', name: '\?\?\?\?\?\?'/g, "label: 'ضمة ( ـُ )', name: 'ضمة'");
finalContent = finalContent.replace(/label: '\?\?\?\?\?\?\?\?\?\?\?\?\?\? \( \?\?\?\? \)', name: '\?\?\?\?\?\?\?\?'/g, "label: 'كسرة ( ـِ )', name: 'كسرة'");

// Just in case, replace HARAKAT array entirely to be safe
const harakatIdx = finalContent.indexOf('const HARAKAT = [');
const harakatEndIdx = finalContent.indexOf(']', harakatIdx) + 1;
const cleanHarakat = `const HARAKAT = [
    { id: 'fatha', char: 'َ', label: 'فتحة ( ـَ )', name: 'فتحة' },
    { id: 'damma', char: 'ُ', label: 'ضمة ( ـُ )', name: 'ضمة' },
    { id: 'kasra', char: 'ِ', label: 'كسرة ( ـِ )', name: 'كسرة' },
  ]`;
if (harakatIdx !== -1) {
  finalContent = finalContent.substring(0, harakatIdx) + cleanHarakat + finalContent.substring(harakatEndIdx);
}

// Fix '?????? ??????' word click 
finalContent = finalContent.replace(/letter: '\?\?\?\?\?\?\?\? \?\?\?\?\?\?\?\?\?\?',\s*name: '\?\?\?\?\?\?\?\?\?\?\?\? \?\?\?\?\?\?\?\?\?\?\?\?',/g, "letter: 'كلمة بصرية', name: 'الكلمات البصرية',");

fs.writeFileSync(file, finalContent, 'utf8');
console.log('Restored Arabic Board data!');
