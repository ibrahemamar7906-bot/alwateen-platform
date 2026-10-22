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
  const title = "تحية للشباب";
  const subtitle = "نص شعري - الوحدة الأولى (قضايا أسرية)";

  const paragraphs = [
  {
    "id": "p1",
    "title": "الفقرة 1",
    "text": "١- قَالُوا: أَنَنْظِمُ لِلشَّبَابِ تَحِيَّةً ... تَبْقَى عَلَى جِيدِ الزَّمَانِ قَصِيدَا؟\r\n ٢- قُلْتُ: الشَّبَابُ أَتَمُّ عِقْدٍ مَآثِرٍ ... مِنْ أَنْ أُزِيدَهُمُ الثَّنَاءَ عُقُودَا\r\n ٣- قَبَّلْتُ جُهُودَهُمُ البِلَادَ وَقَبَّلَتْ ... تَاجًا عَلَى هَامَاتِهِمْ مَعْقُودَا\r\n ٤- خَرَجُوا فَمَا مَدُّوا حَنَاجِرَهُمْ وَلَا ... مَنُّوا عَلَى أَوْطَانِهِمْ مَجْهُودَا\r\n ٥- أَنْتُمْ غَدًا أَهْلُ الْأُمُورِ وَإِنَّمَا ... كُنَّا عَلَيْكُمْ فِي الْأُمُورِ وُفُودَا\r\n ٦- فَابْنُوا عَلَى أُسُسِ الزَّمَانِ وَرُوحِهِ ... رُكْنَ الحَضَارَةِ بَاذِخًا وَشَدِيدَا\r\n ٧- إِنَّ الَّذِي قَسَمَ البِلَادَ حَبَاكُمُ ... بَلَدًا كَأَوْطَانِ النُّجُومِ مَجِيدَا"
  }
];

  const vocabList = [
  {
    "word": "ننظم",
    "meaning": "المراد: نؤلف، نكتب",
    "opposite": "",
    "plural": ""
  },
  {
    "word": "جيد",
    "meaning": "عُنُق",
    "opposite": "",
    "plural": "أجياد، جيود"
  },
  {
    "word": "الزمان",
    "meaning": "",
    "opposite": "",
    "plural": "الأزمنة، الأزمُن"
  },
  {
    "word": "قصيدا",
    "meaning": "أبيات شعر",
    "opposite": "",
    "plural": "قصائد"
  },
  {
    "word": "أتم",
    "meaning": "أكمل",
    "opposite": "",
    "plural": ""
  },
  {
    "word": "عقد",
    "meaning": "ما يُوضع حول الرقبة للتزيُّن",
    "opposite": "",
    "plural": "عقود"
  },
  {
    "word": "مآثر",
    "meaning": "مكارم، محامد المفرد: مأثرة المضاد: مساوئ، مثالب",
    "opposite": "",
    "plural": ""
  },
  {
    "word": "الثناء",
    "meaning": "المدح، الإشادة",
    "opposite": "الذم",
    "plural": ""
  },
  {
    "word": "تاج",
    "meaning": "",
    "opposite": "",
    "plural": "تيجان، أتواج"
  },
  {
    "word": "هامات",
    "meaning": "رءوس المفرد: هامة",
    "opposite": "",
    "plural": ""
  },
  {
    "word": "معقودا",
    "meaning": "مُثبّتاً",
    "opposite": "",
    "plural": ""
  },
  {
    "word": "حناجر",
    "meaning": "المفرد: حنجرة",
    "opposite": "",
    "plural": ""
  },
  {
    "word": "منّوا",
    "meaning": "عدّدوا أفضالهم، وتفاخروا بها",
    "opposite": "",
    "plural": ""
  },
  {
    "word": "أهل",
    "meaning": "أصحاب",
    "opposite": "",
    "plural": ""
  },
  {
    "word": "وفود",
    "meaning": "المراد: زائرون مؤقتون المفرد: وفد",
    "opposite": "",
    "plural": ""
  },
  {
    "word": "أُسُس",
    "meaning": "قواعد، مبادئ المفرد: أساس",
    "opposite": "",
    "plural": ""
  },
  {
    "word": "روح الزمان",
    "meaning": "المراد: متطلباته، وما يناسبه",
    "opposite": "",
    "plural": ""
  },
  {
    "word": "ركن",
    "meaning": "المراد: أساس",
    "opposite": "",
    "plural": "أركان، أركُن"
  },
  {
    "word": "باذخاً",
    "meaning": "عالياً، شامخاً",
    "opposite": "منخفضاً، منحطاً",
    "plural": ""
  },
  {
    "word": "شديداً",
    "meaning": "قوياً، متيناً",
    "opposite": "ضعيفاً",
    "plural": ""
  },
  {
    "word": "حباكم",
    "meaning": "أعطاكم، منحكم",
    "opposite": "سلبكم، حرمكم",
    "plural": ""
  },
  {
    "word": "مجيداً",
    "meaning": "عظيماً، شريفاً",
    "opposite": "حقيراً، وضيعاً",
    "plural": ""
  }
];

  const questions = [
  {
    "q": "التصوير (التشبيه)",
    "a": "«على جيد الزمان قصيدا»: هل الزمان فتاة لها (جيد/عنق) لترتدي القلادة؟ لا. إذن: تصوير للزمان بإنسان له عنق يُزيّن. «الشباب أتم عِقد مآثر»: شبه مآثر الشباب (أفعالهم العظيمة) بالعِقد أو العقد الثمين الذي يزين الأوطان. «فابنوا ... ركن الحضارة»: تصوير للحضارة ببناء عظيم له أركان وأسس قوية. «بلداً كأوطان النجوم»: تشبيه مصر بمكانة النجوم، ليدل على علو قدرها ورفعتها."
  },
  {
    "q": "الأساليب",
    "a": "«أننظم للشباب تحية؟»: أسلوب استفهام. غرضه (الالتماس) لتقديم التحية. «فابنوا»: أسلوب أمر. غرضه (النصح والإرشاد). «إنما كُنَّا عليكم...»: أسلوب (قصر) أداته إنما، يفيد التخصيص والتوكيد."
  }
];

  const quizzes = [
  {
    "question": "الخيال في قول أحمد شوقي بلداً كأوطان النجوم مجيدا الغرض منه:",
    "options": [
      "بيان كثرة عدد سكان مصر.",
      "التعبير عن ارتفاع درجة الحرارة في البلد.",
      "إظهار علو مكانة مصر ورفعة قدرها بين الدول.",
      "التحذير من خطورة السفر للفضاء."
    ],
    "correct": "إظهار علو مكانة مصر ورفعة قدرها بين الدول."
  },
  {
    "question": "فابنوا على أسس الزمان وروحه  ركن الحضارة باذخاً وشديدا. نفهم من هذا البيت دعوة الشاعر للشباب إلى:",
    "options": [
      "هدم الماضي وبناء كل شيء من الصفر.",
      "الجمع بين الأصالة (الأسس) والمعاصرة (روح الزمان) في بناء الحضارة القوية.",
      "الاكتفاء بدراسة التاريخ القديم.",
      "السفر للخارج لبناء حضارة جديدة."
    ],
    "correct": "الجمع بين الأصالة (الأسس) والمعاصرة (روح الزمان) في بناء الحضارة القوية."
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
