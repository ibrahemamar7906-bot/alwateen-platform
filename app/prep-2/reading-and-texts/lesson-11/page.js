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

export default function Lesson11() {
  const authorBio = {
    title: 'نُبْذَةٌ عَنِ المُفَكِّرِ الكَبِيرِ «أَحْمَد أَمِين»',
    text: 'أَدِيبٌ وَمُفَكِّرٌ وَمُؤَرِّخٌ مِصْرِيٌّ بَارِزٌ، وُلِدَ عَامَ 1886م بِالقَاهِرَةِ. شَغَلَ مَنْصِبَ عَمِيدِ كُلِّيَّةِ الآدَابِ بِجَامِعَةِ القَاهِرَةِ، وَأَنْشَأَ لَجْنَةَ التَّأْلِيفِ وَالتَّرْجَمَةِ وَالنَّشْرِ. مِنْ أَعْظَمِ مُؤَلَّفَاتِهِ الإِسْلَامِيَّةِ وَالأَدَبِيَّةِ: مَوْسُوعَةُ "فَجْرُ الإِسْلَامِ"، وَ"ضُحَى الإِسْلَامِ"، وَ"فَيْضُ الخَاطِرِ"، وَسِيرَتُهُ الذَّاتِيَّةُ "حَيَاتِي". تُوُفِّيَ عَامَ 1954م.'
  }

  const paragraphs = [
    {
      id: 'p1',
      title: '١- القِرَاءَةُ تُضِيفُ لِلإِنْسَانِ أَعْمَاراً إِلَى عُمْرِهِ',
      text: `«إِنَّ الفِكْرَةَ الوَاحِدَةَ جَدْوَلٌ مُنْفَصِلٌ، أَمَّا الأَفْكَارُ المُتَلَاقِيَةُ فَهِيَ المُحِيطُ الَّذِي تَصُبُّ فِيهِ الجَدَاوِلُ جَمِيعاً. وَالفَرْقُ بَيْنَ الشَّخْصِ القَارِئِ وَغَيْرِ القَارِئِ، كَالْفَرْقِ بَيْنَ مَنْ يَعِيشُ فِي حُجْرَةٍ ضَيِّقَةٍ مُغْلَقَةٍ، وَمَنْ يَقِفُ عَلَى قِمَّةِ جَبَلٍ عَالٍ يَرَى مِنْهُ آفَاقَ الكَوْنِ الفَسِيحِ. فَالْقَارِئُ لَا يَعِيشُ حَيَاتَهُ الفَرْدِيَّةَ المَحْدُودَةَ فَقَطْ، بَلْ يَحْيَا مَعَ كُلِّ كِتَابٍ يَقْرَؤُهُ حَيَاةً جَدِيدَةً، وَيُضِيفُ إِلَى خِبْرَتِهِ عُقُولَ مِئَاتِ الفَلَاسِفَةِ وَالأُدَبَاءِ.»`
    },
    {
      id: 'p2',
      title: '٢- كَيْفَ تَجْلُو القِرَاءَةُ صَدَأَ العُقُولِ وَتُهَذِّبُ النَّفْسَ',
      text: `«تَجْلُو القِرَاءَةُ النَّافِعَةُ صَدَأَ العُقُولِ، وَتُوقِظُ فِي النَّفْسِ مَشَاعِرَ السُّمُوِّ وَالفَضِيلَةِ؛ فَهِيَ تَمْنَحُ العَقْلَ لِيُونَةً فِي التَّفْكِيرِ، وَتَحْمِيهِ مِنَ التَّعَصُّبِ الأَعْمَى، وَتُعَلِّمُهُ أَنْ يَنْظُرَ إِلَى القَضَايَا مِنْ زَوَايَا مُتَعَدِّدَةٍ. كَمَا أَنَّ الكِتَابَ هُوَ الجَلِيسُ الأَمِينُ الَّذِي لَا يُنَافِقُكَ، وَلَا يَمَلُّ مِنْ صُحْبَتِكَ، يُعْطِيكَ زُبْدَةَ حِكْمَتِهِ دُونَ أَنْ يَطْلُبَ مِنْكَ جَزَاءً أَوْ ثَنَاءً.»`
    },
    {
      id: 'p3',
      title: '٣- حُسْنُ اخْتِيَارِ الكُتُبِ وَبِنَاءُ الذَّوْقِ الرَّفِيعِ',
      text: `«لَيْسَتِ العِبْرَةُ بِكَثْرَةِ مَا تَقْرَأُ، بَلْ بِكَيْفِيَّةِ مَا تَقْرَأُ وَأَثَرِهِ فِي صِيَاغَةِ شَخْصِيَّتِكَ. لِذَلِكَ كَانَ لِزَاماً عَلَى طَالِبِ العِلْمِ أَنْ يَتَخَيَّرَ كُتُبَهُ كَمَا يَتَخَيَّرُ أَصْدِقَاءَهُ؛ فَيَبْتَعِدَ عَنِ الكُتُبِ التَّافِهَةِ الَّتِي تُضَيِّعُ الوَقْتَ دُونَ طَائِلٍ، وَيُقْبِلَ عَلَى مَا يَبْنِي الإِيمَانَ، وَيُثْرِي اللُّغَةَ، وَيُحَفِّزُ الفِكْرَ النَّاقِدَ؛ لِتَكُونَ القِرَاءَةُ لَهُ حَيَاةً مَلِيئَةً بِالنُّورِ وَالبَصِيرَةِ.»`
    }
  ]

  const vocabList = [
    { word: 'جَدْوَل', meaning: 'مجرى ماء صغير يشق في الأرض', plural: 'جَدَاوِل' },
    { word: 'الفَسِيح', meaning: 'الواسع الممتد الرحب', opposite: 'الضيق' },
    { word: 'تَجْلُو', meaning: 'تكشف وتزيل الغشاوة وتنظف', opposite: 'تطمس وتعكر' },
    { word: 'صَدَأ', meaning: 'المراد: الركود والجمود والغفلة' },
    { word: 'لِيُونَة', meaning: 'مرونة وسلاسة وقبول للحق', opposite: 'جمود وتحجر' },
    { word: 'التَّعَصُّب', meaning: 'التشدد والتمسك بالرأي بغير حق', opposite: 'التسامح والانفتاح' },
    { word: 'يَمَلُّ', meaning: 'يضجر ويسأم', opposite: 'يصبر ويستمتع' },
    { word: 'زُبْدَة', meaning: 'خلاصة الشيء وصفوته ونخبته' },
    { word: 'لِزَاماً', meaning: 'واجباً حتمياً وضرورياً' },
    { word: 'طَائِل', meaning: 'فائدة وجدوى ونفع' }
  ]

  const questions = [
    {
      q: 'س1: لمَ يرى الكاتب أحمد أمين أن القراءة تهب الإنسان أعماراً مضاعفة؟',
      a: 'لأن القارئ يضيف إلى عمره الفردي المحدود تجارب وحيوات وأفكار مئات الحكماء والكتاب الذين صاغوا خبراتهم في كتبهم.'
    },
    {
      q: 'س2: ما الفرق بين الشخص القارئ وغير القارئ كما صوره الكاتب؟',
      a: 'القارئ كمن يقف على قمة جبل يشهد رحابة الكون، بينما غير القارئ كمن يحبس نفسه داخل غرفة ضيقة معتمة مقطوعة عن العالم.'
    },
    {
      q: 'س3: كيف تختار كتبك بحسب توجيه الكاتب في النص؟',
      a: 'نتخيرها بعناية كما نتخير الأصدقاء، فنقبل على الكتب التي تنمي العقل وتثري الروح واللغة والفكر الناقد، ونبتعد عن الكتب التافهة مضيعة الوقت.'
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
              <h1 className={styles.title}>القراءة حياة (أحمد أمين)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          
          {/* Author Bio Banner */}
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
              id={`lesson11-${para.id}`}
              title={para.title}
              text={para.text}
            />
          ))}

          {/* Vocabulary Section */}
          <VocabularySection
            title="معاني المفردات واللغويات (القراءة حياة)"
            vocabList={vocabList}
            id="lesson11-vocab"
          />

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP2_QUIZZES['reading-11'] && (
            <div id="quiz">
              <InteractiveQuiz
                quizData={PREP2_QUIZZES['reading-11']}
                id="lesson11-quiz"
              />
            </div>
          )}

          {/* Comprehension Questions */}
          <QuestionsCard
            title="تدريبات وأسئلة الفهم والمناقشة"
            questions={questions}
            id="lesson11-questions"
          />
        </div>
      </div>
    </div>
  )
}
