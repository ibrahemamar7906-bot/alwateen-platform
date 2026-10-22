const fs = require('fs');

const builderPath = 'e:\\ملفات المنصة\\-\\app\\teacher-assistant\\whiteboard\\WordBuilderOverlay.js';
let builderCode = fs.readFileSync(builderPath, 'utf8');

// Fix duplicates
builderCode = builderCode.replace(/if \(\!isActive\) return null;\r?\n\r?\n\s*if \(\!isActive\) return null;/g, 'if (!isActive) return null;');
builderCode = builderCode.replace(/if \(\!isActive\) return null;\r?\n\s*return \(/g, 'return (');

// Remove waiting screen
builderCode = builderCode.replace(/\{\s*gameState === 'menu' && isStudent && \([\s\S]*?في انتظار المعلم[\s\S]*?\)\s*\}/g, '');

// Update broadcastGame to allow student clicks
builderCode = builderCode.replace(/const broadcastGame = \(action, data\) => \{\s*if \(!channel \|\| isStudent\) return;\s*channel\.send\(\{ type: 'broadcast', event: 'WORD_BUILDER_SYNC', payload: \{ action, \.\.\.data \} \}\);\s*\};/g, `const broadcastGame = (action, data) => {
    if (!channel) return;
    channel.send({ type: 'broadcast', event: 'WORD_BUILDER_SYNC', payload: { action, ...data } });
  };`);

// Add listener for clicks on teacher side
builderCode = builderCode.replace(/if \(payload\.action === 'state_update'\) \{/g, `if (payload.action === 'click_letter' && !isStudent) {
        handleLetterClick(payload.option, payload.index);
      }
      if (payload.action === 'state_update') {`);

// Update handleLetterClick to broadcast if student
builderCode = builderCode.replace(/const handleLetterClick = \(option, index\) => \{/g, `const handleLetterClick = (option, index) => {
    if (isStudent) {
      broadcastGame('click_letter', { option, index });
      return;
    }`);

fs.writeFileSync(builderPath, builderCode);

const searchPath = 'e:\\ملفات المنصة\\-\\app\\teacher-assistant\\whiteboard\\WordSearchOverlay.js';
let searchCode = fs.readFileSync(searchPath, 'utf8');

searchCode = searchCode.replace(/if \(\!isActive\) return null;\r?\n\s*return \(/g, 'return (');

searchCode = searchCode.replace(/const broadcastGame = \(action, data\) => \{\s*if \(!channel \|\| isStudent\) return;\s*channel\.send\(\{ type: 'broadcast', event: 'WORD_SEARCH_SYNC', payload: \{ action, \.\.\.data \} \}\);\s*\};/g, `const broadcastGame = (action, data) => {
    if (!channel) return;
    channel.send({ type: 'broadcast', event: 'WORD_SEARCH_SYNC', payload: { action, ...data } });
  };`);

searchCode = searchCode.replace(/if \(payload\.action === 'state_update'\) \{/g, `if (payload.action === 'cell_down' && !isStudent) {
        handleCellDown(payload.r, payload.c, true);
      }
      if (payload.action === 'cell_enter' && !isStudent) {
        handleCellEnter(payload.r, payload.c, true);
      }
      if (payload.action === 'cell_up' && !isStudent) {
        handleCellUp(true);
      }
      if (payload.action === 'state_update') {`);

searchCode = searchCode.replace(/const handleCellDown = \(r, c\) => \{/g, `const handleCellDown = (r, c, fromSync = false) => {
    if (isStudent && !fromSync) {
      broadcastGame('cell_down', { r, c });
      return;
    }`);

searchCode = searchCode.replace(/const handleCellEnter = \(r, c\) => \{/g, `const handleCellEnter = (r, c, fromSync = false) => {
    if (isStudent && !fromSync) {
      broadcastGame('cell_enter', { r, c });
      return;
    }`);

searchCode = searchCode.replace(/const handleCellUp = \(\) => \{/g, `const handleCellUp = (fromSync = false) => {
    if (isStudent && !fromSync) {
      broadcastGame('cell_up', {});
      return;
    }`);

fs.writeFileSync(searchPath, searchCode);
console.log('Done');
