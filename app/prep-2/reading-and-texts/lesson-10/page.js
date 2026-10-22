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

export default function Lesson10() {
  const authorBio = {
    title: 'نُبْذَةٌ عَنِ العَبْقَرِيِّ الإِسْلَامِيِّ «أَبِي عَبْدِ اللهِ الخُوَارِزْمِيِّ»',
    text: 'عَالِمُ رِيَاضِيَّاتٍ وَفَلَكٍ وَجُغْرَافْيَا مُسْلِمٌ، وُلِدَ حَوَالَيْ عَامِ 781م. عَمِلَ فِي "بَيْتِ الحِكْمَةِ" بِبَغْدَادَ فِي عَهْدِ الخَلِيفَةِ المَأْمُونِ. يُعَدُّ المُؤَسِّسَ الفِعْلِيَّ لِعِلْمِ الجَبْرِ، وَمُبْتَكِرَ الصِّفْرِ وَالنِّظَامِ العَشْرِيِّ فِي الرِّيَاضِيَّاتِ، وَعَنْ اسْمِهِ اشْتُقَّ مُصْطَلَحُ "الخُوَارِزْمِيَّاتِ" (Algorithms) الَّتِي يَقُومُ عَلَيْهَا عَالَمُ الحَاسُوبِ الحَدِيثِ. تُوُفِّيَ حَوَالَيْ عَامِ 847م.'
  }

  const paragraphs = [
    {
      id: 'p1',
      title: '١- النَّشْأَةُ فِي بَيْتِ الحِكْمَةِ وَالنُّبُوغُ العِلْمِيُّ',
      text: `«فِي عَصْرِ الازْدِهَارِ الحَضَارِيِّ الإِسْلَامِيِّ، شَهِدَتْ بَغْدَادُ حَرَكَةً عِلْمِيَّةً مَائِجَةً قَادَهَا "بَيْتُ الحِكْمَةِ"، وَهُنَاكَ لَمَعَ نَجْمُ أَبِي عَبْدِ اللهِ مُحَمَّد بْنِ مُوسَى الخُوَارِزْمِيِّ. عَكَفَ العَالِمُ الجَلِيلُ عَلَى دِرَاسَةِ عُلُومِ مَنْ سَبَقُوهُ مِنَ الهُنُودِ وَاليُونَانِ وَالفُرْسِ، فَهَضَمَهَا بِعَقْلِيَّةٍ نَاقِدَةٍ، وَانْطَلَقَ يُؤَسِّسُ لِمَنْهَجٍ رِيَاضِيٍّ جَدِيدٍ غَيَّرَ مَجْرَى التَّارِيخِ الإِنْسَانِيِّ كُلِّهِ.»`
    },
    {
      id: 'p2',
      title: '٢- ابْتِكَارُ الصِّفْرِ وَتَأْسِيسُ عِلْمِ الجَبْرِ وَالمُقَابَلَةِ',
      text: `«أَحْدَثَ الخُوَارِزْمِيُّ ثَوْرَةً هَائِلَةً فِي عَالَمِ الأَرْقَامِ؛ حِينَ قَدَّمَ "الصِّفْرَ" لِلْبَشَرِيَّةِ؛ مِمَّا أَعْطَى لِلأَرْقَامِ مَرَاتِبَ وَقِيَماً لَا نِهَايَةَ لَهَا، وَسَهَّلَ العَمَلِيَّاتِ الحِسَابِيَّةَ المُعَقَّدَةَ. كَمَا أَلَّفَ كِتَابَهُ الخَالِدَ "المُخْتَصَر فِي حِسَابِ الجَبْرِ وَالمُقَابَلَةِ"، فَكَانَ أَوَّلَ مَنْ فَصَلَ الجَبْرَ عَنِ الهَنْدَسَةِ، وَوَضَعَ قَوَاعِدَ حَلِّ المُعَادَلَاتِ؛ لِتَتَرَسَّخَ بِذَلِكَ أُسُسُ عِلْمٍ لَا غِنَى عَنْهُ لِأَيِّ تَقَدُّمٍ تِكْنُولُوجِيٍّ.»`
    },
    {
      id: 'p3',
      title: '٣- عِنْدَمَا يَكُونُ العِلْمُ رِسَالَةً لِخِدْمَةِ الإِنْسَانِ',
      text: `«لَمْ يَكُنِ الخُوَارِزْمِيُّ عَالِماً يَعِيشُ فِي بُرْجٍ عَاجِيٍّ بَعِيداً عَنِ النَّاسِ، بَلْ كَانَ يُؤْمِنُ بِأَنَّ العِلْمَ رِسَالَةٌ لِخِدْمَةِ الخَلْقِ. لِذَلِكَ بَيَّنَ فِي مُقَدِّمَةِ كُتُبِهِ أَنَّهُ سَخَّرَ قَوَانِينَهُ لِتَسْهِيلِ حِسَابِ المَوَارِيثِ، وَقِسْمَةِ الوَصَايَا، وَالمُعَامَلَاتِ التِّجَارِيَّةِ، وَمَسَّاحَاتِ الأَرَاضِي، وَحَرَكَةِ الفَلَكِ. فَالْعِلْمُ عِنْدَهُ عِبَادَةٌ وَعَطَاءٌ، وَنَفْعٌ مُتَّصِلٌ يَبْنِي حَضَارَةَ الإِنْسَانِ.»`
    }
  ]

  const vocabList = [
    { word: 'مَائِجَة', meaning: 'ممتلئة بالحركة والنشاط والحيوية' },
    { word: 'عَكَفَ', meaning: 'أقبل على الشيء وتفرغ له ولزمه' },
    { word: 'هَضَمَهَا', meaning: 'فهمها واستوعبها بعمق وإتقان' },
    { word: 'تَتَرَسَّخ', meaning: 'تثبت وتتأصل بقوة' },
    { word: 'بُرْجٍ عَاجِيّ', meaning: 'كناية عن الانعزال والترفع عن مخالطة الناس' },
    { word: 'سَخَّرَ', meaning: 'ذلّل ويسّر ووجّه لخدمة الغرض' },
    { word: 'المَوَارِيث', meaning: 'قسمة التركات وأنصبة الورثة الشرعية', singular: 'مِيرَاث' },
    { word: 'مَسَّاحَات', meaning: 'قياس أبعاد الأرض وحدودها' }
  ]

  const questions = [
    {
      q: 'س1: ما المؤسسة العلمية التي عمل بها الخوارزمي في بغداد؟ وبم اشتغل؟',
      a: 'عمل في «بيت الحكمة» ببغداد، واشتغل بدراسة علوم الرياضيات والفلك والجغرافيا، وترجمة وتطوير المعارف الإنسانية.'
    },
    {
      q: 'س2: ما الابتكاران الأعظمان اللذان قدمهما الخوارزمي للحضارة الإنسانية؟',
      a: 'ابتكار الصفر ونظام المنازل العشرية للأرقام، وتأسيس علم الجبر والمقابلة كعلم مستقل بذاته لحل المعادلات الرياضية.'
    },
    {
      q: 'س3: كيف جعل الخوارزمي من علمه «رسالة» نفعية تخدم المجتمع؟',
      a: 'سخر قوانينه الحسابية لحل المسائل العملية اليومية للناس؛ كقسمة المواريث والتركات، والمعاملات التجارية، ومسح الأراضي وحساب الأفلاك.'
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
                <span>درس قراءة - الوحدة الثالثة (علم وقيم)</span>
              </div>
              <h1 className={styles.title}>عندما يصبح العلم رسالة (الخوارزمي)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          
          {/* Biography Banner */}
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
              id={`lesson10-${para.id}`}
              title={para.title}
              text={para.text}
            />
          ))}

          {/* Vocabulary Section */}
          <VocabularySection
            title="معاني المفردات واللغويات (عندما يصبح العلم رسالة)"
            vocabList={vocabList}
            id="lesson10-vocab"
          />

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP2_QUIZZES['reading-10'] && (
            <div id="quiz">
              <InteractiveQuiz
                quizData={PREP2_QUIZZES['reading-10']}
                id="lesson10-quiz"
              />
            </div>
          )}

          {/* Comprehension Questions */}
          <QuestionsCard
            title="تدريبات وأسئلة الفهم والمناقشة"
            questions={questions}
            id="lesson10-questions"
          />
        </div>
      </div>
    </div>
  )
}
