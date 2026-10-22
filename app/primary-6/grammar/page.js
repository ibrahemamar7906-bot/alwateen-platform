'use client'
import Link from 'next/link'
import { ArrowRight, Sparkles, ChevronLeft, Lock } from 'lucide-react'
import styles from '../page.module.css'

export default function BranchPage() {
  const lessons = [
  {
    "title": "كان وأخواتها وإن وأخواتها",
    "desc": "الأفعال الناسخة والحروف الناسخة وأنواع خبرها (مفرد، جملة، شبه جملة)."
  },
  {
    "title": "الأسماء الخمسة والأفعال الخمسة",
    "desc": "إعراب الأسماء الخمسة بالحروف، وإعراب الأفعال الخمسة بثبوت النون وحذفها."
  },
  {
    "title": "الضمائر البارزة والمستترة",
    "desc": "الضمائر المنفصلة والمتصلة، وتقدير الضمائر المستترة وجوباً وجوازاً."
  },
  {
    "title": "النعت والمنعوت",
    "desc": "شروط النعت وتطابقه مع المنعوت في الإعراب والتعريف والنوع والعدد."
  }
];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/primary-6" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <Sparkles size={18} />
                <span>القواعد النحوية المتقدمة - الصف السادس الابتدائي</span>
              </div>
              <h1 className={styles.title}>مسار القواعد النحوية المتقدمة</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div className={styles.cardsGrid}>
          {lessons.map((lesson, idx) => (
            <div key={idx} className={styles.courseCard}>
              <div className={styles.cardHeader}>
                <div className={styles.iconBox}>
                  <Sparkles size={28} />
                </div>
                <span className={styles.badge}>الدرس ${idx + 1} 🌟</span>
              </div>
              <h3 className={styles.cardTitle}>{lesson.title}</h3>
              <p className={styles.cardDesc}>{lesson.desc}</p>
              <div className={styles.cardFooter}>
                <span className={styles.footerText}>جاهز للمحتوى والشرح</span>
                <div className={styles.actionBtn}>
                  <ChevronLeft size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
