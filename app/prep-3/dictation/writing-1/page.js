'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Book, Sparkles } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'

export default function DictationLessonPage() {
  const title = "فن كتابة التقرير الصحفي";
  const subtitle = "التعبير الكتابي الوظيفي - الصف الثالث الإعدادي";
  const paragraphs = [
  {
    "id": "d1",
    "title": "قواعد الرسم والتطبيق 1",
    "text": "التقرير الصحفي: فَنٌّ مِنْ فُنُونِ الْكِتَابَةِ الْوَظِيفِيَّةِ يُقَدِّمُ مَعْلُومَاتٍ مُفَصَّلَةً عَنْ حَدَثٍ أَوْ قَضِيَّةٍ أَوْ ظَاهِرَةٍ مُجْتَمَعِيَّةٍ، مُعْتَمِدًا عَلَى الْحَقَائِقِ وَالْآرَاءِ وَالشَّوَاهِدِ الْمَوْثُوقَةِ، بِهَدَفِ تَوْعِيَةِ الْقَارِئِ وَإِحَاطَتِهِ بِجَوَانِبِ الْمَوْضُوعِ كَافَّةً.\r\n عناصر التقرير الصحفي:"
  },
  {
    "id": "d2",
    "title": "قواعد الرسم والتطبيق 2",
    "text": "1. العنوان: يَجِبُ أَنْ: (أ) يَعْكِسَ مَضْمُونَ الْمَوْضُوعِ. (ب) يَكُونَ جَذَّابًا؛ لِإِثَارَةِ اهْتِمَامِ الْقَارِئِ. (ج) يَكُونَ مُوجَزًا وَوَاضِحًا."
  },
  {
    "id": "d3",
    "title": "قواعد الرسم والتطبيق 3",
    "text": "2. المقدمة: تَمْهِيدٌ جَذَّابٌ يَدْفَعُ الْقَارِئَ إِلَى مُتَابَعَةِ قِرَاءَةِ التَّقْرِيرِ، وَتَتَضَمَّنُ أَهَمَّ مَعْلُومَةٍ أَوْ نَتِيجَةٍ يُرَادُ لَفْتُ انْتِبَاهِ الْقَارِئِ إِلَيْهَا."
  },
  {
    "id": "d4",
    "title": "قواعد الرسم والتطبيق 4",
    "text": "3. جسم التقرير: يَتَضَمَّنُ: (أ) تَفَاصِيلَ الْحَدَثِ أَوِ الْقَضِيَّةِ عَلَى نَحْوِ مُنَظَّمِ وَمُتَسَلْسِلٍ مَنْطِقِيًّا. (ب) الْمَكَانَ أَوِ الزَّمَانَ وَالْأَحْدَاثَ (إِنْ وُجِدَتْ). (ج) الْخَلْفِيَّةَ الْمَعْلُومَاتِيَّةَ الَّتِي تُسَاعِدُ عَلَى فَهْمِ الْمَوْضُوعِ. (د) الْأَسْبَابَ الْحَقِيقِيَّةَ وَالنَّتَائِجَ الْمُرْتَبِطَةَ بِالْمَوْضُوعِ."
  },
  {
    "id": "d5",
    "title": "قواعد الرسم والتطبيق 5",
    "text": "4. الخاتمة: تَتَضَمَّنُ تَلْخِيصًا لِفِكَرِ التَّقْرِيرِ، وَتُقَدِّمُ تَوْصِيَاتٍ وَحُلُولًا لِلْمُشْكِلَةِ إِنْ وُجِدَتْ. مَوْضُوعُ التَّقْرِيرِ."
  }
];
  const guide = [
  {
    "q": "خطوات الكتابة",
    "a": "1. اختار قضية مجتمعية (مثلاً: الإسراف في المياه، أو إدمان الهواتف). 2. اكتب عنوان يشد العين (مثل: شاشات تسرق أعمارنا). 3. في المقدمة: ادخل في الموضوع مباشرة بمعلومة قوية. 4. في جسم التقرير: اكتب الأسباب والنتائج بالترتيب. 5. في الخاتمة: حط \"روشتة\" الحلول والتوصيات."
  }
];
  const quizzes = [
  {
    "question": "الفرق الأساسي بين التقرير الصحفي والقصة الخيالية هو أن التقرير:",
    "options": [
      "يعتمد على الإثارة والمبالغة.",
      "يستخدم شخصيات أسطورية لجذب الانتباه.",
      "فن وظيفي يعتمد على عرض الحقائق والأدلة والشواهد الموثوقة.",
      "يُكتب دائماً في شكل أبيات شعرية."
    ],
    "correct": "فن وظيفي يعتمد على عرض الحقائق والأدلة والشواهد الموثوقة."
  },
  {
    "question": "العنصر الذي يشتمل على تقديم توصيات وحلول للمشكلة في التقرير الصحفي هو:",
    "options": [
      "العنوان",
      "المقدمة",
      "جسم التقرير",
      "الخاتمة"
    ],
    "correct": "الخاتمة"
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
