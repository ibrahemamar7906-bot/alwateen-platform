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

export default function Lesson10() {
  const paragraphs = [
    {
      id: 'p1',
      title: '١- نَشْأَتُهُ وَمَنْهَجُهُ العِلْمِيُّ التَّجْرِيبِيُّ',
      text: 'هُوَ عَلَاءُ الدِّينِ أَبُو الحَسَنِ، المَعْرُوفُ بِابْنِ النَّفِيسِ القُرَشِيِّ الدِّمَشْقِيِّ. وُلِدَ بِدِمَشْقَ، وَنَشَأَ فِي بِيئَةٍ عِلْمِيَّةٍ ثَرِيَّةٍ رَعَتْ مَوَاهِبَهُ الفَذَّةَ. دَرَسَ الطِّبَّ وَاللُّغَةَ وَالفَلْسَفَةَ، وَاعْتَمَدَ مَنْهَجاً عِلْمِيّاً صَارِماً يَقُومُ عَلَى التَّجْرِبَةِ وَالمُلَاحَظَةِ الدَّقِيقَةِ وَالمُشَاهَدَةِ العَيْنِيَّةِ، رَافِضاً النَّقْلَ الأَعْمَى أَوِ التَّسْلِيمَ بِالآرَاءِ السَّابِقَةِ دُونَ تَمْحِيصٍ وَبُرْهَانٍ.',
      notes: '💡 القِيمَةُ المُسْتَفَادَةُ: العَقْلُ العِلْمِيُّ النَّاقِدُ يُحَرِّرُ الإِنْسَانَ مِنَ الجُمُودِ وَالتَّكْرَارِ وَيَفْتَحُ أَبْوَابَ الاِكْتِشَافِ.'
    },
    {
      id: 'p2',
      title: '٢- كَشْفُ الدَّوْرَةِ الدَّمَوِيَّةِ الصُّغْرَى وَإِنْسَانِيَّةُ الطَّبِيبِ',
      text: 'يُعَدُّ ابْنُ النَّفِيسِ المُكْتَشِفَ الأَوَّلَ لِلدَّوْرَةِ الدَّمَوِيَّةِ الصُّغْرَى فِي التَّارِيخِ، مُبَيِّناً كَيْفِيَّةَ تَنْقِيَةِ الدَّمِ فِي الرِّئَتَيْنِ قَبْلَ العَالَمِ الغَرْبِيِّ بِقُرُونٍ طَوِيلَةٍ. انْتَقَلَ إِلَى القَاهِرَةِ وَصَارَ رَئِيساً لِأَطِبَّاءِ المُسْتَشْفَى المَنْصُورِيِّ (البِيمَارِسْتَان). تَمَيَّزَتْ سِيرَتُهُ بِالرَّحْمَةِ وَالإِنْسَانِيَّةِ العَالِيَةِ، فَكَانَ يَتَفَقَّدُ المَرْضَى بِنَفْسِهِ وَيُعَالِجُ الفُقَرَاءَ وَالمُحْتَاجِينَ بِالمَجَّانِ وَيُوَفِّرُ لَهُمُ الدَّوَاءَ وَالغِذَاءَ.',
      notes: '💡 القِيمَةُ المُسْتَفَادَةُ: عَظَمَةُ الطَّبِيبِ الحَقِيقِيِّ تَتَجَلَّى عِنْدَمَا يَمْتَزِجُ عِلْمُهُ الغَزِيرُ بِالرَّحْمَةِ بِالضُّعَفَاءِ وَالمَسَاكِينِ.'
    }
  ]

  const vocabList = [
    { word: 'الفَذَّة', meaning: 'النادرة العظيمة التي لا مثيل لها' },
    { word: 'تَمْحِيص', meaning: 'اختبار دقيق وفحص عميق وتثبت' },
    { word: 'النَّقْل الأَعْمَى', meaning: 'التقليد والتكرار دون تفكير أو دليل' },
    { word: 'البِيمَارِسْتَان', meaning: 'المستشفى في العصر الإسلامي القديم لعلاج المرضى وتعليم الطب' },
    { word: 'تَنْقِيَة', meaning: 'تطهير وتصفية الدم من الشوائب' },
    { word: 'بِالمَجَّان', meaning: 'دون مقابل مالي لوجه الله تعالى' }
  ]

  const questions = [
    {
      q: 'س1: مَا الكَشْفُ العِلْمِيُّ البَارِزُ الَّذِي سَجَّلَهُ ابْنُ النَّفِيسِ فِي تَارِيخِ الطِّبِّ العَالَمِيِّ؟',
      a: 'اكْتِشَافُ الدَّوْرَةِ الدَّمَوِيَّةِ الصُّغْرَى، مُبَيِّناً حَرَكَةَ الدَّمِ بَيْنَ القَلْبِ وَالرِّئَتَيْنِ لِتَنْقِيَتِهِ قَبْلَ أَنْ يَعْرِفَهَا العَالَمُ الغَرْبِيُّ بِقُرُونٍ طَوِيلَةٍ.'
    },
    {
      q: 'س2: مَا المَنْهَجُ العِلْمِيُّ الَّذِي اعْتَمَدَهُ ابْنُ النَّفِيسِ فِي أَبْحَاثِهِ الطِّبِّيَّةِ؟',
      a: 'مَنْهَجُ التَّجْرِبَةِ وَالمُشَاهَدَةِ العَيْنِيَّةِ وَالمُلَاحَظَةِ وَالتَّحْلِيلِ العَقْلِيِّ الصَّارِمِ، رَافِضاً النَّقْلَ وَالتَّقْلِيدَ دُونَ دَلِيلٍ وَبُرْهَانٍ.'
    },
    {
      q: 'س3: دَلِّلْ عَلَى إِنْسَانِيَّةِ ابْنِ النَّفِيسِ وَرَحْمَتِهِ الفَائِقَةِ بِمَرْضَاهُ؟',
      a: 'كَانَ يُعَامِلُ المَرْضَى بِرِفْقٍ شَدِيدٍ، وَيَتَفَقَّدُهُمْ فِي المُسْتَشْفَى المَنْصُورِيِّ بِالقَاهِرَةِ، وَيُعَالِجُ الفُقَرَاءَ وَالمُحْتَاجِينَ مَجَّاناً وَيَهْدِيهِمُ الدَّوَاءَ وَالغِذَاءَ.'
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
              <h1 className={styles.title}>رحمة تداوي وعلم يضيء (ابن النفيس)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#059669', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={24} /> محتوى الدرس وسيرة العالم الإنساني
          </h2>

          {/* Paragraphs with Read Buttons */}
          {paragraphs.map((para) => (
            <ParagraphCard
              key={para.id}
              id={`lesson7-${para.id}`}
              title={para.title}
              text={para.text}
              notes={para.notes}
            />
          ))}

          {/* Vocabulary Section */}
          <VocabularySection
            title="معاني المفردات واللغويات (درس ابن النفيس)"
            vocabList={vocabList}
            id="lesson10-vocab"
          />

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP1_QUIZZES['reading-10'] && (
            <InteractiveQuiz
              quizData={PREP1_QUIZZES['reading-10']}
              id="lesson10-quiz"
            />
          )}

          {/* Questions */}
          <QuestionsCard
            title="تدريبات وأسئلة الفهم القرائي"
            questions={questions}
            id="lesson10-questions"
          />
        </div>
      </div>
    </div>
  )
}
