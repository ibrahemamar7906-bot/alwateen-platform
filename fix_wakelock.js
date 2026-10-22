const fs = require('fs');

const files = [
  'e:/ملفات المنصة/-/app/virtual-classroom/page.js',
  'e:/ملفات المنصة/-/app/teacher-assistant/virtual-classroom/page.js',
  'e:/ملفات المنصة/-/app/teacher-assistant/whiteboard/WhiteboardComponent.js',
  'e:/ملفات المنصة/-/app/teacher-assistant/live-components/LiveWhiteboardTeacher.js'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the requestWakeLock logic
    content = content.replace(
      /const requestWakeLock = async \(\) => \{[\s\S]*?\} catch \(err\) \{[\s\S]*?console\.warn\('Wake Lock error:', err\);[\s\S]*?\}[\s\S]*?\};/,
      `const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && document.visibilityState === 'visible') {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        // Silently catch wake lock errors so they don't clutter the console for the user
      }
    };`
    );

    fs.writeFileSync(file, content, 'utf8');
  }
});
