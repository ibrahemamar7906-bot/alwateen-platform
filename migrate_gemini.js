const fs = require('fs');

const filesToUpdate = [
    'e:/ملفات المنصة/-/app/admin-dashboard/components/ExamBuilderTab.js',
    'e:/ملفات المنصة/-/app/admin-dashboard/components/LessonsTab.js',
    'e:/ملفات المنصة/-/app/admin-dashboard/components/QuizManagerTab.js',
    'e:/ملفات المنصة/-/app/teacher-assistant/whiteboard/FlashcardModal.js',
    'e:/ملفات المنصة/-/app/teacher-assistant/whiteboard/MindMapImportModal.js'
];

for (const file of filesToUpdate) {
    if (!fs.existsSync(file)) continue;
    
    let content = fs.readFileSync(file, 'utf8');

    // 1. Remove apiKey definition (it will now be undefined or unused, which is fine, or we can replace it)
    content = content.replace(/const apiKey = process\.env\.NEXT_PUBLIC_GEMINI_API_KEY;\n/g, '');
    content = content.replace(/if \(!apiKey\) \{[\s\S]*?\}/, '');

    // 2. Replace fetch URL for gemini-1.5-pro or gemini-3.1-pro-preview or anything
    // It's usually like: fetch(`https://generativelanguage.googleapis.com/v1beta/models/...:generateContent?key=${apiKey}`, { ... })
    
    // We will just replace the URL string with `/api/gemini` and inject the model name if it's there.
    // Instead of complex regex, let's just find the `https://generativelanguage...` and replace it.
    
    content = content.replace(/`https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\/([^:]+):generateContent\?key=\$\{apiKey\}`/g, 
        '`/api/gemini`'
    );
    // There might be single quotes instead of backticks
    content = content.replace(/'https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\/([^:]+):generateContent\?key='\s*\+\s*apiKey/g, 
        "'/api/gemini'"
    );

    // Now, we need to pass `model: '...'` inside the body if we matched a model. 
    // Actually, our API route defaults to `gemini-3.1-pro-preview`, which is what most use.
    // Let's just let it default for now, or assume the user can specify it if needed.
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
}
