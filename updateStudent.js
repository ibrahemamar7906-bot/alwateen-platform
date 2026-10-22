const fs = require('fs');

function updateStudent() {
    const file = 'e:/منصة الوتين/app/live/LiveWhiteboardStudent.js';
    let content = fs.readFileSync(file, 'utf8');

    // 1. Add imports
    const importMarker = "import WordSearchOverlay from '../teacher-assistant/whiteboard/WordSearchOverlay'";
    if (!content.includes('QuranOrderGameOverlay')) {
        content = content.replace(importMarker, importMarker + "\n" +
            "import QuranOrderGameOverlay from '../teacher-assistant/whiteboard/QuranOrderGameOverlay'\n" +
            "import WordBuilderOverlay from '../teacher-assistant/whiteboard/WordBuilderOverlay'\n" +
            "import PeriodicTableOverlay from '../teacher-assistant/whiteboard/PeriodicTableOverlay'\n" +
            "import ReadyPathwayOverlay from '../teacher-assistant/whiteboard/ReadyPathwayOverlay'\n" +
            "import MemoryGameOverlay from '../teacher-assistant/whiteboard/MemoryGameOverlay'");
    }

    // 2. Add states
    const stateMarker = "const [isWordSearchActive, setIsWordSearchActive] = useState(false)";
    if (!content.includes('isQuranGameActive')) {
        content = content.replace(stateMarker, stateMarker + "\n" +
            "    const [isQuranGameActive, setIsQuranGameActive] = useState(false)\n" +
            "    const [isWordBuilderActive, setIsWordBuilderActive] = useState(false)\n" +
            "    const [isPeriodicTableActive, setIsPeriodicTableActive] = useState(false)\n" +
            "    const [isReadyPathwayActive, setIsReadyPathwayActive] = useState(false)\n" +
            "    const [isMemoryGameActive, setIsMemoryGameActive] = useState(false)\n" +
            "    const [customBgImage, setCustomBgImage] = useState(null)\n" +
            "    const [iframes, setIframes] = useState([])");
    }

    // 3. Update react_state
    const syncMarker = "setIsWordSearchActive(payload.isWordSearchActive || false);";
    if (!content.includes('setIsQuranGameActive(payload.isQuranGameActive')) {
        content = content.replace(syncMarker, syncMarker + "\n" +
            "        setIsQuranGameActive(payload.isQuranGameActive || false);\n" +
            "        setIsWordBuilderActive(payload.isWordBuilderActive || false);\n" +
            "        setIsPeriodicTableActive(payload.isPeriodicTableActive || false);\n" +
            "        setIsReadyPathwayActive(payload.isReadyPathwayActive || false);\n" +
            "        setIsMemoryGameActive(payload.isMemoryGameActive || false);\n" +
            "        setCustomBgImage(payload.customBgImage || null);\n" +
            "        setIframes(payload.iframes || []);");
    }

    // 4. Update JSX Background & Iframes
    const jsxBgMarker = "{bgType === 'letters' && (";
    if (!content.includes('backgroundImage: url')) {
        content = content.replace(jsxBgMarker, 
            "{customBgImage && <div style={{ position: 'absolute', inset: 0, backgroundImage: \\url(\\)\\, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15, zIndex: 0, pointerEvents: 'none' }} />}\n" +
            "        {iframes.map(iframe => (\n" +
            "          <div key={iframe.id} style={{ position: 'absolute', left: iframe.x, top: iframe.y, width: 600, height: 400, zIndex: 50, pointerEvents: 'auto', background: 'white', borderRadius: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>\n" +
            "            <div style={{ padding: '10px', background: '#e2e8f0', borderRadius: '10px 10px 0 0', fontWeight: 'bold' }}>{iframe.title || 'أداة'}</div>\n" +
            "            <iframe src={iframe.url} style={{ width: '100%', height: 'calc(100% - 40px)', border: 'none', borderRadius: '0 0 10px 10px' }} />\n" +
            "          </div>\n" +
            "        ))}\n" +
            "        " + jsxBgMarker);
    }

    // 5. Update JSX Overlays
    const jsxOverlayMarker = "<WordSearchOverlay isActive={isWordSearchActive} isStudent={true} onClose={() => {}} />";
    if (!content.includes('<QuranOrderGameOverlay isActive={isQuranGameActive}')) {
        content = content.replace(jsxOverlayMarker, jsxOverlayMarker + "\n" +
            "        <QuranOrderGameOverlay isActive={isQuranGameActive} isStudent={true} onClose={() => {}} />\n" +
            "        <WordBuilderOverlay isActive={isWordBuilderActive} isStudent={true} onClose={() => {}} />\n" +
            "        <MemoryGameOverlay isActive={isMemoryGameActive} isStudent={true} onClose={() => {}} />\n" +
            "        <PeriodicTableOverlay isActive={isPeriodicTableActive} isStudent={true} onClose={() => {}} />\n" +
            "        <ReadyPathwayOverlay isActive={isReadyPathwayActive} isStudent={true} onClose={() => {}} />");
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log("Updated LiveWhiteboardStudent.js");
}

updateStudent();
