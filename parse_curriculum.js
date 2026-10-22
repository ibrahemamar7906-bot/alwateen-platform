const fs = require('fs');
const path = require('path');

const curriculumPath = 'e:\\منصة الوتين\\prep2_curriculum.txt';
const outputPath = 'e:\\منصة الوتين\\app\\kids-corner\\pathway\\prep2_data.js';

try {
  const content = fs.readFileSync(curriculumPath, 'utf8');
  const sections = content.split('###').filter(s => s.trim().length > 0);
  
  let idCounter = 1;
  let unitCounter = 1;
  const nodes = [];

  // 1. Introduction node
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

    // Use string index to extract sections accurately
    const originalTextIndex = section.indexOf('**النص الأصلي');
    const vocabIndex = section.indexOf('**معاني المفردات');
    const guideIndex = section.indexOf('**💡 دليل الطالب');
    const questionsIndex = section.indexOf('**📝 أسئلة المنصة');

    const extractPart = (startStr, nextStrList) => {
      let startIndex = section.indexOf(startStr);
      if (startIndex === -1) return '';
      // find end of the line containing startStr
      startIndex = section.indexOf('\n', startIndex);
      if (startIndex === -1) return '';
      
      let endIndex = section.length;
      for (let nextStr of nextStrList) {
        let nIdx = section.indexOf(nextStr, startIndex);
        if (nIdx !== -1 && nIdx < endIndex) {
          endIndex = nIdx;
        }
      }
      return section.substring(startIndex, endIndex).trim();
    };

    const originalText = extractPart('**النص الأصلي', ['**معاني المفردات', '**💡 دليل الطالب', '**📝 أسئلة المنصة']).replace(/>/g, '').trim();
    const vocab = extractPart('**معاني المفردات', ['**💡 دليل الطالب', '**📝 أسئلة المنصة']).trim();
    const guide = extractPart('**💡 دليل الطالب', ['**📝 أسئلة المنصة']).trim();
    const questionsText = extractPart('**📝 أسئلة المنصة', []).trim();

    let questionsCode = '[]';
    if (questionsText) {
      // Split by question number e.g. "1. " or "2. "
      const qBlocks = questionsText.split(/(?=\n\d+\.\s+)/).filter(q => q.trim().length > 0);
      const parsedQuestions = qBlocks.map(qBlock => {
        let qLines = qBlock.split('\n');
        let qText = qLines[0].replace(/^\d+\.\s*/, '').replace(/"/g, "'").replace(/`/g, "'").trim();
        let options = [];
        let correct = '';
        
        for (let i = 1; i < qLines.length; i++) {
          let line = qLines[i].trim();
          if (line.startsWith('*')) {
            let optText = line.replace(/^\*\s*[أ-د]\)\s*/, '').trim();
            let isCorrect = optText.includes('*(الإجابة الصحيحة)*') || optText.includes('(الإجابة الصحيحة)');
            optText = optText.replace(/\*?\(الإجابة الصحيحة\)\*?/, '').trim();
            optText = optText.replace(/"/g, "'").replace(/`/g, "'");
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
    if (originalText) textContent += `<h3>النص الأصلي</h3>${formatParagraphs(originalText)}`;
    if (vocab) textContent += `<h3>معاني المفردات</h3>${formatParagraphs(vocab)}`;
    if (guide) textContent += `<h3>دليل الطالب التفاعلي</h3>${formatParagraphs(guide)}`;

    let safeContent = textContent.replace(/`/g, '\\`').replace(/\$/g, '\\$');
    let safeTitle = titleLine.replace(/'/g, "\\'").replace(/\n/g, ' ').trim();

    nodes.push(`
  nodes.push({
    id: idCounter++, unit: ${unitCounter},
    title: '${safeTitle}',
    desc: 'تعرف على ${safeTitle}',
    type: 'lesson', icon: '📖',
    data: {
      content: \`${safeContent}\`
    }
  })`);

    if (questionsCode !== '[]') {
      nodes.push(`
  nodes.push({
    id: idCounter++, unit: ${unitCounter},
    title: 'تحدي: ${safeTitle}',
    desc: 'اختبر فهمك للدرس',
    type: 'quiz', icon: '📝',
    data: {
      questions: ${questionsCode}
    }
  })`);
    }

    if (idCounter > 1 && (nodes.length % 4 === 0)) unitCounter++;
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

  const functionCode = `// Generated automatically from prep2_curriculum.txt
export const generatePrep2ArabicPathway = () => {
  let idCounter = 1;
  const nodes = [];\n
${nodes.join('\n')}

  return nodes;
}`;

  fs.writeFileSync(outputPath, functionCode, 'utf8');
  console.log("Generated successfully! Total nodes: " + nodes.length);
} catch (e) {
  console.error("Error:", e);
}
