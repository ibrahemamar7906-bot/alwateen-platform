'use client'
import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '../../utils/supabase'

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' }
  ]
}

// -----------------------------
// TEACHER COMPONENT (Sender)
// -----------------------------
export function TeacherScreenShare({ stream, roomId }) {
  const peersRef = useRef({}) // { studentId: RTCPeerConnection }
  const ssChannelRef = useRef(null)
  const lastRequestRef = useRef({}) // { studentId: timestamp }
  const pendingIceRef = useRef({}) // { studentId: [] }

  useEffect(() => {
    if (!stream || !roomId) return

    let isActive = true

    const ssChannel = supabase.channel(`screenshare-${roomId}`, {
      config: { broadcast: { ack: false } }
    })
    ssChannelRef.current = ssChannel

    const handleMessage = async (payload) => {
      if (!isActive) return

      // 1. Student requested stream
      if (payload.event === 'webrtc_screenshare_request') {
        const { studentId } = payload
        if (!studentId) return

        // Debounce requests from the same student to prevent loop (wait at least 3s)
        const now = Date.now()
        if (lastRequestRef.current[studentId] && now - lastRequestRef.current[studentId] < 3000) {
          return // Ignore rapid requests
        }
        lastRequestRef.current[studentId] = now

        if (peersRef.current[studentId]) {
          peersRef.current[studentId].close()
        }

        const pc = new RTCPeerConnection(RTC_CONFIG)
        peersRef.current[studentId] = pc

        let iceBatch = []
        let iceTimer = null

        pc.onicecandidate = (e) => {
          if (e.candidate && isActive) {
            iceBatch.push(e.candidate)
            if (!iceTimer) {
              iceTimer = setTimeout(() => {
                if (isActive) {
                  ssChannel.send({
                    type: 'broadcast',
                    event: 'webrtc_ice_candidates',
                    payload: { target: studentId, candidates: iceBatch, from: roomId }
                  }).catch(() => {})
                }
                iceBatch = []
                iceTimer = null
              }, 1000) // Batch ICE candidates for 1s
            }
          }
        }

        stream.getTracks().forEach(track => pc.addTrack(track, stream))

        try {
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          if (isActive) {
            ssChannel.send({
              type: 'broadcast',
              event: 'webrtc_offer',
              payload: { target: studentId, offer, from: roomId }
            }).catch(() => {})
          }
        } catch (err) {
          console.error("Error creating offer", err)
        }
      }

      // 2. Student answered
      if (payload.event === 'webrtc_answer' && payload.target === roomId) {
        const pc = peersRef.current[payload.from]
        if (pc && pc.signalingState !== 'stable') {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(payload.answer))
            if (pendingIceRef.current[payload.from]) {
              for (let cand of pendingIceRef.current[payload.from]) { pc.addIceCandidate(new RTCIceCandidate(cand)).catch(()=>{}); }
              pendingIceRef.current[payload.from] = [];
            }
          } catch (err) {}
        }
      }

      // 3. ICE Candidates from student
      if (payload.event === 'webrtc_ice_candidates' && payload.target === roomId) {
        const pc = peersRef.current[payload.from];
        if (pc && payload.candidates) {
          if (pc.remoteDescription && pc.remoteDescription.type) {
            for (let cand of payload.candidates) {
              pc.addIceCandidate(new RTCIceCandidate(cand)).catch(()=>{});
            }
          } else {
            if (!pendingIceRef.current[payload.from]) pendingIceRef.current[payload.from] = [];
            pendingIceRef.current[payload.from].push(...payload.candidates);
          }
        }
      }
    }

    ssChannel
      .on('broadcast', { event: 'webrtc_screenshare_request' }, ({ payload }) => handleMessage({ event: 'webrtc_screenshare_request', ...payload }))
      .on('broadcast', { event: 'webrtc_answer' }, ({ payload }) => handleMessage({ event: 'webrtc_answer', ...payload }))
      .on('broadcast', { event: 'webrtc_ice_candidates' }, ({ payload }) => handleMessage({ event: 'webrtc_ice_candidates', ...payload }))
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' && isActive) {
          // Tell any students who are already waiting that we are ready
          ssChannel.send({
            type: 'broadcast',
            event: 'webrtc_teacher_ready',
            payload: { from: roomId }
          }).catch(() => {})
        }
      })

    return () => {
      isActive = false
      ssChannel.unsubscribe()
      Object.values(peersRef.current).forEach(pc => pc.close())
      peersRef.current = {}
    }
  }, [stream, roomId])

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white' }}>
      <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📺</div>
      <h2 style={{ margin: 0, fontWeight: 800 }}>جاري مشاركة الشاشة P2P...</h2>
      <p style={{ color: '#94a3b8', marginTop: '10px' }}>يتم البث المباشر للطلاب بدون سيرفر وسيط.</p>
    </div>
  )
}

