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
import { grammarLesson4 } from '../../data/grammar/lesson4'

export default function Lesson4() {
  const cards = [
    {
      id: 'concept',
      title: '١. مفهوم الفعل المعتل',
      explanation: 'الفعل المعتل هو ما كان أحد حروفه الأصلية في صيغة الماضي المجرد حرفاً من أحرف العلة الثلاثة (الألف والواو والياء). وحروف العلة تعتريها التغييرات بالحذف والقلب والتسكين.',
      examples: [
        'أمثلة للأفعال المعتلة: وَعَدَ، وَقَفَ، قَالَ، صَامَ، سَعَى، قَضَى، وَقَى، رَوَى.'
      ]
    },
    {
      id: 'types',
      title: '٢. أقسام وأنواع الفعل المعتل',
      explanation: 'ينقسم الفعل المعتل إلى أربعة أقسام رئيسية حسب موضع حرف العلة في وزنه الصرفي (فعل):',
      examples: [
        '١. المعتل المثال: ما كان فاؤه (حرفه الأول) حرف علة، وغالباً يكون واواً مثل: (وَقَفَ، وَعَدَ، وَجَدَ، وَهَبَ) أو ياءً مثل: (يَئِسَ، يَبِسَ، يَقِظَ).',
        '٢. المعتل الأجوف: ما كان عينه (حرفه الأوسط) حرف علة (ألفاً أصلها واو أو ياء)، مثل: (قَالَ، صَامَ، عَادَ، بَاعَ، عَاشَ، سَارَ).',
        '٣. المعتل الناقص: ما كان لامه (حرفه الأخير) حرف علة، مثل: (دَعَا، رَجَا، سَمَا، قَضَى، سَعَى، جَرَى).',
        '٤. المعتل اللفيف: ما كان فيه حرفان من أحرف العلة، وهو نوعان: لفيف مفروق (الحرف الأول والأخير علة وبينهما صحيح) مثل: (وَقَى، وَفَى، وَعَى)، ولفيف مقرون (الحرف الثاني والثالث علة متتاليان) مثل: (رَوَى، شَوَى، طَوَى، نَوَى).'
      ],
      exampleBoxColor: '#eff6ff',
      exampleTextColor: '#1d4ed8'
    }
  ]

  const notesText = `• قاعدة مهمة: لمعرفة أصل الألف في الأجوف أو الناقص، نأتي بالمضارع أو المصدر.
• مثال: (قال -> يقول -> أصلها واو)، (باع -> يبيع -> أصلها ياء)، (دعا -> يدعو -> أصلها واو)، (قضى -> يقضي -> أصلها ياء).
• احذر: إذا اتصل بالفعل ضمير أو حُذف حرف العلة في الأمر أو الجزم (مثل: قُلْ، يَقُلْ، اسْعَ، ادْعُ)، يجب رد الفعل إلى ماضيه (قال، سعى، دعا) لمعرفة نوعه.`

  const questions = [
    {
      q: 'بيّن نوع الفعل المعتل في: "وَقَفَ المعلمُ يشرحُ الدرسَ بإخلاص"؟',
      a: 'الفعل (وقف) معتل مثال، لأن فاءه (أوله) حرف علة وهو الواو.'
    },
    {
      q: 'بيّن نوع الفعل المعتل في: "قَالَ الصادقُ شهادةَ الحقِّ أمام القاضي"؟',
      a: 'الفعل (قال) معتل أجوف، لأن عينه (وسطه) حرف علة وهو الألف.'
    },
    {
      q: 'بيّن نوع الفعل المعتل في: "سَعَى المجتهدُ في طلبِ العلمِ والرفعة"؟',
      a: 'الفعل (سعى) معتل ناقص، لأن لامه (آخره) حرف علة وهو الألف اللينة.'
    },
    {
      q: 'بيّن نوع الفعل المعتل في: "وَفَى الصديقُ بعهده لصديقه المخلص"؟',
      a: 'الفعل (وفى) معتل لفيف مفروق، لأن أوله وآخره حرفا علة فرّق بينهما حرف الفاء الصحيح.'
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
                <span>قواعد النحو - الدرس الرابع</span>
              </div>
              <h1 className={styles.title}>أنواع الفعل المعتل</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#059669', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} /> محتوى الدرس وقواعد الفعل المعتل
          </h2>

          {/* Grammar Concepts with Audio */}
          {cards.map((c) => (
            <GrammarCard
              key={c.id}
              id={`lesson4-${c.id}`}
              title={c.title}
              explanation={c.explanation}
              examples={c.examples}
              exampleBoxColor={c.exampleBoxColor}
              exampleTextColor={c.exampleTextColor}
            />
          ))}

          {/* Notes */}
          <ParagraphCard
            id="lesson4-notes"
            title="مفتاح التمييز بين الأجوف والناقص واللفيف"
            text={notesText}
          />

          {/* Comprehensive Grammar Practice Section (Rule MCQs + Exam Passages with Parsing & Extraction) */}
          <GrammarPracticeSection
            grammarData={grammarLesson4}
            id="grammar4-practice"
          />

          {/* Questions */}
          <QuestionsCard
            title="تدريب وتطبيق على أنواع الفعل المعتل"
            questions={questions}
            id="lesson4-quiz"
          />
        </div>
      </div>
    </div>
  )
}
