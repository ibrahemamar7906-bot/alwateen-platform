'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Volume2, Play, BookOpen, Sparkles } from 'lucide-react'
import { playTTS } from '../../../utils/tts'

function StorybookContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const subject = searchParams.get('subject') || 'arabic'

  const arabicStories = [
    {
      title: 'الأسد والفأر',
      content: 'فِي يَوْمٍ مِنَ الْأَيَّامِ كَانَ أَسَدٌ نَائِمًا فَجَاءَ فَأْرٌ صَغِيرٌ وَبَدَأَ يَلْعَبُ فَوْقَهُ. اسْتَيْقَظَ الْأَسَدُ غَاضِبًا وَأَمْسَكَ بِالْفَأْرِ. قَالَ الْفَأْرُ: أَرْجُوكَ سَامِحْنِي قَدْ أُسَاعِدُكَ يَوْمًا مَا. ضَحِكَ الْأَسَدُ وَتَرَكَهُ. وَفِي يَوْمٍ وَقَعَ الْأَسَدُ فِي شَبَكَةِ صَيَّادٍ، فَجَاءَ الْفَأْرُ وَقَضَمَ الشَّبَكَةَ وَأَنْقَذَ الْأَسَدَ.',
      image: '🦁 🐭',
      moral: 'الصغير قد يقدم عوناً كبيراً!'
    },
    {
      title: 'السلحفاة والأرنب',
      content: 'تَحَدَّى الْأَرْنَبُ السُّلَحْفَاةَ فِي سِبَاقٍ. كَانَ الْأَرْنَبُ سَرِيعًا جِدًّا، فَسَبَقَهَا لَكِنَّهُ قَرَّرَ أَنْ يَنَامَ قَلِيلًا. أَمَّا السُّلَحْفَاةُ الْبَطِيئَةُ فَلَمْ تَتَوَقَّفْ عَنِ الْمَشْيِ. حِينَ اسْتَيْقَظَ الْأَرْنَبُ وَجَدَ السُّلَحْفَاةَ قَدْ فَازَتْ بِالسِّبَاقِ لِأَنَّهَا لَمْ تَسْتَسْلِمْ.',
      image: '🐢 🐇',
      moral: 'المثابرة وعدم الاستسلام سر الفوز!'
    },
    {
      title: 'الغراب العطشان',
      content: 'كَانَ هُنَاكَ غُرَابٌ يَشْعُرُ بِالْعَطَشِ الشَّدِيدِ فِي يَوْمٍ حَارٍّ. بَحَثَ عَنِ الْمَاءِ حَتَّى وَجَدَ جَرَّةً بِهَا قَلِيلٌ مِنَ الْمَاءِ فِي الْقَاعِ، لَكِنَّ مِنْقَارَهُ لَمْ يَصِلْ إِلَيْهِ. فَكَّرَ الْغُرَابُ بِذَكَاءٍ وَبَدَأَ يُلْقِي الْحِجَارَةَ الصَّغِيرَةَ دَاخِلَ الْجَرَّةِ. ارْتَفَعَ الْمَاءُ إِلَى أَعْلَى، فَشَرِبَ الْغُرَابُ حَتَّى ارْتَوَى.',
      image: '🐦 💧',
      moral: 'الذكاء والتفكير يحلان أصعب المشكلات!'
    },
    {
      title: 'الكلب الطماع',
      content: 'سَرَقَ كَلْبٌ قِطْعَةَ لَحْمٍ كَبِيرَةً وَهَرَبَ بِهَا. وَبَيْنَمَا كَانَ يَعْبُرُ جِسْرًا فَوْقَ نَهْرٍ، نَظَرَ إِلَى الْمَاءِ فَرَأَى ظِلَّهُ. ظَنَّ أَنَّهُ كَلْبٌ آخَرُ يَحْمِلُ قِطْعَةَ لَحْمٍ أَكْبَرَ. نَبَحَ الْكَلْبُ لِيَأْخُذَ اللَّحْمَ الْآخَرَ، فَسَقَطَتْ قِطْعَتُهُ فِي الْمَاءِ، وَخَسِرَ طَعَامَهُ بِسَبَبِ الطَّمَعِ.',
      image: '🐶 🥩',
      moral: 'القناعة كنز، والطمع يضيع ما تملك!'
    },
    {
      title: 'النملة والصرصور',
      content: 'فِي الصَّيْفِ، كَانَتِ النَّمْلَةُ تَعْمَلُ بِجِدٍّ لِتَجْمَعَ الطَّعَامَ لِفَصْلِ الشِّتَاءِ، بَيْنَمَا كَانَ الصُّرْصُورُ يَلْعَبُ وَيُغَنِّي. جَاءَ الشِّتَاءُ الْبَارِدُ، فَلَمْ يَجِدِ الصُّرْصُورُ مَا يَأْكُلُهُ. ذَهَبَ إِلَى النَّمْلَةِ يَطْلُبُ الطَّعَامَ. أَعْطَتْهُ النَّمْلَةُ بَعْضَ الْحَبَّاتِ، فَتَعَلَّمَ الصُّرْصُورُ أَنَّ الْعَمَلَ الْجَادَّ مُهِمٌّ.',
      image: '🐜 🦗',
      moral: 'العمل والاجتهاد في وقتهما يحميان مستقبلك!'
    }
  ]

  const englishStories = [
    {
      title: 'The Lion and the Mouse',
      content: 'A lion was sleeping. A small mouse started playing on him. The lion woke up angry and caught the mouse. The mouse said: Please forgive me, I might help you one day. The lion laughed and let him go. One day, the lion was caught in a hunter net. The mouse came and bit the net and saved the lion.',
      image: '🦁 🐭',
      moral: 'Even small friends can be of great help!'
    },
    {
      title: 'The Tortoise and the Hare',
      content: 'The hare challenged the tortoise to a race. The hare was very fast, so he decided to sleep a little. But the slow tortoise did not stop walking. When the hare woke up, he found the tortoise had won the race because she did not give up.',
      image: '🐢 🐇',
      moral: 'Slow and steady wins the race!'
    },
    {
      title: 'The Thirsty Crow',
      content: 'A thirsty crow found a pitcher with a little water at the bottom. His beak could not reach it. The clever crow started dropping small stones into the pitcher. The water rose to the top, and the crow drank until he was full.',
      image: '🐦 💧',
      moral: 'Where there is a will, there is a way!'
    }
  ]

  const mathStories = [
    {
      title: 'أحمد والتفاحات (الجمع)',
      content: 'كان مع أحمد 3 تفاحات. أعطته أمه تفاحتين. كم تفاحة أصبح مع أحمد الآن؟ 3 زائد 2 يساوي 5 تفاحات. أحمد سعيد جداً بتفاحاته اللذيذة.',
      image: '🍎 👦',
      moral: 'الجمع يزيد أعداد الأشياء الجميلة!'
    },
    {
      title: 'العصافير على الشجرة (الطرح)',
      content: 'كان هناك 5 عصافير تقف على الشجرة. طار منها عصفوران. كم عصفوراً بقي على الشجرة؟ 5 ناقص 2 يساوي 3 عصافير.',
      image: '🐦 🌳',
      moral: 'الطرح يخبرنا كم تبقى معنا!'
    },
    {
      title: 'ليلى والبالونات (الجمع)',
      content: 'اشترت ليلى 4 بالونات حمراء و 3 بالونات زرقاء. كم عدد البالونات التي اشترتها ليلى؟ 4 زائد 3 يساوي 7 بالونات.',
      image: '🎈 👧',
      moral: 'نجمع الألوان لنحصل على المجموع الكلي!'
    }
  ]

  let stories = arabicStories
  if (subject === 'english') stories = englishStories
  if (subject === 'math') stories = mathStories

  const [currentStory, setCurrentStory] = useState(0)
  const [activeWordIdx, setActiveWordIdx] = useState(null)

  const speakText = (text, rate = 0.88) => {
    if (!text) return
    const isAr = subject !== 'english'
    playTTS(text, { isArabic: isAr, rate })
  }

  const playWord = (word, idx) => {
    setActiveWordIdx(idx)
    speakText(word, 0.8)
  }

  const playFullStory = () => {
    speakText(stories[currentStory].content, 0.85)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'radial-gradient(circle at 10% 20%, #d1fae5 0%, #ecfdf5 45%, #f0fdf4 100%)',
      padding: 'clamp(14px, 3vw, 36px)',
      paddingBottom: 'calc(clamp(24px, 5vw, 48px) + env(safe-area-inset-bottom, 0px))',
      fontFamily: 'Tajawal, -apple-system, BlinkMacSystemFont, sans-serif',
      direction: subject === 'english' ? 'ltr' : 'rtl',
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          padding: '12px 20px',
          boxShadow: '0 6px 20px rgba(5, 150, 105, 0.06)',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <button 
            onClick={() => router.back()} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              background: 'rgba(5, 150, 105, 0.08)',
              color: '#065f46',
              border: '1px solid rgba(5, 150, 105, 0.2)',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              minHeight: '40px'
            }}
          >
            <ArrowRight size={16} style={{ transform: subject === 'english' ? 'rotate(180deg)' : 'none' }} />
            <span>{subject === 'english' ? 'Back' : 'العودة'}</span>
          </button>

          <h1 style={{ margin: 0, fontSize: 'clamp(1.1rem, 3.5vw, 1.5rem)', fontWeight: 900, color: '#064e3b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📖</span>
            <span>{subject === 'english' ? 'Interactive Storybook' : subject === 'math' ? 'القصص الرقمية المسلية' : 'القصص التفاعلية الناطقة'}</span>
          </h1>

          <button 
            onClick={playFullStory} 
            title={subject === 'english' ? 'Listen to full story' : 'الاستماع للقصة كاملة'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              background: 'linear-gradient(135deg, #059669, #10b981)',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.9rem',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
              fontFamily: 'inherit',
              minHeight: '40px'
            }}
          >
            <Volume2 size={18} />
            <span>{subject === 'english' ? 'Listen' : 'قراءة القصة'}</span>
          </button>
        </header>

        {/* Stories Horizontal Selector Chips */}
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          padding: '4px 2px 10px',
          WebkitOverflowScrolling: 'touch',
        }}>
          {stories.map((s, idx) => (
            <button 
              key={idx}
              onClick={() => { setCurrentStory(idx); setActiveWordIdx(null) }}
              style={{
                padding: '8px 18px',
                background: currentStory === idx ? 'linear-gradient(135deg, #059669, #10b981)' : 'rgba(255, 255, 255, 0.9)',
                color: currentStory === idx ? 'white' : '#334155',
                border: currentStory === idx ? 'none' : '1px solid rgba(5, 150, 105, 0.2)',
                borderRadius: '50px',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.88rem',
                whiteSpace: 'nowrap',
                boxShadow: currentStory === idx ? '0 4px 12px rgba(5, 150, 105, 0.25)' : '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
              }}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Story Reading Card */}
        <main style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          border: '1.5px solid rgba(255, 255, 255, 0.95)',
          padding: 'clamp(20px, 4vw, 36px)',
          borderRadius: '28px',
          boxShadow: '0 10px 30px rgba(5, 150, 105, 0.08)',
          textAlign: 'center'
        }}>
          
          {/* Animated Big Illustration */}
          <div style={{
            fontSize: 'clamp(3.5rem, 9vw, 5rem)',
            marginBottom: '16px',
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))'
          }}>
            {stories[currentStory].image}
          </div>

          <h2 style={{
            fontSize: 'clamp(1.4rem, 4vw, 2.2rem)',
            color: '#064e3b',
            fontWeight: 900,
            marginBottom: '24px',
            margin: '0 0 20px 0'
          }}>
            {stories[currentStory].title}
          </h2>
          
          {/* Interactive Word Reading Cloud */}
          <div style={{
            lineHeight: '2.4',
            textAlign: 'justify',
            background: 'rgba(240, 253, 244, 0.4)',
            padding: 'clamp(16px, 3vw, 28px)',
            borderRadius: '22px',
            border: '1px solid rgba(5, 150, 105, 0.15)',
            marginBottom: '20px'
          }}>
            {stories[currentStory].content.split(' ').map((word, idx) => (
              <span 
                key={idx} 
                onClick={() => playWord(word, idx)}
                style={{
                  display: 'inline-block',
                  fontSize: 'clamp(1.15rem, 3.2vw, 1.6rem)',
                  margin: '0 5px',
                  color: activeWordIdx === idx ? '#059669' : '#1e293b',
                  fontWeight: activeWordIdx === idx ? 900 : 700,
                  cursor: 'pointer',
                  padding: '3px 8px',
                  borderRadius: '8px',
                  background: activeWordIdx === idx ? '#d1fae5' : 'transparent',
                  transition: 'all 0.15s ease',
                  userSelect: 'none'
                }}
              >
                {word}
              </span>
            ))}
          </div>
          
          {/* Moral or Educational Takeaway */}
          {stories[currentStory].moral && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(16, 185, 129, 0.05))',
              border: '1px solid rgba(5, 150, 105, 0.25)',
              borderRadius: '16px',
              padding: '12px 18px',
              color: '#065f46',
              fontWeight: 800,
              fontSize: 'clamp(0.85rem, 2.2vw, 1rem)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto 12px'
            }}>
              <Sparkles size={16} />
              <span>{subject === 'english' ? `Moral: ${stories[currentStory].moral}` : `العبرة من القصة: ${stories[currentStory].moral}`}</span>
            </div>
          )}

          <p style={{ marginTop: '12px', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
            {subject === 'english' ? '💡 Tap any word to hear its pronunciation!' : '💡 اضغط على أي كلمة للاستماع لنطقها الصوتي الصحيح!'}
          </p>
        </main>
      </div>
    </div>
  )
}

export default function Storybook() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal, sans-serif' }}>
        <p style={{ color: '#059669', fontWeight: 800 }}>جاري تحميل القصص التفاعلية... 📖</p>
      </div>
    }>
      <StorybookContent />
    </Suspense>
  )
}
