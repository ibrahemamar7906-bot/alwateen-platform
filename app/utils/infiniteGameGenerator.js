/**
 * Infinite Game Generator Engine for Al-Gonady Platform
 * Provides endless, procedural generation of high-quality educational content:
 * - Arabic: CVC & 3-4 letter words with Tashkeel, Phonics, Missing letters, Antonyms
 * - English: CVC word families, sight words, phonics, missing vowels/consonants
 * - Math: Infinite arithmetic, number patterns, comparisons, missing operators
 */

// ── 1. EXTENSIVE ARABIC VOCABULARY BANK ──
export const ARABIC_WORDS_BANK = [
  // Animals
  { word: 'أَسَد', letters: ['أَ', 'سَ', 'د'], phonics: ['أَ', 'سَ', 'د'], emoji: '🦁', category: 'حيوانات' },
  { word: 'جَمَل', letters: ['جَ', 'مَ', 'ل'], phonics: ['جَ', 'مَ', 'ل'], emoji: '🐪', category: 'حيوانات' },
  { word: 'فِيل', letters: ['فِ', 'ي', 'ل'], phonics: ['فِ', 'ي', 'ل'], emoji: '🐘', category: 'حيوانات' },
  { word: 'قِرْد', letters: ['قِ', 'رْ', 'د'], phonics: ['قِ', 'رْ', 'د'], emoji: '🐒', category: 'حيوانات' },
  { word: 'كَلْب', letters: ['كَ', 'لْ', 'ب'], phonics: ['كَ', 'لْ', 'ب'], emoji: '🐶', category: 'حيوانات' },
  { word: 'قِطّ', letters: ['قِ', 'طّ'], phonics: ['قِ', 'طّ'], emoji: '🐱', category: 'حيوانات' },
  { word: 'نَمِر', letters: ['نَ', 'مِ', 'ر'], phonics: ['نَ', 'مِ', 'ر'], emoji: '🐅', category: 'حيوانات' },
  { word: 'ذِئْب', letters: ['ذِ', 'ئْ', 'ب'], phonics: ['ذِ', 'ئْ', 'ب'], emoji: '🐺', category: 'حيوانات' },
  { word: 'ثَعْلَب', letters: ['ثَ', 'عْ', 'لَ', 'ب'], phonics: ['ثَ', 'عْ', 'لَ', 'ب'], emoji: '🦊', category: 'حيوانات' },
  { word: 'خَرُوف', letters: ['خَ', 'رُ', 'و', 'ف'], phonics: ['خَ', 'رُ', 'و', 'ف'], emoji: '🐑', category: 'حيوانات' },
  { word: 'حِصَان', letters: ['حِ', 'صَ', 'ا', 'ن'], phonics: ['حِ', 'صَ', 'ا', 'ن'], emoji: '🐴', category: 'حيوانات' },
  { word: 'غَزَال', letters: ['غَ', 'زَ', 'ا', 'ل'], phonics: ['غَ', 'زَ', 'ا', 'ل'], emoji: '🦌', category: 'حيوانات' },
  { word: 'زَرَافَة', letters: ['زَ', 'رَ', 'ا', 'فَ', 'ة'], phonics: ['زَ', 'رَ', 'ا', 'فَ', 'ة'], emoji: '🦒', category: 'حيوانات' },
  { word: 'أَرْنَب', letters: ['أَ', 'رْ', 'نَ', 'ب'], phonics: ['أَ', 'رْ', 'نَ', 'ب'], emoji: '🐰', category: 'حيوانات' },
  { word: 'دُبّ', letters: ['دُ', 'بّ'], phonics: ['دُ', 'بّ'], emoji: '🐻', category: 'حيوانات' },
  { word: 'صَقْر', letters: ['صَ', 'قْ', 'ر'], phonics: ['صَ', 'قْ', 'ر'], emoji: '🦅', category: 'طيور' },
  { word: 'بَطَّة', letters: ['بَ', 'طَّ', 'ة'], phonics: ['بَ', 'طَّ', 'ة'], emoji: '🦆', category: 'طيور' },
  { word: 'دَجَاج', letters: ['دَ', 'جَ', 'ا', 'ج'], phonics: ['دَ', 'جَ', 'ا', 'ج'], emoji: '🐔', category: 'طيور' },
  { word: 'عُصْفُور', letters: ['عُ', 'صْ', 'فُ', 'و', 'ر'], phonics: ['عُ', 'صْ', 'فُ', 'و', 'ر'], emoji: '🐦', category: 'طيور' },
  { word: 'هُدْهُد', letters: ['هُ', 'دْ', 'هُ', 'د'], phonics: ['هُ', 'دْ', 'هُ', 'د'], emoji: '🪶', category: 'طيور' },
  { word: 'سَمَكَة', letters: ['سَ', 'مَ', 'كَ', 'ة'], phonics: ['سَ', 'مَ', 'كَ', 'ة'], emoji: '🐟', category: 'كائنات بحرية' },
  { word: 'حُوت', letters: ['حُ', 'و', 'ت'], phonics: ['حُ', 'و', 'ت'], emoji: '🐋', category: 'كائنات بحرية' },
  { word: 'ضِفْدَع', letters: ['ضِ', 'فْ', 'دَ', 'ع'], phonics: ['ضِ', 'فْ', 'دَ', 'ع'], emoji: '🐸', category: 'برمائيات' },
  { word: 'نَحْلَة', letters: ['نَ', 'حْ', 'لَ', 'ة'], phonics: ['نَ', 'حْ', 'لَ', 'ة'], emoji: '🐝', category: 'حشرات' },
  { word: 'نَمْلَة', letters: ['نَ', 'مْ', 'لَ', 'ة'], phonics: ['نَ', 'مْ', 'لَ', 'ة'], emoji: '🐜', category: 'حشرات' },
  { word: 'فَرَاشَة', letters: ['فَ', 'رَ', 'ا', 'شَ', 'ة'], phonics: ['فَ', 'رَ', 'ا', 'شَ', 'ة'], emoji: '🦋', category: 'حشرات' },

  // Food & Fruits
  { word: 'عِنَب', letters: ['عِ', 'نَ', 'ب'], phonics: ['عِ', 'نَ', 'ب'], emoji: '🍇', category: 'فواكه' },
  { word: 'تُفَّاح', letters: ['تُ', 'فَّ', 'ا', 'ح'], phonics: ['تُ', 'فَّ', 'ا', 'ح'], emoji: '🍎', category: 'فواكه' },
  { word: 'مَوْز', letters: ['مَ', 'و', 'ز'], phonics: ['مَ', 'و', 'ز'], emoji: '🍌', category: 'فواكه' },
  { word: 'تَمْر', letters: ['تَ', 'مْ', 'ر'], phonics: ['تَ', 'مْ', 'ر'], emoji: '🌴', category: 'أطعمة' },
  { word: 'تِين', letters: ['تِ', 'ي', 'ن'], phonics: ['تِ', 'ي', 'ن'], emoji: '🪴', category: 'فواكه' },
  { word: 'رُمَّان', letters: ['رُ', 'مَّ', 'ا', 'ن'], phonics: ['رُ', 'مَّ', 'ا', 'ن'], emoji: '🍒', category: 'فواكه' },
  { word: 'بُرْتُقَال', letters: ['بُ', 'رْ', 'تُ', 'قَ', 'ا', 'ل'], phonics: ['بُ', 'رْ', 'تُ', 'قَ', 'ا', 'ل'], emoji: '🍊', category: 'فواكه' },
  { word: 'لَيْمُون', letters: ['لَ', 'يْ', 'مُ', 'و', 'ن'], phonics: ['لَ', 'يْ', 'مُ', 'و', 'ن'], emoji: '🍋', category: 'فواكه' },
  { word: 'فَرَاوْلَة', letters: ['فَ', 'رَ', 'ا', 'و', 'لَ', 'ة'], phonics: ['فَ', 'رَ', 'ا', 'و', 'لَ', 'ة'], emoji: '🍓', category: 'فواكه' },
  { word: 'خَوْخ', letters: ['خَ', 'و', 'خ'], phonics: ['خَ', 'و', 'خ'], emoji: '🍑', category: 'فواكه' },
  { word: 'كُمَّثْرَى', letters: ['كُ', 'مَّ', 'ثْ', 'رَ', 'ى'], phonics: ['كُ', 'مَّ', 'ثْ', 'رَ', 'ى'], emoji: '🍐', category: 'فواكه' },
  { word: 'بِطِّيخ', letters: ['بِ', 'طِّ', 'ي', 'خ'], phonics: ['بِ', 'طِّ', 'ي', 'خ'], emoji: '🍉', category: 'فواكه' },
  { word: 'جَزَر', letters: ['جَ', 'زَ', 'ر'], phonics: ['جَ', 'زَ', 'ر'], emoji: '🥕', category: 'خضار' },
  { word: 'خِيَار', letters: ['خِ', 'يَ', 'ا', 'ر'], phonics: ['خِ', 'يَ', 'ا', 'ر'], emoji: '🥒', category: 'خضار' },
  { word: 'طَمَاطِم', letters: ['طَ', 'مَ', 'ا', 'طِ', 'م'], phonics: ['طَ', 'مَ', 'ا', 'طِ', 'م'], emoji: '🍅', category: 'خضار' },
  { word: 'بَصَل', letters: ['بَ', 'صَ', 'ل'], phonics: ['بَ', 'صَ', 'ل'], emoji: '🧅', category: 'خضار' },
  { word: 'خُبْز', letters: ['خُ', 'بْ', 'ز'], phonics: ['خُ', 'بْ', 'ز'], emoji: '🍞', category: 'طعام' },
  { word: 'حَلِيب', letters: ['حَ', 'لِ', 'ي', 'ب'], phonics: ['حَ', 'لِ', 'ي', 'ب'], emoji: '🥛', category: 'مشروبات' },
  { word: 'عَسَل', letters: ['عَ', 'سَ', 'ل'], phonics: ['عَ', 'سَ', 'ل'], emoji: '🍯', category: 'طعام' },
  { word: 'مَاء', letters: ['مَ', 'ا', 'ء'], phonics: ['مَ', 'ا', 'ء'], emoji: '💧', category: 'مشروبات' },
  { word: 'عَصِير', letters: ['عَ', 'صِ', 'ي', 'ر'], phonics: ['عَ', 'صِ', 'ي', 'ر'], emoji: '🧃', category: 'مشروبات' },

  // Nature & Objects
  { word: 'شَمْس', letters: ['شَ', 'مْ', 'س'], phonics: ['شَ', 'مْ', 'س'], emoji: '☀️', category: 'طبيعة' },
  { word: 'قَمَر', letters: ['قَ', 'مَ', 'ر'], phonics: ['قَ', 'مَ', 'ر'], emoji: '🌙', category: 'طبيعة' },
  { word: 'نَجْم', letters: ['نَ', 'جْ', 'م'], phonics: ['نَ', 'جْ', 'م'], emoji: '⭐', category: 'طبيعة' },
  { word: 'سَحَاب', letters: ['سَ', 'حَ', 'ا', 'ب'], phonics: ['سَ', 'حَ', 'ا', 'ب'], emoji: '☁️', category: 'طبيعة' },
  { word: 'مَطَر', letters: ['مَ', 'طَ', 'ر'], phonics: ['مَ', 'طَ', 'ر'], emoji: '🌧️', category: 'طبيعة' },
  { word: 'ثَلْج', letters: ['ثَ', 'لْ', 'ج'], phonics: ['ثَ', 'لْ', 'ج'], emoji: '❄️', category: 'طبيعة' },
  { word: 'بَحْر', letters: ['بَ', 'حْ', 'ر'], phonics: ['بَ', 'حْ', 'ر'], emoji: '🌊', category: 'طبيعة' },
  { word: 'نَهْر', letters: ['نَ', 'هْ', 'ر'], phonics: ['نَ', 'هْ', 'ر'], emoji: '🏞️', category: 'طبيعة' },
  { word: 'جَبَل', letters: ['جَ', 'بَ', 'ل'], phonics: ['جَ', 'بَ', 'ل'], emoji: '⛰️', category: 'طبيعة' },
  { word: 'شَجَر', letters: ['شَ', 'جَ', 'ر'], phonics: ['شَ', 'جَ', 'ر'], emoji: '🌳', category: 'طبيعة' },
  { word: 'وَرْدَة', letters: ['وَ', 'رْ', 'دَ', 'ة'], phonics: ['وَ', 'رْ', 'دَ', 'ة'], emoji: '🌹', category: 'طبيعة' },
  { word: 'زَهْرَة', letters: ['زَ', 'هْ', 'رَ', 'ة'], phonics: ['زَ', 'هْ', 'رَ', 'ة'], emoji: '🌸', category: 'طبيعة' },

  // School & Home
  { word: 'قَلَم', letters: ['قَ', 'لَ', 'م'], phonics: ['قَ', 'لَ', 'م'], emoji: '✏️', category: 'أدوات' },
  { word: 'كِتَاب', letters: ['كِ', 'تَ', 'ا', 'ب'], phonics: ['كِ', 'تَ', 'ا', 'ب'], emoji: '📖', category: 'أدوات' },
  { word: 'دَفْتَر', letters: ['دَ', 'فْ', 'تَ', 'ر'], phonics: ['دَ', 'فْ', 'تَ', 'ر'], emoji: '📓', category: 'أدوات' },
  { word: 'مِسْطَرَة', letters: ['مِ', 'سْ', 'طَ', 'رَ', 'ة'], phonics: ['مِ', 'سْ', 'طَ', 'رَ', 'ة'], emoji: '📏', category: 'أدوات' },
  { word: 'حَقِيبَة', letters: ['حَ', 'قِ', 'ي', 'بَ', 'ة'], phonics: ['حَ', 'قِ', 'ي', 'بَ', 'ة'], emoji: '🎒', category: 'أدوات' },
  { word: 'بَيْت', letters: ['بَ', 'يْ', 'ت'], phonics: ['بَ', 'يْ', 'ت'], emoji: '🏠', category: 'المنزل' },
  { word: 'بَاب', letters: ['بَ', 'ا', 'ب'], phonics: ['بَ', 'ا', 'ب'], emoji: '🚪', category: 'المنزل' },
  { word: 'سَرِير', letters: ['سَ', 'رِ', 'ي', 'ر'], phonics: ['سَ', 'رِ', 'ي', 'ر'], emoji: '🛏️', category: 'المنزل' },
  { word: 'كُرْسِيّ', letters: ['كُ', 'رْ', 'سِ', 'يّ'], phonics: ['كُ', 'رْ', 'سِ', 'يّ'], emoji: '🪑', category: 'المنزل' },
  { word: 'مِصْبَاح', letters: ['مِ', 'صْ', 'بَ', 'ا', 'ح'], phonics: ['مِ', 'صْ', 'بَ', 'ا', 'ح'], emoji: '💡', category: 'المنزل' },
  { word: 'سَاعَة', letters: ['سَ', 'ا', 'عَ', 'ة'], phonics: ['سَ', 'ا', 'عَ', 'ة'], emoji: '⏰', category: 'المنزل' },

  // Vehicles
  { word: 'سَيَّارَة', letters: ['سَ', 'يَّ', 'ا', 'رَ', 'ة'], phonics: ['سَ', 'يَّ', 'ا', 'رَ', 'ة'], emoji: '🚗', category: 'مركبات' },
  { word: 'قِطَار', letters: ['قِ', 'طَ', 'ا', 'ر'], phonics: ['قِ', 'طَ', 'ا', 'ر'], emoji: '🚆', category: 'مركبات' },
  { word: 'طَائِرَة', letters: ['طَ', 'ا', 'ئِ', 'رَ', 'ة'], phonics: ['طَ', 'ا', 'ئِ', 'رَ', 'ة'], emoji: '✈️', category: 'مركبات' },
  { word: 'سَفِينَة', letters: ['سَ', 'فِ', 'ي', 'نَ', 'ة'], phonics: ['سَ', 'فِ', 'ي', 'نَ', 'ة'], emoji: '🚢', category: 'مركبات' },
  { word: 'دَرَّاجَة', letters: ['دَ', 'رَّ', 'ا', 'جَ', 'ة'], phonics: ['دَ', 'رَّ', 'ا', 'جَ', 'ة'], emoji: '🚲', category: 'مركبات' },
  { word: 'حَافِلَة', letters: ['حَ', 'ا', 'فِ', 'لَ', 'ة'], phonics: ['حَ', 'ا', 'فِ', 'لَ', 'ة'], emoji: '🚌', category: 'مركبات' },
  { word: 'صَارُوخ', letters: ['صَ', 'ا', 'رُ', 'و', 'خ'], phonics: ['صَ', 'ا', 'رُ', 'و', 'خ'], emoji: '🚀', category: 'مركبات' },

  // Actions (3-letter verbs)
  { word: 'كَتَبَ', letters: ['كَ', 'تَ', 'بَ'], phonics: ['كَ', 'تَ', 'بَ'], emoji: '✍️', category: 'أفعال' },
  { word: 'قَرَأَ', letters: ['قَ', 'رَ', 'أَ'], phonics: ['قَ', 'رَ', 'أَ'], emoji: '📖', category: 'أفعال' },
  { word: 'رَسَمَ', letters: ['رَ', 'سَ', 'مَ'], phonics: ['رَ', 'سَ', 'مَ'], emoji: '🎨', category: 'أفعال' },
  { word: 'لَعِبَ', letters: ['لَ', 'عِ', 'بَ'], phonics: ['لَ', 'عِ', 'بَ'], emoji: '⚽', category: 'أفعال' },
  { word: 'شَرِبَ', letters: ['شَ', 'رِ', 'بَ'], phonics: ['شَ', 'رِ', 'بَ'], emoji: '🥤', category: 'أفعال' },
  { word: 'أَكَلَ', letters: ['أَ', 'كَ', 'لَ'], phonics: ['أَ', 'كَ', 'لَ'], emoji: '🍽️', category: 'أفعال' },
  { word: 'زَرَعَ', letters: ['زَ', 'رَ', 'عَ'], phonics: ['زَ', 'رَ', 'عَ'], emoji: '🌱', category: 'أفعال' },
  { word: 'حَصَدَ', letters: ['حَ', 'صَ', 'دَ'], phonics: ['حَ', 'صَ', 'دَ'], emoji: '🌾', category: 'أفعال' },
  { word: 'سَبَحَ', letters: ['سَ', 'بَ', 'حَ'], phonics: ['سَ', 'بَ', 'حَ'], emoji: '🏊', category: 'أفعال' },
  { word: 'رَكِبَ', letters: ['رَ', 'كِ', 'بَ'], phonics: ['رَ', 'كِ', 'بَ'], emoji: '🚴', category: 'أفعال' },
  { word: 'جَلَسَ', letters: ['جَ', 'لَ', 'سَ'], phonics: ['جَ', 'لَ', 'سَ'], emoji: '🪑', category: 'أفعال' },
  { word: 'وَقَفَ', letters: ['وَ', 'قَ', 'فَ'], phonics: ['وَ', 'قَ', 'فَ'], emoji: '🧍', category: 'أفعال' },
  { word: 'نَظَرَ', letters: ['نَ', 'ظَ', 'رَ'], phonics: ['نَ', 'ظَ', 'رَ'], emoji: '👀', category: 'أفعال' },
  { word: 'سَمِعَ', letters: ['سَ', 'مِ', 'عَ'], phonics: ['سَ', 'مِ', 'عَ'], emoji: '👂', category: 'أفعال' },
  { word: 'فَتَحَ', letters: ['فَ', 'تَ', 'حَ'], phonics: ['فَ', 'تَ', 'حَ'], emoji: '🗝️', category: 'أفعال' },
  { word: 'سَجَدَ', letters: ['سَ', 'جَ', 'دَ'], phonics: ['سَ', 'جَ', 'دَ'], emoji: '🤲', category: 'أفعال' }
]

