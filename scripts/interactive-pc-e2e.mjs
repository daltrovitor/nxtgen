import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SCREENSHOTS_DIR = "C:/Users/Vitor Daltro/Documents/nxtgen/public/screenshots";
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runInteractiveTest() {
  console.log("=================================================================");
  console.log("🖥️  INICIANDO TESTES INTERATIVOS VISUAIS E FUNCIONAIS COM PLAYWRIGHT");
  console.log("=================================================================\n");

  // We launch Chrome. If display is available, headless: false can run, or fallback to headless: true
  // Let's try headless: false first, if error, fallback to headless: true
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,900"],
    });
  } catch (err) {
    console.log("Nota: Display headless fallback ativado:", err.message);
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  const context = await browser.newContext({
    viewport: { width: 1280, height: 860 },
  });

  const page = await context.newPage();

  try {
    // -------------------------------------------------------------
    // ETAPA 1: Landing Page Desktop (Sem clichês de IA, Tipografia Editorial)
    // -------------------------------------------------------------
    console.log("Etapa 1: Carregando Landing Page (http://localhost:3000)...");
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "01_landing_desktop.png") });
    console.log("📸 Screenshot capturado: 01_landing_desktop.png");

    // -------------------------------------------------------------
    // ETAPA 2: Landing Page Mobile Viewport
    // -------------------------------------------------------------
    console.log("Etapa 2: Validando Landing Page em Viewport Mobile (iPhone 14)...");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "02_landing_mobile.png") });
    console.log("📸 Screenshot capturado: 02_landing_mobile.png");

    // Reset to desktop/tablet for detailed testing
    await page.setViewportSize({ width: 420, height: 880 });

    // -------------------------------------------------------------
    // ETAPA 3: Cadastro Real de Usuário (Zero Confirmação de E-mail)
    // -------------------------------------------------------------
    console.log("Etapa 3: Navegando para Criação de Conta (/signup)...");
    await page.goto("http://localhost:3000/signup", { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const testUserEmail = `vitor.teste.${Date.now()}@nxtgen.app`;
    console.log(`Preenchendo cadastro: Vitor Daltro | ${testUserEmail} ...`);
    await page.fill("input[placeholder*='Ex: Vitor Daltro']", "Vitor Daltro");
    await page.fill("input[placeholder*='seu.email@exemplo.com']", testUserEmail);
    await page.fill("input[placeholder*='Mínimo 6 caracteres']", "SenhaForte2026!");

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "03_signup_form.png") });
    console.log("📸 Screenshot capturado: 03_signup_form.png");

    console.log("Submetendo formulário com auto-ativação imediata...");
    await page.click("button:has-text('Ativar Conta & Acessar')");

    // Wait for redirect to /pass
    await page.waitForURL("**/pass", { timeout: 8000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "04_pass_logged_in.png") });
    console.log("📸 Screenshot capturado: 04_pass_logged_in.png (Autenticado como Vitor Daltro!)");

    // -------------------------------------------------------------
    // ETAPA 4: Filtragem e Resgate de Benefício no NXT PASS
    // -------------------------------------------------------------
    console.log("Etapa 4: Filtrando por 'Tecnologia' e resgatando benefício...");
    await page.click("button:has-text('Tecnologia')");
    await page.waitForTimeout(600);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "05_pass_category_tech.png") });
    console.log("📸 Screenshot capturado: 05_pass_category_tech.png");

    console.log("Clicando em 'Resgatar Benefício' em NEXUS HARDWARE...");
    const redeemBtn = page.locator("button:has-text('Resgatar Benefício')").first();
    await redeemBtn.click();

    // Wait for dynamic QR code modal
    await page.waitForSelector("img[alt='QR Code Dinâmico']", { timeout: 8000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "06_qr_modal_real_user.png") });
    console.log("📸 Screenshot capturado: 06_qr_modal_real_user.png");

    const codeElement = page.locator("text=/NXT-[A-Z0-9]+-[A-Z0-9]+/").first();
    const voucherCode = await codeElement.textContent();
    console.log(`🎟️ Voucher Criptográfico Gerado: ${voucherCode}`);

    // Fechar modal
    await page.click("button:has(svg.lucide-x)");
    await page.waitForTimeout(500);

    // -------------------------------------------------------------
    // ETAPA 5: Meus Cupons do Usuário Logado
    // -------------------------------------------------------------
    console.log("Etapa 5: Acessando 'Meus Cupons'...");
    await page.click("nav >> text=Meus Cupons");
    await page.waitForURL("**/meus-cupons", { timeout: 5000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "07_meus_cupons_active.png") });
    console.log("📸 Screenshot capturado: 07_meus_cupons_active.png");

    // -------------------------------------------------------------
    // ETAPA 6: Validação de Benefício pelo Parceiro (/validador)
    // -------------------------------------------------------------
    console.log("Etapa 6: Validando voucher no painel do parceiro (/validador)...");
    await page.click("nav >> text=Validador");
    await page.waitForURL("**/validador", { timeout: 5000 });
    await page.waitForTimeout(600);

    // Selecionar o parceiro Nexus Tech
    await page.selectOption("select", { label: "NEXUS HARDWARE & WORKSPACE (Tecnologia)" });
    await page.fill("textarea", voucherCode || "NXT-TEST");
    await page.click("button:has-text('VALIDAR E CONSUMIR BENEFÍCIO')");

    await page.waitForSelector("text=Benefício Validado com Sucesso!", { timeout: 8000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "08_validador_success_real.png") });
    console.log("📸 Screenshot capturado: 08_validador_success_real.png");

    // -------------------------------------------------------------
    // ETAPA 7: Teste de Ataque de Reutilização (Replay Attack)
    // -------------------------------------------------------------
    console.log("Etapa 7: Testando bloqueio de ataque de reutilização (Replay)...");
    await page.fill("textarea", voucherCode || "NXT-TEST");
    await page.click("button:has-text('VALIDAR E CONSUMIR BENEFÍCIO')");

    await page.waitForSelector("text=Validação Recusada", { timeout: 8000 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "09_validador_replay_prevented.png") });
    console.log("📸 Screenshot capturado: 09_validador_replay_prevented.png (Ataque de Reutilização Bloqueado!)");

    // -------------------------------------------------------------
    // ETAPA 8: Logout e Login com Usuário Demo (Rafael Molina)
    // -------------------------------------------------------------
    console.log("Etapa 8: Testando Logout e Login com Usuário Demo...");
    await page.goto("http://localhost:3000/pass");
    await page.waitForTimeout(500);
    await page.click("button[title='Encerrar Sessão']");
    await page.waitForURL("**/login", { timeout: 5000 });
    await page.waitForTimeout(600);

    console.log("Clicando em 'Preencher com Conta Demo'...");
    await page.click("button:has-text('Preencher com Conta Demo')");
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "10_login_demo_filled.png") });
    console.log("📸 Screenshot capturado: 10_login_demo_filled.png");

    await page.click("button:has-text('Acessar NXT PASS')");
    await page.waitForURL("**/pass", { timeout: 8000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "11_login_demo_success.png") });
    console.log("📸 Screenshot capturado: 11_login_demo_success.png (Rafael Molina 8.420 PTS autenticado!)");

    console.log("\n=================================================================");
    console.log("🏆 TODOS OS TESTES E2E, VISUAIS E DE SEGURANÇA FORAM CONCLUÍDOS COM ÊXITO!");
    console.log("=================================================================\n");
  } catch (error) {
    console.error("❌ Erro durante o teste E2E:", error);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, "error_debug.png") });
    throw error;
  } finally {
    await browser.close();
  }
}

runInteractiveTest();
