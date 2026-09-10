import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  // 1. Desktop
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4500);

  await page.evaluate(() => {
    document.getElementById("secao-login")?.scrollIntoView();
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "public/screenshots/desktop_auth_calibrated.png" });

  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: "public/screenshots/desktop_bottom_calibrated.png" });

  // 2. Mobile All 4 Stages
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4500);

  // Stage 0: Initial Load (scroll = 0, phone dominates, tip peeking at bottom)
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "public/screenshots/mobile_stage_0_initial.png" });

  // Stage 0 Scrolled: Hero
  await page.evaluate(() => {
    document.getElementById("mob-hero")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(700);
  await page.screenshot({ path: "public/screenshots/mobile_stage_0_hero.png" });

  // Stage 1: Pass
  await page.evaluate(() => {
    document.getElementById("mob-pass")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(700);
  await page.screenshot({ path: "public/screenshots/mobile_stage_1_pass.png" });

  // Stage 2: Gamify
  await page.evaluate(() => {
    document.getElementById("mob-gamify")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(700);
  await page.screenshot({ path: "public/screenshots/mobile_stage_2_gamify.png" });

  // Stage 3: Auth
  await page.evaluate(() => {
    document.getElementById("mob-login")?.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(700);
  await page.screenshot({ path: "public/screenshots/mobile_stage_3_auth.png" });

  // Stage 4: Footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(700);
  await page.screenshot({ path: "public/screenshots/mobile_stage_4_footer.png" });

  await browser.close();
  console.log("All mobile stages and footer captured!");
}

main().catch(console.error);
