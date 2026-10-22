const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\virtual-classroom\\InteractiveGrammarStage.js';
let content = fs.readFileSync(file, 'utf8');

const injectionStr = `      if (payload.action === 'request_sync' && isTeacher) {
        channel.send({
          type: 'broadcast',
          event: 'grammar_sync',
          payload: { 
            customPassages: syncStateRef.current.passages,
            selectedPassageIndex: syncStateRef.current.selectedPassageIndex,
            activeWordIndex: syncStateRef.current.activeWordIndex,
            showQuiz: syncStateRef.current.showQuiz
          }
        }).catch(e => console.error('Grammar sync error:', e));
      }
    })

    // If student, request sync on mount
    if (!isTeacher) {
      channel.send({
        type: 'broadcast',
        event: 'grammar_sync',
        payload: { action: 'request_sync' }
      }).catch(e => {});
    }

    return () => {`;

content = content.replace(/    \}\)\n\n    return \(\) => \{/g, injectionStr);
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed InteractiveGrammarStage');
