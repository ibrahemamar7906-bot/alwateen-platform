'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, FileText } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import VocabularySection from '../../components/VocabularySection'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'
import { PREP1_QUIZZES } from '../../data/prep1_quizzes'

export default function Lesson11() {
  const paragraphs = [
    {
      id: 'p1',
      title: '١- طَفْرَةُ التِّكْنُولُوجْيَا وَتَغَيُّرُ نَمَطِ الحَيَاةِ الإِنْسَانِيَّةِ',
      text: 'شَهِدَ العَالَمُ المُعَاصِرُ ثَوْرَةً رَقْمِيَّةً وَتَطَوُّراً هَائِلاً فِي الأَدَوَاتِ التِّكْنُولُوجِيَّةِ وَالذَّكَاءِ الاِصْطِنَاعِيِّ. أَصْبَحَتِ الشَّاشَاتُ وَالأَجْهِزَةُ الذَّكِيَّةُ جُزْءاً لَا يَتَجَزَّأُ مِنْ حَيَاتِنَا اليَوْمِيَّةِ، وَأَثَّرَتْ عَلَى طَرِيقَةِ تَفْكِيرِنَا، وَسُرْعَةِ إِنْجَازِ أَعْمَالِنَا، وَطَبِيعَةِ عَلَاقَاتِنَا الاِجْتِمَاعِيَّةِ وَالتَّوَاصُلِ بَيْنَ البَشَرِ.',
      notes: '💡 القِيمَةُ المُسْتَفَادَةُ: التِّكْنُولُوجْيَا سِلَاحٌ ذُو حَدَّيْنِ، يَجِبُ اسْتِثْمَارُ مَنَافِعِهَا وَتَجَنُّبُ مَسَاوِئِهَا بِحِكْمَةٍ.'
    },
    {
      id: 'p2',
      title: '٢- التَّوَازُنُ الوَاعِي بَيْنَ التِّقْنِيَّةِ وَالرُّوحِ الإِنْسَانِيَّةِ',
      text: 'يَجِبُ عَلَى الإِنْسَانِ أَلَّا يَدَعَ الآلَاتِ وَالتَّطْبِيقَاتِ تُسَيْطِرُ عَلَى قَلْبِهِ وَعَوَاطِفِهِ الفِطْرِيَّةِ. لَا بُدَّ مِنْ حِمَايَةِ الدِّفْءِ الأُسَرِيِّ وَتَخْصِيصِ أَوْقَاتٍ لِلِّقَاءَاتِ الحَيَّةِ مَعَ العَائِلَةِ وَالأَصْدِقَاءِ بَعِيداً عَنِ الشَّاشَاتِ، وَاسْتِخْدَامِ التِّقْنِيَّةِ فِي إِعْمَارِ المُجْتَمَعَاتِ وَنَشْرِ الخَيْرِ دُونَ أَنْ تَطْغَى عَلَى الأَخْلَاقِ وَالمَشَاعِرِ الإِنْسَانِيَّةِ الرَّاقِيَةِ.',
      notes: '💡 القِيمَةُ المُسْتَفَادَةُ: الحِفَاظُ عَلَى البُعْدِ الإِنْسَانِيِّ وَالأَخْلَاقِيِّ هُوَ الَّذِي يَمْنَحُ الحَيَاةَ مَعْنَاهَا الحَقِيقِيَّ.'
    }
  ]

  const vocabList = [
    { word: 'طَفْرَة', meaning: 'قفزة وتغير مفاجئ وسريع للأمام', plural: 'طَفَرَات' },
    { word: 'هَائِل', meaning: 'عظيم وكبير جداً ومذهل' },
    { word: 'لَا يَتَجَزَّأُ', meaning: 'لا ينفصل ولا ينعزل عن الكل' },
    { word: 'تَطْغَى', meaning: 'تتجاوز الحد وتسيطر وتغلب', opposite: 'تَعْتَدِلُ وَتَنْضَبِطُ' },
    { word: 'الفِطْرِيَّة', meaning: 'الطبيعية التي خُلق الإنسان عليها' },
    { word: 'العُزْلَة', meaning: 'الانقطاع عن الناس والجلوس وحيداً', opposite: 'الاِنْدِمَاجُ وَالمُخَالَطَةُ' }
  ]

  const questions = [
    {
      q: 'س1: كَيْفَ أَثَّرَتِ الثَّوْرَةُ التِّكْنُولُوجِيَّةُ الحَدِيثَةُ عَلَى حَيَاةِ الإِنْسَانِ اليَوْمِيَّةِ؟',
      a: 'يَسَّرَتِ التَّوَاصُلَ وَسُرْعَةَ نَقْلِ المَعْلُومَاتِ وَإِنْجَازِ الأَعْمَالِ وَالتَّعَلُّمِ عَنْ بُعْدٍ، لَكِنَّهَا قَدْ تُسَبِّبُ العُزْلَةَ وَتَرَاجُعَ الرَّوَابِطِ الأُسَرِيَّةِ إِذَا أَفْرَطَ الإِنْسَانُ فِي اسْتِخْدَامِهَا.'
    },
    {
      q: 'س2: مَا المَقْصُودُ بِالتَّوَازُنِ بَيْنَ التِّقْنِيَّةِ وَالإِنْسَانِيَّةِ؟',
      a: 'الاِسْتِفَادَةُ القُصْوَى مِنَ التِّكْنُولُوجْيَا فِي التَّعْلِيمِ وَالتَّطْوِيرِ وَالعَمَلِ دُونَ أَنْ تَطْغَى عَلَى المَشَاعِرِ وَالعَلَاقَاتِ الإِنْسَانِيَّةِ الحَيَّةِ أَوْ تَمَسَّ الأَخْلَاقَ.'
    },
    {
      q: 'س3: كَيْفَ يَحْمِي الطَّالِبُ نَفْسَهُ مِنْ الآثَارِ السَّلْبِيَّةِ لِإِدْمَانِ الشَّاشَاتِ؟',
      a: 'بِتَنْظِيمِ وَقْتِهِ بِدِقَّةٍ، وَمُمَارَسَةِ الرِّيَاضَةِ، وَالجُلُوسِ مَعَ الأُسْرَةِ، وَمُمَارَسَةِ القِرَاءَةِ وَالأَنْشِطَةِ الوَاقِعِيَّةِ بَعِيداً عَنِ الأَجْهِزَةِ الإِلِكْتُرُونِيَّةِ.'
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
                <span>درس قراءة - الوحدة الثالثة (مواقف إنسانية)</span>
              </div>
              <h1 className={styles.title}>إنسان في عصر التكنولوجيا</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#059669', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={24} /> محتوى الدرس ومحاور التفكير
          </h2>

          {/* Paragraphs with Read Buttons */}
          {paragraphs.map((para) => (
            <ParagraphCard
              key={para.id}
              id={`lesson8-${para.id}`}
              title={para.title}
              text={para.text}
              notes={para.notes}
            />
          ))}

          {/* Vocabulary Section */}
          <VocabularySection
            title="معاني المفردات واللغويات (درس إنسان في عصر التكنولوجيا)"
            vocabList={vocabList}
            id="lesson11-vocab"
          />

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP1_QUIZZES['reading-11'] && (
            <InteractiveQuiz
              quizData={PREP1_QUIZZES['reading-11']}
              id="lesson11-quiz"
            />
          )}

          {/* Questions */}
          <QuestionsCard
            title="تدريبات وأسئلة الفهم القرائي"
            questions={questions}
            id="lesson11-questions"
          />
        </div>
      </div>
    </div>
  )
}
