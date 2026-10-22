const { execSync } = require('child_process');
try {
  console.log(execSync('npm run build', { encoding: 'utf8' }));
} catch (e) {
  console.log('BUILD ERROR:');
  console.log(e.stdout);
  console.log(e.stderr);
}