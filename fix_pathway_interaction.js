const fs = require('fs');
const file = 'e:/„·›«  «·„‰’…/-/app/kids-corner/pathway/page.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
if (!content.includes('playTTS')) {
  content = content.replace(
    "import { pathways } from './data'",
    "import { pathways } from './data'\nimport { playTTS } from '../../../utils/tts'"
  );
}

// 2. Add state and playSFX
if (!content.includes('shakingNodeId')) {
  content = content.replace(
    "const [toastNotice, setToastNotice] = useState(null)",
    "const [toastNotice, setToastNotice] = useState(null)\n  const [shakingNodeId, setShakingNodeId] = useState(null)"
  );
  
  const playSFXCode = \
  const playSFX = (type) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      if (type === 'click') {
        osc.frequency.setValueAtTime(600, audioCtx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1)
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1)
        osc.start()
        osc.stop(audioCtx.currentTime + 0.1)
      } else if (type === 'locked') {
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(200, audioCtx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.2)
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2)
        osc.start()
        osc.stop(audioCtx.currentTime + 0.2)
      }
    } catch(e) {}
  }\n
\;
  content = content.replace(
    "const handleNodeClick = (node, isUnlocked, isPaidLocked, prevNodeTitle) => {",
    playSFXCode + "  const handleNodeClick = (node, isUnlocked, isPaidLocked, prevNodeTitle) => {"
  );
}

// 3. Update handleNodeClick logic
content = content.replace(
  /const handleNodeClick = \(node, isUnlocked, isPaidLocked, prevNodeTitle\) => \{([\s\S]*?)\} else if \(isPaidLocked\) \{([\s\S]*?)\} else \{([\s\S]*?)\}/,
  \const handleNodeClick = (node, isUnlocked, isPaidLocked, prevNodeTitle) => {
    if (isUnlocked) {
      playSFX('click')
      if (node.type === 'chest') {
        handleOpenChest(node)
      } else {
        router.push(\\\/kids-corner/pathway/lesson?subject=\\\&id=\\\\\\)
      }
    } else if (isPaidLocked) {
      playSFX('locked')
      setShakingNodeId(node.id)
      setTimeout(() => setShakingNodeId(null), 500)
      setSelectedLockedNode(node)
      setShowSubscriptionModal(true)
    } else {
      playSFX('locked')
      setShakingNodeId(node.id)
      setTimeout(() => setShakingNodeId(null), 500)
      const msg = \\\ÌÃ» ≈‰Â«¡ «·„—Õ·… «·”«»ﬁ… √Ê·«. ﬁ„ »≈‰Â«¡ "\\\" ·ﬂÌ  › Õ Â–Â «·„—Õ·…!\\\
      setToastNotice({
        title: node.title || '„—Õ·… „€·ﬁ… ??',
        message: msg
      })
      playTTS(msg)
    }\
);

// 4. Inject shakingNodeId class into the node circle
content = content.replace(
  /className=\{isFirstInUnit && !isCompleted \? 'pm-trial-glow' : ''\}/g,
  "className={(isFirstInUnit && !isCompleted ? 'pm-trial-glow ' : '') + (shakingNodeId === node.id ? 'shake-anim' : '')}"
);

// 5. Inject shake-anim keyframes
if (!content.includes('shake-anim')) {
  content = content.replace(
    "@keyframes trialGlow {",
    ".shake-anim { animation: shake-anim 0.4s ease-in-out; }\n          @keyframes shake-anim { 0%, 100% { transform: scale(1) translateX(0); } 25% { transform: scale(1.05) translateX(-5px); } 75% { transform: scale(1.05) translateX(5px); } }\n          @keyframes trialGlow {"
  );
}

fs.writeFileSync(file, content);
console.log('Interaction improved!');
