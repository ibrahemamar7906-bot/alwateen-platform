'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, PenTool } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'
import { PREP1_QUIZZES } from '../../data/prep1_quizzes'

export default function DictationLesson2() {
  const paragraphs = [
    {
      id: 'p1',
      title: '١- قاعدة أقوى الحركات والهمزة على الواو',
      text: 'في رسم الهمزة المتوسطة نتبع ميزان قوة الحركات: الكسرة هي الأقوى (يناسبها الياء/النبرة)، تليها الضمة (يناسبها الواو)، تليها الفتحة (يناسبها الألف)، وأضعفها السكون. تُكتب الهمزة على الواو إذا كانت الضمة هي الأقوى بين حركة الهمزة وحركة الحرف السابق لها.'
    },
    {
      id: 'p2',
      title: '٢- الحالات الشائعة لرسم الهمزة على الواو',
      text: `تُكتب الهمزة المتوسطة على الواو في الحالات الآتية:
١. إذا كانت مضمومة وما قبلها ساكن، مثل: (مَسْؤُول، تَشَاؤُم، تَدَاؤُب).
٢. إذا كانت ساكنة وما قبلها مضموم، مثل: (مُؤْمِن، يُؤْذِي، بُؤْس، رُؤْيَة).
٣. إذا كانت مفتوحة وما قبلها مضموم، مثل: (مُؤَذِّن، سُؤَال، مُؤَلِّف).
٤. إذا كانت مضمومة وما قبلها مفتوح، مثل: (يَمْلَؤُه، يَؤُمّ، رَؤُوف).
٥. إذا كانت مضمومة وما قبلها مضموم، مثل: (كُؤُوس، شُؤُون).`
    }
  ]

  const questions = [
    {
      q: 'علل: لماذا كُتبت الهمزة على الواو في كلمة "مُؤْمِن"؟',
      a: 'لأن الهمزة ساكنة وما قبلها مضموم، والضمة أقوى من السكون فيناسبها الواو.'
    },
    {
      q: 'علل: لماذا كُتبت الهمزة على الواو في كلمة "مَسْؤُول"؟',
      a: 'لأن الهمزة مضمومة وما قبلها حرف السين ساكن، والضمة أقوى من السكون.'
    },
    {
      q: 'علل: لماذا كُتبت الهمزة على الواو في كلمة "مُؤَذِّن"؟',
      a: 'لأن الهمزة مفتوحة وما قبلها حرف الميم مضموم، والضمة أقوى من الفتحة.'
    },
    {
      q: 'علل: لماذا كُتبت الهمزة على الواو في كلمة "تَفَاؤُل"؟',
      a: 'لأن الهمزة مضمومة وما قبلها حرف مد ساكن (الألف)، والضمة أقوى من السكون.'
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
                <span>قواعد الإملاء - الدرس الثاني</span>
              </div>
              <h1 className={styles.title}>كتابة الهمزة على الواو</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#059669', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} /> محتوى الدرس وقواعد رسم الهمزة على الواو
          </h2>

          {/* Paragraphs with Read Buttons */}
          {paragraphs.map((p) => (
            <ParagraphCard
              key={p.id}
              id={`dictation2-${p.id}`}
              title={p.title}
              text={p.text}
            />
          ))}

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP1_QUIZZES['dictation-2'] && (
            <InteractiveQuiz
              quizData={PREP1_QUIZZES['dictation-2']}
              id="dictation2-interactive-quiz"
            />
          )}

          {/* Practice Questions */}
          <QuestionsCard
            title="تدريب إملائي وتطبيقات التعليل"
            questions={questions}
            id="dictation2-quiz"
          />
        </div>
      </div>
    </div>
  )
}
