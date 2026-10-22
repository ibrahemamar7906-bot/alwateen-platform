'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, PenTool } from 'lucide-react'
import styles from '../../page.module.css'
import GrammarCard from '../../components/GrammarCard'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'
import GrammarPracticeSection from '../../components/GrammarPracticeSection'
import { PREP1_QUIZZES } from '../../data/prep1_quizzes'
import { grammarLesson3 } from '../../data/grammar/lesson3'

export default function Lesson3() {
  const cards = [
    {
      id: 'concept',
      title: '١. مفهوم الفعل الصحيح',
      explanation: 'الفعل الصحيح هو ما خلت حروفه الأصلية في صيغة الماضي المجرد من أحرف العلة الثلاثة (الألف والواو والياء). وهو أساس الأفعال العربية السليمة.',
      examples: [
        'أمثلة للأفعال الصحيحة: كَتَبَ، جَلَسَ، قَرَأَ، سَأَلَ، عَدَّ، زَلْزَلَ.'
      ]
    },
    {
      id: 'types',
      title: '٢. أقسام وأنواع الفعل الصحيح',
      explanation: 'ينقسم الفعل الصحيح إلى ثلاثة أقسام رئيسية حسب سلامة حروفه من الهمز والتضعيف:',
      examples: [
        '١. الصحيح السالم: هو ما سلمت حروفه الأصلية من الهمزة والتضعيف، مثل: (كَتَبَ، حَفِظَ، شَرِبَ، لَعِبَ، نَصَرَ).',
        '٢. الصحيح المهموز: هو ما كان أحد حروفه الأصلية همزة، سواء في أوله (أَكَلَ، أَخَذَ)، أو وسطه (سَأَلَ، دَأَبَ)، أو آخره (قَرَأَ، نَشَأَ، بَدَأَ).',
        '٣. الصحيح المضعف الثلاثي: ما كان عينه ولامه (الحرف الثاني والثالث) من جنس واحد مدغمين، مثل: (مَدَّ، شَدَّ، هَدَّ، عَدَّ، حَبَّ).',
        '٤. الصحيح المضعف الرباعي: ما كان حرفه الأول والثالث من جنس، والثاني والرابع من جنس آخر، مثل: (زَلْزَلَ، وَسْوَسَ، عَسْعَسَ، قَلْقَلَ).'
      ],
      exampleBoxColor: '#eff6ff',
      exampleTextColor: '#1d4ed8'
    }
  ]

  const notesText = `• تذكر دائماً: لتحديد نوع الفعل (سالم أو مهموز أو مضعف)، يجب أن تجرد الفعل من حروف المضارعة والضمائر وتأتي بالماضي المجرد.
• مثال: الفعل (يسألون) -> أصله (سألَ) وهو صحيح مهموز.
• مثال: الفعل (يمدّون) -> أصله (مدَّ) وهو صحيح مضعف ثلاثي.`

  const questions = [
    {
      q: 'بيّن نوع الفعل الصحيح في: "قَرَأَ الطالبُ نصيحةَ المعلمِ بتركيز"؟',
      a: 'الفعل (قرأ) صحيح مهموز، لأن لامه (الحرف الأخير) همزة أصلية.'
    },
    {
      q: 'بيّن نوع الفعل الصحيح في: "مَدَّ المتطوعُ يدَ المساعدةِ للجميع"؟',
      a: 'الفعل (مدّ) صحيح مضعف ثلاثي، لأن الحرفين الثاني والثالث مدغمان (أصله: مَدَدَ).'
    },
    {
      q: 'بيّن نوع الفعل الصحيح في: "نَصَرَ اللهُ الحقَّ على الباطلِ"؟',
      a: 'الفعل (نصر) صحيح سالم، لأن حروفه خلت من الهمزة والتضعيف وأحرف العلة.'
    },
    {
      q: 'بيّن نوع الفعل الصحيح في: "وَسْوَسَ الشيطانُ للإنسانِ ليصرفه عن الخير"؟',
      a: 'الفعل (وسوس) صحيح مضعف رباعي، لأن فاءه ولامه الأولى واو، وعينه ولامه الثانية سين.'
    }
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-1/grammar" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <PenTool size={18} />
                <span>قواعد النحو - الدرس الثالث</span>
              </div>
              <h1 className={styles.title}>أنواع الفعل الصحيح</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#059669', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} /> محتوى الدرس وقواعد الفعل الصحيح
          </h2>

          {/* Grammar Concepts with Audio */}
          {cards.map((c) => (
            <GrammarCard
              key={c.id}
              id={`lesson3-${c.id}`}
              title={c.title}
              explanation={c.explanation}
              examples={c.examples}
              exampleBoxColor={c.exampleBoxColor}
              exampleTextColor={c.exampleTextColor}
            />
          ))}

          {/* Notes */}
          <ParagraphCard
            id="lesson3-notes"
            title="مفتاح تحديد نوع الفعل الصحيح بدقة"
            text={notesText}
          />

          {/* Comprehensive Grammar Practice Section (Rule MCQs + Exam Passages with Parsing & Extraction) */}
          <GrammarPracticeSection
            grammarData={grammarLesson3}
            id="grammar3-practice"
          />

          {/* Questions */}
          <QuestionsCard
            title="تدريب وتطبيق على أنواع الفعل الصحيح"
            questions={questions}
            id="lesson3-quiz"
          />
        </div>
      </div>
    </div>
  )
}
