const fs = require('fs');

function fixClosureBug(file, stateNames) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Create refs for each state
    let refsCode = '\n';
    stateNames.forEach(s => {
        refsCode += `  const ${s}Ref = useRef(${s});\n  useEffect(() => { ${s}Ref.current = ${s}; }, [${s}]);\n`;
    });

    // Inject after canvasRef
    content = content.replace(/const canvasRef = useRef\(null\)/, `const canvasRef = useRef(null)\n${refsCode}`);

    // 2. Update the sync payload to use refs
    let payloadCode = '';
    stateNames.forEach((s, idx) => {
        payloadCode += `${s}: ${s}Ref.current`;
        if (idx < stateNames.length - 1) payloadCode += ', ';
    });

    // Find the payload line and replace it
    const regex = new RegExp(`payload: { action: 'sync_state', ${stateNames.join(', ')} }`);
    content = content.replace(regex, `payload: { action: 'sync_state', ${payloadCode} }`);

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed closure bug in ${file}`);
}

fixClosureBug(
  'e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveArabicBoardTeacher.js',
  ['activeItem', 'activeHaraka', 'isTracing', 'studentHasControl']
);

fixClosureBug(
  'e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveEnglishBoardTeacher.js',
  ['activeItem', 'isTracing', 'studentHasControl']
);

fixClosureBug(
  'e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveMathBoardTeacher.js',
  ['activeTab', 'activeNumber', 'selectedTable', 'activeEquation', 'practiceEquation', 'studentHasControl']
);
