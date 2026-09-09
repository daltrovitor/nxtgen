import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();
  
  // Clear session storage before loading to ensure preloader runs
  await page.addInitScript(() => {
    sessionStorage.clear();
  });

  const outDir = path.join(process.cwd(), "public", "screenshots", "preloader");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Navigate to page
  const navigation = page.goto("http://localhost:3000");

  // Capture at 1.2s
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, "preloader_1200ms.png") });
  console.log("📸 Captured preloader at 1200ms");

  // Capture at 2.6s
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(outDir, "preloader_2600ms.png") });
  console.log("📸 Captured preloader at 2600ms");

  await navigation;
  await browser.close();
}

main().catch(console.error);