// ── 2. EXTENSIVE ENGLISH VOCABULARY BANK ──
export const ENGLISH_WORDS_BANK = [
  // Short A CVC
  { word: 'cat', letters: ['c', 'a', 't'], phonics: ['k', 'æ', 't'], emoji: '🐱', category: 'Animals', blend12: 'ca' },
  { word: 'bat', letters: ['b', 'a', 't'], phonics: ['b', 'æ', 't'], emoji: '🦇', category: 'Animals', blend12: 'ba' },
  { word: 'hat', letters: ['h', 'a', 't'], phonics: ['h', 'æ', 't'], emoji: '🎩', category: 'Objects', blend12: 'ha' },
  { word: 'rat', letters: ['r', 'a', 't'], phonics: ['r', 'æ', 't'], emoji: '🐀', category: 'Animals', blend12: 'ra' },
  { word: 'can', letters: ['c', 'a', 'n'], phonics: ['k', 'æ', 'n'], emoji: '🥫', category: 'Objects', blend12: 'ca' },
  { word: 'fan', letters: ['f', 'a', 'n'], phonics: ['f', 'æ', 'n'], emoji: '🪭', category: 'Objects', blend12: 'fa' },
  { word: 'man', letters: ['m', 'a', 'n'], phonics: ['m', 'æ', 'n'], emoji: '👨', category: 'People', blend12: 'ma' },
  { word: 'pan', letters: ['p', 'a', 'n'], phonics: ['p', 'æ', 'n'], emoji: '🍳', category: 'Objects', blend12: 'pa' },
  { word: 'van', letters: ['v', 'a', 'n'], phonics: ['v', 'æ', 'n'], emoji: '🚐', category: 'Vehicles', blend12: 'va' },
  { word: 'cap', letters: ['c', 'a', 'p'], phonics: ['k', 'æ', 'p'], emoji: '🧢', category: 'Objects', blend12: 'ca' },
  { word: 'map', letters: ['m', 'a', 'p'], phonics: ['m', 'æ', 'p'], emoji: '🗺️', category: 'Objects', blend12: 'ma' },
  { word: 'jam', letters: ['j', 'a', 'm'], phonics: ['dʒ', 'æ', 'm'], emoji: '🍯', category: 'Food', blend12: 'ja' },
  { word: 'bag', letters: ['b', 'a', 'g'], phonics: ['b', 'æ', 'g'], emoji: '🎒', category: 'Objects', blend12: 'ba' },

  // Short E CVC
  { word: 'pen', letters: ['p', 'e', 'n'], phonics: ['p', 'e', 'n'], emoji: '🖊️', category: 'Objects', blend12: 'pe' },
  { word: 'hen', letters: ['h', 'e', 'n'], phonics: ['h', 'e', 'n'], emoji: '🐔', category: 'Animals', blend12: 'he' },
  { word: 'ten', letters: ['t', 'e', 'n'], phonics: ['t', 'e', 'n'], emoji: '🔟', category: 'Numbers', blend12: 'te' },
  { word: 'bed', letters: ['b', 'e', 'd'], phonics: ['b', 'e', 'd'], emoji: '🛏️', category: 'Objects', blend12: 'be' },
  { word: 'red', letters: ['r', 'e', 'd'], phonics: ['r', 'e', 'd'], emoji: '🔴', category: 'Colors', blend12: 're' },
  { word: 'leg', letters: ['l', 'e', 'g'], phonics: ['l', 'e', 'g'], emoji: '🦵', category: 'Body', blend12: 'le' },
  { word: 'net', letters: ['n', 'e', 't'], phonics: ['n', 'e', 't'], emoji: '🥅', category: 'Objects', blend12: 'ne' },
  { word: 'pet', letters: ['p', 'e', 't'], phonics: ['p', 'e', 't'], emoji: '🐕', category: 'Animals', blend12: 'pe' },
  { word: 'jet', letters: ['j', 'e', 't'], phonics: ['dʒ', 'e', 't'], emoji: '✈️', category: 'Vehicles', blend12: 'je' },

  // Short I CVC
  { word: 'pig', letters: ['p', 'i', 'g'], phonics: ['p', 'ɪ', 'g'], emoji: '🐷', category: 'Animals', blend12: 'pi' },
  { word: 'big', letters: ['b', 'i', 'g'], phonics: ['b', 'ɪ', 'g'], emoji: '🐘', category: 'Sizes', blend12: 'bi' },
  { word: 'pin', letters: ['p', 'i', 'n'], phonics: ['p', 'ɪ', 'n'], emoji: '📌', category: 'Objects', blend12: 'pi' },
  { word: 'bin', letters: ['b', 'i', 'n'], phonics: ['b', 'ɪ', 'n'], emoji: '🗑️', category: 'Objects', blend12: 'bi' },
  { word: 'win', letters: ['w', 'i', 'n'], phonics: ['w', 'ɪ', 'n'], emoji: '🏆', category: 'Actions', blend12: 'wi' },
  { word: 'lip', letters: ['l', 'i', 'p'], phonics: ['l', 'ɪ', 'p'], emoji: '👄', category: 'Body', blend12: 'li' },
  { word: 'zip', letters: ['z', 'i', 'p'], phonics: ['z', 'ɪ', 'p'], emoji: '🤐', category: 'Objects', blend12: 'zi' },
  { word: 'six', letters: ['s', 'i', 'x'], phonics: ['s', 'ɪ', 'ks'], emoji: '6️⃣', category: 'Numbers', blend12: 'si' },
  { word: 'sit', letters: ['s', 'i', 't'], phonics: ['s', 'ɪ', 't'], emoji: '🪑', category: 'Actions', blend12: 'si' },

  // Short O CVC
  { word: 'dog', letters: ['d', 'o', 'g'], phonics: ['d', 'ɒ', 'g'], emoji: '🐶', category: 'Animals', blend12: 'do' },
  { word: 'fox', letters: ['f', 'o', 'x'], phonics: ['f', 'ɒ', 'ks'], emoji: '🦊', category: 'Animals', blend12: 'fo' },
  { word: 'box', letters: ['b', 'o', 'x'], phonics: ['b', 'ɒ', 'ks'], emoji: '📦', category: 'Objects', blend12: 'bo' },
  { word: 'pot', letters: ['p', 'o', 't'], phonics: ['p', 'ɒ', 't'], emoji: '🍲', category: 'Objects', blend12: 'po' },
  { word: 'hot', letters: ['h', 'o', 't'], phonics: ['h', 'ɒ', 't'], emoji: '🔥', category: 'Weather', blend12: 'ho' },
  { word: 'dot', letters: ['d', 'o', 't'], phonics: ['d', 'ɒ', 't'], emoji: '🔴', category: 'Shapes', blend12: 'do' },
  { word: 'mop', letters: ['m', 'o', 'p'], phonics: ['m', 'ɒ', 'p'], emoji: '🧹', category: 'Objects', blend12: 'mo' },
  { word: 'top', letters: ['t', 'o', 'p'], phonics: ['t', 'ɒ', 'p'], emoji: '🔝', category: 'Objects', blend12: 'to' },
  { word: 'log', letters: ['l', 'o', 'g'], phonics: ['l', 'ɒ', 'g'], emoji: '🪵', category: 'Nature', blend12: 'lo' },

  // Short U CVC
  { word: 'sun', letters: ['s', 'u', 'n'], phonics: ['s', 'ʌ', 'n'], emoji: '☀️', category: 'Nature', blend12: 'su' },
  { word: 'bus', letters: ['b', 'u', 's'], phonics: ['b', 'ʌ', 's'], emoji: '🚌', category: 'Vehicles', blend12: 'bu' },
  { word: 'cup', letters: ['c', 'u', 'p'], phonics: ['k', 'ʌ', 'p'], emoji: '☕', category: 'Objects', blend12: 'cu' },
  { word: 'bug', letters: ['b', 'u', 'g'], phonics: ['b', 'ʌ', 'g'], emoji: '🐛', category: 'Animals', blend12: 'bu' },
  { word: 'hug', letters: ['h', 'u', 'g'], phonics: ['h', 'ʌ', 'g'], emoji: '🫂', category: 'Actions', blend12: 'hu' },
  { word: 'jug', letters: ['j', 'u', 'g'], phonics: ['dʒ', 'ʌ', 'g'], emoji: '🏺', category: 'Objects', blend12: 'ju' },
  { word: 'mug', letters: ['m', 'u', 'g'], phonics: ['m', 'ʌ', 'g'], emoji: '🍺', category: 'Objects', blend12: 'mu' },
  { word: 'nut', letters: ['n', 'u', 't'], phonics: ['n', 'ʌ', 't'], emoji: '🥜', category: 'Food', blend12: 'nu' },
  { word: 'cut', letters: ['c', 'u', 't'], phonics: ['k', 'ʌ', 't'], emoji: '✂️', category: 'Actions', blend12: 'cu' },
  { word: 'run', letters: ['r', 'u', 'n'], phonics: ['r', 'ʌ', 'n'], emoji: '🏃', category: 'Actions', blend12: 'ru' },
  { word: 'tub', letters: ['t', 'u', 'b'], phonics: ['t', 'ʌ', 'b'], emoji: '🛁', category: 'Objects', blend12: 'tu' }
]

