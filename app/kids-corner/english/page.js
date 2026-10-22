'use client'
import { useRouter } from 'next/navigation'
import ToolsPage from '../components/ToolsPage'

const TOOLS = [
  { icon: '🗺️', title: 'Smart Pathway',        path: '/kids-corner/pathway?subject=english',            desc: 'Interactive step-by-step English journey', category: 'pathway' },
  { icon: '✍️', title: 'Magic Whiteboard',      path: '/kids-corner/tracing?subject=english',            desc: 'Trace and learn English letters', category: 'writing' },
  { icon: '🔤', title: 'ABC Phonics',           path: '/kids-corner/english-alphabet',                   desc: 'Learn the English alphabet sounds', category: 'audio' },
  { icon: '🔊', title: 'Talking Numbers',       path: '/kids-corner/talking-numbers?lang=en',            desc: 'Numbers 1–100 with crystal voice', category: 'audio' },
  { icon: '🚂', title: 'Word Train',            path: '/kids-corner/train?subject=english',              desc: 'Drag letters to build words', category: 'games' },
  { icon: '🧠', title: 'Memory Match',          path: '/kids-corner/memory?subject=english',             desc: 'Match the English letters', category: 'games' },
  { icon: '🎈', title: 'Letter Balloons',       path: '/kids-corner/balloons?subject=english',           desc: 'Pop the correct letter balloon', category: 'games' },
  { icon: '🧩', title: 'Word Puzzle',           path: '/kids-corner/puzzle?subject=english',             desc: 'Arrange letters to make words', category: 'games' },
  { icon: '📖', title: 'Storybook',             path: '/kids-corner/storybook?subject=english',          desc: 'Read fun interactive English stories', category: 'audio' },
  { icon: '🪨', title: 'Blending Rocks',        path: '/kids-corner/blending-rocks?subject=english',      desc: 'Smash rocks to reveal phonics and blend words!', category: 'games' },
  { icon: '🏎️', title: 'Car Blending Track',    path: '/kids-corner/car-blending?subject=english',        desc: 'Drive the car under letters to blend words!', category: 'games' },
  { icon: '🕹️', title: 'Claw Machine Spelling',  path: '/kids-corner/claw-machine?subject=english',        desc: 'Grab the missing letters with the arcade claw!', category: 'games' },
  { icon: '🎮', title: 'Mario English',         path: '/kids-corner/games/mario?subject=english',        desc: 'Learn English words with Mario', category: 'games' },
  { icon: '🚀', title: 'Word Tanks',            path: '/kids-corner/games/tank-battle?subject=english',  desc: 'Tank battle with English vocab', category: 'games' },
  { icon: '🚆', title: 'Subway English',        path: '/kids-corner/games/subway?subject=english',       desc: 'Run and dodge trains by answering', category: 'games' },
]

export default function EnglishCorner() {
  const router = useRouter()
  return (
    <ToolsPage
      title="English Foundation"
      emoji="🇬🇧"
      subtitle="Fun and engaging English adventures for young learners!"
      tools={TOOLS}
      onBack={() => router.push('/kids-corner')}
      dir="ltr"
      backLabel="Back"
      startLabel="Start"
      arrowLabel="→"
      categories={[
        { id: 'all', label: 'All Activities ✨' },
        { id: 'pathway', label: '🗺️ Pathway' },
        { id: 'games', label: '🎮 Fun Games' },
        { id: 'writing', label: '✍️ Tracing' },
        { id: 'audio', label: '🔊 Audio & Stories' },
      ]}
    />
  )
}
