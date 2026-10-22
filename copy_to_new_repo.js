const fs = require('fs');
const path = require('path');

const srcDir = 'E:\\New folder (2)\\-';
const dstDir = 'E:\\New folder (2)\\-\\alwateen-platform';

const exclude = new Set([
    '.git',
    'alwateen-platform',
    'node_modules',
    'node_extract',
    'node.zip',
    'deploy',
    'netlify-drop-contents',
    'netlify-redirect',
    'netlify-drop.zip',
    'cloudflare-drop.zip',
    'old_page.js',
    'old_css.txt',
    'old_css_backup.txt',
    'original_css.txt',
    'WhatsApp Image 2026-10-22 at 7.20.00 PM.jpeg'
]);

function copyRecursive(src, dst) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        if (!fs.existsSync(dst)) {
            fs.mkdirSync(dst, { recursive: true });
        }
        const entries = fs.readdirSync(src);
        for (const entry of entries) {
            copyRecursive(path.join(src, entry), path.join(dst, entry));
        }
    } else {
        fs.copyFileSync(src, dst);
    }
}

const rootEntries = fs.readdirSync(srcDir);
let copied = [];

for (const entry of rootEntries) {
    if (exclude.has(entry)) continue;
    const srcPath = path.join(srcDir, entry);
    const dstPath = path.join(dstDir, entry);
    try {
        copyRecursive(srcPath, dstPath);
        copied.push(entry);
    } catch (err) {
        console.error('Failed to copy', entry, err.message);
    }
}

console.log('Successfully copied ' + copied.length + ' top-level items to ' + dstDir);