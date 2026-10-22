'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Headphones, BookOpen, Sparkles, Award } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import VocabularySection from '../../components/VocabularySection'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'

export default function LessonPage() {
  const title = "عناصر تحليل وتذوق النصوص";
  const subtitle = "أساسيات التحليل - الوحدة الأولى (قضايا أسرية)";

  const paragraphs = [
  {
    "id": "p1",
    "title": "الفقرة 1",
    "text": "تحليل النصوص وتذوقها: عزيزي الطالب، اعلم أن دراستك لأي نص من النصوص تتطلب مجموعة من المعارف والمهارات التي تساعدك في تحليله وفهمه."
  },
  {
    "id": "p2",
    "title": "الفقرة 2",
    "text": "أولاً: عناصر التحليل\r\n 1. نوع النص: (أ) النص المعلوماتي: هو النص الذي يقدم معلومات حقيقية عن شيء ما بهدف توصيل المعلومة للقارئ بشكل مباشر وواضح. (مثل: المقالات العلمية، والتقارير التاريخية). سماته: الأسلوب يعتمد على الحقائق والمعلومات، اللغة واضحة مباشرة خالية من الزخرفة اللفظية. (ب) النص الأدبي: هو النص الذي يعتمد على المشاعر والخيال بهدف التأثير في القارئ. (مثل: الشعر، والرواية، والمسرحية، والقصة القصيرة). سماته: الأسلوب يعتمد على الخيال، اللغة تصويرية مليئة بالمشاعر والأساليب الجمالية والتشبيهات."
  },
  {
    "id": "p3",
    "title": "الفقرة 3",
    "text": "2. بنية النص: (أ) الفكرة الرئيسة: هي التعبير عن مضمون النص كاملاً بجملة مفيدة. (ب) الفكرة الفرعية: هي التعبير عن مضمون كل فقرة من النص بجملة مختصرة مفيدة. (ج) الفكرة المباشرة: هي التي يذكرها الكاتب بوضوح وصراحة دون الحاجة إلى استنتاج. (د) الفكرة الداعمة: هي الفكرة التي تساعد على توضيح الفكرة الفرعية وتقويتها بالأمثلة أو الشرح أو الأدلة. (هـ) الفكرة الضمنية: هي التي لا تذكر بشكل مباشر في النص، لكن يفهمها القارئ من خلال السياق والمعاني."
  },
  {
    "id": "p4",
    "title": "الفقرة 4",
    "text": "3. غرض النص: (أ) الغرض في النص المعلوماتي: تعريف القارئ بمعلومة، أو تقديم نصائح. (ب) الغرض في النص الأدبي: غرس قيم، كالحث على حب الوطن، أو وصف الطبيعة."
  },
  {
    "id": "p5",
    "title": "الفقرة 5",
    "text": "4. القيم: القيم التي نتعلمها من النص (مثل: التضحية، الانتماء، حب الوطن)."
  }
];

  const vocabList = [];

  const questions = [
  {
    "q": "إزاي أفرق بين الفكرة المباشرة والضمنية؟",
    "a": "لو الكاتب قالك صراحة: \"التدخين يسبب الوفاة\"، دي مباشرة. لكن لو حكى لك قصة عن شاب رياضي بدأ يدخن ففقد صحته ومات، القصة دي بتوصلك نفس المعنى بس \"بين السطور\"، دي ضمنية."
  }
];

  const quizzes = [
  {
    "question": "تُعد مدينة الإسكندرية من أهم المدن الساحلية في مصر، حيث تضم العديد من المعالم الأثرية والموانئ التجارية. يُصنف هذا النص على أنه:",
    "options": [
      "نص أدبي يعتمد على الخيال.",
      "نص معلوماتي يقدم حقائق واضحة.",
      "قصة قصيرة بهدف التسلية.",
      "نص أدبي مليء بالزخرفة اللفظية."
    ],
    "correct": "نص معلوماتي يقدم حقائق واضحة."
  },
  {
    "question": "الفكرة التي لا يذكرها الكاتب صراحة في نصه، بل يترك للقارئ استنتاجها من خلال سياق الكلام، تُسمى:",
    "options": [
      "الفكرة المباشرة",
      "الفكرة الرئيسة",
      "الفكرة الضمنية",
      "الفكرة الداعمة"
    ],
    "correct": "الفكرة الضمنية"
  }
];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-3/reading-and-texts" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <BookOpen size={18} />
                <span>{subtitle}</span>
              </div>
              <h1 className={styles.title}>{title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        {/* Paragraphs Section */}
        {paragraphs.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px', color: '#064e3b' }}>
              📖 نص الدرس والتلاوة الصوتية
            </h2>
            {paragraphs.map((p) => (
              <ParagraphCard key={p.id} id={p.id} title={p.title} text={p.text} />
            ))}
          </div>
        )}

        {/* Vocabulary Section */}
        {vocabList.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px', color: '#064e3b' }}>
              💡 معاني المفردات واللغويات
            </h2>
            <VocabularySection vocabList={vocabList} />
          </div>
        )}

        {/* Analysis & Student Guide */}
        {questions.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px', color: '#064e3b' }}>
              🔍 دليل الفهم والتحليل وأسئلة المناقشة
            </h2>
            <QuestionsCard questions={questions} />
          </div>
        )}

        {/* Interactive Quiz */}
        {quizzes.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '20px', color: '#064e3b' }}>
              🎯 الاختبار التفاعلي السريع للدرس
            </h2>
            <InteractiveQuiz questions={quizzes} lessonTitle={title} />
          </div>
        )}
      </div>
    </div>
  )
}
