'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, PenTool } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'
import { PREP1_QUIZZES } from '../../data/prep1_quizzes'

export default function DictationLesson1() {
  const paragraphs = [
    {
      id: 'p1',
      title: '١- الهمزة في أول الكلمة (القطع والوصل)',
      text: 'همزة القطع هي همزة تظهر في النطق والكتابة دائماً في أول الكلام ووسطه، وتُكتب رأساً صغيراً فوق الألف (أَ، أُ) أو تحتها (إِ)، مثل: (أَحْمَد، أُكْرِمَ، إِحْسَان). أما ألف الوصل فتُنطق في ابتداء الكلام وتسقط في درجه ووصله ولا تُكتب فوقها همزة، مثل: (ابْن، اسْم، اسْتِخْرَاج، الكِتَاب).'
    },
    {
      id: 'p2',
      title: '٢- قواعد كتابة الهمزة المتوسطة على الألف',
      text: `تُكتب الهمزة المتوسطة على الألف إذا كانت الفتحة هي الحركة الأقوى بين حركة الهمزة وحركة ما قبلها، وذلك في ثلاث حالات رئيسية:
١. إذا كانت الهمزة مفتوحة وما قبلها مفتوح، مثل: (سَأَلَ، تَأَخَّرَ، زَأَرَ، رَأَى).
٢. إذا كانت الهمزة مفتوحة وما قبلها ساكن صحيح، مثل: (مَسْأَلَة، جَزْأَيْن، فَجْأَة).
٣. إذا كانت الهمزة ساكنة وما قبلها مفتوح، مثل: (فَأْس، رَأْس، مَأْمُور، يَأْخُذ).`
    }
  ]

  const questions = [
    {
      q: 'علل: لماذا كُتبت الهمزة على الألف في كلمة "سَأَلَ"؟',
      a: 'لأن الهمزة مفتوحة وما قبلها حرف السين مفتوح أيضاً.'
    },
    {
      q: 'علل: لماذا كُتبت الهمزة على الألف في كلمة "مَسْأَلَة"؟',
      a: 'لأن الهمزة مفتوحة وما قبلها حرف السين ساكن سكوناً صحيحاً، والفتحة أقوى من السكون.'
    },
    {
      q: 'علل: لماذا كُتبت الهمزة على الألف في كلمة "رَأْس"؟',
      a: 'لأن الهمزة ساكنة وما قبلها حرف الراء مفتوح، والفتحة أقوى من السكون.'
    },
    {
      q: 'بيّن نوع الهمزة في كلمة "أَخَذَ" مع التعليل؟',
      a: 'همزة قطع، لأنها في أول الفعل الماضي الثلاثي ومصدره (أخذاً).'
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
                <span>قواعد الإملاء - الدرس الأول</span>
              </div>
              <h1 className={styles.title}>كتابة الهمزة على الألف</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#059669', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} /> محتوى الدرس وقواعد رسم الهمزة
          </h2>

          {/* Paragraphs with Read Buttons */}
          {paragraphs.map((p) => (
            <ParagraphCard
              key={p.id}
              id={`dictation1-${p.id}`}
              title={p.title}
              text={p.text}
            />
          ))}

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP1_QUIZZES['dictation-1'] && (
            <InteractiveQuiz
              quizData={PREP1_QUIZZES['dictation-1']}
              id="dictation1-interactive-quiz"
            />
          )}

          {/* Practice Questions */}
          <QuestionsCard
            title="تدريب إملائي سريع مع التعليل"
            questions={questions}
            id="dictation1-quiz"
          />
        </div>
      </div>
    </div>
  )
}
