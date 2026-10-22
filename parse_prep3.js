const fs = require('fs');
const path = require('path');

const curriculumPath = 'e:\\منصة الوتين\\‏‏prep3_curriculum.txt';
const outputPath = 'e:\\منصة الوتين\\app\\kids-corner\\pathway\\prep3_data.js';

try {
  const content = fs.readFileSync(curriculumPath, 'utf8');
  const sections = content.split('###').filter(s => s.trim().length > 0);
  
  let idCounter = 1;
  let unitCounter = 1;
  const nodes = [];

  nodes.push(`  nodes.push({ id: idCounter++, unit: 1, title: 'مرحباً بك في الصف الثالث الإعدادي', desc: 'مقدمة المنهج', type: 'unit_start', icon: '🌟', data: {} });`);

  for (let section of sections) {
    if (!section.includes('**')) continue;
    
    // Extract title
    const lines = section.split('\n');
    let titleLine = lines[0].replace(/\*\*/g, '').trim();
    if (titleLine.startsWith('أولاً:') || titleLine.startsWith('ثانياً:') || titleLine.startsWith('ثالثاً:') || titleLine.startsWith('رابعاً:') || titleLine.startsWith('خامساً:') || titleLine.startsWith('سادساً:')) {
      titleLine = titleLine.split(':').slice(1).join(':').trim();
    } else if (titleLine.startsWith('الدرس')) {
      titleLine = titleLine.split('-').map(s => s.trim()).pop();
    }
    
    // Clean up titleLine
    titleLine = titleLine.replace(/['"]/g, '').trim();
    if (titleLine.length < 3) continue;

    // Use string index to extract sections accurately
    const extractPart = (startStrs, nextStrList) => {
      let startIndex = -1;
      let usedStartStr = '';
      for (let s of startStrs) {
        startIndex = section.indexOf(s);
        if (startIndex !== -1) {
          usedStartStr = s;
          break;
        }
      }
      
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

    const originalText = extractPart(['**النص الأصلي', '**النص الأدبي', '**النص المعلوماتي', '**نص الدرس'], ['**معاني المفردات', '**💡 دليل الطالب', '**📝 أسئلة']).replace(/>/g, '').trim();
    const vocabText = extractPart(['**معاني المفردات', '**اللغويات'], ['**💡 دليل الطالب', '**📝 أسئلة']).trim();
    const guideText = extractPart(['**💡 دليل الطالب'], ['**📝 أسئلة']).replace(/>/g, '').trim();
    const questionsText = extractPart(['**📝 أسئلة'], []).trim();

    // Parse vocab
    let vocabCode = '{}';
    if (vocabText) {
       let meaning = [];
       const vLines = vocabText.split('\n');
       for (let v of vLines) {
          let cleanV = v.replace(/^\*?\s*/, '').trim();
          if (cleanV.includes('=')) {
             let parts = cleanV.split('=');
             meaning.push(`{ w: "${parts[0].trim()}", m: "${parts[1].replace(/["']/g, '').trim()}" }`);
          } else if (cleanV.includes(':')) {
             let parts = cleanV.split(':');
             meaning.push(`{ w: "${parts[0].trim()}", m: "${parts[1].replace(/["']/g, '').trim()}" }`);
          }
       }
       if (meaning.length > 0) {
          vocabCode = `{\n        meaning: [\n          ${meaning.join(',\n          ')}\n        ]\n      }`;
       }
    }

    // Parse questions
    let questionsCode = '[]';
    if (questionsText) {
      const qBlocks = questionsText.split(/(?=\n\d+\.\s+)/).filter(q => q.trim().length > 0);
      const parsedQuestions = qBlocks.map(qBlock => {
        let qLines = qBlock.split('\n');
        let qText = qLines[0].replace(/^\d+\.\s*/, '').replace(/"/g, "'").replace(/`/g, "'").replace(/\*\*/g, '').trim();
        let options = [];
        let correct = '';
        
        for (let i = 1; i < qLines.length; i++) {
          let line = qLines[i].trim();
          if (line.startsWith('*')) {
            let optText = line.replace(/^\*\s*[أ-د]\)\s*/, '').trim();
            let isCorrect = optText.includes('*(الإجابة الصحيحة)*') || optText.includes('(الإجابة الصحيحة)');
            optText = optText.replace(/\*?\(الإجابة الصحيحة\)\*?/, '').trim();
            optText = optText.replace(/"/g, "'").replace(/`/g, "'");
            if (optText) options.push(`"${optText}"`);
            if (isCorrect) correct = optText;
          }
        }
        
        return `{ q: "${qText}", opts: [${options.join(', ')}], correct: "${correct}" }`;
      });
      if (parsedQuestions.length > 0) {
        questionsCode = `[\n        ${parsedQuestions.join(',\n        ')}\n      ]`;
      }
    }

    // Combine texts
    let combinedText = '';
    if (originalText) combinedText += originalText + '\\n\\n';
    if (guideText) combinedText += guideText + '\\n\\n';
    combinedText = combinedText.replace(/"/g, "'").replace(/`/g, "'").replace(/\n/g, '\\n').trim();

    let safeTitle = titleLine.replace(/'/g, "\\'").trim();

    // Determine type
    let nodeType = 'story';
    let icon = '📖';
    if (titleLine.includes('تدريب') || titleLine.includes('أسئلة') || titleLine.includes('مراجعة')) {
       nodeType = 'quiz_word';
       icon = '📝';
    } else if (titleLine.includes('نص') || titleLine.includes('قصة')) {
       nodeType = 'story';
       icon = '📖';
    } else if (titleLine.includes('نشيد') || titleLine.includes('شعر')) {
       nodeType = 'song';
       icon = '🎵';
    }

    nodes.push(`
  nodes.push({
    id: idCounter++, unit: ${unitCounter},
    title: '${safeTitle}',
    desc: '${nodeType === 'quiz_word' ? 'تحدي' : 'درس جديد'}',
    type: '${nodeType}', icon: '${icon}',
    data: {
      text: "${combinedText}",
      vocab: ${vocabCode},
      quizzes: ${questionsCode}
    }
  });`);

    if (idCounter > 1 && (nodes.length % 4 === 0)) {
        nodes.push(`  nodes.push({ id: idCounter++, unit: ${unitCounter}, title: 'مراجعة الوحدة ${unitCounter}', desc: 'اختبار', type: 'review', icon: '🏆', data: { quizzes: [] } });`);
        nodes.push(`  nodes.push({ id: idCounter++, unit: ${unitCounter}, title: 'صندوق المكافأة', desc: 'افتح هديتك', type: 'chest', icon: '🎁', data: { badge: 'بطل الوحدة ${unitCounter}' } });`);
        unitCounter++;
        nodes.push(`  nodes.push({ id: idCounter++, unit: ${unitCounter}, title: 'الوحدة ${unitCounter}', desc: 'بداية الوحدة', type: 'unit_start', icon: '📚', data: {} });`);
    }
  }

  nodes.push(`  nodes.push({ id: idCounter++, unit: ${unitCounter}, title: 'نهاية المنهج', desc: 'مبارك إتمام المستوى!', type: 'finish', icon: '🎓', data: {} });`);

  const functionCode = `// Generated automatically from prep3_curriculum.txt
export const generatePrep3ArabicPathway = () => {
  let idCounter = 1;
  const nodes = [];\n
${nodes.join('\n')}

  return nodes;
};`;

  fs.writeFileSync(outputPath, functionCode, 'utf8');
  console.log("Generated successfully! Total nodes: " + nodes.length);
} catch (e) {
  console.error("Error:", e);
}
