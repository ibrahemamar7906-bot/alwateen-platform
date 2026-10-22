const fs = require('fs');
const file = 'e:\\ملفات المنصة\\-\\app\\register\\page.js';
let content = fs.readFileSync(file, 'utf8');

const target = '<h3 className={styles.roleCardTitle}>حساب معلم</h3>';
if (content.includes(target)) {
    // Find the closing </button> for the teacher card
    const teacherCardStart = content.indexOf('<button', content.lastIndexOf('<button', content.indexOf(target)));
    const teacherCardEnd = content.indexOf('</button>', teacherCardStart) + '</button>'.length;
    
    const newCard = 
            <button 
              className={styles.roleCardBig} 
              onClick={() => handleRoleSelection('assistant')}
            >
              <div className={styles.roleCardIcon}>
                <Bot size={28} />
              </div>
              <div className={styles.roleCardContent}>
                <h3 className={styles.roleCardTitle}>حساب مساعد معلم</h3>
                <p className={styles.roleCardDesc}>
                  سجل كمساعد، وسيُطلب منك كود الربط الخاص بالمعلم الذي ستعمل معه فور دخولك.
                </p>
              </div>
            </button>
;
    // Insert new card after teacher card
    content = content.slice(0, teacherCardEnd) + newCard + content.slice(teacherCardEnd);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Success');
} else {
    console.log('Target not found');
}