'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Download, Upload, Save, X, BookOpen, Layers, FileText, CheckCircle2, RefreshCw, Wand2 } from 'lucide-react'
import { supabase } from '../../utils/supabase'
import AIGameGenerator from './AIGameGenerator'
import { 
  normalizeQuestion, 
  normalizeQuestions, 
  parseQuestionsFromCSV, 
  parseQuestionsFromBulkText, 
  saveActiveCustomQuestions,
  loadActiveCustomQuestions,
  getBuiltinQuestions,
  saveQuestionsBySpecialty
} from '../utils/questionHelper'

export default function QuestionManagerModal({ customQuestions, setCustomQuestions, onClose, isStandalone = false, specialty = null }) {
  const [questions, setQuestions] = useState(() => {
    if (customQuestions && customQuestions.length > 0) {
      return normalizeQuestions(customQuestions);
    }
    const loaded = loadActiveCustomQuestions();
    return loaded || [];
  })
  
  const [newQ, setNewQ] = useState({ text: '', answer: '', w1: '', w2: '', w3: '' })
  const [savedPackages, setSavedPackages] = useState([])
  const [showBulkPaste, setShowBulkPaste] = useState(false)
  const [showAIPaste, setShowAIPaste] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [importMode, setImportMode] = useState('replace') // 'replace' | 'append'
  const [successMsg, setSuccessMsg] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('profiles').select('role').eq('id', user.id).single().then(({ data }) => {
          if (data && data.role === 'admin') setIsAdmin(true);
        });
      }
    });
  }, []);

  useEffect(() => {
    try {
      const localPkgs = localStorage.getItem('teacher_question_packages')
      if (localPkgs) {
        setSavedPackages(JSON.parse(localPkgs))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const flashSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  }

  const handleAddQuestion = () => {
    if (!newQ.text.trim() || !newQ.answer.trim() || !newQ.w1.trim()) {
      alert('ط§ظ„ط±ط¬ط§ط، ط¥ط¯ط®ط§ظ„ ظ†طµ ط§ظ„ط³ط¤ط§ظ„ ظˆط§ظ„ط¥ط¬ط§ط¨ط© ط§ظ„طµط­ظٹط­ط© ظˆط®ظٹط§ط± ط®ط§ط·ط¦ ظˆط§ط­ط¯ ط¹ظ„ظ‰ ط§ظ„ط£ظ‚ظ„');
      return;
    }
    const qObj = normalizeQuestion({
      text: newQ.text.trim(),
      answer: newQ.answer.trim(),
      w1: newQ.w1.trim(),
      w2: (newQ.w2 || 'ط®ظٹط§ط± 2').trim(),
      w3: (newQ.w3 || 'ط®ظٹط§ط± 3').trim(),
      options: [newQ.answer.trim(), newQ.w1.trim(), newQ.w2.trim(), newQ.w3.trim()].filter(Boolean)
    });

    if (qObj) {
      setQuestions(prev => [...prev, qObj]);
      setNewQ({ text: '', answer: '', w1: '', w2: '', w3: '' });
      flashSuccess('âœ… طھظ… ط¥ط¶ط§ظپط© ط§ظ„ط³ط¤ط§ظ„ ط¨ظ†ط¬ط§ط­!');
    }
  }

  const handleDelete = (index) => {
    setQuestions(prev => prev.filter((_, idx) => idx !== index));
  }

  const handleSave = () => {
    const normalized = normalizeQuestions(questions);
    const result = saveActiveCustomQuestions(normalized.length > 0 ? normalized : null);
    // Also persist per-specialty so next session loads automatically
    if (specialty) saveQuestionsBySpecialty(specialty, normalized.length > 0 ? normalized : null);
    if (setCustomQuestions) {
      setCustomQuestions(result);
    }
    flashSuccess(`ًںژ® طھظ… طھط·ط¨ظٹظ‚ ${normalized.length} ط³ط¤ط§ظ„ ظپظٹ ط§ظ„ظ„ط¹ط¨ط© ط¨ظ†ط¬ط§ط­!`);
    setTimeout(() => {
      onClose();
    }, 400);
  }

  // Load builtin questions for current specialty
  const handleLoadBuiltin = () => {
    const builtins = getBuiltinQuestions(specialty)
    if (!builtins || builtins.length === 0) return
    if (importMode === 'replace') {
      setQuestions(builtins)
    } else {
      setQuestions(prev => [...prev, ...builtins])
    }
    flashSuccess(`âœ¨ طھظ… طھط­ظ…ظٹظ„ ${builtins.length} ط³ط¤ط§ظ„ ط¬ط§ظ‡ط² ظ„ظ„طھط®طµطµ!`)
  }

  const handleLoadPackage = (pkg) => {
    if (confirm(`ظ‡ظ„ طھط±ظٹط¯ طھط­ظ…ظٹظ„ ط­ط²ظ…ط© "${pkg.name}" (${pkg.questions.length} ط³ط¤ط§ظ„) ظˆط§ط³طھط¨ط¯ط§ظ„ ط§ظ„ط£ط³ط¦ظ„ط© ط§ظ„ط­ط§ظ„ظٹط©طں`)) {
      const formatted = normalizeQuestions(pkg.questions);
      setQuestions(formatted);
      flashSuccess(`ًں“ڑ طھظ… طھط­ظ…ظٹظ„ ط­ط²ظ…ط© "${pkg.name}" ط¨ظ†ط¬ط§ط­!`);
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const parsed = parseQuestionsFromCSV(text);
        if (parsed.length > 0) {
          if (importMode === 'replace') {
            setQuestions(parsed);
          } else {
            setQuestions(prev => [...prev, ...parsed]);
          }
          flashSuccess(`ًںژ‰ طھظ… ط§ط³طھظٹط±ط§ط¯ ${parsed.length} ط³ط¤ط§ظ„ ط¨ظ†ط¬ط§ط­!`);
        } else {
          alert('طھط¹ط°ط± ظ‚ط±ط§ط،ط© ط§ظ„ط£ط³ط¦ظ„ط© ظ…ظ† ط§ظ„ظ…ظ„ظپ. ظٹط±ط¬ظ‰ ط§ظ„طھط£ظƒط¯ ظ…ظ† ظ†ظ…ظˆط°ط¬ ط§ظ„ط¥ظƒط³ظٹظ„ ط£ظˆ ظƒطھط§ط¨ط© ط§ظ„ط£ط³ط¦ظ„ط© ط¨ط´ظƒظ„ طµط­ظٹط­.');
        }
      } catch (err) {
        console.error(err);
        alert('ط­ط¯ط« ط®ط·ط£ ط£ط«ظ†ط§ط، ظ‚ط±ط§ط،ط© ظ…ظ„ظپ ط§ظ„ط£ط³ط¦ظ„ط©');
      }
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  }

  const handleBulkParse = () => {
    if (!bulkText.trim()) return;
    const parsed = parseQuestionsFromBulkText(bulkText);
    if (parsed.length > 0) {
      if (importMode === 'replace') {
        setQuestions(parsed);
      } else {
        setQuestions(prev => [...prev, ...parsed]);
      }
      setBulkText('');
      setShowBulkPaste(false);
      flashSuccess(`ًں“‹ طھظ… طھط­ظˆظٹظ„ ${parsed.length} ط³ط¤ط§ظ„ ظˆط¥ط¶ط§ظپطھظ‡ط§ ط¨ظ†ط¬ط§ط­!`);
    } else {
      alert('ظٹط±ط¬ظ‰ ط§ظ„طھط£ظƒط¯ ظ…ظ† ط§ظ„طھظ†ط³ظٹظ‚ (ط§ظ„ط³ط¤ط§ظ„ | ط§ظ„ط¥ط¬ط§ط¨ط© ط§ظ„طµط­ظٹط­ط© | ط®ظٹط§ط± ط®ط§ط·ط¦ 1 | ط®ظٹط§ط± ط®ط§ط·ط¦ 2)');
    }
  }

  const downloadTemplate = () => {
    const header = "ط§ظ„ط³ط¤ط§ظ„,ط§ظ„ط¥ط¬ط§ط¨ط© ط§ظ„طµط­ظٹط­ط©,ط®ظٹط§ط± ط®ط§ط·ط¦ 1,ط®ظٹط§ط± ط®ط§ط·ط¦ 2,ط®ظٹط§ط± ط®ط§ط·ط¦ 3\n";
    const sample1 = "ظ…ط§ ظ‡ظˆ ظ†ط§طھط¬ ط¬ظ…ط¹ 5 + 5 طں,10,8,12,15\n";
    const sample2 = "ظ…ط§ ظ‡ظٹ ط¹ط§طµظ…ط© ط¬ظ…ظ‡ظˆط±ظٹط© ظ…طµط± ط§ظ„ط¹ط±ط¨ظٹط©طں,ط§ظ„ظ‚ط§ظ‡ط±ط©,ط§ظ„ط¥ط³ظƒظ†ط¯ط±ظٹط©,ط£ط³ظˆط§ظ†,ط§ظ„ط¬ظٹط²ط©\n";
    const sample3 = "ط£ظٹ ظ…ظ† ط§ظ„ظƒظ„ظ…ط§طھ ط§ظ„طھط§ظ„ظٹط© ط§ط³ظ… ظ…ط¬ط±ظˆط±طں,ظپظٹ ط§ظ„ظ…ط¯ط±ط³ط©ظگ,ط§ظ„ظˆظ„ط¯ظڈ,ظٹظƒطھط¨ظڈ,ط³ط±ظٹط¹ط§ظ‹\n";
    
    const csvContent = "\uFEFF" + header + sample1 + sample2 + sample3;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ظ†ظ…ظˆط°ط¬_ط£ط³ط¦ظ„ط©_ط§ظ„ط£ظ„ط¹ط§ط¨.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const exportCurrentToCSV = () => {
    if (questions.length === 0) {
      alert('ظ„ط§ طھظˆط¬ط¯ ط£ط³ط¦ظ„ط© ظپظٹ ط§ظ„ظ‚ط§ط¦ظ…ط© ظ„طھطµط¯ظٹط±ظ‡ط§');
      return;
    }
    let csv = "\uFEFFط§ظ„ط³ط¤ط§ظ„,ط§ظ„ط¥ط¬ط§ط¨ط© ط§ظ„طµط­ظٹط­ط©,ط®ظٹط§ط± ط®ط§ط·ط¦ 1,ط®ظٹط§ط± ط®ط§ط·ط¦ 2,ط®ظٹط§ط± ط®ط§ط·ط¦ 3\n";
    questions.forEach(q => {
      const wrongs = q.options.filter(opt => opt !== q.answer);
      const clean = (str) => `"${(str || '').replace(/"/g, '""')}"`;
      const w1 = clean(q.rawOptions?.w1 || wrongs[0] || 'ط®ظٹط§ط± 1');
      const w2 = clean(q.rawOptions?.w2 || wrongs[1] || 'ط®ظٹط§ط± 2');
      const w3 = clean(q.rawOptions?.w3 || wrongs[2] || 'ط®ظٹط§ط± 3');
      csv += `${clean(q.text)},${clean(q.answer)},${w1},${w2},${w3}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ط£ط³ط¦ظ„ط©_ط§ظ„ظ„ط¹ط¨ط©_ط§ظ„ظ…ط®طµطµط©.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal, sans-serif', padding: '20px', backdropFilter: 'blur(4px)'}}>
      <div style={{background: 'white', padding: '25px', borderRadius: '24px', width: '100%', maxWidth: '950px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative'}}>
        
        {/* Flash Notification */}
        {successMsg && (
          <div style={{position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(16,185,129,0.3)', zIndex: 100, display: 'flex', alignItems: 'center', gap: '6px'}}>
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {/* Modal Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', marginBottom: '15px'}}>
          <div>
            <h2 style={{margin: 0, color: '#1e293b', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
              ًں“¦ ط¨ظ†ظƒ ط£ط³ط¦ظ„ط© ط§ظ„ط£ظ„ط¹ط§ط¨ ط§ظ„ظ…ط®طµطµط© ًںژ®
              {specialty && (
                <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 10px', borderRadius: '9999px', background: specialty === 'arabic' ? '#d1fae5' : specialty === 'english' ? '#ede9fe' : specialty === 'math' ? '#dbeafe' : '#f1f5f9', color: specialty === 'arabic' ? '#065f46' : specialty === 'english' ? '#4c1d95' : specialty === 'math' ? '#1e3a8a' : '#334155' }}>
                  {specialty === 'arabic' ? 'ًں‡¸ًں‡¦ ط¹ط±ط¨ظٹ' : specialty === 'english' ? 'ًں”  ط¥ظ†ط¬ظ„ظٹط²ظٹ' : specialty === 'math' ? 'ًں”¢ ط­ط³ط§ط¨' : 'ًں“ڑ ط¹ط§ظ…'}
                </span>
              )}
            </h2>
            <p style={{margin: '3px 0 0 0', color: '#64748b', fontSize: '0.85rem'}}>
              ط§ط±ظپط¹ ظ…ظ„ظپ ط¥ظƒط³ظٹظ„طŒ ط§ط®طھط± ط­ط²ظ…ط© ط¬ط§ظ‡ط²ط©طŒ ط£ظˆ ط§ظ„طµظ‚ ط£ط³ط¦ظ„طھظƒ ظپظˆط±ط§ظ‹ ظ„طھط؛ظٹظٹط± ط£ط³ط¦ظ„ط© ط§ظ„ظ„ط¹ط¨ط©!
            </p>
          </div>
          <button onClick={onClose} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px'}}>
            <X size={26} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{display: 'flex', gap: '20px', flex: 1, minHeight: 0, overflow: 'hidden'}}>
          
          {/* Left Column: Input Form & Fast Actions */}
          <div style={{flex: '1', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '10px', borderRight: '2px solid #f1f5f9', overflowY: 'auto'}}>
            
            {/* Import Mode Selector */}
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '6px 10px', borderRadius: '10px', border: '1px solid #e2e8f0'}}>
              <span style={{fontSize: '0.8rem', fontWeight: 'bold', color: '#475569'}}>ط¹ظ†ط¯ ط±ظپط¹ ط£ط³ط¦ظ„ط© ط¬ط¯ظٹط¯ط©:</span>
              <div style={{display: 'flex', gap: '4px'}}>
                <button 
                  onClick={() => setImportMode('replace')}
                  style={{padding: '3px 8px', borderRadius: '6px', border: 'none', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', background: importMode === 'replace' ? '#3b82f6' : 'transparent', color: importMode === 'replace' ? 'white' : '#64748b'}}
                >
                  ط§ط³طھط¨ط¯ط§ظ„ ط§ظ„ظ‚ط§ط¦ظ…ط©
                </button>
                <button 
                  onClick={() => setImportMode('append')}
                  style={{padding: '3px 8px', borderRadius: '6px', border: 'none', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', background: importMode === 'append' ? '#3b82f6' : 'transparent', color: importMode === 'append' ? 'white' : '#64748b'}}
                >
                  ط¥ط¶ط§ظپط© ظ„ظ„ظ‚ط§ط¦ظ…ط©
                </button>
              </div>
            </div>

            {/* Builtin questions for specialty */}
            {specialty && specialty !== 'general' && (
              <div style={{background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1.5px solid #86efac', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px'}}>
                <div>
                  <p style={{margin: 0, fontWeight: 800, fontSize: '0.85rem', color: '#15803d'}}>âœ¨ ط£ط³ط¦ظ„ط© ط¬ط§ظ‡ط²ط© ظ„ظ„طھط®طµطµ</p>
                  <p style={{margin: '2px 0 0', fontSize: '0.75rem', color: '#166534'}}>طھط­ظ…ظٹظ„ 10 ط£ط³ط¦ظ„ط© ظ…ظ†ط§ط³ط¨ط© ظ„طھط®طµطµ {specialty === 'arabic' ? 'ط§ظ„ط¹ط±ط¨ظٹ' : specialty === 'english' ? 'ط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹ' : 'ط§ظ„ط­ط³ط§ط¨'} ظپظˆط±ط§ظ‹</p>
                </div>
                <button
                  onClick={handleLoadBuiltin}
                  style={{display:'flex', alignItems:'center', gap:'5px', background:'#16a34a', color:'white', border:'none', borderRadius:'8px', padding:'6px 12px', fontSize:'0.8rem', fontWeight:900, cursor:'pointer', flexShrink:0}}
                >
                  <Wand2 size={14} /> طھط­ظ…ظٹظ„
                </button>
              </div>
            )}

            {/* Quick Load From Library */}
            {savedPackages.length > 0 && (
              <div style={{background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '10px'}}>
                <label style={{fontWeight: 'bold', fontSize: '0.8rem', color: '#1e40af', display: 'block', marginBottom: '4px'}}>
                  ًں“ڑ ط§ط®طھط± ظ…ظ† ط­ط²ظ…ظƒ ط§ظ„ظ…ط­ظپظˆط¸ط©:
                </label>
                <select 
                  onChange={(e) => {
                    const found = (savedPackages || []).find(p => p.id === e.target.value)
                    if (found) handleLoadPackage(found)
                  }}
                  defaultValue=""
                  style={{width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #93c5fd', background: 'white', color: '#1e293b', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem'}}
                >
                  <option value="" disabled>-- ط§ط¶ط؛ط· ظ„ط§ط®طھظٹط§ط± ط­ط²ظ…ط© ط¬ط§ظ‡ط²ط© --</option>
                  {savedPackages.map(pkg => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} ({pkg.questions.length} ط³ط¤ط§ظ„)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick Upload & Paste Ribbon */}
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
              <label style={{background: '#10b981', color: 'white', padding: '8px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 'bold', textAlign: 'center', boxShadow: '0 2px 6px rgba(16,185,129,0.25)'}}>
                <Upload size={14} /> ط±ظپط¹ Excel / CSV ًں“پ
                <input type="file" accept=".csv,.txt" onChange={handleFileUpload} style={{display: 'none'}} />
              </label>

              <button 
                onClick={() => setShowBulkPaste(true)}
                style={{background: '#8b5cf6', color: 'white', padding: '8px', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 'bold', boxShadow: '0 2px 6px rgba(139,92,246,0.25)'}}
              >
                <FileText size={14} /> ظ„طµظ‚ ظ†طµ ط³ط±ظٹط¹ ًں“‹
              </button>
            <button onClick={() => setShowAIPaste(!showAIPaste)} style={{background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: 'white', padding: '8px', borderRadius: '10px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 'bold', boxShadow: '0 2px 6px rgba(14,165,233,0.35)'}}>
              <Wand2 size={14} /> توليد ذكي (AI) 🤖
            </button>
            </div>

            {/* Add Question Manually */}
            <div style={{background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px'}}>
              <h4 style={{margin: '0', color: '#334155', fontSize: '0.9rem'}}>ط¥ط¶ط§ظپط© ط³ط¤ط§ظ„ ظٹط¯ظˆظٹط§ظ‹ âœچï¸ڈ</h4>
              
              <div>
                <input 
                  type="text" 
                  value={newQ.text} 
                  onChange={e => setNewQ({...newQ, text: e.target.value})} 
                  style={{width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none'}} 
                  placeholder="ظ†طµ ط§ظ„ط³ط¤ط§ظ„ (ظ…ط«ط§ظ„: ط¹ط§طµظ…ط© ظ…طµط±طں)" 
                />
              </div>
              
              <div>
                <input 
                  type="text" 
                  value={newQ.answer} 
                  onChange={e => setNewQ({...newQ, answer: e.target.value})} 
                  style={{width: '100%', padding: '7px 10px', borderRadius: '8px', border: '2px solid #86efac', background: '#f0fdf4', fontSize: '0.85rem', outline: 'none'}} 
                  placeholder="ط§ظ„ط¥ط¬ط§ط¨ط© ط§ظ„طµط­ظٹط­ط© (ط³طھط¸ظ‡ط± ط¨ط§ظ„ط£ط®ط¶ط±)" 
                />
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px'}}>
                <input 
                  type="text" 
                  value={newQ.w1} 
                  onChange={e => setNewQ({...newQ, w1: e.target.value})} 
                  style={{padding: '6px 8px', borderRadius: '6px', border: '1px solid #fca5a5', fontSize: '0.8rem'}} 
                  placeholder="ط®ظٹط§ط± ط®ط§ط·ط¦ 1 *" 
                />
                <input 
                  type="text" 
                  value={newQ.w2} 
                  onChange={e => setNewQ({...newQ, w2: e.target.value})} 
                  style={{padding: '6px 8px', borderRadius: '6px', border: '1px solid #fca5a5', fontSize: '0.8rem'}} 
                  placeholder="ط®ظٹط§ط± ط®ط§ط·ط¦ 2" 
                />
              </div>
              
              <input 
                type="text" 
                value={newQ.w3} 
                onChange={e => setNewQ({...newQ, w3: e.target.value})} 
                style={{padding: '6px 8px', borderRadius: '6px', border: '1px solid #fca5a5', fontSize: '0.8rem'}} 
                placeholder="ط®ظٹط§ط± ط®ط§ط·ط¦ 3 (ط§ط®طھظٹط§ط±ظٹ)" 
              />
              
              <button 
                onClick={handleAddQuestion} 
                style={{background: '#3b82f6', color: 'white', padding: '8px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '2px'}}
              >
                <Plus size={14} /> ط¥ط¶ط§ظپط© ظ„ظ„ظ‚ط§ط¦ظ…ط©
              </button>
            </div>

            {/* Template & Export Links */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#64748b'}}>
              <button onClick={downloadTemplate} style={{background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px', textDecoration: 'underline'}}>
                <Download size={13} /> طھط­ظ…ظٹظ„ ظ†ظ…ظˆط°ط¬ Excel ظپط§ط±ط؛
              </button>
              <button onClick={exportCurrentToCSV} style={{background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px'}}>
                <Download size={13} /> طھطµط¯ظٹط± ط§ظ„ط£ط³ط¦ظ„ط©
              </button>
            </div>

          </div>

          {/* Right Column: List of Current Questions */}
          <div style={{flex: '1.2', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0'}}>
              <span style={{fontWeight: 'bold', color: '#1e293b', fontSize: '0.95rem'}}>
                ط§ظ„ط£ط³ط¦ظ„ط© ط§ظ„ط­ط§ظ„ظٹط© ط¬ط§ظ‡ط²ط© ظ„ظ„ط¹ط¨ط©: <span style={{color: '#2563eb'}}>({questions.length} ط³ط¤ط§ظ„)</span>
              </span>
              {questions.length > 0 && (
                <button 
                  onClick={() => setQuestions([])} 
                  style={{background: '#fee2e2', color: '#ef4444', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold'}}
                >
                  ظ…ط³ط­ ط§ظ„ظƒظ„ ًں—‘ï¸ڈ
                </button>
              )}
            </div>
            
            {questions.length === 0 ? (
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '30px', textAlign: 'center'}}>
                <p style={{fontWeight: 'bold', margin: '0 0 6px 0', fontSize: '1rem', color: '#475569'}}>ظ„ط§ طھظˆط¬ط¯ ط£ط³ط¦ظ„ط© ظ…ط®طµطµط© ظپظٹ ط§ظ„ظ‚ط§ط¦ظ…ط© ط­ط§ظ„ظٹط§ظ‹</p>
                <p style={{fontSize: '0.85rem', margin: 0, color: '#64748b'}}>ط§ط±ظپط¹ ظ…ظ„ظپ ط¥ظƒط³ظٹظ„ ط£ظˆ ط§ظ„طµظ‚ ط£ط³ط¦ظ„طھظƒ ظ„طھط¸ظ‡ط± ظپظˆط±ط§ظ‹ ظپظٹ ط§ظ„ظ„ط¹ط¨ط©طŒ ط£ظˆ ط§طھط±ظƒظ‡ط§ ظپط§ط±ط؛ط© ظ„ط§ط³طھط®ط¯ط§ظ… ط§ظ„ط£ط³ط¦ظ„ط© ط§ظ„طھظ„ظ‚ط§ط¦ظٹط© ظ„ظ„ظ…ظ†طµط©.</p>
              </div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', paddingRight: '4px'}}>
                {questions.map((q, idx) => (
                  <div key={idx} style={{background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px', position: 'relative'}}>
                    <button 
                      onClick={() => handleDelete(idx)} 
                      style={{position: 'absolute', top: '10px', left: '10px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '3px', cursor: 'pointer', display: 'flex'}}
                      title="ط­ط°ظپ ظ‡ط°ط§ ط§ظ„ط³ط¤ط§ظ„"
                    >
                      <Trash2 size={13} />
                    </button>
                    <p style={{margin: '0 0 6px 0', fontWeight: 'bold', color: '#1e293b', paddingLeft: '25px', fontSize: '0.9rem', lineHeight: '1.4'}}>
                      <span style={{color: '#3b82f6', marginLeft: '4px'}}>#{idx + 1}</span> {q.text}
                    </p>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
                      <span style={{background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold'}}>
                        âœ“ {q.answer}
                      </span>
                      {q.options.filter(o => o !== q.answer).map((wrong, wIdx) => (
                        <span key={wIdx} style={{background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem'}}>
                          âœ— {wrong}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{borderTop: '2px solid #e2e8f0', paddingTop: '12px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{fontSize: '0.85rem', color: '#64748b'}}>
            {questions.length > 0 ? (
              <span style={{color: '#16a34a', fontWeight: 'bold'}}>âœ… {questions.length} ط³ط¤ط§ظ„ ظ…ط®طµطµ ط¬ط§ظ‡ط² ظ„ظ„طھط·ط¨ظٹظ‚</span>
            ) : (
              <span>âڑ ï¸ڈ ط³طھط¹ظ…ظ„ ط§ظ„ظ„ط¹ط¨ط© ط¨ط£ط³ط¦ظ„ط© ط§ظ„ظ…ظ†طµط© ط§ظ„ط§ظپطھط±ط§ط¶ظٹط©</span>
            )}
          </div>

          <div style={{display: 'flex', gap: '10px'}}>
            <button onClick={onClose} style={{background: '#f1f5f9', color: '#475569', padding: '8px 18px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem'}}>
              ط¥ظ„ط؛ط§ط،
            </button>
            {!isStandalone && (
              <button 
                onClick={handleSave} 
                style={{background: '#10b981', color: 'white', padding: '10px 24px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)'}}
              >
                <Save size={18} /> طھط·ط¨ظٹظ‚ ظˆطھط؛ظٹظٹط± ط§ظ„ط£ط³ط¦ظ„ط© ظپظٹ ط§ظ„ظ„ط¹ط¨ط© ط§ظ„ط¢ظ† ًںژ®
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Sub-modal: Bulk Text Paste */}
      {showBulkPaste && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(3px)'}}>
          <div style={{background: 'white', borderRadius: '20px', width: '100%', maxWidth: '600px', padding: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)'}}>
            <h3 style={{margin: '0 0 10px 0', fontSize: '1.2rem', color: '#1e293b'}}>ظ„طµظ‚ ط£ط³ط¦ظ„ط© ظ…طھط¹ط¯ط¯ط© ًں“‹</h3>
            <p style={{color: '#64748b', fontSize: '0.85rem', margin: '0 0 10px 0'}}>
              ط§ظ†ط³ط® ط£ط³ط¦ظ„طھظƒ ظˆط§ظ„طµظ‚ظ‡ط§ ظ‡ظ†ط§طŒ ظˆط§ظپطµظ„ ط¨ظٹظ† ط§ظ„ط³ط¤ط§ظ„ ظˆط§ظ„ط¥ط¬ط§ط¨ط© ظˆط§ظ„ط®ظٹط§ط±ط§طھ ط¨ط¹ظ„ط§ظ…ط© ( | ) ط£ظˆ ظپط§طµظ„ط©:
            </p>
            <div style={{background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 12px', marginBottom: '10px', fontSize: '0.8rem', color: '#475569'}}>
              ظ…ط«ط§ظ„: ظ…ط§ ط¹ط§طµظ…ط© ظ…طµط±طں | ط§ظ„ظ‚ط§ظ‡ط±ط© | ط§ظ„ط¥ط³ظƒظ†ط¯ط±ظٹط© | ط£ط³ظˆط§ظ† | ط§ظ„ط¬ظٹط²ط©
            </div>
            <textarea 
              rows={6}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              placeholder="ط§ظ„طµظ‚ ط§ظ„ط£ط³ط¦ظ„ط© ظ‡ظ†ط§..."
              style={{width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', lineHeight: '1.5'}}
            />
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px'}}>
              <button onClick={() => setShowBulkPaste(false)} style={{background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'}}>
                ط¥ظ„ط؛ط§ط،
              </button>
              <button onClick={handleBulkParse} style={{background: '#8b5cf6', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'}}>
                طھط­ظˆظٹظ„ ظˆط¥ط¶ط§ظپط© âœ…
              </button>
            </div>
          </div>
        </div>
      )}
      {showAIPaste && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(3px)'}}>
          <div style={{background: 'white', borderRadius: '20px', width: '100%', maxWidth: '700px', padding: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
              <h3 style={{margin: 0, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px'}}><Wand2 color="#0ea5e9"/> توليد أسئلة بالذكاء الاصطناعي</h3>
              <button onClick={() => setShowAIPaste(false)} style={{background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '5px', cursor: 'pointer'}}><X size={20} color="#64748b"/></button>
            </div>
            <AIGameGenerator importMode={importMode} onGenerated={(newQs, mode) => { if (mode === 'replace') setQuestions(newQs); else setQuestions(prev => [...prev, ...newQs]); setShowAIPaste(false); flashSuccess('🎉 تم توليد وإضافة أسئلة بنجاح!'); }} />
          </div>
        </div>
      )}
    </div>
  )
}


