const fs = require('fs');
const file = 'e:/منصة الوتين/app/virtual-classroom/page.js';
let content = fs.readFileSync(file, 'utf8');

const returnIndex = content.lastIndexOf('  return (\n    <div dir="rtl"');
const endIndex = content.indexOf('export default function StudentVirtualClassroom()');

if (returnIndex !== -1 && endIndex !== -1) {
  const newReturn = 
  return (
    <div dir="rtl" style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'var(--app-height, 100dvh)',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      fontFamily: "'Tajawal', 'Cairo', sans-serif",
      overflow: 'hidden',
      userSelect: 'none'
    }}>
      <style>{\
        @keyframes toastSlideDown {
          0% { transform: translate(-50%, -100%); opacity: 0; }
          60% { transform: translate(-50%, 15px); opacity: 1; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
      \}</style>

      {/* Global Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: toast.type === 'success' ? '#10b981' : toast.type === 'warning' ? '#f59e0b' : '#3b82f6',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '50px',
          fontWeight: 800,
          fontSize: '0.95rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 999999,
          animation: 'toastSlideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : toast.type === 'warning' ? <ShieldAlert size={20} /> : <Sparkles size={20} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* MIDDLE AREA (Main Stage + Right Panel) */}
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
              <LiveWhiteboardStudent channel={channel} hasControl={hasControl} />
            </div>

            {/* Stage: Arabic Board */}
            <div style={{ display: activeTool === 'arabic-board' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveArabicBoardStudent channel={channel} hasControl={hasControl} />
              </div>
            </div>

            {/* Stage: English Board */}
            <div style={{ display: activeTool === 'english-board' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveEnglishBoardStudent channel={channel} hasControl={hasControl} />
              </div>
            </div>

            {/* Stage: Math Board */}
            <div style={{ display: activeTool === 'math-board' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveMathBoardStudent channel={channel} hasControl={hasControl} />
              </div>
            </div>

            {/* Stage: Flashcards */}
            <div style={{ display: activeTool === 'flashcards' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveFlashcardsStudent channel={channel} hasControl={hasControl} />
              </div>
            </div>

            {/* Stage: Grammar Stage */}
            <div style={{ display: activeTool === 'grammar-stage' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <InteractiveGrammarStage 
                  channel={channel} 
                  hasControl={hasControl} 
                  isTeacher={false} 
                  studentId={deviceId}
                  studentName={studentName}
                />
              </div>
            </div>

            {/* Stage: Wheel */}
            <div style={{ display: activeTool === 'wheel' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveWheelStudent channel={channel} />
              </div>
            </div>

            {/* Stage: Subway Game */}
            <div style={{ display: activeTool === 'subway' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveSubwayStudent channel={channel} isTeacher={false} />
              </div>
            </div>

            {/* Stage: Mario Game */}
            <div style={{ display: activeTool === 'mario' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveMarioStudent channel={channel} isTeacher={false} />
              </div>
            </div>

            {/* Stage: Tank Battle Game */}
            <div style={{ display: activeTool === 'tank-battle' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveTankBattleStudent channel={channel} isTeacher={false} />
              </div>
            </div>

            {/* Stage: Train Game */}
            <div style={{ display: activeTool === 'train' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveTrainGameStudent channel={channel} isTeacher={false} />
              </div>
            </div>

            {/* Stage: Ready Lesson */}
            <div style={{ display: activeTool === 'ready-lesson' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0, backgroundColor: '#0f172a' }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                {activeReadyLesson ? (
                  <LessonContent subject={activeReadySubject} lessonId={activeReadyLesson} isLiveMode={true} liveChannel={channel} isTeacher={false} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                    في انتظار اختيار المعلم للدرس المجهز...
                  </div>
                )}
              </div>
            </div>

            {/* Stage: Ready Pathway Lesson */}
            <div style={{ display: activeTool === 'ready-pathway' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0, backgroundColor: '#0f172a' }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                {activeReadyLesson ? (
                  <PathwayLessonContent moduleIndex={parseInt(activeReadySubject?.split('-')[0] || 0)} lessonIndex={parseInt(activeReadyLesson?.split('-')[0] || 0)} isLiveMode={true} liveChannel={channel} isTeacher={false} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                    في انتظار اختيار المعلم للدرس...
                  </div>
                )}
              </div>
            </div>

            {/* Stage: Leaderboard */}
            <div style={{ display: activeTool === 'leaderboard' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveLeaderboardStudent channel={channel} />
              </div>
            </div>

            {/* Stage: Certificates */}
            <div style={{ display: activeTool === 'certificates' ? 'flex' : 'none', flex: 1, position: 'relative', height: '100%', minHeight: 0 }}>
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <LiveCertificatesStudent channel={channel} deviceId={deviceId} studentName={studentName} />
              </div>
            </div>

            <ReactionOverlay channel={channel} />
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
          {isSidebarOpen && (
            <>
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
                     <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                        إغلاق ✕
                     </button>
                  </div>
                )}
                <LiveSidebar
                  isTeacher={false}
                  students={devices}
                  handRaises={handRaises}
                  isHandRaised={isHandRaised}
                  onToggleHand={handleToggleHand}
                  activeControlDeviceId={hasControl ? deviceId : null}
                  focusMode={focusMode}
                  channel={channel}
                  currentUserId={deviceId}
                  currentUserName={studentName || 'طالب'}
                  activeTab={sidebarTab}
                  setActiveTab={setSidebarTab}
                />
              </div>
            </>
          )}
        </div>

        {/* Remote Audio */}
        {peers.map(p => (
          <RemoteAudio key={p.id} stream={p.stream} />
        ))}
      </div>

      {/* BOTTOM CONTROL BAR */}
      <LiveBottomBar 
        isTeacher={false}
        isMicOn={isMicOn}
        onToggleMic={toggleMic}
        isCameraOn={isCameraOn}
        onToggleCamera={toggleCamera}
        isHandRaised={isHandRaised}
        onToggleHand={handleToggleHand}
        activeTab={sidebarTab}
        onToggleTab={(tab) => {
          if (isSidebarOpen && sidebarTab === tab) {
            setIsSidebarOpen(false)
          } else {
            setSidebarTab(tab)
            setIsSidebarOpen(true)
          }
        }}
        onLeave={() => window.location.href = '/'}
        channel={channel}
        currentUserName={studentName}
      />
    </div>
  )
}
  ;
  content = content.substring(0, returnIndex) + newReturn + content.substring(endIndex);
  fs.writeFileSync(file, content, 'utf8');
} else {
  console.log("Could not find boundaries.");
}