// -----------------------------
// STUDENT COMPONENT (Receiver)
// -----------------------------
export function StudentScreenShare({ studentId, roomId }) {
  const videoRef = useRef(null)
  const pcRef = useRef(null)
  const ssChannelRef = useRef(null)
  const requestSentRef = useRef(false)
  const pendingIceRef = useRef([])
  const [status, setStatus] = useState('جاري الاتصال بالشاشة...')

  useEffect(() => {
    if (!studentId || !roomId) return
    
    let isActive = true

    const ssChannel = supabase.channel(`screenshare-${roomId}`, {
      config: { broadcast: { ack: false } }
    })
    ssChannelRef.current = ssChannel

    const initPeer = () => {
      if (pcRef.current) pcRef.current.close()
      
      const pc = new RTCPeerConnection(RTC_CONFIG)
      pcRef.current = pc

      pc.ontrack = (e) => {
        if (videoRef.current && e.streams[0]) {
          const v = videoRef.current
          v.srcObject = e.streams[0]
          v.muted = true
          v.defaultMuted = true
          v.setAttribute('playsinline', 'true')
          v.setAttribute('webkit-playsinline', 'true')
          v.play().catch(() => {})
          setStatus(prev => prev !== 'متصل' ? 'متصل' : prev)
        }
      }

      let iceBatch = []
      let iceTimer = null

      pc.onicecandidate = (e) => {
        if (e.candidate && isActive) {
          iceBatch.push(e.candidate)
          if (!iceTimer) {
            iceTimer = setTimeout(() => {
              if (isActive) {
                ssChannel.send({
                  type: 'broadcast',
                  event: 'webrtc_ice_candidates',
                  payload: { target: roomId, candidates: iceBatch, from: studentId }
                }).catch(() => {})
              }
              iceBatch = []
              iceTimer = null
            }, 1000)
          }
        }
      }

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          if (isActive) {
            setStatus(prev => prev !== 'انقطع الاتصال، جاري المحاولة...' ? 'انقطع الاتصال، جاري المحاولة...' : prev)
            // Allow re-requesting if connection completely failed
            requestSentRef.current = false
          }
        }
      }
    }

    const handleMessage = async (payload) => {
      if (!isActive) return

      if (payload.event === 'webrtc_teacher_ready') {
        // Teacher just joined, request again
        ssChannel.send({
          type: 'broadcast',
          event: 'webrtc_screenshare_request',
          payload: { studentId }
        }).catch(() => {})
      }

      if (payload.event === 'webrtc_offer' && payload.target === studentId) {
        initPeer()
        const pc = pcRef.current
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
          if (pendingIceRef.current.length > 0) {
            for (let cand of pendingIceRef.current) { pc.addIceCandidate(new RTCIceCandidate(cand)).catch(()=>{}); }
            pendingIceRef.current = [];
          }
          const answer = await pc.createAnswer()
          await pc.setLocalDescription(answer)
          
          if (isActive) {
            ssChannel.send({
              type: 'broadcast',
              event: 'webrtc_answer',
              payload: { target: roomId, answer, from: studentId }
            }).catch(() => {})
          }
        } catch (err) {}
      }

      if (payload.event === 'webrtc_ice_candidates' && payload.target === studentId) {
        if (pcRef.current && payload.candidates) {
          if (pcRef.current.remoteDescription && pcRef.current.remoteDescription.type) {
            for (let cand of payload.candidates) {
              pcRef.current.addIceCandidate(new RTCIceCandidate(cand)).catch(()=>{});
            }
          } else {
            pendingIceRef.current.push(...payload.candidates);
          }
        }
      }
    }

    ssChannel
      .on('broadcast', { event: 'webrtc_teacher_ready' }, ({ payload }) => handleMessage({ event: 'webrtc_teacher_ready', ...payload }))
      .on('broadcast', { event: 'webrtc_offer' }, ({ payload }) => handleMessage({ event: 'webrtc_offer', ...payload }))
      .on('broadcast', { event: 'webrtc_ice_candidates' }, ({ payload }) => handleMessage({ event: 'webrtc_ice_candidates', ...payload }))
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' && isActive && !requestSentRef.current) {
          requestSentRef.current = true
          ssChannel.send({
            type: 'broadcast',
            event: 'webrtc_screenshare_request',
            payload: { studentId }
          }).catch(() => {})
        }
      })

    return () => {
      isActive = false
      ssChannel.unsubscribe()
      if (pcRef.current) pcRef.current.close()
    }
  }, [studentId, roomId])

  return (
    <div 
      onClick={() => {
        if (videoRef.current && videoRef.current.paused) {
          videoRef.current.play().catch(() => {})
        }
      }}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', position: 'relative', cursor: 'pointer' }}
    >
      {status !== 'متصل' && (
        <div style={{ position: 'absolute', zIndex: 10, color: 'white', background: 'rgba(0,0,0,0.7)', padding: '10px 20px', borderRadius: '20px', fontFamily: 'Tajawal' }}>
          {status}
        </div>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        controls={false}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </div>
  )
}
