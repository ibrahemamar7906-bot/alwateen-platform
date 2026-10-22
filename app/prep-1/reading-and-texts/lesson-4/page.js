'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, FileText, Sparkles, BookOpen } from 'lucide-react'
import styles from '../../page.module.css'
import PoetrySection from '../../components/PoetrySection'
import ParagraphCard from '../../components/ParagraphCard'
import VocabularySection from '../../components/VocabularySection'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'
import { PREP1_QUIZZES } from '../../data/prep1_quizzes'

export default function Lesson4() {
  const verses = [
    {
      sadr: 'رَسَمْنَا عَلَى الْقَلْبِ وَجْهَ الْوَطَنْ',
      ajuz: 'نَخِيلًا وَنِيلًا وَشَعْبًا أَصِيلَا'
    },
    {
      sadr: 'وَصَنَاكِ يَا مِصْرُ طُولَ الزَّمَنْ',
      ajuz: 'لِيَبْقَى شَبَابُكِ جِيلًا فَجِيلَا'
    },
    {
      sadr: 'عَلَى كُلِّ أَرْضٍ تَرَكْنَا عَلَامَةْ',
      ajuz: 'قِلَاعًا مِنَ النُّورِ تَحْمِي الْكَرَامَةْ'
    },
    {
      sadr: 'عُرُوبَتُنَا تَفْتَدِيكِ الْقُلُوبْ',
      ajuz: 'وَيَحْمِيكِ بِالدَّمِ جَيْشُ الْكِنَانَةْ'
    },
    {
      sadr: 'وَتَنْسَابُ يَا نِيلُ حُرًّا طَلِيقًا',
      ajuz: 'لِتَحْكِيَ ضِفَافُكَ مَعْنَى النِّضَالِ'
    },
    {
      sadr: 'وَتَبْقَى مَدَى الدَّهْرِ حِصْنًا عَرِيقًا',
      ajuz: 'بِصِدْقِ الْقُلُوبِ وَعَزْمِ الرِّجَالِ'
    },
    {
      sadr: 'يَدُ اللَّهِ يَا مِصْرُ تَرْعَى سَمَاكِ',
      ajuz: 'وَفِي سَاحَةِ الْحَقِّ يَعْلُو نِدَاكِ'
    },
    {
      sadr: 'وَمَا دَامَ جَيْشُكِ يَحْمِي حِمَاكِ',
      ajuz: 'سَتَمْضِي إِلَى النَّصْرِ دَوْمًا خُطَاكِ'
    }
  ]

  const poetBio = {
    title: 'نُبْذَةٌ عَنِ الشَّاعِرِ فَارُوق جُوَيْدَة',
    text: 'شَاعِرٌ مِصْرِيٌّ مُعَاصِرٌ كَبِيرٌ، وُلِدَ بِمُحَافَظَةِ كَفْرِ الشَّيْخِ عَامَ 1946م. تَخَرَّجَ فِي كُلِّيَّةِ الآدَابِ قِسْمِ صَحَافَةٍ، وَيُعَدُّ مِنْ أَبْرَزِ أَصْوَاتِ الشِّعْرِ العَرَبِيِّ المُعَاصِرِ فِي الوَطَنِيَّةِ وَالإِنْسَانِيَّةِ. لَهُ العَدِيدُ مِنَ الدَّوَاوِينِ الشِّعْرِيَّةِ مِثْلَ: "أَوْرَاقٌ فِي حَدِيقَةِ أُكْتُوبَرَ" وَ"آخِرُ لَيَالِي الحُلْمِ"، وَمَسْرَحِيَّاتٍ شِعْرِيَّةٍ شَهِيرَةٍ كَـ "الوَزِيرِ العَاشِقِ".'
  }

  const vocabList = [
    { word: 'وَجْهَ', meaning: 'صورة الوطن وملامحه العزيزة', plural: 'وُجُوه وأَوْجُه' },
    { word: 'أَصِيلَا', meaning: 'عريقاً ثابت الجذور والشرف', opposite: 'دخيلاً', plural: 'أُصلاء وأصائل' },
    { word: 'صُنَّاكِ', meaning: 'حفظناك ورعيناكِ وحميناكِ', opposite: 'ضيّعناكِ وأهملناكِ' },
    { word: 'عَلَامَةْ', meaning: 'أثراً حضارياً وإنجازاً بارزاً', plural: 'عَلَامات' },
    { word: 'قِلَاعًا', meaning: 'حصوناً منيعة وشوامخ', singular: 'قَلْعَة' },
    { word: 'النُّورِ', meaning: 'المراد: العلم والمعرفة والحضارة', opposite: 'الظلام والجهل' },
    { word: 'الْكَرَامَةْ', meaning: 'العزة والشرف والرفعة', opposite: 'الذل والهوان' },
    { word: 'الْكِنَانَةْ', meaning: 'وعاء السهام، والمقصود بها أرض مصر العظيمة', plural: 'كَنَائِن' },
    { word: 'تَنْسَابُ', meaning: 'تجري وتتدفق بسهولة ونعومة', opposite: 'تتوقف وتنحسر' },
    { word: 'طَلِيقًا', meaning: 'حراً لا قيود تعوقه', opposite: 'مقيّداً ومحبوساً', plural: 'طُلَقَاء' },
    { word: 'ضِفَافُكَ', meaning: 'شواطئ النهر وجوانبه', singular: 'ضِفَّة' },
    { word: 'النِّضَالِ', meaning: 'الكفاح والجهاد والدفاع عن الحق', opposite: 'الاستسلام والخضوع' },
    { word: 'الدَّهْرِ', meaning: 'الزمن الطويل الممتد', plural: 'دُهُور وأَدْهُر' },
    { word: 'حِمَاكِ', meaning: 'أرضك وحدودك وديارك المصونة' }
  ]

  const explanation = {
    title: 'الشرح واللمحات البلاغية',
    text: `١- حب الوطن في الوجدان: رسم المصريون حب مصر ونخيلها ونيلها في أعماق قلوبهم، فصار الوطن ينبض في دمائهم.
٢- عهد الحماية والوفاء: عاهد الأبناء مصر على حفظها عبر القرون ليبقى شبابها في عزة وقوة جيلاً بعد جيل.
٣- قلاع الحضارة: ترك المصريون في كل أرض منارة للعلم والحضارة تحمي كرامة الإنسان.
٤- رعاية الله وحماية الجيش: تحيط يد الله مصر برعايتها، ويبقى جيش الكنانة الباسل درعاً يحمي حماها لتمضي دوماً نحو النصر.`,
    notes: '💡 التشبيه البلاغي المقرر: (قلاعاً من النور): تصوير بليغ للعلم والمعرفة بالقلاع والحصون المنيعة التي تحمي كرامة الوطن.'
  }

  const questions = [
    {
      q: 'س1: ما العاطفة المسيطرة على الشاعر فاروق جويدة في النص؟',
      a: 'عاطفة حب الوطن الجياشة، والاعتزاز بتاريخ مصر ونيلها وشعبها، والتفاني في حمايتها ورفعتها جيلاً بعد جيل.'
    },
    {
      q: 'س2: ما الجمال في قول الشاعر: "رسمنا على القلب وجه الوطن"؟',
      a: 'تصوير جميل للوطن بصورة إنسان عزيز تُنقش ملامحه داخل القلوب، مما يدل على عمق الانتماء وثبات حب الوطن في الصدور.'
    },
    {
      q: 'س3: ما دلالة التعبير بـ "جيش الكنانة" في البيت الرابع؟',
      a: 'تعبير يدل على أصالة الجيش المصري وعراقته في حماية مصر عبر التاريخ، وتضحيته بالدم دفاعاً عن ترابها الطاهر.'
    }
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-1/reading-and-texts" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <FileText size={18} />
                <span>نص شعري - الوحدة الأولى (أنا مصري)</span>
              </div>
              <h1 className={styles.title}>وجه الوطن (شعر: فاروق جويدة)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          
          {/* Poet Bio Card */}
          <ParagraphCard
            id="lesson4-bio"
            title={poetBio.title}
            text={poetBio.text}
          />

          {/* Poetry Recitation & Verses Section */}
          <PoetrySection
            title="قصيدة وجه الوطن"
            poet="فاروق جويدة"
            verses={verses}
            id="lesson4-poem"
          />

          {/* Vocabulary Section */}
          <VocabularySection
            title="معاني المفردات واللغويات (نص وجه الوطن)"
            vocabList={vocabList}
            id="lesson4-vocab"
          />

          {/* Explanation & Aesthetics */}
          <ParagraphCard
            id="lesson4-explanation"
            title={explanation.title}
            text={explanation.text}
            notes={explanation.notes}
          />

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP1_QUIZZES['reading-4'] && (
            <InteractiveQuiz
              quizData={PREP1_QUIZZES['reading-4']}
              id="lesson4-quiz"
            />
          )}

          {/* Questions */}
          <QuestionsCard
            title="تدريبات وتذوق أدبي على النص"
            questions={questions}
            id="lesson4-questions"
          />

        </div>
      </div>
    </div>
  )
}
