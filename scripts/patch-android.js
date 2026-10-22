const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');

if (fs.existsSync(manifestPath)) {
    let manifest = fs.readFileSync(manifestPath, 'utf8');

    const permissions = `
    <!-- Video and Audio WebRTC Permissions -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    
    <!-- Screen Sharing & Media Projection Permissions -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION" />
    
    <!-- File Upload/Download Permissions -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    
    <!-- Device Identity (For Login Protection) -->
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    `;

    // Insert permissions before the <application tag
    manifest = manifest.replace('<application', permissions + '\n    <application');

    fs.writeFileSync(manifestPath, manifest);
    console.log('Successfully patched AndroidManifest.xml with required permissions.');
} else {
    console.error('AndroidManifest.xml not found. Run npx cap add android first.');
    process.exit(1);
}

// Patch MainActivity.java for WebRTC Permissions
const mainActivityPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'java', 'com', 'alwateen', 'platform', 'MainActivity.java');

if (fs.existsSync(mainActivityPath)) {
    let javaContent = fs.readFileSync(mainActivityPath, 'utf8');
    
    const imports = `
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.os.Build;
import android.Manifest;
import android.content.pm.PackageManager;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
`;
    
    const overrideMethod = `
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Request Native Android Permissions
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            java.util.List<String> permissionsList = new java.util.ArrayList<>();
            permissionsList.add(Manifest.permission.CAMERA);
            permissionsList.add(Manifest.permission.RECORD_AUDIO);
            permissionsList.add(Manifest.permission.MODIFY_AUDIO_SETTINGS);
            
            if (Build.VERSION.SDK_INT >= 33) {
                permissionsList.add(Manifest.permission.READ_MEDIA_IMAGES);
            } else {
                permissionsList.add(Manifest.permission.READ_EXTERNAL_STORAGE);
                permissionsList.add(Manifest.permission.WRITE_EXTERNAL_STORAGE);
            }

            String[] permissions = new String[permissionsList.size()];
            permissions = permissionsList.toArray(permissions);
            
            boolean allGranted = true;
            for (String p : permissions) {
                if (ContextCompat.checkSelfPermission(this, p) != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }
            
            if (!allGranted) {
                ActivityCompat.requestPermissions(this, permissions, 1);
            }
        }
        
        WebView webView = this.bridge.getWebView();
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    request.grant(request.getResources());
                }
            }
        });
    }
`;

    if (!javaContent.includes('import android.webkit.PermissionRequest;')) {
        javaContent = javaContent.replace('import com.getcapacitor.BridgeActivity;', 'import com.getcapacitor.BridgeActivity;' + imports);
        javaContent = javaContent.replace('public class MainActivity extends BridgeActivity {', 'public class MainActivity extends BridgeActivity {' + overrideMethod);
        fs.writeFileSync(mainActivityPath, javaContent);
        console.log('Successfully patched MainActivity.java to allow WebRTC permissions.');
    }
} else {
    console.warn('MainActivity.java not found, WebRTC patch skipped.');
}