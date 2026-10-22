'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Headphones, Award, BookOpen } from 'lucide-react'
import styles from '../../page.module.css'
import ParagraphCard from '../../components/ParagraphCard'
import VocabularySection from '../../components/VocabularySection'
import QuestionsCard from '../../components/QuestionsCard'
import InteractiveQuiz from '../../components/InteractiveQuiz'
import { PREP2_QUIZZES } from '../../data/prep2_quizzes'

export default function Lesson9() {
  const authorBio = {
    title: 'مَدْخَلٌ إِلَى نَصِّ الِاسْتِمَاعِ «إِنْسَانٌ أَمْ ظِلُّ إِنْسَانٍ؟»',
    text: 'نَصٌّ فِكْرِيٌّ وَإِنْسَانِيٌّ عَمِيقٌ لِلكَاتِبَةِ د. هَانِم أَحْمَد، يُنَاقِشُ مَفْهُومَ الإِنْسَانِيَّةِ الحَقِيقِيَّةِ فِي عَصْرِ الثَّوْرَةِ الرَّقْمِيَّةِ وَالمَادِّيَّةِ الطَّاغِيَةِ. يُحَذِّرُ النَّصُّ مِنِ اسْتِسْلَامِ المَرْءِ لِلآلِيَّةِ الجَامِدَةِ حَتَّى يَفْقِدَ رُوحَهُ وَضَمِيرَهُ، وَيَدْعُو لِإِحْيَاءِ قِيَمِ الرَّحْمَةِ، وَالتَّعَاطُفِ، وَالعَطَاءِ الَّتِي تُمَيِّزُ الإِنْسَانَ الحَقَّ عَنْ مُجَرَّدِ ظِلٍّ بَاهِتٍ لَا حَيَاةَ فِيهِ.'
  }

  const paragraphs = [
    {
      id: 'p1',
      title: '١- المَفْهُومُ الحَقِيقِيُّ لِلإِنْسَانِ وَخَطَرُ الجُمُودِ',
      text: `«لَيْسَ الإِنْسَانُ مُجَرَّدَ كِيَانٍ بَيُولُوجِيٍّ يَتَنَفَّسُ وَيَأْكُلُ وَيَتَحَرَّكُ فِي فَضَاءِ الحَيَاةِ، وَإِنَّمَا الإِنْسَانُ جَوْهَرٌ رُوحِيٌّ وَأَخْلَاقِيٌّ يَنْبِضُ بِالمَشَاعِرِ وَيَحْمِلُ أَمَانَةَ العِمَارَةِ وَالإِصْلَاحِ. فَإِذَا مَا تَجَرَّدَ المَرْءُ مِنْ ضَمِيرِهِ، وَتَبَلَّدَتْ عَوَاطِفُهُ تِجَاهَ آلاَمِ الآخَرِينَ، تَحَوَّلَ إِلَى شَبَحٍ يَمْشِي عَلَى الأَرْضِ، لَا يُقَدِّمُ خَيْراً، وَلَا يَشْعُرُ بِأَحَدٍ؛ لِيُصْبِحَ بِذَلِكَ مُجَرَّدَ ظِلٍّ لِإِنْسَانٍ.»`
    },
    {
      id: 'p2',
      title: '٢- وَهْمُ الِانْشِغَالِ فِي عَالَمِ الآلَاتِ وَالشَّاشَاتِ',
      text: `«فِي عَصْرِنَا الرَّقْمِيِّ المُتَسَارِعِ، غَرِقَ الكَثِيرُونَ فِي سَرَابِ الشَّاشَاتِ الزَّرْقَاءِ، وَاسْتَسْلَمُوا لِحَيَاةٍ اسْتِهْلَاكِيَّةٍ أَنْسَتْهُمْ أُنْسَ العَلَاقَاتِ الحَمِيمَةِ. تَرَاهُمْ يَسِيرُونَ فِي الطُّرُقَاتِ عُيُونُهُمْ شَاخِصَةٌ فِي هَوَاتِفِهِمْ، لَا يَسْمَعُونَ أَنَّةَ مُحْتَاجٍ، وَلَا يَرَوْنَ بَسْمَةَ طِفْلٍ، وَكَأَنَّهُمْ تَنَازَلُوا طَوْعاً عَنْ أَعَزِّ مَا يَمْلِكُونَ: الإِحْسَاسُ بِالأُخُوَّةِ الإِنْسَانِيَّةِ وَمُشَارَكَةُ النَّاسِ هُمُومَهُمْ.»`
    },
    {
      id: 'p3',
      title: '٣- سَبِيلُ النَّجَاةِ: إِحْيَاءُ الضَّمِيرِ وَالعَطَاءِ لِلآخَرِينَ',
      text: `«إِنَّ السَّبِيلَ لِأَنْ نَكُونَ بَشَراً حَقِيقِيِّينَ لَا ظِلَالاً مَائِلَةً، هُوَ أَنْ نَفْتَحَ قُلُوبَنَا لِلنُّورِ وَالرَّحْمَةِ؛ أَنْ نَمُدَّ يَدَ العَوْنِ لِلضَّعِيفِ، وَنَكُونَ عَوْناً لِلْمَكْرُوبِ، وَنَتَمَسَّكَ بِالمَبَادِئِ الَّتِي لَا تَبِيدُ. حِينَهَا فَقَطْ نَسْتَحِقُّ أَنْ نَحْمِلَ اسْمَ "الإِنْسَانِ" بِكُلِّ مَا فِيهِ مِنْ رِفْعَةٍ وَسُمُوٍّ؛ لِأَنَّ قِيمَةَ المَرْءِ تَقَاسُ بِعَطَائِهِ، لَا بِمَا يَجْنِيهِ لِنَفْسِهِ فَقَطْ.»`
    }
  ]

  const vocabList = [
    { word: 'جَوْهَر', meaning: 'أصل وحقيقة الشيء ومعدنه النفيس', plural: 'جَوَاهِر' },
    { word: 'تَبَلَّدَتْ', meaning: 'فقدت الإحساس وغلظت وقست', opposite: 'رقت وتأثرت' },
    { word: 'شَاخِصَة', meaning: 'ثابتة لا تطرف من شدة الانشغال' },
    { word: 'سَرَاب', meaning: 'ما يُرى كأنه ماء وليس بماء، والمراد: وهم وخداع' },
    { word: 'أَنَّة', meaning: 'صوت التوجع والألم', plural: 'أَنَّات' },
    { word: 'طَوْعاً', meaning: 'باختيار وإرادة ورضا', opposite: 'كرهاً وإجباراً' },
    { word: 'المَكْرُوب', meaning: 'المهموم والحزين المصاب بضيق' },
    { word: 'تَبِيدُ', meaning: 'تهلك وتفنى وتزول', opposite: 'تبقى وتخلد' }
  ]

  const questions = [
    {
      q: 'س1: متى يتحول الإنسان إلى «مجرد ظل إنسان» في رأي الكاتبة؟',
      a: 'حين يتجرد من ضميره الأخلاقي، وتتبلد مشاعره تجاه آلام الآخرين، وينغمس في الأنانية والمادية كالآلة الصماء.'
    },
    {
      q: 'س2: ما الخطر الذي تفرضه الشاشات الذكية على الروابط الإنسانية؟',
      a: 'تؤدي إلى العزلة الوجدانية، وتراجع التواصل الحقيقي بين أفراد الأسرة والمجتمع، وفقدان التعاطف الحي مع الضعفاء والمحتاجين.'
    },
    {
      q: 'س3: كيف يستعيد الإنسان جوهره الحقيقي ومكانته السامية؟',
      a: 'بإحياء الضمير، والتمسك بالقيم الأخلاقية، وتقديم العون والمحبة للمحتاجين، والتضحية من أجل خير المجتمع.'
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
                <Headphones size={18} />
                <span>نص استماع - الوحدة الثالثة (علم وقيم)</span>
              </div>
              <h1 className={styles.title}>إنسانٌ أم ظلُّ إنسان؟ (لـ د. هانم أحمد)</h1>
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
            <BookOpen size={24} /> فقرات نص الاستماع
          </h2>

          {/* Paragraphs */}
          {paragraphs.map((para) => (
            <ParagraphCard
              key={para.id}
              id={`lesson9-${para.id}`}
              title={para.title}
              text={para.text}
            />
          ))}

          {/* Vocabulary Section */}
          <VocabularySection
            title="معاني المفردات واللغويات (إنسان أم ظل إنسان؟)"
            vocabList={vocabList}
            id="lesson9-vocab"
          />

          {/* Interactive Multiple-Choice Quiz with Auto-Correction */}
          {PREP2_QUIZZES['reading-9'] && (
            <div id="quiz">
              <InteractiveQuiz
                quizData={PREP2_QUIZZES['reading-9']}
                id="lesson9-quiz"
              />
            </div>
          )}

          {/* Comprehension Questions */}
          <QuestionsCard
            title="تدريبات وأسئلة الفهم والمناقشة"
            questions={questions}
            id="lesson9-questions"
          />
        </div>
      </div>
    </div>
  )
}
