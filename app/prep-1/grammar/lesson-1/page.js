'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, PenTool, AlertTriangle } from 'lucide-react'
import styles from '../../page.module.css'
import GrammarCard from '../../components/GrammarCard'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'
import GrammarPracticeSection from '../../components/GrammarPracticeSection'
import { PREP1_QUIZZES } from '../../data/prep1_quizzes'
import { grammarLesson1 } from '../../data/grammar/lesson1'

export default function Lesson1() {
  const cards = [
    {
      id: 'lazim',
      title: '١. الفعل اللازم',
      explanation: 'هو الفعل الذي يكتفي بفاعله ولا يحتاج إلى مفعول به لإتمام معنى الجملة. فالجملة تتم وتكتمل بالفاعل وحده أو بوجود جار ومجرور أو ظرف.',
      examples: [
        'نزلَ المطرُ غزيراً. (نزلَ: فعل ماضٍ، المطرُ: فاعل مرفوع، والجملة تامة بلا مفعول به)',
        'عادَ الطالبُ من المدرسةِ مسروراً. (فعل لازم اكتفى بفاعله وجار ومجرور)',
        'ينتصرُ الحقُّ دائماً على الباطلِ.'
      ]
    },
    {
      id: 'mutaadi',
      title: '٢. الفعل المتعدي',
      explanation: 'هو الفعل الذي لا يكتفي بفاعله، بل يتعداه ويحتاج إلى مفعول به واحد أو أكثر لإتمام المعنى وتوضيح دلالة الجملة.',
      examples: [
        'يغسلُ الولدُ السيارةَ. (السيارةَ: مفعول به منصوب، ولا يتم المعنى بدونه)',
        'اصطادَ الصيادُ السمكَ من النهرِ.',
        'كرّمتِ الدولةُ الشهداءَ الأبرارَ تقديراً لتضحياتهم.'
      ],
      exampleBoxColor: '#eff6ff',
      exampleTextColor: '#1d4ed8'
    }
  ]

  const notesText = `• يمكن تحويل الفعل اللازم إلى متعدٍ بزيادة همزة في أوله (مثل: خَرَجَ الولدُ -> أَخْرَجَ المعلمُ الولدَ) أو بتضعيف الحرف الثاني (مثل: فَرِحَ الطالبُ -> فَرَّحَ النجاحُ الطالبَ).
• الضمائر المتصلة (كاف الخطاب، هاء الغيبة، ياء المتكلم، ونا المفعولين) إذا اتصلت بالفعل، تُعرب دائماً في محل نصب مفعول به، ويكون الفعل حينئذ متعدياً (مثل: أكرمني المعلمُ، أهدتكَ المدرسةُ جائزةً).
• هناك أفعال لازمة مشهورة يلزمها الفاعل دائماً مثل: (يجب، ينبغي، يحسن، يجوز، يمكن، ظهر، احمرّ، انكسر، اطمأنّ، تحطّم). الاسم بعدها يُعرب فاعلاً دائماً.`

  const questions = [
    {
      q: 'حدد نوع الفعل في جملة: "تحب الأم أبناءها"؟',
      a: 'الفعل (تحب) متعدٍ، لأنه نصب مفعولاً به وهو كلمة (أبناءها).'
    },
    {
      q: 'حدد نوع الفعل في جملة: "اتجه الشباب إلى تعمير الصحراء"؟',
      a: 'الفعل (اتجه) فعل لازم، لأنه اكتفى بفاعله (الشباب) ولم ينصب مفعولاً به.'
    },
    {
      q: 'حدد نوع الفعل في جملة: "يحقق المخلصون أهدافهم العظيمة"؟',
      a: 'الفعل (يحقق) متعدٍ، لأنه نصب مفعولاً به وهو كلمة (أهدافهم).'
    },
    {
      q: 'حدد نوع الفعل في جملة: "اشترك الطلاب في عمل مجلة الفصل"؟',
      a: 'الفعل (اشترك) لازم، لأنه اكتفى بفاعله (الطلاب) مع الجار والمجرور.'
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
                <span>قواعد النحو - الدرس الأول</span>
              </div>
              <h1 className={styles.title}>الفعل اللازم والفعل المتعدي</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          
          <h2 style={{ color: '#059669', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} /> مفهوم الفعل اللازم والمتعدي
          </h2>

          {/* Grammar Concepts with Audio */}
          {cards.map((c) => (
            <GrammarCard
              key={c.id}
              id={`lesson1-${c.id}`}
              title={c.title}
              explanation={c.explanation}
              examples={c.examples}
              exampleBoxColor={c.exampleBoxColor}
              exampleTextColor={c.exampleTextColor}
            />
          ))}

          {/* Notes Section with Audio */}
          <ParagraphCard
            id="lesson1-notes"
            title="ملاحظات هامة وقواعد امتحانية ذهبية"
            text={notesText}
            icon={<AlertTriangle size={22} color="#d97706" />}
          />

          {/* Comprehensive Grammar Practice Section (Rule MCQs + Exam Passages with Parsing & Extraction) */}
          <GrammarPracticeSection
            grammarData={grammarLesson1}
            id="grammar1-practice"
          />

          {/* Quick Practice with Audio */}
          <QuestionsCard
            title="تدريب سريع على تحديد اللازم والمتعدي"
            questions={questions}
            id="lesson1-grammar-quiz"
          />

        </div>
      </div>
    </div>
  )
}