// ── 3. PROCEDURAL WORD GENERATOR HELPERS ──
const ARABIC_ALPHABET = ['أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي']
const ENGLISH_ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')

// ── 4. INFINITE CAR BLENDING ADAPTER ──
export function getInfiniteCarWord(lang, index) {
  const bank = lang === 'arabic' ? ARABIC_WORDS_BANK : ENGLISH_WORDS_BANK
  const len = bank.length
  const item = bank[index % len]

  return {
    ...item,
    id: `${lang}-${index}-${item.word}`,
    roundNumber: index + 1
  }
}

// ── 5. INFINITE CLAW MACHINE ADAPTER ──
export function getInfiniteClawWord(lang, index) {
  const bank = lang === 'arabic' ? ARABIC_WORDS_BANK : ENGLISH_WORDS_BANK
  const item = bank[index % bank.length]
  
  // Choose missing index: cycle or random
  const letters = [...item.letters]
  const missingIdx = (index + (letters.length > 2 ? 1 : 0)) % letters.length
  const correctLetter = letters[missingIdx]

  return {
    id: `${lang}-${index}-${item.word}`,
    word: item.word,
    letters: letters,
    missingIdx: missingIdx,
    emoji: item.emoji,
    soundTarget: correctLetter,
    category: item.category,
    roundNumber: index + 1
  }
}

