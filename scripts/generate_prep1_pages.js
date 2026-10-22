const fs = require('fs');
const path = require('path');

const basePath = path.join('E:', 'ملفات المنصة', '-', 'app', 'prep-1');

const structure = {
  'grammar': [
    { id: 'lesson-1', title: 'الفعل اللازم والفعل المتعدي' },
    { id: 'lesson-2', title: 'الفعل المجرد والفعل المزيد' },
    { id: 'lesson-3', title: 'أنواع الفعل الصحيح' },
    { id: 'lesson-4', title: 'أنواع الفعل المعتل' },
    { id: 'lesson-5', title: 'ظن وأخواتها' },
  ],
  'reading-and-texts': [
    { id: 'lesson-1', title: 'أسطورة مصرية (أحمد منسي)' },
    { id: 'lesson-2', title: 'بطولات مصرية' },
    { id: 'lesson-3', title: 'وجه الوطن' },
    { id: 'lesson-4', title: 'تاريخنا.. أساس لمستقبلنا' },
    { id: 'lesson-5', title: 'دروس من الحياة' },
    { id: 'lesson-6', title: 'شباب اليوم.. صناع الغد' },
    { id: 'lesson-7', title: 'رحمة تداوي وعلم يضيء' },
    { id: 'lesson-8', title: 'إنسان في عصر التكنولوجيا' },
    { id: 'lesson-9', title: 'دعاء شاعرة' },
  ],
  'dictation': [
    { id: 'lesson-1', title: 'كتابة الهمزة على الألف' },
    { id: 'lesson-2', title: 'كتابة الهمزة على الواو' },
    { id: 'lesson-3', title: 'كتابة الهمزة على الياء' },
    { id: 'writing-1', title: 'كتابة السيرة الذاتية' },
    { id: 'writing-2', title: 'كتابة السيرة الغيرية' },
  ]
};

const template = (title, parentPath, parentTitle) => `'use client'
import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import styles from '../../page.module.css'

export default function LessonPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerTop}>
            <Link href="/prep-1/${parentPath}" className={styles.backButton} aria-label="العودة">
              <ArrowRight size={24} />
            </Link>
            <div>
              <div className={styles.subtitle}>
                <BookOpen size={18} />
                <span>${parentTitle}</span>
              </div>
              <h1 className={styles.title}>${title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent} style={{ marginTop: '30px' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.9)', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <h2 style={{ color: '#059669', marginBottom: '20px' }}>جاري استخراج وتجهيز محتوى هذا الدرس...</h2>
            <p style={{ color: '#475569', fontSize: '1.2rem' }}>سيتم إضافة الشرح التفصيلي والتدريبات قريباً من ملفات المنهج الجديد.</p>
        </div>
      </div>
    </div>
  )
}`;

const titles = {
    'grammar': 'فرع النحو',
    'reading-and-texts': 'القراءة والنصوص',
    'dictation': 'الإملاء والتعبير'
};

for (const [section, lessons] of Object.entries(structure)) {
  for (const lesson of lessons) {
    // Skip grammar lesson 1 because we already built it
    if (section === 'grammar' && lesson.id === 'lesson-1') continue;

    const dirPath = path.join(basePath, section, lesson.id);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const filePath = path.join(dirPath, 'page.js');
    fs.writeFileSync(filePath, template(lesson.title, section, titles[section]));
    console.log(`Created: ${filePath}`);
  }
}
