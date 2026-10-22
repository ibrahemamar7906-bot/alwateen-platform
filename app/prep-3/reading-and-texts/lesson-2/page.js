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
  const title = "عناصر التذوق البلاغي";
  const subtitle = "عناصر التذوق البلاغي - الوحدة الأولى (قضايا أسرية)";

  const paragraphs = [
  {
    "id": "p1",
    "title": "الفقرة 1",
    "text": "ثانياً: عناصر التذوق\r\n 1. التعبير الحقيقي والمجازي: التعبير الحقيقي: هو استخدام الألفاظ في معانيها الحقيقية. (مثل: السماء تمطر - الجندي قوي). التعبير المجازي: هو استخدام الألفاظ في معان غير معانيها الحقيقية؛ لعلاقة المشابهة أو غيرها، وهو تعبير لا يحدث ولا يتحقق في أرض الواقع، ويستخدم ليزيد النص جمالاً. (مثل: السماء تبكي - الجندي أسد)."
  },
  {
    "id": "p2",
    "title": "الفقرة 2",
    "text": "2. التشبيه: اشتراك طرفين في صفة بشرط أن يكون الطرف الثاني أقوى وأوضح في هذه الصفة. أركان التشبيه: المشبه + أداة التشبيه (كـ، كأن، مثل، يشبه) + المشبه به + وجه الشبه. (الأثر البلاغي: يجعل الوصف أكثر جاذبية ويثير خيال القارئ)."
  },
  {
    "id": "p3",
    "title": "الفقرة 3",
    "text": "3. العلاقات بين الكلمات:\r\n * الترادف: اتفاق الكلمتين في المعنى. (سرور = فرح). أثره: يؤكد المعنى."
  },
  {
    "id": "p4",
    "title": "الفقرة 4",
    "text": "* التضاد: اختلاف الكلمتين في المعنى. (العلم × الجهل). أثره: يوضح المعنى ويبرزه."
  },
  {
    "id": "p5",
    "title": "الفقرة 5",
    "text": "* التجانس اللفظي: اتفاق الكلمتين في معظم الحروف مع اختلاف المعنى (العالِم / العالَم - يُونس / تونس). أثره: إحداث نغمة موسيقية حسنة الوقع على الأذن."
  },
  {
    "id": "p6",
    "title": "الفقرة 6",
    "text": "4. العلاقات بين الجمل:\r\n * السبب والنتيجة: (تذاكر الطالبة بجد ⬅ تتفوق). الجملة الثانية نتيجة للأولى."
  },
  {
    "id": "p7",
    "title": "الفقرة 7",
    "text": "* التعليل: (اجتهد ⬅ لتنجح). الجملة الثانية تعليل (توضح سبب) الأولى."
  },
  {
    "id": "p8",
    "title": "الفقرة 8",
    "text": "5. الأساليب:\r\n * خبري: يحتمل الصدق أو الكذب، يعبر عن حقيقة أو رأي. (الشمس تشرق من المشرق)."
  },
  {
    "id": "p9",
    "title": "الفقرة 9",
    "text": "* إنشائي: لا يحتمل الصدق أو الكذب. (أمر، نهي، نداء، استفهام، تعجب)."
  },
  {
    "id": "p10",
    "title": "الفقرة 10",
    "text": "6. الموسيقى في الشعر:\r\n * خارجية: الوزن والقافية (تشابه الحرف الأخير في الأبيات)."
  },
  {
    "id": "p11",
    "title": "الفقرة 11",
    "text": "* داخلية: حسن اختيار الألفاظ، والتجانس اللفظي، وحسن التقسيم."
  }
];

  const vocabList = [];

  const questions = [
  {
    "q": "كيف أفرق بين التعبير الحقيقي والمجازي (الخيالي)؟",
    "a": "اسأل نفسك: هل الكلام ده بيحصل في الحقيقة؟ لو قلت: \"الجندي شجاع\" ⬅ حقيقي. لو قلت: \"الجندي يزأر في المعركة\" ⬅ مجازي خيالي، لأن الجندي مش أسد عشان يزأر."
  }
];

  const quizzes = [
  {
    "question": "أشرقت شمس الحرية في سماء الوطن. التعبير السابق يُعد تعبيراً:",
    "options": [
      "حقيقياً",
      "مجازياً",
      "علمياً دقيقاً",
      "خبراً تقريرياً"
    ],
    "correct": "مجازياً"
  },
  {
    "question": "العالِم يدرك أسرار العالَم. العلاقة البلاغية بين كلمتي (العالِم - العالَم) هي:",
    "options": [
      "ترادف يؤكد المعنى.",
      "تضاد يوضح المعنى.",
      "تجانس لفظي يُحدث نغمة موسيقية.",
      "تشبيه يبرز قوة المعنى."
    ],
    "correct": "تجانس لفظي يُحدث نغمة موسيقية."
  },
  {
    "question": "لا تتكاسل عن أداء واجبك. الأسلوب في العبارة السابقة:",
    "options": [
      "خبري غرضه التقرير.",
      "إنشائي نوعه أمر.",
      "إنشائي نوعه نهي.",
      "خبري غرضه التحذير."
    ],
    "correct": "إنشائي نوعه نهي."
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
