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

export default function Lesson12() {
  const verses = [
    {
      sadr: 'بِقَدْرِ الْكَدِّ تُكْتَسَبُ المَعَالِي',
      ajuz: 'وَمَنْ طَلَبَ العُلَا سَهِرَ اللَّيَالِي'
    },
    {
      sadr: 'وَمَنْ رَامَ العُلَا مِنْ غَيْرِ كَدٍّ',
      ajuz: 'أَضَاعَ العُمْرَ فِي طَلَبِ المُحَالِ'
    },
    {
      sadr: 'تَرُومُ العِزَّ ثُمَّ تَنَامُ لَيْلاً؟',
      ajuz: 'يَغُوصُ البَحْرَ مَنْ طَلَبَ اللآلِي'
    },
    {
      sadr: 'عُلُوُّ المَرْءِ بِالهِمَمِ العَوَالِي',
      ajuz: 'وَعِزُّ الشَّخْصِ فِي سَهَرِ اللَّيَالِي'
    },
    {
      sadr: 'وَتَرْكُ النَّوْمِ لِلإِنْسَانِ مَجْدٌ',
      ajuz: 'إِذَا مَا كَانَ فِي نَيْلِ المَنَالِ'
    }
  ]

  const poetBio = {
    title: 'نُبْذَةٌ عَنِ الإِمَامِ الفَقِيهِ وَالشَّاعِرِ «مُحَمَّد بْنِ إِدْرِيسَ الشَّافِعِيِّ»',
    text: 'أَحَدُ أَئِمَّةِ أَهْلِ السُّنَّةِ الأَرْبَعَةِ وَصَاحِبُ المَذْهَبِ الشَّافِعِيِّ فِي الفِقْهِ الإِسْلَامِيِّ. وُلِدَ فِي غَزَّةَ عَامَ 150هـ، وَعَاشَ فِي مَكَّةَ وَالمَدِينَةِ وَبَغْدَادَ، ثُمَّ اسْتَقَرَّ بِمِصْرَ وَتُوُفِّيَ بِهَا عَامَ 204هـ. عُرِفَ بِعَبْقَرِيَّتِهِ، وَفَصَاحَتِهِ، وَحِكْمَتِهِ الشِّعْرِيَّةِ النَّادِرَةِ الَّتِي جَمَعَتْ بَيْنَ فِقْهِ الدِّينِ وَتَهْذِيبِ النُّفُوسِ.'
  }

  const vocabList = [
    { word: 'الْكَدِّ', meaning: 'التعب وبذل الجهد الشاق والاجتهاد', opposite: 'الراحة والكسل والخمول' },
    { word: 'المَعَالِي', meaning: 'المراتب الرفيعة والمنازل الشريفة العالية', singular: 'مَعْلَاة' },
    { word: 'العُلَا', meaning: 'الشرف والمجد والمكانة المرموقة', opposite: 'الخسة والدناءة والوضاعة' },
    { word: 'رَامَ', meaning: 'طلب وأراد وقصد' },
    { word: 'المُحَالِ', meaning: 'المستحيل الذي لا يمكن حدوثه', opposite: 'الممكن والميسور' },
    { word: 'تَرُومُ', meaning: 'تطلب وتبتغي' },
    { word: 'اللآلِي', meaning: 'جمع لؤلؤة: الدرر والجواهر النفيسة المستخرجة من البحر' },
    { word: 'الهِمَم', meaning: 'العزائم القوية والإرادات الصلبة', singular: 'هِمَّة' },
    { word: 'المَنَال', meaning: 'ما يُنال ويُحصل عليه من الأهداف الكبرى' }
  ]

  const explanation = {
    title: 'الشَّرْحُ وَالتَّذَوُّقُ البَلَاغِيُّ لِلأَبْيَاتِ',
    text: `١- قاعدة النجاح الذهبية: يقرر الشافعي حقيقة ثابتة؛ وهي أن المكانة السامية تُنال بمقدار ما يبذله المرء من تعب وسهر واجتهاد في طلب العلم.
٢- وهم الأماني بغير عمل: يحذر الإمام من طلب الرفعة بالكسل، فمن ظن أنه سينال المجد دون مشقة فقد أضاع عمره في أوهام مستحيلة.
٣- استنكار التناقض: يستنكر الشاعر أن يطلب الإنسان العز وهو يقضي ليله نائماً متراخياً، مشبهاً طالب العلم بمن يغوص في لجج البحار ليظفر باللؤلؤ الثمين.
٤- الهمة العالية: يختتم بالتأكيد على أن الشرف والمجد يرتبطان بعلو الهمة وهجر الدعة في سبيل بلوغ الغايات النبيلة.`
  }

  const questions = [
    {
      q: 'س1: ما السبيل الوحيد لبلوغ المعالي وتحقيق المجد كما يرى الشافعي؟',
      a: 'السبيل الوحيد هو الكد والتعب وبذل الجهد المتواصل وسهر الليالي في تحصيل العلم والعمل الصادق.'
    },
    {
      q: 'س2: ما عاقبة من طلب العلا بغير كد وتعب؟',
      a: 'يضيع عمره الثمين هباءً في طلب أمر مستحيل لا يتحقق أبداً؛ لأن المعالي لا تنال بالتمني الفارغ.'
    },
    {
      q: 'س3: وضح الجمال في قول الشاعر: «يغوص البحر من طلب اللآلي»؟',
      a: 'تشبيه تمثيلي رائع صور فيه طالب العلم والمجد بغائص البحر الذي يواجه الأمواج والمشاق ليظفر باللؤلؤ والدرر النفيسة.'
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
                <span>نص شعري - الوحدة الثالثة (علم وقيم)</span>
              </div>
              <h1 className={styles.title}>الكَدُّ سبيل المعالي (للإمام الشافعي)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          
          {/* Poet Bio Card */}
          <ParagraphCard
            id="lesson12-bio"
            title={poetBio.title}
            text={poetBio.text}
          />

          {/* Poetry Section */}
          <PoetrySection
            title="قصيدة الكد سبيل المعالي"
            poet="الإمام الشافعي"
            verses={verses}
            id="lesson12-poem"
          />

          {/* Explanation & Aesthetics */}
          <ParagraphCard
            id="lesson12-explanation"
            title={explanation.title}
            text={explanation.text}
          />

          {/* Vocabulary Section */}
          <VocabularySection
            title="معاني المفردات واللغويات (الكد سبيل المعالي)"
            vocabList={vocabList}
            id="lesson12-vocab"
          />

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP2_QUIZZES['reading-12'] && (
            <div id="quiz">
              <InteractiveQuiz
                quizData={PREP2_QUIZZES['reading-12']}
                id="lesson12-quiz"
              />
            </div>
          )}

          {/* Comprehension Questions */}
          <QuestionsCard
            title="تدريبات وأسئلة الفهم والتذوق البلاغي"
            questions={questions}
            id="lesson12-questions"
          />
        </div>
      </div>
    </div>
  )
}
