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
import { grammarLesson5 } from '../../data/grammar/lesson5'

export default function Lesson5() {
  const cards = [
    {
      id: 'concept',
      title: '١. مفهوم ظن وأخواتها وعملها النحوي',
      explanation: 'ظن وأخواتها أفعال ناسخة متعدية تدخل على الجملة الاسمية، فتنصب المبتدأ والخبر ليصبحا مفعولاً به أول ومفعولاً به ثانٍ للفعل الناسخ، بعد أن كانا مبتدأ وخبراً مرفوعين.',
      examples: [
        'الجملة الاسمية قبل الدخول: الامتحانُ سهلٌ. (مبتدأ وخبر مرفوعان)',
        'بعد دخول الفعل الناسخ: ظَنَنْتُ الامتحانَ سهلاً. (ظنّ: فعل ناسخ، التاء: فاعل، الامتحانَ: مفعول به أول منصوب، سهلاً: مفعول به ثانٍ منصوب).'
      ]
    },
    {
      id: 'categories',
      title: '٢. أقسام ظن وأخواتها من حيث الدلالة والمعنى',
      explanation: 'تنقسم ظن وأخواتها بحسب المعنى إلى ثلاثة أقسام رئيسية:',
      examples: [
        '١. أفعال الرجحان والشك: تفيد غلبة اليقين مع وجود الشك، وهي: (ظَنَّ، حَسِبَ، زَعَمَ، خَالَ). مثل: (حَسِبَ الكسولُ النجاحَ سهلاً بلا جهد).',
        '٢. أفعال اليقين: تفيد تمام الاعتقاد واليقين الجازم، وهي: (عَلِمَ، وَجَدَ، رَأَى القلبية). مثل: (رَأَيْتُ الصدقَ منجاةً لصاحبه، عَلِمْتُ الحقَّ منتصراً).',
        '٣. أفعال التحويل والتصيير: تفيد تحويل الشيء من حال إلى حال، وأشهرها: (جَعَلَ). مثل: (جَعَلَ الصانعُ القطنَ ثوباً ناعماً).'
      ],
      exampleBoxColor: '#eff6ff',
      exampleTextColor: '#1d4ed8'
    }
  ]

  const notesText = `• مطب امتحاني خطير: (رأى) تنصب مفعولين إذا كانت قلبية (بمعنى علم واعتقد)، مثل: (رأيتُ الصدقَ طريقَ النجاة).
• أما إذا كانت (رأى) بصرية (بالعين المجردة)، فإنها تنصب مفعولاً به واحداً فقط، والاسم المنصوب بعدها يُعرب حالاً! مثل: (رأيتُ العصفورَ مغرداً -> مغرداً: حال منصوبة).
• المضارع والأمر من هذه الأفعال يعملان عمل الماضي أيضاً، مثل: (يظنُّ الطالبُ التفوقَ صيداً سهلاً)، (اجعلْ خُلقَكَ دليلكَ).`

  const questions = [
    {
      q: 'استخرج الفعل الناسخ ومفعوليه في: "عَلِمْتُ الصدقَ منجاةً لصاحبه"؟',
      a: 'الفعل الناسخ: عَلِمَ (يفيد اليقين)، والتاء ضمير فاعل. المفعول به الأول: (الصدقَ)، والمفعول به الثاني: (منجاةً).'
    },
    {
      q: 'بيّن إعراب كلمة "مغرداً" في: "رَأَيْتُ الطائرَ مغرداً"؟',
      a: 'تُعرب (مغرداً) حالاً منصوبة بالفتحة، لأن الرؤية هنا بصرية بالعين وليست قلبية ذهنية، فالفعل (رأى البصري) ينصب مفعولاً واحداً (الطائرَ).'
    },
    {
      q: 'استخرج المفعولين في: "جَعَلَ النجارُ الخشبَ مقعداً جميلاً"؟',
      a: 'المفعول به الأول: (الخشبَ)، والمفعول به الثاني: (مقعداً)، والفعل (جعل) يفيد التحويل.'
    },
    {
      q: 'حدد دلالة الفعل الناسخ في: "زَعَمَ العدوُّ النصرَ قريباً"؟',
      a: 'الفعل (زعم) يفيد الرجحان والشك والتوهم الباطل.'
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
                <span>قواعد النحو - الدرس الخامس</span>
              </div>
              <h1 className={styles.title}>ظن وأخواتها</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#059669', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} /> محتوى الدرس وقواعد ظن وأخواتها
          </h2>

          {/* Grammar Concepts with Audio */}
          {cards.map((c) => (
            <GrammarCard
              key={c.id}
              id={`lesson5-${c.id}`}
              title={c.title}
              explanation={c.explanation}
              examples={c.examples}
              exampleBoxColor={c.exampleBoxColor}
              exampleTextColor={c.exampleTextColor}
            />
          ))}

          {/* Notes */}
          <ParagraphCard
            id="lesson5-notes"
            title="الفرق بين رأى القلبية ورأى البصرية"
            text={notesText}
            icon={<AlertTriangle size={22} color="#d97706" />}
          />

          {/* Comprehensive Grammar Practice Section (Rule MCQs + Exam Passages with Parsing & Extraction) */}
          <GrammarPracticeSection
            grammarData={grammarLesson5}
            id="grammar5-practice"
          />

          {/* Questions */}
          <QuestionsCard
            title="تدريب وتطبيق على ظن وأخواتها"
            questions={questions}
            id="lesson5-quiz"
          />
        </div>
      </div>
    </div>
  )
}
