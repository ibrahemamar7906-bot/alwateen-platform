'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Trophy, Sparkles, Award, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../../../utils/supabase'
import styles from './page.module.css'

export default function MathReport() {
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user && user.user_metadata?.math_stats) {
          setStats(user.user_metadata.math_stats)
        } else {
          setStats({
            add: { correct: 0, wrong: 0 },
            sub: { correct: 0, wrong: 0 },
            mul: { correct: 0, wrong: 0 },
            div: { correct: 0, wrong: 0 }
          })
        }
      } catch (e) {
        console.error('Error fetching math stats', e)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper} style={{ textAlign: 'center', paddingTop: '100px' }}>
          <h2 style={{ color: '#064e3b', fontWeight: 800 }}>جاري إعداد تقرير المستوى... ⏳</h2>
        </div>
      </div>
    )
  }

  const getPercentage = (correct, wrong) => {
    const total = correct + wrong
    if (total === 0) return 0
    return Math.round((correct / total) * 100)
  }

  const operations = [
    { key: 'add', title: 'عمليات الجمع ➕', classRow: styles.statRowAdd, fillClass: styles.fillAdd },
    { key: 'sub', title: 'عمليات الطرح ➖', classRow: styles.statRowSub, fillClass: styles.fillSub },
    { key: 'mul', title: 'عمليات الضرب ✖️', classRow: styles.statRowMul, fillClass: styles.fillMul },
    { key: 'div', title: 'عمليات القسمة ➗', classRow: styles.statRowDiv, fillClass: styles.fillDiv },
  ]

  const totalCorrect = (stats.add?.correct || 0) + (stats.sub?.correct || 0) + (stats.mul?.correct || 0) + (stats.div?.correct || 0)
  const totalWrong = (stats.add?.wrong || 0) + (stats.sub?.wrong || 0) + (stats.mul?.wrong || 0) + (stats.div?.wrong || 0)
  const overallAcc = getPercentage(totalCorrect, totalWrong)

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        
        {/* Header */}
        <header className={styles.header}>
          <button onClick={() => router.back()} className={styles.backBtn}>
            <ArrowRight size={16} />
            <span>العودة للتدريب</span>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#064e3b' }}>
            <Award size={20} color="#059669" />
            <span>تقرير الأداء الأكاديمي</span>
          </div>
        </header>

        {/* Card */}
        <div className={styles.card}>
          <h1 className={styles.title}>لوحة الشرف ومستوى الإتقان 🏆</h1>
          <p className={styles.subtitle}>تحليل تفصيلي لدقة إجاباتك وسرعتك في العمليات الحسابية الأربع</p>

          {/* Overall Stats */}
          <div className={styles.overallBadge}>
            <div className={styles.badgeStat}>
              <span className={styles.badgeVal}>{totalCorrect + totalWrong}</span>
              <span className={styles.badgeLabel}>إجمالي المسائل</span>
            </div>
            <div className={styles.badgeStat}>
              <span className={styles.badgeVal} style={{ color: '#059669' }}>{totalCorrect}</span>
              <span className={styles.badgeLabel}>الإجابات الصحيحة</span>
            </div>
            <div className={styles.badgeStat}>
              <span className={styles.badgeVal} style={{ color: '#0284c7' }}>{overallAcc}%</span>
              <span className={styles.badgeLabel}>معدل الإتقان العام</span>
            </div>
          </div>

          {/* Operations breakdown */}
          <div className={styles.statsGrid}>
            {operations.map((op) => {
              const c = stats[op.key]?.correct || 0
              const w = stats[op.key]?.wrong || 0
              const total = c + w
              const pct = getPercentage(c, w)

              let feedback = 'لم تبدأ هذا التدريب بعد'
              let fClass = ''
              if (total > 0) {
                if (pct >= 85) { feedback = '🌟 عبقري ومتقن تماماً!'; fClass = styles.perfect }
                else if (pct >= 60) { feedback = '👍 أداء جيد جداً، واصل التدريب!'; fClass = styles.good }
                else { feedback = '💡 تحتاج إلى مزيد من التمرين'; fClass = styles.needsWork }
              }

              return (
                <div key={op.key} className={`${styles.statRow} ${op.classRow}`}>
                  <div className={styles.statHeader}>
                    <span className={styles.statTitle}>{op.title}</span>
                    <span className={styles.statNumbers}>
                      {c} صحيحة / {total} مسألة ({pct}%)
                    </span>
                  </div>

                  <div className={styles.progressBarBg}>
                    <div 
                      className={`${styles.progressBarFill} ${op.fillClass}`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>

                  <div className={`${styles.feedbackText} ${fClass}`}>
                    {feedback}
                  </div>
                </div>
              )
            })}
          </div>

          <button className={styles.actionBtn} onClick={() => router.push('/kids-corner/math-training')}>
            ابدأ تمرين جديد 🧮
          </button>
        </div>

      </div>
    </div>
  )
}
