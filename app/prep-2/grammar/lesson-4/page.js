'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, PenTool, AlertTriangle } from 'lucide-react'
import styles from '../../page.module.css'
import GrammarCard from '../../components/GrammarCard'
import ParagraphCard from '../../components/ParagraphCard'
import QuestionsCard from '../../components/QuestionsCard'
import GrammarPracticeSection from '../../components/GrammarPracticeSection'
import { grammarLesson4 } from '../../data/grammar/lesson4'

export default function Lesson4() {
  const cards = [
    {
      id: 'damaer-munfasila',
      title: '١. الضمائر البارزة المنفصلة ومحلها الإعرابي',
      explanation: 'الضمائر المنفصلة تستقل في النطق والرسم: ١- ضمائر الرفع (أنا، نحن للمتكلم - أنتَ، أنتِ، أنتما، أنتم، أنتن للمخاطب - هو، هي، هما، هم، هن للغائب) وتعرب غالباً في محل رفع مبتدأ. ٢- ضمير النصب المنفصل (إيّا وفروعه: إياك، إياه...) ويعرب في محل نصب مفعول به مقدم.',
      examples: [
        'نحنُ بناةُ المستقبلِ. (نحنُ: ضمير منفصل مبني على الضم في محل رفع مبتدأ).',
        'قال تعالى: ﴿إِيَّاكَ نَعْبُدُ﴾. (إياك: ضمير منفصل مبني في محل نصب مفعول به مقدم).'
      ]
    },
    {
      id: 'damaer-muttasila',
      title: '٢. الضمائر البارزة المتصلة (رفع - نصب - جر)',
      explanation: '١- ضمائر الرفع (تاء الفاعل، نا الفاعلين، نون النسوة، ألف الاثنين، واو الجماعة، ياء المخاطبة). ٢- ضمائر النصب والجر (هاء الغيبة، كاف الخطاب، ياء المتكلم، نا المفعولين): إذا اتصلت باسم تعرب مضافاً إليه، وإذا اتصلت بحرف جر تعرب اسماً مجروراً، وإذا اتصلت بفعل تعرب مفعولاً به، ومع إن وأخواتها تعرب اسماً لها.',
      examples: [
        'أكرمَكَ المعلمُ في مدرستِكَ. (الكاف الأولى: مفعول به، والكاف الثانية: مضاف إليه).',
        'كتبْنا الدرسَ بفهمٍ. (نا: ضمير متصل مبني في محل رفع فاعل).'
      ],
      exampleBoxColor: '#eff6ff',
      exampleTextColor: '#1d4ed8'
    },
    {
      id: 'damaer-mustatira',
      title: '٣. الضمائر المستترة (وجوباً وجوازاً)',
      explanation: 'الضمير المستتر لا يظهر في اللفظ بل يقدّر في الذهن بعد الفعل. يستتر وجوباً مع المتكلم (أنا / نحن) والمخاطب المفرد (أنتَ). ويستتر جوازاً مع الغائب (هو / هي) حيث يصح إقامة الاسم الظاهر مقامه.',
      examples: [
        'أكتبُ واجبي. (الفاعل ضمير مستتر وجوباً تقديره أنا).',
        'كنْ جميلاً. (اسم كن مستتر وجوباً تقديره أنت).',
        'المعلمُ شرحَ الدرسَ. (الفاعل مستتر جوازاً تقديره هو يعود على المعلم).'
      ]
    }
  ]

  const notesText = `• قاعدة التفرقة بين (نا الفاعلين) و(نا المفعولين):
انظر للحرف قبل (نا): إذا كان ساكناً فهي نا الفاعلين في محل رفع (شَكَرْنا المعلمَ). وإذا كان مفتوحاً فهي نا المفعولين في محل نصب (شَكَرَنا المعلمُ).
• أي ضمير يتصل باسم (كتابي، قلمك، مدرستنا) يعرب دائماً في محل جر مضاف إليه.`

  const questions = [
    {
      q: 'حدد الضمير ونوعه وموقعه الإعرابي في: «أعجبني شرحُ المعلم»؟',
      a: 'الضمير: (ياء المتكلم) في الفعل أعجبني، نوعه: بارز متصل، محله: ضمير متصل مبني في محل نصب مفعول به مقدم.'
    },
    {
      q: 'قدر الضمير المستتر في جملتي: «نحترم المعلم» و«الشمس أشرقت»؟',
      a: 'في نحترم: مستتر وجوباً تقديره (نحن). وفي أشرقت: مستتر جوازاً تقديره (هي).'
    },
    {
      q: 'أعرب الضمير المتصل في جملة: «الطلابُ فهمُوا القاعدةَ»؟',
      a: 'واو الجماعة: ضمير بارز متصل مبني على السكون في محل رفع فاعل.'
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
                <span>قواعد النحو - الدرس الرابع</span>
              </div>
              <h1 className={styles.title}>الضمائر البارزة والمستترة</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          
          <h2 style={{ color: '#059669', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} /> أنواع الضمائر وأحكام إعرابها ومواضع استتارها
          </h2>

          {/* Grammar Concepts with Audio */}
          {cards.map((c) => (
            <GrammarCard
              key={c.id}
              id={`glesson4-${c.id}`}
              title={c.title}
              explanation={c.explanation}
              examples={c.examples}
              exampleBoxColor={c.exampleBoxColor}
              exampleTextColor={c.exampleTextColor}
            />
          ))}

          {/* Notes Section with Audio */}
          <ParagraphCard
            id="glesson4-notes"
            title="ملاحظات هامة وقواعد امتحانية ذهبية"
            text={notesText}
            icon={<AlertTriangle size={22} color="#d97706" />}
          />

          {/* Comprehensive Grammar Practice Section (Rule MCQs + Exam Passages with Parsing & Extraction) */}
          <div id="questions">
            <GrammarPracticeSection
              grammarData={grammarLesson4}
              id="grammar4-practice"
            />
          </div>

          {/* Quick Practice */}
          <QuestionsCard
            title="تدريبات وتطبيقات سريعة على الضمائر"
            questions={questions}
            id="glesson4-quick-quiz"
          />

        </div>
      </div>
    </div>
  )
}
