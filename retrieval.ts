import { prisma } from './prisma';

export interface RetrievedScheme {
  id: string;
  name: string;
  nameTelugu: string | null;
  slug: string;
  categoryName: string;
  categorySlug: string;
  summary: string;
  purpose: string;
  intendedGroups: string[];
  eligibilityCriteria: string[];
  benefits: string;
  requiredDocuments: string[];
  applicationSteps: string;
  officialUrl: string;
  sourceAuthority: string;
  lastVerifiedAt: Date;
  reviewWarning: string | null;
  caveats: string | null;
  score: number;
}

export type QueryIntent =
  | 'eligibility'
  | 'benefits'
  | 'documents'
  | 'apply'
  | 'hospital'
  | 'medical_disclaimer'
  | 'general';

export interface SearchAnalysis {
  intent: QueryIntent;
  matchedCategories: string[];
  matchedGroups: string[];
  keywords: string[];
  isTelugu: boolean;
}

/**
 * Check if the user query is seeking clinical diagnosis or prescription drugs
 */
export function isMedicalPrescriptionQuery(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    /diagnos|prescrib|what medicine|which tablet|cure|treatment for symptom|my chest hurts|fever tablet|dosage|remedy for pain/i.test(
      lower
    ) ||
    /మందులు ఇవ్వండి|ఏ టాబ్లెట్|వ్యాధి నిర్ధారణ|చికిత్స ఏమిటి/i.test(text)
  );
}

export function analyzeQuery(query: string): SearchAnalysis {
  const lower = query.toLowerCase();
  const isTelugu = /[\u0C00-\u0C7F]/.test(query);

  // Check safety first
  if (isMedicalPrescriptionQuery(query)) {
    return {
      intent: 'medical_disclaimer',
      matchedCategories: ['healthcare'],
      matchedGroups: [],
      keywords: [],
      isTelugu,
    };
  }

  // 1. Identify Intent (specific queries checked first)
  let intent: QueryIntent = 'general';
  if (/hospital|clinic|doctor|phc|chc|nims|osmania|gandhi|ఆసుపత్రి|దవాఖాన|డాక్టర్/i.test(lower)) {
    intent = 'hospital';
  } else if (/document|paper|certificate|proof|ration card|papers needed|apply with|పత్రాలు|సర్టిఫికేట్/i.test(lower)) {
    intent = 'documents';
  } else if (/how to apply|how do i get|where to apply|application|process|procedure|steps|portal|form|meeseva|praja palana|దరఖాస్తు|ఎలా/i.test(lower)) {
    intent = 'apply';
  } else if (/eligible|qualify|criteria|who can|age limit|income limit|conditions|rules|అర్హత|నిబంధన/i.test(lower)) {
    intent = 'eligibility';
  } else if (/benefit|amount|how much|money|cash|financial|grant|subsidy|concession|free|ప్రయోజనం|డబ్బులు|ఉచిత/i.test(lower)) {
    intent = 'benefits';
  }

  // 2. Identify Target Groups
  const matchedGroups: string[] = [];
  if (/wom[ae]n|girl|mother|bride|daughter|female|pregnant|maternal|గర్భిణీ|మహిళ/i.test(lower)) matchedGroups.push('Women');
  if (/farmer|cultivator|tenant|agriculture|crop|kisan|rythu|రైతు/i.test(lower)) matchedGroups.push('Farmers');
  if (/student|study|college|school|scholarship|exam|youth|degree|విద్యార్థి/i.test(lower)) matchedGroups.push('Students');
  if (/senior|elderly|old age|aged|pensioner|above 60|above 57|వృద్ధులు/i.test(lower)) matchedGroups.push('Senior Citizens');
  if (/widow|deserted|single woman|వితంతువు/i.test(lower)) matchedGroups.push('Widows');
  if (/disab|handicap|sadarem|divyang|దివ్యాంగులు/i.test(lower)) matchedGroups.push('Persons with Disabilities');
  if (/poor|bpl|white ration|low income|ews|homeless|పేద/i.test(lower)) matchedGroups.push('BPL Families');
  if (/entrepreneur|business|msme|startup|dalit bandhu|t-pride/i.test(lower)) matchedGroups.push('Entrepreneurs');

  // 3. Identify Categories
  const matchedCategories: string[] = [];
  if (/health|hospital|doctor|treatment|operation|surgery|aarogyasri|kcr kit|medicine|ఆరోగ్య|వైద్యం/i.test(lower)) matchedCategories.push('healthcare');
  if (/wom[ae]n|girl|bride|mahalakshmi|kalyana/i.test(lower)) matchedCategories.push('women-empowerment');
  if (/electric|power|current|gruha jyothi|200 unit|bill|కరెంట్|విద్యుత్/i.test(lower)) matchedCategories.push('electricity');
  if (/educat|scholarship|overseas|college|vidya|school|tuition/i.test(lower)) matchedCategories.push('education');
  if (/agricultur|farm|crop|rythu bharosa|rythu bandhu|seed|fertilizer/i.test(lower)) matchedCategories.push('agriculture');
  if (/pension|aasara|cheyutha|old age pension|పింఛను/i.test(lower)) matchedCategories.push('pensions');
  if (/hous|indiramma|pucca|plot|welfare|marriage|shaadi/i.test(lower)) matchedCategories.push('social-welfare');

  // 4. Tokenize
  const keywords = lower
    .replace(/[^\w\s\u0C00-\u0C7F]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['the', 'and', 'for', 'are', 'what', 'how', 'can', 'telangana'].includes(w));

  return { intent, matchedCategories, matchedGroups, keywords, isTelugu };
}

