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
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const outDir = path.join(process.cwd(), "public", "screenshots", "calibration");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Measure total scroll height
  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  console.log("Total scrollable height:", scrollHeight);

  // We test 8 checkpoints along the scroll journey:
  const checkpoints = [
    { name: "01_hero_initial", ratio: 0.0, desc: "Hero Top" },
    { name: "02_hero_scroll", ratio: 0.15, desc: "Hero Transition" },
    { name: "03_pass_title", ratio: 0.30, desc: "Section 2: PASS Header & Title" },
    { name: "04_pass_benefits", ratio: 0.45, desc: "Section 2: PASS Benefits List" },
    { name: "05_gamify_title", ratio: 0.60, desc: "Section 3: Gamification Title" },
    { name: "06_gamify_xp", ratio: 0.72, desc: "Section 3: Gamification XP Card" },
    { name: "07_auth_top", ratio: 0.85, desc: "Section 4: Auth Header" },
    { name: "08_auth_card", ratio: 0.95, desc: "Section 4: NexusGate Card" },
    { name: "09_bottom_stop", ratio: 1.0, desc: "Page Bottom & Footer Stop" },
  ];

  for (const cp of checkpoints) {
    const targetScrollY = scrollHeight * cp.ratio;
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), targetScrollY);
    await page.waitForTimeout(600); // Allow spring & GSAP to settle

    // Check positions of text and phone
    const layoutInfo = await page.evaluate(() => {
      const phone = document.querySelector(".sticky");
      const phoneRect = phone ? phone.getBoundingClientRect() : null;
      return {
        scrollY: window.scrollY,
        phoneRect,
      };
    });

    const file = path.join(outDir, `${cp.name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log(`📸 Checkpoint ${cp.name} (${cp.desc}): scrollY=${Math.round(layoutInfo.scrollY)}px saved to ${file}`);
  }

  await browser.close();
  console.log("Calibration screenshots captured successfully!");
}

main().catch(console.error);
