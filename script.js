const fs = require('fs');

let androidContent = fs.readFileSync('e:/ملفات المنصة/-/.github/workflows/build-android.yml', 'utf8');
// Remove gibberish or previously added permissions if they exist
androidContent = androidContent.replace(/\n\s*# Inject Permissions[\s\S]*?WRITE_EXTERNAL_STORAGE" \/>' android\/app\/src\/main\/AndroidManifest\.xml/, '');

const androidPermissions = 
          # Inject Permissions for Camera, Mic, and Storage
          sed -i '/<uses-permission android:name="android\\\\.permission\\\\.INTERNET" \\/>/a \\    <uses-permission android:name="android.permission.CAMERA" />\\n    <uses-permission android:name="android.permission.RECORD_AUDIO" />\\n    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />\\n    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />\\n    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />' android/app/src/main/AndroidManifest.xml;

if (!androidContent.includes('android.permission.CAMERA')) {
    androidContent = androidContent.replace('npx cap add android', 'npx cap add android' + androidPermissions);
    fs.writeFileSync('e:/ملفات المنصة/-/.github/workflows/build-android.yml', androidContent, 'utf8');
}


let iosContent = fs.readFileSync('e:/ملفات المنصة/-/.github/workflows/build-ios.yml', 'utf8');
// Remove old corrupted permissions block
iosContent = iosContent.replace(/\n\s*# Inject Permissions[\s\S]*?Info\.plist \|\| true/, '');
// Sometimes the regex doesn't catch all lines, so let's just do a string replacement of everything between npx cap add ios and - name: Generate App Icons
iosContent = iosContent.replace(/npx cap add ios[\s\S]*?- name: Generate App Icons/, 'npx cap add ios\n\n      - name: Generate App Icons');

const iosPermissions = 
          # Inject Permissions for Camera, Mic, and Storage into Info.plist
          plutil -insert NSCameraUsageDescription -string "نحتاج صلاحية الكاميرا للمشاركة في البث المباشر" ios/App/App/Info.plist || true
          plutil -insert NSMicrophoneUsageDescription -string "نحتاج صلاحية المايكروفون للتحدث في البث المباشر" ios/App/App/Info.plist || true
          plutil -insert NSPhotoLibraryUsageDescription -string "نحتاج صلاحية المعرض لرفع الملفات والصور" ios/App/App/Info.plist || true
          plutil -insert NSPhotoLibraryAddUsageDescription -string "نحتاج الصلاحية لحفظ الصور" ios/App/App/Info.plist || true
;

if (!iosContent.includes('NSCameraUsageDescription')) {
    iosContent = iosContent.replace('npx cap add ios', 'npx cap add ios' + iosPermissions);
    fs.writeFileSync('e:/ملفات المنصة/-/.github/workflows/build-ios.yml', iosContent, 'utf8');
}
