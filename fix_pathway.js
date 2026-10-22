const fs = require('fs');
const file = 'E:\\ملفات المنصة\\-\\app\\kids-corner\\pathway\\page.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add isCardLayout check
const insertion1 = 
  const whatsappUrl = \https://wa.me/201507952002?text=\\
  const isCardLayout = subject.startsWith('prep') || subject.startsWith('sec');

  const renderCardLayout = () => (
    <div style={{
      minHeight: '100dvh',
      background: '#f8fafc',
      padding: 'clamp(14px, 3vw, 32px) clamp(12px, 3vw, 24px)',
      boxSizing: 'border-box',
      fontFamily: \"'Tajawal', sans-serif\",
      direction: 'rtl'
    }}>
      {/* Header */}
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px', background: 'white', padding: '15px 25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button className="pm-back-btn" onClick={() => {
            if (subject === 'arabic') router.push('/kids-corner/arabic');
            else if (subject === 'math' || subject === 'math_en') router.push('/kids-corner/math');
            else if (subject === 'english') router.push('/kids-corner/english');
            else router.push('/student-dashboard');
          }} style={{ background: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowLeft size={20} color="#334155" />
          </button>
          <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a', fontWeight: '900' }}>{SUBJECT_LABELS[subject] || 'المسار التعليمي'}</h1>
        </div>
        {/* Gamification Stats */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ background: '#fffbeb', color: '#d97706', padding: '8px 15px', borderRadius: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
            <Flame size={18} /> <span className="hide-mobile">{gamification.streak} أيام حماس</span>
          </div>
          <div style={{ background: '#ecfdf5', color: '#10b981', padding: '8px 15px', borderRadius: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
            <Zap size={18} /> <span className="hide-mobile">XP {gamification.xp}</span>
          </div>
        </div>
      </div>

      {/* Content: Vertical list of Unit Cards */}
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        {unitsList.map((u, unitIndex) => {
          const unitNodes = pathData.filter(n => n.unit === u.unit && n.type !== 'unit_start');
          return (
            <div key={u.unit} id={\unit-anchor-\\} style={{ background: 'white', borderRadius: '24px', padding: '25px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', paddingBottom: '15px', borderBottom: '2px solid #f1f5f9' }}>
                <div style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', width: '45px', height: '45px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', flexShrink: 0, boxShadow: '0 4px 10px rgba(5,150,105,0.3)' }}>
                  {unitIndex + 1}
                </div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#0f172a', fontWeight: '900' }}>{u.label}</h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {unitNodes.map((node, indexInUnit) => {
                  const isChest = node.type === 'chest';
                  const chestId = \\_chest_\\;
                  const prevNodeInUnit = indexInUnit > 0 ? unitNodes[indexInUnit - 1] : null;
                  
                  let isUnlocked = false;
                  let isPaidLocked = false;
                  if (userProfile?.role === 'admin' || ['teacher', 'teacher_pro'].includes(userProfile?.role)) {
                    isUnlocked = true;
                  } else if (node.unit === 1) {
                    isUnlocked = prevNodeInUnit ? (completedNodes.includes(prevNodeInUnit.id) || currentProgress > prevNodeInUnit.id) : true;
                  } else if (isSubscribed) {
                    isUnlocked = prevNodeInUnit ? (completedNodes.includes(prevNodeInUnit.id) || currentProgress > prevNodeInUnit.id) : true;
                  } else {
                    const isPrevDone = prevNodeInUnit ? (completedNodes.includes(prevNodeInUnit.id) || currentProgress > prevNodeInUnit.id) : true;
                    if (isPrevDone) isPaidLocked = true;
                  }

                  const isCompleted = completedNodes.includes(node.id) || currentProgress > node.id;
                  const isChestClaimed = gamification.claimedChests?.includes(chestId);
                  
                  if (isChest) {
                    isUnlocked = prevNodeInUnit ? (completedNodes.includes(prevNodeInUnit.id) || currentProgress > prevNodeInUnit.id) : false;
                    if (isChestClaimed) {
                      isUnlocked = true;
                    }
                  }

                  const isCurrent = isUnlocked && !isCompleted;

                  return (
                    <div 
                      key={node.id}
                      onClick={() => handleNodeClick(node, isUnlocked, isPaidLocked, prevNodeInUnit?.title)}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: isCurrent ? '#f0fdf4' : (isCompleted ? '#f8fafc' : '#ffffff'),
                        border: isCurrent ? '2px solid #10b981' : (isCompleted ? '2px solid #e2e8f0' : '2px dashed #cbd5e1'),
                        padding: '16px 20px',
                        borderRadius: '16px',
                        cursor: (isUnlocked || isPaidLocked) ? 'pointer' : 'not-allowed',
                        opacity: isUnlocked || isPaidLocked ? 1 : 0.6,
                        transition: 'all 0.2s ease',
                        transform: shakingNodeId === node.id ? 'translateX(5px)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ 
                          width: '50px', height: '50px', borderRadius: '50%', flexShrink: 0,
                          background: isChest ? '#fef3c7' : (isCompleted ? '#10b981' : (isCurrent ? '#ecfdf5' : '#f1f5f9')),
                          color: isChest ? '#d97706' : (isCompleted ? 'white' : (isCurrent ? '#059669' : '#94a3b8')),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.5rem',
                          boxShadow: isCurrent ? '0 0 15px rgba(16,185,129,0.3)' : 'none'
                        }}>
                          {isCompleted && !isChest ? <CheckCircle2 size={28} /> : (isPaidLocked ? <Lock size={24} /> : (isChest ? <Gift size={24}/> : node.icon))}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', color: isCompleted ? '#64748b' : '#0f172a', fontWeight: 'bold' }}>{node.title}</h3>
                          {isChest && <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#d97706', fontWeight: 'bold' }}>صندوق المكافآت!</p>}
                          {isCurrent && !isChest && <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#059669', fontWeight: 'bold' }}>أكمل من هنا 🚀</p>}
                          {isPaidLocked && <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#d97706', fontWeight: 'bold' }}>متاح للمشتركين فقط 🔒</p>}
                        </div>
                      </div>
                      
                      <div style={{ color: isCompleted ? '#10b981' : '#cbd5e1' }}>
                        {isCompleted ? <CheckCircle2 size={24} /> : (isUnlocked ? <ChevronLeft size={24} color={isCurrent ? '#10b981' : '#94a3b8'} /> : <Lock size={20} />)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );

  return (
    <>
      {isCardLayout ? renderCardLayout() : (
;

content = content.replace("const whatsappUrl = https://wa.me/201507952002?text=\r\n\r\n  return (", insertion1);

// We need to find the start of Modals to close the )} for the Map view!
const modalStartIdx = content.indexOf("{/* MYSTERY REWARD CHEST MODAL");
const contentBeforeModals = content.substring(0, modalStartIdx);
const contentModalsAndAfter = content.substring(modalStartIdx);

// The map view closes its main div right before modals.
// We need to inject )} to close the isCardLayout ? renderCardLayout() : ( before the Modals!
const mapClosingDivIdx = contentBeforeModals.lastIndexOf("</div>");
const newContentBeforeModals = contentBeforeModals.substring(0, mapClosingDivIdx) + "</div>\n      )}\n\n      " + contentBeforeModals.substring(mapClosingDivIdx);

const finalContent = newContentBeforeModals + contentModalsAndAfter;

fs.writeFileSync(file, finalContent, 'utf8');
console.log('Success');