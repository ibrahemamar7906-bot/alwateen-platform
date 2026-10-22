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

export default function Lesson8() {
  const verses = [
    {
      sadr: 'يَا رِيفَنَا، أَنْتَ فِي الدُّنْيَا لَنَا سَكَنٌ',
      ajuz: 'وَفِي رُبُوعِكَ يَزْهُو الخَيْرُ وَالأَمَلُ'
    },
    {
      sadr: 'كَسَاكَ رَبِّي جَمَالاً سَاحِراً عَبِقاً',
      ajuz: 'يَرْتَاحُ فِيهِ فُؤَادٌ مَسَّهُ الوَجَلُ'
    },
    {
      sadr: 'حُقُولُكَ الخُضْرُ ثَوْبٌ مِنْ سَناً وَنَدَى',
      ajuz: 'كَأَنَّهَا جَنَّةٌ قَدْ زَانَهَا العَمَلُ'
    },
    {
      sadr: 'وَفِيكَ قَوْمٌ كِرَامٌ لَا تُفَارِقُهُمْ',
      ajuz: 'شَهَامَةُ النَّفْسِ وَالإِيثَارُ وَالخَجَلُ'
    },
    {
      sadr: 'يَسْعَوْنَ فِي الأَرْضِ إِصْلَاحاً وَتَضْحِيَةً',
      ajuz: 'وَالخَيْرُ مِنْ كَدِّهِمْ فِي مِصْرَ يَتَّصِلُ'
    }
  ]

  const poetBio = {
    title: 'نُبْذَةٌ عَنِ الشَّاعِرِ «مَحْمُود غُنَيْم»',
    text: 'شَاعِرٌ مِصْرِيٌّ أَدِيبٌ، وُلِدَ عَامَ 1901م بِقَرْيَةِ مَلِيج بِمُحَافَظَةِ المَنُوفِيَّةِ. تَخَرَّجَ فِي كُلِّيَّةِ دَارِ العُلُومِ، وَاشْتَهَرَ بِشِعْرِهِ الأَصِيلِ الَّذِي يُعَبِّرُ عَنْ رُوحِ القَرْيَةِ المِصْرِيَّةِ وَقِيَمِهَا الإِنْسَانِيَّةِ وَالطَّبِيعِيَّةِ. مِنْ أَهَمِّ دَوَاوِينِهِ: "صَرْخَةٌ فِي وَادٍ" وَ"فِي ظِلَالِ الحِمَى". تُوُفِّيَ عَامَ 1972م.'
  }

  const vocabList = [
    { word: 'سَكَنٌ', meaning: 'مستقر ومأوى تهنأ به النفس', plural: 'أَسْكَان' },
    { word: 'رُبُوعِكَ', meaning: 'أرجائك وأنحائك ومواطنك', singular: 'رَبْع' },
    { word: 'يَزْهُو', meaning: 'ينمو ويزدهر ويشرق بنضارته' },
    { word: 'عَبِقاً', meaning: 'فوّاحاً بالعطر والروائح الطيبة الزكية' },
    { word: 'الوَجَلُ', meaning: 'الخوف والفزع والاضطراب', opposite: 'الأمن والسكينة والطمأنينة' },
    { word: 'سَناً', meaning: 'ضوء ساطع ونور باهر' },
    { word: 'زَانَهَا', meaning: 'جمّلها وزيّنها', opposite: 'شانها وقبّحها' },
    { word: 'الإِيثَارُ', meaning: 'تفضيل الآخرين وتقديمهم على النفس', opposite: 'الأثرة والأنانية' },
    { word: 'كَدِّهِمْ', meaning: 'جهدهم وتعبهم الشاق وعملهم المخلص' }
  ]

  const explanation = {
    title: 'الشَّرْحُ وَالتَّذَوُّقُ البَلَاغِيُّ لِلأَبْيَاتِ',
    text: `١- سكن الروح ومهد الأمل: يخاطب الشاعر الريف المصري مؤكداً أنه الواحة التي تأوي إليها النفوس الباحثة عن الهدوء والجمال والأمل.
٢- السكينة الروحية: وهب الله القرية سحراً يزيل الحزن والقلق عن كل من وطئت قدماه أرضها الخضراء.
٣- لوحة الحقول الساحرة: يشبه الشاعر الخضرة الممتدة بثوب بهيج نسجته يد الطبيعة من الندى ونور الشمس، وزينه كد الفلاحين.
٤- نبل أهل الريف وعطاؤهم: يمتدح الشاعر أخلاق الفلاح المصري من كرم وشهامة وإيثار وجهاد صامت لإطعام مصر وسد احتياجاتها.`
  }

  const questions = [
    {
      q: 'س1: بم وصف الشاعر ريف مصر في البيت الأول؟',
      a: 'وصفه بأنه مأوى ومستقر للراحة والسكينة، وفي أرجائه ينمو الخير ويزدهر الأمل لنفوس أبنائه.'
    },
    {
      q: 'س2: ما الجمال في قول الشاعر: «حقولك الخضر ثوب من سناً وندى»؟',
      a: 'تشبيه بليغ صور فيه الحقول الخضراء بثوب مطرز بنور الشمس وقطرات الندى، مما يوحي بقمة النضارة والنقاء.'
    },
    {
      q: 'س3: ما الصفات الأصيلة التي تميز بها أهل الريف كما يوضح النص؟',
      a: 'الكرم، وشهامة النفس، والإيثار، والحياء، والجهد الدؤوب المخلص في زراعة الأرض وبناء الوطن.'
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
                <span>نص شعري - الوحدة الثانية (بيئتي مسؤوليتي)</span>
              </div>
              <h1 className={styles.title}>ريفنا المصري (للشاعر محمود غنيم)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          
          {/* Poet Bio Card */}
          <ParagraphCard
            id="lesson8-bio"
            title={poetBio.title}
            text={poetBio.text}
          />

          {/* Poetry Section */}
          <PoetrySection
            title="قصيدة ريفنا المصري"
            poet="محمود غنيم"
            verses={verses}
            id="lesson8-poem"
          />

          {/* Explanation & Aesthetics */}
          <ParagraphCard
            id="lesson8-explanation"
            title={explanation.title}
            text={explanation.text}
          />

          {/* Vocabulary Section */}
          <VocabularySection
            title="معاني المفردات واللغويات (ريفنا المصري)"
            vocabList={vocabList}
            id="lesson8-vocab"
          />

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP2_QUIZZES['reading-8'] && (
            <div id="quiz">
              <InteractiveQuiz
                quizData={PREP2_QUIZZES['reading-8']}
                id="lesson8-quiz"
              />
            </div>
          )}

          {/* Comprehension Questions */}
          <QuestionsCard
            title="تدريبات وأسئلة الفهم والتذوق البلاغي"
            questions={questions}
            id="lesson8-questions"
          />
        </div>
      </div>
    </div>
  )
}
