'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, Award, BookOpen } from 'lucide-react'
import styles from '../../page.module.css'
import PoetrySection from '../../components/PoetrySection'
import ParagraphCard from '../../components/ParagraphCard'
import VocabularySection from '../../components/VocabularySection'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'
import { PREP2_QUIZZES } from '../../data/prep2_quizzes'

export default function Lesson4() {
  const verses = [
    {
      sadr: 'مِصْرُ الَّتِي فِي خَاطِرِي وَفِي دَمِي',
      ajuz: 'أُحِبُّهَا مِنْ كُلِّ رُوحِي وَدَمِي'
    },
    {
      sadr: 'يَا لَيْتَ كُلَّ مُؤْمِنٍ بِعِزِّهَا',
      ajuz: 'يُحِبُّهَا حُبِّي لَهَا لِتَسْتَقِيمْ'
    },
    {
      sadr: 'بَنِي الحِمَى، وَالوَطَنُ المُفَدَّى لَكُمْ',
      ajuz: 'وَمِصْرُ جَنَّةٌ لِكُلِّ مُبْتَغٍ'
    },
    {
      sadr: 'وَغَدٌ لَنَا مُشْرِقٌ بِالمُنَى وَالظَّفَرْ',
      ajuz: 'فَجِدُّوا فِي البِنَاءِ لِتَبْلُغُوا الأَثَرْ'
    },
    {
      sadr: 'حَيُّوا مَعِي مِصْرَ الكِنَانَةِ وَاهْتِفُوا',
      ajuz: 'يَحْيَا الوَطَنْ، يَحْيَا الوَطَنْ، يَحْيَا الوَطَنْ'
    }
  ]

  const poetBio = {
    title: 'نُبْذَةٌ عَنْ شَاعِرِ الشَّبَابِ «أَحْمَد رَامِي»',
    text: 'شَاعِرٌ مِصْرِيٌّ كَبِيرٌ، وُلِدَ عَامَ 1892م فِي القَاهِرَةِ، لُقِّبَ بِـ «شَاعِرِ الشَّبَابِ» لِتَجَدُّدِ أَفْكَارِهِ وَعُذُوبَةِ أَلْفَاظِهِ. دَرَسَ فِي مَدْرَسَةِ المُعَلِّمِينَ العُلْيَا، وَسَافَرَ إِلَى فَرَنْسَا لِدِرَاسَةِ اللُّغَاتِ الشَّرْقِيَّةِ. تُوُفِّيَ عَامَ 1981م بَعْدَ أَنْ تَرَكَ تُرَاثاً شِعْرِيّاً وَغِنَائِيّاً وَطَنِيّاً خَالِداً فِي وِجْدَانِ الأُمَّةِ.'
  }

  const vocabList = [
    { word: 'خَاطِرِي', meaning: 'قلبي وبالي ونفسي', plural: 'خَوَاطِر' },
    { word: 'دَمِي', meaning: 'المراد: تغلغل حبها في وجداني كجريان الدم في العروق' },
    { word: 'عِزِّهَا', meaning: 'قوتها ومجدها ورفعتها', opposite: 'ذلها وهوانها' },
    { word: 'الحِمَى', meaning: 'الوطن والمكان المحمي المصون', plural: 'الأَحْمِيَة' },
    { word: 'المُفَدَّى', meaning: 'العزيز الذي نضحّي بأرواحنا من أجله' },
    { word: 'مُبْتَغٍ', meaning: 'طالب ومريد وقاصد' },
    { word: 'المُنَى', meaning: 'الآمال والطموحات السامية', singular: 'المُنْيَة' },
    { word: 'الظَّفَرْ', meaning: 'الفوز والانتصار والنجاح', opposite: 'الهزيمة والخسارة' },
    { word: 'جِدُّوا', meaning: 'اجتهدوا واعملوا بنشاط وحزم', opposite: 'تكاسلوا وتراخوا' },
    { word: 'الكِنَانَة', meaning: 'وعاء السهام، والمقصود بها أرض مصر الحصينة' }
  ]

  const explanation = {
    title: 'الشَّرْحُ وَالتَّذَوُّقُ البَلَاغِيُّ لِلأَبْيَاتِ',
    text: `١- الارتباط الوجداني الخالد: يعلن الشاعر أن مصر ليست مجرد وطن، بل هي حاضرة في باله وتسري في دمائه وروحه.
٢- أمنية المجد: يتمنى الشاعر أن يتحد جميع المصريين في حب الوطن بنفس العمق والإخلاص لترتقي مصر.
٣- نداء للشباب وأمل المستقبل: ينادي الشاعر بني الوطن المفدى مؤكداً أن غدهم مشرق بالانتصارات متى جدّوا وأخلصوا في العمل والبناء.
٤- الهتاف للكنانة: يختتم الشاعر بهتاف وطني خالد يصدح به كل مصري: يحيا الوطن حرّاً عزيزاً.`
  }

  const questions = [
    {
      q: 'س1: ما دلالة قول الشاعر: «مصر التي في خاطري وفي دمي»؟',
      a: 'يدل على شدة الامتزاج العاطفي وحب الوطن المتأصل في كيان الشاعر، حتى صار حبه يجري في دمه كعنصر حياة.'
    },
    {
      q: 'س2: ما الجمال في قول الشاعر: «وغدٌ لنا مشرقٌ بالمنى والظفر»؟',
      a: 'تصوير رائع للمستقبل بشمس مشرقة تضيء بالنصر وتحقيق الأماني، وفيه حث ودعوة للتفاؤل والأمل.'
    },
    {
      q: 'س3: علام يدل تكرار هتاف «يحيا الوطن» في ختام الأبيات؟',
      a: 'تكرار يدل على التوكيد وشدة الحماس الوطني، واستمرار العهد على حماية مصر والتضحية في سبيل رفعتها.'
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
                <Sparkles size={18} />
                <span>نص شعري - الوحدة الأولى (انتمائي قوتي)</span>
              </div>
              <h1 className={styles.title}>مصر التي في خاطري (للشاعر أحمد رامي)</h1>
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

          {/* Poetry Section */}
          <PoetrySection
            title="قصيدة مصر التي في خاطري"
            poet="أحمد رامي"
            verses={verses}
            id="lesson4-poem"
          />

          {/* Explanation & Aesthetics */}
          <ParagraphCard
            id="lesson4-explanation"
            title={explanation.title}
            text={explanation.text}
          />

          {/* Vocabulary Section */}
          <VocabularySection
            title="معاني المفردات واللغويات (مصر التي في خاطري)"
            vocabList={vocabList}
            id="lesson4-vocab"
          />

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP2_QUIZZES['reading-4'] && (
            <div id="quiz">
              <InteractiveQuiz
                quizData={PREP2_QUIZZES['reading-4']}
                id="lesson4-quiz"
              />
            </div>
          )}

          {/* Comprehension Questions */}
          <QuestionsCard
            title="تدريبات وأسئلة الفهم والتذوق البلاغي"
            questions={questions}
            id="lesson4-questions"
          />
        </div>
      </div>
    </div>
  )
}
