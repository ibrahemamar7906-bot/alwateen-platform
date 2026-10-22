'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../../utils/supabase'

export default function AdminCommunityTab({ ALL_STAGES, styles }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStageFilter, setSelectedStageFilter] = useState('all')

  useEffect(() => {
    fetchPosts()
  }, [selectedStageFilter])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('community_posts')
        .select(`
          *,
          profiles:author_id (full_name, phone, stage),
          community_comments (
            id, content, created_at,
            profiles:author_id (full_name, phone)
          )
        `)
        .order('created_at', { ascending: false })

      if (selectedStageFilter !== 'all') {
        query = query.eq('stage', selectedStageFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setPosts(data || [])
    } catch (err) {
      console.error('Error fetching admin community posts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنشور وجميع تعليقاته؟')) return
    try {
      const { error } = await supabase.from('community_posts').delete().eq('id', postId)
      if (error) throw error
      setPosts(posts.filter(p => p.id !== postId))
    } catch (err) {
      console.error('Error deleting post:', err)
      alert('حدث خطأ أثناء الحذف')
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التعليق؟')) return
    try {
      const { error } = await supabase.from('community_comments').delete().eq('id', commentId)
      if (error) throw error
      fetchPosts() // refresh to update comments list
    } catch (err) {
      console.error('Error deleting comment:', err)
      alert('حدث خطأ أثناء الحذف')
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2>إدارة مجتمع الطلاب 🛡️</h2>
        <p>يمكنك مراقبة جميع المنشورات والتعليقات وحذف أي محتوى غير لائق.</p>
      </div>

      {/* Filter */}
      <div style={{marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #ddd'}}>
        <label style={{fontWeight: 'bold', marginLeft: '10px'}}>تصفية حسب المرحلة:</label>
        <select 
          value={selectedStageFilter} 
          onChange={e => setSelectedStageFilter(e.target.value)}
          style={{padding: '8px', borderRadius: '5px', border: '1px solid #ccc', minWidth: '200px'}}
        >
          <option value="all">جميع المراحل</option>
          {ALL_STAGES.map(stage => (
            <option key={stage.id} value={stage.id}>{stage.label}</option>
          ))}
        </select>
      </div>

      {/* Posts */}
      {loading ? (
        <div style={{textAlign: 'center', padding: '20px'}}>جاري التحميل...</div>
      ) : posts.length === 0 ? (
        <div style={{textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '10px'}}>
          <h3>لا توجد منشورات حالياً</h3>
        </div>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
          {posts.map(post => (
            <div key={post.id} style={{border: '2px solid #e2e8f0', borderRadius: '12px', padding: '20px', background: '#fff', position: 'relative'}}>
              <button 
                onClick={() => handleDeletePost(post.id)}
                style={{position: 'absolute', top: '20px', left: '20px', background: '#ef4444', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}
              >
                حذف المنشور 🗑
              </button>
              
              <div style={{marginBottom: '10px'}}>
                <h4 style={{margin: '0 0 5px 0', color: '#1e293b'}}>
                  {post.profiles?.full_name || 'غير معروف'} 
                  <span style={{color: '#64748b', fontSize: '0.9rem', marginRight: '10px'}}>({post.profiles?.phone})</span>
                </h4>
                <div style={{fontSize: '0.85rem', background: '#f1f5f9', padding: '3px 8px', borderRadius: '5px', display: 'inline-block'}}>
                  المرحلة: {post.stage} | التاريخ: {new Date(post.created_at).toLocaleString('ar-EG')}
                </div>
              </div>
              
              <p style={{fontSize: '1.1rem', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #f1f5f9', whiteSpace: 'pre-wrap'}}>
                {post.content}
              </p>
              
              <div style={{color: '#64748b', fontWeight: 'bold', margin: '15px 0 10px 0', fontSize: '0.9rem'}}>
                إعجابات: {post.liked_by?.length || 0} | تعليقات: {(post.community_comments && post.community_comments.length) || 0}
              </div>

              {/* Comments List */}
              {post.community_comments && post.community_comments.length > 0 && (
                <div style={{background: '#f8fafc', padding: '15px', borderRadius: '10px', marginTop: '10px'}}>
                  <h5 style={{margin: '0 0 10px 0'}}>التعليقات:</h5>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    {post.community_comments.map(comment => (
                      <div key={comment.id} style={{background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                        <div>
                          <div style={{fontWeight: 'bold', fontSize: '0.9rem'}}>
                            {comment.profiles?.full_name} <span style={{color: '#94a3b8', fontSize: '0.8rem'}}>({comment.profiles?.phone})</span>
                          </div>
                          <p style={{margin: '5px 0 0 0', fontSize: '0.95rem'}}>{comment.content}</p>
                          <small style={{color: '#94a3b8'}}>{new Date(comment.created_at).toLocaleString('ar-EG')}</small>
                        </div>
                        <button 
                          onClick={() => handleDeleteComment(comment.id)}
                          style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem'}}
                          title="حذف التعليق"
                        >
                          🗑
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
