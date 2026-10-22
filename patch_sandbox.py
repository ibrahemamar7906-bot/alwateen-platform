import re

def patch_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add containerRef and scale state
    if 'const [scale, setScale] = useState(1)' not in content:
        content = content.replace('const iframeRef = useRef(null)', 
            'const iframeRef = useRef(null)\n  const containerRef = useRef(null)\n  const [scale, setScale] = useState(1)')
            
        scale_logic = """
  // Auto-scale iframe for fixed aspect ratios
  useEffect(() => {
    if (layoutMode === 'full' || !containerRef.current) {
      setScale(1)
      return
    }
    const updateScale = () => {
      const container = containerRef.current
      if (!container) return
      const { clientWidth, clientHeight } = container
      let targetWidth, targetHeight
      if (layoutMode === '16:9') { targetWidth = 1280; targetHeight = 720; }
      else if (layoutMode === '4:3') { targetWidth = 1024; targetHeight = 768; }
      else if (layoutMode === 'A4') { targetWidth = 794; targetHeight = 1123; }
      
      const padding = 40; // 20px padding on each side
      const scaleX = (clientWidth - padding) / targetWidth
      const scaleY = (clientHeight - padding) / targetHeight
      setScale(Math.min(scaleX, scaleY))
    }
    updateScale()
    const observer = new ResizeObserver(updateScale)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [layoutMode, typeof isFullscreen !== 'undefined' ? isFullscreen : false])
"""
        # Insert scale logic after useEffects
        content = content.replace('const injectedCode = React.useMemo(() => {', scale_logic + '\n  const injectedCode = React.useMemo(() => {')

    # Update rendering
    # Look for the container div
    container_pattern = r'<div style=\{\{\s*(?:flex: 1,\s*)?background: layoutMode === \'full\' \? \'#fff\' : \'#020617\'[^>]*>'
    
    def repl(m):
        original = m.group(0)
        if 'ref={containerRef}' not in original:
            return original.replace('<div style={{', '<div ref={containerRef} style={{')
        return original

    content = re.sub(container_pattern, repl, content)

    # Update iframe wrapper div
    wrapper_pattern = r'<div style=\{\{\s*width: layoutMode === \'full\' \? \'100%\' : \'100%\'[^\}]*\}\}>'
    
    replacement_wrapper = """<div style={{
              width: layoutMode === 'full' ? '100%' : (layoutMode === '16:9' ? '1280px' : (layoutMode === '4:3' ? '1024px' : '794px')),
              height: layoutMode === 'full' ? '100%' : (layoutMode === '16:9' ? '720px' : (layoutMode === '4:3' ? '768px' : '1123px')),
              transform: layoutMode === 'full' ? 'none' : `scale(${scale})`,
              transformOrigin: 'center center',
              background: '#fff',
              boxShadow: layoutMode === 'full' ? 'none' : '0 10px 30px rgba(0,0,0,0.5)',
              flexShrink: 0,
              overflow: 'hidden',
              display: 'flex'
            }}>"""
    
    content = re.sub(wrapper_pattern, replacement_wrapper, content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

patch_file('e:/ملفات المنصة/-/app/teacher-assistant/live-components/LiveHtmlSandboxTeacher.js')
patch_file('e:/ملفات المنصة/-/app/live/components/LiveHtmlSandboxStudent.js')
print("Done patching.")
