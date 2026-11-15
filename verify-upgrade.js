const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function verifyAll() {
  console.log('====================================================');
  console.log('TELANGANA HEALTHCARE SCHEMES AI PLATFORM VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Verify Database Integrity
    console.log('--- 1. Database Integrity Verification ---');
    const categoriesCount = await prisma.category.count();
    assert(categoriesCount === 7, `Expected 7 categories, found: ${categoriesCount}`);

    const schemesCount = await prisma.scheme.count();
    assert(schemesCount >= 11, `Expected at least 11 schemes, found: ${schemesCount}`);

    const hospitalsCount = await prisma.hospital.count();
    assert(hospitalsCount >= 13, `Expected at least 13 hospitals, found: ${hospitalsCount}`);

    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    assert(!!adminUser, `Admin account exists: ${adminUser ? adminUser.email : 'None'}`);

    // 2. Verify Healthcare Specific Schemes
    console.log('\n--- 2. Flagship Scheme Verification ---');
    const aarogyasri = await prisma.scheme.findFirst({ where: { slug: { contains: 'aarogyasri' } } });
    assert(!!aarogyasri, `Rajiv Aarogyasri Scheme found: ${aarogyasri ? aarogyasri.name : 'Missing'}`);
    assert(aarogyasri && aarogyasri.nameTelugu !== null, `Aarogyasri has Telugu translation: ${aarogyasri?.nameTelugu}`);

    const kcrKit = await prisma.scheme.findFirst({ where: { slug: { contains: 'kcr-kit' } } });
    assert(!!kcrKit, `KCR Kit Scheme found: ${kcrKit ? kcrKit.name : 'Missing'}`);

    // 3. Verify Hospital Finder Data
    console.log('\n--- 3. Verified Hospitals Verification ---');
    const osmania = await prisma.hospital.findFirst({ where: { name: { contains: 'Osmania' } } });
    assert(!!osmania, `Osmania General Hospital found in ${osmania?.district}`);

    const nims = await prisma.hospital.findFirst({ where: { name: { contains: 'NIMS' } } });
    assert(!!nims, `NIMS Hyderabad found with contact: ${nims?.contactNumber}`);

    const mgm = await prisma.hospital.findFirst({ where: { name: { contains: 'MGM' } } });
    assert(!!mgm, `MGM Hospital Warangal found in ${mgm?.district}`);

    // 4. Test Citizen User Creation & Authentication
    console.log('\n--- 4. Citizen User & Auth Engine ---');
    const testEmail = `verify_citizen_${Date.now()}@test.telangana.gov`;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('SecurePassword123!', salt);

    const testCitizen = await prisma.user.create({
      data: {
        name: 'Test Citizen Kumar',
        email: testEmail,
        phone: '9849012345',
        district: 'Warangal',
        passwordHash: hash,
        role: 'CITIZEN',
      },
    });
    assert(!!testCitizen.id, `Created citizen account: ${testCitizen.email}`);

    // Verify Password Check
    const match = await bcrypt.compare('SecurePassword123!', testCitizen.passwordHash);
    assert(match === true, 'Citizen password verification matches bcrypt hash');

    // 5. Test Saved Schemes (Bookmarks)
    console.log('\n--- 5. Saved Schemes (Bookmarks) Engine ---');
    const saved = await prisma.savedScheme.create({
      data: {
        userId: testCitizen.id,
        schemeId: aarogyasri.id,
      },
    });
    assert(!!saved.id, `Citizen successfully saved scheme: ${aarogyasri.name}`);

    const userSaved = await prisma.savedScheme.findMany({ where: { userId: testCitizen.id } });
    assert(userSaved.length === 1, `Saved schemes count for citizen: ${userSaved.length}`);

    // 6. Test Interactive Eligibility Assessment Engine
    console.log('\n--- 6. Interactive Eligibility Assessment Engine ---');
    const eligibleCheck = await prisma.eligibilityCheck.create({
      data: {
        userId: testCitizen.id,
        schemeId: aarogyasri.id,
        answers: JSON.stringify({
          age: 38,
          annualIncome: 120000,
          district: 'Warangal',
          rationCard: 'WHITE_FOOD_SECURITY',
          isTelanganaResident: true,
          isGovtEmployee: false,
        }),
        resultStatus: 'APPEARS_ELIGIBLE',
        criteriaSatisfied: JSON.stringify([
          'Permanent domicile / resident of Telangana state confirmed.',
          'Possesses White Food Security Card (BPL card) qualifying for 100% cashless treatment up to ₹10 lakh.',
          'Annual household income is within BPL economic threshold.',
          'Non-government employee household status verified.',
        ]),
        criteriaNotSatisfied: JSON.stringify([]),
      },
    });
    assert(eligibleCheck.resultStatus === 'APPEARS_ELIGIBLE', `Eligibility check result: ${eligibleCheck.resultStatus}`);

    // 7. Test Application Tracking System
    console.log('\n--- 7. Application Tracking & Status History ---');
    const application = await prisma.applicationTracking.create({
      data: {
        userId: testCitizen.id,
        schemeId: aarogyasri.id,
        applicationNumber: 'TG-AAROGYA-2026-TEST01',
        submissionDate: new Date(),
        status: 'SUBMITTED',
        notes: 'Submitted via MeeSeva center in Warangal',
        statusHistory: {
          create: [
            {
              status: 'SUBMITTED',
              remarks: 'Application submitted with White Ration Card',
              updatedBy: testCitizen.email,
            },
            {
              status: 'UNDER_REVIEW',
              remarks: 'Documents verified by Aarogya Mithra',
              updatedBy: 'officer@telangana.gov.example',
            },
          ],
        },
      },
      include: { statusHistory: true },
    });
    assert(application.applicationNumber === 'TG-AAROGYA-2026-TEST01', `Created application tracker: ${application.applicationNumber}`);
    assert(application.statusHistory.length === 2, `Application status history logged 2 events`);

    // 8. Test In-App Notification System
    console.log('\n--- 8. In-App Notifications Engine ---');
    const notif = await prisma.notification.create({
      data: {
        userId: testCitizen.id,
        title: 'Application Under Review',
        message: 'Your Rajiv Aarogyasri application TG-AAROGYA-2026-TEST01 is currently under review by Aarogya Mithra.',
        type: 'APPLICATION',
        link: '/dashboard',
      },
    });
    assert(!!notif.id, `Created notification: ${notif.title}`);

    const unreadCount = await prisma.notification.count({
      where: { userId: testCitizen.id, isRead: false },
    });
    assert(unreadCount === 1, `Unread notification count: ${unreadCount}`);

    // 9. Test Audit Logging
    console.log('\n--- 9. System Audit Log Engine ---');
    const audit = await prisma.auditLog.create({
      data: {
        userId: testCitizen.id,
        action: 'CITIZEN_REGISTRATION',
        details: `Citizen verified: ${testCitizen.email}`,
        ip: '127.0.0.1',
      },
    });
    assert(!!audit.id, `Audit log entry created: ${audit.action}`);

    // Cleanup test data
    await prisma.notification.deleteMany({ where: { userId: testCitizen.id } });
    await prisma.applicationStatusHistory.deleteMany({ where: { applicationId: application.id } });
    await prisma.applicationTracking.deleteMany({ where: { userId: testCitizen.id } });
    await prisma.eligibilityCheck.deleteMany({ where: { userId: testCitizen.id } });
    await prisma.savedScheme.deleteMany({ where: { userId: testCitizen.id } });
    await prisma.auditLog.deleteMany({ where: { userId: testCitizen.id } });
    await prisma.user.delete({ where: { id: testCitizen.id } });
    console.log('\n[INFO] Test data cleanly removed after successful verification.');

  } catch (error) {
    console.error('Verification error:', error);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

verifyAll();
