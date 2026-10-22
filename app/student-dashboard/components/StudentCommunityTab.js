'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../utils/supabase'

export default function StudentCommunityTab({ student }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPostContent, setNewPostContent] = useState('')
  const [commentingOn, setCommentingOn] = useState(null)
  const [newCommentContent, setNewCommentContent] = useState('')
  const [actionMessage, setActionMessage] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      // Fetch posts for the student's stage
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles:author_id (full_name, stage),
          community_comments (
            id, content, created_at,
            profiles:author_id (full_name)
          )
        `)
        .eq('stage', student.stage)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (err) {
      console.error('Error fetching posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPost = async (e) => {
    e.preventDefault()
    if (!newPostContent.trim()) return

    setActionMessage('جاري النشر...')
    try {
      const { error } = await supabase
        .from('community_posts')
        .insert([{
          author_id: student.id,
          content: newPostContent.trim(),
          stage: student.stage
        }])

      if (error) throw error
      setNewPostContent('')
      setActionMessage('✅ تم النشر بنجاح!')
      fetchPosts()
      setTimeout(() => setActionMessage(''), 3000)
    } catch (err) {
      console.error('Error posting:', err)
      setActionMessage('❌ حدث خطأ أثناء النشر')
      setTimeout(() => setActionMessage(''), 3000)
    }
  }

  const handleAddComment = async (e, postId) => {
    e.preventDefault()
    if (!newCommentContent.trim()) return

    try {
      const { error } = await supabase
        .from('community_comments')
        .insert([{
          post_id: postId,
          author_id: student.id,
          content: newCommentContent.trim()
        }])

      if (error) throw error
      setNewCommentContent('')
      setCommentingOn(null)
      fetchPosts()
    } catch (err) {
      console.error('Error commenting:', err)
      alert('حدث خطأ أثناء إضافة التعليق')
    }
  }

  const handleLikePost = async (postId) => {
    try {
      const { error } = await supabase.rpc('toggle_post_like', {
        p_post_id: postId,
        p_user_id: student.id
      })
      if (error) throw error
      fetchPosts()
    } catch (err) {
      console.error('Error toggling like:', err)
    }
  }

  return (
    <section style={{background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)'}}>
      <div style={{marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px'}}>
        <h2>مجتمع الطلاب 👥</h2>
        <p style={{color: '#666'}}>مساحة مخصصة لطلاب <strong>{student.stage}</strong> للمناقشة وطرح الأسئلة.</p>
      </div>

      {/* Add New Post */}
      <form onSubmit={handleAddPost} style={{marginBottom: '30px', background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0'}}>
        <textarea 
          placeholder="بم تفكر؟ أو هل لديك سؤال في المنهج؟" 
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          required
          style={{width: '100%', minHeight: '100px', padding: '15px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '10px', fontSize: '1rem', resize: 'vertical'}}
        />
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <span style={{color: actionMessage.includes('❌') ? 'red' : 'green', fontWeight: 'bold'}}>{actionMessage}</span>
          <button type="submit" style={{background: '#2563eb', color: 'white', padding: '10px 25px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem'}}>
            نشر الآن 🚀
          </button>
        </div>
      </form>

      {/* Posts Feed */}
      {loading ? (
        <div style={{textAlign: 'center', padding: '20px'}}>جاري التحميل...</div>
      ) : posts.length === 0 ? (
        <div style={{textAlign: 'center', padding: '40px', background: '#f1f5f9', borderRadius: '10px'}}>
          <h3>لا توجد منشورات بعد 📝</h3>
          <p>كن أول من يكتب في مجتمع مرحلتك!</p>
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          {posts.map(post => {
            const isLikedByMe = post.liked_by?.includes(student.id);
            const likesCount = post.liked_by?.length || 0;
            
            return (
              <div key={post.id} style={{border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', background: '#fff'}}>
                {/* Post Header */}
                <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px'}}>
                  <div style={{width: '45px', height: '45px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold'}}>
                    {post.profiles?.full_name?.charAt(0) || 'م'}
                  </div>
                  <div>
                    <h4 style={{margin: 0}}>{post.profiles?.full_name || 'مستخدم غير معروف'}</h4>
                    <span style={{fontSize: '0.8rem', color: '#94a3b8'}}>{new Date(post.created_at).toLocaleString('ar-EG')}</span>
                  </div>
                </div>

                {/* Post Content */}
                <p style={{fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '20px', whiteSpace: 'pre-wrap'}}>
                  {post.content}
                </p>

                {/* Post Actions */}
                <div style={{display: 'flex', gap: '15px', borderTop: '1px solid #f1f5f9', paddingTop: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px'}}>
                  <button 
                    onClick={() => handleLikePost(post.id)}
                    style={{background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: isLikedByMe ? '#ef4444' : '#64748b', fontWeight: 'bold', fontSize: '1rem'}}
                  >
                    {isLikedByMe ? '❤️' : '🤍'} أعجبني ({likesCount})
                  </button>
                  <button 
                    onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)}
                    style={{background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontWeight: 'bold', fontSize: '1rem'}}
                  >
                    💬 تعليق ({(post.community_comments && post.community_comments.length) || 0})
                  </button>
                </div>

                {/* Comments Section */}
                {commentingOn === post.id && (
                  <div style={{marginTop: '15px', background: '#f8fafc', padding: '15px', borderRadius: '10px'}}>
                    <form onSubmit={(e) => handleAddComment(e, post.id)} style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
                      <input 
                        type="text" 
                        placeholder="اكتب تعليقاً..." 
                        value={newCommentContent}
                        onChange={e => setNewCommentContent(e.target.value)}
                        required
                        style={{flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1'}}
                      />
                      <button type="submit" style={{background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>
                        إرسال
                      </button>
                    </form>

                    {post.community_comments && post.community_comments.length > 0 && (
                      <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                        {post.community_comments.map(comment => (
                          <div key={comment.id} style={{display: 'flex', gap: '10px'}}>
                            <div style={{width: '35px', height: '35px', borderRadius: '50%', background: '#94a3b8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0}}>
                              {comment.profiles?.full_name?.charAt(0) || 'م'}
                            </div>
                            <div style={{background: 'white', padding: '10px 15px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%'}}>
                              <h5 style={{margin: '0 0 5px 0', fontSize: '0.9rem'}}>{comment.profiles?.full_name}</h5>
                              <p style={{margin: 0, fontSize: '0.95rem'}}>{comment.content}</p>
                              <span style={{fontSize: '0.7rem', color: '#cbd5e1', marginTop: '5px', display: 'block'}}>{new Date(comment.created_at).toLocaleString('ar-EG')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
