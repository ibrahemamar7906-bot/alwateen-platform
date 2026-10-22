const fs = require('fs');
const file = 'e:\\منصة الوتين\\app\\virtual-classroom\\page.js';
let content = fs.readFileSync(file, 'utf8');

const injection = `
  // Notify student of their own network issues
  const lastPoorNetworkWarning = useRef(0)
  useEffect(() => {
    if (networkQuality === 'poor') {
      const now = Date.now()
      if (now - lastPoorNetworkWarning.current > 30000) { // Max once every 30s
        showToast('⚠️ انتباه: إشارة الإنترنت لديك ضعيفة، قد يتأخر نقل الصوت والصورة', 'warning')
        lastPoorNetworkWarning.current = now
      }
    }
  }, [networkQuality])

  // Warn if initial connection is blocked by their router/ISP
  useEffect(() => {
    if (!hasJoined) {
      const slowTimer = setTimeout(() => {
        showToast('⏳ جاري محاولة تخطي حماية الشبكة لديك للاتصال... يرجى الانتظار', 'warning')
      }, 8000)
      return () => clearTimeout(slowTimer)
    }
  }, [hasJoined])
`;

// Insert the injection after the useWebRTC hook
const hookEndIndex = content.indexOf('} = useWebRTC(channel, deviceId, studentName');
if (hookEndIndex !== -1) {
  const insertIndex = content.indexOf('\n', hookEndIndex) + 1;
  content = content.slice(0, insertIndex) + injection + content.slice(insertIndex);
  
  // Also change the CHANNEL_ERROR toast
  content = content.replace(
    "showToast('⚠️ انقطع الاتصال... جاري إعادة الاتصال ⏳', 'warning')",
    "showToast('⚠️ تم قطع الاتصال من شبكتك... جاري استعادة الاتصال ⏳', 'warning')"
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log('Added network warnings successfully!');
} else {
  console.log('Could not find injection point');
}
