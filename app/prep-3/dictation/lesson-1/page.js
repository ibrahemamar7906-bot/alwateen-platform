'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Book, Sparkles } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'

export default function DictationLessonPage() {
  const title = "همزة القطع وألف الوصل";
  const subtitle = "قواعد الإملاء - الصف الثالث الإعدادي";
  const paragraphs = [
  {
    "id": "d1",
    "title": "قواعد الرسم والتطبيق 1",
    "text": "أولاً: همزة القطع (أ - إ - أُ)\r\n تُنطق في الوقف والوصل، وتُرسم ألفاً فوقها همزة إذا كانت مفتوحة أو مضمومة، وتحتها همزة إذا كانت مكسورة.\r\n مواضعها:"
  },
  {
    "id": "d2",
    "title": "قواعد الرسم والتطبيق 2",
    "text": "* في الأسماء: كل الأسماء مبدوءة بهمزة قطع (أحمد، إسلام، أصدقاء، أداب) ما عدا تسعة أسماء."
  },
  {
    "id": "d3",
    "title": "قواعد الرسم والتطبيق 3",
    "text": "* في الأفعال:\r\n * الفعل المضارع للمتكلم: مثل (أُحاول، أَهتم)."
  },
  {
    "id": "d4",
    "title": "قواعد الرسم والتطبيق 4",
    "text": "* الماضي الثلاثي ومصدره: مثل (أَمَرَ ⬅ أَمْرًا)."
  },
  {
    "id": "d5",
    "title": "قواعد الرسم والتطبيق 5",
    "text": "* الماضي الرباعي وأمره ومصدره: مثل (أَكْرَمَ ⬅ أَكْرِمْ ⬅ إِكْرَامًا)."
  },
  {
    "id": "d6",
    "title": "قواعد الرسم والتطبيق 6",
    "text": "* في الحروف: كل الحروف مبدوءة بهمزة قطع (إلى، إن، أن، ألا، إلى) ما عدا (ال) التعريف."
  },
  {
    "id": "d7",
    "title": "قواعد الرسم والتطبيق 7",
    "text": "ثانياً: ألف الوصل (ا)\r\n تُنطق في بداية الجملة، ولا تُنطق في وسط الجملة (عند وصلها بما قبلها)، وتكتب ألفاً بلا همزة.\r\n مواضعها:"
  },
  {
    "id": "d8",
    "title": "قواعد الرسم والتطبيق 8",
    "text": "* في الأسماء: (٩ أسماء) فقط، وهي: (ابن، ابنة، اثنان، اثنتان، امرؤ، امرأة، ايم الله، أيمن الله، اسم)."
  },
  {
    "id": "d9",
    "title": "قواعد الرسم والتطبيق 9",
    "text": "* في الأفعال:\r\n * فعل الأمر من الماضي الثلاثي: مثل (اذْهَبْ، اقْرَأْ)."
  },
  {
    "id": "d10",
    "title": "قواعد الرسم والتطبيق 10",
    "text": "* الماضي الخماسي وأمره ومصدره: مثل (اجْتَمَعَ ⬅ اجْتَمِعْ ⬅ اجْتِمَاع)."
  },
  {
    "id": "d11",
    "title": "قواعد الرسم والتطبيق 11",
    "text": "* الماضي السداسي وأمره ومصدره: مثل (اسْتَخْدَمَ ⬅ اسْتَخْدِمْ ⬅ اسْتِخْدَام)."
  },
  {
    "id": "d12",
    "title": "قواعد الرسم والتطبيق 12",
    "text": "* في الحروف: حرف (ال) التعريف فقط (مثل: الكتاب - الصديق)."
  }
];
  const guide = [
  {
    "q": "الطريقة السحرية ضع حرف (الواو) أو (الفاء) قبل الكلمة وانطقها بسرعة.",
    "a": "لو نطقت الهمزة غصب عنك ⬅ تبقى همزة قطع (أ/إ). مثال: (أكرم) ⬅ (وَأَكرم)، نطقتها! إذن هي قطع. لو الهمزة سقطت في النطق ونطقت الحرف اللي بعدها مباشرة ⬅ تبقى ألف وصل (ا). مثال: (استخدم) ⬅ (وَسْتخدم)، لم تنطق الألف! إذن هي وصل."
  }
];
  const quizzes = [
  {
    "question": "الكلمة التي يجب أن تبدأ بـ همزة قطع من بين الكلمات الآتية هي:",
    "options": [
      "اجتماع",
      "اسم",
      "إكرام",
      "ابن"
    ],
    "correct": "إكرام"
  },
  {
    "question": "يا بُني، ...... إلى نصيحة معلمك. الكلمة الصحيحة إملائياً لملء الفراغ هي:",
    "options": [
      "إستمع",
      "استمع",
      "إستمعْ",
      "أستمع"
    ],
    "correct": "استمع"
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
