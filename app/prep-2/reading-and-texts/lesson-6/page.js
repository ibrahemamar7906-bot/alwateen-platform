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

export default function Lesson6() {
  const authorBio = {
    title: 'مَدْخَلٌ إِلَى دَرْسِ «مِنْ أَجْلِ غَدٍ»',
    text: 'يُوَاجِهُ كَوْكَبُ الأَرْضِ فِي عَصْرِنَا تَحَدِّيَاتٍ بِيئِيَّةً خَطِيرَةً؛ كَالاحْتِبَاسِ الحَرَارِيِّ وَالتَّغَيُّرِ المُنَاخِيِّ الَّذِي يُهَدِّدُ حَيَاةَ البَشَرِ وَالمَوَارِدَ الطَّبِيعِيَّةَ. وَيَتَنَاوَلُ هَذَا الدَّرْسُ سُبُلَ التَّحَوُّلِ نَحْوَ الطَّاقَةِ النَّظِيفَةِ المُتَجَدِّدَةِ، وَجُهُودَ الدَّوْلَةِ المِصْرِيَّةِ الرَّائِدَةَ فِي مَشَارِيعِ الطَّاقَةِ الشَّمْسِيَّةِ وَالرِّيَاحِ وَالهَيْدْرُوجِينِ الأَخْضَرِ، لِضَمَانِ مُسْتَقْبَلٍ آمِنٍ لِلأَجْيَالِ القَادِمَةِ.'
  }

  const paragraphs = [
    {
      id: 'p1',
      title: '١- خَطَرُ التَّغَيُّرَاتِ المُنَاخِيَّةِ وَأَهَمِّيَّةُ التَّحَوُّلِ الأَخْضَرِ',
      text: `«لَمْ تَعُدْ قَضَايَا البِيئَةِ وَالتَّغَيُّرَاتِ المُنَاخِيَّةِ تَرَفاً فِكْرِيّاً، بَلْ بَاتَتْ أَمْراً مُلِحّاً يَمَسُّ حَيَاةَ كُلِّ كَائِنٍ حَيٍّ عَلَى وَجْهِ البَسِيطَةِ. فَالارْتِفَاعُ المُتَوَاصِلُ فِي دَرَجَاتِ حَرَارَةِ الكَوْكَبِ، وَانْبِعَاثَاتُ الكَرْبُونِ الضَّارَّةُ، قَدْ أَسْفَرَتْ عَنْ جَفَافٍ وَأَعَاصِيرَ وَتَهْدِيدٍ لِلأَمْنِ الغِذَائِيِّ؛ مِمَّا دَفَعَ دُوَلَ العَالَمِ إِلَى البَحْثِ عَنْ حُلُولٍ بَدِيلَةٍ تُعْرَفُ بِـ "الاِقْتِصَادِ الأَخْضَرِ" القَائِمِ عَلَى الطَّاقَاتِ النَّظِيفَةِ.»`
    },
    {
      id: 'p2',
      title: '٢- مَشَارِيعُ مِصْرَ القَوْمِيَّةُ الرَّائِدَةُ فِي الطَّاقَةِ المُتَجَدِّدَةِ',
      text: `«انْطَلَقَتْ مِصْرُ بِخُطَى وَاثِقَةٍ فِي تَبَنِّي المَشَارِيعِ الخَضْرَاءِ، فَأَنْشَأَتْ مَجَمَّعَ "بِنْبَان" لِلطَّاقَةِ الشَّمْسِيَّةِ فِي أُسْوَانَ، وَهُوَ مِنْ أَكْبَرِ مَحَطَّاتِ الطَّاقَةِ الشَّمْسِيَّةِ فِي العَالَمِ، إِلَى جَانِبِ مَزَارِعِ رِيَاحِ الزَّعْفَرَانَةِ وَجَبَلِ الزَّيْتِ عَلَى سَاحِلِ البَحْرِ الأَحْمَرِ. كَمَا خَطَتِ الدَّوْلَةُ خُطُوَاتٍ جَسُورَةً فِي مَجَالِ "الهَيْدْرُوجِينِ الأَخْضَرِ"، لِتُصْبِحَ مَرْكَزاً إِقْلِيمِيّاً لِتَوْلِيدِ الطَّاقَةِ النَّظِيفَةِ وَتَصْدِيرِهَا.»`
    },
    {
      id: 'p3',
      title: '٣- المَسْؤُولِيَّةُ الفَرْدِيَّةُ وَالمُجْتَمَعِيَّةُ لِصِنَاعَةِ غَدٍ مُشْرِقٍ',
      text: `«إِنَّ بِنَاءَ غَدٍ آمِنٍ لَا يَقْتَصِرُ عَلَى جُهُودِ الحُكُومَاتِ وَالمُؤَسَّسَاتِ فَحَسْبُ، بَلْ يَبْدَأُ مِنْ سُلُوكِ كُلِّ فَرْدٍ فِي حَيَاتِهِ اليَوْمِيَّةِ؛ بِتَرْشِيدِ اسْتِهْلَاكِ الكَهْرَبَاءِ وَالمِيَاهِ، وَتَقْلِيلِ اعْتِمَادِنَا عَلَى المَوَادِّ البِلَاسْتِيكِيَّةِ أُحَادِيَّةِ الاسْتِخْدَامِ، وَالمُشَارَكَةِ الفَعَّالَةِ فِي زِرَاعَةِ الأَشْجَارِ لِتَنْقِيَةِ الهَوَاءِ. فَمِنْ أَجْلِ غَدٍ أَفْضَلَ، يَجِبُ أَنْ نَكُونَ حُرَّاساً أَوْفِيَاءَ لِبِيئَتِنَا.»`
    }
  ]

  const vocabList = [
    { word: 'تَرَفاً', meaning: 'رفاهية زائدة غير ضرورية' },
    { word: 'مُلِحّاً', meaning: 'ضرورياً وعاجلاً لا يحتمل التأجيل' },
    { word: 'البَسِيطَة', meaning: 'الأرض واليابسة' },
    { word: 'أَسْفَرَتْ', meaning: 'نتجت وأثمرت وكشفت عن' },
    { word: 'تَبَنِّي', meaning: 'الأخذ به ورعايته وتطبيقه' },
    { word: 'جَسُورَة', meaning: 'شجاعة ومقدامة وجريئة', opposite: 'جبانة ومترددة' },
    { word: 'إِقْلِيمِيّ', meaning: 'خاص بالمنطقة الجغرافية المحيطة' },
    { word: 'المُسْتَدَام', meaning: 'الدائم المستمر الذي يحفظ حقوق الأجيال' },
    { word: 'أُحَادِيَّة الاسْتِخْدَام', meaning: 'التي تُستخدم مرة واحدة ثم تُرمى' }
  ]

  const questions = [
    {
      q: 'س1: ما الأخطار الناتجة عن التغيرات المناخية على كوكب الأرض؟',
      a: 'ارتفاع درجات الحرارة، ذوبان الجليد، زيادة حدة الجفاف والأعاصير، وتهديد التنوع الحيوي والأمن الغذائي.'
    },
    {
      q: 'س2: اذكر نماذج لمشروعات الطاقة المتجددة في مصر؟',
      a: 'مجمع بنبان للطاقة الشمسية بأسوان، ومزارع توليد الكهرباء من الرياح بالزعفرانة وجبل الزيت، ومشروعات إنتاج الهيدروجين الأخضر.'
    },
    {
      q: 'س3: كيف يسهم الطالب والمواطن في حماية البيئة من أجل غد أفضل؟',
      a: 'بترشيد استخدام الكهرباء والمياه، وإعادة التدوير، والحد من النفايات البلاستيكية، والمشاركة في حملات التشجير وزيادة المساحات الخضراء.'
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
                <span>درس قراءة - الوحدة الثانية (بيئتي مسؤوليتي)</span>
              </div>
              <h1 className={styles.title}>من أجل غد</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          
          {/* Banner */}
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
              id={`lesson6-${para.id}`}
              title={para.title}
              text={para.text}
            />
          ))}

          {/* Vocabulary Section */}
          <VocabularySection
            title="معاني المفردات واللغويات (من أجل غد)"
            vocabList={vocabList}
            id="lesson6-vocab"
          />

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP2_QUIZZES['reading-6'] && (
            <div id="quiz">
              <InteractiveQuiz
                quizData={PREP2_QUIZZES['reading-6']}
                id="lesson6-quiz"
              />
            </div>
          )}

          {/* Comprehension Questions */}
          <QuestionsCard
            title="تدريبات وأسئلة الفهم والمناقشة"
            questions={questions}
            id="lesson6-questions"
          />
        </div>
      </div>
    </div>
  )
}
