const { execSync } = require('child_process');
const commits = ['5313597', '7ea3676', 'd30b4b7', '1b8d61d', 'a17eef8', 'f6f5e67', 'cb3d57a', 'ea4ecba', 'f870a87', '10ce2a1'];

for (const commit of commits) {
    try {
        const content = execSync(`git -C "e:\\منصة الوتين" show ${commit}:app/admin-dashboard/components/QuizManagerTab.js`, { encoding: 'buffer' });
        const text = content.toString('utf8');
        const isCorrupted = text.includes('ظ') || text.includes('');
        console.log(`${commit}: ${isCorrupted ? 'BAD' : 'GOOD'}`);
    } catch (e) {
        console.log(`${commit}: ERROR ${e.message}`);
    }
}
