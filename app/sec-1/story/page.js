'use client'
import Link from 'next/link'
import { ArrowRight, Shield, ChevronLeft } from 'lucide-react'
import styles from '../page.module.css'

export default function Sec1StoryPage() {
  const chapters = [
    { title: 'الفصل الأول: مغني القافلة', desc: 'شخصية عنترة، مواكبه في الصحراء، وصراعه الداخلي من أجل الحرية.', isLocked: false },
    { title: 'الفصل الثاني: البطل الحائر', desc: 'حوار عنترة مع أمه زبيبة واكتشاف حقيقة نسبه إلى شداد.', isLocked: false },
    { title: 'الفصل الثالث: طلب الاعتراف', desc: 'مواجهة عنترة لأبيه شداد ورفض شداد إلحاق عنترة بنسبه.', isLocked: false },
    { title: 'الفصل الرابع: فروسية ونصر', desc: 'غارة طيء على عبس، استنجاد شداد بعنترة، ونيل عنترة حريته بسيفه.', isLocked: false },
    { title: 'الفصل الخامس: شروط مهر عبلة', desc: 'مؤامرة مالك بن قراد وشيبوب في طلب النوق العصافير مهراً لعبلة.', isLocked: false },
    { title: 'الفصل السادس: رحلة النعمان', desc: 'رحلة عنترة إلى الحيرة ومواجهة المخاطر للحصول على النوق العصافير.', isLocked: false }
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/sec-1" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <Shield size={18} />
                <span>القصة المقررة - الصف الأول الثانوي</span>
              </div>
              <h1 className={styles.title}>أبو الفوارس عنترة بن شداد</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div className={styles.cardsGrid}>
          {chapters.map((ch, idx) => (
            <div key={idx} className={styles.courseCard}>
              <div className={styles.cardHeader}>
                <div className={styles.iconBox}>
                  <Shield size={28} />
                </div>
                <span className={styles.badge}>فصل مقرر ⚔️</span>
              </div>
              <h3 className={styles.cardTitle}>{ch.title}</h3>
              <p className={styles.cardDesc}>{ch.desc}</p>
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
