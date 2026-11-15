const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Telangana Schemes Portal database...');

  // 1. Create Default Categories
  const categoriesData = [
    {
      name: 'Women Empowerment',
      slug: 'women-empowerment',
      description: 'Financial independence, safety, maternal healthcare, and welfare initiatives for women and girls in Telangana.',
      icon: 'HeartHandshake',
      displayOrder: 1,
    },
    {
      name: 'Healthcare',
      slug: 'healthcare',
      description: 'Cashless medical treatment, maternal kits, diagnostic support, and tertiary healthcare coverage.',
      icon: 'Activity',
      displayOrder: 2,
    },
    {
      name: 'Electricity',
      slug: 'electricity',
      description: 'Domestic free electricity, subsidized power for agriculture, and energy welfare schemes.',
      icon: 'Zap',
      displayOrder: 3,
    },
    {
      name: 'Education',
      slug: 'education',
      description: 'Scholarships, overseas study grants, free residential schooling, and youth skill empowerment.',
      icon: 'GraduationCap',
      displayOrder: 4,
    },
    {
      name: 'Agriculture',
      slug: 'agriculture',
      description: 'Direct investment support, farm loan waivers, crop insurance, and assistance for tenant farmers and laborers.',
      icon: 'Sprout',
      displayOrder: 5,
    },
    {
      name: 'Pensions',
      slug: 'pensions',
      description: 'Monthly social security pensions for senior citizens, widows, disabled persons, and traditional occupational artisans.',
      icon: 'ShieldAlert',
      displayOrder: 6,
    },
    {
      name: 'Social Welfare',
      slug: 'social-welfare',
      description: 'Affordable housing, marriage assistance, empowerment programs for SC/ST/BC/Minorities and vulnerable sections.',
      icon: 'Users',
      displayOrder: 7,
    },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categoryMap[cat.slug] = createdCat.id;
  }
  console.log('Created/Updated', Object.keys(categoryMap).length, 'categories.');

  // 2. Verified Telangana Government Schemes
  const schemesData = [
    {
      name: 'Mahalakshmi Scheme',
      nameTelugu: 'మహాలక్ష్మి పథకం',
      slug: 'mahalakshmi-scheme',
      categoryId: categoryMap['women-empowerment'],
      summary: 'Tri-fold welfare initiative providing 100% free bus travel across Telangana in TSRTC buses, ₹2,500 monthly financial aid, and domestic LPG gas cylinders at ₹500.',
      purpose: 'To empower women financially, reduce domestic expenditure burdens, and promote unhindered mobility for education, employment, and everyday transit throughout the state.',
      intendedGroups: JSON.stringify(['Women', 'Girls', 'Transgender Persons', 'Low-income Families']),
      eligibilityCriteria: JSON.stringify([
        'Must be a permanent resident woman or girl citizen of Telangana state.',
        'Free TSRTC bus travel: Applicable to all women, girls, and transgender persons of any age residing in Telangana without income ceiling.',
        '₹2,500/month financial aid: Woman must be designated as the head of the family on a valid Food Security Card (White Ration Card).',
        'Subsidized ₹500 LPG cylinder: Household must possess a valid domestic LPG connection registered in the woman applicant\'s name and hold an active White Ration Card.',
        'Exclusions: Income tax payers, current or retired government employees, and families owning more than prescribed agricultural/commercial assets are ineligible for monthly cash transfers.'
      ]),
      benefits: '1) 100% free bus travel in TSRTC Palle Velugu, Express, City Ordinary, and Metro Express buses within Telangana state borders. 2) Direct Cash Benefit Transfer of ₹2,500 per month into the bank account of eligible women heads of household. 3) Domestic LPG cylinder refilled at a subsidized flat price of ₹500 (balance subsidy credited by state government).',
      requiredDocuments: JSON.stringify([
        'Aadhaar Card with updated residential address in Telangana.',
        'Food Security Card (White Ration Card) or Praja Palana Application Acknowledgment.',
        'Active Bank Account Passbook (must be NPCI linked/seeded with Aadhaar for DBT).',
        'Domestic LPG Consumer Number & latest gas refill booklet/receipt (for cylinder subsidy).',
        'Passport-sized photograph of the woman applicant.'
      ]),
      applicationSteps: '1. For TSRTC Free Bus: No registration form needed. Simply present any government-issued photo identity proof (Aadhaar, Voter ID, Driving License) bearing Telangana domicile to the bus conductor to receive a Zero-Fare ticket.\n2. For ₹2,500/Month & ₹500 LPG Cylinder: Obtain the Praja Palana application form during Grama Sabha or Ward Sabha drives, or download it from prajapalana.telangana.gov.in.\n3. Fill in Section 1 (Mahalakshmi Scheme) with your Food Security Card number, gas consumer number, and bank account details.\n4. Submit the completed form along with photocopies of Aadhaar and Ration Card to the designated nodal officer or Meeseva centre.\n5. Retain the stamped acknowledgment slip containing your unique Application Reference Number for status tracking.',
      officialUrl: 'https://prajapalana.telangana.gov.in',
      sourceAuthority: 'Department of Women, Children, Disabled and Senior Citizens, Govt. of Telangana',
      lastVerifiedAt: new Date('2024-10-15'),
      reviewWarning: 'Cash transfer guidelines are being operationalized in phases following household data reconciliation through Praja Palana.',
      caveats: 'LPG connection must be registered in the name of the female applicant. Subsidized refills are capped per annual quota guidelines.',
      isPublished: true,
      isSampleOnly: false,
    },
    {
      name: 'Rythu Bharosa Crop Investment Support',
      nameTelugu: 'రైతు భరోసా పథకం',
      slug: 'rythu-bharosa',
      categoryId: categoryMap['agriculture'],
      summary: 'Direct crop investment and livelihood financial support providing ₹15,000 per acre annually for landowning and registered tenant farmers, plus ₹12,000 for landless agricultural laborers.',
      purpose: 'To alleviate input cost burdens on farmers before the sowing seasons (Kharif and Rabi), end debt traps, and extend financial dignity to tenant cultivators and landless farm workers.',
      intendedGroups: JSON.stringify(['Farmers', 'Tenant Cultivators', 'Agricultural Laborers', 'Rural Households']),
      eligibilityCriteria: JSON.stringify([
        'Pattadar farmers owning cultivable agricultural land in Telangana registered in Dharani portal / CCLA records.',
        'Tenant cultivators possessing verified tenancy agreements registered through local agriculture authorities.',
        'Landless farm laborers who registered under Praja Palana / Rural Employment guarantee records.',
        'Exclusions: Non-agricultural land, converted real estate venture layouts, hill slopes, institutional lands, and absentee landlords.'
      ]),
      benefits: '₹15,000 per acre per year disbursed in two equal installments: ₹7,500 per acre for Kharif sowing season and ₹7,500 per acre for Rabi season. Landless agricultural farm laborers receive an annual livelihood grant of ₹12,000.',
      requiredDocuments: JSON.stringify([
        'Pattadar Passbook / Dharani Title Deed or verified tenancy record.',
        'Aadhaar Card linked with mobile number.',
        'Active Bank Account mapped with NPCI / Aadhaar DBT.',
        'Food Security Card / Praja Palana Application Reference.'
      ]),
      applicationSteps: '1. Check that your land records and ownership titles are fully updated on Dharani (ccla.telangana.gov.in).\n2. Contact your local Agriculture Extension Officer (AEO) or Village Revenue Officer (VRO) to confirm biometric seeding.\n3. For tenant farmers and farm laborers: Submit registration details through Praja Palana Grama Sabhas or the Agriculture Department portal.\n4. Funds are transferred directly via RBI e-Kuber / PFMS into the beneficiary\'s bank account.',
      officialUrl: 'https://ccla.telangana.gov.in',
      sourceAuthority: 'Department of Agriculture & Co-operation, Govt. of Telangana',
      lastVerifiedAt: new Date('2024-11-01'),
      reviewWarning: 'Modalities for tenant farmer verification and upper acreage ceiling are subject to cabinet notifications.',
      caveats: 'Benefit is granted strictly on actively cultivated lands. Hill terrains, highway layouts, and venture lands are automatically pruned.',
      isPublished: true,
      isSampleOnly: false,
    },
    {
      name: 'Gruha Jyothi Scheme',
      nameTelugu: 'గృహ జ్యోతి పథకం',
      slug: 'gruha-jyothi',
      categoryId: categoryMap['electricity'],
      summary: 'Provides up to 200 units of free domestic electricity every month to low-income and working-class households in Telangana.',
      purpose: 'To relieve household energy expenses, promote energy conservation within 200-unit bands, and support economically weaker citizens.',
      intendedGroups: JSON.stringify(['Domestic Consumers', 'BPL Families', 'Low-income Households', 'Tenants']),
      eligibilityCriteria: JSON.stringify([
        'Must possess a domestic electricity service connection in Telangana (TGSPDCL or TGNPDCL).',
        'Household must hold a valid White Ration Card (Food Security Card).',
        'Electricity connection must be linked with consumer\'s Aadhaar and Food Security Card number.',
        'Monthly electricity consumption must be within 200 units (based on rolling average benchmarks).',
        'Only one domestic electricity meter is eligible per household.'
      ]),
      benefits: '100% discount on electricity charges (Zero electricity bill) if monthly consumption is at or below 200 units. The government pays the entire power bill directly to the power distribution utility.',
      requiredDocuments: JSON.stringify([
        'Electricity Consumer Service Number (USC Number) from latest power bill.',
        'Aadhaar Card of the consumer or head of the household.',
        'Food Security Card (White Ration Card).'
      ]),
      applicationSteps: '1. Locate your Unique Service Connection (USC) number on your latest TSSPDCL or TSNPDCL monthly bill.\n2. Submit the Gruha Jyothi section in the Praja Palana form with USC number and Food Security Card number.\n3. The DISCOM links your meter to your household database electronically.\n4. When the meter reader visits, if units used <= 200, an automatic Zero Bill (₹0.00) is generated on spot.',
      officialUrl: 'https://tgspdcl.com',
      sourceAuthority: 'Energy Department & Discoms (TGSPDCL / TGNPDCL), Govt. of Telangana',
      lastVerifiedAt: new Date('2024-10-20'),
      reviewWarning: null,
      caveats: 'If monthly consumption exceeds 200 units, the consumer is billed at the standard regular tariff for the total consumption. Commercial and industrial meters are strictly excluded.',
      isPublished: true,
      isSampleOnly: false,
    },
    {
      name: 'Rajiv Aarogyasri Health Scheme',
      nameTelugu: 'రాజీవ్ ఆరోగ్యశ్రీ పథకం',
      slug: 'rajiv-aarogyasri',
      categoryId: categoryMap['healthcare'],
      summary: 'State-sponsored universal health insurance providing cashless medical and surgical treatment up to ₹10 lakh per eligible family per year.',
      purpose: 'To insulate low and middle-income families from catastrophic medical indebtedness resulting from severe illnesses, cancer, cardiac surgeries, and critical trauma.',
      intendedGroups: JSON.stringify(['BPL Families', 'Critical Care Patients', 'Elderly', 'Children', 'Low-income Citizens']),
      eligibilityCriteria: JSON.stringify([
        'Resident family of Telangana possessing a valid White Ration Card (Food Security Card) or Aarogyasri health card.',
        'Annual household income within prescribed BPL thresholds as recognized by the Civil Supplies Department.',
        'Family members whose names are officially endorsed on the Food Security Card.'
      ]),
      benefits: 'Cashless medical treatment, surgical operations, post-op therapies, ICU stays, medications, pathology tests, and food charges up to ₹10,00,000 per family per financial year across 1,600+ empaneled government and private super-specialty hospitals.',
      requiredDocuments: JSON.stringify([
        'Aarogyasri Health Card or Food Security (White Ration) Card.',
        'Patient Aadhaar Card.',
        'Referral slip from government doctor or direct walk-in emergency diagnosis record.'
      ]),
      applicationSteps: '1. Visit any empaneled network hospital (both government or recognized private hospitals across Telangana).\n2. Approach the Aarogyasri Help Desk located at the hospital entrance, staffed by an "Aarogya Mithra".\n3. Show your Ration Card and Aadhaar to verify patient eligibility in the online trust portal.\n4. The hospital doctor submits an electronic Pre-Authorization Request for the surgical package.\n5. The Aarogyasri Trust Medical Officer approves authorization online, and cashless treatment commences immediately.\n6. At discharge, free follow-up medications and travel allowance are provided.',
      officialUrl: 'https://aarogyasri.telangana.gov.in',
      sourceAuthority: 'Aarogyasri Health Care Trust, Government of Telangana',
      lastVerifiedAt: new Date('2024-11-02'),
      reviewWarning: null,
      caveats: 'Treatments must be within the approved package master list. Routine outpatient doctor checkups without hospital admission are generally excluded.',
      isPublished: true,
      isSampleOnly: false,
    },
    {
      name: 'Indiramma Indlu Housing Scheme',
      nameTelugu: 'ఇందిరమ్మ ఇండ్లు పథకం',
      slug: 'indiramma-indlu',
      categoryId: categoryMap['social-welfare'],
      summary: 'Flagship public housing program providing ₹5 lakh direct financial assistance to construct a permanent pucca house on owned residential plots.',
      purpose: 'To ensure every homeless and roofless family in Telangana owns a safe, climate-resilient, dignified permanent dwelling unit.',
      intendedGroups: JSON.stringify(['Homeless Poor', 'BPL Families', 'EWS', 'Women Heads of Household']),
      eligibilityCriteria: JSON.stringify([
        'Family must be permanent residents of Telangana and belong to Economically Weaker Sections (EWS) / BPL category.',
        'Must not currently own a pucca (concrete roof) residential house.',
        'Must possess a legally clear residential house site/plot (for plot owners). Landless families are being allocated house sites in subsequent phases.',
        'Must not have received financial assistance under earlier government housing schemes (e.g. 2BHK Dignity Housing).'
      ]),
      benefits: '₹5,00,000 direct cash subsidy disbursed in phased installments linked directly to verified geo-tagged construction stages: 1) Basement / Plinth completion, 2) Roof level, 3) Slab casting, and 4) Final finishing and painting.',
      requiredDocuments: JSON.stringify([
        'Proof of house site ownership (Sale Deed, Patta, or Possession Certificate).',
        'Food Security Card (White Ration Card).',
        'Aadhaar Cards of husband and wife (house sanction is registered preferentially in the female head\'s name).',
        'Bank Account Passbook with Aadhaar linkage.',
        'Site photograph prior to commencement.'
      ]),
      applicationSteps: '1. Submit the Indiramma Indlu application section during Praja Palana Grama / Ward Sabhas.\n2. Engineering officers from Telangana State Housing Corporation inspect the plot and verify title ownership and GPS coordinates.\n3. Grama Sabha / Ward Committee public scrutiny ensures transparent beneficiary selection.\n4. Sanction order is generated with a unique House ID.\n5. As you complete each stage of construction, the village housing assistant captures geo-tagged photos on the mobile app, triggering immediate DBT release into your bank account.',
      officialUrl: 'https://housing.telangana.gov.in',
      sourceAuthority: 'Telangana State Housing Corporation Limited (TGSHCL)',
      lastVerifiedAt: new Date('2024-11-05'),
      reviewWarning: 'Beneficiary prioritization gives first preference to war widows, disabled persons, and vulnerable primitive tribal groups.',
      caveats: 'Geo-tagging is mandatory at every stage before payment release. Selling the subsidized house within the lock-in period is prohibited.',
      isPublished: true,
      isSampleOnly: false,
    },
    {
      name: 'Cheyutha / Aasara Social Security Pensions',
      nameTelugu: 'చేయూత / ఆసరా పింఛన్లు',
      slug: 'cheyutha-aasara-pensions',
      categoryId: categoryMap['pensions'],
      summary: 'Monthly social security financial support providing ₹4,000/month for senior citizens, widows, and artisans, and ₹6,000/month for persons with disabilities.',
      purpose: 'To provide social security, dignity, and survival support to elderly citizens, widows, persons with severe disabilities, and traditional unorganized artisans.',
      intendedGroups: JSON.stringify(['Senior Citizens (57+)', 'Widows', 'Persons with Disabilities (PwD)', 'Single Women', 'Weavers', 'Toddy Tappers', 'Beedi Workers', 'Dialysis Patients']),
      eligibilityCriteria: JSON.stringify([
        'Old Age Pension: Senior citizens aged 57 or above living in Telangana below the poverty line.',
        'Widow Pension: Widowed women aged 18+ whose spouse has passed away, with no regular income source.',
        'Disability Pension: Persons having 40% or higher certified physical/mental disability as evaluated by a medical board (SADAREM certificate).',
        'Single Women: Unmarried women above 30 years in rural (35 in urban) or deserted women living separately for over 1 year.',
        'Occupational: Registered members of Weavers, Toddy Tappers, or Beedi workers societies holding recognized identity cards.'
      ]),
      benefits: '1) ₹4,000 per month credited for Old Age, Widows, Single Women, Weavers, Toddy Tappers, and Beedi workers.\n2) ₹6,000 per month credited for Persons with Disabilities (Divyangjan) and chronic dialysis patients.',
      requiredDocuments: JSON.stringify([
        'Aadhaar Card (biometric identity proof).',
        'Proof of Age (Voter ID, School Leaving Certificate, or Medical Board Age Certificate).',
        'Food Security Card (White Ration Card).',
        'For Widows: Death Certificate of the husband.',
        'For PwD: Digital SADAREM Disability Certificate.',
        'Bank Account / Post Office Savings Account passbook seeded with Aadhaar.'
      ]),
      applicationSteps: '1. Fill the Pension application in Praja Palana or visit your nearest Meeseva center.\n2. Attach photocopies of Aadhaar, Ration Card, and specific eligibility documents (death cert / SADAREM cert).\n3. Field verification is conducted by the Panchayat Secretary / Municipal Bill Collector.\n4. Sanction is approved by the Mandal Parishad Development Officer (MPDO) or Municipal Commissioner.\n5. Monthly pension is disbursed via direct bank transfer or biometrically verified postal correspondents right at home.',
      officialUrl: 'https://aasara.telangana.gov.in',
      sourceAuthority: 'Society for Elimination of Rural Poverty (SERP) & Panchayat Raj Department',
      lastVerifiedAt: new Date('2024-10-18'),
      reviewWarning: 'Enhancement from historical ₹2,016/₹3,016 to ₹4,000/₹6,000 is being rolled out as per governmental budgetary orders.',
      caveats: 'Only one social pension is granted per individual. Those drawing civil/military government pensions are ineligible.',
      isPublished: true,
      isSampleOnly: false,
    },
    {
      name: 'Kalyana Lakshmi & Shaadi Mubarak',
      nameTelugu: 'కల్యాణ లక్ష్మి మరియు షాదీ ముబారక్',
      slug: 'kalyana-lakshmi-shaadi-mubarak',
      categoryId: categoryMap['social-welfare'],
      summary: 'One-time direct financial grant of ₹1,00,116 given to the bride\'s mother to support marriage expenses and prevent early child marriages.',
      purpose: 'To alleviate financial distress for economically vulnerable families during daughter weddings and incentivize girls to attain adulthood (18+) before marriage.',
      intendedGroups: JSON.stringify(['Brides', 'Low-income Families', 'SC/ST/BC/Minorities/EBC', 'Mothers']),
      eligibilityCriteria: JSON.stringify([
        'Bride must be an unmarried girl who has completed 18 years of age on the date of marriage.',
        'Groom must have completed 21 years of age.',
        'Bride and family must be permanent residents of Telangana.',
        'Belong to SC, ST, BC, Economically Backward Classes (EBC), or Minority communities.',
        'Combined parental annual income must not exceed ₹2,00,000 (urban areas) or ₹1,50,000 (rural areas).'
      ]),
      benefits: 'One-time direct financial assistance of ₹1,00,116 transferred directly into the bank account of the bride\'s mother (or bride\'s account if mother is deceased).',
      requiredDocuments: JSON.stringify([
        'Bride\'s Age Proof: SSC Marks Memo, Birth Certificate, or Bonafide Certificate.',
        'Aadhaar Cards of Bride, Groom, and Bride\'s Mother.',
        'Mother\'s Bank Account Passbook (must be active and Aadhaar seeded).',
        'Latest Income Certificate issued by Tahsildar (within last 6 months).',
        'Caste Certificate issued by authorized Revenue Department officer.',
        'Wedding Invitation Card, Marriage Photograph, or Certificate from Local Sub-Registrar / Kazi / Temple authority.'
      ]),
      applicationSteps: '1. Access the Telangana ePASS portal at telanganaepass.cgg.gov.in.\n2. Navigate to "Kalyana Lakshmi / Shaadi Mubarak" registration and upload required scanned certificates.\n3. The Revenue Inspector (RI) and Tahsildar conduct physical verification of age and residence.\n4. Verification report is endorsed by the local Member of Legislative Assembly (MLA) and forwarded to the District Collector.\n5. Funds are electronically disbursed directly to the mother\'s bank account.',
      officialUrl: 'https://telanganaepass.cgg.gov.in',
      sourceAuthority: 'Welfare Departments (SC, ST, BC & Minority Welfare), Govt. of Telangana',
      lastVerifiedAt: new Date('2024-10-25'),
      reviewWarning: null,
      caveats: 'Child marriages (under 18 for bride or 21 for groom) are strictly disqualified and lead to legal penal action. Applications must be completed within the stipulated timeline.',
      isPublished: true,
      isSampleOnly: false,
    },
    {
      name: 'Ambedkar Overseas Vidya Nidhi',
      nameTelugu: 'అంబేద్కర్ విదేశీ విద్యా నిధి',
      slug: 'ambedkar-overseas-vidya-nidhi',
      categoryId: categoryMap['education'],
      summary: 'Overseas higher education scholarship granting up to ₹20 lakh plus one-way airfare for meritorious SC, ST, BC, and Minority students pursuing Masters or PhDs abroad.',
      purpose: 'To ensure financial constraints do not prevent bright underprivileged students from accessing world-class postgraduate and doctoral education in top global universities.',
      intendedGroups: JSON.stringify(['Students', 'Graduates', 'SC/ST/BC/Minority/EBC Communities', 'Youth']),
      eligibilityCriteria: JSON.stringify([
        'Must be a permanent resident of Telangana state.',
        'Must belong to SC, ST, BC, EBC, or Minority communities.',
        'Age must not exceed 35 years as of the notification date.',
        'Family annual income from all sources must not exceed ₹5,00,000.',
        'Must have secured minimum 60% marks or equivalent CGPA in graduation / qualifying degree.',
        'Must have obtained confirmed admission in an accredited postgraduate/doctoral course in USA, UK, Australia, Canada, Singapore, Germany, or other designated countries.',
        'Valid score in GRE / GMAT and TOEFL / IELTS.'
      ]),
      benefits: 'Scholarship grant of up to ₹20,00,000 disbursed in two installments linked to semester progression and fee payment, along with one-way economy airfare and visa application reimbursement.',
      requiredDocuments: JSON.stringify([
        'Valid Indian Passport and Student Visa.',
        'University I-20 form or official admission confirmation letter.',
        'Qualifying Degree Marksheets and Transfer Certificate.',
        'Standardized test scorecards (GRE/GMAT, TOEFL/IELTS/PTE).',
        'Caste and Income Certificates issued by competent Revenue Authority.',
        'Aadhaar Card and Nationalized Bank Account details.'
      ]),
      applicationSteps: '1. Register online on the Telangana ePASS website (telanganaepass.cgg.gov.in) during the active notification window (Spring/Fall intakes).\n2. Upload all academic credentials, university admission proof, and income certificates.\n3. Attend the physical document verification and interview before the State Level Selection Committee headed by the Welfare Secretary.\n4. Sanction order is issued upon confirmation of university ranking and enrollment.\n5. Scholarship installments are remitted in foreign currency equivalents into the student\'s verified account.',
      officialUrl: 'https://telanganaepass.cgg.gov.in',
      sourceAuthority: 'Social Welfare & Scheduled Castes Development Dept., Govt. of Telangana',
      lastVerifiedAt: new Date('2024-10-12'),
      reviewWarning: null,
      caveats: 'Only one child per family is entitled to receive this overseas grant. The student cannot simultaneously hold any other concurrent state government foreign scholarship.',
      isPublished: true,
      isSampleOnly: false,
    },
    {
      name: 'T-PRIDE Entrepreneurship Scheme',
      nameTelugu: 'టి-ప్రైడ్ పారిశ్రామిక పథకం',
      slug: 't-pride-scheme',
      categoryId: categoryMap['social-welfare'],
      summary: 'Industrial incentive and business incubation scheme providing up to 35% capital subsidies and 100% stamp duty exemptions for SC/ST micro and small business entrepreneurs.',
      purpose: 'To catalyze industrialization among Dalit and Tribal entrepreneurs, generate rural employment, and foster self-reliant enterprises across Telangana.',
      intendedGroups: JSON.stringify(['Entrepreneurs', 'SC/ST Business Owners', 'Transporters', 'Youth', 'Women']),
      eligibilityCriteria: JSON.stringify([
        'New or expanding Micro, Small, and Medium Enterprises (MSMEs) located in Telangana state.',
        'Enterprise must be 100% owned by SC or ST entrepreneurs (or majority partnership/shareholding).',
        'Valid Udyam Registration and formal business bank loan sanction.'
      ]),
      benefits: '35% capital investment subsidy on fixed capital investment (plant, machinery, commercial vehicles) up to ₹75 lakh; 100% reimbursement of stamp duty and transfer duty; ₹1.50 per unit electricity power rebate for 5 years; 9% interest subsidy on term loans for 5 years.',
      requiredDocuments: JSON.stringify([
        'Udyam Registration Certificate.',
        'Caste Certificate of all promoters/partners.',
        'Detailed Project Report (DPR) and bank loan sanction copy.',
        'Land/factory shed lease or sale deeds and power connection certificate.',
        'Aadhaar and PAN cards of proprietors.'
      ]),
      applicationSteps: '1. Register on the TS-iPASS single-window portal at ipass.telangana.gov.in.\n2. Submit the Common Application Form (CAF) along with project documentation and bank sanction letters.\n3. The District Industries Centre (DIC) inspects the manufacturing/transport unit.\n4. The State Level Committee (SLC) evaluates the claim and accords sanction.\n5. Subsidy amount is credited directly against the enterprise\'s commercial bank term loan.',
      officialUrl: 'https://ipass.telangana.gov.in',
      sourceAuthority: 'Industries and Commerce Department, Government of Telangana',
      lastVerifiedAt: new Date('2024-10-08'),
      reviewWarning: null,
      caveats: 'The enterprise must maintain continuous operational production for at least 5 years from commencement, or subsidy is subject to clawback.',
      isPublished: true,
      isSampleOnly: false,
    },
    {
      name: 'KCR Kit & Mother-Child Health Scheme',
      nameTelugu: 'కేసీఆర్ కిట్ పథకం',
      slug: 'kcr-kit-scheme',
      categoryId: categoryMap['healthcare'],
      summary: 'Comprehensive maternal care incentive providing ₹12,000 (₹13,000 for girl child) in four staged cash transfers and a 16-item mother and newborn kit for deliveries in public hospitals.',
      purpose: 'To eliminate maternal and infant mortality, eradicate home delivery risks, and incentivize women to utilize public health infrastructure.',
      intendedGroups: JSON.stringify(['Pregnant Women', 'Lactating Mothers', 'Newborn Infants', 'Rural Women']),
      eligibilityCriteria: JSON.stringify([
        'Pregnant women residing in Telangana state.',
        'Delivery must be conducted in an empaneled government hospital (PHC, CHC, Area Hospital, District Hospital, or Teaching Hospital).',
        'Eligibility is restricted up to a maximum of two live institutional deliveries.'
      ]),
      benefits: '1) Financial support of ₹12,000 for birth of male child and ₹13,000 for birth of female child, disbursed in 4 installments: Phase 1 (₹3,000 at ANC registration), Phase 2 (₹4,000/₹5,000 at delivery), Phase 3 (₹2,000 after 1st round vaccines), Phase 4 (₹3,000 after 9-month immunization). 2) Physical 16-item care kit containing baby clothes, baby oil, baby soap, mosquito net, diaper, mother\'s saree, bed, toys, and baby powder.',
      requiredDocuments: JSON.stringify([
        'Mother and Child Protection (MCP) card issued during ANC registration.',
        'Aadhaar Card of pregnant mother.',
        'Husband\'s Aadhaar Card.',
        'Individual Bank Account Passbook seeded with Aadhaar.',
        'Government Hospital Discharge Summary.'
      ]),
      applicationSteps: '1. Register your pregnancy at your village/ward Anganwadi or Primary Health Centre (PHC) within the first 12 weeks.\n2. The ASHA worker or Auxiliary Nurse Midwife (ANM) records your details in the state Mother & Child tracking portal.\n3. Complete scheduled prenatal health checkups (ANC) to receive Phase 1 funds.\n4. Deliver the baby at a government hospital to receive the physical KCR kit and Phase 2 funds.\n5. Follow immunization milestones for subsequent installments.',
      officialUrl: 'https://kcrkit.telangana.gov.in',
      sourceAuthority: 'Department of Health, Medical and Family Welfare, Govt. of Telangana',
      lastVerifiedAt: new Date('2024-10-30'),
      reviewWarning: null,
      caveats: 'Institutional deliveries in private nursing homes do not qualify for the financial assistance or the kit. Benefit capped at maximum of two deliveries.',
      isPublished: true,
      isSampleOnly: false,
    },
    {
      name: 'Yuva Vikasam (Student Skill & Higher Education Guarantee)',
      nameTelugu: 'యువ వికాసం పథకం',
      slug: 'yuva-vikasam-scheme',
      categoryId: categoryMap['education'],
      summary: 'Youth and student empowerment initiative providing Vidya Bharosa financial guarantee cards of up to ₹5 lakh for competitive exam coaching, collegiate fee aid, and career skilling.',
      purpose: 'To empower rural and urban youth to clear competitive examinations, acquire advanced engineering and vocational skills, and eliminate family financial barriers to higher education.',
      intendedGroups: JSON.stringify(['Students', 'College Youth', 'Job Aspirants', 'Unemployed Graduates']),
      eligibilityCriteria: JSON.stringify([
        'Resident students and youth of Telangana aged between 17 and 30 years.',
        'Enrolled in recognized intermediate, polytechnic, undergraduate, postgraduate, or skill development programs.',
        'Belong to economically backward classes, rural families, or disadvantaged social groups.'
      ]),
      benefits: 'Financial assistance guarantee card up to ₹5,00,000 covering tuition fees, competitive exam coaching center fees (TSPSC, UPSC, banking, staff selection), and free enrollment in Telangana Skill & Knowledge Centers (TASK).',
      requiredDocuments: JSON.stringify([
        'Student College ID or Examination Admit Card.',
        'Educational Marks memos (SSC and Intermediate).',
        'Aadhaar Card with Telangana domicile.',
        'Income Certificate and Residence Certificate issued by Tahsildar.'
      ]),
      applicationSteps: '1. Register on the Telangana Youth Services portal or submit application in Praja Palana student desks.\n2. Upload academic certificates and desired coaching/course curriculum.\n3. Collegiate Education Department confirms enrollment.\n4. Vidya Bharosa digital smart card is issued to the student.',
      officialUrl: 'https://telangana.gov.in',
      sourceAuthority: 'Higher Education Department & Youth Services, Govt. of Telangana',
      lastVerifiedAt: new Date('2024-11-04'),
      reviewWarning: 'Implementation modalities and university partnership lists are being expanded across all 119 constituencies.',
      caveats: 'Applicants must maintain minimum 75% attendance and satisfactory academic standing.',
      isPublished: true,
      isSampleOnly: true, // Flagged clearly as sample/transitional illustrative data
    }
  ];

  for (const s of schemesData) {
    await prisma.scheme.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    });
  }
  console.log('Seeded', schemesData.length, 'comprehensive Telangana schemes.');

  // 3. Create Default Administrator
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('AdminSecure2026!', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@telangana.gov.example' },
    update: {
      passwordHash,
      name: 'Telangana Portal Administrator',
      role: 'ADMIN',
    },
    create: {
      email: 'admin@telangana.gov.example',
      name: 'Telangana Portal Administrator',
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('Created default administrator:', admin.email);
  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
