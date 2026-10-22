'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, PenTool, Sparkles, Award } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'

export default function GrammarLessonPage() {
  const title = "اسم الآلة";
  const subtitle = "فرع النحو (المشتقات) - الصف الثالث الإعدادي";
  const paragraphs = [
  {
    "id": "g1",
    "title": "القاعدة والتفصيل 1",
    "text": "تعريف اسم الآلة: اسم مشتق للدلالة على الآلة التي يُؤدَّى بها الفعل.\r\n أنواعه: ينقسم إلى نوعين أساسيين:"
  },
  {
    "id": "g2",
    "title": "القاعدة والتفصيل 2",
    "text": "1. مشتق (قياسي): ويُصاغ من الأفعال الثلاثية المتعدية غالباً، وله أوزان قياسية:\r\n * أوزان قديمة: مِفْعَال (مِنْشَار)، مِفْعَل (مِبْرَد)، مِفْعَلَة (مِكْنَسَة)."
  },
  {
    "id": "g3",
    "title": "القاعدة والتفصيل 3",
    "text": "* أوزان حديثة (أقرها المجمع اللغوي): فَعَّالَة (غَسَّالَة)، فِعَالَة (خِزَانَة)، فَاعُول (حَاسُوب)، فَاعِلَة (سَاقِيَة)."
  },
  {
    "id": "g4",
    "title": "القاعدة والتفصيل 4",
    "text": "2. جامد (سماعي): أسماء غير مشتقة، ليس لها فعل أُخذت منه، ولا تخضع لأوزان محددة. مثل: (فَأْس، قَلَم، سَيْف، رُمْح، سِكِّين، قِرْطَاس، شَوْكَة)."
  }
];
  const guide = [
  {
    "q": "سر التفريق بين المشتق والجامد",
    "a": "عشان تعرف الآلة دي قياسية (مشتقة) ولا جامدة، حاول تجيب منها فعل ماضي. (مِنْشَار) ⬅ فعلها (نَشَرَ)، إذن هي مشتق قياسي. (سَيْف) ⬅ هل لها فعل؟ لا، ملهاش. إذن هي جامد سماعي."
  },
  {
    "q": "تريكة الأوزان المشتركة كلمة زي (مِنْشَار) أو (مِذْيَاع) ممكن تيجي \"اسم آلة\" وممكن تيجي \"صيغة مبالغة\".",
    "a": "(يستمع الأب إلى المِذْيَاع) ⬅ آلة الراديو (اسم آلة). (الصحفي مِذْيَاع للأخبار) ⬅ أي كثير الإذاعة (صيغة مبالغة)."
  }
];
  const quizzes = [
  {
    "question": "كل أسماء الآلة الآتية قياسية مشتقة ما عدا:",
    "options": [
      "مِطْرَقَة",
      "غَسَّالَة",
      "فَأْس",
      "مِحْرَاث"
    ],
    "correct": "فَأْس"
  },
  {
    "question": "هذا الرجل مِفْتَاح للخير. كلمة (مِفْتَاح) في الجملة تُعد:",
    "options": [
      "اسم آلة",
      "صيغة مبالغة",
      "اسم مفعول",
      "اسم فاعل"
    ],
    "correct": "صيغة مبالغة"
  }
];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-3/grammar" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <PenTool size={18} />
                <span>{subtitle}</span>
              </div>
              <h1 className={styles.title}>{title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        {/* Explanation */}
        {paragraphs.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px', color: '#064e3b' }}>
              ⚖️ القواعد النحوية والشرح التطبيقي
            </h2>
            {paragraphs.map((p) => (
              <ParagraphCard key={p.id} id={p.id} title={p.title} text={p.text} />
            ))}
          </div>
        )}

        {/* Student Guide */}
        {guide.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px', color: '#064e3b' }}>
              💡 شفرات واستراتيجيات الإعراب السريع
            </h2>
            <QuestionsCard questions={guide} />
          </div>
        )}

        {/* Interactive Quiz */}
        {quizzes.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px', color: '#064e3b' }}>
              🎯 تدريب نحوي وتطبيق إلكتروني فوري
            </h2>
            <InteractiveQuiz questions={quizzes} lessonTitle={title} />
          </div>
        )}
      </div>
    </div>
  )
}
