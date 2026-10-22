'use client'

import styles from './page.module.css'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../utils/supabase'

export function LessonContent({ lessonIdProp, embeddedProp }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const lessonId = lessonIdProp || searchParams.get('id')
  const embedded = embeddedProp || searchParams.get('embedded') === 'true'

  const [loading, setLoading] = useState(true)
  const [lesson, setLesson] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [completing, setCompleting] = useState(false)
  
  const [isZoomed, setIsZoomed] = useState(false)
  const [activeTab, setActiveTab] = useState('video') // video, attachments, quiz

  // Quiz State
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showQuizResult, setShowQuizResult] = useState(false)

  // Q&A State
  const [questions, setQuestions] = useState([])
  const [newQuestion, setNewQuestion] = useState('')
  const [submittingQuestion, setSubmittingQuestion] = useState(false)

  // Homework State
  const [homeworkLink, setHomeworkLink] = useState('')
  const [homeworkSubmission, setHomeworkSubmission] = useState(null)
  const [submittingHomework, setSubmittingHomework] = useState(false)

  useEffect(() => {
    if (!lessonId) {
      router.push('/student-dashboard')
      return
    }

    const fetchLesson = async () => {
      try {
        let currentUser = null
        let currentProfile = null

        if (!embedded) {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            router.push('/login')
            return
          }
          currentUser = user

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          currentProfile = profile
        }

        setUserProfile(currentProfile || { id: 'anonymous', full_name: 'طالب (بث مباشر)', phone: '000', role: 'student', status: 'approved' })

        const { data, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .single()

        if (error || !data) throw error || new Error('Lesson not found')

        // Subscription check for paid lessons (skip if embedded)
        if (!embedded) {
          const now = new Date()
          const subEndDate = currentProfile?.subscription_end_date ? new Date(currentProfile.subscription_end_date) : null
          const isPremium = currentProfile?.role === 'admin' || (currentProfile?.status === 'approved' && subEndDate && subEndDate > now)

          if (!data.is_free && !isPremium) {
            alert('هذا الدرس مخصص للمشتركين فقط. يرجى الاشتراك أو تفعيل كود الشحن.')
            router.push('/student-dashboard?locked=true')
            return
          }
        }

        setLesson(data)

        // Fetch completion status (skip if embedded)
        if (!embedded && currentUser) {
          const { data: prog } = await supabase
            .from('student_progress')
            .select('completed')
            .eq('student_id', currentUser.id)
            .eq('lesson_id', lessonId)
            .maybeSingle()
          
          if (prog && prog.completed) {
            setIsCompleted(true)
          }

          // Fetch Q&A (only for logged in users)
          const { data: qData } = await supabase
            .from('lesson_questions')
            .select('*, profiles(full_name)')
            .eq('lesson_id', lessonId)
            .order('created_at', { ascending: false })
          if (qData) setQuestions(qData)
        }

        // Fetch Homework Status (only for logged in users)
        if (!embedded && currentUser) {
          const { data: hwData } = await supabase
            .from('homework_submissions')
            .select('*')
            .eq('lesson_id', lessonId)
            .eq('student_id', currentUser.id)
            .maybeSingle()
          if (hwData) setHomeworkSubmission(hwData)
        }

      } catch (err) {
        console.error("Error fetching lesson:", err)
        alert('حدث خطأ أو الدرس غير موجود')
        router.push('/student-dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchLesson()
  }, [lessonId, router])

  const toggleZoom = () => setIsZoomed(!isZoomed)

  const handleCompleteLesson = async () => {
    if (!userProfile || isCompleted || completing) return
    if (userProfile.id === 'anonymous') {
      alert('إكمال الدرس وتسجيل النقاط متاح للطلاب المسجلين فقط.')
      return
    }
    setCompleting(true)
    try {
      const { data, error } = await supabase.rpc('award_points_for_lesson', {
        p_lesson_id: lesson.id,
        p_student_id: userProfile.id
      })
      if (error) throw error
      
      setIsCompleted(true)
      alert(`🎉 مبروك! لقد أكملت الدرس وحصلت على ${lesson.points_reward || 0} نقطة إضافية!`)
    } catch (err) {
      console.error(err)
      alert('حدث خطأ أثناء تسجيل إكمال الدرس.')
    } finally {
      setCompleting(false)
    }
  }

  const handleSubmitQuestion = async (e) => {
    e.preventDefault()
    if(!newQuestion.trim() || submittingQuestion) return
    if (userProfile?.id === 'anonymous') {
      alert('إضافة الأسئلة متاح للطلاب المسجلين فقط.')
      return
    }
    setSubmittingQuestion(true)
    try {
      const { data, error } = await supabase.from('lesson_questions').insert([{
        lesson_id: lesson.id,
        student_id: userProfile.id,
        question: newQuestion
      }]).select('*, profiles(full_name)')
      
      if(error) throw error
      setQuestions([data[0], ...questions])
      setNewQuestion('')
      alert('تم إرسال سؤالك بنجاح!')
    } catch(err) {
      console.error(err)
      alert('حدث خطأ أثناء الإرسال')
    } finally {
      setSubmittingQuestion(false)
    }
  }

  const handleHomeworkSubmit = async (e) => {
    e.preventDefault()
    if(!homeworkLink.trim() || submittingHomework) return
    if (userProfile?.id === 'anonymous') {
      alert('يجب تسجيل الدخول لإرسال الواجب.')
      return
    }
    setSubmittingHomework(true)
    try {
      const { data, error } = await supabase.from('homework_submissions').insert([
        {
          lesson_id: lesson.id,
          student_id: userProfile.id,
          file_url: homeworkLink
        }
      ]).select().single()
      
      if(error) throw error
      setHomeworkSubmission(data)
      alert('تم إرسال الواجب بنجاح!')
    } catch(err) {
      console.error(err)
      alert('حدث خطأ أثناء الإرسال')
    } finally {
      setSubmittingHomework(false)
    }
  }

  // Safe Quiz Handlers
  const quizList = Array.isArray(lesson?.quiz_data) ? lesson.quiz_data : []

  const handleOptionSelect = (option) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: option })
  }
  const nextQuestion = () => {
    if (currentQuestion < quizList.length - 1) setCurrentQuestion(currentQuestion + 1)
  }
  const prevQuestion = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1)
  }
  const calculateScore = () => {
    let score = 0
    quizList.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) score += 1
    })
    return score
  }

  if (loading) {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', width: '100%'}}><h2>جاري تحميل الدرس...</h2></div>
  }

  if (!lesson) return null

  // Process Video URL (If it's a direct drive link, convert to preview)
  let embedUrl = lesson.video_url;
  if(embedUrl && embedUrl.includes('drive.google.com/file/d/')) {
    const match = embedUrl.match(/d\/([a-zA-Z0-9-_]+)/);
    if(match && match[1]) {
      embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
    }
  }

  // Process Canva URL (Ensure it has ?embed for iframes)
  let embedCanvaUrl = lesson.canva_url;
  if(embedCanvaUrl && embedCanvaUrl.includes('canva.com/design/')) {
    if (!embedCanvaUrl.includes('embed')) {
      embedCanvaUrl += embedCanvaUrl.includes('?') ? '&embed' : '?embed';
    }
  }

  const hasAttachments = lesson.attachments && lesson.attachments.length > 0;
  const hasQuiz = quizList.length > 0;

  return (
    <div className={styles.layout}>
      {/* Sidebar - Hide if embedded */}
      {!embedded && (
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <button onClick={() => router.push('/student-dashboard')} style={{background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '10px'}}>
              &larr; العودة للوحة التحكم
            </button>
          <h3>محتويات الدرس</h3>
        </div>
        <ul className={styles.lessonList}>
          <li className={styles.activeLesson}>{lesson.title}</li>
        </ul>

        {/* AI Tutor Assistant Helper */}
        <div style={{marginTop: '20px', padding: '15px', background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', borderRadius: '14px', border: '1px solid #ddd6fe', textAlign: 'center'}}>
          <div style={{fontSize: '1.4rem', marginBottom: '4px'}}>🤖💡</div>
          <div style={{fontSize: '0.86rem', fontWeight: 'bold', color: '#4c1d95', marginBottom: '8px'}}>واقفة معاك نقطة في الدرس؟</div>
          <a href="/student-ai" target="_blank" rel="noopener noreferrer" style={{display: 'block', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: 'white', padding: '8px 12px', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.82rem', boxShadow: '0 4px 10px rgba(124,58,237,0.25)'}}>
            اسأل المعلم الذكي ⚡
          </a>
        </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={`${styles.mainContent} ${isZoomed ? styles.zoomed : ''}`}>
        
        <div className={styles.topBar}>
          <h2>{lesson.title}</h2>
          <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            <a 
              href="/student-ai" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #9333ea)', 
                color: 'white', 
                padding: '8px 14px', 
                borderRadius: '10px', 
                textDecoration: 'none', 
                fontWeight: 'bold', 
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)'
              }}
            >
              <span>🤖 اسأل المعلم الذكي عن الدرس</span>
            </a>
            <button onClick={toggleZoom} className={styles.zoomBtn}>
              {isZoomed ? 'إلغاء وضع التركيز' : 'وضع التركيز (Zoom)'}
            </button>
          </div>
        </div>

        {/* Video Player Wrapper (Drive) */}
        {embedUrl && (
          <div style={{marginBottom: '30px'}}>
            <h3 style={{marginBottom: '10px', color: '#1e293b'}}>فيديو مسجل (Google Drive)</h3>
            <div className={styles.videoWrapper}>
              <iframe 
                src={embedUrl} 
                width="100%" 
                height="100%" 
                allow="autoplay; fullscreen" 
                title={lesson.title + " - Drive"}
                className={styles.iframe}
              ></iframe>
            </div>
          </div>
        )}

        {/* Canva Player Wrapper */}
        {embedCanvaUrl && (
          <div style={{marginBottom: '30px'}}>
            <h3 style={{marginBottom: '10px', color: '#1e293b'}}>عرض مرئي / ملف (Canva)</h3>
            <div style={{
              position: 'relative', 
              width: '100%', 
              minHeight: '450px', 
              height: '60vh', 
              backgroundColor: '#000', 
              borderRadius: '15px', 
              overflow: 'hidden', 
              boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
            }}>
              <iframe 
                src={embedCanvaUrl} 
                style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none'}}
                allow="autoplay; fullscreen" 
                title={lesson.title + " - Canva"}
              ></iframe>
            </div>
          </div>
        )}

        {/* Lesson Completion Box - Always Visible */}
        <div style={{marginBottom: '30px', padding: '20px', background: isCompleted ? '#d4edda' : '#f8f9fa', borderRadius: '10px', textAlign: 'center', border: `2px solid ${isCompleted ? '#28a745' : '#ddd'}`, boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
          <h3 style={{marginBottom: '15px', color: isCompleted ? '#155724' : '#333'}}>إنجاز الدرس 🌟</h3>
          {isCompleted ? (
            <div>
              <div style={{fontSize: '3rem', marginBottom: '10px'}}>✅</div>
              <p style={{fontWeight: 'bold', color: '#155724'}}>لقد قمت بإكمال هذا الدرس وحصلت على النقاط.</p>
            </div>
          ) : (
            <div>
              <p style={{marginBottom: '15px', fontSize: '1.1rem'}}>بعد مشاهدة الدرس بالكامل، اضغط على الزر أدناه للحصول على النقاط الخاصة بك (النقاط المتاحة: {lesson.points_reward || 0}).</p>
              <button 
                onClick={handleCompleteLesson} 
                disabled={completing}
                style={{
                  padding: '12px 30px', 
                  background: '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '25px', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1.2rem',
                  boxShadow: '0 4px 6px rgba(40, 167, 69, 0.3)',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {completing ? 'جاري التسجيل...' : 'أكملت الدرس ✅'}
              </button>
            </div>
          )}
        </div>

        {/* Tabs for extra content */}
        <div className={styles.tabs} style={{display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px', borderRadius: '10px', background: '#e2e8f0', padding: '10px', justifyContent: 'center'}}>
          <button 
            className={activeTab === 'video' ? styles.activeTab : ''} 
            onClick={() => setActiveTab('video')}
            style={{flex: '1 1 120px', padding: '12px 15px', border: 'none', background: activeTab === 'video' ? '#3b82f6' : 'white', color: activeTab === 'video' ? 'white' : '#4b5563', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', borderRadius: '8px', boxShadow: activeTab === 'video' ? '0 4px 6px rgba(59, 130, 246, 0.3)' : 'none', transition: 'all 0.2s'}}
          >
            تفاصيل الدرس
          </button>
          {hasAttachments && (
            <button 
              onClick={() => setActiveTab('attachments')} 
              style={{flex: '1 1 120px', padding: '12px 15px', border: 'none', background: activeTab === 'attachments' ? '#3b82f6' : 'white', color: activeTab === 'attachments' ? 'white' : '#4b5563', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', borderRadius: '8px', boxShadow: activeTab === 'attachments' ? '0 4px 6px rgba(59, 130, 246, 0.3)' : 'none', transition: 'all 0.2s'}}
            >
              الملحقات 📄
            </button>
          )}
          
          <button 
            onClick={() => setActiveTab('homework')} 
            style={{flex: '1 1 120px', padding: '12px 15px', border: 'none', background: activeTab === 'homework' ? '#3b82f6' : 'white', color: activeTab === 'homework' ? 'white' : '#4b5563', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', borderRadius: '8px', boxShadow: activeTab === 'homework' ? '0 4px 6px rgba(59, 130, 246, 0.3)' : 'none', transition: 'all 0.2s'}}
          >
            الواجب 📝
          </button>

          <button 
            onClick={() => setActiveTab('qa')} 
            style={{flex: '1 1 120px', padding: '12px 15px', border: 'none', background: activeTab === 'qa' ? '#3b82f6' : 'white', color: activeTab === 'qa' ? 'white' : '#4b5563', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', borderRadius: '8px', boxShadow: activeTab === 'qa' ? '0 4px 6px rgba(59, 130, 246, 0.3)' : 'none', transition: 'all 0.2s'}}
          >
            الأسئلة 💬
          </button>
          {hasQuiz && (
            <button 
              className={activeTab === 'quiz' ? styles.activeTab : ''} 
              onClick={() => setActiveTab('quiz')}
              style={{flex: '1 1 120px', padding: '12px 15px', border: 'none', background: activeTab === 'quiz' ? '#3b82f6' : 'white', color: activeTab === 'quiz' ? 'white' : '#4b5563', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', borderRadius: '8px', boxShadow: activeTab === 'quiz' ? '0 4px 6px rgba(59, 130, 246, 0.3)' : 'none', transition: 'all 0.2s'}}
            >
              اختبار الدرس
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === 'video' && (
            <div style={{animation: 'fadeIn 0.5s'}}>
              <h3 style={{marginBottom: '15px', color: '#1e293b'}}>وصف الدرس</h3>
              <p style={{lineHeight: '1.8', color: '#4b5563', fontSize: '1.1rem'}}>{lesson.description || 'لا يوجد وصف متاح.'}</p>
            </div>
          )}

          {activeTab === 'attachments' && hasAttachments && (
            <div className={styles.attachmentsTab}>
              <h3>الملفات المرفقة</h3>
              <ul className={styles.attachmentsList}>
                {lesson.attachments.map((file, idx) => (
                  <li key={idx} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '10px'}}>
                    <div className={styles.fileInfo}>
                      <span className={styles.fileName} style={{fontSize: '1.1rem', fontWeight: 'bold'}}>{file.name}</span>
                    </div>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className={styles.downloadBtn} style={{textDecoration: 'none'}}>عرض وتحميل</a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'quiz' && hasQuiz && (
            <div className={styles.quizTab}>
              {!showQuizResult ? (
                <div style={
                  lesson.quiz_theme === 'gamified' 
                  ? {background: 'linear-gradient(135deg, #fce7f3 0%, #dbeafe 100%)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '4px dashed #9333ea'}
                  : {background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}
                }>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                    <h3 style={{margin: 0, color: lesson.quiz_theme === 'gamified' ? '#9333ea' : 'inherit'}}>
                      {lesson.quiz_theme === 'gamified' ? '🎮 تحدي الأبطال!' : 'اختبار فهم الدرس'}
                    </h3>
                    <span style={{color: '#666', fontWeight: 'bold'}}>السؤال {currentQuestion + 1} من {quizList.length}</span>
                  </div>
                  
                  <div style={{marginBottom: '30px'}}>
                    <h4 style={{fontSize: lesson.quiz_theme === 'gamified' ? '1.5rem' : '1.2rem', marginBottom: '20px', textAlign: 'center', color: '#1f2937'}}>{quizList[currentQuestion]?.text}</h4>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                      {quizList[currentQuestion]?.options?.map((opt, idx) => (
                        <button 
                          key={idx}
                          onClick={() => handleOptionSelect(opt)}
                          style={
                            lesson.quiz_theme === 'gamified'
                            ? {
                                padding: '20px', textAlign: 'center', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.2rem', transition: 'all 0.3s',
                                background: selectedAnswers[currentQuestion] === opt ? '#9333ea' : 'white',
                                color: selectedAnswers[currentQuestion] === opt ? 'white' : '#4b5563',
                                boxShadow: selectedAnswers[currentQuestion] === opt ? '0 10px 20px rgba(147, 51, 234, 0.4)' : '0 4px 6px rgba(0,0,0,0.1)',
                                transform: selectedAnswers[currentQuestion] === opt ? 'scale(1.05)' : 'scale(1)'
                              }
                            : {
                                padding: '15px', textAlign: 'right', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer',
                                background: selectedAnswers[currentQuestion] === opt ? '#e0f2fe' : 'white',
                                borderColor: selectedAnswers[currentQuestion] === opt ? '#38bdf8' : '#ddd',
                                fontSize: '1.1rem'
                              }
                          }
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
                    <button onClick={prevQuestion} disabled={currentQuestion === 0} style={{padding: '10px 20px', border: 'none', background: '#f1f5f9', borderRadius: '5px', cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer'}}>السابق</button>
                    
                    {currentQuestion === quizList.length - 1 ? (
                      <button onClick={() => setShowQuizResult(true)} disabled={!selectedAnswers[currentQuestion]} style={{padding: '10px 20px', border: 'none', background: '#22c55e', color: 'white', borderRadius: '5px', cursor: !selectedAnswers[currentQuestion] ? 'not-allowed' : 'pointer', fontWeight: 'bold'}}>إنهاء الاختبار</button>
                    ) : (
                      <button onClick={nextQuestion} disabled={!selectedAnswers[currentQuestion]} style={{padding: '10px 20px', border: 'none', background: '#3b82f6', color: 'white', borderRadius: '5px', cursor: !selectedAnswers[currentQuestion] ? 'not-allowed' : 'pointer'}}>التالي</button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{background: '#fff', padding: '40px 20px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
                  <h2 style={{marginBottom: '20px'}}>نتيجة الاختبار</h2>
                  <div style={{display: 'inline-block', maxWidth: '', width: '100%', height: '120px', borderRadius: '50%', border: '8px solid #22c55e', lineHeight: '104px', fontSize: '2rem', fontWeight: 'bold', color: '#22c55e', marginBottom: '20px'}}>
                    {calculateScore()} / {quizList.length}
                  </div>
                  <p style={{fontSize: '1.2rem', color: '#444'}}>
                    {calculateScore() === quizList.length ? 'ممتاز جداً! لقد استوعبت الدرس بالكامل 🎉' : 
                     calculateScore() >= quizList.length / 2 ? 'جيد جداً، يمكنك مراجعة الدرس لتحقيق علامة كاملة 👍' : 
                     'تحتاج إلى مشاهدة الدرس بتركيز أكبر والمحاولة مرة أخرى 📚'}
                  </p>

                  {/* Explanations Section */}
                  <div style={{marginTop: '40px', textAlign: 'right', borderTop: '2px solid #eee', paddingTop: '20px'}}>
                    <h3 style={{marginBottom: '20px'}}>مراجعة الإجابات:</h3>
                    {quizList.map((q, idx) => {
                      const isCorrect = selectedAnswers[idx] === q.correctAnswer;
                      return (
                        <div key={idx} style={{marginBottom: '20px', padding: '15px', borderRadius: '10px', background: isCorrect ? '#f0fdf4' : '#fef2f2', border: `1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`}}>
                          <p style={{fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '10px'}}>{idx + 1}. {q.text}</p>
                          <div style={{display: 'flex', gap: '20px', marginBottom: '10px', fontSize: '0.95rem'}}>
                            <span style={{color: isCorrect ? 'green' : 'red'}}>إجابتك: {selectedAnswers[idx]}</span>
                            {!isCorrect && <span style={{color: 'green'}}>الإجابة الصحيحة: {q.correctAnswer}</span>}
                          </div>
                          {q.explanation && (
                            <div style={{background: '#fff', padding: '10px', borderRadius: '5px', fontSize: '0.9rem', color: '#4b5563', borderRight: '4px solid #3b82f6'}}>
                              <strong>التعليل: </strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <button onClick={() => {setShowQuizResult(false); setSelectedAnswers({}); setCurrentQuestion(0);}} style={{marginTop: '30px', padding: '10px 30px', background: '#f1f5f9', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold'}}>
                    إعادة الاختبار 🔄
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'homework' && (
            <div style={{animation: 'fadeIn 0.5s', maxWidth: '800px', margin: '0 auto'}}>
              <h2 style={{marginBottom: '20px', color: '#1e293b'}}>تسليم الواجب الخاص بالدرس 📝</h2>
              
              {homeworkSubmission ? (
                <div style={{background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: `2px solid ${homeworkSubmission.status === 'graded' ? '#10b981' : '#f59e0b'}`}}>
                  <h3 style={{color: homeworkSubmission.status === 'graded' ? '#10b981' : '#f59e0b', marginBottom: '15px'}}>
                    {homeworkSubmission.status === 'graded' ? '✅ تم تصحيح الواجب!' : '⏳ جاري مراجعة الواجب من قبل المعلم'}
                  </h3>
                  <div style={{marginBottom: '15px', fontSize: '1.1rem'}}>
                    <strong>الملف المرفوع:</strong> <a href={homeworkSubmission.file_url} target="_blank" rel="noopener noreferrer" style={{color: '#3b82f6'}}>عرض الملف</a>
                  </div>
                  {homeworkSubmission.status === 'graded' && (
                    <div style={{background: '#f8fafc', padding: '20px', borderRadius: '10px', marginTop: '20px'}}>
                      <div style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px'}}>الدرجة: {homeworkSubmission.grade || '0'} ⭐️</div>
                      {homeworkSubmission.feedback && (
                        <div>
                          <strong>ملاحظات المعلم:</strong>
                          <p style={{marginTop: '5px', color: '#4b5563', lineHeight: '1.6'}}>{homeworkSubmission.feedback}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleHomeworkSubmit} style={{background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)'}}>
                  <p style={{marginBottom: '20px', color: '#64748b'}}>قم برفع ملف الواجب على Google Drive أو أي موقع رفع، وضع الرابط هنا لكي يتمكن المعلم من تصحيحه.</p>
                  <label style={{display: 'block', fontWeight: 'bold', marginBottom: '10px'}}>رابط ملف الواجب:</label>
                  <input 
                    type="url" 
                    required 
                    value={homeworkLink} 
                    onChange={e => setHomeworkLink(e.target.value)} 
                    placeholder="https://drive.google.com/..." 
                    style={{width: '100%', padding: '15px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem', marginBottom: '20px'}}
                    dir="ltr"
                  />
                  <button type="submit" disabled={submittingHomework} style={{width: '100%', background: '#3b82f6', color: 'white', border: 'none', padding: '15px', borderRadius: '10px', fontSize: '1.2rem', fontWeight: 'bold', cursor: submittingHomework ? 'not-allowed' : 'pointer'}}>
                    {submittingHomework ? 'جاري الإرسال...' : 'تسليم الواجب 🚀'}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'qa' && (
            <div style={{animation: 'fadeIn 0.5s', maxWidth: '800px', margin: '0 auto'}}>
              <h2 style={{marginBottom: '20px', color: '#1e293b'}}>أسئلة ومناقشات الطلاب 💬</h2>
              
              <form onSubmit={handleSubmitQuestion} style={{background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '30px'}}>
                <label style={{display: 'block', fontWeight: 'bold', marginBottom: '10px'}}>هل لديك سؤال حول هذا الدرس؟</label>
                <textarea 
                  required 
                  value={newQuestion} 
                  onChange={e => setNewQuestion(e.target.value)} 
                  placeholder="اكتب سؤالك هنا بوضوح..." 
                  style={{width: '100%', padding: '15px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '1.1rem', marginBottom: '15px', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit'}}
                />
                <button type="submit" disabled={submittingQuestion} style={{background: '#10b981', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '10px', fontSize: '1.1rem', fontWeight: 'bold', cursor: submittingQuestion ? 'not-allowed' : 'pointer'}}>
                  {submittingQuestion ? 'جاري الإرسال...' : 'إرسال السؤال 📤'}
                </button>
              </form>

              <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                {questions.length === 0 ? (
                  <div style={{textAlign: 'center', color: '#94a3b8', padding: '30px'}}>لا توجد أسئلة حتى الآن. كن أول من يسأل!</div>
                ) : (
                  questions.map(q => (
                    <div key={q.id} style={{background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', borderLeft: q.answer ? '4px solid #10b981' : '4px solid #f59e0b'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                        <strong style={{color: '#334155'}}>{q.profiles?.full_name || 'طالب'}</strong>
                        <span style={{fontSize: '0.8rem', color: '#94a3b8'}}>{new Date(q.created_at).toLocaleDateString('ar-EG')}</span>
                      </div>
                      <p style={{color: '#1e293b', fontSize: '1.1rem', marginBottom: '15px', lineHeight: '1.6'}}>{q.question}</p>
                      
                      {q.answer && (
                        <div style={{background: '#f0fdf4', padding: '15px', borderRadius: '10px', borderRight: '3px solid #10b981'}}>
                          <strong style={{color: '#047857', display: 'block', marginBottom: '5px'}}>رد الأستاذ:</strong>
                          <p style={{color: '#065f46', lineHeight: '1.6'}}>{q.answer}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function LessonPage() {
  return (
    <Suspense fallback={<div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh'}}><h2>جاري التحميل...</h2></div>}>
      <LessonContent />
    </Suspense>
  )
}