// ── 6. INFINITE BLENDING ROCKS ADAPTER ──
export function getInfiniteBlendingRockWord(lang, index) {
  const bank = lang === 'arabic' ? ARABIC_WORDS_BANK : ENGLISH_WORDS_BANK
  const item = bank[index % bank.length]
  
  // Format for rocks
  const letters = [...item.letters]
  const phonics = [...item.phonics]

  return {
    id: `${lang}-rock-${index}-${item.word}`,
    word: item.word,
    imageEmoji: item.emoji,
    letters: letters,
    phonics: phonics,
    pronouncePhonics: letters,
    blend12: letters.length >= 2 ? `${letters[0]}${letters[1]}` : letters[0],
    category: item.category,
    roundNumber: index + 1
  }
}

// ── 7. INFINITE TRAIN LEVEL ADAPTER ──
export function getInfiniteTrainLevel(subject, levelIndex) {
  const roundNum = levelIndex + 1

  if (subject === 'arabic') {
    const item = ARABIC_WORDS_BANK[levelIndex % ARABIC_WORDS_BANK.length]
    const word = item.word
    // Choose cut point
    const splitIdx = Math.floor(word.length / 2)
    const correct = word[splitIdx]
    const part1 = word.slice(0, splitIdx)
    const part2 = word.slice(splitIdx + 1)

    // Generate 3 unique distractors
    const options = [correct]
    while (options.length < 4) {
      const randChar = ARABIC_ALPHABET[Math.floor(Math.random() * ARABIC_ALPHABET.length)]
      if (!options.includes(randChar)) {
        options.push(randChar)
      }
    }
    options.sort(() => Math.random() - 0.5)

    return {
      word: word,
      parts: [part1, part2],
      correct: correct,
      options: options,
      emoji: item.emoji,
      hint: `الحرف الناقص في كلمة: ${word}`,
      roundNumber: roundNum
    }
  }

  if (subject === 'english') {
    const item = ENGLISH_WORDS_BANK[levelIndex % ENGLISH_WORDS_BANK.length]
    const word = item.word.toUpperCase()
    const splitIdx = Math.floor(word.length / 2)
    const correct = word[splitIdx]
    const part1 = word.slice(0, splitIdx)
    const part2 = word.slice(splitIdx + 1)

    const options = [correct]
    const vowels = ['A', 'E', 'I', 'O', 'U']
    while (options.length < 4) {
      const rand = Math.random() < 0.6 
        ? vowels[Math.floor(Math.random() * vowels.length)]
        : String.fromCharCode(65 + Math.floor(Math.random() * 26))
      if (!options.includes(rand)) {
        options.push(rand)
      }
    }
    options.sort(() => Math.random() - 0.5)

    return {
      word: word,
      parts: [part1, part2],
      correct: correct,
      options: options,
      emoji: item.emoji,
      hint: `Missing letter in: ${word}`,
      roundNumber: roundNum
    }
  }

  // Math infinite procedural level
  const mode = levelIndex % 4
  if (mode === 0) {
    // Addition
    const max = Math.min(50, 10 + Math.floor(levelIndex / 2))
    const n1 = Math.floor(Math.random() * max) + 1
    const n2 = Math.floor(Math.random() * max) + 1
    const ans = n1 + n2
    const options = [ans]
    while (options.length < 4) {
      const wrong = ans + (Math.floor(Math.random() * 7) - 3)
      if (wrong >= 0 && !options.includes(wrong)) options.push(wrong)
    }
    options.sort(() => Math.random() - 0.5)

    return {
      word: `${n1} + ${n2} = ${ans}`,
      parts: [`${n1} + ${n2} = `, ''],
      correct: String(ans),
      options: options.map(String),
      emoji: '➕',
      hint: 'اجمع الرقمين للحصول على الناتج الصحيح',
      roundNumber: roundNum
    }
  } else if (mode === 1) {
    // Subtraction
    const max = Math.min(50, 15 + Math.floor(levelIndex / 2))
    let n1 = Math.floor(Math.random() * max) + 2
    let n2 = Math.floor(Math.random() * n1) + 1
    const ans = n1 - n2
    const options = [ans]
    while (options.length < 4) {
      const wrong = ans + (Math.floor(Math.random() * 7) - 3)
      if (wrong >= 0 && !options.includes(wrong)) options.push(wrong)
    }
    options.sort(() => Math.random() - 0.5)

    return {
      word: `${n1} - ${n2} = ${ans}`,
      parts: [`${n1} - ${n2} = `, ''],
      correct: String(ans),
      options: options.map(String),
      emoji: '➖',
      hint: 'اطرح الرقمين للحصول على الناتج الصحيح',
      roundNumber: roundNum
    }
  } else if (mode === 2) {
    // Sequences
    const step = [1, 2, 5, 10][levelIndex % 4]
    const start = Math.floor(Math.random() * 10) + 1
    const s1 = start
    const s2 = start + step
    const s3 = start + step * 2
    const s4 = start + step * 3
    const correct = s3

    const options = [correct]
    while (options.length < 4) {
      const wrong = correct + (Math.floor(Math.random() * 5) - 2) * step
      if (wrong > 0 && !options.includes(wrong)) options.push(wrong)
    }
    options.sort(() => Math.random() - 0.5)

    return {
      word: `${s1}, ${s2}, ${s3}, ${s4}`,
      parts: [`${s1}, ${s2}, `, `, ${s4}`],
      correct: String(correct),
      options: options.map(String),
      emoji: '🔢',
      hint: 'أكمل النمط العددي التالي',
      roundNumber: roundNum
    }
  } else {
    // Multiplication for higher rounds or simple repeated addition
    const n1 = (levelIndex % 9) + 2
    const n2 = Math.floor(Math.random() * 9) + 2
    const ans = n1 * n2
    const options = [ans]
    while (options.length < 4) {
      const wrong = ans + (Math.floor(Math.random() * 7) - 3) * n1
      if (wrong > 0 && !options.includes(wrong)) options.push(wrong)
    }
    options.sort(() => Math.random() - 0.5)

    return {
      word: `${n1} × ${n2} = ${ans}`,
      parts: [`${n1} × ${n2} = `, ''],
      correct: String(ans),
      options: options.map(String),
      emoji: '✖️',
      hint: 'احسب حاصل الضرب الصحيح',
      roundNumber: roundNum
    }
  }
}