export async function retrieveRelevantSchemes(query: string, limit = 3): Promise<{
  schemes: RetrievedScheme[];
  analysis: SearchAnalysis;
  hospitals?: any[];
}> {
  const analysis = analyzeQuery(query);

  // If user asks about hospitals, also fetch verified hospitals
  let matchedHospitals: any[] = [];
  if (analysis.intent === 'hospital') {
    const rawHospitals = await prisma.hospital.findMany({
      where: { isVerified: true },
      take: 4,
    });
    matchedHospitals = rawHospitals.map((h) => {
      let services: string[] = [];
      try {
        services = JSON.parse(h.services);
      } catch {
        services = [h.services];
      }
      return { ...h, services };
    });
  }

  const rawSchemes = await prisma.scheme.findMany({
    where: { isPublished: true },
    include: { category: true },
  });

  const scoredSchemes: RetrievedScheme[] = [];

  for (const s of rawSchemes) {
    let score = 0;
    const nameLower = s.name.toLowerCase();
    const teluguLower = (s.nameTelugu || '').toLowerCase();
    const summaryLower = s.summary.toLowerCase();
    const purposeLower = s.purpose.toLowerCase();

    // Check exact scheme name match
    if (nameLower.includes(query.toLowerCase()) || (teluguLower && query.includes(teluguLower))) {
      score += 100;
    }

    // Scheme aliases (English & Telugu)
    if (/aarogyasri|arogyasri|health card|10 lakh|ఆరోగ్యశ్రీ/i.test(query) && s.slug === 'rajiv-aarogyasri') score += 90;
    if (/kcr kit|delivery kit|pregnant|12000|13000|కేసీఆర్ కిట్/i.test(query) && s.slug === 'kcr-kit-scheme') score += 90;
    if (/mahalakshmi|free bus|500 cylinder|2500|మహాలక్ష్మి/i.test(query) && s.slug === 'mahalakshmi-scheme') score += 80;
    if (/rythu bharosa|rythu bandhu|15000|రైతు భరోసా/i.test(query) && s.slug === 'rythu-bharosa') score += 80;
    if (/gruha jyothi|gruhajyothi|200 unit|గృహ జ్యోతి/i.test(query) && s.slug === 'gruha-jyothi') score += 80;
    if (/indiramma|house subsidy|5 lakh|ఇందిరమ్మ/i.test(query) && s.slug === 'indiramma-indlu') score += 80;
    if (/aasara|cheyutha|pension|ఆసరా|చేయూత/i.test(query) && s.slug === 'cheyutha-aasara-pensions') score += 80;
    if (/kalyana lakshmi|shaadi mubarak|కల్యాణ లక్ష్మి/i.test(query) && s.slug === 'kalyana-lakshmi-shaadi-mubarak') score += 80;

    // Healthcare category boost if healthcare terms used
    if (analysis.matchedCategories.includes(s.category.slug)) {
      score += 30;
    }

    // Parse intended groups
    let parsedGroups: string[] = [];
    try {
      parsedGroups = JSON.parse(s.intendedGroups);
    } catch {
      parsedGroups = s.intendedGroups.split(',').map((g) => g.trim());
    }

    for (const group of analysis.matchedGroups) {
      if (parsedGroups.some((pg) => pg.toLowerCase().includes(group.toLowerCase()))) {
        score += 20;
      }
    }

    for (const kw of analysis.keywords) {
      if (nameLower.includes(kw) || teluguLower.includes(kw)) score += 15;
      else if (summaryLower.includes(kw)) score += 8;
      else if (purposeLower.includes(kw)) score += 5;
    }

    let parsedEligibility: string[] = [];
    try {
      parsedEligibility = JSON.parse(s.eligibilityCriteria);
    } catch {
      parsedEligibility = [s.eligibilityCriteria];
    }

    let parsedDocuments: string[] = [];
    try {
      parsedDocuments = JSON.parse(s.requiredDocuments);
    } catch {
      parsedDocuments = [s.requiredDocuments];
    }

    scoredSchemes.push({
      id: s.id,
      name: s.name,
      nameTelugu: s.nameTelugu,
      slug: s.slug,
      categoryName: s.category.name,
      categorySlug: s.category.slug,
      summary: s.summary,
      purpose: s.purpose,
      intendedGroups: parsedGroups,
      eligibilityCriteria: parsedEligibility,
      benefits: s.benefits,
      requiredDocuments: parsedDocuments,
      applicationSteps: s.applicationSteps,
      officialUrl: s.officialUrl,
      sourceAuthority: s.sourceAuthority,
      lastVerifiedAt: s.lastVerifiedAt,
      reviewWarning: s.reviewWarning,
      caveats: s.caveats,
      score,
    });
  }

  scoredSchemes.sort((a, b) => b.score - a.score);
  const matched = scoredSchemes.filter((s) => s.score > 0).slice(0, limit);

  return {
    schemes: matched,
    analysis,
    hospitals: matchedHospitals,
  };
}

