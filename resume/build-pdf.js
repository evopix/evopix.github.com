/* eslint-disable no-console */
const path = require('path');
const playwright = require('playwright');

async function main() {
  const htmlFile = path.resolve('./output/resume.html');

  const browser = await playwright.chromium.launch({
    args: ['--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.emulateMedia({ media: 'print' });
  await page.goto(`file://${htmlFile}`, { waitUntil: 'networkidle0' });

  await page.pdf({
    format: 'Letter',
    margin: {
      bottom: '0.4in',
      left: '0.4in',
      right: '0.4in',
      top: '0.4in',
    },
    path: 'output/resume.pdf',
    preferCSSPageSize: true,
    printBackground: true,
  });

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
