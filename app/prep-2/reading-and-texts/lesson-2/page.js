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

export default function Lesson2() {
  const authorBio = {
    title: 'مَدْخَلٌ إِلَى دَرْسِ «العُبُورُ إِلَى المُسْتَقْبَلِ»',
    text: 'تُمَثِّلُ مَلْحَمَةُ السَّادِسِ مِنْ أُكْتُوبَرَ عَامَ 1973م أَعْظَمَ انْتِصَارَاتِ العَصْرِ الحَدِيثِ؛ حَيْثُ حَطَّمَ الجَيْشُ المِصْرِيُّ خَطَّ بَارْلِيفَ المَنِيعَ، وَقَهَرَ الأَوْهَامَ، وَأَعَادَ لِلأُمَّةِ العَرَبِيَّةِ كَرَامَتَهَا. وَلَمْ يَكُنِ النَّصْرُ مُجَرَّدَ عُبُورٍ لِمَانِعٍ مَائِيٍّ، بَلْ هُوَ عُبُورٌ مُسْتَمِرٌّ نَحْوَ التَّنْمِيَةِ وَالبِنَاءِ وَالعِلْمِ لِصِنَاعَةِ مُسْتَقْبَلٍ مُشْرِقٍ.'
  }

  const paragraphs = [
    {
      id: 'p1',
      title: '١- مُعْجِزَةُ السَّادِسِ مِنْ أُكْتُوبَرَ وَتَحْطِيمُ المَانِعِ الصَّعْبِ',
      text: `«فِي السَّادِسِ مِنْ أُكْتُوبَرَ عَامَ 1973م، انْطَلَقَتْ نُسُورُ الجَوِّ وَأَبْطَالُ المِدْفَعِيَّةِ المِصْرِيَّةِ، لِيَفْتَحُوا بَابَ النَّصْرِ عَلَى مِصْرَاعَيْهِ. عَبَرَ جُنُودُنَا البَوَاسِلُ قَنَاةَ السُّوَيْسِ فِي شَجَاعَةٍ أَذْهَلَتِ العَالَمَ، وَحَطَّمُوا السَّاتِرَ التُّرَابِيَّ وَخَطَّ بَارْلِيفَ الَّذِي وَصَفَهُ خُبَرَاءُ العَسْكَرِيَّةِ بِأَنَّهُ أَمْنَعُ حِصْنٍ فِي التَّارِيخِ، فَتَبَدَّدَتْ أُسْطُورَةُ الجَيْشِ الَّذِي لَا يُقْهَرُ أَمَامَ بَسَالَةِ خَيْرِ أَجْنَادِ الأَرْضِ.»`
    },
    {
      id: 'p2',
      title: '٢- التَّخْطِيطُ العِلْمِيُّ وَالمُفَاجَأَةُ وَالتَّضَامُنُ العَرَبِيُّ',
      text: `«لَمْ يَكُنْ نَصْرُ أُكْتُوبَرَ وَلِيدَ الصُّدْفَةِ، بَلْ كَانَ نِتَاجاً لِعَمَلٍ شَاقٍّ، وَتَخْطِيطٍ عِلْمِيٍّ دَقِيقٍ، وَتَدْرِيبٍ شَاقٍّ تَلَاحَمَتْ فِيهِ إِرَادَةُ الجَيْشِ مَعَ صُمُودِ الشَّعْبِ. وَقَدْ تَجَلَّى فِيهِ عُنْصُرُ المُفَاجَأَةِ الاسْتِرَاتِيجِيَّةِ بِأَرْقَى صُوَرِهِ، إِضَافَةً إِلَى سِلَاحِ التَّضَامُنِ العَرَبِيِّ المَجِيدِ الَّذِي شَكَّلَ سَنَداً قَوِيّاً لِمِصْرَ فِي مَعْرَكَتِهَا الحَاسِمَةِ، فَأَصْبَحَتِ الحَرْبُ دَرْساً يُدَرَّسُ فِي أَعْرَقِ الأَكَادِيمِيَّاتِ العَسْكَرِيَّةِ.»`
    },
    {
      id: 'p3',
      title: '٣- العُبُورُ المُتَجَدِّدُ لِبِنَاءِ الغَدِ وَمُوَاجَهَةِ التَّحَدِّيَاتِ',
      text: `«إِنَّ رُوحَ أُكْتُوبَرَ لَيْسَتْ ذِكْرَى نَحْتَفِلُ بِهَا يَوْماً فِي العَامِ، بَلْ هِيَ طَاقَةُ أَمَلٍ وَعَزِيمَةٍ تَدْفَعُنَا لِعُبُورِ تَحَدِّيَاتِ الحَاضِرِ وَالمُسْتَقْبَلِ. إِنَّ عُبُورَنَا الحَقِيقِيَّ اليَوْمَ يَكُونُ بِالتَّسَلُّحِ بِالعِلْمِ وَالمَعْرِفَةِ، وَالعَمَلِ الجَادِّ لِبِنَاءِ المَشَارِيعِ القَوْمِيَّةِ، وَإِعْلَاءِ قِيمَةِ الإِنْتَاجِ؛ حَتَّى نَبْنِيَ مِصْرَ القَوِيَّةَ المَنِيعَةَ الَّتِي تَسْتَحِقُّهَا أَجْيَالُنَا القَادِمَةُ.»`
    }
  ]

  const vocabList = [
    { word: 'عَلَى مِصْرَاعَيْهِ', meaning: 'على اتساعه تماماً وبأقصى طاقة' },
    { word: 'البَوَاسِل', meaning: 'الشجعان الأقوياء ذوو الجسارة', singular: 'البَاسِل' },
    { word: 'تَبَدَّدَتْ', meaning: 'تلاشت وتفرقت واختفت', opposite: 'تجمعت وثبتت' },
    { word: 'أُسْطُورَة', meaning: 'خرافة ووهم لا حقيقة له', plural: 'أَسَاطِير' },
    { word: 'وَلِيدَ الصُّدْفَةِ', meaning: 'نتيجة عشوائية غير مدبرة' },
    { word: 'تَلَاحَمَتْ', meaning: 'تماسكت واتحدت بقوة', opposite: 'تفرقت وتشتتت' },
    { word: 'تَجَلَّى', meaning: 'ظهر ووضح بأبهى صورة', opposite: 'خفي وتوارى' },
    { word: 'سَنَداً', meaning: 'عوناً وظهيراً ومساعداً', plural: 'أَسْنَاد' },
    { word: 'أَعْرَق', meaning: 'أقدم وأصيل ومتميز تاريخياً' },
    { word: 'المَنِيعَة', meaning: 'القوية الحصينة التي يصعب اختراقها', opposite: 'الضعيفة والهشة' }
  ]

  const questions = [
    {
      q: 'س1: كيف حطمت القوات المسلحة أسطورة الجيش الإسرائيلي في 6 أكتوبر؟',
      a: 'انطلقت الطائرات والمدفعية المصرية، وعبر الجنود البواسل القناة وحطموا خط بارليف والساتر الترابي في ساعات معدودة، وقهروا مقولة الجيش الذي لا يُقهر.'
    },
    {
      q: 'س2: ما الأسس التي قام عليها نصر أكتوبر كما بين الدرس؟',
      a: 'التخطيط العلمي الدقيق، والتدريب الشاق، وتلاحم الشعب مع الجيش، والمفاجأة الاستراتيجية، وسلاح التضامن العربي.'
    },
    {
      q: 'س3: ما المقصود بالعبور الجديد في عصرنا الحاضر؟',
      a: 'هو عبور التحديات الاقتصادية والاجتماعية من خلال التسلح بالعلم والتقنية الحديثة والعمل الجاد لبناء المشروعات ونهضة مصر.'
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
              <h1 className={styles.title}>العبور إلى المستقبل (حرب أكتوبر)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          
          {/* Overview Banner */}
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
              id={`lesson2-${para.id}`}
              title={para.title}
              text={para.text}
            />
          ))}

          {/* Vocabulary Section */}
          <VocabularySection
            title="معاني المفردات واللغويات (العبور إلى المستقبل)"
            vocabList={vocabList}
            id="lesson2-vocab"
          />

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP2_QUIZZES['reading-2'] && (
            <div id="quiz">
              <InteractiveQuiz
                quizData={PREP2_QUIZZES['reading-2']}
                id="lesson2-quiz"
              />
            </div>
          )}

          {/* Comprehension Questions */}
          <QuestionsCard
            title="تدريبات وأسئلة الفهم والمناقشة"
            questions={questions}
            id="lesson2-questions"
          />
        </div>
      </div>
    </div>
  )
}