// ── 8. INFINITE PUZZLE ADAPTER ──
export function getInfinitePuzzleLevel(subject, levelIndex) {
  const roundNum = levelIndex + 1

  if (subject === 'arabic') {
    const item = ARABIC_WORDS_BANK[levelIndex % ARABIC_WORDS_BANK.length]
    // Clean word without tashkeel for puzzle tiles
    const cleanWord = item.word.replace(/[\u064B-\u0652]/g, '')
    return {
      word: cleanWord,
      image: item.emoji,
      hint: `رتّب حروف كلمة: ${item.word} (${item.category})`,
      roundNumber: roundNum
    }
  }

  if (subject === 'english') {
    const item = ENGLISH_WORDS_BANK[levelIndex % ENGLISH_WORDS_BANK.length]
    return {
      word: item.word.toUpperCase(),
      image: item.emoji,
      hint: `Arrange letters for: ${item.word} (${item.category})`,
      roundNumber: roundNum
    }
  }

  // Math puzzle
  const n1 = Math.floor(Math.random() * 9) + 1
  const n2 = Math.floor(Math.random() * 9) + 1
  const sum = n1 + n2
  const formula = `${n1}+${n2}=${sum}`
  return {
    word: formula,
    image: '🧮',
    hint: `رتّب المعادلة الحسابية: ${n1} + ${n2} = ${sum}`,
    roundNumber: roundNum
  }
}

