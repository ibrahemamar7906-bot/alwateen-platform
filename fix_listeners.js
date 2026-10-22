const fs = require('fs');

const files = [
  'LiveCertificatesStudent.js',
  'LiveFlashcardsStudent.js',
  'LiveLeaderboardStudent.js',
  'LiveMarioStudent.js',
  'LivePollStudent.js',
  'LiveRacingStudent.js',
  'LiveSubwayStudent.js',
  'LiveTankBattleStudent.js',
  'LiveTrainGameStudent.js',
  'LiveWheelStudent.js',
  'ReactionOverlay.js'
].map(f => 'app/live/' + f);

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');
  
  // To handle the double listeners, we want to remove the channel.on blocks and the corresponding unsubscribe calls.
  // This varies by file, so let's log the variables and unsubscribes.
  const regex = /const\s+(\w+)\s*=\s*channel\.on\('broadcast',\s*\{\s*event:\s*'[^']+'\s*\},\s*\([^)]*\)\s*=>\s*\{[^}]+\}\);?/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
     console.log(`Found sub: ${match[1]} in ${file}`);
  }
}
