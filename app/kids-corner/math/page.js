'use client'
import { useRouter } from 'next/navigation'
import ToolsPage from '../components/ToolsPage'

const TOOLS = [
  { icon: '🗺️', title: 'مسار التأسيس بالعربي',    path: '/kids-corner/pathway?subject=math',              desc: 'تعلم الحساب خطوة بخطوة بالعربية', category: 'pathway' },
  { icon: '🗺️', title: 'Smart Math Pathway',       path: '/kids-corner/pathway?subject=math_en',           desc: 'Step-by-step Math Learning in English', category: 'pathway' },
  { icon: '🧮', title: 'أكاديمية الحساب',           path: '/kids-corner/math-training',                     desc: 'تدرب على العمليات الحسابية والسرعة', category: 'games' },
  { icon: '✍️', title: 'السبورة (أرقام عربي)',      path: '/kids-corner/tracing?subject=math-ar',           desc: 'تدرب على كتابة الأرقام ١،٢،٣', category: 'writing' },
  { icon: '✍️', title: 'Whiteboard (Numbers EN)',   path: '/kids-corner/tracing?subject=math-en',           desc: 'Practice writing 1, 2, 3 in English', category: 'writing' },
  { icon: '🔢', title: 'مختبر الأرقام',              path: '/kids-corner/math-lab',                          desc: 'تعلم الجمع والعد بطريقة ممتعة', category: 'games' },
  { icon: '🎨', title: 'عالم الألوان والأشكال',      path: '/kids-corner/shapes',                            desc: 'تلوين الأشكال وتعلم الألوان', category: 'writing' },
  { icon: '🔊', title: 'الأرقام الناطقة',             path: '/kids-corner/talking-numbers?lang=ar',           desc: 'الأرقام من ١ إلى ١٠٠ مع نطق صوتي', category: 'audio' },
  { icon: '🚂', title: 'قطار الأرقام',               path: '/kids-corner/train?subject=math',                desc: 'اسحب الرقم لإكمال السلسلة الصحيحة', category: 'games' },
  { icon: '🧠', title: 'تحدي الذاكرة',              path: '/kids-corner/memory?subject=math',               desc: 'طابق بطاقات الأرقام المتشابهة', category: 'games' },
  { icon: '🎈', title: 'بالونات الأرقام',            path: '/kids-corner/balloons?subject=math',             desc: 'فرقع بالون الرقم الصحيح', category: 'games' },
  { icon: '🧩', title: 'ترتيب الأرقام',              path: '/kids-corner/puzzle?subject=math',               desc: 'رتب الأرقام والمعادلات', category: 'games' },
  { icon: '🎮', title: 'ماريو الأرقام',              path: '/kids-corner/games/mario?subject=math',          desc: 'مغامرة ماريو مع العمليات الحسابية', category: 'games' },
  { icon: '🚀', title: 'حرب الأرقام',               path: '/kids-corner/games/tank-battle?subject=math',    desc: 'معركة الدبابات السريعة في الحساب', category: 'games' },
  { icon: '🚆', title: 'صب واي الأرقام',            path: '/kids-corner/games/subway?subject=math',         desc: 'اركض وتفادى القطار بالإجابة الصحيحة', category: 'games' },
]

export default function MathCorner() {
  const router = useRouter()
  return (
    <ToolsPage
      title="تأسيس الحساب والرياضيات"
      emoji="🔢"
      subtitle="العب وتحدَّ واكتشف عالم الأرقام والحساب السحري!"
      tools={TOOLS}
      onBack={() => router.push('/kids-corner')}
    />
  )
}
