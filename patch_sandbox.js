const fs = require('fs');

function patchFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Add containerRef and scale state
    if (!content.includes('const [scale, setScale] = useState(1)')) {
        content = content.replace('const iframeRef = useRef(null)', 
            'const iframeRef = useRef(null);\n  const containerRef = useRef(null);\n  const [scale, setScale] = useState(1);');
            
        const scaleLogic = `
  // Auto-scale iframe for fixed aspect ratios
  useEffect(() => {
    if (layoutMode === 'full' || !containerRef.current) {
      setScale(1);
      return;
    }
    const updateScale = () => {
      const container = containerRef.current;
      if (!container) return;
      const { clientWidth, clientHeight } = container;
      let targetWidth = 1280, targetHeight = 720;
      if (layoutMode === '16:9') { targetWidth = 1280; targetHeight = 720; }
      else if (layoutMode === '4:3') { targetWidth = 1024; targetHeight = 768; }
      else if (layoutMode === 'A4') { targetWidth = 794; targetHeight = 1123; }
      
      const padding = 20; // 10px padding on each side
      const scaleX = Math.max(0.1, (clientWidth - padding) / targetWidth);
      const scaleY = Math.max(0.1, (clientHeight - padding) / targetHeight);
      setScale(Math.min(scaleX, scaleY));
    };
    
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) observer.observe(containerRef.current);
    
    return () => observer.disconnect();
  }, [layoutMode, typeof isFullscreen !== 'undefined' ? isFullscreen : false]);
`;
        // Insert scale logic after useEffects
        content = content.replace('const injectedCode = React.useMemo(() => {', scaleLogic + '\n  const injectedCode = React.useMemo(() => {');
    }

    // Update rendering wrapper (container div)
    // Find: <div style={{ flex: 1, background: layoutMode === 'full' ? '#fff' : '#020617', ... }}>
    const containerRegex = /<div\s+style=\{\{\s*(?:flex:\s*1,\s*)?background:\s*layoutMode\s*===\s*'full'\s*\?\s*'#fff'\s*:\s*'#020617'[^>]*>/g;
    content = content.replace(containerRegex, (match) => {
        if (!match.includes('ref={containerRef}')) {
            return match.replace('<div style={{', '<div ref={containerRef} style={{');
        }
        return match;
    });

    // Update iframe wrapper div
    // Find: <div style={{ width: layoutMode === 'full' ? '100%' : '100%', ... }}>
    const wrapperRegex = /<div style=\{\{\s*width:\s*layoutMode === 'full' \? '100%' : '100%'[^\}]*\}\}>/g;
    const replacementWrapper = `<div style={{
              width: layoutMode === 'full' ? '100%' : (layoutMode === '16:9' ? '1280px' : (layoutMode === '4:3' ? '1024px' : '794px')),
              height: layoutMode === 'full' ? '100%' : (layoutMode === '16:9' ? '720px' : (layoutMode === '4:3' ? '768px' : '1123px')),
              transform: layoutMode === 'full' ? 'none' : \`scale(\${scale})\`,
              transformOrigin: 'center center',
              background: '#fff',
              boxShadow: layoutMode === 'full' ? 'none' : '0 10px 30px rgba(0,0,0,0.5)',
              flexShrink: 0,
              overflow: 'hidden',
              display: 'flex',
              position: 'relative'
            }}>`;
            
    content = content.replace(wrapperRegex, replacementWrapper);

    fs.writeFileSync(filePath, content, 'utf-8');
}

try {
    patchFile('e:/ملفات المنصة/-/app/teacher-assistant/live-components/LiveHtmlSandboxTeacher.js');
    patchFile('e:/ملفات المنصة/-/app/live/components/LiveHtmlSandboxStudent.js');
    console.log("Done patching.");
} catch (e) {
    console.error(e);
}