export function formatGroundedAnswer(
  scheme: RetrievedScheme,
  intent: QueryIntent,
  otherMatches: RetrievedScheme[] = [],
  language: 'en' | 'te' = 'en',
  hospitals: any[] = []
): string {
  const verifiedDateStr = new Date(scheme.lastVerifiedAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const isTe = language === 'te';

  let sections: string[] = [];

  // Medical Safety Warning Header
  const medicalHeader = isTe
    ? `> ⚠️ **వైద్య హెచ్చరిక:** ఈ సమాచారం ప్రభుత్వ సంక్షేమ పథకాల మార్గదర్శకత్వం కోసం మాత్రమే. ఇది వైద్య వ్యాధి నిర్ధారణ లేదా మందుల ప్రిస్క్రిప్షన్ కాదు. అత్యవసర వైద్యం కోసం 108 కు కాల్ చేయండి.`
    : `> ⚠️ **Medical Disclaimer:** This AI assistant provides welfare scheme guidance only. It does not diagnose medical conditions or prescribe medications. In medical emergencies, please dial 108 immediately.`;
  sections.push(medicalHeader);

  // Scheme Header
  const title = isTe && scheme.nameTelugu ? `${scheme.nameTelugu} (${scheme.name})` : scheme.name;
  sections.push(`\n### ${title}`);
  sections.push(
    isTe
      ? `*విభాగం: ${scheme.categoryName}* | *ధృవీకరించబడిన తేదీ: ${verifiedDateStr}*`
      : `*Category: ${scheme.categoryName}* | *Verified: ${verifiedDateStr}*`
  );

  // What it is
  sections.push(
    isTe
      ? `\n**పథకం ఉద్దేశం / పరిచయం:**\n${scheme.summary}`
      : `\n**What it is:**\n${scheme.summary}`
  );

  // Who may qualify
  const eligibilityList = scheme.eligibilityCriteria.map((c) => `• ${c}`).join('\n');
  sections.push(
    isTe
      ? `\n**అర్హత నిబంధనలు (ఎవరు దరఖాస్తు చేసుకోవచ్చు):**\n*గమనిక: క్రింది నిబంధనలకు అనుగుణంగా మీకు అర్హత ఉండవచ్చు:*\n${eligibilityList}`
      : `\n**Who may qualify:**\n*Note: You may be eligible if you satisfy the following official criteria:*\n${eligibilityList}`
  );

  // Benefits
  sections.push(
    isTe
      ? `\n**ప్రధాన ప్రయోజనాలు & ఆర్థిక సహాయం:**\n${scheme.benefits}`
      : `\n**Key Benefits & Assistance:**\n${scheme.benefits}`
  );

  // Required Documents
  const docsList = scheme.requiredDocuments.map((d) => `• ${d}`).join('\n');
  sections.push(
    isTe
      ? `\n**అవసరమైన ధృవీకరణ పత్రాలు:**\n${docsList}`
      : `\n**Required Documents:**\n${docsList}`
  );

  // How to apply
  sections.push(
    isTe
      ? `\n**దరఖాస్తు విధానం (ఎలా దరఖాస్తు చేయాలి):**\n${scheme.applicationSteps}`
      : `\n**How to Apply:**\n${scheme.applicationSteps}`
  );

  // Hospital Info if hospitals were retrieved
  if (hospitals && hospitals.length > 0) {
    sections.push(
      isTe
        ? `\n**గుర్తింపు పొందిన తెలంగాణ ప్రభుత్వ ఆసుపత్రులు:**`
        : `\n**Network Government & Empaneled Hospitals:**`
    );
    for (const h of hospitals) {
      const hTitle = isTe && h.nameTelugu ? h.nameTelugu : h.name;
      sections.push(`• **${hTitle}** (${h.district}) - ${h.address} | Ph: ${h.contactNumber || 'Available at desk'}`);
    }
    sections.push(
      isTe
        ? `మరిన్ని ఆసుపత్రుల కోసం [ఆసుపత్రుల శోధన పేజీని చూడండి](/hospitals).`
        : `Explore all 33 districts on our [Hospital Finder Page](/hospitals).`
    );
  }

  // Official Source
  sections.push(
    isTe
      ? `\n---\n**అధికారిక విభాగం:** [${scheme.sourceAuthority}](${scheme.officialUrl})\n*దయచేసి తాజా వివరాలు మరియు నిబంధనల కోసం అధికారిక పోర్టల్‌లో నిర్ధారించుకోండి.*`
      : `\n---\n**Official Departmental Source:** [${scheme.sourceAuthority}](${scheme.officialUrl})\n*Please verify changing rules directly on the official state portal.*`
  );

  if (otherMatches.length > 0) {
    sections.push(isTe ? `\n**ఇతర సంబంధిత పథకాలు:**` : `\n**Other potentially relevant schemes:**`);
    for (const other of otherMatches) {
      const oName = isTe && other.nameTelugu ? other.nameTelugu : other.name;
      sections.push(`• [${oName}](/schemes/${other.slug}) (${other.categoryName})`);
    }
  }

  return sections.join('\n');
}

export function formatFallbackAnswer(
  query: string,
  availableCategories: string[],
  language: 'en' | 'te' = 'en'
): string {
  if (language === 'te') {
    return `క్షమించండి, మీ ప్రశ్న "${query}" కు సరిపోలే అధికారిక తెలంగాణ సంక్షేమ పథకం వివరాలు మా రికార్డులలో కనుగొనబడలేదు.

**ముఖ్యమైన ఆరోగ్య పథకాలు:**
• **రాజీవ్ ఆరోగ్యశ్రీ పథకం** (₹10 లక్షల వరకు ఉచిత నగదు రహిత చికిత్స)
• **కేసీఆర్ కిట్ పథకం** (గర్భిణీలకు ₹12,000 - ₹13,000 మరియు 16 వస్తువుల కిట్)
• **మహాలక్ష్మి పథకం** (మహిళలకు ఉచిత బస్సు ప్రయాణం, ₹500 గ్యాస్ సిలిండర్)
• **గృహ జ్యోతి పథకం** (200 యూనిట్ల వరకు ఉచిత గృహ విద్యుత్)

దయచేసి మా [ఆరోగ్య పథకాల జాబితా](/schemes) లేదా [ప్రభుత్వ ఆసుపత్రుల పేజీని](/hospitals) చూడండి, లేదా అధికారిక పోర్టల్ [telangana.gov.in](https://telangana.gov.in) ని సందర్శించండి.`;
  }

  return `I could not locate an officially verified Telangana Government scheme in our database that specifically addresses: "${query}".

**Flagship Healthcare & Welfare Schemes:**
• **Rajiv Aarogyasri Health Scheme** (Up to ₹10 lakh cashless medical coverage for BPL families)
• **KCR Kit & Maternal Care Scheme** (₹12,000 - ₹13,000 financial aid & maternal-newborn kit)
• **Mahalakshmi Scheme** (Free TSRTC bus travel for women, ₹500 subsidized LPG cylinder)
• **Gruha Jyothi Scheme** (Up to 200 units free domestic electricity)
• **Cheyutha / Aasara Pensions** (Monthly social security pensions of ₹4,000 / ₹6,000)

You may explore our [Healthcare Schemes Directory](/schemes), find government hospitals in your district on our [Hospital Finder](/hospitals), or visit the official Telangana State Government portal at [telangana.gov.in](https://telangana.gov.in).`;
}
