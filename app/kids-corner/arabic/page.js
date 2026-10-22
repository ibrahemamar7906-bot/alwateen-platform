'use client'
import { useRouter } from 'next/navigation'
import ToolsPage from '../components/ToolsPage'

const TOOLS = [
  { icon: '🗺️', title: 'مسار التأسيس الذكي',   path: '/kids-corner/pathway?subject=arabic',              desc: 'رحلة تعلم متدرجة وتفاعلية خطوة بخطوة', category: 'pathway' },
  { icon: '✍️', title: 'السبورة السحرية',        path: '/kids-corner/tracing',                             desc: 'تعلم كتابة الحروف العربية وتتبعها', category: 'writing' },
  { icon: '🚂', title: 'قطار الكلمات',            path: '/kids-corner/train',                               desc: 'اسحب الحروف لتكوين كلمات ممتعة', category: 'games' },
  { icon: '🔊', title: 'البطاقات الناطقة',        path: '/kids-corner/flashcards',                          desc: 'تعلم نطق الحروف بالحركات الصحيحة', category: 'audio' },
  { icon: '📖', title: 'القصص التفاعلية',         path: '/kids-corner/storybook',                           desc: 'قصص قصيرة وناطقة لتعلم القراءة', category: 'audio' },
  { icon: '🎈', title: 'بالونات الحروف',           path: '/kids-corner/balloons',                            desc: 'فرقع البالون الذي يحمل الحرف الصحيح', category: 'games' },
  { icon: '🧠', title: 'تحدي الذاكرة',            path: '/kids-corner/memory',                              desc: 'طابق الحروف المتشابهة لتفوز', category: 'games' },
  { icon: '🧩', title: 'تركيب الكلمات',           path: '/kids-corner/puzzle',                              desc: 'رتب الحروف لتكوين الكلمة الصحيحة', category: 'games' },
  { icon: '🪨', title: 'صخور الحروف والدمج',      path: '/kids-corner/blending-rocks?subject=arabic',       desc: 'اكسر الصخور لتكتشف الحروف وتدمج الكلمات بنطق تفاعلي', category: 'games' },
  { icon: '🏎️', title: 'سباق سيارة الكلمات',     path: '/kids-corner/car-blending?subject=arabic',         desc: 'حرّك السيارة تحت الحروف لتنطق الأصوات وتدمج الكلمة', category: 'games' },
  { icon: '🌿', title: 'ترتيب كلمات الآية',       path: '/kids-corner/quran-words',                         desc: 'أنشطة حلقات القرآن الكريم لترتيب كلمات الآيات', category: 'games' },
  { icon: '🕹️', title: 'مخلب صيد الحروف',        path: '/kids-corner/claw-machine?subject=arabic',         desc: 'اختر الحرف الناقص وشاهد المخلب يسحبه لمكانه', category: 'games' },
  { icon: '📖', title: 'مصحف التجويد والتظليل',    path: '/kids-corner/mushaf',                              desc: 'تصفح صفحات المصحف الشريف مع الرسم والتظليل والاستماع', category: 'audio' },
  { icon: '🎮', title: 'ماريو الكلمات',           path: '/kids-corner/games/mario?subject=arabic',         desc: 'مغامرة ماريو في البحث عن الحرف الناقص', category: 'games' },
  { icon: '🚀', title: 'حرب الكلمات',             path: '/kids-corner/games/tank-battle?subject=arabic',   desc: 'معركة الدبابات لتعلم المفردات', category: 'games' },
  { icon: '🚆', title: 'صب واي الحروف',           path: '/kids-corner/games/subway?subject=arabic',        desc: 'اركض وتفادى القطار بالإجابة الصحيحة', category: 'games' },
]

export default function ArabicCorner() {
  const router = useRouter()
  return (
    <ToolsPage
      title="تأسيس اللغة العربية"
      emoji="🇸🇦"
      subtitle="رحلة شيقة وممتعة في عالم لغتنا العربية الجميلة!"
      tools={TOOLS}
      onBack={() => router.push('/kids-corner')}
    />
  )
}
