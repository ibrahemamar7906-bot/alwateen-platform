'use client';

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowRight, Clock, BookOpen, Shield, Sun, Moon, CheckCircle2, RotateCcw } from 'lucide-react';
import styles from './page.module.css';

const azkarData = [
  {
    id: 'g1',
    title: 'آية الكرسي',
    count: 1,
    text: 'اللّهُ لاَ إِلَـهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ لاَ تَأْخُذُهُ سِنَةٌ وَلاَ نَوْمٌ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الأَرْضِ مَن ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلاَّ بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلاَ يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلاَّ بِمَا شَاء وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالأَرْضَ وَلاَ يَؤُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    evidence: 'عن أُبي بن كعب رضي الله عنه، أن النبي ﷺ قال عن آية الكرسي: «من قالها حين يمسي أُجير منا حتى يُصبح، ومن قالها حين يُصبح أُجير منا حتى يُمسي». (رواه الحاكم وصححه الألباني).'
  },
  {
    id: 'g2',
    title: 'سورة الإخلاص والمعوذتين',
    count: 3,
    text: 'بِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\nقُلْ هُوَ ٱللَّهُ أَحَدٌ، ٱللَّهُ ٱلصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌ.\n\nبِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\nقُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ، مِن شَرِّ مَا خَلَقَ، وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ، وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ، وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ.\n\nبِسْمِ اللهِ الرَّحْمنِ الرَّحِيم\nقُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ، مَلِكِ ٱلنَّاسِ، إِلَٰهِ ٱلنَّاسِ، مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ، ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ، مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ.',
    evidence: 'عن عبد الله بن خبيب رضي الله عنه قال: قال لي رسول الله ﷺ: «قل هو الله أحد والمعوذتين حين تمسي وحين تصبح ثلاث مرات تكفيك من كل شيء». (رواه أبو داود والترمذي).'
  },
  {
    id: 'g3',
    title: 'سيد الاستغفار',
    count: 1,
    text: 'اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي؛ فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلا أَنْتَ.',
    evidence: 'عن شداد بن أوس رضي الله عنه أن النبي ﷺ قال: «من قالها من النهار موقنًا بها فمات من يومه قبل أن يمسي فهو من أهل الجنة، ومن قالها من الليل وهو موقن بها فمات قبل أن يصبح فهو من أهل الجنة». (رواه البخاري).'
  },
  {
    id: 'g4',
    title: 'دعاء الملك والحمد',
    count: 1,
    variations: {
      morning: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ لا إِلَهَ إِلا اللَّهُ، وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.',
      evening: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ لا إِلَهَ إِلا اللَّهُ، وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.'
    },
    evidence: 'عن عبد الله بن مسعود رضي الله عنه، عن النبي ﷺ. (رواه مسلم).'
  },
  {
    id: 'g5',
    title: 'دعاء الحياة والموت',
    count: 1,
    variations: {
      morning: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.',
      evening: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.'
    },
    evidence: 'عن أبي هريرة رضي الله عنه، عن النبي ﷺ. (رواه الترمذي وقال حديث حسن).'
  },
  {
    id: 'g6',
    title: 'دعاء الحفظ من الضر',
    count: 3,
    text: 'بِسْمِ اللَّهِ الَّذِي لا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ.',
    evidence: 'عن عثمان بن عفان رضي الله عنه قال: قال رسول الله ﷺ: «ما من عبد يقول في صباح كل يوم ومساء كل ليلة: بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء وهو السميع العليم ثلاث مرات لم يضره شيء». (رواه أبو داود والترمذي).'
  },
  {
    id: 'g7',
    title: 'إعلان الرضا',
    count: 3,
    text: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا.',
    evidence: 'عن ثوبان رضي الله عنه أن رسول الله ﷺ قال: «من قال حين يمسي وحين يصبح: رضيت بالله رباً وبالإسلام ديناً وبمحمد نبياً، كان حقاً على الله أن يرضيه». (رواه أبو داود والترمذي).'
  },
  {
    id: 'g8',
    title: 'دعاء العافية في الدنيا والآخرة',
    count: 1,
    text: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ وَمِنْ خَلْفِي وَعَنْ يَمِينِي وَعَنْ شِمَالِي وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي.',
    evidence: 'عن عبد الله بن عمر رضي الله عنهما قال: «لم يكن رسول الله ﷺ يدع هؤلاء الدعوات حين يمسي وحين يصبح». (رواه أبو داود وابن ماجه).'
  },
  {
    id: 'g9',
    title: 'دعاء التوكل والكفاية',
    count: 7,
    text: 'حَسْبِيَ اللَّهُ لا إِلَهَ إِلا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ.',
    evidence: 'عن أبي الدرداء رضي الله عنه عن النبي ﷺ: «من قال إذا أصبح وإذا أمسى: حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم سبع مرات، كفاه الله ما أهمه صادقاً كان أو كاذباً». (رواه أبو داود).'
  },
  {
    id: 'g10',
    title: 'دعاء العافية في البدن',
    count: 3,
    text: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لا إِلَهَ إِلا أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، لا إِلَهَ إِلا أَنْتَ.',
    evidence: 'عن عبد الرحمن بن أبي بكرة أنه قال لأبيه: يا أبتِ، إني أسمعك تدعو كل غداة: اللهم عافني في بدني، اللهم عافني في سمعي، اللهم عافني في بصري، لا إله إلا أنت... (رواه أبو داود وأحمد).'
  },
  {
    id: 'g11',
    title: 'دعاء الاستغاثة برحمة الله',
    count: 1,
    text: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.',
    evidence: 'عن أنس بن مالك رضي الله عنه قال: قال رسول الله ﷺ لفاطمة: «ما يمنعك أن تسمعي ما أوصيك به، أن تقولي إذا أصبحت وإذا أمسيت: يا حي يا قيوم برحمتك أستغيث...». (رواه الحاكم والنسائي).'
  },
  {
    id: 'g12',
    title: 'دعاء فاطر السماوات والأرض',
    count: 1,
    text: 'اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، فَاطِرَ السَّمَاوَاتِ وَالأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لا إِلَهَ إِلا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءًا أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ.',
    evidence: 'حديث أبي بكر الصديق رضي الله عنه حين سأل النبي ﷺ عن كلمات يقولهن إذا أصبح وإذا أمسى. (رواه أبو داود والترمذي).'
  },
  {
    id: 'g13',
    title: 'التسبيح والتحميد',
    count: 100,
    text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.',
    evidence: 'عن أبي هريرة رضي الله عنه قال: قال رسول الله ﷺ: «من قال حين يصبح وحين يمسي: سبحان الله وبحمده، مائة مرة، لم يأت أحد يوم القيامة بأفضل مما جاء به، إلا أحد قال مثل ما قال أو زاد عليه». (رواه مسلم).'
  },
  {
    id: 'g14',
    title: 'التهليل',
    count: 10,
    text: 'لا إِلَهَ إِلا اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',
    evidence: 'عن أبي أيوب الأنصاري رضي الله عنه عن النبي ﷺ قال: «من قالها عشر مرات كان كمن أعتق أربعة أنفس من ولد إسماعيل» (رواه مسلم). (ويُستحب 100 مرة في الصباح).'
  }
];

