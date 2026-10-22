'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../utils/supabase'
import { 
  FileText, Upload, Image as ImageIcon, Download, 
  Archive, CheckCircle2, AlertCircle, RefreshCw, Eye, 
  Settings, ArrowRight, Sparkles, Layers, Sliders, X
} from 'lucide-react'

export default function PdfToImagesPage() {
  const router = useRouter()
  const fileInputRef = useRef(null)

  // Auth & Teacher state
  const [loadingUser, setLoadingUser] = useState(true)
  const [teacher, setTeacher] = useState(null)

  // PDF & Conversion state
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfDoc, setPdfDoc] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [isConverting, setIsConverting] = useState(false)
  const [convertProgress, setConvertProgress] = useState(0) // 0 to 100
  const [currentPageProcessing, setCurrentPageProcessing] = useState(0)
  const [convertedPages, setConvertedPages] = useState([]) // Array of { pageNum, blob, dataUrl, width, height }
  
  // ZIP generation state
  const [isZipping, setIsZipping] = useState(false)
  const [zipProgress, setZipProgress] = useState(0)

  // Settings
  const [imageFormat, setImageFormat] = useState('png') // 'png' | 'jpg'
  const [resolutionScale, setResolutionScale] = useState(2.0) // 1.5, 2.0 (HD), 3.0 (Ultra)
  const [namingStyle, setNamingStyle] = useState('arabic') // 'arabic' (صفحة_001) | 'english' (page_001) | 'fullname' (اسم_الملف_صفحة_001)
  const [pageRangeMode, setPageRangeMode] = useState('all') // 'all' | 'custom'
  const [customRangeFrom, setCustomRangeFrom] = useState(1)
  const [customRangeTo, setCustomRangeTo] = useState(1)

  // UI state
  const [isDragging, setIsDragging] = useState(false)
  const [previewModalPage, setPreviewModalPage] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  // 1. Verify User Access
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (!['teacher', 'teacher_pro', 'admin', 'assistant'].includes(profile?.role)) {
          router.push('/student-dashboard')
          return
        }

        setTeacher(profile)
      } catch (err) {
        console.error('Error fetching teacher profile:', err)
      } finally {
        setLoadingUser(false)
      }
    }

    checkAuth()
  }, [router])

  // Helper to dynamically load external scripts safely
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`)
      if (existing) {
        if (existing.getAttribute('data-loaded') === 'true' || window.pdfjsLib || window.JSZip) {
          resolve()
          return
        }
        existing.addEventListener('load', () => resolve())
        existing.addEventListener('error', (e) => reject(e))
        return
      }
      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.onload = () => {
        script.setAttribute('data-loaded', 'true')
        resolve()
      }
      script.onerror = (e) => reject(e)
      document.head.appendChild(script)
    })
  }

  // 2. Handle File Selection
  const handleFileChange = async (file) => {
    if (!file) return
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('يرجى اختيار ملف PDF صالح بصيغة (.pdf)')
      return
    }

    setErrorMessage('')
    setPdfFile(file)
    setConvertedPages([])
    setConvertProgress(0)

    try {
      // Load PDF.js if not yet loaded
      if (!window.pdfjsLib) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js')
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'
      }

      const arrayBuffer = await file.arrayBuffer()
      const loadedPdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
      setPdfDoc(loadedPdf)
      setTotalPages(loadedPdf.numPages)
      setCustomRangeFrom(1)
      setCustomRangeTo(loadedPdf.numPages)
    } catch (err) {
      console.error('Error loading PDF document:', err)
      setErrorMessage('تعذر قراءة ملف الـ PDF. قد يكون الملف محمياً بكلمة مرور أو تالفاً.')
    }
  }

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  // 3. Convert PDF Pages to Images
  const handleStartConversion = async () => {
    if (!pdfDoc || isConverting) return

    setIsConverting(true)
    setConvertProgress(0)
    setConvertedPages([])
    setErrorMessage('')

    const startPage = pageRangeMode === 'all' ? 1 : Math.max(1, parseInt(customRangeFrom, 10) || 1)
    const endPage = pageRangeMode === 'all' ? totalPages : Math.min(totalPages, parseInt(customRangeTo, 10) || totalPages)

    if (startPage > endPage) {
      setErrorMessage('نطاق الصفحات غير صحيح: بداية النطاق أكبر من نهايته.')
      setIsConverting(false)
      return
    }

    const pagesToRenderCount = (endPage - startPage) + 1
    const pagesResults = []

    try {
      for (let pNum = startPage; pNum <= endPage; pNum++) {
        setCurrentPageProcessing(pNum)

        const page = await pdfDoc.getPage(pNum)
        const viewport = page.getViewport({ scale: resolutionScale })

        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')

        // Fill white background (avoids dark/black background in JPG and transparent rendering)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        await page.render({
          canvasContext: ctx,
          viewport: viewport
        }).promise

        const mimeType = imageFormat === 'jpg' ? 'image/jpeg' : 'image/png'
        const quality = imageFormat === 'jpg' ? 0.92 : undefined

        const blob = await new Promise((resolve) => canvas.toBlob(resolve, mimeType, quality))
        const dataUrl = canvas.toDataURL(mimeType, quality)

        pagesResults.push({
          pageNum: pNum,
          blob,
          dataUrl,
          width: canvas.width,
          height: canvas.height
        })

        const percent = Math.round(((pNum - startPage + 1) / pagesToRenderCount) * 100)
        setConvertProgress(percent)
      }

      setConvertedPages(pagesResults)
    } catch (err) {
      console.error('Error during PDF pages conversion:', err)
      setErrorMessage('حدث خطأ أثناء تحويل الصفحات. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsConverting(false)
    }
  }

  // 4. Download Single Image
  const handleDownloadSingle = (page) => {
    const padDigits = Math.max(3, String(totalPages).length)
    const paddedIndex = String(page.pageNum).padStart(padDigits, '0')
    const baseName = (pdfFile?.name || 'مستند').replace(/\.pdf$/i, '').trim()

    let filename = `صفحة_${paddedIndex}.${imageFormat}`
    if (namingStyle === 'english') {
      filename = `page_${paddedIndex}.${imageFormat}`
    } else if (namingStyle === 'fullname') {
      filename = `${baseName}_صفحة_${paddedIndex}.${imageFormat}`
    }

    const link = document.createElement('a')
    link.href = page.dataUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 5. Download All Pages as Ordered ZIP Archive
  const handleDownloadZip = async () => {
    if (!convertedPages || convertedPages.length === 0 || isZipping) return

    setIsZipping(true)
    setZipProgress(0)
    setErrorMessage('')

    try {
      // Load JSZip library
      if (!window.JSZip) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js')
      }

      const zip = new window.JSZip()
      const padDigits = Math.max(3, String(totalPages).length)
      const baseName = (pdfFile?.name || 'مستند').replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_\u0600-\u06FF\s-]/g, '').trim() || 'ملف_PDF'

      // Sort pages strictly by pageNum to guarantee order
      const sortedPages = [...convertedPages].sort((a, b) => a.pageNum - b.pageNum)

      sortedPages.forEach((page) => {
        // Zero-padding guarantees exact sequential sort order across all operating systems
        const paddedIndex = String(page.pageNum).padStart(padDigits, '0')
        
        let filename = `صفحة_${paddedIndex}.${imageFormat}`
        if (namingStyle === 'english') {
          filename = `page_${paddedIndex}.${imageFormat}`
        } else if (namingStyle === 'fullname') {
          filename = `${baseName}_صفحة_${paddedIndex}.${imageFormat}`
        }

        zip.file(filename, page.blob)
      })

      const zipBlob = await zip.generateAsync(
        {
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 }
        },
        (metadata) => {
          setZipProgress(Math.round(metadata.percent))
        }
      )

      // Trigger automatic browser download
      const downloadUrl = URL.createObjectURL(zipBlob)
      const downloadLink = document.createElement('a')
      downloadLink.href = downloadUrl
      downloadLink.download = `${baseName}_صور_الصفحات_مرتبة.zip`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(downloadUrl)

    } catch (err) {
      console.error('Error generating ZIP file:', err)
      setErrorMessage('حدث خطأ أثناء ضغط الصور في ملف ZIP. يرجى المحاولة مرة أخرى.')
    } finally {
      setIsZipping(false)
    }
  }

  // Reset tool to start fresh
  const handleReset = () => {
    setPdfFile(null)
    setPdfDoc(null)
    setTotalPages(0)
    setConvertedPages([])
    setConvertProgress(0)
    setErrorMessage('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      fontFamily: 'Tajawal, sans-serif',
      direction: 'rtl',
      paddingBottom: '60px'
    }}>

      {/* Top Navbar */}
      <nav style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #dc2626, #ef4444)',
            color: 'white',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
          }}>
            <Archive size={22} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#0f172a' }}>
              محول PDF إلى صور واستخراج ZIP 📑📦
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
              أداة خاصة بالمعلمين لتحويل المذكرات والامتحانات لصور بنفس الترتيب وتحميلها دفعة واحدة
            </p>
          </div>
        </div>

        <Link
          href="/teacher-assistant"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            padding: '8px 14px',
            borderRadius: '10px',
            color: '#334155',
            fontSize: '0.88rem',
            fontWeight: 'bold',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}
        >
          <ArrowRight size={16} />
          <span>العودة لبوابة المعلم</span>
        </Link>
      </nav>

      {/* Main Container */}
      <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>

        {/* Intro Card */}
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '1.5px solid #bfdbfe',
          borderRadius: '20px',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '2.2rem' }}>✨</span>
            <div>
              <h3 style={{ margin: 0, color: '#1e40af', fontSize: '1.1rem', fontWeight: '900' }}>
                ترتيب الصفحات مضمون 100% داخل الملف المضغوط!
              </h3>
              <p style={{ margin: '4px 0 0', color: '#1e3a8a', fontSize: '0.88rem', opacity: 0.9 }}>
                يتم ترقيم الصور داخلياً بنظام الترقيم الثلاثي (<code style={{ background: '#dbeafe', padding: '1px 6px', borderRadius: '4px' }}>صفحة_001</code>، <code style={{ background: '#dbeafe', padding: '1px 6px', borderRadius: '4px' }}>صفحة_002</code>...)، مما يضمن ظهور كل الصور بترتيبها الدقيق عند فك الضغط على أي جهاز (كمبيوتر أو هاتف).
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ background: '#ffffff', color: '#0369a1', padding: '6px 12px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 'bold', border: '1px solid #bae6fd' }}>
              🔒 آمن 100% ويعمل بجهازك
            </span>
            <span style={{ background: '#ffffff', color: '#059669', padding: '6px 12px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 'bold', border: '1px solid #a7f3d0' }}>
              ⚡ بدون حدود لحجم الملف
            </span>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div style={{
            background: '#fee2e2',
            border: '1.5px solid #fca5a5',
            color: '#b91c1c',
            padding: '14px 18px',
            borderRadius: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 'bold',
            fontSize: '0.92rem'
          }}>
            <AlertCircle size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Conversion Settings Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '18px',
          padding: '22px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', color: '#0f172a', fontWeight: '900', fontSize: '1.05rem' }}>
            <Settings size={20} color="#2563eb" />
            <span>خيارات وجودة الصور المستخرجة:</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            
            {/* Format choice */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                صيغة الصورة:
              </label>
              <select
                value={imageFormat}
                onChange={e => setImageFormat(e.target.value)}
                disabled={isConverting}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 'bold', outline: 'none' }}
              >
                <option value="png">PNG (وضوح عالي فائق - موصى به للامتحانات والمذكرات)</option>
                <option value="jpg">JPG (حجم خفيف مناسب للواتساب والتليجرام)</option>
              </select>
            </div>

            {/* Resolution Scale */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                دقة وجودة الاستخراج (Resolution):
              </label>
              <select
                value={resolutionScale}
                onChange={e => setResolutionScale(parseFloat(e.target.value))}
                disabled={isConverting}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 'bold', outline: 'none' }}
              >
                <option value="1.5">دقة عادية (1.5x) - حجم ملف صغير</option>
                <option value="2.0">دقة عالية HD (2.0x) - مثالية للقراءة والطباعة ⭐</option>
                <option value="3.0">دقة فائقة Ultra HD (3.0x) - نقاء استثنائي للكتابة الصغيرة</option>
              </select>
            </div>

            {/* Naming Style */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                تسمية وترقيم الصور داخل ZIP:
              </label>
              <select
                value={namingStyle}
                onChange={e => setNamingStyle(e.target.value)}
                disabled={isConverting}
                style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 'bold', outline: 'none' }}
              >
                <option value="arabic">صفحة_001.png (نمط عربي مرتب)</option>
                <option value="english">page_001.png (نمط إنجليزي)</option>
                <option value="fullname">[اسم الملف]_صفحة_001.png (كامل مع اسم الملف)</option>
              </select>
            </div>

            {/* Page Range */}
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                نطاق الصفحات:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={pageRangeMode}
                  onChange={e => setPageRangeMode(e.target.value)}
                  disabled={isConverting || !totalPages}
                  style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 'bold', outline: 'none' }}
                >
                  <option value="all">كل صفحات الملف ({totalPages || '...'} صفحة)</option>
                  <option value="custom">تحديد صفحات معينة</option>
                </select>

                {pageRangeMode === 'custom' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="number"
                      min="1"
                      max={totalPages || 999}
                      value={customRangeFrom}
                      onChange={e => setCustomRangeFrom(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      style={{ width: '55px', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold' }}
                      title="من صفحة"
                    />
                    <span>إلى</span>
                    <input
                      type="number"
                      min="1"
                      max={totalPages || 999}
                      value={customRangeTo}
                      onChange={e => setCustomRangeTo(Math.min(totalPages || 999, parseInt(e.target.value, 10) || 1))}
                      style={{ width: '55px', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold' }}
                      title="إلى صفحة"
                    />
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Upload & Dropzone Area */}
        {!pdfFile ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: isDragging ? '#eff6ff' : '#ffffff',
              border: `2.5px dashed ${isDragging ? '#2563eb' : '#94a3b8'}`,
              borderRadius: '24px',
              padding: '60px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
            }}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".pdf,application/pdf" 
              onChange={e => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              style={{ display: 'none' }}
            />

            <div style={{
              width: '85px',
              height: '85px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 20px rgba(239, 68, 68, 0.2)'
            }}>
              <Upload size={38} />
            </div>

            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#0f172a' }}>
              اسحب وأفلت ملف الـ PDF هنا، أو اضغط للاختيار من جهازك
            </h3>
            <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '0.95rem' }}>
              يدعم المذكرات، الامتحانات، أوراق العمل، والكتب الدراسية بأي عدد صفحات
            </p>

            <button
              type="button"
              style={{
                marginTop: '24px',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
              }}
            >
              📂 تصفح واختر ملف PDF
            </button>
          </div>
        ) : (
          /* File Selected Card & Conversion Actions */
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '24px',
            border: '1.5px solid #e2e8f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FileText size={30} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#0f172a', wordBreak: 'break-all' }}>
                    {pdfFile.name}
                  </h4>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                    <span>📄 {totalPages} صفحة</span>
                    <span>💾 {(pdfFile.size / (1024 * 1024)).toFixed(2)} ميجابايت</span>
                    <span>🎨 الإخراج: {imageFormat.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isConverting || isZipping}
                  style={{
                    background: '#f8fafc',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    fontSize: '0.88rem',
                    cursor: (isConverting || isZipping) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={16} />
                  <span>تغيير الملف</span>
                </button>

                {convertedPages.length === 0 ? (
                  <button
                    type="button"
                    onClick={handleStartConversion}
                    disabled={isConverting}
                    style={{
                      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      fontWeight: '900',
                      fontSize: '1rem',
                      cursor: isConverting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
                      opacity: isConverting ? 0.7 : 1
                    }}
                  >
                    <Sparkles size={18} />
                    <span>{isConverting ? 'جاري استخراج الصفحات...' : 'بدء تحويل الصفحات لصور 🚀'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    style={{
                      background: 'linear-gradient(135deg, #059669, #10b981)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 26px',
                      borderRadius: '12px',
                      fontWeight: '900',
                      fontSize: '1.05rem',
                      cursor: isZipping ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                      opacity: isZipping ? 0.7 : 1,
                      animation: 'pulse 2s infinite'
                    }}
                  >
                    <Archive size={20} />
                    <span>{isZipping ? `جاري الضغط (${zipProgress}%)... ⏳` : 'تحميل جميع الصور كملف مضغوط (ZIP) 📦'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Converting Progress Bar */}
            {isConverting && (
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem', fontWeight: 'bold' }}>
                  <span style={{ color: '#2563eb' }}>
                    جاري معالجة وتحويل صفحة {currentPageProcessing} من أصل {pageRangeMode === 'all' ? totalPages : (customRangeTo - customRangeFrom + 1)}...
                  </span>
                  <span style={{ color: '#1e40af' }}>{convertProgress}%</span>
                </div>
                <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${convertProgress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                    transition: 'width 0.2s ease'
                  }} />
                </div>
              </div>
            )}

            {/* Zipping Progress Bar */}
            {isZipping && (
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem', fontWeight: 'bold' }}>
                  <span style={{ color: '#059669' }}>
                    جاري ضغط وترتيب الصور في أرشيف ZIP فائق الترتيب...
                  </span>
                  <span style={{ color: '#047857' }}>{zipProgress}%</span>
                </div>
                <div style={{ height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${zipProgress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #10b981, #059669)',
                    transition: 'width 0.2s ease'
                  }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gallery / Converted Images Grid */}
        {convertedPages.length > 0 && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#0f172a' }}>
                  معاينة الصور المستخرجة ({convertedPages.length} صورة جاهزة) 🖼️
                </h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                  يمكنك تحميل أي صفحة مفردة مباشرة أو الضغط على زر التحميل العلوي لتنزيل الكل بملف ZIP
                </p>
              </div>

              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={isZipping}
                style={{
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '0.92rem',
                  cursor: isZipping ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                }}
              >
                <Download size={16} />
                <span>تحميل الكل مضغوطاً ZIP ({convertedPages.length})</span>
              </button>
            </div>

            {/* Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: '18px'
            }}>
              {convertedPages.map((page) => (
                <div
                  key={page.pageNum}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative'
                  }}
                >
                  {/* Page Number Pill */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(4px)',
                    color: '#ffffff',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '900',
                    zIndex: 2
                  }}>
                    صفحة {page.pageNum}
                  </div>

                  {/* Thumbnail Image */}
                  <div 
                    onClick={() => setPreviewModalPage(page)}
                    style={{
                      background: '#f8fafc',
                      height: '240px',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'zoom-in',
                      borderBottom: '1px solid #f1f5f9'
                    }}
                    title="اضغط للتكبير والمعاينة بالحجم الكامل"
                  >
                    <img 
                      src={page.dataUrl} 
                      alt={`صفحة ${page.pageNum}`}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  </div>

                  {/* Footer & Single Download */}
                  <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                      {page.width} × {page.height} px
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setPreviewModalPage(page)}
                        style={{
                          background: '#f1f5f9',
                          border: 'none',
                          color: '#475569',
                          padding: '6px 8px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="معاينة كاملة"
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadSingle(page)}
                        style={{
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#1d4ed8',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="تحميل هذه الصورة منفردة"
                      >
                        <Download size={14} />
                        <span>تحميل</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Fullscreen Lightbox Preview Modal */}
      {previewModalPage && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          direction: 'rtl'
        }}>
          {/* Modal Header */}
          <div style={{
            width: '100%',
            maxWidth: '850px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
            marginBottom: '12px'
          }}>
            <div style={{ fontWeight: '900', fontSize: '1.15rem' }}>
              معاينة صفحة {previewModalPage.pageNum} ({previewModalPage.width} × {previewModalPage.height} px)
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleDownloadSingle(previewModalPage)}
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Download size={16} />
                <span>تحميل هذه الصورة</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewModalPage(null)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Modal Image Box */}
          <div style={{
            maxWidth: '850px',
            maxHeight: '82vh',
            overflow: 'auto',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            padding: '12px',
            textAlign: 'center'
          }}>
            <img 
              src={previewModalPage.dataUrl} 
              alt={`صفحة ${previewModalPage.pageNum}`}
              style={{
                maxWidth: '100%',
                maxHeight: '78vh',
                objectFit: 'contain'
              }}
            />
          </div>
        </div>
      )}

      {/* Keyframe Animations */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
      `}</style>
    </div>
  )
}
