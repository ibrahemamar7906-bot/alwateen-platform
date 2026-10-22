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
import { grammarLesson2 } from '../../data/grammar/lesson2'

export default function Lesson2() {
  const cards = [
    {
      id: 'concept',
      title: '١. مفهوم الفعل المجرد والمزيد',
      explanation: 'الفعل المجرد هو ما كانت جميع حروفه في صيغة الماضي أصلية، ولا يمكن حذف أي حرف منها وإلا ضاع أصل المعنى أو فسد. أما الفعل المزيد فهو ما زيد فيه على حروفه الأصلية حرف أو حرفان أو ثلاثة أحرف في صيغة الماضي.',
      examples: [
        'أفعال مجردة: كَتَبَ، قَرَأَ، عَلِمَ، دَحْرَجَ، زَلْزَلَ.',
        'أفعال مزيدة: أَكْرَمَ (مزيد بالهمزة)، تَعَلَّمَ (مزيد بالتاء والتضعيف)، اسْتَخْرَجَ (مزيد بثلاثة أحرف: الهمزة والسين والتاء).'
      ]
    },
    {
      id: 'mujarrad',
      title: '٢. أقسام الفعل المجرد',
      explanation: 'ينقسم الفعل المجرد إلى نوعين بحسب عدد حروفه الأصلية في الماضي:',
      examples: [
        '١. مجرد ثلاثي (مكوّن من 3 أحرف أصلية): مثل (ضَرَبَ، نَصَرَ، سَمِعَ، فَهِمَ، مَدَّ).',
        '٢. مجرد رباعي (مكوّن من 4 أحرف أصلية): مثل (دَحْرَجَ، بَعْثَرَ، طَمْأَنَ، زَلْزَلَ، وَسْوَسَ).'
      ],
      exampleBoxColor: '#eff6ff',
      exampleTextColor: '#1d4ed8'
    },
    {
      id: 'mazeed',
      title: '٣. أقسام الفعل المزيد وأحرف الزيادة',
      explanation: 'حروف الزيادة تجتمع في كلمة (سألتمونيها) أو (هناء وتسليم). والزيادة تكون إما بتكرار حرف (التضعيف) أو بإضافة حرف أو أكثر:',
      examples: [
        '١. مزيد ثلاثي بحرف واحد: الهمزة (أَخْرَجَ)، أو الألف (قَاتَلَ)، أو التضعيف (عَلَّمَ).',
        '٢. مزيد ثلاثي بحرفين: الهمزة والنون (انْكَسَرَ)، أو الهمزة والتاء (انْتَصَرَ)، أو التاء والألف (تَعَاوَنَ)، أو التاء والتضعيف (تَقَدَّمَ).',
        '٣. مزيد ثلاثي بثلاثة أحرف: الهمزة والسين والتاء (اسْتَغْفَرَ، اسْتَعْمَلَ).',
        '٤. مزيد رباعي: بحرف (تَدَحْرَجَ)، أو بحرفين (اطْمَأَنَّ، اقْشَعَرَّ).'
      ]
    }
  ]

  const notesText = `• قاعدة ذهبية لمعرفة نوع الفعل: جرّد الفعل دائماً من ضمائر الرفع المتصلة وتاء التأنيث وأحرف المضارعة وردّه إلى صيغة الماضي للمفرد المذكر الغائب (هو).
• مثال: الفعل (يستخرجون) -> نحذف واو الجماعة والياء ونردّه للماضي فيصبح (استخرجَ) وهو مزيد ثلاثي بثلاثة أحرف.
• أحرف المضارعة (أنيت) وضمائر المتصلة (واو الجماعة، تاء الفاعل، ألف الاثنين) ليست من أحرف الزيادة الصرفية.`

  const questions = [
    {
      q: 'بيّن نوع الفعل وأحرف الزيادة في: "اسْتَخْرَجَ المهندسُ البترولَ"؟',
      a: 'الفعل (استخرج) مزيد ثلاثي بثلاثة أحرف، وهي: الهمزة والسين والتاء (أصله: خرج).'
    },
    {
      q: 'بيّن نوع الفعل في: "دَحْرَجَ الطفلُ الكرةَ على الأرض"؟',
      a: 'الفعل (دحرج) مجرد رباعي، لأن جميع حروفه الأربعة أصلية في الماضي ولا يمكن الاستغناء عن حرف منها.'
    },
    {
      q: 'بيّن نوع الفعل في: "تَعَاوَنَ الأصدقاءُ في إعداد المشروع"؟',
      a: 'الفعل (تعاون) مزيد ثلاثي بحرفين، هما: التاء والألف (أصله: عون / عاون).'
    },
    {
      q: 'بيّن نوع الفعل في: "قَاتَلَ الجنديُّ بشجاعة وبسالة"؟',
      a: 'الفعل (قاتل) مزيد ثلاثي بحرف واحد وهو الألف بعد القاف (أصله: قتل).'
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
                <span>قواعد النحو - الدرس الثاني</span>
              </div>
              <h1 className={styles.title}>الفعل المجرد والفعل المزيد</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#059669', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} /> محتوى الدرس وقواعد المجرد والمزيد
          </h2>

          {/* Grammar Concepts */}
          {cards.map((c) => (
            <GrammarCard
              key={c.id}
              id={`lesson2-${c.id}`}
              title={c.title}
              explanation={c.explanation}
              examples={c.examples}
              exampleBoxColor={c.exampleBoxColor}
              exampleTextColor={c.exampleTextColor}
            />
          ))}

          {/* Notes */}
          <ParagraphCard
            id="lesson2-notes"
            title="مفتاح ضبط المجرد والمزيد في الامتحان"
            text={notesText}
          />

          {/* Comprehensive Grammar Practice Section (Rule MCQs + Exam Passages with Parsing & Extraction) */}
          <GrammarPracticeSection
            grammarData={grammarLesson2}
            id="grammar2-practice"
          />

          {/* Quick Quiz */}
          <QuestionsCard
            title="تدريب وتطبيق على المجرد والمزيد"
            questions={questions}
            id="lesson2-quiz"
          />
        </div>
      </div>
    </div>
  )
}