const specificAzkar = {
  morning: [
    {
      id: 'm1',
      title: 'دعاء الفطرة',
      count: 1,
      text: 'أَصْبَحْنَا عَلَى فِطْرَةِ الإِسْلامِ، وَعَلَى كَلِمَةِ الإِخْلاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ.',
      evidence: '(رواه أحمد)'
    },
    {
      id: 'm2',
      title: 'تسبيح جويرية',
      count: 3,
      text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ.',
      evidence: '(حديث جويرية رواه مسلم)'
    }
  ],
  evening: [
    {
      id: 'e1',
      title: 'دعاء الفطرة',
      count: 1,
      text: 'أَمْسَيْنَا عَلَى فِطْرَةِ الإِسْلامِ، وَعَلَى كَلِمَةِ الإِخْلاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ حَنِيفًا مُسْلِمًا وَمَا كَانَ مِنَ الْمُشْرِكِينَ.',
      evidence: '(رواه أحمد)'
    },
    {
      id: 'e2',
      title: 'الاستعاذة بكلمات الله',
      count: 3,
      text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.',
      evidence: '(رواه مسلم)'
    }
  ]
};

// Combine all azkar for initial state tracking
const allAzkar = [
  ...azkarData,
  ...specificAzkar.morning,
  ...specificAzkar.evening
];

