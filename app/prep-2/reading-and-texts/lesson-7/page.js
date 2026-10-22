'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, FileText, Award, BookOpen } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import VocabularySection from '../../components/VocabularySection'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'
import { PREP2_QUIZZES } from '../../data/prep2_quizzes'

export default function Lesson7() {
  const authorBio = {
    title: 'مَدْخَلٌ إِلَى دَرْسِ «وَاحَةٌ مِصْرِيَّةٌ صَدِيقَةٌ لِلْبِيئَةِ: مَدِينَةُ الخَارِجَةِ»',
    text: 'تُعَدُّ مَدِينَةُ الخَارِجَةِ عَاصِمَةَ مُحَافَظَةِ الوَادِي الجَدِيدِ نَمُوذَجاً مِثَالِيّاً فَرِيداً لِلْمُدُنِ الخَضْرَاءِ؛ حَيْثُ اخْتِيرَتْ كَأَوَّلِ مَدِينَةٍ مِصْرِيَّةٍ صَدِيقَةٍ لِلْبِيئَةِ، وَفَازَتْ بِلَقَبِ "عَاصِمَةِ البِيئَةِ العَرَبِيَّةِ لِعَامِ 2022م". تَمْتَازُ بِخُلُوِّهَا مِنَ المُلَوِّثَاتِ الصِّنَاعِيَّةِ، وَاعْتِمَادِهَا عَلَى الطَّاقَةِ الشَّمْسِيَّةِ النَّظِيفَةِ، وَحِرَفِهَا البِيئِيَّةِ الأَصِيلَةِ.'
  }

  const paragraphs = [
    {
      id: 'p1',
      title: '١- مَوْقِعُ الخَارِجَةِ وَسِحْرُ الوَاحَةِ الطَّبِيعِيَّةِ',
      text: `«فِي قَلْبِ الصَّحْرَاءِ الغَرْبِيَّةِ المِصْرِيَّةِ، تَتَلَأْلَأُ مَدِينَةُ "الخَارِجَةِ" كَوَاحَةٍ غَنَّاءَ تَأْسِرُ الأَلْبَابَ بِجَمَالِ نَخِيلِهَا البَاسِقِ وَعُيُونِهَا المَائِيَّةِ العَذْبَةِ. وَتُعَدُّ الخَارِجَةُ كُبْرَى مُدُنِ الوَادِي الجَدِيدِ، وَقَدْ حَبَاهَا اللهُ طَبِيعَةً بِكْراً وَمُنَاخاً نَقِيّاً جَعَلَهَا مَقْصِداً سِيَاحِيّاً وَبِيئِيّاً مَرْمُوقاً عَلَى المُسْتَوَيَيْنِ المَحَلِّيِّ وَالدَّوْلِيِّ.»`
    },
    {
      id: 'p2',
      title: '٢- رِيَادَةٌ بِيئِيَّةٌ وَعَاصِمَةُ البِيئَةِ العَرَبِيَّةِ',
      text: `«حَقَّقَتِ الخَارِجَةُ إِنْجَازاً تَارِيخِيّاً غَيْرَ مَسْبُوقٍ حِينَ تُوِّجَتْ عَامَ 2022م بِعَاصِمَةِ البِيئَةِ العَرَبِيَّةِ، وَذَلِكَ لِتَحْقِيقِهَا المَعَايِيرَ القِيَاسِيَّةَ لِلتَّنْمِيَةِ المُسْتَدَامَةِ. فَهِيَ مَدِينَةٌ خَالِيَةٌ تَمَاماً مِنْ مُلَوِّثَاتِ المَصَانِعِ الثَّقِيلَةِ، تَعْتَمِدُ عَلَى الطَّاقَةِ الشَّمْسِيَّةِ فِي إِنَارَةِ الشَّوَارِعِ وَتَشْغِيلِ آبَارِ المِيَاهِ، مَعَ انْتِشَارِ زِرَاعَةِ النَّخِيلِ الَّذِي يَمْتَصُّ الكَرْبُونَ وَيُنَقِّي الأَجْوَاءَ.»`
    },
    {
      id: 'p3',
      title: '٣- الحِرَفُ التُّرَاثِيَّةُ وَالتَّنْمِيَةُ الاِقْتِصَادِيَّةُ الخَضْرَاءُ',
      text: `«تَتَكَامَلُ الرُّؤْيَةُ البِيئِيَّةُ فِي الخَارِجَةِ مَعَ الحِفَاظِ عَلَى الهُوِيَّةِ التُّرَاثِيَّةِ؛ حَيْثُ يَبْرَعُ أَهْلُهَا فِي الصِّنَاعَاتِ اليَدَوِيَّةِ القَائِمَةِ عَلَى خَامَاتِ البِيئَةِ المَحَلِّيَّةِ كَالفَخَّارِ وَالخَزَفِ، وَالسَّجَّادِ وَالكِلِيمِ الصُّوفِيِّ، وَتَعْبِئَةِ أَجْوَدِ أَنْوَاعِ التُّمُورِ. وَتُقَدِّمُ الخَارِجَةُ بِذَلِكَ دَرْساً عَمَلِيّاً فِي كَيْفِيَّةِ تَحْوِيلِ حِمَايَةِ البِيئَةِ إِلَى مَصْدَرِ رِزْقٍ وَتَنْمِيَةٍ اقْتِصَادِيَّةٍ مُسْتَدَامَةٍ.»`
    }
  ]

  const vocabList = [
    { word: 'غَنَّاء', meaning: 'كثيرة الشجر والأزهار والنعيم', opposite: 'قاحلة وجرداء' },
    { word: 'تَأْسِرُ الأَلْبَاب', meaning: 'تجذب العقول وتدهش القلوب' },
    { word: 'البَاسِق', meaning: 'الطويل المرتفع الشامخ', plural: 'بَوَاسِق' },
    { word: 'حَبَاهَا', meaning: 'أعطاها ومنحها وأنعم عليها', opposite: 'منعها وحرمها' },
    { word: 'بِكْراً', meaning: 'طبيعية أصيلة لم تمسها يد التلوث' },
    { word: 'مَرْمُوقاً', meaning: 'ذا شأن ومكانة عالية محترمة' },
    { word: 'المَعَايِير', meaning: 'المقاييس والأسس المعتمدة', singular: 'مِعْيَار' },
    { word: 'تَتَكَامَل', meaning: 'تتعاون وتنسجم ليكمل بعضها بعضاً' }
  ]

  const questions = [
    {
      q: 'س1: أين تقع مدينة الخارجة؟ وما اللقب الذي فازت به عام 2022م؟',
      a: 'تقع في محافظة الوادي الجديد بالصحراء الغربية، وفازت بلقب «أول مدينة مصرية صديقة للبيئة وعاصمة البيئة العربية لعام 2022م».'
    },
    {
      q: 'س2: ما المقومات التي جعلت الخارجة مدينة خضراء صديقة للبيئة؟',
      a: 'خلوها من المصانع الملوثة، ونقاء هوائها، واعتمادها على محطات الطاقة الشمسية في تشغيل الآبار والإنارة، وكثافة مزارع النخيل المنقية للجو.'
    },
    {
      q: 'س3: ما الحرف البيئية التراثية التي يشتهر بها أبناء الخارجة؟',
      a: 'صناعة الفخار والخزف اليدوي، وغزل السجاد والكليم الصوفي، وتعبئة وتصنيع التمور الفاخرة.'
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
                <FileText size={18} />
                <span>درس قراءة - الوحدة الثانية (بيئتي مسؤوليتي)</span>
              </div>
              <h1 className={styles.title}>واحة مصرية صديقة للبيئة (مدينة الخارجة)</h1>
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
            <BookOpen size={24} /> محتوى درس القراءة
          </h2>

          {/* Paragraphs */}
          {paragraphs.map((para) => (
            <ParagraphCard
              key={para.id}
              id={`lesson7-${para.id}`}
              title={para.title}
              text={para.text}
            />
          ))}

          {/* Vocabulary Section */}
          <VocabularySection
            title="معاني المفردات واللغويات (واحة مصرية صديقة للبيئة)"
            vocabList={vocabList}
            id="lesson7-vocab"
          />

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP2_QUIZZES['reading-7'] && (
            <div id="quiz">
              <InteractiveQuiz
                quizData={PREP2_QUIZZES['reading-7']}
                id="lesson7-quiz"
              />
            </div>
          )}

          {/* Comprehension Questions */}
          <QuestionsCard
            title="تدريبات وأسئلة الفهم والمناقشة"
            questions={questions}
            id="lesson7-questions"
          />
        </div>
      </div>
    </div>
  )
}
