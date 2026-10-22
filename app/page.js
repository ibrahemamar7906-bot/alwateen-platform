'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import styles from './page.module.css'
import Footer from './components/Footer'
import { 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  Gamepad2, 
  Wand2, 
  Video, 
  Users, 
  Trophy, 
  ArrowLeft, 
  LogIn, 
  CheckCircle2, 
  Layers, FileText, 
  PlayCircle,
  Award,
  BarChart3,
  Presentation,
  ShieldCheck,
  BrainCircuit
} from 'lucide-react'

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (profile) {
          const r = profile.role;
          if (r === 'admin') router.push('/admin-dashboard');
          else if (r === 'teacher' || r === 'teacher_pro' || r === 'assistant') router.push('/teacher-assistant');
          else if (r === 'parent') router.push('/parent-dashboard');
          else router.push('/student-dashboard');
        }
      }
    };
    checkSession();
  }, [router]);

  const [selectedRole, setSelectedRole] = useState('student')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedTool, setSelectedTool] = useState('')
  const [searchError, setSearchError] = useState('')

  const handleSearch = () => {
    if (selectedRole === 'student') {
      if (selectedYear) {
        router.push('/' + selectedYear)
      } else {
        setSearchError('الرجاء اختيار الصف الدراسي أولاً للبدء 🎯')
      }
    } else {
      if (selectedTool) {
        router.push('/' + selectedTool)
      } else {
        setSearchError('الرجاء اختيار الأداة التعليمية أولاً 🛠️')
      }
    }
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'منصة الوتين التعليمية',
    alternateName: 'Al-Wateen Educational Platform',
    url: 'https://alwateen.com',
    logo: 'https://alwateen.com/logo.png',
    description: 'منصة الوتين التعليمية بإشراف المستر إبراهيم عمار - أشمون، المنوفية. المنصة الرائدة لتعليم اللغة العربية لجميع مراحل العام والأزهر، مع فصول تفاعلية مباشرة وسبورة ذكية متقدمة.',
    telephone: '+201010407906',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'أشمون',
      addressRegion: 'المنوفية',
      addressCountry: 'EG'
    },
    founder: {
      '@type': 'Person',
      name: 'المستر إبراهيم عمار',
      jobTitle: 'معلم أول لغة عربية',
      worksFor: {
        '@type': 'EducationalOrganization',
        name: 'منصة الوتين التعليمية'
      }
    },
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'أشمون' },
      { '@type': 'AdministrativeArea', name: 'المنوفية' },
      { '@type': 'Country', name: 'مصر' }
    ],
    sameAs: ['https://wa.me/201010407906'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'المناهج والأدوات التعليمية',
      itemListElement: [
        { '@type': 'Course', name: 'تأسيس اللغة العربية والقراءة والكتابة', educationalLevel: 'المرحلة الابتدائية ورياض الأطفال' },
        { '@type': 'Course', name: 'منهج اللغة العربية للشهادة الإعدادية والثانوية (عام وأزهر)', educationalLevel: 'المرحلة الإعدادية والثانوية' },
        { '@type': 'SoftwareApplication', name: 'نظام الفصول الافتراضية والبث المباشر', applicationCategory: 'EducationalApplication' },
        { '@type': 'SoftwareApplication', name: 'السبورة التفاعلية الذكية وأدوات المعلمين', applicationCategory: 'EducationalApplication' }
      ]
    }
  }

  return (
    <main className={styles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Ambient Decorative Background Glows */}
      <div className={styles.ambientGlowTop}></div>
      <div className={styles.ambientGlowMid}></div>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className={styles.mobileOverlay} 
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* 1. Header */}
      <header className={styles.header}>
        <Link href="/" className={styles.logoContainer}>
          <div className={styles.logoImgWrapper}>
            <img src="/icon.png?v=3" alt="لوجو منصة الوتين" width="38" height="38" className={styles.logoImg} />
          </div>
          <div className={styles.logoText}>
            <span className={styles.brandName}>الوتين</span>
            <span className={styles.brandSub}>للتعليم التفاعلي الذكي</span>
          </div>
        </Link>
        
        <button 
          className={styles.hamburgerBtn} 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="القائمة"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>

        <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.navOpen : ''}`}>
          <Link href="#kids" onClick={() => setIsMobileMenuOpen(false)}>
            🎓 بوابة الطلاب
          </Link>
          <Link href="#teacher" onClick={() => setIsMobileMenuOpen(false)}>
            👨‍🏫 أدوات المعلمين
          </Link>
          <Link href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)}>
            ⚙️ كيف تعمل المنصة
          </Link>
          <Link href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className={styles.navSpecialLink}>
            🏷️ الأسعار
          </Link>
          <Link href="/azkar" onClick={() => setIsMobileMenuOpen(false)} className={styles.mobileOnlyNav}>
            📿 الأذكار
          </Link>
          
          <div className={styles.mobileActions}>
            <Link href="/login" className={styles.loginBtn} onClick={() => setIsMobileMenuOpen(false)}>
              <LogIn size={18} /> الدخول
            </Link>
            <Link href="/register" className={styles.registerBtn} onClick={() => setIsMobileMenuOpen(false)}>
              <Sparkles size={18} /> حساب جديد
            </Link>
          </div>
        </nav>
        
        <div className={styles.headerActions}>
          <Link href="/azkar" className={styles.azkarBtn} title="أذكار الصباح والمساء والمسلم">
            📿 الأذكار
          </Link>
          <Link href="/login" className={styles.loginBtn}>
            <LogIn size={18} /> تسجيل الدخول
          </Link>
          <Link href="/register" className={styles.registerBtn}>
            <Sparkles size={18} /> حساب جديد
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className={styles.hero}>
        <div className={`${styles.floatIcon} ${styles.float1}`}><Sparkles size={32} /></div>
        <div className={`${styles.floatIcon} ${styles.float2}`}><BookOpen size={32} /></div>
        <div className={`${styles.floatIcon} ${styles.float3}`}><GraduationCap size={32} /></div>
        <div className={styles.heroContent}>
          <div className={styles.heroFloatingIcon1}><Sparkles size={48} color="#158E55" /></div>
          <div className={styles.heroFloatingIcon2}><BookOpen size={48} color="#1AB065" /></div>
          <div className={styles.heroFloatingIcon3}><Gamepad2 size={48} color="#6ee7b7" /></div>
          
          <div className={styles.heroProfileWrapper}>
            <img src="/hero_profile.png" alt="المستر إبراهيم عمار" className={styles.heroProfileImg} />
          </div>

          <div className={styles.heroBadge}>
            <span className={styles.heroBadgeDot}></span>
            <span>المنظومة التعليمية التفاعلية 2026</span>
          </div>
          
          <h1 className={styles.heroTitle}>
            مستقبل التعليم التفاعلي <br/>
            <span className={styles.heroHighlight}>منصتك المستقلة لشرح أمتع!</span>
          </h1>
          
          <p className={styles.heroDescription}>
            نقدم مسارين: <b>للطلاب</b> (شرح ومناهج العام والأزهر الشريف مع المستر إبراهيم عمار)، و<b>للمعلمين</b> (أدوات لايف، سبورة ذكية، وألعاب تعليمية <u>لتستخدمها بنفسك مع طلابك الخاصين</u> كمنصتك الشخصية).
          </p>
          
          <div className={styles.heroButtons}>
            <Link href="#stages" className={styles.heroPrimaryBtn}>
              🎓 أنا طالب
            </Link>
            <Link href="#teacher" className={styles.heroSecondaryBtn}>
              👨‍🏫 أنا معلم
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Search Box */}
      <div className={styles.quickSearchWrapper}>
        <div className={styles.quickSearchBox}>
          <div className={styles.searchTitle}>
            <h3>ابحث عن الكورس المناسب لك</h3>
          </div>
          <div className={styles.searchControls}>
            <select 
              className={styles.searchSelect}
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setSelectedYear('');
                setSelectedTool('');
                if (searchError) setSearchError('');
              }}
            >
              <option value="student">أنا طالب</option>
              <option value="teacher">أنا معلم</option>
            </select>

            {selectedRole === 'student' ? (
              <select 
                className={`${styles.searchSelect} ${searchError ? styles.searchSelectError : ''}`}
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  if (searchError) setSearchError('');
                }}
              >
                <option value="">اختر الصف الدراسي والمسار</option>
                <optgroup label="المرحلة الثانوية (عام وأزهر)">
                  <option value="sec-1">الصف الأول الثانوي (عام وأزهر)</option>
                  <option value="sec-2">الصف الثاني الثانوي (عام وأزهر)</option>
                  <option value="sec-3">الصف الثالث الثانوي (عام وأزهر)</option>
                </optgroup>
                <optgroup label="المرحلة الإعدادية (عام وأزهر)">
                  <option value="prep-1">الصف الأول الإعدادي (عام وأزهر)</option>
                  <option value="prep-2">الصف الثاني الإعدادي (عام وأزهر)</option>
                  <option value="prep-3">الصف الثالث الإعدادي (عام وأزهر)</option>
                </optgroup>
                <optgroup label="المرحلة الابتدائية والتأسيس">
                  <option value="primary-6">الصف السادس الابتدائي (عام وأزهر)</option>
                  <option value="primary-1">الصف الأول الابتدائي (عام وأزهر)</option>
                  <option value="kids-corner">عالم الأطفال والتأسيس القرآني</option>
                </optgroup>
              </select>
            ) : (
              <select 
                className={`${styles.searchSelect} ${searchError ? styles.searchSelectError : ''}`}
                value={selectedTool}
                onChange={(e) => {
                  setSelectedTool(e.target.value);
                  if (searchError) setSearchError('');
                }}
              >
                <option value="">اختر الأداة</option>
                <option value="teacher-assistant">أدوات مساعدة للمعلم (مجانًا)</option>
                <option value="free-whiteboard">السبورة الذكية (مجانًا)</option>
                <option value="try-live">تجربة البث المباشر (مجانًا)</option>
                <option value="live">البث المباشر الاحترافي (للمشتركين)</option>
              </select>
            )}

            <button className={styles.searchBtn} onClick={handleSearch}>
              {selectedRole === 'student' ? 'ابدأ التعلم' : 'جرب الآن'}
            </button>
          </div>
          {searchError && (
            <div className={styles.searchErrorMsg}>
              <span>⚠️ {searchError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Official Platform Poster Showcase */}
      <section style={{ maxWidth: '1140px', margin: '35px auto 40px', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{
          position: 'relative',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px -10px rgba(26, 46, 134, 0.28), 0 0 0 2px rgba(222, 162, 74, 0.35)',
          background: 'linear-gradient(135deg, #1A2E86 0%, #0F1D5C 100%)'
        }}>
          <img 
            src="/poster.jpg" 
            alt="منصة الوتين التعليمية - المستر إبراهيم عمار | تعلّم بذكاء.. تميّز بجدارة" 
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              aspectRatio: '16/9',
              objectFit: 'cover'
            }} 
          />
        </div>
      </section>

      {/* About Teacher Section */}
      <section className={styles.aboutTeacherSection}>
        <div className={styles.aboutTeacherContainer}>
          <div className={styles.aboutTeacherImageWrapper}>
            <img src="/teacher_photo.jpg" alt="المستر إبراهيم عمار" className={styles.aboutTeacherImg} />
          </div>
          <div className={styles.aboutTeacherContent}>
            <span className={styles.aboutTeacherTag}>كلمة المعلم</span>
            <h2 className={styles.aboutTeacherTitle}>أهلاً بك يا بطل في عالمك الجديد!</h2>
            <p className={styles.aboutTeacherText}>
              أنا <strong>المستر إبراهيم عمار</strong>، معلم وخبير اللغة العربية ومناهج العام والأزهر الشريف. لقد أسست هذه المنصة لتكون دليلك ورفيقك في رحلة التفوق. هنا لا نحفظ فقط، بل <strong>نفهم العربي، نطبقه، ونتميز به</strong>.
            </p>
            <p className={styles.aboutTeacherQuote}>
              "مهمتي ليست فقط تدريس المنهج، بل بناء عقل يستوعب لغته، وروح تثق بقدراتها لتصل إلى القمة."
            </p>
          </div>
        </div>
      </section>

      {/* 3. Stats Banner */}
      <section className={styles.statsSection}>
        <div className={styles.statsBanner}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>10k+</span>
            <span className={styles.statTitle}>طالب وطالبة نشطين</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>500+</span>
            <span className={styles.statTitle}>درس تفاعلي ومذكرة</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>50k+</span>
            <span className={styles.statTitle}>تحدي ولعبة تم لعبها</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>100%</span>
            <span className={styles.statTitle}>رضا أولياء الأمور والمعلمين</span>
          </div>
        </div>
      </section>

      {/* 4. Educational Stages */}
      <section id="stages" className={styles.stagesSection}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionTag}>المسارات التعليمية للطلاب</span>
          <h2 className={styles.sectionTitle}>مناهج العام والأزهر الشريف 📚</h2>
          <p className={styles.sectionSub}>تغطية شاملة ومفصلة لجميع مقررات العام والأزهر الشريف لكل المراحل الدراسية</p>
        </div>

        <div className={styles.stagesGrid}>
          {/* Secondary Stage */}
          <div className={`${styles.stageCard} ${styles.themeSec}`}>
            <div className={styles.stageHeader}>
              <div className={styles.stageIcon}><GraduationCap size={28} /></div>
              <span className={styles.stageBadge}>المرحلة الثانوية</span>
              <h3>المرحلة الثانوية (عام وأزهر)</h3>
            </div>
            <div className={styles.stageBody}>
              <p>مناهج متكاملة لطلاب الثانوية العامة والثانوية الأزهرية (علمي وأدبي) تغطي اللغة العربية والعلوم الشرعية بنظام حديث.</p>
              <div className={styles.stageActionBtnsContainer}>
                <Link href="/sec-1" className={styles.stageActionBtn}>الصف الأول &larr;</Link>
                <Link href="/sec-2" className={styles.stageActionBtn}>الصف الثاني &larr;</Link>
                <Link href="/sec-3" className={styles.stageActionBtn}>الصف الثالث &larr;</Link>
              </div>
            </div>
          </div>

          {/* Prep Stage */}
          <div className={`${styles.stageCard} ${styles.themePrep}`}>
            <div className={styles.stageHeader}>
              <div className={styles.stageIcon}><BookOpen size={28} /></div>
              <span className={styles.stageBadge}>المرحلة المتوسطة</span>
              <h3>المرحلة الإعدادية (عام وأزهر)</h3>
            </div>
            <div className={styles.stageBody}>
              <p>شرح وتأسيس قوي في مناهج الإعدادي العام ومقررات المعاهد الأزهرية (أصول الدين، الفقه، واللغة العربية).</p>
              <div className={styles.stageActionBtnsContainer}>
                <Link href="/prep-1" className={styles.stageActionBtn}>أولى إعدادي &larr;</Link>
                <Link href="/prep-2" className={styles.stageActionBtn}>ثانية إعدادي &larr;</Link>
                <Link href="/prep-3" className={styles.stageActionBtn}>ثالثة إعدادي &larr;</Link>
              </div>
            </div>
          </div>

          {/* Primary Stage */}
          <Link href="/kids-corner" className={`${styles.stageCard} ${styles.themePri}`} style={{ textDecoration: 'none' }}>
            <div className={styles.stageHeader}>
              <div className={styles.stageIcon}><Gamepad2 size={28} /></div>
              <span className={styles.stageBadge}>التأسيس والابتدائي</span>
              <h3>الابتدائي والتأسيس القرآني</h3>
            </div>
            <div className={styles.stageBody}>
              <p>تأسيس سليم في القراءة والكتابة والقرآن الكريم ونور البيان لمناهج العام والأزهر عبر الوسائط التفاعلية.</p>
              <div className={styles.stageActionBtnsContainer}>
                <span className={styles.stageActionBtn} style={{ background: '#f59e0b', color: 'white', borderColor: '#f59e0b' }}>دخول عالم الأطفال &larr;</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 5. How It Works (Pillars) */}
      <section id="how-it-works" className={styles.pillarsSection}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionTag}>كيف تعمل المنصة؟</span>
          <h2 className={styles.sectionTitle}>مساران لنجاحك، اختر مسارك</h2>
          <p className={styles.sectionSub}>تم تصميم المنصة لتخدم طلابنا الأعزاء، ولتوفر أدوات البث المباشر لزملائنا المعلمين.</p>
        </div>

        <div className={styles.pillarsGrid}>
          {/* Path A: Student */}
          <div className={styles.pillarCard}>
            <div className={styles.pillarIconWrapper}>
              🎓
            </div>
            <h3>بوابة الطالب (مناهج العام والأزهر)</h3>
            <p>أنت هنا للتفوق في مناهج العام والأزهر الشريف! احضر حصص اللايف، استمتع بالألعاب التعليمية، وامتحن إلكترونياً مع منصة الوتين.</p>
            <Link href="/register" className={styles.pillarAction}>سجل كطالب وابدأ التعلم &larr;</Link>
          </div>

          {/* Path B: Teacher */}
          <div className={styles.pillarCard}>
            <div className={styles.pillarIconWrapperTeacher}>
              👨‍🏫
            </div>
            <h3>بوابة المعلم (استخدم المنصة لطلابك)</h3>
            <p>أنت هنا لتشرح لطلابك! أنشئ غرفتك الافتراضية، ارسل الرابط لطلابك، وابدأ الشرح بسبورتنا التفاعلية وأدوات التحكم الذكية.</p>
            <Link href="/teacher-assistant" className={styles.pillarActionTeacher}>اكتشف أدوات المعلم &larr;</Link>
          </div>
        </div>
      </section>

      {/* 6. Kids Games Section */}
      <section id="kids" className={styles.kidsSection}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionTag}>التعلم باللعب</span>
          <h2 className={styles.sectionTitle}>ألعاب تعليمية ذكية للأطفال 🎮</h2>
          <p className={styles.sectionSub}>حوّل وقت الشاشة إلى متعة تعليمية تعزز التركيز والسرعة وحب المعرفة</p>
        </div>

        <div className={styles.kidsGrid}>
          {/* Game 1: Mario */}
          <Link href="/kids-corner/games/mario?subject=math" className={styles.gameCard}>
            <div className={styles.gameCardTop}>
              <div className={styles.gameIconMario}>🍄</div>
              <span className={styles.gameBadgeMario}>حساب وعربية</span>
            </div>
            <h4>ماريو البطل والأسئلة الذهبية</h4>
            <p>اقفز بالبطل ماريو وافتح الصناديق السحرية بالإجابة الصحيحة على العمليات الحسابية والكلمات.</p>
            <div className={styles.gamePlayBtn}>
              <PlayCircle size={16} /> العب الآن
            </div>
          </Link>

          {/* Game 2: Subway */}
          <Link href="/kids-corner/games/subway?subject=english" className={styles.gameCard}>
            <div className={styles.gameCardTop}>
              <div className={styles.gameIconSubway}>🚆</div>
              <span className={styles.gameBadgeSubway}>لغات وإنجليزي</span>
            </div>
            <h4>صب واي الحروف والكلمات</h4>
            <p>اركض وتفادى القطارات المسرعة عبر اختيار الإجابة الصحيحة للأسئلة في الوقت المناسب.</p>
            <div className={styles.gamePlayBtn}>
              <PlayCircle size={16} /> العب الآن
            </div>
          </Link>

          {/* Game 3: Tank Battle */}
          <Link href="/kids-corner/games/tank-battle?subject=arabic" className={styles.gameCard}>
            <div className={styles.gameCardTop}>
              <div className={styles.gameIconTank}>🚀</div>
              <span className={styles.gameBadgeTank}>تحدي فردي وثنائي</span>
            </div>
            <h4>حرب الكلمات ومعركة الدبابات</h4>
            <p>أطلق القذائف بدقة عبر حل المسائل وقواعد اللغة، نافس زميلك أو العب ضد الروبوت الذكي.</p>
            <div className={styles.gamePlayBtn}>
              <PlayCircle size={16} /> العب الآن
            </div>
          </Link>
        </div>
      </section>

      {/* 7. Teacher Section */}
      <section id="teacher" className={styles.teacherSection}>
        <div className={styles.teacherBanner}>
          <div className={styles.teacherInfo}>
            <h2 className={styles.teacherTitle}>احنا معاك لطلاب البكالوريا<br/><span className={styles.teacherHighlight}>امتلك منصتك الخاصة! 🚀</span></h2>
            <p className={styles.teacherDesc}>
              نحن لا نوظف معلمين، بل نوفر <b>لك</b> الأدوات التكنولوجية (نظام لايف، ألعاب تفاعلية، اختبارات ذكية) لتدير حصصك الخاصة الأونلاين وكأنك تمتلك منصتك البرمجية المستقلة تماماً.
            </p>
            <div className={styles.teacherButtons}>
              <Link href="/admin-dashboard" className={styles.teacherBtnPrimary}>
                <FileText size={20} /> أنشئ اختبارك الأول مجاناً!
              </Link>
              <Link href="/teacher-assistant" className={styles.teacherBtnSecondary}>
                <Wand2 size={20} /> استكشف باقي الأدوات
              </Link>
            </div>
          </div>

          <div className={styles.teacherFeaturesList}>
            <div className={styles.teacherFeatureBox}>
              <div className={styles.icon}>📝</div>
              <h4>نظام الاختبارات الذكي</h4>
              <p>وداعاً للتصحيح اليدوي! صمم اختبارات جذابة مانعة للغش، واحصل على تقرير درجات تلقائي في الإكسيل.</p>
            </div>
            <div className={styles.teacherFeatureBox}>
              <div className={styles.icon}>✍️</div>
              <h4>السبورة التفاعلية للدروس</h4>
              <p>شرح أونلاين بسبورة متطورة تحتوي على أدوات رسم وأشكال هندسية تلفت انتباه الطلاب.</p>
            </div>
            <div className={styles.teacherFeatureBox}>
              <div className={styles.icon}>📜</div>
              <h4>منشئ الشهادات التلقائي</h4>
              <p>كافئ طلابك الأوائل وصمم شهادات تقدير احترافية باسم كل طالب بضغطة زر واحدة.</p>
            </div>
            <div className={styles.teacherFeatureBox}>
              <div className={styles.icon}>🎡</div>
              <h4>عجلة الأسماء العشوائية</h4>
              <p>اختر الطلاب للمشاركة في الفصل بطريقة حماسية عادلة ومثيرة للاهتمام.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2>مستعد للانطلاق نحو القمة؟ 🚀</h2>
          <p>سجل حسابك الآن واستمتع بتجربة تعليمية ذكية وشاملة تجمع المتعة والتفوق معاً.</p>
          <Link href="/register" className={styles.ctaBtn}>
            <Sparkles size={20} /> ابدأ رحلتك التعليمية الآن
          </Link>
        </div>
      </section>

      {/* 9. Footer */}
      <Footer />
    </main>
  )
}











