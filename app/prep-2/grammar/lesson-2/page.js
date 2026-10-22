'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, PenTool, AlertTriangle } from 'lucide-react'
import styles from '../../page.module.css'
import GrammarCard from '../../components/GrammarCard'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import GrammarPracticeSection from '../../components/GrammarPracticeSection'
import { grammarLesson2 } from '../../data/grammar/lesson2'

export default function Lesson2() {
  const cards = [
    {
      id: 'al-iraab-wal-binaa',
      title: '١. مفهوم الإعراب والبناء وعلامات الإعراب الأصلية والفرعية',
      explanation: 'الإعراب هو تغير ضبط آخر الكلمة تبعاً لاختلاف موقعها في الجملة. أما البناء فهو ثبوت ضبط آخر الكلمة مهما تغير موقعها. الأصل في الأسماء الإعراب، وعلامات الإعراب الأصلية هي: الضمة رفعاً، والفتحة نصباً، والكسرة جراً.',
      examples: [
        'جاءَ التلميذُ (فاعل مرفوع بالضمة - معرب بعلامة أصلية).',
        'شاهدتُ التلميذينِ (مفعول به منصوب بالياء - معرب بعلامة فرعية).',
        'هؤلاءِ طلابٌ أوفياءُ (هؤلاءِ: اسم مبني على الكسر ثابت الضبط في كل جملة).'
      ]
    },
    {
      id: 'mabni-asmaa',
      title: '٢. الأسماء المبنية الستة المقررة',
      explanation: 'الأسماء كلها معربة ما عدا ستة أنواع مبنية: ١- الضمائر كلها (المنفصلة والمتصلة). ٢- أسماء الإشارة عدا (هذان وهاتان). ٣- الأسماء الموصولة عدا (اللذان واللتان). ٤- أسماء الشرط عدا (أيّ). ٥- أسماء الاستفهام عدا (أيّ). ٦- بعض الظروف (حيثُ، منذُ، أمسِ، الآنَ، إذْ، إذا).',
      examples: [
        'هذا طالبٌ نشيطٌ. (هذا: اسم إشارة مبني على السكون في محل رفع مبتدأ).',
        'حيثُ تجلسُ أجلسُ. (حيثُ: ظرف مكان مبني على الضم في محل نصب).'
      ],
      exampleBoxColor: '#eff6ff',
      exampleTextColor: '#1d4ed8'
    },
    {
      id: 'mabni-huroof',
      title: '٣. المعرب والمبني من الحروف',
      explanation: 'جميع حروف اللغة العربية مبنية بلا استثناء ولا محل لها من الإعراب، مثل: حروف الجر (في، إلى...)، حروف العطف (الواو، الفاء، ثم...)، الحروف الناسخة (إنّ، أنَّ...)، وحروف النصب والجزم.',
      examples: [
        'خرجتُ منَ البيتِ. (منْ: حرف جر مبني على السكون لا محل له من الإعراب).'
      ]
    }
  ]

  const notesText = `• قاعدة تحويل المبني إلى معرب: إذا طلب تحويل اسم إشارة أو موصول مبني إلى معرب؛ نحوله فوراً إلى صيغة المثنى!
مثال: "هذا هو الطالب الذي فاز" ⬅ "هذان هما الطالبان اللذان فازا"؛ لأن (هذان واللذان) معربان إعراب المثنى.
• علامة بناء الاسم المبني تعرف من نطق الحرف الأخير: (حيثُ مبني على الضم، الآنَ مبني على الفتح، أمسِ مبني على الكسر، هذا مبني على السكون).`

  const questions = [
    {
      q: 'استخرج اسماً مبنياً وبين نوعه في جملة: «نحن نفتخر بعلماء مصر»؟',
      a: 'الاسم المبني: (نحن)، ونوعه: ضمير منفصل مبني على الضم في محل رفع مبتدأ.'
    },
    {
      q: 'حول الاسم المبني إلى اسم معرب: «هذه الشجرة مثمرة»؟',
      a: 'التحويل للمثنى: «هاتان الشجرتان مثمرتان»؛ لأن (هاتان) اسم إشارة معرب يعرب إعراب المثنى.'
    },
    {
      q: 'أعرب كلمة «الآن» في جملة: «حضر الطلابُ الآنَ»؟',
      a: 'الآنَ: ظرف زمان مبني على الفتح في محل نصب.'
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
                <span>قواعد النحو - الدرس الثاني</span>
              </div>
              <h1 className={styles.title}>المعرب والمبني من الأسماء والحروف</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          
          <h2 style={{ color: '#059669', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} /> أحكام المعرب والمبني من الأسماء والحروف
          </h2>

          {/* Grammar Concepts with Audio */}
          {cards.map((c) => (
            <GrammarCard
              key={c.id}
              id={`glesson2-${c.id}`}
              title={c.title}
              explanation={c.explanation}
              examples={c.examples}
              exampleBoxColor={c.exampleBoxColor}
              exampleTextColor={c.exampleTextColor}
            />
          ))}

          {/* Notes Section with Audio */}
          <ParagraphCard
            id="glesson2-notes"
            title="ملاحظات هامة وقواعد امتحانية ذهبية"
            text={notesText}
            icon={<AlertTriangle size={22} color="#d97706" />}
          />

          {/* Comprehensive Grammar Practice Section (Rule MCQs + Exam Passages with Parsing & Extraction) */}
          <div id="questions">
            <GrammarPracticeSection
              grammarData={grammarLesson2}
              id="grammar2-practice"
            />
          </div>

          {/* Quick Practice */}
          <QuestionsCard
            title="تدريبات وتطبيقات سريعة على الأسماء المبنية"
            questions={questions}
            id="glesson2-quick-quiz"
          />

        </div>
      </div>
    </div>
  )
}
