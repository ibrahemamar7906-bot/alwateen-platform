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

export default function Lesson5() {
  const paragraphs = [
    {
      id: 'p1',
      title: '١- مَشْرُوعٌ قَوْمِيٌّ حَضَارِيٌّ ضَخْمٌ',
      text: 'المَتْحَفُ المِصْرِيُّ الكَبِيرُ هُوَ مَشْرُوعٌ قَوْمِيٌّ يَعْكِسُ رُؤْيَةَ مِصْرَ العَصْرِيَّةَ فِي حِمَايَةِ التُّرَاثِ وَصَوْنِ الحَضَارَةِ الإِنْسَانِيَّةِ. لَا يَقْتَصِرُ دَوْرُهُ عَلَى عَرْضِ الآثَارِ فَقَطْ، بَلْ هُوَ صَرْحٌ ثَقَافِيٌّ وَعِلْمِيٌّ وَتَعْلِيمِيٌّ مُتَكَامِلٌ يَسْتَقْبِلُ الزَّائِرِينَ وَالبَاحِثِينَ مِنْ كَافَّةِ أَنْحَاءِ العَالَمِ.',
      notes: '💡 القِيمَةُ المُسْتَفَادَةُ: الاعْتِزَازُ بِالهُوِيَّةِ المِصْرِيَّةِ وَتَوْظِيفُ أَحْدَثِ التِّقْنِيَّاتِ فِي خِدْمَةِ التُّرَاثِ الإِنْسَانِيِّ.'
    },
    {
      id: 'p2',
      title: '٢- مُكَوِّنَاتُ المَتْحَفِ وَأَهَمِّيَّتُهُ العَالَمِيَّةُ',
      text: 'يَضُمُّ المَتْحَفُ قَاعَاتِ عَرْضٍ حَدِيثَةً مُجَهَّزَةً بِأَحْدَثِ وَسَائِلِ التِّكْنُولُوجْيَا، وَمَرَاكِزَ مُتَقَدِّمَةً لِتَرْمِيمِ الآثَارِ وَصِيَانَتِهَا بِأَيْدِي خُبَرَاءَ مِصْرِيِّينَ، وَمَتْحَفاً خَاصّاً لِلأَطْفَالِ يَعْتَمِدُ عَلَى التَّفَاعُلِ وَالوَاقِعِ الاِفْتِرَاضِيِّ. يُعَزِّزُ هَذَا الصَّرْحُ مِنَ السِّيَاحَةِ الثَّقَافِيَّةِ وَيَحْفَظُ تَارِيخَ الأَجْدَادِ لِتَتَوَارَثَهُ الأَجْيَالُ القَادِمَةُ بِكُلِّ فَخْرٍ وَاعْتِزَازٍ.',
      notes: '💡 القِيمَةُ المُسْتَفَادَةُ: الجَمْعُ بَيْنَ المُحَافَظَةِ عَلَى المَاضِي وَالانْطِلَاقِ نَحْوَ المُسْتَقْبَلِ بِرُوحِ الاِبْتِكَارِ.'
    }
  ]

  const vocabList = [
    { word: 'يَعْكِسُ', meaning: 'يُظهر ويُبرز ويوضح' },
    { word: 'التُّرَاث', meaning: 'ما تركه الأجداد والقدماء من علم وثقافة وفن وحضارة' },
    { word: 'صَرْح', meaning: 'بناء شامخ عظيم مرتفع', plural: 'صُرُوح' },
    { word: 'تَرْمِيم', meaning: 'إصلاح الآثار التالفة وتجديدها وصيانتها بدقة' },
    { word: 'يُعَزِّزُ', meaning: 'يقوي ويدعم ويثبت', opposite: 'يُضْعِفُ وَيَهْدِمُ' },
    { word: 'تَتَوَارَثُهُ', meaning: 'يتناقله جيل بعد جيل' }
  ]

  const questions = [
    {
      q: 'س1: مَا الهَدَفُ مِنْ إِنْشَاءِ المَتْحَفِ المِصْرِيِّ الكَبِيرِ؟',
      a: 'حِمَايَةُ التُّرَاثِ وَالحَضَارَةِ المِصْرِيَّةِ، وَتَقْدِيمُ صَرْحٍ ثَقَافِيٍّ وَتَعْلِيمِيٍّ وَسِيَاحِيٍّ عَالَمِيٍّ يَحْفَظُ الآثَارَ بِتِقْنِيَّاتٍ حَدِيثَةٍ لِلأَجْيَالِ القَادِمَةِ.'
    },
    {
      q: 'س2: كَيْفَ يَخْدُمُ المَتْحَفُ المِصْرِيُّ الكَبِيرُ العَمَلِيَّةَ التَّعْلِيمِيَّةَ وَالتَّثْقِيفِيَّةَ لِلأَطْفَالِ؟',
      a: 'مِنْ خِلَالِ مَتْحَفٍ خَاصٍّ لِلأَطْفَالِ يَسْتَخْدِمُ تِقْنِيَّاتِ الوَاقِعِ الاِفْتِرَاضِيِّ وَالوَسَائِلَ التَّفَاعُلِيَّةَ لِتَبْسِيطِ تَارِيخِ مِصْرَ وَجَذْبِ انْتِبَاهِهِمْ.'
    },
    {
      q: 'س3: مَا دَوْرُ مَرَاكِزِ التَّرْمِيمِ المُتَطَوِّرَةِ دَاخِلَ المَتْحَفِ؟',
      a: 'صِيَانَةُ الآثَارِ النَّادِرَةِ وَتَرْمِيمُهَا بِأَسَالِيبَ عِلْمِيَّةٍ حَدِيثَةٍ لِضَمَانِ بَقَائِهَا وَحِمَايَتِهَا مِنْ عَوَامِلِ التَّلَفِ وَالزَّمَنِ.'
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
                <span>نص استماع - الوحدة الثانية (أصنع مستقبلي)</span>
              </div>
              <h1 className={styles.title}>تاريخنا.. أساس لمستقبلنا (المتحف المصري الكبير)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#059669', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={24} /> محتوى الدرس ومحاور القراءة
          </h2>

          {/* Paragraphs with Read Buttons */}
          {paragraphs.map((para) => (
            <ParagraphCard
              key={para.id}
              id={`lesson4-${para.id}`}
              title={para.title}
              text={para.text}
              notes={para.notes}
            />
          ))}

          {/* Vocabulary Section */}
          <VocabularySection
            title="معاني المفردات واللغويات (درس تاريخنا.. أساس لمستقبلنا)"
            vocabList={vocabList}
            id="lesson5-vocab"
          />

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP1_QUIZZES['reading-5'] && (
            <InteractiveQuiz
              quizData={PREP1_QUIZZES['reading-5']}
              id="lesson5-quiz"
            />
          )}

          {/* Questions */}
          <QuestionsCard
            title="تدريبات وأسئلة الفهم القرائي"
            questions={questions}
            id="lesson5-questions"
          />
        </div>
      </div>
    </div>
  )
}
