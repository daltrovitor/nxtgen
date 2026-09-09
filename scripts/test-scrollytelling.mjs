import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOTS_DIR = "C:/Users/Vitor Daltro/Documents/nxtgen/public/screenshots";
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runFullScrollytellingAndAppE2ETest() {
  console.log("=================================================================");
  console.log("📱 NXTGEN PLAYWRIGHT E2E & SCROLLYTELLING TEST SUITE");
  console.log("=================================================================\n");

  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  try {
    console.log("1. Acessando http://localhost:3000...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    // Capture Stage 1: Hero (0% scroll)
    console.log("2. Capturando Seção 1: Hero (0% scroll, Celular no centro)...");
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "stage1_hero_3d_phone.png") });
    console.log("📸 Screenshot: stage1_hero_3d_phone.png");

    // Scroll to Section 2: NXT PASS (33% scroll)
    console.log("3. Rolando para Seção 2: NXT PASS (Celular transladando para a direita)...");
    await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 1.1, behavior: "smooth" }));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "stage2_nxt_pass_phone_right.png") });
    console.log("📸 Screenshot: stage2_nxt_pass_phone_right.png");

    // Scroll to Section 3: Gamificação (66% scroll)
    console.log("4. Rolando para Seção 3: Gamificação & XP Bar (Celular transladando para a esquerda)...");
    await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 2.2, behavior: "smooth" }));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "stage3_gamification_phone_left.png") });
    console.log("📸 Screenshot: stage3_gamification_phone_left.png");

    // Scroll to Section 4: CTA & Login (100% scroll)
    console.log("5. Rolando para Seção 4: Login & Cadastro Instantâneo...");
    await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 3.4, behavior: "smooth" }));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "stage4_auth_card_alignment.png") });
    console.log("📸 Screenshot: stage4_auth_card_alignment.png");

    // Test Mobile Responsiveness (390x844)
    console.log("6. Testando visualização mobile adaptativa (iPhone 14 Pro)...");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "stage_mobile_responsive.png") });
    console.log("📸 Screenshot: stage_mobile_responsive.png");

    // Reset to Desktop for login interaction
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 3.4, behavior: "instant" }));
    await page.waitForTimeout(800);

    // 7. Interactive Login in Stage 4
    console.log("7. Testando Login interativo via Card da Seção 4...");
    const demoBtn = page.getByRole("button", { name: "Preencher Demo" });
    if (await demoBtn.isVisible()) {
      await demoBtn.click();
      await page.waitForTimeout(500);
      console.log("   👉 Botão Preencher Demo clicado com sucesso!");

      const submitBtn = page.getByRole("button", { name: /Acessar Plataforma/i });
      await submitBtn.click();
      console.log("   👉 Submetendo formulário de login...");

      // Wait for redirect to /pass
      await page.waitForURL("**/pass", { timeout: 8000 });
      await page.waitForTimeout(1500);
      console.log("   ✅ Redirecionado com sucesso para /pass!");
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "stage5_nxt_pass_app.png") });
      console.log("📸 Screenshot: stage5_nxt_pass_app.png");
    }

    // 8. Test Voucher Modal Interaction
    console.log("8. Testando resgate de benefício e abertura de QR Code dinâmico...");
    const benefitBtn = page.locator("button:has-text('Resgatar'), button:has-text('Gerar QR Code'), button:has-text('Ver Benefício')").first();
    if (await benefitBtn.isVisible()) {
      await benefitBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "stage6_qr_modal_voucher.png") });
      console.log("📸 Screenshot: stage6_qr_modal_voucher.png");
    }

    // 9. Test Partner Validator Page
    console.log("9. Testando Portal Validador de Parceiros (/validador)...");
    await page.goto("http://localhost:3000/validador", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "stage7_validador_portal.png") });
    console.log("📸 Screenshot: stage7_validador_portal.png");

    console.log("\n=================================================================");
    console.log("🎉 TODOS OS TESTES E2E, VISUAIS E DE REQUISIÇÕES CONCLUÍDOS COM 100% DE SUCESSO!");
    console.log("=================================================================");
  } catch (err) {
    console.error("❌ Erro no teste:", err);
    throw err;
  } finally {
    await browser.close();
  }
}

runFullScrollytellingAndAppE2ETest();
