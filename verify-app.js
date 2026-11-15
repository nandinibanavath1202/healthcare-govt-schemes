const fs = require('fs');
const ts = require('typescript');

// Enable loading TypeScript modules directly in this verification script
require.extensions['.ts'] = function (module, filename) {
  const content = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(content, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  }).outputText;
  module._compile(compiled, filename);
};

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting Verification Suite for TG Schemes Portal');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
      failed++;
    }
  }

  // 1. Database Seed Verification
  console.log('--- 1. Database Content Verification ---');
  const catCount = await prisma.category.count();
  assert(catCount >= 7, `Categories count in DB: ${catCount} (>= 7 required)`);

  const schemeCount = await prisma.scheme.count({ where: { isPublished: true } });
  assert(schemeCount >= 10, `Published schemes count in DB: ${schemeCount} (>= 10 required)`);

  // Verify flagship schemes exist
  const mahalakshmi = await prisma.scheme.findUnique({
    where: { slug: 'mahalakshmi-scheme' },
    include: { category: true },
  });
  assert(mahalakshmi !== null, 'Mahalakshmi Scheme exists in database');
  assert(mahalakshmi?.category?.slug === 'women-empowerment', 'Mahalakshmi is categorized under women-empowerment');
  assert(mahalakshmi?.officialUrl.startsWith('https://'), 'Mahalakshmi has verified HTTPS official URL');

  const rythu = await prisma.scheme.findUnique({ where: { slug: 'rythu-bharosa' } });
  assert(rythu !== null, 'Rythu Bharosa Scheme exists in database');

  const gruha = await prisma.scheme.findUnique({ where: { slug: 'gruha-jyothi' } });
  assert(gruha !== null, 'Gruha Jyothi electricity scheme exists in database');

  const aarogyasri = await prisma.scheme.findUnique({ where: { slug: 'rajiv-aarogyasri' } });
  assert(aarogyasri !== null, 'Rajiv Aarogyasri health scheme exists in database');

  // 2. Retrieval Engine & Intent Matching
  console.log('\n--- 2. Natural Language Retrieval Verification ---');
  const { retrieveRelevantSchemes, formatGroundedAnswer, formatFallbackAnswer } = require('../src/lib/retrieval.ts');

  // Query A: Women free bus
  const queryA = 'How do I get free bus travel under Mahalakshmi?';
  const resA = await retrieveRelevantSchemes(queryA, 3);
  assert(resA.schemes.length > 0, `Query "${queryA}" retrieved matches`);
  assert(resA.schemes[0].slug === 'mahalakshmi-scheme', 'Top matched scheme is Mahalakshmi Scheme');
  assert(resA.analysis.intent === 'apply', 'Intent detected as "apply"');

  const formattedA = formatGroundedAnswer(resA.schemes[0], resA.analysis.intent);
  assert(formattedA.includes('What it is:'), 'Formatted answer contains "What it is" section');
  assert(formattedA.includes('Who may qualify:'), 'Formatted answer contains "Who may qualify" section');
  assert(formattedA.includes('You may be eligible'), 'Formatted answer uses responsible "may be eligible" phrasing');
  assert(formattedA.includes('Official Departmental Source:'), 'Formatted answer includes official department source link');

  // Query B: Farmer investment support
  const queryB = 'How much investment aid do farmers get per acre?';
  const resB = await retrieveRelevantSchemes(queryB, 3);
  assert(resB.schemes[0].slug === 'rythu-bharosa', 'Farmer financial aid matches Rythu Bharosa');
  assert(resB.analysis.intent === 'benefits', 'Intent detected as "benefits"');

  // Query C: Electricity documents
  const queryC = 'What papers do I need for 200 units free power in Gruha Jyothi?';
  const resC = await retrieveRelevantSchemes(queryC, 3);
  assert(resC.schemes[0].slug === 'gruha-jyothi', 'Electricity documents matches Gruha Jyothi');
  assert(resC.analysis.intent === 'documents', 'Intent detected as "documents"');

  // Query D: Fallback for unsupported query
  const queryD = 'How to buy cryptocurrency and trade stocks?';
  const resD = await retrieveRelevantSchemes(queryD, 3);
  const fallbackText = formatFallbackAnswer(queryD, ['Agriculture', 'Healthcare', 'Pensions']);
  assert(fallbackText.includes('could not locate an officially verified'), 'Fallback answer honest about missing data');
  assert(fallbackText.includes('telangana.gov.in'), 'Fallback directs user to official Telangana state portal');

  // 3. Privacy & Sensitive Data Detection
  console.log('\n--- 3. Privacy & Sensitive Data Safeguard Verification ---');
  const { checkSensitiveInfo, checkRateLimit } = require('../src/lib/rateLimit.ts');

  const privacyTest1 = checkSensitiveInfo('My Aadhaar is 1234 5678 9012, am I eligible?');
  assert(privacyTest1.hasSensitiveInfo === true, 'Aadhaar 12-digit number detected as sensitive');
  assert(privacyTest1.warningMessage?.includes('do NOT share your 12-digit Aadhaar'), 'Clear privacy warning provided');

  const privacyTest2 = checkSensitiveInfo('My card number is 4111-2222-3333-4444');
  assert(privacyTest2.hasSensitiveInfo === true, 'Credit/Debit card number detected as sensitive');

  const privacyTest3 = checkSensitiveInfo('Is income certificate required for Kalyana Lakshmi?');
  assert(privacyTest3.hasSensitiveInfo === false, 'Legitimate scheme inquiry permitted without warning');

  // Rate Limiting
  const rateLimitTest = checkRateLimit('test-ip-verify', 3, 10000);
  assert(rateLimitTest.allowed === true, 'Initial request allowed by rate limiter');
  checkRateLimit('test-ip-verify', 3, 10000);
  checkRateLimit('test-ip-verify', 3, 10000);
  const rateLimitExceeded = checkRateLimit('test-ip-verify', 3, 10000);
  assert(rateLimitExceeded.allowed === false, 'Rate limiter correctly blocks requests beyond threshold');

  // 4. Admin Authentication & Role Verification
  console.log('\n--- 4. Administrator Authentication Verification ---');
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@telangana.gov.example' },
  });
  assert(adminUser !== null, 'Admin user found in database');
  assert(adminUser?.role === 'ADMIN', 'Admin user has role ADMIN');

  const validPassword = await bcrypt.compare('AdminSecure2026!', adminUser.passwordHash);
  assert(validPassword === true, 'Valid password successfully authenticates with bcrypt');

  const wrongPassword = await bcrypt.compare('WrongPassword999', adminUser.passwordHash);
  assert(wrongPassword === false, 'Invalid password rejected');

  console.log('\n====================================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error('Test suite failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
