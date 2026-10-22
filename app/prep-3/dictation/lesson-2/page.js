'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Book, Sparkles } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'

export default function DictationLessonPage() {
  const title = "كتابة الهمزة المتوسطة";
  const subtitle = "قواعد الإملاء - الصف الثالث الإعدادي";
  const paragraphs = [
  {
    "id": "d1",
    "title": "قواعد الرسم والتطبيق 1",
    "text": "قاعدة قوة الحركات:\r\n لترسم الهمزة المتوسطة بسهولة عليك أن: 1- تنظر إلى حركتها وحركة الحرف الذي يسبقها. 2- تقارن بين الحركتين. 3- تكتبها على ما يناسب أقوى الحركتين.\r\n ترتيب الحركات من الأقوى للأضعف: الكسرة (تُناسبها النبرة / الياء) ⬅ الضمة (تُناسبها الواو) ⬅ الفتحة (تُناسبها الألف) ⬅ السكون (أضعف شيء)."
  },
  {
    "id": "d2",
    "title": "قواعد الرسم والتطبيق 2",
    "text": "١- كتابة الهمزة على الألف (أ): إذا كانت الفتحة هي الأقوى.\r\n * مفتوحة وقبلها مفتوح: (سَأَل، تَأَخَّر)."
  },
  {
    "id": "d3",
    "title": "قواعد الرسم والتطبيق 3",
    "text": "* مفتوحة وقبلها ساكن: (مَسْأَلة، يَسْأَل)."
  },
  {
    "id": "d4",
    "title": "قواعد الرسم والتطبيق 4",
    "text": "* ساكنة وقبلها مفتوح: (رَأْس، مَأْمَن)."
  },
  {
    "id": "d5",
    "title": "قواعد الرسم والتطبيق 5",
    "text": "٢- كتابة الهمزة على الواو (ؤ): إذا كانت الضمة هي الأقوى (وليس هناك كسرة).\r\n * مضمومة وقبلها مضموم أو مفتوح أو ساكن: (شُؤُون، رَؤُوف، مَسْؤُول، تَفَاؤُل)."
  },
  {
    "id": "d6",
    "title": "قواعد الرسم والتطبيق 6",
    "text": "* مفتوحة أو ساكنة وقبلها مضموم: (مُؤْتَمَر، مُؤْمِن)."
  },
  {
    "id": "d7",
    "title": "قواعد الرسم والتطبيق 7",
    "text": "٣- كتابة الهمزة على نبرة / ياء (ئـ): إذا كانت الكسرة موجودة (سواء في الهمزة أو ما قبلها) لأنها أقوى الحركات.\r\n * مكسورة وما قبلها مكسور أو مضموم أو مفتوح أو ساكن: (مُبْتَدِئِين، سُئِل، يَئِس، أَسْئِلَة، سَائِل)."
  },
  {
    "id": "d8",
    "title": "قواعد الرسم والتطبيق 8",
    "text": "* ساكنة أو مفتوحة أو مضمومة وقبلها مكسور: (بِئْر، ذِئْب، طَارِئُون)."
  },
  {
    "id": "d9",
    "title": "قواعد الرسم والتطبيق 9",
    "text": "٤- كتابة الهمزة على السطر (ء): (حالات خاصة)\r\n * مفتوحة وقبلها حرف مد (ألف أو واو): (قِرَاءَة، عَبَاءَة، مُرُوءَة)."
  }
];
  const guide = [];
  const quizzes = [
  {
    "question": "الطالب يقرأ ...... الامتحان بتركيز. الكلمة الصحيحة إملائياً:",
    "options": [
      "أسئلة",
      "أسألة",
      "أسؤلة",
      "أسءلة"
    ],
    "correct": "أسئلة"
  },
  {
    "question": "كُتبت الهمزة المتوسطة في كلمة (مُرُوءَة) مفردة على السطر لأنها:",
    "options": [
      "مفتوحة وقبلها واو ساكنة (مد).",
      "مضمومة وقبلها مفتوح.",
      "ساكنة وقبلها مفتوح.",
      "مفتوحة وقبلها صحيح ساكن."
    ],
    "correct": "مفتوحة وقبلها واو ساكنة (مد)."
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
