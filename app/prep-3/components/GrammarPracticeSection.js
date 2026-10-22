'use client'

import React, { useState } from 'react'
import { CheckCircle2, Target, BookOpen, Sparkles, Award, FileText, ChevronLeft, ArrowRight, HelpCircle } from 'lucide-react'
import InteractiveQuiz from './InteractiveQuiz'
import ClickableWords from './ClickableWords'

export default function GrammarPracticeSection({ grammarData, id = 'grammar-practice' }) {
  const [activeTab, setActiveTab] = useState('rules') // 'rules' | 'passages'
  const [selectedPassageIndex, setSelectedPassageIndex] = useState(0)

  if (!grammarData) return null

  const ruleQuestions = grammarData.ruleQuestions || []
  const passages = grammarData.passages || []
  const currentPassage = passages[selectedPassageIndex] || null

  return (
    <div
      id={id}
      style={{
        marginTop: '35px',
        background: '#ffffff',
        borderRadius: '24px',
        padding: '30px',
        border: '1.5px solid #e2e8f0',
        boxShadow: '0 12px 35px rgba(0,0,0,0.04)'
      }}
    >
      {/* Section Header */}
      <div style={{ borderBottom: '2px solid #ecfdf5', paddingBottom: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 800, fontSize: '0.9rem', marginBottom: '4px' }}>
              <Sparkles size={18} />
              <span>بنك التدريبات النحوية التفاعلية والامتحانات</span>
            </div>
            <h2 style={{ color: '#0f172a', margin: 0, fontSize: '1.45rem', fontWeight: 900 }}>
              {grammarData.lessonTitle} (تصحيح فوري وشرح)
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '8px', background: '#f8fafc', padding: '6px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setActiveTab('rules')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'rules' ? '#059669' : 'transparent',
                color: activeTab === 'rules' ? '#ffffff' : '#64748b',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                fontFamily: 'Tajawal, sans-serif',
                transition: 'all 0.2s ease'
              }}
            >
              <Target size={18} />
              <span>🎯 تثبيت القواعد ({ruleQuestions.length} سؤالاً)</span>
            </button>

            <button
              onClick={() => setActiveTab('passages')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === 'passages' ? '#059669' : 'transparent',
                color: activeTab === 'passages' ? '#ffffff' : '#64748b',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                fontFamily: 'Tajawal, sans-serif',
                transition: 'all 0.2s ease'
              }}
            >
              <FileText size={18} />
              <span>📝 قطع نحوية وإعراب ({passages.length} قطع)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TAB 1: Rule Memorization and Direct Questions                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'rules' && (
        <div>
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(5,150,105,0.06), rgba(13,148,136,0.03))',
              borderRight: '5px solid #059669',
              borderRadius: '14px',
              padding: '14px 20px',
              marginBottom: '24px'
            }}
          >
            <h4 style={{ margin: '0 0 6px 0', color: '#065f46', fontSize: '1.05rem', fontWeight: 800 }}>
              💡 تدريبات تثبيت وحفظ القواعد (أسئلة مركزة وشاملة لكل أفكار الدرس)
            </h4>
            <p style={{ margin: 0, color: '#334155', fontSize: '0.92rem', lineHeight: 1.6 }}>
              أجب عن الأسئلة السريعة التالية لتثبيت مفاهيم الدرس، وتعرف على سبب كل إجابة والشرح الإعرابي والصرفي فورياً.
            </p>
          </div>

          <InteractiveQuiz
            quizData={{
              title: `تثبيت قواعد: ${grammarData.lessonTitle}`,
              questions: ruleQuestions
            }}
            id={`${id}-rules`}
            title={`تدريبات تثبيت القواعد (${ruleQuestions.length} سؤالاً)`}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TAB 2: Full Exam Grammar Passages with Parsing & Extraction   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === 'passages' && (
        <div>
          {/* Passage Selector Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '22px' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>اختر القطعة النحوية:</span>
            {passages.map((p, pIdx) => (
              <button
                key={p.id || pIdx}
                onClick={() => setSelectedPassageIndex(pIdx)}
                style={{
                  background: selectedPassageIndex === pIdx ? '#059669' : '#f1f5f9',
                  color: selectedPassageIndex === pIdx ? '#ffffff' : '#334155',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  fontFamily: 'Tajawal, sans-serif',
                  boxShadow: selectedPassageIndex === pIdx ? '0 4px 12px rgba(5,150,105,0.2)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{`القطعة ${pIdx + 1}`}</span>
              </button>
            ))}
          </div>

          {currentPassage && (
            <div>
              {/* Display Passage Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                  borderRadius: '20px',
                  padding: '24px 28px',
                  border: '2px solid #a7f3d0',
                  marginBottom: '28px',
                  boxShadow: '0 4px 15px rgba(5,150,105,0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', marginBottom: '10px' }}>
                  <FileText size={20} />
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900 }}>
                    {currentPassage.title}
                  </h3>
                </div>

                <div
                  style={{
                    color: '#064e3b',
                    fontSize: '1.18rem',
                    lineHeight: '2.3',
                    fontWeight: 600,
                    textAlign: 'justify'
                  }}
                >
                  <ClickableWords text={currentPassage.passageText} />
                </div>

                <div style={{ marginTop: '14px', fontSize: '0.88rem', color: '#047857', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>💡</span>
                  <span>اقرأ القطعة بدقة أعلاه، ثم أجب عن أسئلة الإعراب والاستخراج والتصويب أدناه بتصحيح فوري.</span>
                </div>
              </div>

              {/* Passage Questions (Parsing + Extraction + Transformation) */}
              <InteractiveQuiz
                key={`passage-quiz-${currentPassage.id}`}
                quizData={{
                  title: currentPassage.title,
                  questions: currentPassage.questions
                }}
                id={`${id}-passage-${selectedPassageIndex}`}
                title={`أسئلة القطعة النحوية (${currentPassage.questions.length} أسئلة إعراب واستخراج)`}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

