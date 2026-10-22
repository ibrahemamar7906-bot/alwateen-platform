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
  const title = "تاج الفضائل";
  const subtitle = "نص شعري - الوحدة الثانية (العلم والعمل)";

  const paragraphs = [
  {
    "id": "p1",
    "title": "الفقرة 1",
    "text": "١- يُزَيِّنُ الْفَتَى فِي النَّاسِ صِحَّةُ عَقْلِهِ ... وَإِنْ كَانَ مَحْظُورًا عَلَيْهِ مَكَاسِبُهْ\r\n ٢- يَشِينُ الْفَتَى فِي النَّاسِ قِلَّةُ عَقْلِهِ ... وَإِنْ كَرُمَتْ أَعْرَاقُهُ وَمَنَاسِبُهْ\r\n ٣- وَمَنْ كَانَ غَلَّابًا بِعَقْلٍ وَنَجْدَةٍ ... فَذُو الْجَدِّ فِي أَمْرِ الْمَعِيشَةِ غَالِبُهْ\r\n ٤- يَعِيشُ الْفَتَى فِي النَّاسِ بِالْعَقْلِ إِنَّهُ ... عَلَى الْعَقْلِ يَجْرِي عِلْمُهُ وَتَجَارِبُهْ\r\n ٥- يَزِينُ الْفَتَى فِي النَّاسِ صِحَّةُ عَقْلِهِ ... وَإِنْ كَانَ مَحْظُورًا عَلَيْهِ مَكَاسِبُهْ *(مكرر للتأكيد في النسخة)*\r\n ٦- وَأَفْضَلُ قَسْمِ اللهِ لِلْمَرْءِ عَقْلُهُ ... فَلَيْسَ مِنَ الْخَيْرَاتِ شَيْءٌ يُقَارِبُهْ\r\n ٧- إِذَا أَكْمَلَ الرَّحْمَنُ لِلْمَرْءِ عَقْلَهُ ... فَقَدْ كَمَلَتْ أَخْلَاقُهُ وَمَآرِبُهْ"
  },
  {
    "id": "p2",
    "title": "الفقرة 2",
    "text": "*(ملحوظة: ترتيب الأبيات في الكتاب المدرسي في صفحة 136 وضع الأبيات 1-3 كالتالي: وأفضل قسم الله... / إذا أكمل الرحمن... / يعيش الفتى... ولكن التدريبات عكست الترتيب. سأعتمد المعاني من الجدول)*"
  }
];

  const vocabList = [
  {
    "word": "الفتى",
    "meaning": "الشاب",
    "opposite": "",
    "plural": "الفتيان، الفتية"
  },
  {
    "word": "يزين",
    "meaning": "يُجمِّل، يُحسِّن",
    "opposite": "يَشين، يُقَبِّح",
    "plural": ""
  },
  {
    "word": "محظوراً",
    "meaning": "ممنوعاً",
    "opposite": "مُباحاً",
    "plural": ""
  },
  {
    "word": "يشين",
    "meaning": "يعيب، يقبّح",
    "opposite": "يزين",
    "plural": ""
  },
  {
    "word": "كرُمت",
    "meaning": "عَظُمَت، عَزَّت",
    "opposite": "لَؤُمَت، خَبُثَت",
    "plural": ""
  },
  {
    "word": "أعراقه",
    "meaning": "أصوله، جذوره المفرد: عِرْقه",
    "opposite": "",
    "plural": ""
  },
  {
    "word": "مناسبه",
    "meaning": "المراد: أصوله، جذوره المفرد: مَنْسِبه",
    "opposite": "",
    "plural": ""
  },
  {
    "word": "نجدة",
    "meaning": "شجاعة، إقدام",
    "opposite": "",
    "plural": ""
  },
  {
    "word": "الجد",
    "meaning": "الاجتهاد",
    "opposite": "الكسل",
    "plural": ""
  },
  {
    "word": "أمر",
    "meaning": "شأن",
    "opposite": "",
    "plural": "أمور"
  },
  {
    "word": "المعيشة",
    "meaning": "الحياة",
    "opposite": "",
    "plural": "المعايش"
  },
  {
    "word": "قَسْم",
    "meaning": "نصيب، رزق، نعمة",
    "opposite": "",
    "plural": ""
  },
  {
    "word": "المرء",
    "meaning": "الرجل، المراد: الإنسان",
    "opposite": "",
    "plural": "الرجال"
  },
  {
    "word": "يقاربه",
    "meaning": "يشابهه في الفضل، يماثله",
    "opposite": "",
    "plural": ""
  },
  {
    "word": "أكمل",
    "meaning": "أتم",
    "opposite": "أنقص",
    "plural": ""
  },
  {
    "word": "مآربه",
    "meaning": "حاجاته، غاياته، أهدافه المفرد: مأرب",
    "opposite": "",
    "plural": ""
  }
];

  const questions = [
  {
    "q": "كيف أحلل التضاد الكبير (المقابلة)؟",
    "a": "«يزين الفتى في الناس صحة عقله» عكسها تماماً ⬅ «يشين الفتى في الناس قلة عقله». عندما تتضاد جملة كاملة مع جملة أخرى، يُسمى هذا (مقابلة)، وفائدته: يوضح المعنى ويقويه عن طريق التضاد."
  },
  {
    "q": "الخيال والتصوير",
    "a": "«وإن كرُمت أعراقه»: هل الأعراق (الجذور) شيء يكرم؟ هذا تعبير يوحي بأهمية العقل، فبدون العقل لا ينفع الإنسان أصله الكريم أو نسبه العظيم. «إذا أكمل الرحمن للمرء عقله فقد كملت أخلاقه»: علاقة (فقد كملت) بما قبلها هي (نتيجة)، وتؤكد أن كمال العقل يؤدي حتماً لكمال الأخلاق وتحقيق الأهداف."
  },
  {
    "q": "الأساليب",
    "a": "«إنه على العقل يجري علمه وتجاربه»: أسلوب مؤكد بـ (إنّ)، وهو تعليل لما قبله (يعيش الفتى في الناس بالعقل). وتقديم الجار والمجرور (على العقل) يفيد التخصيص والتوكيد."
  }
];

  const quizzes = [
  {
    "question": "العلاقة البلاغية بين شطري البيت: يزين الفتى في الناس صحة عقله ... يشين الفتى في الناس قلة عقله هي:",
    "options": [
      "ترادف يؤكد المعنى.",
      "تجانس لفظي يحدث نغمة موسيقية.",
      "مقابلة توضح المعنى وتبرزه.",
      "نتيجة وتعليل."
    ],
    "correct": "مقابلة توضح المعنى وتبرزه."
  },
  {
    "question": "يُفهم من قول الإمام علي رضي الله عنه: وأفضل قسم الله للمرء عقله... فليس من الخيرات شيء يقاربه أن:",
    "options": [
      "المال والثروة هما أفضل ما يمتلكه الإنسان للنجاح.",
      "العقل هو أعظم وأرقى نعمة ورزق وهبه الله للإنسان، ولا يساويه أي شيء آخر.",
      "الحظ والصدفة هما أساس التفوق في الحياة.",
      "قوة البدن هي السلاح الوحيد لمواجهة الصعاب."
    ],
    "correct": "العقل هو أعظم وأرقى نعمة ورزق وهبه الله للإنسان، ولا يساويه أي شيء آخر."
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
