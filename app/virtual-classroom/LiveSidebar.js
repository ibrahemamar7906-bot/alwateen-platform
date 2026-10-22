'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Users, MessageSquare, Hand, Mic, MicOff, 
  Gamepad2, ShieldAlert, Send, Sparkles, 
  Smile, CheckCircle2, Volume2, Crown, X
} from 'lucide-react'

export default function LiveSidebar({
  isTeacher = false,
  students = [],
  handRaises = [],
  onToggleHand = null,
  isHandRaised = false,
  onGrantMic = null,
  onMuteStudent = null,
  onGrantControl = null,
  activeControlDeviceIds = [],
  focusMode = false,
  onToggleFocusMode = null,
  channel = null,
  currentUserId = '',
  currentUserName = '',
  activeTab = 'chat',
  setActiveTab = null,
  onClose = null
}) {
  
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const chatBottomRef = useRef(null)

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)
  const emojiCategories = [
    { label: '😊', name: 'وجوه', emojis: ['😀','😂','🤣','😍','😘','🥰','😊','😇','🙂','😉','😌','😋','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😬','😴','😷','🤕','🤢','🤮','🤧','🥵','🥶','😱','😨','😰','😥','😢','😭','😤','😡','🤬','😈'] },
    { label: '👋', name: 'يدين', emojis: ['👍','👎','👏','🙌','🤝','✌️','🤞','🤟','🤙','👊','✊','👋','🖐️','✋','🤚','👌','🤏','✍️','🙏','💪'] },
    { label: '❤️', name: 'قلوب', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟'] },
    { label: '⭐', name: 'رموز', emojis: ['⭐','🌟','✨','💫','🔥','💡','❓','❗','💯','✅','❌','⚡','🎯','🏆','🥇','🥈','🥉','🎖️','🏅','🎗️'] },
    { label: '🎓', name: 'تعليم', emojis: ['📚','📖','📝','✏️','🖊️','📐','📏','🎓','🧮','💻','🖥️','📊','📈','🔬','🔭','🗂️','📋','📌','📎','🗒️'] },
    { label: '🎮', name: 'ألعاب', emojis: ['🎮','🎯','🎲','🎪','🎨','🎭','🎸','🎺','🎻','🥁','🎬','🎤','🎧','🎼','🎵','🎶','⚽','🏀','🏈','⚾'] },
    { label: '🍕', name: 'طعام', emojis: ['🍕','🍔','🍟','🌭','🍿','🧁','🍩','🍪','🎂','🍰','🍫','🍬','🍭','🍮','🍯','🥤','☕','🍵','🧃','🥛'] },
    { label: '🌍', name: 'طبيعة', emojis: ['🌍','🌙','⭐','🌈','☀️','🌤️','⛅','🌦️','🌧️','⛈️','🌩️','❄️','🌊','🌸','🌺','🌻','🌹','🌷','🌱','🍀'] },
  ]

  const [focusStates, setFocusStates] = useState({}) // studentId -> isFocused
  const [networkStates, setNetworkStates] = useState({}) // studentId -> 'excellent'|'good'|'poor'

  // Listen for incoming chat messages & focus updates
  useEffect(() => {
    if (!channel) return
    let isMounted = true

    const handleChat = ({ payload }) => {
      if (!isMounted || !payload) return
      setMessages(prev => [...prev.slice(-100), payload])
    }

    const handleFocus = ({ payload }) => {
      if (!isMounted || !payload?.studentId) return
      setFocusStates(prev => ({ ...prev, [payload.studentId]: payload.isFocused }))
    }

    const handleNetwork = ({ payload }) => {
      if (!isMounted || !payload?.userId) return
      setNetworkStates(prev => ({ ...prev, [payload.userId]: payload.quality }))
    }

    channel.on('broadcast', { event: 'classroom_chat' }, handleChat)
    channel.on('broadcast', { event: 'student_focus' }, handleFocus)
    channel.on('broadcast', { event: 'student_network_quality' }, handleNetwork)

    return () => {
      isMounted = false
      try {
        if (channel.bindings?.broadcast) {
          const callbacks = [handleChat, handleFocus, handleNetwork]
          const toRemove = channel.bindings.broadcast.filter(b => callbacks.includes(b.callback))
          toRemove.forEach(b => {
            if (channel.channelAdapter && typeof channel.channelAdapter.off === 'function') {
              channel.channelAdapter.off('broadcast', b.ref)
            }
          })
          channel.bindings.broadcast = channel.bindings.broadcast.filter(b => !callbacks.includes(b.callback))
        }
      } catch (e) {
        // safe fallback
      }
    }
  }, [channel])

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'chat' && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, activeTab])

  // Send Chat Message
  const handleSendMessage = (textToSend = null) => {
    const text = textToSend || chatInput.trim()
    if (!text || !channel) return

    if (!isTeacher && focusMode) {
      alert('الدردشة مغلقة حالياً من قِبل المعلم لزيادة التركيز 🔒')
      return
    }

    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      senderId: currentUserId,
      senderName: currentUserName || (isTeacher ? 'المستر إبراهيم عمار' : 'طالب'),
      isTeacher: !!isTeacher,
      text,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }

    // Broadcast message
    try {
      if (channel) {
        const isReady = typeof channel.canPush === 'function'
          ? channel.canPush()
          : (channel.state === 'joined' && !!channel.socket && typeof channel.socket.isConnected === 'function' && channel.socket.isConnected())
        if (isReady) {
          channel.send({
            type: 'broadcast',
            event: 'classroom_chat',
            payload: newMsg
          }).catch(() => {})
        }
      }
      setMessages(prev => [...prev.slice(-100), newMsg])
      if (!textToSend) setChatInput('')
    } catch (e) {
      console.warn('Chat send error:', e)
    }
  }

  // Sort students: Teacher first, then Hand-raisers (by queue order), then alphabetically
  const sortedStudents = [...students].sort((a, b) => {
    if (a.isTeacher && !b.isTeacher) return -1
    if (!a.isTeacher && b.isTeacher) return 1

    const aId = a.id || a.deviceId
    const bId = b.id || b.deviceId
    const aHandIdx = handRaises.indexOf(aId)
    const bHandIdx = handRaises.indexOf(bId)
    
    // Both raised hands: sort by who raised first (lower index)
    if (aHandIdx !== -1 && bHandIdx !== -1) return aHandIdx - bHandIdx
    
    // One raised hand: comes first
    if (aHandIdx !== -1) return -1
    if (bHandIdx !== -1) return 1
    
    // None raised: sort alphabetically
    return (a.name || '').localeCompare(b.name || '', 'ar')
  })

  return (
    <aside style={{
      width: '100%',
      backgroundColor: '#1e293b',
      borderRight: '1.5px solid rgba(5, 150, 105, 0.3)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      userSelect: 'none',
      direction: 'rtl',
      textAlign: 'right',
      fontFamily: "'Tajawal', 'Cairo', sans-serif",
      overflow: 'hidden',
      boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.4)',
      flexShrink: 0
    }}>
      
      {/* Header Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        padding: '6px',
        gap: '4px',
        flexShrink: 0
      }}>
        <button
          onClick={() => setActiveTab('students')}
          style={{
            flex: 1,
            padding: '6px 10px',
            borderRadius: '8px',
            fontWeight: 800,
            fontSize: '0.8rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backgroundColor: activeTab === 'students' ? '#059669' : 'transparent',
            color: activeTab === 'students' ? '#ffffff' : '#94a3b8',
            boxShadow: activeTab === 'students' ? '0 2px 8px rgba(5, 150, 105, 0.3)' : 'none'
          }}
        >
          <Users size={14} />
          <span style={{ fontSize: '11px' }}>{students.length}</span>
          {handRaises.length > 0 && (
            <span style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#10b981',
              color: '#022c22',
              borderRadius: '50%',
              fontSize: '0.75rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {handRaises.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          style={{
            flex: 1,
            padding: '6px 10px',
            borderRadius: '8px',
            fontWeight: 800,
            fontSize: '0.8rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backgroundColor: activeTab === 'chat' ? '#059669' : 'transparent',
            color: activeTab === 'chat' ? '#ffffff' : '#94a3b8',
            boxShadow: activeTab === 'chat' ? '0 2px 8px rgba(5, 150, 105, 0.3)' : 'none'
          }}
        >
          <MessageSquare size={14} />
          <span>الدردشة</span>
        </button>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="إغلاق اللوحة الجانبية"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* TAB 1: STUDENTS LIST */}
      {activeTab === 'students' && (
        <div style={{
          flex: 1,
          padding: '8px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          
          {/* Teacher Focus Mode Indicator */}
          {focusMode && (
            <div style={{
              padding: '8px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: '10px',
              color: '#fcd34d',
              fontSize: '0.75rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <ShieldAlert size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
              <span>وضع التركيز نشط (الدردشة مغلقة للطلاب)</span>
            </div>
          )}

          {/* Teacher Hand-Raise Alert Banner */}
          {handRaises.length > 0 && isTeacher && (
            <div style={{
              padding: '10px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              borderRadius: '12px',
              color: '#d1fae5',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Hand size={16} color="#10b981" />
                <span>{handRaises.length} طالب يطلب التحدث والمشاركة</span>
              </div>
            </div>
          )}

          {/* Student Self Hand Raise Toggle (For Student View) */}
          {!isTeacher && onToggleHand && (
            <button
              onClick={onToggleHand}
              style={{
                width: '100%',
                padding: '10px 16px',
                borderRadius: '14px',
                fontWeight: 900,
                fontSize: '0.88rem',
                border: isHandRaised ? '1.5px solid #10b981' : '1.5px solid #059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: isHandRaised ? '#10b981' : 'rgba(5, 150, 105, 0.2)',
                color: isHandRaised ? '#022c22' : '#d1fae5',
                boxShadow: isHandRaised ? '0 4px 16px rgba(16, 185, 129, 0.4)' : 'none'
              }}
            >
              <Hand size={16} />
              <span>{isHandRaised ? 'تم رفع يدك (بانتظار المعلم) ✋' : 'رفع اليد لطلب التحدث ✋'}</span>
            </button>
          )}

          {/* Empty State */}
          {sortedStudents.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8', fontSize: '0.85rem' }}>
              <Users size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <div>بانتظار انضمام الطلاب للحصة... ⏳</div>
            </div>
          )}

          {/* Students Listing */}
          {sortedStudents.map((st, idx) => {
            const stId = st.deviceId || st.id
            const isRaised = handRaises.includes(stId)
            const hasControl = activeControlDeviceIds.includes(stId)
            const isFocused = focusStates[stId] !== false // Default to true unless explicitly false
            const nq = networkStates[stId] || 'excellent'
            const networkIcon = nq === 'excellent' ? '🟢' : nq === 'good' ? '🟡' : '🔴'
            const networkTitle = nq === 'excellent' ? 'ممتاز' : nq === 'good' ? 'متوسط' : 'ضعيف'

            return (
              <div
                key={stId || idx}
                style={{
                  padding: '6px 8px',
                  borderRadius: '8px',
                  border: isRaised 
                    ? '1.5px solid #10b981' 
                    : hasControl 
                    ? '1.5px solid #3b82f6' 
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: isRaised 
                    ? 'rgba(5, 150, 105, 0.25)' 
                    : hasControl 
                    ? 'rgba(59, 130, 246, 0.2)' 
                    : 'rgba(15, 23, 42, 0.6)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '0.8rem',
                      flexShrink: 0,
                      backgroundColor: st.isTeacher 
                        ? '#d97706' 
                        : isRaised 
                        ? '#10b981' 
                        : '#059669',
                      color: isRaised ? '#022c22' : '#ffffff'
                    }}>
                      {st.isTeacher ? '👨‍🏫' : (st.name ? st.name.charAt(0) : 'ط')}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          color: '#f8fafc',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'block'
                        }}>
                          {st.name || (st.isTeacher ? 'المستر إبراهيم عمار' : 'طالب')}
                        </span>
                        {!st.isTeacher && isTeacher && (
                          <span title={`جودة الاتصال: ${networkTitle}`} style={{ fontSize: '0.65rem' }}>
                            {networkIcon}
                          </span>
                        )}
                        {st.isTeacher && (
                          <span style={{
                            backgroundColor: 'rgba(245, 158, 11, 0.2)',
                            border: '1px solid rgba(245, 158, 11, 0.4)',
                            color: '#fcd34d',
                            fontSize: '0.6rem',
                            padding: '1px 4px',
                            borderRadius: '4px',
                            fontWeight: 800
                          }}>
                            المعلم
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        {!st.isTeacher && isTeacher && (
                          <span style={{
                            fontSize: '0.65rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: isFocused ? '#10b981' : '#ef4444',
                            fontWeight: 'bold'
                          }}>
                            {isFocused ? (
                              <><span style={{display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10b981'}}></span> منتبه</>
                            ) : (
                              <><span style={{display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#ef4444'}}></span> غادر</>
                            )}
                          </span>
                        )}

                        {isRaised && (
                          <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Hand size={10} /> يتحدث
                          </span>
                        )}
                        {hasControl && (
                          <span style={{ fontSize: '0.65rem', color: '#60a5fa', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Gamepad2 size={10} /> تحكم
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Teacher Direct Actions */}
                  {isTeacher && !st.isTeacher && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                      {onGrantMic && (
                        <button
                          onClick={() => onGrantMic(stId)}
                          title="منح إذن التحدث والمايك"
                          style={{
                            padding: '6px',
                            backgroundColor: 'rgba(5, 150, 105, 0.3)',
                            color: '#d1fae5',
                            borderRadius: '8px',
                            border: '1px solid rgba(5, 150, 105, 0.5)',
                            cursor: 'pointer'
                          }}
                        >
                          <Mic size={14} />
                        </button>
                      )}

                      {onGrantControl && (
                        <button
                          onClick={() => onGrantControl(stId)}
                          title={hasControl ? 'سحب التحكم' : 'إعطاء التحكم باللعبة والمسرح'}
                          style={{
                            padding: '6px',
                            borderRadius: '8px',
                            border: hasControl ? '1px solid #60a5fa' : '1px solid rgba(255, 255, 255, 0.1)',
                            backgroundColor: hasControl ? '#2563eb' : 'rgba(255, 255, 255, 0.05)',
                            color: hasControl ? '#ffffff' : '#cbd5e1',
                            cursor: 'pointer'
                          }}
                        >
                          <Gamepad2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* TAB 2: CHAT */}
      {activeTab === 'chat' && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)'
        }}>
          
          {/* Chat Messages Log */}
          <div style={{
            flex: 1,
            padding: '8px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8', fontSize: '0.8rem' }}>
                <MessageSquare size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <div>ابدأ المحادثة وشارك في الحصة! 💬</div>
              </div>
            ) : (
              messages.map(msg => {
                const isMine = msg.senderId === currentUserId
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMine ? 'flex-start' : 'flex-end'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px', fontSize: '0.65rem', color: '#94a3b8' }}>
                      <span style={{ fontWeight: 800, color: '#e2e8f0' }}>{msg.senderName}</span>
                      {msg.isTeacher && (
                        <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', padding: '0 4px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800 }}>
                          المعلم
                        </span>
                      )}
                      <span>• {msg.time}</span>
                    </div>

                    {(() => {
                      const isEmojiOnly = /^[\p{Emoji}\u200d\ufe0f\s]{1,8}$/u.test(msg.text) && msg.text.trim().length <= 4
                      return (
                        <div
                          style={{
                            padding: isEmojiOnly ? '2px 4px' : '6px 10px',
                            borderRadius: '12px',
                            fontSize: isEmojiOnly ? '1.5rem' : '0.8rem',
                            lineHeight: isEmojiOnly ? 1.2 : 1.4,
                            maxWidth: '85%',
                            wordBreak: 'break-word',
                            backgroundColor: isEmojiOnly ? 'transparent' : (msg.isTeacher ? '#064e3b' : isMine ? '#059669' : '#1e293b'),
                            border: isEmojiOnly ? 'none' : (msg.isTeacher ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)'),
                            color: '#ffffff',
                            boxShadow: isEmojiOnly ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.2)'
                          }}
                        >
                          {msg.text}
                        </div>
                      )
                    })()}
                  </div>
                )
              })
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input with Emoji Picker */}
          <div style={{ position: 'relative' }}>
            {/* Emoji Picker Panel */}
            {showEmojiPicker && (
              <div style={{
                position: 'absolute', bottom: '100%', left: 0, right: 0,
                background: '#1e293b', borderTop: '1px solid #374151',
                zIndex: 200, maxHeight: '220px', display: 'flex', flexDirection: 'column',
                boxShadow: '0 -8px 20px rgba(0,0,0,0.4)',
              }}>
                {/* Category Tabs */}
                <div style={{
                  display: 'flex', borderBottom: '1px solid #374151',
                  padding: '4px 6px', gap: '2px', overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                }}>
                  {emojiCategories.map((cat, i) => (
                    <button key={cat.name} onClick={() => setActiveCategory(i)} style={{
                      background: activeCategory === i ? 'rgba(5,150,105,0.2)' : 'transparent',
                      border: activeCategory === i ? '1px solid rgba(5,150,105,0.4)' : '1px solid transparent',
                      borderRadius: '6px', padding: '4px 6px', fontSize: '1rem',
                      cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s',
                    }}>{cat.label}</button>
                  ))}
                </div>
                {/* Emoji Grid */}
                <div style={{
                  flex: 1, overflowY: 'auto', padding: '6px',
                  display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '2px',
                  WebkitOverflowScrolling: 'touch',
                }}>
                  {emojiCategories[activeCategory].emojis.map(emoji => (
                    <button key={emoji} onClick={() => { handleSendMessage(emoji); setShowEmojiPicker(false) }} style={{
                      background: 'transparent', border: 'none', fontSize: '1.2rem',
                      cursor: 'pointer', padding: '4px', borderRadius: '6px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>{emoji}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Row */}
            <div style={{
              padding: '6px 8px',
              backgroundColor: '#1e293b',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {/* Emoji Toggle Button */}
              <button
                onClick={() => setShowEmojiPicker(p => !p)}
                style={{
                  background: showEmojiPicker ? 'rgba(5,150,105,0.2)' : 'transparent',
                  border: showEmojiPicker ? '1px solid rgba(5,150,105,0.4)' : '1px solid #374151',
                  borderRadius: '8px', padding: '6px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: showEmojiPicker ? '#10b981' : '#9ca3af', flexShrink: 0,
                }}
              >
                <Smile size={18} />
              </button>

              <input
                type="text"
                value={chatInput}
                disabled={!isTeacher && focusMode}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                onFocus={() => setShowEmojiPicker(false)}
                placeholder={!isTeacher && focusMode ? '🔒 مقفلة' : 'اكتب رسالتك...'}
                style={{
                  flex: 1,
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(5, 150, 105, 0.4)',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '0.8rem',
                  color: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={(!isTeacher && focusMode) || !chatInput.trim()}
                style={{
                  padding: '9px 12px',
                  backgroundColor: (!isTeacher && focusMode) || !chatInput.trim() ? '#475569' : '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: (!isTeacher && focusMode) || !chatInput.trim() ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)'
                }}
              >
                <Send size={16} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>
          </div>

        </div>
      )}

    </aside>
  )
}



