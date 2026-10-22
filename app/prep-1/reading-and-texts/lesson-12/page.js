'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, FileText } from 'lucide-react'
import styles from '../../page.module.css'
import PoetrySection from '../../components/PoetrySection'
import ParagraphCard from '../../components/ParagraphCard'
import VocabularySection from '../../components/VocabularySection'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'
import { PREP1_QUIZZES } from '../../data/prep1_quizzes'

export default function Lesson12() {
  const verses = [
    {
      sadr: 'يَا رَبِّ أَعْطِ السَّائِلَ المَحْرُومَ',
      ajuz: 'أَسْبَابَ السُّرُورِ'
    },
    {
      sadr: 'أَطْفِئْ وُقُودَ الحَرْبِ فِي',
      ajuz: 'الدُّوَلِ المُؤَجَّجَةِ السَّعِيرِ'
    },
    {
      sadr: 'وَعَلَى جَبِينِ الكَوْنِ ضَعْ',
      ajuz: 'قُبَلَ المَحَبَّةِ وَالضَّمِيرِ'
    },
    {
      sadr: 'يَا رَبِّ هَبْ لِلرَّوْضِ بَهْجَتَهُ',
      ajuz: 'وَلِلزَّهْرِ العَبِيرِ'
    },
    {
      sadr: 'وَالعُشَّ لِلْعَصْفُورِ وَالهَمْسَ',
      ajuz: 'المُنَغَّمَ لِلْغَدِيرِ'
    },
    {
      sadr: 'وَعَلَى فِرَاشِ الأُمِّ أَطْلِقْ',
      ajuz: 'ضَحْكَةَ الطِّفْلِ النَّضِيرِ'
    },
    {
      sadr: 'وَأَنَا.. أَنَا يَا رَبِّ جُزْءٌ',
      ajuz: 'مِنْ هَوَاكَ وَمِنْ سَنَاهْ'
    },
    {
      sadr: 'مَا دُمْتَ أَنْتَ تُحِبُّنِي',
      ajuz: 'مَاذَا أُرِيدُ مِنَ الحَيَاةْ؟! '
    }
  ]

  const poetBio = {
    title: 'نُبْذَةٌ عَنِ الشَّاعِرَةِ جَلِيلَة رِضَا',
    text: 'شَاعِرَةٌ وَأَدِيبَةٌ مِصْرِيَّةٌ، وُلِدَتْ بِالإِسْكَنْدَرِيَّةِ عَامَ 1915م وَتُوُفِّيَتْ عَامَ 2001م. نَشَأَتْ فِي بِيئَةٍ أَدَبِيَّةٍ وَكَتَبَتِ الشِّعْرَ فِي سِنٍّ مُبَكِّرَةٍ. تَمَيَّزَتْ أَشْعَارُهَا بِالنَّزْعَةِ الإِنْسَانِيَّةِ الرَّقِيقَةِ وَالتَّضَرُّعِ الإِيمَانِيِّ وَالدَّعْوَةِ إِلَى السَّلَامِ وَنَبْذِ الحُرُوبِ. لَهَا عِدَّةُ دَوَاوِينَ مِنْهَا: "اللَّحْنُ البَاكِي" وَ"أَجْنِحَةُ اللَّيْلِ"، وَنَالَتْ وِسَامَ العُلُومِ وَالفُنُونِ تَقْدِيراً لِعَطَائِهَا الأَدَبِيِّ.'
  }

  const vocabList = [
    { word: 'السَّائِلَ', meaning: 'المحتاج الذي يطلب العون والرحمة', plural: 'السُّؤَّال' },
    { word: 'المَحْرُومَ', meaning: 'الذي فقد نِعَم الحياة وخيراتها', opposite: 'المُنْعَم عليه' },
    { word: 'المُؤَجَّجَةِ', meaning: 'المشتعلة المتوقدة بشدة', opposite: 'المنطفئة' },
    { word: 'السَّعِيرِ', meaning: 'النار الشديدة الملتهبة', plural: 'سُعُر' },
    { word: 'جَبِينِ', meaning: 'مقدمة الرأس والوجه، والمراد: وجه الكون ومظهره', plural: 'أَجْبِنَة وجُبُن' },
    { word: 'الرَّوْضِ', meaning: 'الحدائق والبساتين الخضراء الجميلة', singular: 'رَوْضَة' },
    { word: 'العَبِيرِ', meaning: 'الرائحة الطيبة الزكية الفواحة' },
    { word: 'الغَدِيرِ', meaning: 'الجدول والنهر الصغير العذب', plural: 'غُدْرَان' },
    { word: 'النَّضِيرِ', meaning: 'الجميل المشرق الممتلئ بالحيوية والنضارة', opposite: 'الشاحب والذابل' },
    { word: 'سَنَاهْ', meaning: 'نوره العظيم وضياؤه الساطع' }
  ]

  const explanation = {
    title: 'الشرح واللمحات البلاغية والوجدانية',
    text: `١- التضرع للفقراء والسلام: تبدأ الشاعرة بالدعاء إلى الله أن يمنح المحرومين السعادة، وأن يطفئ نيران الحروب التي تدمر الإنسانية، ليعم السلام والمحبة كل أرجاء الكون.
٢- بهجة الطبيعة وأمان الكائنات: تدعو الله أن يحفظ للأرض جمالها وللحدائق أريجها، وأن يوفر العش الآمن للطيور والهمس العذب للجداول والضحكة النقية للأطفال في أحضان أمهاتهم.
٣- الرضا بنور الله ومحبته: تختتم الشاعرة مناجاتها بأنها تكتفي بمحبة الله وقربه ونوره عن كل زخارف الحياة الفانية.`,
    notes: '💡 أسلوب النداء والأمر البلاغي: (يا رب أعطِ / أطفئ / هب): نداء للتضرع، وأمر للدعاء والرجاء وإظهار الافتقار إلى رحمة الله.'
  }

  const questions = [
    {
      q: 'س1: ما الدعاء الذي تتوجه به الشاعرة جليلة رضا إلى الله تعالى في بداية النص؟',
      a: 'تدعو الله أن ينشر السلام ويسعد المحرومين ويطفئ نيران الحروب التي تدمر البشرية ويعيد الأمان للعالم.'
    },
    {
      q: 'س2: ما الجمال في قول الشاعرة: "وعلى جبين الكون ضع قبل المحبة والضمير"؟',
      a: 'تصوير بديع للكون بإنسان له جبين تُوضع عليه قبلات المحبة والضمير، مما يوحي بسيادة السلام والتسامح بين البشر.'
    },
    {
      q: 'س3: ما الغرض من الاستفهام في قول الشاعرة: "ماذا أريد من الحياة"؟',
      a: 'استفهام غرضه النفي والتعجب، ويدل على قمة الرضا والقناعة والسعادة باكتفائها بمحبة الله ورعايته.'
    }
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-1/reading-and-texts" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <FileText size={18} />
                <span>نص شعري - الوحدة الثالثة (مواقف إنسانية)</span>
              </div>
              <h1 className={styles.title}>دعاء شاعرة (شعر: جليلة رضا)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          
          {/* Poet Bio */}
          <ParagraphCard
            id="lesson12-bio"
            title={poetBio.title}
            text={poetBio.text}
          />

          {/* Poetry Section with Recitation */}
          <PoetrySection
            title="قصيدة دعاء شاعرة"
            poet="جليلة رضا"
            verses={verses}
            id="lesson12-poem"
          />

          {/* Vocabulary Section */}
          <VocabularySection
            title="معاني المفردات واللغويات (نص دعاء شاعرة)"
            vocabList={vocabList}
            id="lesson12-vocab"
          />

          {/* Explanation & Aesthetics */}
          <ParagraphCard
            id="lesson12-explanation"
            title={explanation.title}
            text={explanation.text}
            notes={explanation.notes}
          />

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP1_QUIZZES['reading-12'] && (
            <InteractiveQuiz
              quizData={PREP1_QUIZZES['reading-12']}
              id="lesson12-quiz"
            />
          )}

          {/* Questions */}
          <QuestionsCard
            title="تدريبات وتذوق أدبي على النص"
            questions={questions}
            id="lesson12-questions"
          />

        </div>
      </div>
    </div>
  )
}
