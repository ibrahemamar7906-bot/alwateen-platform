'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, PenTool } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'
import { PREP1_QUIZZES } from '../../data/prep1_quizzes'

export default function WritingLesson2() {
  const paragraphs = [
    {
      id: 'p1',
      title: '١- مفهوم السيرة الغيرية والفارق بينها وبين الذاتية',
      text: 'السيرة الغيرية هي نص نثري يكتبه المؤلف عن حياة شخصية أخرى بارزة أو مؤثرة، معتمداً على الحقائق التاريخية الموثقة والأدلة المادية، وليس على الخيال المجرد. من أهم سماتها: استخدام ضمير الغائب (هو، هي، وُلد، نشأ، أسهم، تميز)، والموضوعية التامة في نقل الأحداث دون تحيز، وبيان أثر الشخصية وقيمتها في المجتمع.'
    },
    {
      id: 'p2',
      title: '٢- خطوات ومراحل كتابة السيرة الغيرية النموذجية',
      text: `تتكون السيرة الغيرية من ثلاثة أقسام مترابطة:
١. المقدمة: (فكرة عامة وموجزة عن الشخصية، وأبرز ما اشتهرت به، ومكانتها في مجالها العلمي أو الأدبي أو الوطني).
٢. العرض (جسم الموضوع): (تفاصيل النشأة، البيئة والتعليم، أبرز الإنجازات والبطولات، والعقبات والمصاعب التي واجهتها وكيف تغلبت عليها بالإرادة).
٣. الخاتمة: (رأي الكاتب في الشخصية، وتلخيص الأثر الباقي الذي تركته للأجيال القادمة، والقدوة التي تجسدها).`
    }
  ]

  const questions = [
    {
      q: 'ما الفرق الجوهري بين السيرة الذاتية والسيرة الغيرية؟',
      a: 'السيرة الذاتية يكتبها الإنسان عن نفسه بضمير المتكلم، أما السيرة الغيرية فيكتبها كاتب عن شخصية أخرى بضمير الغائب معتمداً على البحث والتوثيق.'
    },
    {
      q: 'ما العناصر الثلاثة الأساسية لبناء السيرة الغيرية؟',
      a: '١. المقدمة والتعريف بالشخصية ومكانتها، ٢. الموضوع (النشأة والتعليم والإنجازات والصعاب)، ٣. الخاتمة والأثر التاريخي والقيمة الملهمة.'
    },
    {
      q: 'لماذا تشترط السيرة الغيرية الموضوعية والأمانة التاريخية؟',
      a: 'لأنها تؤرخ لحياة إنسان حقيقي وتنقله كقدوة للأجيال، فلا يجوز فيها اختلاق وقائع وهمية أو تحريف الحقائق الثابتة.'
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
                <span>التعبير الكتابي - الدرس الثاني</span>
              </div>
              <h1 className={styles.title}>التعبير: كتابة السيرة الغيرية</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#059669', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} /> خطوات وعناصر كتابة السيرة الغيرية
          </h2>

          {/* Paragraphs with Read Buttons */}
          {paragraphs.map((p) => (
            <ParagraphCard
              key={p.id}
              id={`writing2-${p.id}`}
              title={p.title}
              text={p.text}
            />
          ))}

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP1_QUIZZES['writing-2'] && (
            <InteractiveQuiz
              quizData={PREP1_QUIZZES['writing-2']}
              id="writing2-interactive-quiz"
            />
          )}

          {/* Practice Questions */}
          <QuestionsCard
            title="تدريب تطبيقي على كتابة السيرة الغيرية"
            questions={questions}
            id="writing2-quiz"
          />
        </div>
      </div>
    </div>
  )
}