// ── 9. INFINITE QUESTION BANK ADAPTER (Mario, Subway, Tank Battle) ──
export function getInfiniteQuestion(subject, level = 1) {
  if (subject === 'arabic') {
    const mode = Math.random()
    if (mode < 0.6) {
      // Missing letter in vocabulary
      const item = ARABIC_WORDS_BANK[Math.floor(Math.random() * ARABIC_WORDS_BANK.length)]
      const cleanWord = item.word.replace(/[\u064B-\u0652]/g, '')
      const missingIdx = Math.floor(Math.random() * cleanWord.length)
      const missing = cleanWord[missingIdx]
      const display = cleanWord.slice(0, missingIdx) + '_' + cleanWord.slice(missingIdx + 1)

      const options = [missing]
      while (options.length < 4) {
        const rand = ARABIC_ALPHABET[Math.floor(Math.random() * ARABIC_ALPHABET.length)]
        if (!options.includes(rand)) options.push(rand)
      }
      options.sort(() => Math.random() - 0.5)

      return {
        text: `${item.emoji} اختر الحرف الناقص:\n ${display}`,
        answer: missing,
        options: options
      }
    } else if (mode < 0.85) {
      // Meaning / Category
      const item = ARABIC_WORDS_BANK[Math.floor(Math.random() * ARABIC_WORDS_BANK.length)]
      const correct = item.category
      const allCategories = ['حيوانات', 'طيور', 'فواكه', 'طعام', 'طبيعة', 'أدوات', 'مركبات', 'أفعال']
      const options = [correct]
      while (options.length < 4) {
        const rand = allCategories[Math.floor(Math.random() * allCategories.length)]
        if (!options.includes(rand)) options.push(rand)
      }
      options.sort(() => Math.random() - 0.5)

      return {
        text: `ما هو تصنيف كلمة (${item.word} ${item.emoji})؟`,
        answer: correct,
        options: options
      }
    } else {
      // Antonyms / Opposites
      const opposites = [
        { q: 'ما هو عكس كلمة (كَبِير)؟', a: 'صَغِير', options: ['صَغِير', 'طَوِيل', 'سَرِيع', 'جَمِيل'] },
        { q: 'ما هو عكس كلمة (سَرِيع)؟', a: 'بَطِيء', options: ['بَطِيء', 'قَوِيّ', 'عَالٍ', 'قَصِير'] },
        { q: 'ما هو عكس كلمة (حَارّ)؟', a: 'بَارِد', options: ['بَارِد', 'دَافِئ', 'صَعْب', 'مُظْلِم'] },
        { q: 'ما هو عكس كلمة (فَوْقَ)؟', a: 'تَحْتَ', options: ['تَحْتَ', 'أَمَامَ', 'خَلْفَ', 'يَمِينَ'] },
        { q: 'ما هو عكس كلمة (نَهَار)؟', a: 'لَيْل', options: ['لَيْل', 'صَبَاح', 'شَمْس', 'نُور'] },
        { q: 'ما هو عكس كلمة (فَرِحَ)؟', a: 'حَزِنَ', options: ['حَزِنَ', 'ضَحِكَ', 'نَامَ', 'جَرَى'] }
      ]
      const opp = opposites[Math.floor(Math.random() * opposites.length)]
      return {
        text: opp.q,
        answer: opp.a,
        options: [...opp.options].sort(() => Math.random() - 0.5)
      }
    }
  }

  if (subject === 'english') {
    const mode = Math.random()
    if (mode < 0.7) {
      // Missing letter in CVC word
      const item = ENGLISH_WORDS_BANK[Math.floor(Math.random() * ENGLISH_WORDS_BANK.length)]
      const word = item.word.toUpperCase()
      const missingIdx = Math.floor(Math.random() * word.length)
      const missing = word[missingIdx]
      const display = word.slice(0, missingIdx) + '_' + word.slice(missingIdx + 1)

      const options = [missing]
      while (options.length < 4) {
        const rand = String.fromCharCode(65 + Math.floor(Math.random() * 26))
        if (!options.includes(rand)) options.push(rand)
      }
      options.sort(() => Math.random() - 0.5)

      return {
        text: `${item.emoji} Fill the missing letter:\n ${display}`,
        answer: missing,
        options: options
      }
    } else {
      // Basic English Translation / Vocabulary
      const item = ENGLISH_WORDS_BANK[Math.floor(Math.random() * ENGLISH_WORDS_BANK.length)]
      const arabicItem = ARABIC_WORDS_BANK.find(a => a.emoji === item.emoji)
      if (arabicItem) {
        const options = [item.word.toUpperCase()]
        while (options.length < 4) {
          const rand = ENGLISH_WORDS_BANK[Math.floor(Math.random() * ENGLISH_WORDS_BANK.length)].word.toUpperCase()
          if (!options.includes(rand)) options.push(rand)
        }
        options.sort(() => Math.random() - 0.5)

        return {
          text: `Translate (${arabicItem.word} ${item.emoji}) to English:`,
          answer: item.word.toUpperCase(),
          options: options
        }
      }
    }
  }

  // Math infinite questions
  let num1, num2, operator, answer
  let maxNum = level === 1 ? 12 : level === 2 ? 30 : 60

  const operators = ['+', '-']
  if (level >= 2) operators.push('*')
  if (level >= 3) operators.push('/')

  operator = operators[Math.floor(Math.random() * operators.length)]

  if (operator === '+') {
    num1 = Math.floor(Math.random() * maxNum) + 1
    num2 = Math.floor(Math.random() * maxNum) + 1
    answer = num1 + num2
  } else if (operator === '-') {
    num1 = Math.floor(Math.random() * maxNum) + 2
    num2 = Math.floor(Math.random() * num1) + 1
    answer = num1 - num2
  } else if (operator === '*') {
    num1 = Math.floor(Math.random() * 10) + 1
    num2 = Math.floor(Math.random() * 10) + 1
    answer = num1 * num2
  } else {
    num2 = Math.floor(Math.random() * 8) + 2
    answer = Math.floor(Math.random() * 10) + 1
    num1 = answer * num2
  }

  const options = [answer]
  while (options.length < 4) {
    const wrong = answer + (Math.floor(Math.random() * 9) - 4)
    if (wrong >= 0 && !options.includes(wrong) && wrong !== answer) {
      options.push(wrong)
    }
  }
  options.sort(() => Math.random() - 0.5)

  return {
    text: `${num1} ${operator} ${num2} = ?`,
    answer: answer.toString(),
    options: options.map(String)
  }
}
