'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Book, Sparkles } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'

export default function DictationLessonPage() {
  const title = "كتابة الهمزة المتطرفة";
  const subtitle = "قواعد الإملاء - الصف الثالث الإعدادي";
  const paragraphs = [
  {
    "id": "d1",
    "title": "قواعد الرسم والتطبيق 1",
    "text": "القاعدة: الهمزة المتطرفة هي التي تقع في آخر الكلمة، وتُكتب حسب ضبط (حركة) ما قبلها فقط (ولا ننظر لحركة الهمزة نفسها)."
  },
  {
    "id": "d2",
    "title": "قواعد الرسم والتطبيق 2",
    "text": "* تُكتب على الألف (أ): إذا كان ما قبلها مفتوحاً (مَنْشَأ - مَبْدَأ - يَمْلَأ - قَرَأ)."
  },
  {
    "id": "d3",
    "title": "قواعد الرسم والتطبيق 3",
    "text": "* تُكتب على الواو (ؤ): إذا كان ما قبلها مضموماً (تَكَافُؤ - لُؤْلُؤ - يَجْرُؤ - بَبُؤ)."
  },
  {
    "id": "d4",
    "title": "قواعد الرسم والتطبيق 4",
    "text": "* تُكتب على الياء / غير منقوطة (ئ): إذا كان ما قبلها مكسوراً (مُبْتَدِئ - شَاطِئ - قَارِئ - يُكِافِئ)."
  },
  {
    "id": "d5",
    "title": "قواعد الرسم والتطبيق 5",
    "text": "* تُكتب على السطر (ء): إذا كان ما قبلها ساكناً، أو حرف مد (ألف، واو، ياء) (دِفْء - شَيْء - سَمَاء - بُطْء - جَرِيء - هُدُوء)."
  }
];
  const guide = [];
  const quizzes = [
  {
    "question": "هذا الشاب ...... في الحق. الكلمة الصحيحة إملائياً هي:",
    "options": [
      "جريئ",
      "جريء",
      "جرئ",
      "جريأ"
    ],
    "correct": "جريء"
  },
  {
    "question": "كُتبت الهمزة المتطرفة على الياء في كلمة (شاطِئ) لأن ما قبلها:",
    "options": [
      "ساكن",
      "مفتوح",
      "مكسور",
      "مضموم"
    ],
    "correct": "مكسور"
  }
];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-3/dictation" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <Book size={18} />
                <span>{subtitle}</span>
              </div>
              <h1 className={styles.title}>{title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        {paragraphs.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px', color: '#064e3b' }}>
              ✍️ القواعد الإملائية والتطبيقية
            </h2>
            {paragraphs.map((p) => (
              <ParagraphCard key={p.id} id={p.id} title={p.title} text={p.text} />
            ))}
          </div>
        )}

        {guide.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px', color: '#064e3b' }}>
              💡 نصائح ذهبية لتجنب الخطأ
            </h2>
            <QuestionsCard questions={guide} />
          </div>
        )}

        {quizzes.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px', color: '#064e3b' }}>
              🎯 اختبار إملائي تفاعلي
            </h2>
            <InteractiveQuiz questions={quizzes} lessonTitle={title} />
          </div>
        )}
      </div>
    </div>
  )
}
