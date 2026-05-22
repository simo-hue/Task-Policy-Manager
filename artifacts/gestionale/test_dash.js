import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  // Go to login
  await page.goto('http://localhost:5173/login');
  
  // Wait for load, maybe auto login or we need to login
  await new Promise(r => setTimeout(r, 2000));
  const content = await page.content();
  console.log("Login page HTML length:", content.length);
  
  await browser.close();
})();
