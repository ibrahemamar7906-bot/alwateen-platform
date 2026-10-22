'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, PenTool, Sparkles, Award } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'

export default function GrammarLessonPage() {
  const title = "صيغ المبالغة";
  const subtitle = "فرع النحو (المشتقات) - الصف الثالث الإعدادي";
  const paragraphs = [
  {
    "id": "g1",
    "title": "القاعدة والتفصيل 1",
    "text": "تعريف صيغ المبالغة: أسماء مشتقة من الفعل المبني للمعلوم للدلالة على كثرة حدوث الفعل والزيادة فيه.\r\n أوزان صيغ المبالغة القياسية: تُصاغ غالباً من الفعل الثلاثي المتعدي، وقد تُصاغ من الفعل اللازم أو غير الثلاثي (نادرًا)، ولها خمسة أوزان مشهورة:"
  },
  {
    "id": "g2",
    "title": "القاعدة والتفصيل 2",
    "text": "1. فَعَّال: مثل (غَفَّار، رَزَّاق، عَلَّام)."
  },
  {
    "id": "g3",
    "title": "القاعدة والتفصيل 3",
    "text": "2. مِفْعَال: مثل (مِقْدَام، مِعْوَان، مِعْطَاء)."
  },
  {
    "id": "g4",
    "title": "القاعدة والتفصيل 4",
    "text": "3. فَعُول: مثل (غَفُور، شَكُور، صَبُور)."
  },
  {
    "id": "g5",
    "title": "القاعدة والتفصيل 5",
    "text": "4. فَعِيل: مثل (سَمِيع، رَحِيم، خَبِير)."
  },
  {
    "id": "g6",
    "title": "القاعدة والتفصيل 6",
    "text": "5. فَعِل: مثل (حَذِر، فَطِن، يَقِظ)."
  }
];
  const guide = [
  {
    "q": "شفرة الحفظ احفظ الجملة السحرية دي عشان متنساش الأوزان الخمسة أبدًا",
    "a": "(هو مِقْوَال كَذَّاب، وأنت حَذِر، والله غَفُور رَحِيم). مِقوال ⬅ مِفْعَال كَذَّاب ⬅ فَعَّال حَذِر ⬅ فَعِل غَفُور ⬅ فَعُول رَحِيم ⬅ فَعِيل"
  }
];
  const quizzes = [
  {
    "question": "الله ...... ذنوب عباده. صيغة المبالغة المناسبة على وزن (فَعَّال) هي:",
    "options": [
      "غَافِر",
      "غَفُور",
      "غَفَّار",
      "مِغْفَار"
    ],
    "correct": "غَفَّار"
  },
  {
    "question": "الجملة التي تشتمل على صيغة مبالغة على وزن (فَعِل) هي:",
    "options": [
      "الجندي مِقْدَام في المعركة.",
      "كن حَذِرًا في تعاملك مع الغرباء.",
      "المؤمن شَكُور لربه.",
      "الله سَمِيع الدعاء."
    ],
    "correct": "كن حَذِرًا في تعاملك مع الغرباء."
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
