(async () => {
  const puppeteer = (await import('puppeteer')).default;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  console.log('Navigating to student page...');
  await page.goto('http://localhost:3000/virtual-classroom?room=testroom', { waitUntil: 'networkidle2' });
  
  console.log('Waiting a bit for React to hydrate and run useEffects...');
  await new Promise(r => setTimeout(r, 5000));
  
  await browser.close();
})();
