const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  // Mock API requests
  await page.setRequestInterception(true);
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/auth/me')) {
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: { name: 'Test User', role: 'student', email: 'test@test.com' }
          }
        })
      });
    } else if (url.includes('/api/auth/login')) {
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            user: { name: 'Test User', role: 'student', email: 'test@test.com' },
            accessToken: 'dummy-token'
          },
          message: 'Success'
        })
      });
    } else if (url.includes('/api/career/summary')) {
       request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            hasData: true,
            scores: { CRS: 85, IRS: 80, CCI: 90, crsClassification: 'Career Ready', irsClassification: 'Career Ready', cciClassification: 'Excellent' },
            flaggedTopics: []
          }
        })
      });
    } else {
      request.continue();
    }
  });

  console.log("Navigating to login...");
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle0' });
  
  console.log("Typing credentials...");
  await page.type('input[name="email"]', 'test@test.com');
  await page.type('input[name="password"]', 'password123');
  
  console.log("Clicking login...");
  await page.click('button[type="submit"]');
  
  console.log("Waiting for navigation...");
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 }).catch(e => console.log("Navigation timeout", e.message));
  
  console.log("Current URL:", page.url());
  
  // Wait to let dashboard render
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
