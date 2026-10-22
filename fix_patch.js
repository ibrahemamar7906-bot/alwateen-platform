const fs = require('fs');
const path = 'e:\\ملفات المنصة\\-\\scripts\\patch-android.js';
let content = fs.readFileSync(path, 'utf8');

const targetStr = 
            String[] permissions = {
                Manifest.permission.CAMERA,
                Manifest.permission.RECORD_AUDIO,
                Manifest.permission.MODIFY_AUDIO_SETTINGS
            };
;

const replacement = 
            java.util.List<String> permissionsList = new java.util.ArrayList<>();
            permissionsList.add(Manifest.permission.CAMERA);
            permissionsList.add(Manifest.permission.RECORD_AUDIO);
            permissionsList.add(Manifest.permission.MODIFY_AUDIO_SETTINGS);
            
            // Storage permissions based on Android version
            if (Build.VERSION.SDK_INT >= 33) {
                permissionsList.add(Manifest.permission.READ_MEDIA_IMAGES);
            } else {
                permissionsList.add(Manifest.permission.READ_EXTERNAL_STORAGE);
                permissionsList.add(Manifest.permission.WRITE_EXTERNAL_STORAGE);
            }

            String[] permissions = new String[permissionsList.size()];
            permissions = permissionsList.toArray(permissions);
;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacement);
    fs.writeFileSync(path, content, 'utf8');
    console.log("Replaced successfully!");
} else if (content.includes("java.util.List<String> permissionsList")) {
    console.log("Already replaced!");
} else {
    console.log("Could not find target string.");
}