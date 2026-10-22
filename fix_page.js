const fs = require('fs');
const path = 'e:\\ملفات المنصة\\-\\app\\sec-2\\grammar\\page.js';

const content = 
'use client'
import Link from 'next/link'
import { ArrowRight, BookOpen, Lock, ChevronLeft, PenTool } from 'lucide-react'
import styles from '../page.module.css'

export default function GrammarIndex() {
  const lessons = [
    { 
      title: 'الأسماء الخمسة', 
      desc: 'إعرابها وشروطها وتطبيقات عليها', 
      path: '/sec-2/grammar/lesson-1', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'الممنوع من الصرف', 
      desc: 'الممنوع لعلة واحدة ولعلتين وإعرابه', 
      path: '/sec-2/grammar/lesson-2', 
      status: 'متاح الآن',
      isLocked: false,
    },
    { 
      title: 'النعت الحقيقي والسببي', 
      desc: 'تعريف النعت وأنواعه وشروط المطابقة', 
      path: '/sec-2/grammar/lesson-3', 
      status: 'متاح الآن',
      isLocked: false,
    }
  ]

  return (
    <div className={styles.container}>
      
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/sec-2" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <PenTool size={18} />
                <span>فرع النحو (تأسيس بكالوريا)</span>
              </div>
              <h1 className={styles.title}>النحو 2 بكالوريا</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.listGrid}>
          {lessons.map((lesson, idx) => (
            <Link 
              key={idx} 
              href={lesson.path}
              className={\\ \\}
              onClick={e => lesson.isLocked && e.preventDefault()}
            >
              <div className={styles.listCardLeft}>
                <div className={styles.listIconBox}>
                  {lesson.isLocked ? (
                    <Lock size={24} />
                  ) : (
                    <BookOpen size={24} />
                  )}
                </div>
                <div className={styles.listCardContent}>
                  <h3 className={styles.listCardTitle}>{lesson.title}</h3>
                  <p className={styles.listCardDesc}>{lesson.desc}</p>
                </div>
              </div>
              
              <div className={styles.listCardRight}>
                <span className={\\ \\}>
                  {lesson.status}
                </span>
                {!lesson.isLocked && (
                  <div className={styles.actionBtn}>
                    <ChevronLeft size={18} />
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
;

fs.writeFileSync(path, content.trim(), 'utf8');