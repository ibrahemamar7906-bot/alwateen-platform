'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, PenTool } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'
import { PREP1_QUIZZES } from '../../data/prep1_quizzes'

export default function DictationLesson3() {
  const paragraphs = [
    {
      id: 'p1',
      title: '١- الكسرة سيدة الحركات والهمزة على الياء (النبرة)',
      text: 'الكسرة هي أقوى الحركات على الإطلاق في اللغة العربية، فإذا دخلت الكسرة في مقارنة مع أي حركة أخرى (الضمة، الفتحة، السكون) فإنها تغلبها فوراً. لذلك متى كانت الهمزة مكسورة أو كان الحرف الذي يسبقها مكسوراً، تُكتب الهمزة فوراً على ياء (نبرة).'
    },
    {
      id: 'p2',
      title: '٢- حالات رسم الهمزة على نبرة والهمزة المتطرفة',
      text: `تُكتب الهمزة على نبرة في الحالات الآتية:
١. إذا كانت الهمزة مكسورة، مثل: (سُئِلَ، عَائِلَة، رَئِيس، صَائِم).
٢. إذا كان ما قبلها مكسوراً مهما كانت حركتها، مثل: (بِئْر، فِئَة، ذِئْب، سَيِّئَة، مُنْشِئُون).
٣. إذا سبقتها ياء ساكنة (ياء المد أو اللين)، مثل: (بِيئَة، خَطِيئَة، هَيْئَة، جَرِيئَة).
٤. الهمزة المتطرفة: تُكتب على ياء غير منقوطة (ـى) إذا كان الحرف الذي قبلها مكسوراً، مثل: (شَاطِئ، قَارِئ، يَسْتَهْزِئ، دَافِئ).`
    }
  ]

  const questions = [
    {
      q: 'علل: لماذا كُتبت الهمزة على نبرة في كلمة "بِئْر"؟',
      a: 'لأن الهمزة ساكنة وما قبلها حرف الباء مكسور، والكسرة أقوى الحركات ويناسبها النبرة.'
    },
    {
      q: 'علل: لماذا كُتبت الهمزة على نبرة في كلمة "عَائِلَة"؟',
      a: 'لأن الهمزة مكسورة بعد ألف مد ساكنة، والكسرة أقوى الحركات.'
    },
    {
      q: 'علل: لماذا كُتبت الهمزة على نبرة في كلمة "مُطْمَئِنّ"؟',
      a: 'لأن الهمزة مكسورة وما قبلها حرف الميم مفتوح، والكسرة أقوى من الفتحة.'
    },
    {
      q: 'علل: لماذا كُتبت الهمزة المتطرفة على ياء في كلمة "شَاطِئ"؟',
      a: 'لأنها همزة متطرفة سبقت بحرف مكسور وهو حرف الطاء، فرسمت على شكل الياء.'
    }
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-1/dictation" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <PenTool size={18} />
                <span>قواعد الإملاء - الدرس الثالث</span>
              </div>
              <h1 className={styles.title}>كتابة الهمزة على الياء (النبرة)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#059669', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} /> محتوى الدرس وقواعد رسم الهمزة على النبرة
          </h2>

          {/* Paragraphs with Read Buttons */}
          {paragraphs.map((p) => (
            <ParagraphCard
              key={p.id}
              id={`dictation3-${p.id}`}
              title={p.title}
              text={p.text}
            />
          ))}

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP1_QUIZZES['dictation-3'] && (
            <InteractiveQuiz
              quizData={PREP1_QUIZZES['dictation-3']}
              id="dictation3-interactive-quiz"
            />
          )}

          {/* Practice Questions */}
          <QuestionsCard
            title="تدريب وتطبيق على الهمزة على النبرة"
            questions={questions}
            id="dictation3-quiz"
          />
        </div>
      </div>
    </div>
  )
}
