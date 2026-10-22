'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, PenTool, AlertTriangle } from 'lucide-react'
import styles from '../../page.module.css'
import GrammarCard from '../../components/GrammarCard'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import GrammarPracticeSection from '../../components/GrammarPracticeSection'
import { grammarLesson3 } from '../../data/grammar/lesson3'

export default function Lesson3() {
  const cards = [
    {
      id: 'madi-binaa',
      title: '١. بناء الفعل الماضي',
      explanation: 'الفعل الماضي مبني دائماً في جميع أحواله، وله ثلاث علامات بناء: ١- يبنى على الضم عند اتصاله بواو الجماعة. ٢- يبنى على السكون عند اتصاله بتاء الفاعل، أو نا الفاعلين، أو نون النسوة. ٣- يبنى على الفتح في غير ذلك (إذا لم يتصل به شيء، أو اتصل بتاء التأنيث، أو ألف الاثنين، أو ضمائر النصب).',
      examples: [
        'المعلمون شرحُوا الدرسَ. (شرحُوا: ماضٍ مبني على الضم لاتصاله بواو الجماعة).',
        'كتبْتُ الدرسَ بعناية. (كتبْتُ: ماضٍ مبني على السكون لاتصاله بتاء الفاعل).',
        'حضرَ الطالبُ مبكراً. (حضرَ: ماضٍ مبني على الفتح الظاهر).'
      ]
    },
    {
      id: 'amr-binaa',
      title: '٢. بناء فعل الأمر',
      explanation: 'فعل الأمر مبني دائماً على ما يُجزم به مضارعه: ١- السكون (إذا كان صحيح الآخر أو اتصلت به نون النسوة). ٢- حذف حرف العلة (إذا كان معتل الآخر). ٣- حذف النون (إذا اتصل بألف الاثنين أو واو الجماعة أو ياء المخاطبة). ٤- الفتح (إذا اتصلت به نون التوكيد مباشرة).',
      examples: [
        'اقرأْ باسم ربك. (مبني على السكون).',
        'ادْعُ إلى سبيل ربك. (مبني على حذف حرف العلة الواو).',
        'اكتبوا واجبكم. (مبني على حذف النون لاتصاله بواو الجماعة).'
      ],
      exampleBoxColor: '#eff6ff',
      exampleTextColor: '#1d4ed8'
    },
    {
      id: 'mudaria-binaa',
      title: '٣. إعراب وبناء الفعل المضارع',
      explanation: 'الأصل في المضارع الإعراب (يُرفع ويُنصب ويُجزم). ولكنه يُبنى في حالتين فقط: ١- على السكون إذا اتصلت به نون النسوة. ٢- على الفتح إذا اتصلت به نون التوكيد اتصالاً مباشراً.',
      examples: [
        'الطالباتُ يَجْتَهِدْنَ في دراستهن. (يجتهدْنَ: مضارع مبني على السكون لاتصاله بنون النسوة).',
        'واللهِ لأَقُولَنَّ الحقَّ. (لأقولَنَّ: مضارع مبني على الفتح لاتصاله بنون التوكيد مباشرة).'
      ]
    }
  ]

  const notesText = `• قاعدة سرية للأمر: حوّل فعل الأمر لمضارعه ثم ضَع قبله (لم):
مثال: "اسعَ" ⬅ لم يَسْعَ (مجزوم بحذف حرف العلة) ⬅ إذن الأمر "اسعَ" مبني على حذف حرف العلة!
• المضارع يبنى على الفتح إذا سبق بقسم أو طلب واتصلت به نون التوكيد (لتكتبَنَّ / هل تفهَمَنَّ).`

  const questions = [
    {
      q: 'حدد علامة بناء الفعلين في: «اسعَ في الخير، واصبرْ على الشدائد»؟',
      a: 'اسعَ: مبني على حذف حرف العلة، واصبرْ: مبني على السكون الظاهر.'
    },
    {
      q: 'اجعل الفعل المعرب «يعمل» مبنياً على الفتح في جملة مفيدة؟',
      a: '«واللهِ لَيَعْمَلَنَّ العاملُ بجدٍّ وإخلاصٍ» (اتصل بنون التوكيد بعد قسم فبني على الفتح).'
    },
    {
      q: 'أعرب الفعل «يشاركن» في جملة: «الفتياتُ يُشَارِكْنَ في المسابقة»؟',
      a: 'فعل مضارع مبني على السكون لاتصاله بنون النسوة، ونون النسوة ضمير متصل في محل رفع فاعل.'
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
                <span>قواعد النحو - الدرس الثالث</span>
              </div>
              <h1 className={styles.title}>المعرب والمبني من الأفعال</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          
          <h2 style={{ color: '#059669', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} /> أحكام بناء الماضي والأمر وإعراب وبناء المضارع
          </h2>

          {/* Grammar Concepts with Audio */}
          {cards.map((c) => (
            <GrammarCard
              key={c.id}
              id={`glesson3-${c.id}`}
              title={c.title}
              explanation={c.explanation}
              examples={c.examples}
              exampleBoxColor={c.exampleBoxColor}
              exampleTextColor={c.exampleTextColor}
            />
          ))}

          {/* Notes Section with Audio */}
          <ParagraphCard
            id="glesson3-notes"
            title="ملاحظات هامة وقواعد امتحانية ذهبية"
            text={notesText}
            icon={<AlertTriangle size={22} color="#d97706" />}
          />

          {/* Comprehensive Grammar Practice Section (Rule MCQs + Exam Passages with Parsing & Extraction) */}
          <div id="questions">
            <GrammarPracticeSection
              grammarData={grammarLesson3}
              id="grammar3-practice"
            />
          </div>

          {/* Quick Practice */}
          <QuestionsCard
            title="تدريبات وتطبيقات سريعة على بناء الأفعال"
            questions={questions}
            id="glesson3-quick-quiz"
          />

        </div>
      </div>
    </div>
  )
}
