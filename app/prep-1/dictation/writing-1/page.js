'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, PenTool } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'
import { PREP1_QUIZZES } from '../../data/prep1_quizzes'

export default function WritingLesson1() {
  const paragraphs = [
    {
      id: 'p1',
      title: '١- مفهوم السيرة الذاتية وخصائصها الفنية',
      text: 'السيرة الذاتية هي فن نثري أدبي يكتبه الشخص عن نفسه، ليروي فيه قصة حياته وينقل تجاربه وخبراته ومحطاته للآخرين بصدق وأمانة. من أهم خصائصها: استخدام ضمير المتكلم (أنا، قمتُ، نشأتُ، تعلّمتُ)، والترتيب الزمني المنطقي للأحداث، والجمع بين السرد المشوق والدروس والعبر المستفادة.'
    },
    {
      id: 'p2',
      title: '٢- العناصر الأساسية الثلاثة لكتابة السيرة الذاتية',
      text: `لكتابة سيرة ذاتية متكاملة يجب أن تشتمل على ثلاثة محاور رئيسية:
١. من أنا: (تاريخ ومكان الميلاد، النشأة في كنف الأسرة، البيئة والقرية أو المدينة، والمرحلة الدراسية الأولى).
٢. رحلتي ومواقف لا تُنسى: (مواقف صعبة تغلب عليها بالصبر، أو ذكريات سعيدة وجوائز حققها، وتجارب صقلت شخصيته).
٣. طموحي للمستقبل: (المهنة أو التخصص الذي يحلم به، والهدف الذي يسعى لتحقيقه لخدمة نفسه ووطنه، وكيف يخطط للوصول إليه).`
    }
  ]

  const questions = [
    {
      q: 'ما الضمير الأساسي المستخدم في كتابة السيرة الذاتية ولماذا؟',
      a: 'ضمير المتكلم (أنا / تاء المتكلم / نا الفاعلين)، لأن الكاتب يتحدث عن حياته وتجاربه الشخصية الخاصة.'
    },
    {
      q: 'ما المحاور الثلاثة التي تبنى عليها السيرة الذاتية السليمة؟',
      a: '١. من أنا (الميلاد والنشأة والتعلّم)، ٢. رحلتي ومواقف لا تُنسى (التجارب والمصاعب)، ٣. طموحي وأهدافي في المستقبل.'
    },
    {
      q: 'كيف يوظف الكاتب الأسلوب الأدبي في السيرة الذاتية ليكون مؤثراً؟',
      a: 'بالصدق في عرض المشاعر، وانتقاء الألفاظ المعبّرة، وترتيب الأحداث ترتيباً زمنياً متسلسلاً، وتقديم عبرة تلهم القارئ.'
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
                <span>التعبير الكتابي - الدرس الأول</span>
              </div>
              <h1 className={styles.title}>التعبير: كتابة السيرة الذاتية</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#059669', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} /> خطوات وعناصر كتابة السيرة الذاتية
          </h2>

          {/* Paragraphs with Read Buttons */}
          {paragraphs.map((p) => (
            <ParagraphCard
              key={p.id}
              id={`writing1-${p.id}`}
              title={p.title}
              text={p.text}
            />
          ))}

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP1_QUIZZES['writing-1'] && (
            <InteractiveQuiz
              quizData={PREP1_QUIZZES['writing-1']}
              id="writing1-interactive-quiz"
            />
          )}

          {/* Practice Questions */}
          <QuestionsCard
            title="تدريب تطبيقي على كتابة السيرة الذاتية"
            questions={questions}
            id="writing1-quiz"
          />
        </div>
      </div>
    </div>
  )
}
