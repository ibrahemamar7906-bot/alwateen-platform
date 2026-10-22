'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../utils/supabase'

function CoursePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get('id')

  const [loading, setLoading] = useState(true)
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [student, setStudent] = useState(null)

  useEffect(() => {
    if (!courseId) {
      router.push('/student-dashboard')
      return
    }

    const fetchCourseData = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
          router.push('/login')
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
          const now = new Date()
          const subEndDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null
          const isStillPremium = profile.status === 'approved' && subEndDate && subEndDate > now
          setStudent({ ...profile, isPremium: isStillPremium })
        }

        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single()

        if (courseError) throw courseError
        setCourse(courseData)

        const { data: lessonsData, error: lessonsErr } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('created_at', { ascending: true })

          if (lessonsErr) {
            console.error("Lessons fetch error:", lessonsErr);
            alert(`خطأ في جلب الحصص: ${lessonsErr.message}`);
          }

          if (lessonsData) {
            // If a lesson is explicitly linked to this course, show it to anyone viewing the course.
            // The course itself dictates the context, so we don't need to hide its contents based on stage.
            setLessons(lessonsData);
          }

      } catch (error) {
        console.error("Course load error:", error)
        alert('الكورس غير موجود أو تم حذفه.')
        router.push('/student-dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId, router])

  if (loading) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', width: '100%', fontFamily: 'var(--font-cairo)'}}>
        <h2>جاري تحميل الكورس...</h2>
      </div>
    )
  }

  if (!course) return null

  return (
    <div style={{fontFamily: 'var(--font-cairo)', padding: '20px', background: 'transparent', minHeight: '100dvh'}}>
      <button onClick={() => router.push('/student-dashboard')} style={{background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '20px', fontSize: '1.1rem', fontWeight: 'bold'}}>
        &larr; العودة للوحة التحكم
      </button>

      <div style={{background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px'}}>
        <h1 style={{color: '#333', marginBottom: '10px'}}>{course.title} 📚</h1>
        <p style={{color: '#666', fontSize: '1.1rem'}}>{course.description}</p>
      </div>

      <h2 style={{marginBottom: '20px', color: '#333'}}>محتوى الكورس (الدروس)</h2>
      
      {lessons.length === 0 ? (
        <div style={{padding: '30px', textAlign: 'center', background: 'white', borderRadius: '15px', color: '#666', border: '1px dashed #ccc'}}>
          <p>لا توجد دروس مضافة في هذا الكورس بعد.</p>
        </div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px'}}>
          {lessons.map(lesson => (
            <div key={lesson.id} style={{background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                <h3 style={{margin: 0}}>{lesson.title}</h3>
                {lesson.is_free ? (
                  <span style={{background: '#d4edda', color: '#155724', padding: '3px 8px', borderRadius: '15px', fontSize: '0.8rem'}}>مجاني</span>
                ) : (
                  <span style={{background: '#f8d7da', color: '#721c24', padding: '3px 8px', borderRadius: '15px', fontSize: '0.8rem'}}>مدفوع 🔒</span>
                )}
              </div>
              <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '15px', flex: 1}}>{lesson.description}</p>
              
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px'}}>
                <span style={{color: '#856404', fontWeight: 'bold', fontSize: '0.9rem'}}>🌟 {lesson.points_reward || 0} نقطة</span>
                
                {(lesson.is_free || student?.isPremium) ? (
                  <a href={`/lesson?id=${lesson.id}`} style={{background: '#2563eb', color: 'white', padding: '8px 15px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold'}}>
                    بدء التعلم ▶️
                  </a>
                ) : (
                  <button onClick={() => alert('مطلوب تفعيل الاشتراك')} style={{background: '#ccc', color: '#666', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'not-allowed', fontWeight: 'bold'}}>
                    مغلق 🔒
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CoursePage() {
  return (
    <Suspense fallback={<div style={{padding: '20px', textAlign: 'center'}}>جاري التحميل...</div>}>
      <CoursePageContent />
    </Suspense>
  )
}
