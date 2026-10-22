const fs = require('fs');

function addSyncToTeacher(file, stateNames, syncEventName, studentActionEventName) {
    let content = fs.readFileSync(file, 'utf8');

    // Generate payload for sync
    const payloadStr = stateNames.map(s => `${s}`).join(', ');

    // Inject listener
    const hookStart = `  // Listen for student drawing events`;
    
    // We will inject the request_sync listener inside the existing useEffect that handles channel.on
    // Let's find channel.on('broadcast'
    const broadcastStr = `channel.on('broadcast', { event: '${studentActionEventName}' }, handleBroadcast)`;
    
    const newListener = `
    const handleSyncRequest = ({ payload }) => {
      if (!isMounted) return;
      if (payload.action === 'request_sync') {
        channel.send({
          type: 'broadcast',
          event: '${syncEventName}',
          payload: { action: 'sync_state', ${payloadStr} }
        }).catch(err => console.error('Sync Broadcast error:', err));
      }
    };
    channel.on('broadcast', { event: '${syncEventName}_request' }, handleSyncRequest);
    `;

    if (!content.includes(`${syncEventName}_request`)) {
        content = content.replace(broadcastStr, broadcastStr + '\n' + newListener);
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Added sync to ${file}`);
    } else {
        console.log(`Already has sync in ${file}`);
    }
}

addSyncToTeacher(
  'e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveArabicBoardTeacher.js',
  ['activeItem', 'activeHaraka', 'isTracing', 'studentHasControl'],
  'arabic_board_action',
  'arabic_board_action_student'
);

addSyncToTeacher(
  'e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveEnglishBoardTeacher.js',
  ['activeItem', 'isTracing', 'studentHasControl'],
  'english_board_action',
  'english_board_action_student'
);

addSyncToTeacher(
  'e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveMathBoardTeacher.js',
  ['activeTab', 'activeNumber', 'selectedTable', 'activeEquation', 'practiceEquation', 'studentHasControl'],
  'math_board_action',
  'math_board_action_student'
);
