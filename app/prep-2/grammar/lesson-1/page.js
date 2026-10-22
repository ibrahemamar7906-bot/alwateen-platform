'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, PenTool, AlertTriangle } from 'lucide-react'
import styles from '../../page.module.css'
import GrammarCard from '../../components/GrammarCard'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import GrammarPracticeSection from '../../components/GrammarPracticeSection'
import { grammarLesson1 } from '../../data/grammar/lesson1'

export default function Lesson1() {
  const cards = [
    {
      id: 'jumla-ismiyya',
      title: '١. الجملة الاسمية ونواسخها (كان وأخواتها - إن وأخواتها)',
      explanation: 'الجملة الاسمية تبدأ بمبتدأ مرفوع وخبر مرفوع. تدخل عليها كان وأخواتها فترفع المبتدأ اسماً لها وتنصب الخبر خبراً لها. وتدخل عليها إن وأخواتها فتنصب المبتدأ اسماً لها وترفع الخبر خبراً لها.',
      examples: [
        'العلمُ نورٌ. (مبتدأ وخبر مرفوعان بالضمة)',
        'كانَ العلمُ نوراً وضاءً. (العلمُ: اسم كان مرفوع، نوراً: خبر كان منصوب)',
        'إنَّ العلمَ نورٌ للأممِ. (العلمَ: اسم إن منصوب، نورٌ: خبر إن مرفوع)'
      ]
    },
    {
      id: 'asmaa-khamsa',
      title: '٢. الأسماء الخمسة وعلامات إعرابها الفرعية',
      explanation: 'الأسماء الخمسة هي: (أبو، أخو، حمو، فو، ذو بمعنى صاحب). تُعرب بعلامات فرعية بشروط: أن تكون مفردة، ومضافة لغير ياء المتكلم.',
      examples: [
        'جاءَ أبوكَ مسروراً. (أبوك: فاعل مرفوع بالواو لأنه من الأسماء الخمسة)',
        'رأيتُ أباكَ كريماً. (أباك: مفعول به منصوب بالألف)',
        'سلّمتُ على أبيكَ الفاضلِ. (أبيك: اسم مجرور بالياء)'
      ],
      exampleBoxColor: '#eff6ff',
      exampleTextColor: '#1d4ed8'
    },
    {
      id: 'tawabi',
      title: '٣. التوابع (النعت، الحال، التوكيد، العطف)',
      explanation: 'النعت يتبع المنعوت في الإعراب والتعريف والتذكير والعدد. الحال اسم نكرة منصوب يبين هيئة صاحبه المعرفة ونسأل عنه بـ (كيف؟).',
      examples: [
        'كرّمت الدولةُ العمالَ المخلصينَ. (المخلصينَ: نعت منصوب بالياء)',
        'رجعَ الجيشُ منتصراً. (منتصراً: حال منصوبة بالفتحة تبيّن هيئة الجيش)'
      ]
    }
  ]

  const notesText = `• قاعدة امتحانية: الاسم الواقع بعد (كل، جميع، بعض، غير، سوى، معظم، ذو، والظروف) يُعرب مضافاً إليه مجروراً دائماً.
• جمع المؤنث السالم ينصب بالكسرة نيابة عن الفتحة وهي علامة فرعية (مثل: كرّمت المعلماتِ).
• الأسماء الخمسة إذا أضيفت لياء المتكلم (أبي، أخي) أُعربت بحركات أصلية مقدرة وليست فرعية.`

  const questions = [
    {
      q: 'أعرب كلمة «ذا» في جملة: «ظل الطالبُ ذا خلقٍ»؟',
      a: 'خبر ظل منصوب وعلامة نصبه الألف لأنه من الأسماء الخمسة، وخلق: مضاف إليه مجرور.'
    },
    {
      q: 'بين نوع المشتق/الإعراب لكلمة «نشيطاً» في: «خرج العاملُ نشيطاً»؟',
      a: 'حال منصوبة وعلامة نصبها الفتحة الظاهرة، لأنها بينت هيئة صاحبها المعرفة (العامل) وقت حدوث الفعل.'
    },
    {
      q: 'استخرج اسماً معرباً بعلامة فرعية في جملة: «شكر المديرُ المعلمينَ المخلصينَ»؟',
      a: 'المعلمينَ (مفعول به منصوب بالياء)، والمخلصينَ (نعت منصوب بالياء)؛ لأنهما جمع مذكر سالم.'
    }
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-2/grammar" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <PenTool size={18} />
                <span>قواعد النحو - الصف الثاني الإعدادي</span>
              </div>
              <h1 className={styles.title}>مراجعة عامة وتأسيسية من مفاتيح الإعراب</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          
          <h2 style={{ color: '#059669', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} /> أهم المفاتيح الإعرابية الذهبية
          </h2>

          {/* Grammar Concepts with Audio */}
          {cards.map((c) => (
            <GrammarCard
              key={c.id}
              id={`glesson1-${c.id}`}
              title={c.title}
              explanation={c.explanation}
              examples={c.examples}
              exampleBoxColor={c.exampleBoxColor}
              exampleTextColor={c.exampleTextColor}
            />
          ))}

          {/* Notes Section with Audio */}
          <ParagraphCard
            id="glesson1-notes"
            title="ملاحظات نحوية وقواعد امتحانية هامة"
            text={notesText}
            icon={<AlertTriangle size={22} color="#d97706" />}
          />

          {/* Comprehensive Grammar Practice Section (Rule MCQs + Exam Passages with Parsing & Extraction) */}
          <div id="questions">
            <GrammarPracticeSection
              grammarData={grammarLesson1}
              id="grammar1-practice"
            />
          </div>

          {/* Quick Practice */}
          <QuestionsCard
            title="تدريبات وتطبيقات سريعة على مفاتيح الإعراب"
            questions={questions}
            id="glesson1-quick-quiz"
          />

        </div>
      </div>
    </div>
  )
}