export default function AzkarPage() {
  // State to track remaining counts for each Zekr
  const [counts, setCounts] = useState(() => {
    const initialCounts = {};
    allAzkar.forEach(z => {
      initialCounts[z.id] = z.count;
    });
    return initialCounts;
  });

  const handleDecrement = (id) => {
    setCounts(prev => {
      const current = prev[id];
      if (current > 0) {
        // Optional: play a subtle click sound
        try {
          const audio = new Audio('/click.mp3');
          audio.volume = 0.2;
          audio.play().catch(e => console.log('Audio play blocked:', e));
        } catch (e) {}
        
        return { ...prev, [id]: current - 1 };
      }
      return prev;
    });
  };

  const handleReset = () => {
    const resetCounts = {};
    allAzkar.forEach(z => {
      resetCounts[z.id] = z.count;
    });
    setCounts(resetCounts);
  };

  const ZekrComponent = ({ zekr, type = 'general' }) => {
    const remaining = counts[zekr.id];
    const isCompleted = remaining === 0;

    let borderStyle = '1px solid #e2e8f0';
    if (type === 'morning') borderStyle = '4px solid #f59e0b';
    if (type === 'evening') borderStyle = '4px solid #6366f1';

    return (
      <div 
        className={`${styles.zekrCard} ${isCompleted ? styles.completedCard : ''}`} 
        style={{ 
          borderRight: type !== 'general' ? borderStyle.split(' ')[2] : undefined,
          borderRightWidth: type !== 'general' ? '4px' : undefined,
          borderRightStyle: type !== 'general' ? 'solid' : undefined,
          opacity: isCompleted ? 0.6 : 1,
          cursor: isCompleted ? 'default' : 'pointer',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={() => handleDecrement(zekr.id)}
      >
        <div className={styles.zekrHeader}>
          <div className={styles.zekrTitle} style={{ textDecoration: isCompleted ? 'line-through' : 'none' }}>
            <span style={{ color: '#10b981', fontSize: '1.5rem', marginLeft: '5px' }}>•</span> {zekr.title}
          </div>
          
          <div className={`${styles.counterBadge} ${isCompleted ? styles.counterBadgeDone : ''}`}>
            {isCompleted ? (
              <><CheckCircle2 size={18} style={{marginLeft: '5px'}}/> اكتمل</>
            ) : (
              <>المتبقي: <span className={styles.counterNumber}>{remaining}</span></>
            )}
          </div>
        </div>

        {zekr.text ? (
          <div className={styles.zekrText} style={{ whiteSpace: 'pre-line' }}>{zekr.text}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
            <div className={styles.zekrVariation}>
              <div className={styles.variationTitle}><Sun size={14} style={{ display: 'inline', marginLeft: '4px' }}/> في الصباح:</div>
              <div className={styles.zekrText} style={{ marginBottom: 0 }}>{zekr.variations.morning}</div>
            </div>
            <div className={styles.zekrVariation} style={{ background: '#eef2ff' }}>
              <div className={styles.variationTitle} style={{ color: '#4f46e5' }}><Moon size={14} style={{ display: 'inline', marginLeft: '4px' }}/> في المساء:</div>
              <div className={styles.zekrText} style={{ marginBottom: 0 }}>{zekr.variations.evening}</div>
            </div>
          </div>
        )}

        <div className={styles.zekrEvidence}>
          <strong>الدليل: </strong> {zekr.evidence}
        </div>
        
        {!isCompleted && (
          <div className={styles.tapOverlay}>
            انقر للعد
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.azkarContainer}>
      <Head>
        <title>الأذكار - الدليل الشامل لأذكار الصباح والمساء</title>
        <meta name="description" content="الدليل الشامل لأذكار الصباح والمساء، متضمناً الأوقات الصحيحة، نصوص الأذكار، أعدادها، والأدلة الشرعية." />
      </Head>

      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
          <Link href="/" className={styles.backBtn} style={{ position: 'static' }}>
            الرئيسية <ArrowRight size={18} />
          </Link>
          <button onClick={handleReset} className={styles.resetBtn}>
            <RotateCcw size={18} /> تصفير العداد
          </button>
        </div>
        
        <h1 className={styles.title} style={{ marginTop: '20px' }}>الأذكار</h1>
        <p className={styles.subtitle}>
          الدليل الشامل لأذكار الصباح والمساء.
          <br />
          <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>(انقر على الذكر لإنقاص العداد)</span>
        </p>
      </header>

      <div className={styles.contentWrapper}>
        <section className={styles.sectionBox}>
          <h2 className={styles.sectionTitle}>
            <Clock size={24} />
            أولاً: وقت أذكار الصباح والمساء
          </h2>
          <p style={{ marginBottom: '20px', color: '#475569', lineHeight: '1.6' }}>
            اختلف العلماء في تحديد وقت الأذكار بدقة، ولكن الرأي الراجح والمُعتمد عند جمهور العلماء هو:
          </p>
          
          <div className={styles.timingInfo}>
            <div className={styles.timingCard}>
              <div className={styles.timingTitle}><Sun size={18} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '5px' }} /> وقت أذكار الصباح:</div>
              <p>يبدأ من <strong>طلوع الفجر</strong> وينتهي بـ <strong>طلوع الشمس</strong>. (ومن فاته هذا الوقت يمكنه قراءتها إلى ما قبل صلاة الظهر).</p>
            </div>
            <div className={styles.timingCard} style={{ borderRightColor: '#6366f1' }}>
              <div className={styles.timingTitle} style={{ color: '#4f46e5' }}><Moon size={18} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '5px' }} /> وقت أذكار المساء:</div>
              <p>يبدأ من <strong>وقت صلاة العصر</strong> وينتهي بـ <strong>غروب الشمس</strong>. (ومن فاته الوقت يمكنه قراءتها إلى ثلث الليل الأول).</p>
            </div>
          </div>

          <div className={styles.quranQuote}>
            ﴿وَسَبِّحْ بِحَمْدِ رَبِّكَ قَبْلَ طُلُوعِ الشَّمْسِ وَقَبْلَ الْغُرُوبِ﴾
            <div style={{ fontSize: '0.9rem', marginTop: '10px', opacity: 0.8 }}>[ق: 39]</div>
          </div>
        </section>

        <section className={styles.sectionBox} style={{ background: 'transparent', boxShadow: 'none', border: 'none', padding: 0 }}>
          <h2 className={styles.sectionTitle} style={{ padding: '0 20px' }}>
            <BookOpen size={24} />
            ثانياً: الأذكار الشاملة (للصباح والمساء)
          </h2>
          
          {azkarData.map((zekr) => (
            <ZekrComponent key={zekr.id} zekr={zekr} type="general" />
          ))}
        </section>

        <section className={styles.sectionBox} style={{ background: 'transparent', boxShadow: 'none', border: 'none', padding: 0 }}>
          <h2 className={styles.sectionTitle} style={{ padding: '0 20px', color: '#b45309', borderBottomColor: '#fef3c7' }}>
            <Sun size={24} />
            أذكار خاصة بالصباح فقط
          </h2>
          
          {specificAzkar.morning.map((zekr) => (
            <ZekrComponent key={zekr.id} zekr={zekr} type="morning" />
          ))}
        </section>

        <section className={styles.sectionBox} style={{ background: 'transparent', boxShadow: 'none', border: 'none', padding: 0 }}>
          <h2 className={styles.sectionTitle} style={{ padding: '0 20px', color: '#4338ca', borderBottomColor: '#e0e7ff' }}>
            <Moon size={24} />
            أذكار خاصة بالمساء فقط
          </h2>
          
          {specificAzkar.evening.map((zekr) => (
            <ZekrComponent key={zekr.id} zekr={zekr} type="evening" />
          ))}
        </section>
      </div>
    </div>
  );
}
