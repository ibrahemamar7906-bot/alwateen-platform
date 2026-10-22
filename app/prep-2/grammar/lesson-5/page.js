'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, PenTool, AlertTriangle } from 'lucide-react'
import styles from '../../page.module.css'
import GrammarCard from '../../components/GrammarCard'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import GrammarPracticeSection from '../../components/GrammarPracticeSection'
import { grammarLesson5 } from '../../data/grammar/lesson5'

export default function Lesson5() {
  const cards = [
    {
      id: 'shart-arkan',
      title: '١. أركان أسلوب الشرط وأدوات الشرط الجازمة',
      explanation: 'يتكون أسلوب الشرط من ثلاثة أركان: (أداة الشرط + فعل الشرط + جواب الشرط). أدوات الشرط الجازمة تجزم فعلين مضارعين، وهي: إنْ (حرف شرط لربط الجواب بالشرط)، مَنْ (للعاقل)، مَا ومَهْمَا (لغير العاقل)، متى وأيّان (للزمان)، أين وأينما وحيثما وأنّى (للمكان)، كيفما (للحال)، وأيّ (بحسب ما تضاف إليه، وهي معربة).',
      examples: [
        'إنْ تذاكرْ تنجحْ. (إن: حرف شرط، تذاكر: فعل الشرط مجزوم، تنجح: جواب الشرط مجزوم).',
        'مَنْ يفعلِ الخيرَ يحصدْ خيراً. (من: اسم شرط للعاقل، يفعل: فعل الشرط، يحصد: جواب الشرط).'
      ]
    },
    {
      id: 'jazm-alamat',
      title: '٢. علامات جزم الفعل المضارع في أسلوب الشرط',
      explanation: '١- السكون: إذا كان صحيح الآخر (ولم يلتقِ ساكنان). ٢- حذف حرف العلة: إذا كان معتل الآخر بالألف أو الواو أو الياء (يسعى -> يسعَ / يدعو -> يدعُ / يقضي -> يقضِ). ٣- حذف النون: إذا كان من الأفعال الخمسة لاتصاله بألف الاثنين أو واو الجماعة أو ياء المخاطبة (تكتبون -> تكتبوا).',
      examples: [
        'أينما تسافروا تجدوا أصدقاء. (تسافروا وتجدوا: مجزومان بحذف النون).',
        'متى تدعُ اللهَ بإخلاصٍ يُجِبْكَ. (تدعُ: مجزوم بحذف الواو، ويجبك: مجزوم بالسكون).'
      ],
      exampleBoxColor: '#eff6ff',
      exampleTextColor: '#1d4ed8'
    },
    {
      id: 'hazf-al-illa-qabl-akher',
      title: '٣. حذف حرف العلة قبل الآخر منعاً لالتقاء الساكنين',
      explanation: 'إذا كان الفعل صحيح الآخر وقبله حرف مد علة (ألف، واو، ياء) مثل: (ينال، يقول، يبيع)؛ عند جزمه يوضع السكون على آخره، ويُحذف حرف العلة الذي قبله منعاً لالتقاء ساكنين في اللغة العربية، وتكون علامة جزمه السكون!',
      examples: [
        'إنْ تجتهدْ تَنَلْ رضا اللهِ. (تَنَلْ: مجزوم بالسكون وحذفت الألف منعاً لالتقاء ساكنين).',
        'مَنْ يَقُلِ الحقَّ يَنْجُ. (يَقُلْ: مجزوم بالسكون وحذفت الواو منعاً لالتقاء ساكنين).'
      ]
    }
  ]

  const notesText = `• انتبه جداً للفرق بين علامة الجزم وحذف الساكن: الفعل "تستطيع" عند جزمه يصبح "تَسْتَطِعْ"، علامة جزمه هي (السكون) الظاهر على العين، وليس حذف حرف العلة!
• الأداة الوحيدة المعربة هي (أيّ): ترفع بالضمة (أيُّ طالبٍ يجتهد ينجح) وتنصب بالفتحة وتجر بالكسرة بحسب موقعها.`

  const questions = [
    {
      q: 'اربط بين الجملتين بأداة شرط جازمة: «يتقي الله» و«ينال توفيقه»؟',
      a: '«مَنْ يَتَّقِ اللهَ يَنَلْ توفيقَهُ» (يتّقِ: مجزوم بحذف الياء، ويَنَلْ: مجزوم بالسكون وحذفت الألف منعاً لالتقاء ساكنين).'
    },
    {
      q: 'أعرب الفعل في جملة: «ما تقدموا لأنفسكم من خيرٍ تجدوه»؟',
      a: 'تقدموا: فعل الشرط مضارع مجزوم بما وعلامة جزمه حذف النون لأنه من الأفعال الخمسة، وواو الجماعة فاعل.'
    },
    {
      q: 'حدد أركان أسلوب الشرط في: «حيثما تستقمْ يقدرْ لكَ اللهُ النجاحَ»؟',
      a: 'أداة الشرط: (حيثما)، فعل الشرط: (تستقمْ)، جواب الشرط: (يقدرْ).'
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
                <span>قواعد النحو - الدرس الخامس</span>
              </div>
              <h1 className={styles.title}>أسلوب الشرط (أدوات الشرط الجازمة)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          
          <h2 style={{ color: '#059669', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} /> أركان أسلوب الشرط الجازم وعلامات جزم الفعلين
          </h2>

          {/* Grammar Concepts with Audio */}
          {cards.map((c) => (
            <GrammarCard
              key={c.id}
              id={`glesson5-${c.id}`}
              title={c.title}
              explanation={c.explanation}
              examples={c.examples}
              exampleBoxColor={c.exampleBoxColor}
              exampleTextColor={c.exampleTextColor}
            />
          ))}

          {/* Notes Section with Audio */}
          <ParagraphCard
            id="glesson5-notes"
            title="ملاحظات هامة وقواعد امتحانية ذهبية"
            text={notesText}
            icon={<AlertTriangle size={22} color="#d97706" />}
          />

          {/* Comprehensive Grammar Practice Section (Rule MCQs + Exam Passages with Parsing & Extraction) */}
          <div id="questions">
            <GrammarPracticeSection
              grammarData={grammarLesson5}
              id="grammar5-practice"
            />
          </div>

          {/* Quick Practice */}
          <QuestionsCard
            title="تدريبات وتطبيقات سريعة على أدوات الشرط الجازمة"
            questions={questions}
            id="glesson5-quick-quiz"
          />

        </div>
      </div>
    </div>
  )
}
