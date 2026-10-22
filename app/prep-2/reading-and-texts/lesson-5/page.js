'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Headphones, Award, BookOpen } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import VocabularySection from '../../components/VocabularySection'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'
import { PREP2_QUIZZES } from '../../data/prep2_quizzes'

export default function Lesson5() {
  const authorBio = {
    title: 'مَدْخَلٌ إِلَى نَصِّ الِاسْتِمَاعِ «أَقْدَمُ وَدِيعَةٍ فِي يَدِ المِصْرِيِّ»',
    text: 'نَهْرُ النِّيلِ هُوَ شِرْيَانُ الحَيَاةِ فِي مِصْرَ، وَأَعْظَمُ هِبَةٍ رَبَّانِيَّةٍ تَشَكَّلَتْ حَوْلَهَا أَقْدَمُ حَضَارَاتِ التَّارِيخِ. اعْتَبَرَهُ المِصْرِيُّ القَدِيمُ أَمَانَةً مُقَدَّسَةً وَأَقْدَمَ وَدِيعَةٍ ائْتُمِنَ عَلَيْهَا، فَأَقْسَمَ أَنْ يَحْفَظَ مَاءَهُ نَقِيّاً، وَيَسْتَمِرُّ هَذَا الوَاجِبُ الوَطَنِيُّ وَالأَخْلَاقِيُّ عَلَى مَرِّ الأَجْيَالِ لِحِمَايَةِ مِيَاهِهِ مِنَ التَّلَوُّثِ وَالإِسْرَافِ.'
  }

  const paragraphs = [
    {
      id: 'p1',
      title: '١- النِّيلُ شِرْيَانُ الوُجُودِ وَأَعْرَقُ وَدِيعَةٍ بَيْنَ يَدَيِ المِصْرِيِّ',
      text: `«مُنْذُ فَجْرِ التَّارِيخِ، تَدَفَّقَ نَهْرُ النِّيلِ الخَالِدُ يَشُقُّ أَرْضَ مِصْرَ كَشِرْيَانِ حَيَاةٍ يَبْعَثُ النَّمَاءَ وَالخِصْبَ فِي رُبُوعِهَا. وَلَمْ يَكُنِ النِّيلُ مُجَرَّدَ مَجْرَى مَائِيٍّ، بَلْ كَانَ أَقْدَمَ وَدِيعَةٍ حَمَلَهَا المِصْرِيُّ فِي عُنُقِهِ، وَتَعَلَّمَ مِنْ جَرَيَانِهِ العَطَاءَ، وَالصَّبْرَ، وَالوَفَاءَ لِلأَرْضِ الَّتِي ارْتَوَتْ بِعُذُوبَتِهِ، فَصَنَعَتْ أَعْظَمَ حَضَارَةٍ زِرَاعِيَّةٍ عَرَفَهَا البَشَرُ.»`
    },
    {
      id: 'p2',
      title: '٢- تَقْدِيسُ الأَجْدَادِ لِلنِّيلِ فِي عَقَائِدِهِمْ وَكِتَابِ المَوْتَى',
      text: `«تَجَلَّتْ عَظَمَةُ مِصْرَ القَدِيمَةِ فِي تَقْدِيسِهَا لِمِيَاهِ النِّيلِ؛ إِذْ نَظَرَ المِصْرِيُّ إِلَى تَلْوِيثِ النَّهْرِ بِاعْتِبَارِهِ إِثْماً عَظِيماً يُعَاقَبُ عَلَيْهِ فِي الدُّنْيَا وَالآخِرَةِ. وَكَانَ المُتَوَفَّى فِي مُحَاكَمَتِهِ يَقِفُ لِيُبَرِّئَ نَفْسَهُ أَمَامَ الآلِهَةِ قَائِلاً: "لَمْ أُدَنِّسْ مَاءَ النِّيلِ أَبَداً، وَلَمْ أَمْنَعِ المَاءَ الجَارِيَ عَنْ كَائِنٍ حَيٍّ". وَهَذَا يُثْبِتُ أَنَّ الوَعْيَ البِيئِيَّ كَانَ رُكْناً أَسَاسِيّاً فِي ضَمِيرِ المِصْرِيِّ القَدِيمِ.»`
    },
    {
      id: 'p3',
      title: '٣- حِمَايَةُ النِّيلِ فِي العَصْرِ الحَدِيثِ وَوَاجِبُ الأَجْيَالِ',
      text: `«إِنَّ تِلْكَ الوَدِيعَةَ التَّارِيخِيَّةَ تَتَطَلَّبُ مِنَّا اليَوْمَ وِقْفَةَ حَزْمٍ وَمَسْؤُولِيَّةٍ؛ فَالزِّيَادَةُ السُّكَّانِيَّةُ وَالتَّحَدِّيَاتُ البِيئِيَّةُ تُحَتِّمُ عَلَيْنَا تَرْشِيدَ اسْتِهْلَاكِ المِيَاهِ، وَاسْتِخْدَامَ نُظُمِ الرَّيِّ الحَدِيثَةِ، وَالتَّصَدِّيَ الحَاسِمَ لِإِلْقَاءِ المُخَلَّفَاتِ أَوْ صَرْفِ المُلَوِّثَاتِ فِي مَجْرَاهُ، فَمِيَاهُ النِّيلِ خَطٌّ أَحْمَرُ وَحَقٌّ مَصُونٌ لَنَا وَلأَبْنَائِنَا مِنْ بَعْدِنَا.»`
    }
  ]

  const vocabList = [
    { word: 'وَدِيعَة', meaning: 'أمانة تُترك للحفظ والرعاية', plural: 'وَدَائِع' },
    { word: 'شِرْيَان', meaning: 'وعاء الدم، والمراد: مصدر الحياة الأساسي', plural: 'شَرَايِين' },
    { word: 'النَّمَاء', meaning: 'الزيادة والخير والبركة والازدهار' },
    { word: 'الخِصْب', meaning: 'النماء ووفرة الزرع والغذاء', opposite: 'الجدب والقحط' },
    { word: 'تَجَلَّتْ', meaning: 'ظهرت وبانت ووضحت' },
    { word: 'إِثْم', meaning: 'ذنب وجرم عظيم', plural: 'آثَام' },
    { word: 'أُدَنِّسْ', meaning: 'ألوث وأقذر', opposite: 'أنظف وأطهر وأصون' },
    { word: 'تَرْشِيد', meaning: 'تنظيم وحسن استخدام ومنع الإسراف', opposite: 'تبذير وإهدار' },
    { word: 'مَصُون', meaning: 'محفوظ ومحمي بعناية', opposite: 'مُهدَر ومُضيَّع' }
  ]

  const questions = [
    {
      q: 'س1: لمَ عُدَّ نهر النيل «أقدم وديعة في يد المصري»؟',
      a: 'لأنه هبة الله العظمى لمصر وشريان حضارتها، استلمه الأجداد منذ فجر التاريخ وحافظوا على نقائه وأمانته عبر القرون.'
    },
    {
      q: 'س2: كيف عبر المصري القديم عن براءته البيئية تجاه النيل؟',
      a: 'كان يقسم في محكمته الأخروية قائلاً: «لم أدنس ماء النيل أبداً، ولم أمنع الماء الجاري عن كائن حي».'
    },
    {
      q: 'س3: ما واجبنا المعاصر لحماية نهر النيل؟',
      a: 'ترشيد الاستهلاك، واستخدام أساليب الري المتطورة كالرش والتنقيط، وتطبيق القوانين الصارمة لمنع إلقاء المخلفات والملوثات في مجراه.'
    }
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-2/reading-and-texts" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <Headphones size={18} />
                <span>نص استماع - الوحدة الثانية (بيئتي مسؤوليتي)</span>
              </div>
              <h1 className={styles.title}>أقدم وديعة في يد المصري (نهر النيل)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          
          {/* Banner */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '20px', marginBottom: '30px' }}>
            <h3 style={{ color: '#166534', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem' }}>
              <Award size={22} />
              {authorBio.title}
            </h3>
            <p style={{ color: '#15803d', lineHeight: '1.8', margin: 0, fontSize: '0.95rem' }}>
              {authorBio.text}
            </p>
          </div>

          <h2 style={{ color: '#059669', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} /> فقرات نص الاستماع
          </h2>

          {/* Paragraphs */}
          {paragraphs.map((para) => (
            <ParagraphCard
              key={para.id}
              id={`lesson5-${para.id}`}
              title={para.title}
              text={para.text}
            />
          ))}

          {/* Vocabulary Section */}
          <VocabularySection
            title="معاني المفردات واللغويات (أقدم وديعة في يد المصري)"
            vocabList={vocabList}
            id="lesson5-vocab"
          />

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP2_QUIZZES['reading-5'] && (
            <div id="quiz">
              <InteractiveQuiz
                quizData={PREP2_QUIZZES['reading-5']}
                id="lesson5-quiz"
              />
            </div>
          )}

          {/* Comprehension Questions */}
          <QuestionsCard
            title="تدريبات وأسئلة الفهم والمناقشة"
            questions={questions}
            id="lesson5-questions"
          />
        </div>
      </div>
    </div>
  )
}
