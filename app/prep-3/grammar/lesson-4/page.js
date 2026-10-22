'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, PenTool, Sparkles, Award } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'

export default function GrammarLessonPage() {
  const title = "اسما الزمان والمكان";
  const subtitle = "فرع النحو (المشتقات) - الصف الثالث الإعدادي";
  const paragraphs = [
  {
    "id": "g1",
    "title": "القاعدة والتفصيل 1",
    "text": "تعريفهما: اسمان مشتقان للدلالة على زمان وقوع الفعل أو مكان وقوعه.\r\n صياغتهما من الفعل الثلاثي: يُصاغان على وزنين:"
  },
  {
    "id": "g2",
    "title": "القاعدة والتفصيل 2",
    "text": "1. مَفْعَل (بفتح العين): إذا كان الفعل صحيح الأول والآخر وعين مضارعه مضمومة (دَخَل ⬅ يَدْخُل ⬅ مَدْخَل) أو مفتوحة (لَعِب ⬅ يَلْعَب ⬅ مَلْعَب)، أو إذا كان معتل الآخر (سَعَى ⬅ مَسْعَى)."
  },
  {
    "id": "g3",
    "title": "القاعدة والتفصيل 3",
    "text": "2. مَفْعِل (بكسر العين): إذا كان الفعل صحيح الأول والآخر وعين مضارعه مكسورة (نَزَل ⬅ يَنْزِل ⬅ مَنْزِل)، أو إذا كان معتل الأول صحيح الآخر (وَعَد ⬅ مَوْعِد)."
  },
  {
    "id": "g4",
    "title": "القاعدة والتفصيل 4",
    "text": "صياغتهما من غير الثلاثي: يُصاغان بنفس طريقة صياغة (اسم المفعول) من غير الثلاثي؛ بالإتيان بالمضارع، وإبدال حرف المضارعة ميماً مضمومة، وفتح ما قبل الآخر. مثل: (اجْتَمَعَ ⬅ يَجْتَمِع ⬅ مُجْتَمَع).\r\n *ملاحظة:* يفرق بين اسم الزمان واسم المكان واسم المفعول (لغير الثلاثي) من خلال سياق الجملة."
  }
];
  const guide = [];
  const quizzes = [
  {
    "question": "النادي مَلْتَقَى الشباب. كلمة (مَلْتَقَى) في الجملة السابقة هي:",
    "options": [
      "اسم مفعول",
      "اسم زمان",
      "اسم مكان",
      "صيغة مبالغة"
    ],
    "correct": "اسم مكان"
  },
  {
    "question": "يُصاغ اسما الزمان والمكان من الفعل الثلاثي (وقف) على وزن:",
    "options": [
      "مَفْعَل (مَوْقَف)",
      "مَفْعِل (مَوْقِف)",
      "مِفْعَال (مِيقَاف)",
      "فَعَّال (وَقَّاف)"
    ],
    "correct": "مَفْعِل (مَوْقِف)"
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
