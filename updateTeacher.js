const fs = require('fs');
const file = 'e:/منصة الوتين/app/teacher-assistant/virtual-classroom/page.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add imports and state
if (!content.includes('import LiveBottomBar')) {
    content = content.replace(
        "import LiveSidebar from '../../virtual-classroom/LiveSidebar'",
        "import LiveSidebar from '../../virtual-classroom/LiveSidebar'\nimport LiveBottomBar from '../../virtual-classroom/LiveBottomBar'"
    );
}

if (!content.includes('sidebarTab')) {
    content = content.replace(
        "const [isSidebarOpen, setIsSidebarOpen] = useState(true)",
        "const [isSidebarOpen, setIsSidebarOpen] = useState(true)\n  const [sidebarTab, setSidebarTab] = useState('chat')"
    );
}

// 2. Add toast state & icons
if (!content.includes('const [toast')) {
    content = content.replace(
        "const [copiedLink, setCopiedLink] = useState(false)",
        "const [copiedLink, setCopiedLink] = useState(false)\n  const [toast, setToast] = useState(null)"
    );
}
if (!content.includes('CheckCircle2')) {
    content = content.replace(
        "VideoOff, RefreshCw",
        "VideoOff, RefreshCw, X, CheckCircle2, ShieldAlert, Sparkles"
    );
}

