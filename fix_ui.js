const fs = require('fs');
const path = require('path');

const filePath = path.join('E:', 'ملفات المنصة', '-', 'app', 'student-dashboard', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

const prep1Replacement =                   {student.stage === 'prep_1' && (
                    <div style={{ marginBottom: '40px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                        <div style={{ padding: '10px', background: 'linear-gradient(135deg, #059669, #0d9488)', borderRadius: '12px', color: 'white', boxShadow: '0 8px 15px rgba(5,150,105,0.25)' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', margin: '0', color: '#064e3b' }}>الصف الأول الإعدادي</h2>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
                        {/* Main Hub Card */}
                        <a href="/prep-1" style={{ position: 'relative', overflow: 'hidden', background: '#ffffff', borderRadius: '24px', border: '1.5px solid #a7f3d0', textDecoration: 'none', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(5,150,105,0.08)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(5,150,105,0.15)'; e.currentTarget.style.borderColor = '#059669'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(5,150,105,0.08)'; e.currentTarget.style.borderColor = '#a7f3d0'; }}>
                          <div style={{ height: '110px', background: 'linear-gradient(135deg, #064e3b, #059669)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #059669' }}>
                            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)' }}></div>
                            <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '900', zIndex: 1, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                              منصة الصف الأول الإعدادي
                            </h3>
                          </div>
                          <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                              <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #a7f3d0' }}>لغة عربية</span>
                              <span style={{ background: '#f0fdf4', color: '#047857', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #bbf7d0' }}>شامل</span>
                            </div>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: '#1e293b', fontWeight: '800' }}>محتوى المنهج الشامل</h4>
                            <p style={{ margin: '0 0 18px 0', color: '#64748b', fontSize: '0.92rem', lineHeight: '1.6' }}>تصفح جميع وحدات المنهج، النصوص، القراءة، النحو، والقصة المقررة.</p>
                            <div style={{ marginTop: 'auto', background: 'linear-gradient(135deg, #059669, #0d9488)', color: 'white', padding: '11px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 6px 15px rgba(5,150,105,0.25)' }}>
                              دخول للمنصة <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                            </div>
                          </div>
                        </a>
                        
                        {/* Grammar Games Card */}
                        <a href="/grammar-games" style={{ position: 'relative', overflow: 'hidden', background: '#ffffff', borderRadius: '24px', border: '1.5px solid #ddd6fe', textDecoration: 'none', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(139,92,246,0.08)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(139,92,246,0.15)'; e.currentTarget.style.borderColor = '#8b5cf6'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(139,92,246,0.08)'; e.currentTarget.style.borderColor = '#ddd6fe'; }}>
                          <div style={{ height: '110px', background: 'linear-gradient(135deg, #5b21b6, #8b5cf6)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #8b5cf6' }}>
                            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)' }}></div>
                            <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '900', zIndex: 1, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                              ألعاب النحو والتحديات
                            </h3>
                          </div>
                          <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                              <span style={{ background: '#f5f3ff', color: '#7c3aed', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #ddd6fe' }}>تفاعلي</span>
                              <span style={{ background: '#faf5ff', color: '#9333ea', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #e9d5ff' }}>تحديات</span>
                            </div>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: '#1e293b', fontWeight: '800' }}>تدرب والعب</h4>
                            <p style={{ margin: '0 0 18px 0', color: '#64748b', fontSize: '0.92rem', lineHeight: '1.6' }}>ثبت قواعد النحو من خلال ألعاب وتحديات تفاعلية تقيس مستواك وتنمي مهاراتك.</p>
                            <div style={{ marginTop: 'auto', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', color: 'white', padding: '11px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 6px 15px rgba(139,92,246,0.25)' }}>
                              ابدأ اللعب <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  )};

const prep2Replacement =                   {student.stage === 'prep_2' && (
                    <div style={{ marginBottom: '40px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                        <div style={{ padding: '10px', background: 'linear-gradient(135deg, #059669, #0d9488)', borderRadius: '12px', color: 'white', boxShadow: '0 8px 15px rgba(5,150,105,0.25)' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', margin: '0', color: '#064e3b' }}>الصف الثاني الإعدادي</h2>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
                        {/* Main Hub Card */}
                        <a href="/prep-2" style={{ position: 'relative', overflow: 'hidden', background: '#ffffff', borderRadius: '24px', border: '1.5px solid #a7f3d0', textDecoration: 'none', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(5,150,105,0.08)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(5,150,105,0.15)'; e.currentTarget.style.borderColor = '#059669'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(5,150,105,0.08)'; e.currentTarget.style.borderColor = '#a7f3d0'; }}>
                          <div style={{ height: '110px', background: 'linear-gradient(135deg, #064e3b, #059669)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #059669' }}>
                            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)' }}></div>
                            <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '900', zIndex: 1, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                              منصة الصف الثاني الإعدادي
                            </h3>
                          </div>
                          <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                              <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #a7f3d0' }}>لغة عربية</span>
                              <span style={{ background: '#f0fdf4', color: '#047857', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #bbf7d0' }}>شامل</span>
                            </div>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: '#1e293b', fontWeight: '800' }}>محتوى المنهج الشامل</h4>
                            <p style={{ margin: '0 0 18px 0', color: '#64748b', fontSize: '0.92rem', lineHeight: '1.6' }}>تصفح جميع وحدات المنهج، النصوص، القراءة، النحو، والقصة المقررة.</p>
                            <div style={{ marginTop: 'auto', background: 'linear-gradient(135deg, #059669, #0d9488)', color: 'white', padding: '11px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 6px 15px rgba(5,150,105,0.25)' }}>
                              دخول للمنصة <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                            </div>
                          </div>
                        </a>
                        
                        {/* Grammar Games Card */}
                        <a href="/grammar-games" style={{ position: 'relative', overflow: 'hidden', background: '#ffffff', borderRadius: '24px', border: '1.5px solid #ddd6fe', textDecoration: 'none', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(139,92,246,0.08)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(139,92,246,0.15)'; e.currentTarget.style.borderColor = '#8b5cf6'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(139,92,246,0.08)'; e.currentTarget.style.borderColor = '#ddd6fe'; }}>
                          <div style={{ height: '110px', background: 'linear-gradient(135deg, #5b21b6, #8b5cf6)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #8b5cf6' }}>
                            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)' }}></div>
                            <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '900', zIndex: 1, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                              ألعاب النحو والتحديات
                            </h3>
                          </div>
                          <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                              <span style={{ background: '#f5f3ff', color: '#7c3aed', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #ddd6fe' }}>تفاعلي</span>
                              <span style={{ background: '#faf5ff', color: '#9333ea', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #e9d5ff' }}>تحديات</span>
                            </div>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: '#1e293b', fontWeight: '800' }}>تدرب والعب</h4>
                            <p style={{ margin: '0 0 18px 0', color: '#64748b', fontSize: '0.92rem', lineHeight: '1.6' }}>ثبت قواعد النحو من خلال ألعاب وتحديات تفاعلية تقيس مستواك وتنمي مهاراتك.</p>
                            <div style={{ marginTop: 'auto', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', color: 'white', padding: '11px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 6px 15px rgba(139,92,246,0.25)' }}>
                              ابدأ اللعب <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  )};

const prep3Replacement =                   {student.stage === 'prep_3' && (
                    <div style={{ marginBottom: '40px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                        <div style={{ padding: '10px', background: 'linear-gradient(135deg, #059669, #0d9488)', borderRadius: '12px', color: 'white', boxShadow: '0 8px 15px rgba(5,150,105,0.25)' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '900', margin: '0', color: '#064e3b' }}>الصف الثالث الإعدادي</h2>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
                        {/* Main Hub Card */}
                        <a href="/prep-3" style={{ position: 'relative', overflow: 'hidden', background: '#ffffff', borderRadius: '24px', border: '1.5px solid #a7f3d0', textDecoration: 'none', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(5,150,105,0.08)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(5,150,105,0.15)'; e.currentTarget.style.borderColor = '#059669'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(5,150,105,0.08)'; e.currentTarget.style.borderColor = '#a7f3d0'; }}>
                          <div style={{ height: '110px', background: 'linear-gradient(135deg, #064e3b, #059669)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #059669' }}>
                            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)' }}></div>
                            <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '900', zIndex: 1, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                              منصة الصف الثالث الإعدادي
                            </h3>
                          </div>
                          <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                              <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #a7f3d0' }}>لغة عربية</span>
                              <span style={{ background: '#f0fdf4', color: '#047857', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #bbf7d0' }}>شامل</span>
                            </div>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: '#1e293b', fontWeight: '800' }}>محتوى المنهج الشامل</h4>
                            <p style={{ margin: '0 0 18px 0', color: '#64748b', fontSize: '0.92rem', lineHeight: '1.6' }}>تصفح جميع وحدات المنهج، النصوص، القراءة، النحو، والقصة المقررة.</p>
                            <div style={{ marginTop: 'auto', background: 'linear-gradient(135deg, #059669, #0d9488)', color: 'white', padding: '11px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 6px 15px rgba(5,150,105,0.25)' }}>
                              دخول للمنصة <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                            </div>
                          </div>
                        </a>
                        
                        {/* Grammar Games Card */}
                        <a href="/grammar-games" style={{ position: 'relative', overflow: 'hidden', background: '#ffffff', borderRadius: '24px', border: '1.5px solid #ddd6fe', textDecoration: 'none', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(139,92,246,0.08)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(139,92,246,0.15)'; e.currentTarget.style.borderColor = '#8b5cf6'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(139,92,246,0.08)'; e.currentTarget.style.borderColor = '#ddd6fe'; }}>
                          <div style={{ height: '110px', background: 'linear-gradient(135deg, #5b21b6, #8b5cf6)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #8b5cf6' }}>
                            <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)' }}></div>
                            <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '900', zIndex: 1, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                              ألعاب النحو والتحديات
                            </h3>
                          </div>
                          <div style={{ padding: '22px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                              <span style={{ background: '#f5f3ff', color: '#7c3aed', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #ddd6fe' }}>تفاعلي</span>
                              <span style={{ background: '#faf5ff', color: '#9333ea', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #e9d5ff' }}>تحديات</span>
                            </div>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: '#1e293b', fontWeight: '800' }}>تدرب والعب</h4>
                            <p style={{ margin: '0 0 18px 0', color: '#64748b', fontSize: '0.92rem', lineHeight: '1.6' }}>ثبت قواعد النحو من خلال ألعاب وتحديات تفاعلية تقيس مستواك وتنمي مهاراتك.</p>
                            <div style={{ marginTop: 'auto', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', color: 'white', padding: '11px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 6px 15px rgba(139,92,246,0.25)' }}>
                              ابدأ اللعب <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  )};

// Find prep_1 block start
let idx1 = content.indexOf("{student.stage === 'prep_1' && (");
let endIdx1 = content.indexOf(")}", idx1);
if (idx1 !== -1 && endIdx1 !== -1) {
  content = content.substring(0, idx1) + prep1Replacement.substring(18) + content.substring(endIdx1 + 2);
}

// Find prep_2 block start
let idx2 = content.indexOf("{student.stage === 'prep_2' && (");
let endIdx2 = content.indexOf(")}", idx2);
if (idx2 !== -1 && endIdx2 !== -1) {
  content = content.substring(0, idx2) + prep2Replacement.substring(18) + content.substring(endIdx2 + 2);
}

// Find prep_3 block start
let idx3 = content.indexOf("{student.stage === 'prep_3' && (");
let endIdx3 = content.indexOf(")}", idx3);
if (idx3 !== -1 && endIdx3 !== -1) {
  content = content.substring(0, idx3) + prep3Replacement.substring(18) + content.substring(endIdx3 + 2);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed file.');
