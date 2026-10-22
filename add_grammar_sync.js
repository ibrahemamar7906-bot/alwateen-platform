const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\virtual-classroom\\InteractiveGrammarStage.js';
let content = fs.readFileSync(file, 'utf8');

const hookEndIdx = content.indexOf(`    return () => {
      sub.unsubscribe()
    }
  }, [channel])`);

if (hookEndIdx !== -1 && !content.includes('request_sync')) {
    const syncLogic = `
      } else if (payload.action === 'request_sync' && isTeacher) {
        // Teacher received request to sync, send current state
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
    });

    // If student, request sync on mount
    if (!isTeacher) {
      channel.send({
        type: 'broadcast',
        event: 'grammar_sync',
        payload: { action: 'request_sync' }
      }).catch(e => {});
    }

    return () => {
      channel.unsubscribe();
    }
  }, [channel, isTeacher])
`;
    // Replace the end of the hook
    const regex = /\}\)\n\s*return \(\) => \{\n\s*sub\.unsubscribe\(\)\n\s*\}\n\s*\}, \[channel\]\)/;
    content = content.replace(regex, syncLogic);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Added sync to InteractiveGrammarStage');
} else {
    console.log('Already has sync or could not find injection point');
}
