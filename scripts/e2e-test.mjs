import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOTS_DIR = "C:/Users/Vitor Daltro/Documents/nxtgen/public/screenshots";
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runE2E() {
  console.log("🚀 Starting Playwright E2E Test Suite for NXT PASS...");

  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro Mobile Viewport
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  const page = await context.newPage();

  try {
    // 1. Visit Home
    console.log("Step 1: Navigating to NXT PASS Homepage (http://localhost:3000)...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "01_home_mobile.png") });
    console.log("📸 Screenshot captured: 01_home_mobile.png");

    // 2. Test Category Filtering
    console.log("Step 2: Filtering by category 'Moda & Sneaker'...");
    await page.click("text=Moda & Sneaker");
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "02_category_filtered.png") });
    console.log("📸 Screenshot captured: 02_category_filtered.png");

    // 3. Reset to all and search for Burger
    console.log("Step 3: Resetting to all and searching for 'Burger'...");
    await page.click("text=Todos");
    await page.fill("input[placeholder*='Buscar benefícios']", "Burger");
    await page.waitForTimeout(600);

    // 4. Click 'USAR BENEFÍCIO'
    console.log("Step 4: Clicking 'USAR BENEFÍCIO' on CYBER BURGER LAB...");
    const redeemBtn = page.locator("button:has-text('USAR BENEFÍCIO')").first();
    await redeemBtn.click();

    // 5. Wait for QR Modal & Dynamic Token
    console.log("Step 5: Awaiting dynamic QR Code modal and cryptographic token...");
    await page.waitForSelector("text=NXT PASS • VALE BENEFÍCIO", { timeout: 8000 });
    await page.waitForSelector("img[alt='QR Code Dinâmico']", { timeout: 8000 });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "03_dynamic_qr_modal.png") });
    console.log("📸 Screenshot captured: 03_dynamic_qr_modal.png");

    // Get the generated voucher code from modal
    const codeElement = page.locator("text=/NXT-[A-Z0-9]+-[A-Z0-9]+/").first();
    const voucherCode = await codeElement.textContent();
    console.log(`🎟️ Generated Anti-Tamper Voucher Code: ${voucherCode}`);

    // Close Modal
    await page.click("button:has(svg.lucide-x)");
    await page.waitForTimeout(500);

    // 6. Navigate to 'Meus Cupons'
    console.log("Step 6: Navigating to 'Meus Cupons'...");
    await page.click("nav >> text=Meus Cupons");
    await page.waitForURL("**/meus-cupons", { timeout: 5000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "04_meus_cupons.png") });
    console.log("📸 Screenshot captured: 04_meus_cupons.png");

    // 7. Navigate to 'Validador'
    console.log("Step 7: Navigating to 'Validador' (Partner QR Scanner Screen)...");
    await page.click("nav >> text=Validador");
    await page.waitForURL("**/validador", { timeout: 5000 });
    await page.waitForTimeout(600);

    // Enter the voucher code in the validator form
    console.log(`Step 8: Submitting voucher code ${voucherCode} for partner validation...`);
    await page.fill("textarea", voucherCode || "NXT-TEST-1234");
    await page.click("button:has-text('VALIDAR E CONSUMIR BENEFÍCIO')");

    await page.waitForSelector("text=Benefício Validado com Sucesso!", { timeout: 8000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "05_validador_success.png") });
    console.log("📸 Screenshot captured: 05_validador_success.png");

    // 9. Replay Attack Test: Try validating the SAME voucher again
    console.log("Step 9: Testing anti-replay defense (validating the same voucher a second time)...");
    await page.fill("textarea", voucherCode || "NXT-TEST-1234");
    await page.click("button:has-text('VALIDAR E CONSUMIR BENEFÍCIO')");

    await page.waitForSelector("text=Validação Recusada", { timeout: 8000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "06_validador_replay_prevented.png") });
    console.log("📸 Screenshot captured: 06_validador_replay_prevented.png");

    // 10. Navigate to 'Perfil'
    console.log("Step 10: Navigating to 'Perfil'...");
    await page.click("nav >> text=Perfil");
    await page.waitForURL("**/perfil", { timeout: 5000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "07_perfil.png") });
    console.log("📸 Screenshot captured: 07_perfil.png");

    console.log("\n🎉 ALL E2E & VISUAL TESTS PASSED WITH 100% SUCCESS!");
  } catch (error) {
    console.error("❌ E2E Test Error:", error);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "error_debug.png") });
    throw error;
  } finally {
    await browser.close();
  }
}

runE2E();