// 3. Replace layout
const startMarker = "        {/* CENTRAL STAGE */}";
// Find the closing </div> of the main flex container, followed by LiveQuestionModal
const endMarker = "        {/* Modals & Overlays */}";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
    const newBlock = \        {/* MIDDLE AREA (Main Stage + Right Panel) */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
          
          {/* MAIN STAGE (Whiteboards & Games) */}
          <main style={{ 
            flex: 1, 
            display: 'flex', 
            position: 'relative', 
            overflow: 'hidden', 
            padding: isMobile ? '4px' : '10px',
            backgroundColor: '#0a1628'
          }}>
            <div style={{ 
              flex: 1, 
              backgroundColor: '#000', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              position: 'relative',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
              
              {/* Stage: Whiteboard */}
              <div style={{ display: activeTool === 'whiteboard' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                  <LiveWhiteboardTeacher channel={channel} students={devices} isMobile={isMobile} />
                </div>
              </div>

              {/* Stage: Arabic Board */}
              <div style={{ display: activeTool === 'arabic-board' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                  {(specialty === 'arabic' || specialty === 'general') && <LiveArabicBoardTeacher channel={channel} />}
                </div>
              </div>

              {/* Stage: English Board */}
              <div style={{ display: activeTool === 'english-board' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                  {(specialty === 'english' || specialty === 'general') && <LiveEnglishBoardTeacher channel={channel} />}
                </div>
              </div>

              {/* Stage: Math Board */}
              <div style={{ display: activeTool === 'math-board' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                  {(specialty === 'math' || specialty === 'general') && <LiveMathLabTeacher channel={channel} />}
                </div>
              </div>

              {/* Stage: Grammar */}
              <div style={{ display: activeTool === 'grammar-stage' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
                <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                  <InteractiveGrammarStage channel={channel} isTeacher={true} />
                </div>
              </div>

            </div>
          </main>

          {/* RIGHT PANEL (Cameras & Sidebar) */}
          <div style={{
            width: isSidebarOpen ? (isMobile ? '100%' : '320px') : '0',
            position: isMobile ? 'absolute' : 'relative',
            top: 0, bottom: 0, right: 0,
            backgroundColor: '#1e293b',
            borderLeft: '1px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.3s ease',
            zIndex: isMobile ? 90 : 10,
            overflow: 'hidden'
          }}>
            <div style={{ width: isMobile ? '100%' : '320px', height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Remote Cameras Grid */}
              <div style={{ 
                padding: '10px', 
                display: 'grid', 
                gridTemplateColumns: '1fr', 
                gap: '10px', 
                maxHeight: '40%', 
                overflowY: 'auto',
                borderBottom: '1px solid #334155'
              }}>
                {/* Local Camera */}
                {(localStream && isCameraOn) && (
                  <LiveCameraBubble
                    stream={localStream}
                    title="أنت"
                    isLocal={true}
                    facingMode={facingMode}
                    onSwitchCamera={switchCamera}
                    isStatic={true}
                  />
                )}
                
                {/* Remote Cameras */}
                {peers.filter(p => p.stream && (p.hasVideo || p.stream.getVideoTracks().length > 0)).map((peer) => (
                  <LiveCameraBubble
                    key={peer.id}
                    stream={peer.stream}
                    title={peer.name || 'مشارك'}
                    isLocal={false}
                    isStatic={true}
                  />
                ))}
              </div>

              {/* Sidebar Content (Chat/Participants) */}
              <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {isMobile && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start', padding: '8px' }}>
                     <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        إغلاق ✕
                     </button>
                  </div>
                )}
                <LiveSidebar
                  isTeacher={true}
                  students={devices}
                  handRaises={handRaises}
                  activeControlDeviceId={activeControlDevice}
                  onGrantControl={handleGrantControl}
                  onGrantMic={grantSpeakToStudent}
                  onMuteStudent={forceMuteStudent}
                  focusMode={focusMode}
                  channel={channel}
                  currentUserId={teacherId}
                  currentUserName={teacherDisplayName}
                  activeTab={sidebarTab}
                  setActiveTab={setSidebarTab}
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CONTROL BAR */}
        <LiveBottomBar 
          isTeacher={true}
          isMicOn={isMicOn}
          onToggleMic={toggleMic}
          isCameraOn={isCameraOn}
          onToggleCamera={toggleCamera}
          conferenceMode={conferenceMode}
          onToggleConference={() => conferenceMode ? disableConferenceMode() : enableConferenceMode()}
          onOpenGames={() => setShowGamesDropdown(!showGamesDropdown)}
          activeTab={sidebarTab}
          onToggleTab={(tab) => {
            if (isSidebarOpen && sidebarTab === tab) {
              setIsSidebarOpen(false)
            } else {
              setSidebarTab(tab)
              setIsSidebarOpen(true)
            }
          }}
          onLeave={() => window.location.href = '/teacher-assistant'}
          channel={channel}
          currentUserName={teacherDisplayName}
          handRaisesCount={handRaises.length}
        />
        
\;
    content = content.substring(0, startIndex) + newBlock + content.substring(endIndex);
    
    // Add global toast at the top of the return block
    const returnIndex = content.indexOf('return (\\n      <div dir="rtl"');
    if (returnIndex !== -1) {
        // Just inject after <div dir="rtl" style={{...}}>
        const divEnd = content.indexOf('}}>', returnIndex) + 3;
        content = content.substring(0, divEnd) + \
          <style>{\\\@keyframes toastSlideDown { 0% { transform: translate(-50%, -100%); opacity: 0; } 60% { transform: translate(-50%, 15px); opacity: 1; } 100% { transform: translate(-50%, 0); opacity: 1; } }\\\}</style>
          {toast && (
            <div style={{
              position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
              backgroundColor: toast.type === 'success' ? '#10b981' : toast.type === 'warning' ? '#f59e0b' : '#3b82f6',
              color: '#ffffff', padding: '12px 24px', borderRadius: '50px', fontWeight: 800, fontSize: '0.95rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 999999,
              animation: 'toastSlideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              {toast.type === 'success' ? <CheckCircle2 size={20} /> : toast.type === 'warning' ? <ShieldAlert size={20} /> : <Sparkles size={20} />}
              <span>{toast.text}</span>
            </div>
          )}
\ + content.substring(divEnd);
    }
    
    fs.writeFileSync(file, content, 'utf8');
    console.log("Success");
} else {
    console.log("Markers not found");
}
