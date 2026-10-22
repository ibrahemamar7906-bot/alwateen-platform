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

export default function Lesson8() {
  const verses = [
    {
      sadr: 'أَجَلْ إِنَّ ذَا يَوْمٌ لَمَنْ يَفْتَدِي مِصْرَا',
      ajuz: 'فَمِصْرُ هِيَ المِحْرَابُ وَالجَنَّةُ الكُبْرَى'
    },
    {
      sadr: 'حَلَفْنَا نُوَلِّي وَجْهَنَا شَطْرَ حُبِّهَا',
      ajuz: 'وَنُنْفِدُ فِيهِ الصَّبْرَ وَالجَهْدَ وَالعُمْرَا'
    },
    {
      sadr: 'سَلَامًا شَبَابَ النَّيْلِ فِي كُلِّ مَوْقِفٍ',
      ajuz: 'عَلَى الدَّهْرِ يَجْنِي المَجْدَ أَوْ يَجْلِبُ الفَخْرَا'
    },
    {
      sadr: 'تَعَالَوْا نَقُلْ للصَّعْبِ أَهْلاً فَإِنَّنَا',
      ajuz: 'شَبَابٌ أَلِفْنَا الصَّعْبَ وَالمَطْلَبَ الوَعْرَا'
    },
    {
      sadr: 'شَبَابٌ إِذَا نَامَتْ عُيُونٌ فَإِنَّنَا',
      ajuz: 'بَكَرْنَا بُكُورَ الطَّيْرِ نَسْتَقْبِلُ الفَجْرَا'
    },
    {
      sadr: 'شَبَابٌ نَزَلْنَا حَوْمَةَ المَجْدِ كُلُّنَا',
      ajuz: 'وَمَنْ يَغْتَدِي لِلنَّصْرِ يَنْتَزِعُ النَّصْرَا'
    }
  ]

  const poetBio = {
    title: 'نُبْذَةٌ عَنِ الشَّاعِرِ د. إِبْرَاهِيم نَاجِي',
    text: 'طَبِيبٌ وَشَاعِرٌ مِصْرِيٌّ رَقِيقُ المَشَاعِرِ، وُلِدَ بِالقَاهِرَةِ عَامَ 1898م وَتُوُفِّيَ عَامَ 1953م. كَانَ مِنْ رُوَّادِ وَمُؤَسِّسِي مَدْرَسَةِ أَبُولُو الشِّعْرِيَّةِ. تَمَيَّزَ شِعْرُهُ بِالوَطَنِيَّةِ الصَّادِقَةِ وَالرُّومَانْسِيَّةِ العَذْبَةِ، وَاشْتُهِرَ بِدِيوَانِهِ "وَرَاءَ الغَمَامِ" وَقَصِيدَتِهِ الخَالِدَةِ "الأَطْلَالِ".'
  }

  const vocabList = [
    { word: 'أَجَلْ', meaning: 'حرف جواب بمعنى نعم للتوكيد والإقرار' },
    { word: 'يَفْتَدِي', meaning: 'يضحي بنفسه وماله من أجل رفعة وطنه' },
    { word: 'المِحْرَابُ', meaning: 'قبلة المسجد، والمراد: المكان المقدس الطاهر ذو القداسة العالية', plural: 'مَحَارِيب' },
    { word: 'شَطْرَ', meaning: 'تجاه وناحية وقِبلة', plural: 'أَشْطُر وشُطُور' },
    { word: 'نُنْفِدُ', meaning: 'نفني ونبذل حتى النهاية دون بخل', opposite: 'نبقي ونوفّر' },
    { word: 'أَلِفْنَا', meaning: 'اعتدنا وصار مألوفاً سهلاً لنا', opposite: 'استغربنا ونفرنا' },
    { word: 'الوَعْرَا', meaning: 'الشديد الصعب القاسي', opposite: 'السهل اللين' },
    { word: 'بَكَرْنَا', meaning: 'خرجنا في الصباح الباكر في أول النهار', opposite: 'تأخرنا وتكاسلنا' },
    { word: 'حَوْمَةَ', meaning: 'ساحة وميدان الصراع والجد والاجتهاد', plural: 'حَوْمَات' },
    { word: 'يَنْتَزِعُ', meaning: 'ينال وينتصر بالقوة والعزيمة والإصرار' }
  ]

  const explanation = {
    title: 'الشرح واللمحات البلاغية والجمالية',
    text: `١- قدسية الوطن والتضحية: ينادي الشاعر بأن هذا هو وقت الفداء الحقيقي لمصر، فهي المحراب المقدس والجنة التي تستحق بذل الأرواح.
٢- قسم الوفاء والبذل: يقسم الشباب على توجيه كل قلوبهم وطاقاتهم وجهدهم لبناء مصر واستنزاف كل طاقتهم في خدمتها.
٣- تحية لشباب النيل الأبطال: يوجه الشاعر تحية إجلال لشباب النيل الذين يقتحمون الصعاب ويألفون المشاق لصناعة المجد والرفعة.
٤- اليقظة والانتصار: شباب مصر لا يعرفون الكسل، بل يبكرون كأسراب الطيور فجراً، وينتزعون النصر بقوة إرادتهم وعلمهم.`,
    notes: '💡 التشبيه البلاغي: (مصر هي المحراب): تشبيه بليغ للوطن بمحراب العبادة يدل على قداسة حب مصر وعلو مكانتها في نفوس أبنائها.'
  }

  const questions = [
    {
      q: 'س1: إلامَ يدعو الشاعر إبراهيم ناجي الشباب في هذه القصيدة؟',
      a: 'يدعوهم إلى اليقظة والنشاط، والنهوض بالوطن، والعمل المخلص واقتحام الصعاب لصناعة غد مشرق يعيد لمصر مجدها.'
    },
    {
      q: 'س2: ما الجمال في قول الشاعر: "تعالوا نقل للصعب أهلاً"؟',
      a: 'تصوير للصعب والشدائد بضيف مرحب به يواجهه الشباب بشجاعة وبسالة دون خوف أو تردد.'
    },
    {
      q: 'س3: ما دلالة التعبير بـ "بكرنا بكور الطير نستقبل الفجرا"؟',
      a: 'يدل على النشاط المبكر والعزيمة المتوقدة والأمل الدائم في استقبال المستقبل المشرق.'
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
                <span>نص شعري - الوحدة الثانية (أصنع مستقبلي)</span>
              </div>
              <h1 className={styles.title}>شباب اليوم.. صناع الغد (شعر: إبراهيم ناجي)</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          
          {/* Poet Bio */}
          <ParagraphCard
            id="lesson8-bio"
            title={poetBio.title}
            text={poetBio.text}
          />

          {/* Poetry Verses with Audio Recitation */}
          <PoetrySection
            title="قصيدة شباب اليوم.. صناع الغد"
            poet="د. إبراهيم ناجي"
            verses={verses}
            id="lesson8-poem"
          />

          {/* Vocabulary Section */}
          <VocabularySection
            title="معاني المفردات واللغويات (نص شباب اليوم)"
            vocabList={vocabList}
            id="lesson8-vocab"
          />

          {/* Explanation & Aesthetics */}
          <ParagraphCard
            id="lesson8-explanation"
            title={explanation.title}
            text={explanation.text}
            notes={explanation.notes}
          />

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP1_QUIZZES['reading-8'] && (
            <InteractiveQuiz
              quizData={PREP1_QUIZZES['reading-8']}
              id="lesson8-quiz"
            />
          )}

          {/* Questions */}
          <QuestionsCard
            title="تدريبات وتذوق أدبي على النص"
            questions={questions}
            id="lesson8-questions"
          />

        </div>
      </div>
    </div>
  )
}
