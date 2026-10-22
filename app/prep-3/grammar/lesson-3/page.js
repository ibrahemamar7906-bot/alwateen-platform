'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, PenTool, Sparkles, Award } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'

export default function GrammarLessonPage() {
  const title = "اسم المفعول";
  const subtitle = "فرع النحو (المشتقات) - الصف الثالث الإعدادي";
  const paragraphs = [
  {
    "id": "g1",
    "title": "القاعدة والتفصيل 1",
    "text": "تعريف اسم المفعول: اسم مشتق من الفعل المبني للمجهول للدلالة على مَن وَقَعَ عليه الفعل.\r\n صياغته من الفعل الثلاثي: يُصاغ على وزن (مَفْعُول). مثل: (كُتِب ⬅ مَكْتُوب)، (شُرِب ⬅ مَشْرُوب)."
  },
  {
    "id": "g2",
    "title": "القاعدة والتفصيل 2",
    "text": "* إذا كان الفعل الثلاثي أجوف (وسطه علة)، نأتي بالمضارع ونبدل حرف المضارعة ميماً مفتوحة. مثل: (قَالَ ⬅ يَقُول ⬅ مَقُول)، (بَاعَ ⬅ يَبِيع ⬅ مَبِيع)."
  },
  {
    "id": "g3",
    "title": "القاعدة والتفصيل 3",
    "text": "* إذا كان الفعل الثلاثي ناقصاً (آخره علة)، نأتي بالمضارع ونبدل حرف المضارعة ميماً مفتوحة مع تضعيف الحرف الأخير. مثل: (دُعِيَ ⬅ يَدْعُو ⬅ مَدْعُوّ)، (قُضِيَ ⬅ يَقْضِي ⬅ مَقْضِيّ)."
  },
  {
    "id": "g4",
    "title": "القاعدة والتفصيل 4",
    "text": "صياغته من الفعل غير الثلاثي: يُصاغ على وزن مضارعه مع إبدال حرف المضارعة ميماً مضمومة، وفتح ما قبل آخره. مثل: (أُكْرِمَ ⬅ يُكْرَم ⬅ مُكْرَم)، (اسْتُخْرِجَ ⬅ يُسْتَخْرَج ⬅ مُسْتَخْرَج)."
  }
];
  const guide = [
  {
    "q": "الفخ الأكبر لو طلب منك في الامتحان تستخرج اسم مفعول وتكتب (فِعْلَهُ)، إياك تكتب الفعل مبني للمعلوم! لازم تكتبه مبني للمجهول (مضموم الأول ومكسور ما قبل آخره في الماضي).",
    "a": "صح: (مكتوب ⬅ كُتِبَ). خطأ: (كتب)."
  },
  {
    "q": "إزاي أفرق بين اسم الفاعل واسم المفعول من (غير الثلاثي)؟",
    "a": "الاثنين بيبدأوا بـ (ميم مضمومة). لكن: اسم الفاعل مكسور ما قبل الآخر ⬅ (المهندس مُستخرِج البترول). اسم المفعول مفتوح ما قبل الآخر ⬅ (البترول مُستخرَج من الأرض)."
  }
];
  const quizzes = [
  {
    "question": "الفعل المضبوط ضبطاً صحيحاً لاسم المفعول (مُعَظَّم) هو:",
    "options": [
      "عَظَّمَ",
      "يُعَظِّمُ",
      "عُظِّمَ",
      "يَعْظُمُ"
    ],
    "correct": "عُظِّمَ"
  },
  {
    "question": "اسم المفعول من الفعل الأجوف (صام) هو:",
    "options": [
      "صَائِم",
      "مَصُوم",
      "مَصْوُوم",
      "مُصَام"
    ],
    "correct": "مَصُوم"
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
