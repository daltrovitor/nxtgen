import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function runMobilePwaTest() {
  console.log('\n===============================================================');
  console.log('📱 INICIANDO TESTE END-TO-END MOBILE PWA COM CHROME NATIVO');
  console.log('===============================================================\n');

  const screenshotsDir = path.resolve('public', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Inicializar Google Chrome nativo emulando iPhone 14
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  });

  const page = await context.newPage();

  try {
    // 1. Acessar a página do NXT PASS no celular
    console.log('1. Acessando http://localhost:3000/pass (Modo Mobile PWA)...');
    await page.goto('http://localhost:3000/pass', { waitUntil: 'networkidle', timeout: 30000 });

    // 2. Validar elementos visuais do app
    console.log('2. Verificando cabeçalho, saldo e navegação...');
    await page.waitForSelector('text=NXTGEN');
    await page.waitForSelector('text=Categorias');
    console.log('   ✅ Elementos de interface mobile carregados!');

    // Screenshot da Home do NXT PASS
    const passHomeScreenshot = path.join(screenshotsDir, '01-nxt-pass-home.png');
    await page.screenshot({ path: passHomeScreenshot, fullPage: false });
    console.log(`   📸 Captura de tela salva: ${passHomeScreenshot}`);

    // 3. Testar filtro de categorias
    console.log('3. Testando filtro de categorias (Gastronomia)...');
    await page.click('button:has-text("Gastronomia")');
    await page.waitForTimeout(500);
    await page.waitForSelector('text=CYBER BURGER LAB');
    console.log('   ✅ Categoria Gastronomia filtrada com sucesso!');

    // 4. Testar busca em tempo real (resetando para Todos primeiro)
    console.log('4. Testando campo de busca ("Sneakers")...');
    await page.click('button:has-text("TODOS")');
    await page.waitForTimeout(300);
    const searchInput = page.locator('input[placeholder*="Buscar benefícios"]');
    await searchInput.fill('Sneakers');
    await page.waitForTimeout(500);
    await page.waitForSelector('text=HYPEMAKER');
    console.log('   ✅ Busca dinâmica retornou o parceiro de sneakers corretamente!');

    // Limpar busca
    await searchInput.fill('');
    await page.waitForTimeout(300);

    // 5. Abrir Modal de Resgate de Cupom
    console.log('5. Clicando no botão "Resgatar Benefício"...');
    const claimButton = page.locator('button:has-text("Resgatar Benefício")').first();
    await claimButton.click();

    // 6. Validar que o QR Code dinâmico apareceu
    console.log('6. Aguardando geração do QR Code dinâmico com HMAC-SHA256...');
    await page.waitForSelector('img[alt="QR Code Dinâmico"]', { timeout: 15000 });
    console.log('   ✅ QR Code dinâmico criptografado gerado e exibido na tela do celular!');

    // Screenshot do QR Code
    const qrScreenshot = path.join(screenshotsDir, '02-nxt-pass-qr-voucher.png');
    await page.screenshot({ path: qrScreenshot, fullPage: false });
    console.log(`   📸 Captura de tela do voucher salva: ${qrScreenshot}`);

    // Fechar modal
    await page.click('button:has(svg.lucide-x)');
    await page.waitForTimeout(400);

    // 7. Testar rota prioritária 2: NXT BANK
    console.log('7. Navegando para PRIORIDADE 2: NXT BANK (/bank)...');
    await page.goto('http://localhost:3000/bank', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=NXT BANK');
    await page.waitForSelector('text=R$ 1.250');
    const bankScreenshot = path.join(screenshotsDir, '03-nxt-bank-mobile.png');
    await page.screenshot({ path: bankScreenshot, fullPage: false });
    console.log(`   📸 Captura de tela do NXT BANK salva: ${bankScreenshot}`);

    // 8. Testar rota prioritária 3: NXT LIVE
    console.log('8. Navegando para PRIORIDADE 3: NXT LIVE (/live)...');
    await page.goto('http://localhost:3000/live', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=NXT LIVE');
    const liveScreenshot = path.join(screenshotsDir, '04-nxt-live-mobile.png');
    await page.screenshot({ path: liveScreenshot, fullPage: false });
    console.log(`   📸 Captura de tela do NXT LIVE salva: ${liveScreenshot}`);

    // 9. Testar rota prioritária 4: NXT INVEST
    console.log('9. Navegando para PRIORIDADE 4: NXT INVEST (/invest)...');
    await page.goto('http://localhost:3000/invest', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=NXT INVEST');
    const investScreenshot = path.join(screenshotsDir, '05-nxt-invest-mobile.png');
    await page.screenshot({ path: investScreenshot, fullPage: false });
    console.log(`   📸 Captura de tela do NXT INVEST salva: ${investScreenshot}`);

    // 10. Testar rota prioritária 5: NXT ME
    console.log('10. Navegando para PRIORIDADE 5: NXT ME (/me)...');
    await page.goto('http://localhost:3000/me', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=NXT ME');
    const meScreenshot = path.join(screenshotsDir, '06-nxt-me-mobile.png');
    await page.screenshot({ path: meScreenshot, fullPage: false });
    console.log(`   📸 Captura de tela do NXT ME salva: ${meScreenshot}`);

    // 11. Testar Portal do Validador de Balcão (/validador)
    console.log('11. Navegando para Portal do Validador do Parceiro (/validador)...');
    await page.goto('http://localhost:3000/validador', { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Validador');
    const validatorScreenshot = path.join(screenshotsDir, '07-nxt-validator-mobile.png');
    await page.screenshot({ path: validatorScreenshot, fullPage: false });
    console.log(`   📸 Captura de tela do Validador salva: ${validatorScreenshot}`);

    console.log('\n===============================================================');
    console.log('🎉 TODOS OS TESTES MOBILE END-TO-END PASSARAM COM 100% DE SUCESSO!');
    console.log('===============================================================\n');
  } catch (error) {
    console.error('❌ Erro durante teste do Playwright:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runMobilePwaTest();
