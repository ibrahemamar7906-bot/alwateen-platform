const fs = require('fs');

function hideToolbarsWhenOverlayActive(file) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Inject the boolean
    const boolDef = `
  const isAnyFullScreenOverlayActive = 
    (typeof isQuranPlayerActive !== 'undefined' && isQuranPlayerActive) || 
    (typeof isHangmanActive !== 'undefined' && isHangmanActive) || 
    (typeof isQuizShowActive !== 'undefined' && isQuizShowActive) || 
    (typeof isWordSearchActive !== 'undefined' && isWordSearchActive) || 
    (typeof isQuranGameActive !== 'undefined' && isQuranGameActive) || 
    (typeof isWordBuilderActive !== 'undefined' && isWordBuilderActive) || 
    (typeof isPeriodicTableActive !== 'undefined' && isPeriodicTableActive) || 
    (typeof isMathQuizActive !== 'undefined' && isMathQuizActive) || 
    (typeof isMemoryGameActive !== 'undefined' && isMemoryGameActive) || 
    (typeof isReadyPathwayActive !== 'undefined' && isReadyPathwayActive);
`;

    if (!content.includes('isAnyFullScreenOverlayActive')) {
        content = content.replace(/\n\s*return \(\s*\n\s*<div className=\{`\$\{styles\.container\}/, boolDef + "\n  return (\n    <div className={`\\${styles.container}");
    }

    // 2. Add style={{ display: isAnyFullScreenOverlayActive ? 'none' : '' }} to toolbars
    // Note: Some toolbars might already have a style={{ ... }}.
    // We will use a regex to safely inject it.
    const toolbars = [
        '\\$\\{styles\\.leftToolbar\\}',
        '\\$\\{styles\\.topLeftToolbar\\}',
        '\\$\\{styles\\.topRightToolbar\\}',
        '\\$\\{styles\\.bottomToolbar\\}',
        'styles\\.advancedToolsContainer'
    ];

    toolbars.forEach(tb => {
        // Regex to find <div className={...} (maybe style={...})>
        const regex = new RegExp(`(<div[^>]*className=[^>]*${tb}[^>]*)(>)`, 'g');
        content = content.replace(regex, (match, p1, p2) => {
            if (p1.includes('style={{')) {
                return p1.replace('style={{', "style={{ display: isAnyFullScreenOverlayActive ? 'none' : '', ") + p2;
            } else {
                return p1 + " style={{ display: isAnyFullScreenOverlayActive ? 'none' : '' }}" + p2;
            }
        });
    });

    fs.writeFileSync(file, content, 'utf8');
    console.log('Processed ' + file);
}

hideToolbarsWhenOverlayActive('e:\\منصة الوتين\\app\\teacher-assistant\\live-components\\LiveWhiteboardTeacher.js');
hideToolbarsWhenOverlayActive('e:\\منصة الوتين\\app\\teacher-assistant\\whiteboard\\WhiteboardComponent.js');
