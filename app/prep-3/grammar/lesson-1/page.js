'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, PenTool, Sparkles, Award } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'

export default function GrammarLessonPage() {
  const title = "اسم الفاعل";
  const subtitle = "فرع النحو (المشتقات) - الصف الثالث الإعدادي";
  const paragraphs = [
  {
    "id": "g1",
    "title": "القاعدة والتفصيل 1",
    "text": "تعريف اسم الفاعل: اسم مشتق من الفعل المبني للمعلوم للدلالة على مَن قام بالفعل أو اتصف به.\r\n صياغته من الفعل الثلاثي: يُصاغ من الفعل الثلاثي على وزن (فَاعِل). مثل: (كتب ⬅ كاتِب)، (فهم ⬅ فاهِم)."
  },
  {
    "id": "g2",
    "title": "القاعدة والتفصيل 2",
    "text": "* إذا كان الفعل الثلاثي أجوف (وسطه ألف)، تُقلب ألفه همزة مكسورة، مثل: (قال ⬅ قائِل)، (صام ⬅ صائِم)."
  },
  {
    "id": "g3",
    "title": "القاعدة والتفصيل 3",
    "text": "* إذا كان الفعل الثلاثي ناقصاً (آخره حرف علة)، تُحذف ياؤه في حالتي الرفع والجر إذا كان نكرة غير مضافة، مثل: (قضى ⬅ قاضٍ)، وتثبت ياؤه في حالة النصب أو إذا كان معرفاً بـ (أل) أو الإضافة، مثل: (قاضياً - القاضي - قاضي المحكمة)."
  },
  {
    "id": "g4",
    "title": "القاعدة والتفصيل 4",
    "text": "صياغته من الفعل غير الثلاثي: يُصاغ على وزن مضارعه، مع إبدال حرف المضارعة ميماً مضمومة، وكسر ما قبل آخره. مثل: (أخلص ⬅ يُخلص ⬅ مُخلِص)، (استخرج ⬅ يستخرج ⬅ مُستخرِج)."
  }
];
  const guide = [
  {
    "q": "إزاي أطلع \"اسم فاعل\" من القطعة؟",
    "a": "لو طلب اسم فاعل من فعل ثلاثي: دور على كلمة مكونة من ٤ حروف، الحرف التاني فيها (ألف) على وزن \"فاعِل\" (زي: عامل، ناجح، صائم). لو طلب اسم فاعل من فعل غير ثلاثي: دور على كلمة أولها (ميم مُضْمُومَة) والحرف اللي قبل الأخير (مكسور) (زي: مُسْتَخْرِج، مُنْتَصِر)."
  }
];
  const quizzes = [
  {
    "question": "المؤمن ...... دائماً للخير. الكلمة الصحيحة لملء الفراغ هي:",
    "options": [
      "ساعي",
      "ساعياً",
      "ساعٍ",
      "الساعي"
    ],
    "correct": "ساعٍ"
  },
  {
    "question": "اسم الفاعل من الفعل (استفاد):",
    "options": [
      "مُستفَاد",
      "مُستفِيد",
      "فَائِد",
      "مُفِيد"
    ],
    "correct": "مُستفِيد"
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
