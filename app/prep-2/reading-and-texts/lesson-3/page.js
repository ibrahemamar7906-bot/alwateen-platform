'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, FileText, Award, BookOpen } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import VocabularySection from '../../components/VocabularySection'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'
import { PREP2_QUIZZES } from '../../data/prep2_quizzes'

export default function Lesson3() {
  const authorBio = {
    title: 'سِيرَةُ الشَّهِيدِ البَطَلِ العَقِيدِ «مُحَمَّد مَبْرُوك»',
    text: 'ضَابِطُ شُرْطَةٍ مِصْرِيٌّ بَارِزٌ بِقِطَاعِ الأَمْنِ الوَطَنِيِّ، كَانَ مِنْ أَكْفَإِ رِجَالِ المَعْلُومَاتِ وَمُكَافَحَةِ الإِرْهَابِ. وَقَفَ بِشَجَاعَةٍ نَادِرَةٍ فِي كَشْفِ خُيُوطِ المُؤَامَرَاتِ ضِدَّ البِلَادِ، وَقَدَّمَ الشَّهَادَةَ التَّارِيخِيَّةَ الحَاسِمَةَ فِي قَضِيَّةِ التَّخَابُرِ وَاقْتِحَامِ السُّجُونِ. اسْتُشْهِدَ إِثْرَ عَمَلِيَّةِ اغْتِيَالٍ جَبَانَةٍ فِي 17 نُوفَمْبِرَ عَامَ 2013م، لِيَبْقَى رَمْزاً لِلْفِدَاءِ وَالصُّمُودِ.'
  }

  const paragraphs = [
    {
      id: 'p1',
      title: '١- النَّشْأَةُ وَالانْتِمَاءُ لِجِهَازِ الشُّرْطَةِ المِصْرِيَّةِ',
      text: `«تَزْخَرُ مِصْرُ عَلَى مَرِّ العُصُورِ بِرِجَالٍ صَدَقُوا مَا عَاهَدُوا اللهَ عَلَيْهِ، نَذَرُوا أَنْفُسَهُمْ لِحِمَايَةِ تُرَابِهَا وَأَمْنِهَا. وَيَأْتِي الشَّهِيدُ البَطَلُ مُحَمَّد مَبْرُوك فِي طَلِيعَةِ هَؤُلَاءِ الصُّقُورِ؛ إِذْ تَخَرَّجَ فِي كُلِّيَّةِ الشُّرْطَةِ عَامَ 1995م، وَالْتَحَقَ بِقِطَاعِ الأَمْنِ الوَطَنِيِّ، حَيْثُ تَمَيَّزَ بِحِسٍّ أَمْنِيٍّ يَقِظٍ، وَذَكَاءٍ مَيْدَانِيٍّ نَادِرٍ، وَإِخْلَاصٍ تَامٍّ فِي أَدَاءِ وَاجِبِهِ المُقَدَّسِ.»`
    },
    {
      id: 'p2',
      title: '٢- شَجَاعَةٌ نَادِرَةٌ فِي مُوَاجَهَةِ المُؤَامَرَاتِ',
      text: `«لَعِبَ الشَّهِيدُ مَبْرُوك دَوْراً بَطُولِيّاً فِي كَشْفِ خَلَايَا الإِرْهَابِ وَالتَّطَرُّفِ، وَتَتَبُّعِ خُيُوطِ التَّآمُرِ الخَارِجِيِّ وَالدَّاخِلِيِّ عَلَى مُؤَسَّسَاتِ الدَّوْلَةِ. وَكَانَتْ شَهَادَتُهُ المُوَثَّقَةُ بِالأَدِلَّةِ الدَّامِغَةِ فِي قَضَايَا التَّخَابُرِ وَتَهْرِيبِ السُّجَنَاءِ حَجَرَ الزَّاوِيَةِ فِي تَعْرِيَةِ المُجْرِمِينَ وَحِمَايَةِ الجَبْهَةِ الدَّاخِلِيَّةِ لِلْوَطَنِ، غَيْرَ آبِهٍ بِالتَّهْدِيدَاتِ الَّتِي حَاصَرَتْهُ.»`
    },
    {
      id: 'p3',
      title: '٣- الاغْتِيَالُ الغَادِرُ وَتَخْلِيدُ سِيرَةِ الصَّقْرِ الوَطَنِيِّ',
      text: `«فِي مَسَاءِ السَّابِعَ عَشَرَ مِنْ نُوفَمْبِرَ عَامَ 2013م، امْتَدَّتْ يَدُ الخِيَانَةِ وَالغَدْرِ لِتَغْتَالَ البَطَلَ أَمَامَ مَنْزِلِهِ، لِيَلْقَى رَبَّهُ شَهِيداً شَاهِداً عَلَى شَرَفِ العَسْكَرِيَّةِ المِصْرِيَّةِ. لَمْ يَمُتْ مَبْرُوك؛ لِأَنَّ الشُّهَدَاءَ أَحْيَاءٌ عِنْدَ رَبِّهِمْ يُرْزَقُونَ، وَقَدْ خَلَّدَتْ مِصْرُ اسْمَهُ فِي قُلُوبِ أَبْنَائِهَا، لِيَكُونَ مَنَارَةً تُلْهِمُ الشَّبَابَ مَعَانِيَ الفِدَاءِ وَحُبِّ الوَطَنِ.»`
    }
  ]

  const vocabList = [
    { word: 'تَزْخَر', meaning: 'تمتلئ وتفيض', opposite: 'تخلو وتفرغ' },
    { word: 'طَلِيعَة', meaning: 'مقدمة وصدارة', plural: 'طَلَائِع' },
    { word: 'الصُّقُور', meaning: 'المراد: أبطال الأمن الأذكياء الأشداء', singular: 'صَقْر' },
    { word: 'يَقِظ', meaning: 'منتبه وحذر وفطن', opposite: 'غافل ونائم' },
    { word: 'الدَّامِغَة', meaning: 'القاطعة الحاسمة التي لا تقبل الشك' },
    { word: 'حَجَرَ الزَّاوِيَةِ', meaning: 'الأساس والركن الجوهري في الأمر' },
    { word: 'تَعْرِيَة', meaning: 'كشف وإظهار وفضح', opposite: 'ستر وتغطية' },
    { word: 'الغَدْر', meaning: 'الخيانة ونقض العهد والمباغتة بالشر', opposite: 'الوفاء والأمانة' },
    { word: 'مَنَارَة', meaning: 'موضع النور ومصدر الهداية والإلهام', plural: 'مَنَائِر ومَنَارَات' }
  ]

  const questions = [
    {
      q: 'س1: أين عمل الشهيد البطل محمد مبروك؟ وبم تميز؟',
      a: 'عمل بقطاع الأمن الوطني بوزارة الداخلية، وتميز بالحس الأمني الفطن والذكاء والجسارة والتفاني والإخلاص في حماية أمن مصر.'
    },
    {
      q: 'س2: ما الدور التاريخي الذي قام به الشهيد في كشف قضايا التخابر؟',
      a: 'قدم شهادات موثقة وأدلة دامغة في قضايا التخابر واقتحام السجون، وكشف مخططات الجماعات الإرهابية في تهديد استقرار الوطن.'
    },
    {
      q: 'س3: متى استشهد البطل محمد مبروك؟ وما الرسالة التي تركها للأجيال؟',
      a: 'استشهد في 17 نوفمبر 2013م إثر عملية اغتيال غادرة، وترك رسالة خالدة بأن الدفاع عن مصر أمانة مقدسة تتطلب التضحية بالغالي والنفيس.'
    }
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-2/reading-and-texts" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <FileText size={18} />
                <span>درس قراءة - الوحدة الأولى (انتمائي قوتي)</span>
              </div>
              <h1 className={styles.title}>من صقور الوطنية «محمد مبروك»</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          
          {/* Biography Banner */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '16px', padding: '20px', marginBottom: '30px' }}>
            <h3 style={{ color: '#166534', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem' }}>
              <Award size={22} />
              {authorBio.title}
            </h3>
            <p style={{ color: '#15803d', lineHeight: '1.8', margin: 0, fontSize: '0.95rem' }}>
              {authorBio.text}
            </p>
          </div>

          <h2 style={{ color: '#059669', marginBottom: '25px', borderBottom: '2px solid #ecfdf5', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} /> محتوى درس القراءة
          </h2>

          {/* Paragraphs */}
          {paragraphs.map((para) => (
            <ParagraphCard
              key={para.id}
              id={`lesson3-${para.id}`}
              title={para.title}
              text={para.text}
            />
          ))}

          {/* Vocabulary Section */}
          <VocabularySection
            title="معاني المفردات واللغويات (من صقور الوطنية)"
            vocabList={vocabList}
            id="lesson3-vocab"
          />

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP2_QUIZZES['reading-3'] && (
            <div id="quiz">
              <InteractiveQuiz
                quizData={PREP2_QUIZZES['reading-3']}
                id="lesson3-quiz"
              />
            </div>
          )}

          {/* Comprehension Questions */}
          <QuestionsCard
            title="تدريبات وأسئلة الفهم والمناقشة"
            questions={questions}
            id="lesson3-questions"
          />
        </div>
      </div>
    </div>
  )
}
