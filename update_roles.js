const fs = require('fs');
const path = require('path');

function processFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    const originalContent = content;
    
    content = content.split("profile?.role !== 'teacher'").join("(profile?.role !== 'teacher' && profile?.role !== 'teacher_pro')");
    content = content.split("profile.role !== 'teacher'").join("(profile.role !== 'teacher' && profile.role !== 'teacher_pro')");
    content = content.split("userProfile?.role !== 'teacher'").join("(userProfile?.role !== 'teacher' && userProfile?.role !== 'teacher_pro')");
    
    content = content.split("profile?.role === 'teacher'").join("['teacher', 'teacher_pro'].includes(profile?.role)");
    content = content.split("profile.role === 'teacher'").join("['teacher', 'teacher_pro'].includes(profile.role)");
    content = content.split("userProfile?.role === 'teacher'").join("['teacher', 'teacher_pro'].includes(userProfile?.role)");
    
    if (content !== originalContent) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log('Updated', filepath);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            walkDir(filepath);
        } else if (filepath.endsWith('.js') || filepath.endsWith('.jsx')) {
            processFile(filepath);
        }
    }
}

walkDir('app');
