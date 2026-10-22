const fs = require('fs');

const curriculumPath = 'e:\\منصة الوتين\\prep2_curriculum.txt';
const outputPath = 'e:\\منصة الوتين\\prep2_pathway.js';

try {
  const content = fs.readFileSync(curriculumPath, 'utf8');
  const sections = content.split('###').filter(s => s.trim().length > 0);
  
  let idCounter = 1000;
  let unitCounter = 1;
  const nodes = [];

  nodes.push(`  // ١. البداية والتأسيس
  nodes.push({ id: idCounter++, unit: 1, title: 'مرحباً بك في الصف الثاني الإعدادي', desc: 'استعد لرحلة ممتعة في بحور اللغة العربية، حيث نتعلم البلاغة والنصوص الجميلة.', type: 'start', icon: '🚀', data: {} })`);

  for (let section of sections) {
    if (!section.includes('**')) continue;
    
    // Extract title
    const lines = section.split('\n');
    let titleLine = lines[0].replace(/\*\*/g, '').trim();
    if (titleLine.startsWith('أولاً:') || titleLine.startsWith('ثانياً:') || titleLine.startsWith('ثالثاً:') || titleLine.startsWith('رابعاً:') || titleLine.startsWith('خامساً:') || titleLine.startsWith('سادساً:')) {
      titleLine = titleLine.split('-').map(s => s.trim()).pop();
    } else if (titleLine.startsWith('الدرس')) {
      titleLine = titleLine.split('-').map(s => s.trim()).pop();
    }

    if (titleLine.length < 3) continue;

    const originalTextMatch = section.match(/\*\*النص الأصلي.*?\*\*([\s\S]*?)(?=\*\*|$)/);
    const originalText = originalTextMatch ? originalTextMatch[1].replace(/>/g, '').trim() : '';

    const vocabMatch = section.match(/\*\*معاني المفردات:\*\*([\s\S]*?)(?=\*\*|$)/);
    const vocab = vocabMatch ? vocabMatch[1].trim() : '';

    const guideMatch = section.match(/\*\*💡 دليل الطالب.*?\*\*([\s\S]*?)(?=\*\*|$)/);
    const guide = guideMatch ? guideMatch[1].trim() : '';

    const questionsMatch = section.match(/\*\*📝 أسئلة المنصة:\*\*([\s\S]*?)(?=###|$)/);
    const questionsText = questionsMatch ? questionsMatch[1].trim() : '';

    let questionsCode = '[]';
    if (questionsText) {
      const qBlocks = questionsText.split(/\n\d+\.\s/).filter(q => q.trim().length > 0);
      const parsedQuestions = qBlocks.map(qBlock => {
        let qLines = qBlock.split('\n');
        let qText = qLines[0].replace(/^\d+\.\s*/, '').replace(/"/g, "'").trim();
        let options = [];
        let correct = '';
        
        for (let i = 1; i < qLines.length; i++) {
          let line = qLines[i].trim();
          if (line.startsWith('*')) {
            let optText = line.replace(/^\*\s*[أ-د]\)\s*/, '').trim();
            let isCorrect = optText.includes('*(الإجابة الصحيحة)*');
            optText = optText.replace(/\*\(الإجابة الصحيحة\)\*/, '').trim();
            if (optText) options.push(optText);
            if (isCorrect) correct = optText;
          }
        }
        
        return `{ q: "${qText}", options: ${JSON.stringify(options)}, correct: "${correct}" }`;
      });
      if (parsedQuestions.length > 0) {
        questionsCode = `[\n      ${parsedQuestions.join(',\n      ')}\n    ]`;
      }
    }

    // Format content
    const formatParagraphs = (text) => text.split('\n').filter(l => l.trim().length > 0).map(l => `<p>${l.replace(/"/g, "'").replace(/\*/g, '').trim()}</p>`).join('');

    let textContent = '';
    if (originalText) textContent += `<h3>النص</h3>${formatParagraphs(originalText)}`;
    if (vocab) textContent += `<h3>معاني المفردات</h3>${formatParagraphs(vocab)}`;
    if (guide) textContent += `<h3>دليل الطالب التفاعلي</h3>${formatParagraphs(guide)}`;

    let safeContent = textContent.replace(/`/g, '\\`').replace(/\$/g, '\\$');

    nodes.push(`
  nodes.push({
    id: idCounter++, unit: ${unitCounter},
    title: '${titleLine.replace(/'/g, "\\'")}',
    desc: 'تعرف على ${titleLine.replace(/'/g, "\\'")}',
    type: 'lesson', icon: '📖',
    data: {
      content: \`${safeContent}\`
    }
  })`);

    if (questionsCode !== '[]') {
      nodes.push(`
  nodes.push({
    id: idCounter++, unit: ${unitCounter},
    title: 'تحدي: ${titleLine.replace(/'/g, "\\'")}',
    desc: 'اختبر فهمك للدرس',
    type: 'quiz', icon: '📝',
    data: {
      questions: ${questionsCode}
    }
  })`);
    }

    if (idCounter % 4 === 0) unitCounter++;
  }

  nodes.push(`
  // الجوائز النهائية
  nodes.push({
    id: idCounter++, unit: ${unitCounter},
    title: 'وسام الصف الثاني الإعدادي',
    desc: 'لقد اجتزت جميع التحديات بنجاح!',
    type: 'reward', icon: '🏆',
    data: { badge: 'بطل تانية إعدادي 🏅' }
  })`);

  const functionCode = `export const generatePrep2ArabicPathway = () => {
  let idCounter = 1000;
  const nodes = [];\n
${nodes.join('\n')}

  return nodes;
}`;

  fs.writeFileSync(outputPath, functionCode);
  fs.writeFileSync('C:\\Users\\AbdoA\\.gemini\\antigravity\\brain\\b673e7c6-04ea-4fd5-90d8-9f841d96a4ff\\scratch\\log.txt', 'Success!');
} catch (e) {
  fs.writeFileSync('C:\\Users\\AbdoA\\.gemini\\antigravity\\brain\\b673e7c6-04ea-4fd5-90d8-9f841d96a4ff\\scratch\\log.txt', 'Error: ' + e.message);
}
