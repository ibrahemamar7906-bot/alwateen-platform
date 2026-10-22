const fs = require('fs');
const path = require('path');

const pageJsPath = path.join('e:', 'منصة الوتين', 'app', 'page.js');
let pageJs = fs.readFileSync(pageJsPath, 'utf8');

// 1. Add imports
if (!pageJs.includes('useRouter')) {
  pageJs = pageJs.replace(
    /import \{ useState \} from 'react'/,
    "import { useState } from 'react'\nimport { useRouter } from 'next/navigation'"
  );
}

// 2. Add state
if (!pageJs.includes('const router = useRouter()')) {
  pageJs = pageJs.replace(
    /const \[isMobileMenuOpen, setIsMobileMenuOpen\] = useState\(false\)/,
    "const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)\n  const router = useRouter()\n  const [selectedYear, setSelectedYear] = useState('')\n  const [selectedSystem, setSelectedSystem] = useState('general')\n\n  const handleSearch = () => {\n    if (selectedYear) {\n      router.push('/' + selectedYear)\n    } else {\n      alert('الرجاء اختيار السنة الدراسية أولاً')\n    }\n  }"
  );
}

// 3. Update Quick Search Box JSX
const searchControlsRegex = /<div className=\{styles\.searchControls\}>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
const newSearchControls = <div className={styles.searchControls}>
            <select 
              className={styles.searchSelect}
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
            >
              <option value="general">نظام التعليم (عام)</option>
              <option value="languages">نظام التعليم (لغات)</option>
            </select>
            <select 
              className={styles.searchSelect}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">السنة الدراسية</option>
              <option value="sec-1">الصف الأول الثانوي</option>
              <option value="sec-2">الصف الثاني الثانوي</option>
              <option value="sec-3">الصف الثالث الثانوي</option>
              <option value="prep-1">الصف الأول الإعدادي</option>
              <option value="prep-2">الصف الثاني الإعدادي</option>
              <option value="prep-3">الصف الثالث الإعدادي</option>
              <option value="primary-6">الصف السادس الابتدائي</option>
            </select>
            <button className={styles.searchBtn} onClick={handleSearch}>ابحث</button>
          </div>
        </div>
      </div>;
pageJs = pageJs.replace(searchControlsRegex, newSearchControls);
fs.writeFileSync(pageJsPath, pageJs, 'utf8');

// Now page.module.css
const cssPath = path.join('e:', 'منصة الوتين', 'app', 'page.module.css');
let css = fs.readFileSync(cssPath, 'utf8');

css = css.replace(/padding: 120px 6% 120px;/, 'padding: 80px 5% 100px;');
css = css.replace(/font-size: 3rem;/, 'font-size: 2.6rem;');
css = css.replace(/font-size: 2\.2rem;/g, 'font-size: 1.8rem;'); // for mobile heroTitle

// Ensure quick search is column on mobile
if (!css.includes('.searchControls { flex-direction: column; }')) {
  css = css.replace(
    /@media \(max-width: 768px\) \{/,
    "@media (max-width: 768px) {\n  .searchControls {\n    flex-direction: column;\n  }\n  .searchSelect, .searchBtn {\n    width: 100%;\n  }\n  .hero {\n    padding: 60px 5% 70px !important;\n  }"
  );
}

// Make sure max-width for hero is large
css = css.replace(/max-width: 1000px;\s*margin: 0 auto;\s*position: relative;\s*z-index: 1;/g, 'max-width: 100%; margin: 0 auto; position: relative; z-index: 1;');

fs.writeFileSync(cssPath, css, 'utf8');

console.log('Fixed functionality and scaling');
