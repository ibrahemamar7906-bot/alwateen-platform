'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../utils/supabase'
import styles from './page.module.css'
import { jsPDF } from 'jspdf'
import RosterManager from '../../components/TeacherAssistant/RosterManager'

export default function CertificatesGenerator() {
  const router = useRouter()
  const canvasRef = useRef(null)
  
  const [loading, setLoading] = useState(true)
  const [teacher, setTeacher] = useState(null)
  const [isPremium, setIsPremium] = useState(false)
  
  const [maleNames, setMaleNames] = useState('أحمد محمد محمود\nيوسف علي')
  const [femaleNames, setFemaleNames] = useState('فاطمة خالد إبراهيم\nمريم أحمد')
  const [reason, setReason] = useState('التفوق في اختبار منتصف الفصل الدراسي')
  const [date, setDate] = useState(new Date().toLocaleDateString('ar-EG'))
  const [template, setTemplate] = useState('classic') // classic, gold, modern, royal, kids, graduation, creative
  const [customImage, setCustomImage] = useState(null)
  
  const [showRosterManager, setShowRosterManager] = useState(false) // false | 'male' | 'female'
  
  const [designMode, setDesignMode] = useState('fixed') // 'fixed' | 'dynamic'
  const [dynBg, setDynBg] = useState('solid') // solid, gradient, waves, stars, parchment, geometric
  const [dynBorder, setDynBorder] = useState('none') // none, thin, double, tech, ornate
  const [dynPalette, setDynPalette] = useState('blue') // blue, green, red, dark, gold, purple, custom
  const [customHexColor, setCustomHexColor] = useState('#6366f1') // For premium custom colors

  useEffect(() => {
    fetchTeacherData()
  }, [])

  useEffect(() => {
    if (!loading) {
      renderPreview()
    }
  }, [maleNames, femaleNames, reason, date, template, designMode, dynBg, dynBorder, dynPalette, customHexColor, loading, teacher, customImage])

  const fetchTeacherData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!['teacher', 'teacher_pro', 'admin', 'assistant'].includes(profile?.role)) {
        router.push('/student-dashboard')
        return
      }
      let finalId = user.id;
                                    if (profile?.role === 'assistant') {
        const { data: link } = await supabase
          .from('assistant_links')
          .select('teacher_id')
          .eq('assistant_id', user.id)
          .eq('status', 'approved')
          .maybeSingle();
          
        if (link) {
          finalId = link.teacher_id;
        } else {
          router.push('/assistant-link');
          return;
        }
      } 
      setTeacher({
        name: profile.full_name,
        id: finalId
      })
      const now = new Date()
      const subEndDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null
      const isSubscribed = profile.status === 'approved' && (!subEndDate || subEndDate > now)
      if (profile.role === 'admin' || isSubscribed) {
        setIsPremium(true)
      } else {
        setIsPremium(false)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e) => {
    if (!e.target.files[0]) return
    const reader = new FileReader()
    reader.onload = (f) => {
      setCustomImage(f.target.result)
    }
    reader.readAsDataURL(e.target.files[0])
    e.target.value = null
  }

  const renderCertificate = (ctx, canvasWidth, canvasHeight, studentName, gender) => {
    return new Promise((resolve) => {
      const offsetY = customImage ? 60 : 0;

      let nameColor = '#000000'
      let reasonColor = '#2563eb'
      let textColor = '#334155'
      let dateColor = '#64748b'

      if (designMode === 'dynamic') {
        // 1. Background
        if (dynBg === 'solid') {
           ctx.fillStyle = dynPalette === 'dark' ? '#0f172a' : (dynPalette === 'green' ? '#f0fdf4' : '#ffffff');
           ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        } else if (dynBg === 'gradient') {
           const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
           grad.addColorStop(0, dynPalette === 'blue' ? '#eff6ff' : '#fff1f2');
           grad.addColorStop(1, dynPalette === 'blue' ? '#bfdbfe' : '#fecdd3');
           ctx.fillStyle = grad;
           ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        } else if (dynBg === 'waves') {
           ctx.fillStyle = dynPalette === 'dark' ? '#1e293b' : '#f8fafc';
           ctx.fillRect(0, 0, canvasWidth, canvasHeight);
           ctx.fillStyle = dynPalette === 'blue' ? '#3b82f6' : '#ec4899';
           ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(canvasWidth,0); ctx.bezierCurveTo(canvasWidth-100,200, 100,50, 0,300); ctx.fill();
        } else if (dynBg === 'stars') {
           ctx.fillStyle = '#170529'; ctx.fillRect(0, 0, canvasWidth, canvasHeight);
           ctx.fillStyle = '#ffffff';
           for(let i=0; i<40; i++) { ctx.beginPath(); ctx.arc(Math.random()*canvasWidth, Math.random()*canvasHeight, Math.random()*3, 0, Math.PI*2); ctx.fill(); }
        } else if (dynBg === 'parchment') {
           ctx.fillStyle = '#fef3c7'; ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        } else if (dynBg === 'geometric') {
           ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvasWidth, canvasHeight);
           ctx.fillStyle = dynPalette === 'green' ? '#22c55e' : '#f59e0b';
           ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(300,0); ctx.lineTo(0,300); ctx.fill();
           ctx.fillStyle = dynPalette === 'blue' ? '#3b82f6' : '#8b5cf6';
           ctx.beginPath(); ctx.moveTo(canvasWidth,canvasHeight); ctx.lineTo(canvasWidth-300,canvasHeight); ctx.lineTo(canvasWidth,canvasHeight-300); ctx.fill();
        }

        // 2. Border
        ctx.strokeStyle = dynPalette === 'dark' || dynBg === 'stars' ? '#fbbf24' : (dynPalette === 'red' ? '#e11d48' : '#1e3a8a');
        if (dynBorder === 'thin') {
           ctx.lineWidth = 2; ctx.strokeRect(40, 40, canvasWidth-80, canvasHeight-80);
        } else if (dynBorder === 'double') {
           ctx.lineWidth = 8; ctx.strokeRect(30, 30, canvasWidth-60, canvasHeight-60);
           ctx.lineWidth = 2; ctx.strokeRect(45, 45, canvasWidth-90, canvasHeight-90);
        } else if (dynBorder === 'tech') {
           ctx.lineWidth = 4;
           ctx.beginPath(); ctx.moveTo(30,100); ctx.lineTo(30,30); ctx.lineTo(100,30); ctx.stroke();
           ctx.beginPath(); ctx.moveTo(canvasWidth-100,30); ctx.lineTo(canvasWidth-30,30); ctx.lineTo(canvasWidth-30,100); ctx.stroke();
           ctx.beginPath(); ctx.moveTo(30,canvasHeight-100); ctx.lineTo(30,canvasHeight-30); ctx.lineTo(100,canvasHeight-30); ctx.stroke();
           ctx.beginPath(); ctx.moveTo(canvasWidth-100,canvasHeight-30); ctx.lineTo(canvasWidth-30,canvasHeight-30); ctx.lineTo(canvasWidth-30,canvasHeight-100); ctx.stroke();
        } else if (dynBorder === 'ornate') {
           ctx.lineWidth = 15; ctx.setLineDash([20, 20]); ctx.strokeRect(30, 30, canvasWidth-60, canvasHeight-60); ctx.setLineDash([]);
        }

        // Title
        ctx.fillStyle = ctx.strokeStyle;
        if (dynPalette === 'custom') {
           ctx.strokeStyle = customHexColor;
           ctx.fillStyle = customHexColor;
        }

        ctx.font = 'bold 70px "Tajawal", "Cairo", Arial';
        ctx.textAlign = 'center';
        ctx.fillText('شَهَادَةُ تَقْدِير وَتَمَيُّز', canvasWidth / 2, 160 + offsetY);

        textColor = (dynBg === 'stars' || dynPalette === 'dark') ? '#cbd5e1' : '#334155';
        nameColor = dynPalette === 'custom' ? customHexColor : ((dynBg === 'stars' || dynPalette === 'dark') ? '#ffffff' : (dynPalette === 'blue' ? '#2563eb' : '#000000'));
        reasonColor = ctx.strokeStyle;
        dateColor = textColor;
      } else {
        if (template === 'classic') {
          ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        ctx.strokeStyle = '#1e3a8a'
        ctx.lineWidth = 15
        ctx.strokeRect(30, 30, canvasWidth - 60, canvasHeight - 60)
        ctx.lineWidth = 2
        ctx.strokeRect(40, 40, canvasWidth - 80, canvasHeight - 80)
        
        ctx.fillStyle = '#1e3a8a'
        ctx.font = 'bold 60px "Tajawal", "Cairo", Arial'
        ctx.textAlign = 'center'
        ctx.fillText('شهادة تقدير وتفوق', canvasWidth / 2, 150 + offsetY)
        
        ctx.fillStyle = '#334155'
      } else if (template === 'gold') {
        ctx.fillStyle = '#0f172a'
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 20
        ctx.strokeRect(30, 30, canvasWidth - 60, canvasHeight - 60)
        ctx.strokeStyle = '#f59e0b'
        ctx.lineWidth = 4
        ctx.strokeRect(55, 55, canvasWidth - 110, canvasHeight - 110)
        
        ctx.fillStyle = '#fbbf24'
        ctx.font = 'bold 65px "Tajawal", "Cairo", Arial'
        ctx.textAlign = 'center'
        ctx.fillText('شَهَادَةُ تَقْدِير', canvasWidth / 2, 160 + offsetY)
        
        ctx.fillStyle = '#cbd5e1'
      } else if (template === 'modern') {
        ctx.fillStyle = '#f8fafc'
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        ctx.fillStyle = '#3b82f6'
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(300, 0)
        ctx.lineTo(0, 300)
        ctx.fill()
        
        ctx.fillStyle = '#10b981'
        ctx.beginPath()
        ctx.moveTo(canvasWidth, canvasHeight)
        ctx.lineTo(canvasWidth - 300, canvasHeight)
        ctx.lineTo(canvasWidth, canvasHeight - 300)
        ctx.fill()
        
        ctx.strokeStyle = '#e2e8f0'
        ctx.lineWidth = 5
        ctx.strokeRect(30, 30, canvasWidth - 60, canvasHeight - 60)

        ctx.fillStyle = '#1e293b'
        ctx.font = 'bold 60px "Tajawal", "Cairo", Arial'
        ctx.textAlign = 'center'
        ctx.fillText('شهادة شكر وتقدير', canvasWidth / 2, 150 + offsetY)
        
        ctx.fillStyle = '#475569'
      } else if (template === 'royal') {
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        ctx.strokeStyle = '#d4af37'
        ctx.lineWidth = 8
        ctx.strokeRect(40, 40, canvasWidth - 80, canvasHeight - 80)
        ctx.lineWidth = 2
        ctx.strokeRect(50, 50, canvasWidth - 100, canvasHeight - 100)
        ctx.strokeRect(30, 30, canvasWidth - 60, canvasHeight - 60)

        ctx.fillStyle = '#d4af37'
        ctx.font = 'bold 70px "Tajawal", "Cairo", Arial'
        ctx.textAlign = 'center'
        ctx.fillText('شَهَادَةُ تَمَيُّز', canvasWidth / 2, 160 + offsetY)
        
        ctx.fillStyle = '#e2e8f0'
      } else if (template === 'kids') {
        ctx.fillStyle = '#fdf4ff'
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        ctx.fillStyle = '#fde047'
        ctx.beginPath(); ctx.arc(100, 100, 80, 0, 2*Math.PI); ctx.fill();
        ctx.fillStyle = '#67e8f9'
        ctx.beginPath(); ctx.arc(canvasWidth - 100, 150, 60, 0, 2*Math.PI); ctx.fill();
        ctx.fillStyle = '#f472b6'
        ctx.beginPath(); ctx.arc(150, canvasHeight - 100, 70, 0, 2*Math.PI); ctx.fill();
        ctx.fillStyle = '#a78bfa'
        ctx.beginPath(); ctx.arc(canvasWidth - 150, canvasHeight - 120, 90, 0, 2*Math.PI); ctx.fill();
        
        ctx.strokeStyle = '#f472b6'
        ctx.lineWidth = 10
        ctx.setLineDash([20, 20])
        ctx.strokeRect(40, 40, canvasWidth - 80, canvasHeight - 80)
        ctx.setLineDash([])

        ctx.fillStyle = '#db2777'
        ctx.font = 'bold 65px "Tajawal", "Cairo", Arial'
        ctx.textAlign = 'center'
        ctx.fillText('بطل الأبطال!', canvasWidth / 2, 160 + offsetY)
        
        ctx.fillStyle = '#334155'
      } else if (template === 'graduation') {
        ctx.fillStyle = '#1e3a8a' // Deep blue
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        ctx.strokeStyle = '#e2e8f0' // Silver
        ctx.lineWidth = 12
        ctx.strokeRect(40, 40, canvasWidth - 80, canvasHeight - 80)
        ctx.lineWidth = 3
        ctx.strokeRect(60, 60, canvasWidth - 120, canvasHeight - 120)

        ctx.fillStyle = '#e2e8f0'
        ctx.font = 'bold 70px "Tajawal", "Cairo", Arial'
        ctx.textAlign = 'center'
        ctx.fillText('شَهَادَةُ نَجَاح وَتَخَرُّج', canvasWidth / 2, 160 + offsetY)
        
        ctx.fillStyle = '#f1f5f9'
      } else if (template === 'creative') {
        ctx.fillStyle = '#faf5ff' // Light violet
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        // Abstract waves/shapes
        ctx.fillStyle = '#c084fc'
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(400, 0)
        ctx.bezierCurveTo(300, 100, 100, 200, 0, 300)
        ctx.fill()
        
        ctx.fillStyle = '#f472b6'
        ctx.beginPath()
        ctx.moveTo(canvasWidth, canvasHeight)
        ctx.lineTo(canvasWidth - 400, canvasHeight)
        ctx.bezierCurveTo(canvasWidth - 300, canvasHeight - 100, canvasWidth - 100, canvasHeight - 200, canvasWidth, canvasHeight - 300)
        ctx.fill()
        
        ctx.strokeStyle = '#e9d5ff'
        ctx.lineWidth = 6
        ctx.strokeRect(30, 30, canvasWidth - 60, canvasHeight - 60)

        ctx.fillStyle = '#7e22ce'
        ctx.font = 'bold 70px "Tajawal", "Cairo", Arial'
        ctx.textAlign = 'center'
        ctx.fillText('شَهَادَةُ إِبْدَاع وَتَمَيُّز', canvasWidth / 2, 160 + offsetY)
        
        ctx.fillStyle = '#4c1d95'
      } else if (template === 'elegant') {
        ctx.fillStyle = '#fdfbf7' // Off-white warm background
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        ctx.strokeStyle = '#064e3b' // Dark green
        ctx.lineWidth = 2
        ctx.strokeRect(40, 40, canvasWidth - 80, canvasHeight - 80)
        ctx.strokeRect(48, 48, canvasWidth - 96, canvasHeight - 96)
        
        // Simple corners
        ctx.fillStyle = '#d4af37' // Gold
        ctx.fillRect(35, 35, 20, 20)
        ctx.fillRect(canvasWidth - 55, 35, 20, 20)
        ctx.fillRect(35, canvasHeight - 55, 20, 20)
        ctx.fillRect(canvasWidth - 55, canvasHeight - 55, 20, 20)

        ctx.fillStyle = '#064e3b'
        ctx.font = 'bold 70px "Tajawal", "Cairo", Arial'
        ctx.textAlign = 'center'
        ctx.fillText('شَهَادَةُ تَقْدِير وَاعْتِزَاز', canvasWidth / 2, 160 + offsetY)
        
        ctx.fillStyle = '#334155'
      } else if (template === 'tech') {
        ctx.fillStyle = '#0f172a' // Slate 900
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        // Tech lines
        ctx.strokeStyle = '#0ea5e9' // Sky blue
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(30, 100); ctx.lineTo(30, 30); ctx.lineTo(100, 30)
        ctx.moveTo(canvasWidth - 100, 30); ctx.lineTo(canvasWidth - 30, 30); ctx.lineTo(canvasWidth - 30, 100)
        ctx.moveTo(30, canvasHeight - 100); ctx.lineTo(30, canvasHeight - 30); ctx.lineTo(100, canvasHeight - 30)
        ctx.moveTo(canvasWidth - 100, canvasHeight - 30); ctx.lineTo(canvasWidth - 30, canvasHeight - 30); ctx.lineTo(canvasWidth - 30, canvasHeight - 100)
        ctx.stroke()
        
        ctx.fillStyle = '#38bdf8'
        ctx.beginPath(); ctx.arc(30, 30, 6, 0, 2*Math.PI); ctx.fill();
        ctx.beginPath(); ctx.arc(canvasWidth - 30, 30, 6, 0, 2*Math.PI); ctx.fill();
        ctx.beginPath(); ctx.arc(30, canvasHeight - 30, 6, 0, 2*Math.PI); ctx.fill();
        ctx.beginPath(); ctx.arc(canvasWidth - 30, canvasHeight - 30, 6, 0, 2*Math.PI); ctx.fill();

        ctx.fillStyle = '#38bdf8'
        ctx.font = 'bold 65px "Tajawal", "Cairo", Arial'
        ctx.textAlign = 'center'
        ctx.fillText('شَهَادَةُ ابْتِكَار وَتَفَوُّق', canvasWidth / 2, 160 + offsetY)
        
        ctx.fillStyle = '#94a3b8'
      } else if (template === 'luxury') {
        ctx.fillStyle = '#4c0519' // Rose 950 (Deep Burgundy)
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        ctx.strokeStyle = '#fbbf24' // Gold
        ctx.lineWidth = 10
        ctx.strokeRect(50, 50, canvasWidth - 100, canvasHeight - 100)
        
        ctx.lineWidth = 1
        ctx.strokeRect(65, 65, canvasWidth - 130, canvasHeight - 130)
        
        // Corner decorative circles
        ctx.fillStyle = '#4c0519'
        ctx.strokeStyle = '#fbbf24'
        ctx.lineWidth = 4
        ctx.beginPath(); ctx.arc(50, 50, 30, 0, 2*Math.PI); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(canvasWidth - 50, 50, 30, 0, 2*Math.PI); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(50, canvasHeight - 50, 30, 0, 2*Math.PI); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(canvasWidth - 50, canvasHeight - 50, 30, 0, 2*Math.PI); ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#fbbf24'
        ctx.font = 'bold 75px "Tajawal", "Cairo", Arial'
        ctx.textAlign = 'center'
        ctx.fillText('شَهَادَةُ فَخْر وَامْتِيَاز', canvasWidth / 2, 160 + offsetY)
        
        ctx.fillStyle = '#cbd5e1'
      } else if (template === 'nature') {
        ctx.fillStyle = '#ecfccb' // Pale green
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        ctx.fillStyle = '#86efac' // light green waves
        ctx.beginPath()
        ctx.moveTo(0, 0); ctx.lineTo(canvasWidth, 0); ctx.bezierCurveTo(canvasWidth - 100, 150, 100, 50, 0, 200);
        ctx.fill()
        
        ctx.fillStyle = '#22c55e' // darker green
        ctx.beginPath()
        ctx.moveTo(0, canvasHeight); ctx.lineTo(canvasWidth, canvasHeight); ctx.bezierCurveTo(canvasWidth - 200, canvasHeight - 200, 200, canvasHeight - 50, 0, canvasHeight - 150);
        ctx.fill()

        ctx.strokeStyle = '#14532d'
        ctx.lineWidth = 2
        ctx.strokeRect(40, 40, canvasWidth - 80, canvasHeight - 80)

        ctx.fillStyle = '#14532d'
        ctx.font = 'bold 70px "Tajawal", "Cairo", Arial'
        ctx.textAlign = 'center'
        ctx.fillText('شَهَادَةُ نُمُوّ وَعَطَاء', canvasWidth / 2, 160 + offsetY)
        
        ctx.fillStyle = '#166534'
      } else if (template === 'space') {
        ctx.fillStyle = '#170529' // Deep space purple
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        // Moon
        ctx.fillStyle = '#fef08a'
        ctx.beginPath(); ctx.arc(150, 150, 60, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#170529'
        ctx.beginPath(); ctx.arc(170, 130, 50, 0, Math.PI*2); ctx.fill(); // crescent effect
        
        // Stars
        ctx.fillStyle = '#ffffff'
        const stars = [[300, 100], [450, 50], [600, 150], [800, 80], [900, 200], [200, canvasHeight - 100], [500, canvasHeight - 150], [800, canvasHeight - 80]]
        stars.forEach(([sx, sy]) => {
          ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI*2); ctx.fill();
        });

        ctx.strokeStyle = '#c084fc'
        ctx.lineWidth = 3
        ctx.strokeRect(30, 30, canvasWidth - 60, canvasHeight - 60)

        ctx.fillStyle = '#22d3ee'
        ctx.font = 'bold 70px "Tajawal", "Cairo", Arial'
        ctx.textAlign = 'center'
        ctx.fillText('شَهَادَةُ طُمُوح وَآفَاق', canvasWidth / 2, 160 + offsetY)
        
        ctx.fillStyle = '#e9d5ff'
      } else if (template === 'retro') {
        ctx.fillStyle = '#fef3c7' // Parchment
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        ctx.strokeStyle = '#78350f' // Brown
        ctx.lineWidth = 6
        ctx.strokeRect(50, 50, canvasWidth - 100, canvasHeight - 100)
        ctx.lineWidth = 2
        ctx.strokeRect(60, 60, canvasWidth - 120, canvasHeight - 120)
        
        // Corner crosses
        ctx.beginPath()
        ctx.moveTo(30, 50); ctx.lineTo(70, 50); ctx.moveTo(50, 30); ctx.lineTo(50, 70);
        ctx.moveTo(canvasWidth - 70, 50); ctx.lineTo(canvasWidth - 30, 50); ctx.moveTo(canvasWidth - 50, 30); ctx.lineTo(canvasWidth - 50, 70);
        ctx.moveTo(30, canvasHeight - 50); ctx.lineTo(70, canvasHeight - 50); ctx.moveTo(50, canvasHeight - 70); ctx.lineTo(50, canvasHeight - 30);
        ctx.moveTo(canvasWidth - 70, canvasHeight - 50); ctx.lineTo(canvasWidth - 30, canvasHeight - 50); ctx.moveTo(canvasWidth - 50, canvasHeight - 70); ctx.lineTo(canvasWidth - 50, canvasHeight - 30);
        ctx.stroke()

        ctx.fillStyle = '#451a03'
        ctx.font = 'bold 75px "Tajawal", "Cairo", Arial'
        ctx.textAlign = 'center'
        ctx.fillText('شَهَادَةٌ كِلَاسِيكِيَّة', canvasWidth / 2, 160 + offsetY)
        
        ctx.fillStyle = '#78350f'
      } else if (template === 'geometric') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        // Left geometry
        ctx.fillStyle = '#ec4899' // Pink
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(200, 0); ctx.lineTo(0, 200); ctx.fill();
        ctx.fillStyle = '#eab308' // Yellow
        ctx.beginPath(); ctx.moveTo(0, 200); ctx.lineTo(150, 100); ctx.lineTo(0, 400); ctx.fill();
        
        // Right geometry
        ctx.fillStyle = '#3b82f6' // Blue
        ctx.beginPath(); ctx.moveTo(canvasWidth, canvasHeight); ctx.lineTo(canvasWidth - 250, canvasHeight); ctx.lineTo(canvasWidth, canvasHeight - 250); ctx.fill();
        ctx.fillStyle = '#14b8a6' // Teal
        ctx.beginPath(); ctx.moveTo(canvasWidth, canvasHeight - 250); ctx.lineTo(canvasWidth - 150, canvasHeight - 150); ctx.lineTo(canvasWidth, canvasHeight - 400); ctx.fill();

        ctx.strokeStyle = '#f3f4f6'
        ctx.lineWidth = 15
        ctx.strokeRect(30, 30, canvasWidth - 60, canvasHeight - 60)

        ctx.fillStyle = '#1f2937'
        ctx.font = 'bold 70px "Tajawal", "Cairo", Arial'
        ctx.textAlign = 'center'
        ctx.fillText('شَهَادَةُ حَيَوِيَّة وَتَأَلُّق', canvasWidth / 2, 160 + offsetY)
        
        ctx.fillStyle = '#4b5563'
      } else if (template === 'minimalist') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        ctx.strokeStyle = '#94a3b8'
        ctx.lineWidth = 1
        ctx.strokeRect(50, 50, canvasWidth - 100, canvasHeight - 100)

        ctx.fillStyle = '#334155'
        ctx.font = 'bold 60px "Tajawal", "Cairo", Arial'
        ctx.textAlign = 'center'
        ctx.fillText('شهادة إنجاز', canvasWidth / 2, 160 + offsetY)
        
        ctx.fillStyle = '#64748b'
      } else if (template === 'diamond') {
        ctx.fillStyle = '#1e1b4b' // deep indigo
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        
        ctx.strokeStyle = '#818cf8'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(canvasWidth / 2, 20)
        ctx.lineTo(canvasWidth - 20, canvasHeight / 2)
        ctx.lineTo(canvasWidth / 2, canvasHeight - 20)
        ctx.lineTo(20, canvasHeight / 2)
        ctx.closePath()
        ctx.stroke()

        ctx.fillStyle = '#c7d2fe'
        ctx.font = 'bold 70px "Tajawal", "Cairo", Arial'
        ctx.textAlign = 'center'
        ctx.fillText('شَهَادَةُ المَاسَة الفَرِيدَة', canvasWidth / 2, 160 + offsetY)
        
        ctx.fillStyle = '#a5b4fc'
      }

      textColor = (template === 'gold' || template === 'royal' || template === 'graduation' || template === 'luxury' || template === 'tech' || template === 'space') ? '#cbd5e1' : '#334155'
      dateColor = (template === 'gold' || template === 'royal' || template === 'graduation') ? '#94a3b8' : '#64748b'

      if (template === 'gold') nameColor = '#ffffff'
      if (template === 'modern') nameColor = '#3b82f6'
      if (template === 'royal') nameColor = '#d4af37'
      if (template === 'kids') nameColor = '#7e22ce'
      if (template === 'graduation') nameColor = '#ffffff'
      if (template === 'creative') nameColor = '#db2777'
      if (template === 'elegant') nameColor = '#064e3b'
      if (template === 'tech') nameColor = '#0ea5e9'
      if (template === 'luxury') nameColor = '#ffffff'
      if (template === 'nature') nameColor = '#14532d'
      if (template === 'space') nameColor = '#ffffff'
      if (template === 'retro') nameColor = '#451a03'
      if (template === 'geometric') nameColor = '#ec4899'
      if (template === 'minimalist') nameColor = '#0f172a'
      if (template === 'diamond') nameColor = '#ffffff'

      if (template === 'gold') reasonColor = '#fbbf24'
      if (template === 'modern') reasonColor = '#10b981'
      if (template === 'royal') reasonColor = '#d4af37'
      if (template === 'kids') reasonColor = '#db2777'
      if (template === 'graduation') reasonColor = '#93c5fd'
      if (template === 'creative') reasonColor = '#a855f7'
      if (template === 'elegant') reasonColor = '#d4af37'
      if (template === 'tech') reasonColor = '#38bdf8'
      if (template === 'luxury') reasonColor = '#fbbf24'
      if (template === 'nature') reasonColor = '#166534'
      if (template === 'space') reasonColor = '#fef08a'
      if (template === 'retro') reasonColor = '#78350f'
      if (template === 'geometric') reasonColor = '#3b82f6'
      if (template === 'minimalist') reasonColor = '#475569'
      if (template === 'diamond') reasonColor = '#818cf8'
      
      } // End of else block for fixed designs

      const textIntro = gender === 'female' ? 'يسرنا أن نتقدم بخالص الشكر والتقدير للطالبة:' : 'يسرنا أن نتقدم بخالص الشكر والتقدير للطالب:';
      ctx.fillStyle = textColor;
      ctx.font = '35px "Tajawal", "Cairo", Arial'
      ctx.fillText(textIntro, canvasWidth / 2, 280 + offsetY)
      
      ctx.font = 'bold 70px "Tajawal", "Cairo", Arial'
      ctx.fillStyle = nameColor
      ctx.fillText(studentName || 'اسم الطالب', canvasWidth / 2, 380 + offsetY)
      
      const textReason = gender === 'female' ? 'وذلك تقديراً لتفوقها واجتهادها في:' : 'وذلك تقديراً لتفوقه واجتهاده في:';
      ctx.font = '35px "Tajawal", "Cairo", Arial'
      ctx.fillStyle = textColor
      ctx.fillText(textReason, canvasWidth / 2, 480 + offsetY)
      
      ctx.font = 'bold 45px "Tajawal", "Cairo", Arial'
      ctx.fillStyle = reasonColor
      ctx.fillText(reason || '...', canvasWidth / 2, 550 + offsetY)
      
      ctx.font = '28px "Tajawal", "Cairo", Arial'
      ctx.fillStyle = dateColor
      ctx.fillText(`التاريخ: ${date}`, 250, 680 + (offsetY/2))
      ctx.fillText(`توقيع المعلم: أ. ${teacher?.name || ''}`, canvasWidth - 250, 680 + (offsetY/2))

      if (customImage) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          ctx.save()
          ctx.beginPath()
          ctx.arc(canvasWidth / 2, 90, 60, 0, Math.PI * 2, true)
          ctx.closePath()
          ctx.clip()
          
          const imgAspect = img.width / img.height
          let drawW = 120, drawH = 120
          if (imgAspect > 1) {
            drawW = 120 * imgAspect
          } else {
            drawH = 120 / imgAspect
          }
          ctx.drawImage(img, canvasWidth / 2 - drawW / 2, 90 - drawH / 2, drawW, drawH)
          ctx.restore()
          
          ctx.beginPath()
          ctx.arc(canvasWidth / 2, 90, 60, 0, Math.PI * 2, true)
          ctx.lineWidth = 4
          ctx.strokeStyle = (template === 'gold' || template === 'royal') ? '#fbbf24' : (template === 'graduation' ? '#e2e8f0' : '#2563eb')
          ctx.stroke()
          
          resolve()
        }
        img.onerror = resolve
        img.src = customImage
      } else {
        resolve()
      }
    })
  }

  const getStudentList = () => {
    const males = maleNames.split('\n').filter(n => n.trim() !== '').map(n => ({name: n.trim(), gender: 'male'}))
    const females = femaleNames.split('\n').filter(n => n.trim() !== '').map(n => ({name: n.trim(), gender: 'female'}))
    return [...males, ...females]
  }

  const renderPreview = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const students = getStudentList()
    const firstStudent = students[0] || {name: 'اسم الطالب', gender: 'male'}
    await renderCertificate(ctx, canvas.width, canvas.height, firstStudent.name, firstStudent.gender)
  }

  const handleDownloadPNG = async () => {
    const students = getStudentList()
    if (students.length === 0) return alert('يرجى كتابة اسم طالب واحد على الأقل')
    
    if (students.length > 1) {
      alert('سيتم تحميل صورة لأول اسم فقط. لتحميل جميع الطلاب استخدم زر PDF.')
    }
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    await renderCertificate(ctx, canvas.width, canvas.height, students[0].name, students[0].gender)
    
    const dataURL = canvas.toDataURL('image/png', 1.0)
    const link = document.createElement('a')
    link.download = `شهادة_${students[0].name}.png`
    link.href = dataURL
    link.click()
  }

  const handleDownloadPDF = async () => {
    const students = getStudentList()
    if (students.length === 0) return alert('يرجى كتابة اسم طالب واحد على الأقل')

    const pdf = new jsPDF('landscape', 'px', [1123, 794])
    const canvas = document.createElement('canvas')
    canvas.width = 1123
    canvas.height = 794
    const ctx = canvas.getContext('2d')

    for (let i = 0; i < students.length; i++) {
      await renderCertificate(ctx, canvas.width, canvas.height, students[i].name, students[i].gender)
      const imgData = canvas.toDataURL('image/png', 1.0)
      
      if (i > 0) {
        pdf.addPage([1123, 794], 'landscape')
      }
      pdf.addImage(imgData, 'PNG', 0, 0, 1123, 794)
    }

    pdf.save('الشهادات.pdf')
  }

  if (loading) return <div style={{padding: '50px', textAlign: 'center'}}>جاري التحميل...</div>

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.header}>
          <h2>صانع الشهادات 🎓</h2>
          <p>قم بتوليد شهادات احترافية بضغطة زر</p>
        </div>

        <div className={styles.formGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ margin: 0 }}>أسماء الطلاب (مذكر - كل اسم في سطر)</label>
            <button 
              onClick={() => setShowRosterManager('male')}
              style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              📂 حقيبة القوائم الذكية
            </button>
          </div>
          <textarea 
            className={styles.textarea} 
            value={maleNames} 
            onChange={(e) => setMaleNames(e.target.value)}
            placeholder="أحمد محمد&#10;يوسف علي"
            style={{minHeight: '80px'}}
          />
        </div>

        <div className={styles.formGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ margin: 0 }}>أسماء الطالبات (مؤنث - كل اسم في سطر)</label>
            <button 
              onClick={() => setShowRosterManager('female')}
              style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              📂 حقيبة القوائم الذكية
            </button>
          </div>
          <textarea 
            className={styles.textarea} 
            value={femaleNames} 
            onChange={(e) => setFemaleNames(e.target.value)}
            placeholder="فاطمة خالد&#10;مريم أحمد"
            style={{minHeight: '80px'}}
          />
        </div>

        <div className={styles.formGroup}>
          <label>سبب التكريم</label>
          <input 
            type="text" 
            className={styles.input} 
            value={reason} 
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>التاريخ</label>
          <input 
            type="text" 
            className={styles.input} 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label>شعار أو صورة (اختياري)</label>
          <input 
            type="file" 
            accept="image/*"
            className={styles.input} 
            onChange={handleImageUpload}
          />
          {customImage && (
            <button onClick={() => setCustomImage(null)} style={{background:'none', border:'none', color:'red', cursor:'pointer', textAlign:'right', fontSize:'0.8rem'}}>إزالة الصورة ❌</button>
          )}
        </div>

        <div className={styles.formGroup} style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
             <button onClick={() => setDesignMode('fixed')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: designMode === 'fixed' ? '#3b82f6' : '#e2e8f0', color: designMode === 'fixed' ? 'white' : '#475569', cursor: 'pointer', fontWeight: 'bold' }}>قوالب جاهزة</button>
             <button onClick={() => setDesignMode('dynamic')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: designMode === 'dynamic' ? '#10b981' : '#e2e8f0', color: designMode === 'dynamic' ? 'white' : '#475569', cursor: 'pointer', fontWeight: 'bold' }}>محرك ذكي 👑</button>
          </div>

          {designMode === 'fixed' && (
            <>
              <label>التصميم الجاهز</label>
              <select className={styles.select} value={template} onChange={(e) => setTemplate(e.target.value)}>
                <option value="classic">الكلاسيكي (مجاني)</option>
                <option value="kids">أطفال ومرح (مجاني)</option>
                <option value="minimalist">بسيط ونظيف (مجاني)</option>
                <option value="gold" disabled={!isPremium}>الذهبي الملكي (مدفوع)</option>
                <option value="modern" disabled={!isPremium}>العصري الاحترافي (مدفوع)</option>
                <option value="royal" disabled={!isPremium}>الملكي الفاخر (مدفوع)</option>
                <option value="graduation" disabled={!isPremium}>نجاح وتخرج (مدفوع)</option>
                <option value="creative" disabled={!isPremium}>إبداع وتميز (مدفوع)</option>
                <option value="elegant" disabled={!isPremium}>أنيق وراقي (مدفوع)</option>
                <option value="tech" disabled={!isPremium}>تكنولوجي رقمي (مدفوع)</option>
                <option value="luxury" disabled={!isPremium}>فخامة مخملية (مدفوع)</option>
                <option value="nature" disabled={!isPremium}>طبيعة وسلام (مدفوع)</option>
                <option value="space" disabled={!isPremium}>فضاء ونجوم (مدفوع)</option>
                <option value="retro" disabled={!isPremium}>كلاسيكي عتيق (مدفوع)</option>
                <option value="geometric" disabled={!isPremium}>هندسي ملون (مدفوع)</option>
                <option value="diamond" disabled={!isPremium}>التصميم الماسي (مدفوع)</option>
              </select>
            </>
          )}

          {designMode === 'dynamic' && (
            <div style={{ opacity: isPremium ? 1 : 0.5, pointerEvents: isPremium ? 'auto' : 'none', position: 'relative' }}>
              {!isPremium && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{background: '#ef4444', color: 'white', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold'}}>للمشتركين فقط</span></div>}
              
              <label>نمط الخلفية</label>
              <select className={styles.select} value={dynBg} onChange={e => setDynBg(e.target.value)} style={{marginBottom: '10px'}}>
                <option value="solid">لون سادة</option>
                <option value="gradient">تدرج لوني</option>
                <option value="waves">أمواج مائية</option>
                <option value="stars">فضاء ونجوم</option>
                <option value="parchment">ورق كلاسيكي</option>
                <option value="geometric">أشكال هندسية</option>
              </select>

              <label>نمط الإطار</label>
              <select className={styles.select} value={dynBorder} onChange={e => setDynBorder(e.target.value)} style={{marginBottom: '10px'}}>
                <option value="none">بدون إطار</option>
                <option value="thin">إطار رفيع بسيط</option>
                <option value="double">إطار مزدوج كلاسيكي</option>
                <option value="tech">إطار تكنولوجي رقمي</option>
                <option value="ornate">إطار مزخرف (منقط)</option>
              </select>

              <label>لوحة الألوان</label>
              <select className={styles.select} value={dynPalette} onChange={e => setDynPalette(e.target.value)} style={{marginBottom: dynPalette === 'custom' ? '10px' : '0'}}>
                <option value="blue">أزرق سماوي</option>
                <option value="green">أخضر زمردي</option>
                <option value="red">أحمر قرمزي</option>
                <option value="dark">وضع ليلي داكن (Dark)</option>
                <option value="custom" disabled={!isPremium}>لون مخصص (مدفوع)</option>
              </select>

              {dynPalette === 'custom' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                  <label>اختر اللون:</label>
                  <input type="color" value={customHexColor} onChange={(e) => setCustomHexColor(e.target.value)} style={{ border: 'none', background: 'transparent', width: '40px', height: '40px', cursor: 'pointer' }} />
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <button className={styles.btnPrimary} onClick={handleDownloadPDF}>
            📑 تحميل جميع الشهادات (PDF)
          </button>
          <button className={styles.btnSecondary} onClick={handleDownloadPNG}>
            🖼️ تحميل أول شهادة كصورة (PNG)
          </button>
          <a href="/teacher-assistant" className={styles.btnSecondary} style={{marginTop: '20px', border: 'none', background: 'transparent', color: '#64748b', textDecoration: 'none', textAlign: 'center'}}>
            &rarr; العودة للوحة المعلم
          </a>
        </div>
      </aside>

      <main className={styles.mainContent}>
        <h3>معاينة حية (لأول طالب/ة)</h3>
        <p className={styles.stats}>عدد الشهادات المراد توليدها: <strong>{getStudentList().length}</strong></p>
        <div className={styles.canvasWrapper}>
          <canvas ref={canvasRef} width="1123" height="794" style={{width: '100%', maxWidth: '800px', height: 'auto'}}></canvas>
        </div>
      </main>

      {showRosterManager && (
        <RosterManager 
          teacherId={teacher?.id}
          currentList={showRosterManager === 'male' ? maleNames : femaleNames}
          onImport={(list) => {
            if (showRosterManager === 'male') setMaleNames(list)
            else setFemaleNames(list)
          }}
          onClose={() => setShowRosterManager(false)}
        />
      )}
    </div>
  )
}
