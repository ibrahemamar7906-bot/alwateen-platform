const fs = require('fs');
const file = 'promo_video_foundation/ad_scenes.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Add Quran card to Scene 3
const oldCards = `<div class="s3-card s3-c3">
          <span class="s3-card-icon">🗣️</span>
          <div>
            <div class="s3-card-title">تأسيس القراءة بالصوت والصورة</div>
            <div class="s3-card-sub">ربط الحروف بالكلمات والمجسمات التفاعلية</div>
          </div>
        </div>`;

const newCards = `<div class="s3-card s3-c3">
          <span class="s3-card-icon">🗣️</span>
          <div>
            <div class="s3-card-title">تأسيس القراءة بالصوت والصورة</div>
            <div class="s3-card-sub">ربط الحروف بالكلمات والمجسمات التفاعلية</div>
          </div>
        </div>
        <div class="s3-card" style="border-right: 8px solid #059669; background: #f0fdf4;">
          <span class="s3-card-icon">📖</span>
          <div>
            <div class="s3-card-title">قسم خاص ومميز لتحفيظ القرآن الكريم</div>
            <div class="s3-card-sub">المصحف التفاعلي الذكي، وترتيب الآيات بالصوت العذب ✨</div>
          </div>
        </div>`;

if (content.includes(oldCards)) {
  content = content.replace(oldCards, newCards);
}

// 2. Adjust board height or card gap slightly if needed for 4 cards
content = content.replace('.s3-board {\n      width: 780px;\n      height: 520px;', '.s3-board {\n      width: 780px;\n      height: 550px;');
content = content.replace('.s3-cards {\n      flex: 1;\n      display: flex;\n      flex-direction: column;\n      gap: 18px;', '.s3-cards {\n      flex: 1;\n      display: flex;\n      flex-direction: column;\n      gap: 12px;');

// 3. Update Scene 5 title to include Quran
content = content.replace('منصة الجُنيدي للغة العربية والتأسيس', 'منصة الجُنيدي للغة العربية والقرآن والتأسيس');
content = content.replace('رحلة تأسيس ممتعة للقراءة والكتابة والحساب خطوة بخطوة', 'رحلة تأسيس ممتعة للقراءة والكتابة وحفظ القرآن والألعاب الذكية');

fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated ad_scenes.html with Quran highlights!');
