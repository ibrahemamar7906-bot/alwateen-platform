'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, PenTool, AlertTriangle } from 'lucide-react'
import styles from '../../page.module.css'
import GrammarCard from '../../components/GrammarCard'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import GrammarPracticeSection from '../../components/GrammarPracticeSection'
import { grammarLesson6 } from '../../data/grammar/lesson6'

export default function Lesson6() {
  const cards = [
    {
      id: 'shart-ghair-jazim-adawat',
      title: '١. أدوات الشرط غير الجازمة ومعانيها',
      explanation: 'أدوات الشرط غير الجازمة تربط بين جملتي الشرط والجواب، ولكنها لا تؤثر إعرابياً بالجزم في الفعلين. أشهر هذه الأدوات: ١- (إذا): ظرف لما يُستقبل من الزمان يفيد التحقيق واليقين. ٢- (لو): حرف امتناع لامتناع (امتناع الجواب لامتناع الشرط). ٣- (لولا): حرف امتناع لوجود (امتناع الجواب لوجود الشرط). ٤- (كلّما): ظرف يفيد التكرار والاستمرار ويليه ماضيان. ٥- (لمّا): الحينية ظرف زمان بمعنى حين ويليه فعل ماضٍ.',
      examples: [
        'إذا أقبلَ الربيعُ تفتحتِ الأزهارُ. (إذا: ظرفية شرطية غير جازمة).',
        'لو أخلصَ الجميعُ لسعدَ الوطنُ. (لو: حرف امتناع لامتناع).',
        'لولا النيلُ لكانتْ مصرُ صحراءَ. (لولا: حرف امتناع لوجود).'
      ]
    },
    {
      id: 'hukm-ma-baada-adawat',
      title: '٢. حكم إعراب الفعلين بعد أدوات الشرط غير الجازمة',
      explanation: 'لا يُجزم الفعلان بعد هذه الأدوات إطلاقاً؛ فإذا كان الفعلان مضارعين يظلان معربين مرفوعين بالضمة أو ثبوت النون، وإذا كانا ماضيين يعربان فعلين ماضيين مبنيين.',
      examples: [
        'إذا تزرعُ الخيرَ تحصدُ البركةَ. (تزرعُ وتحصدُ: مضارعان مرفوعان بالضمة الظاهرة).',
        'لو اجتهدَ الطالبُ لنجحَ. (اجتهدَ ونجحَ: ماضيان مبنيان على الفتح).'
      ],
      exampleBoxColor: '#eff6ff',
      exampleTextColor: '#1d4ed8'
    },
    {
      id: 'qaeedat-lawla',
      title: '٣. قاعدة إعراب ما بعد (لولا)',
      explanation: 'قاعدة امتحانية هامة جداً: الاسم المرفوع الواقع بعد (لولا) يُعرب دائماً: مبتدأ مرفوعاً وعلامة رفعه الضمة، وخبره محذوف وجوباً تقديره (موجود).',
      examples: [
        'لولا العلمُ لضلَّ الناسُ. (العلمُ: مبتدأ مرفوع بالضمة، وخبره محذوف وجوباً تقديره: موجود).'
      ]
    }
  ]

  const notesText = `• انتبه من تكرار (كلما): يخطئ البعض ويكرر كلمة (كلما) في جواب الشرط؛ والصواب عدم تكرارها:
نقول: "كلما قرأتُ ازددتُ ثقافةً" (ولا تقل: كلما قرأت كلما ازددت ثقافة).
• إعراب ما بعد (لولا) يأتي كثيراً في الامتحانات كإعراب ثابت لا يتغير: مبتدأ مرفوع خبره محذوف وجوباً تقديره موجود.`

  const questions = [
    {
      q: 'أعرب ما تحته خط في جملة: «لولا المطرُ لماتَ الزرعُ»؟',
      a: 'المطرُ: مبتدأ مرفوع وعلامة رفعه الضمة الظاهرة، والخبر محذوف وجوباً تقديره (موجود).'
    },
    {
      q: 'ما دلالة أداة الشرط في: «كلما أتقنتَ عملكَ نلتَ محبةَ الناس»؟',
      a: 'دلالتها: ظرف شرطي غير جازم يفيد التكرار والاستمرار، ويليه فعلان ماضيان.'
    },
    {
      q: 'صوب الخطأ في: «إذا تجتهدْ تنجحْ» مع الضبط؟',
      a: 'الصواب: «إذا تَجْتَهِدُ تَنْجَحُ» بالرفع بالضمة؛ لأن (إذا) أداة شرط غير جازمة لا تجزم الفعلين.'
    }
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-2/grammar" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <PenTool size={18} />
                <span>قواعد النحو - الدرس السادس</span>
              </div>
              <h1 className={styles.title}>أسلوب الشرط (أدوات الشرط غير الجازمة)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          
          <h2 style={{ color: '#059669', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} /> أدوات الشرط غير الجازمة ودلالاتها وأحكام إعرابها
          </h2>

          {/* Grammar Concepts with Audio */}
          {cards.map((c) => (
            <GrammarCard
              key={c.id}
              id={`glesson6-${c.id}`}
              title={c.title}
              explanation={c.explanation}
              examples={c.examples}
              exampleBoxColor={c.exampleBoxColor}
              exampleTextColor={c.exampleTextColor}
            />
          ))}

          {/* Notes Section with Audio */}
          <ParagraphCard
            id="glesson6-notes"
            title="ملاحظات هامة وقواعد امتحانية ذهبية"
            text={notesText}
            icon={<AlertTriangle size={22} color="#d97706" />}
          />

          {/* Comprehensive Grammar Practice Section (Rule MCQs + Exam Passages with Parsing & Extraction) */}
          <div id="questions">
            <GrammarPracticeSection
              grammarData={grammarLesson6}
              id="grammar6-practice"
            />
          </div>

          {/* Quick Practice */}
          <QuestionsCard
            title="تدريبات وتطبيقات سريعة على أدوات الشرط غير الجازمة"
            questions={questions}
            id="glesson6-quick-quiz"
          />

        </div>
      </div>
    </div>
  )
}
