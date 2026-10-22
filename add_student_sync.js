const fs = require('fs');

function addSyncToStudent(file, stateSetters, syncEventName, requestEventName) {
    let content = fs.readFileSync(file, 'utf8');

    // Add state handlers
    const handlerStart = `const handleBroadcast = ({ payload }) => {`;
    
    let settersCode = ``;
    stateSetters.forEach(s => {
        settersCode += `        if (payload.${s.state} !== undefined) ${s.setter}(payload.${s.state});\n`;
    });

    const syncHandler = `
      if (payload.action === 'sync_state') {
${settersCode}
        clearCanvasLocal();
        return;
      }
`;

    if (!content.includes(`payload.action === 'sync_state'`)) {
        content = content.replace(handlerStart, handlerStart + syncHandler);
    }

    // Add on-mount request
    const mountStart = `channel.on('broadcast', { event: '${syncEventName}' }, handleBroadcast)`;
    
    const requestSyncStr = `
    // Request sync from teacher on mount
    channel.send({
      type: 'broadcast',
      event: '${requestEventName}',
      payload: { action: 'request_sync' }
    }).catch(err => console.error('Request sync error:', err));
    `;

    if (!content.includes(`action: 'request_sync'`)) {
        content = content.replace(mountStart, mountStart + '\n' + requestSyncStr);
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Added sync to student ${file}`);
}

addSyncToStudent(
  'e:\\منصة الوتين\\app\\live\\LiveArabicBoardStudent.js',
  [
    {state: 'activeItem', setter: 'setActiveItem'},
    {state: 'activeHaraka', setter: 'setActiveHaraka'},
    {state: 'isTracing', setter: 'setIsTracing'},
    {state: 'studentHasControl', setter: 'setStudentHasControl'}
  ],
  'arabic_board_action',
  'arabic_board_action_request'
);

addSyncToStudent(
  'e:\\منصة الوتين\\app\\live\\LiveEnglishBoardStudent.js',
  [
    {state: 'activeItem', setter: 'setActiveItem'},
    {state: 'isTracing', setter: 'setIsTracing'},
    {state: 'studentHasControl', setter: 'setStudentHasControl'}
  ],
  'english_board_action',
  'english_board_action_request'
);

addSyncToStudent(
  'e:\\منصة الوتين\\app\\live\\LiveMathBoardStudent.js',
  [
    {state: 'activeTab', setter: 'setActiveTab'},
    {state: 'activeNumber', setter: 'setActiveNumber'},
    {state: 'selectedTable', setter: 'setSelectedTable'},
    {state: 'activeEquation', setter: 'setActiveEquation'},
    {state: 'practiceEquation', setter: 'setPracticeEquation'},
    {state: 'studentHasControl', setter: 'setStudentHasControl'}
  ],
  'math_board_action',
  'math_board_action_request'
);

