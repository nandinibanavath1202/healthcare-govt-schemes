const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Verified Telangana Hospitals...');

  const hospitalsData = [
    {
      name: 'Osmania General Hospital',
      nameTelugu: 'ఉస్మానియా జనరల్ ఆసుపత్రి',
      type: 'Government Teaching Hospital',
      district: 'Hyderabad',
      address: 'Afzal Gunj, High Court Road, Hyderabad, Telangana 500012',
      contactNumber: '040-24600121',
      latitude: 17.3753,
      longitude: 78.4744,
      services: JSON.stringify([
        'General Medicine',
        'General Surgery',
        'Emergency & Trauma Care',
        'Cardiology',
        'Nephrology & Dialysis',
        'Neurology',
        'Orthopedics',
        'Rajiv Aarogyasri Cashless Care'
      ]),
      officialWebsite: 'https://osmaniageneralhospital.telangana.gov.in',
      sourceUrl: 'https://telangana.gov.in',
      isVerified: true,
    },
    {
      name: 'Gandhi Hospital & Medical College',
      nameTelugu: 'గాంధీ ఆసుపత్రి',
      type: 'Government Teaching Hospital',
      district: 'Hyderabad',
      address: 'Musheerabad, Padmarao Nagar, Secunderabad, Telangana 500003',
      contactNumber: '040-27505566',
      latitude: 17.4239,
      longitude: 78.5029,
      services: JSON.stringify([
        'Pulmonology & Critical Care',
        'Infectious Diseases',
        'General Surgery',
        'Pediatrics',
        'OBG & Maternity Care',
        '24/7 Emergency Casualty',
        'Rajiv Aarogyasri Helpdesk'
      ]),
      officialWebsite: 'https://gandhihospital.telangana.gov.in',
      sourceUrl: 'https://telangana.gov.in',
      isVerified: true,
    },
    {
      name: "Nizam's Institute of Medical Sciences (NIMS)",
      nameTelugu: 'నిజామ్స్ ఇన్స్టిట్యూట్ ఆఫ్ మెడికల్ సైన్సెస్',
      type: 'Autonomous Super Specialty Hospital',
      district: 'Hyderabad',
      address: 'Punjagutta Main Road, Hyderabad, Telangana 500082',
      contactNumber: '040-23489000',
      latitude: 17.4224,
      longitude: 78.4533,
      services: JSON.stringify([
        'Cardiothoracic Surgery',
        'Medical & Surgical Oncology',
        'Nephrology & Renal Transplant',
        'Neurosurgery',
        'Rheumatology',
        'Nuclear Medicine',
        'Aarogyasri Empaneled Procedures'
      ]),
      officialWebsite: 'https://www.nims.edu.in',
      sourceUrl: 'https://aarogyasri.telangana.gov.in',
      isVerified: true,
    },
    {
      name: 'MNJ Institute of Oncology & Regional Cancer Centre',
      nameTelugu: 'ఎంఎన్‌జే క్యాన్సర్ ఆసుపత్రి',
      type: 'Specialized Government Cancer Hospital',
      district: 'Hyderabad',
      address: 'Red Hills, Lakdikapul, Hyderabad, Telangana 500004',
      contactNumber: '040-23318414',
      latitude: 17.3995,
      longitude: 78.4612,
      services: JSON.stringify([
        'Radiation Oncology',
        'Medical Oncology & Chemotherapy',
        'Surgical Oncology',
        'Palliative Care',
        'Pediatric Oncology',
        '100% Cashless Aarogyasri Cancer Care'
      ]),
      officialWebsite: 'https://mnjiorcc.telangana.gov.in',
      sourceUrl: 'https://aarogyasri.telangana.gov.in',
      isVerified: true,
    },
    {
      name: 'Niloufer Hospital for Women and Children',
      nameTelugu: 'నీలోఫర్ ఆసుపత్రి',
      type: 'Government Maternity & Pediatric Hospital',
      district: 'Hyderabad',
      address: 'Red Hills, Bazar Ghat, Lakdikapul, Hyderabad, Telangana 500004',
      contactNumber: '040-23394265',
      latitude: 17.3986,
      longitude: 78.4638,
      services: JSON.stringify([
        'Pediatric Intensive Care (PICU)',
        'Neonatal Intensive Care (NICU)',
        'Obstetrics & Gynecology',
        'KCR Kit Distribution Center',
        'Pediatric Surgery',
        'Maternal Anemia Clinics'
      ]),
      officialWebsite: 'https://telangana.gov.in',
      sourceUrl: 'https://kcrkit.telangana.gov.in',
      isVerified: true,
    },
    {
      name: 'Mahatma Gandhi Memorial (MGM) Hospital',
      nameTelugu: 'మహాత్మా గాంధీ మెమోరియల్ ఆసుపత్రి',
      type: 'Government Teaching Hospital',
      district: 'Warangal',
      address: 'Station Road, Mattewada, Warangal, Telangana 506002',
      contactNumber: '0870-2441235',
      latitude: 17.9784,
      longitude: 79.6012,
      services: JSON.stringify([
        'General Medicine',
        'General Surgery',
        'Trauma & Orthopedics',
        'Pediatrics & Neonatology',
        'Dialysis Center',
        'Aarogyasri Health Desk'
      ]),
      officialWebsite: 'https://warangal.telangana.gov.in',
      sourceUrl: 'https://telangana.gov.in',
      isVerified: true,
    },
    {
      name: 'Government General Hospital (GGH) Karimnagar',
      nameTelugu: 'ప్రభుత్వ జనరల్ ఆసుపత్రి, కరీంనగర్',
      type: 'Government General Hospital',
      district: 'Karimnagar',
      address: 'Court Road, Mukarampura, Karimnagar, Telangana 505001',
      contactNumber: '0878-2244222',
      latitude: 18.4386,
      longitude: 79.1288,
      services: JSON.stringify([
        'Emergency Services',
        'OBG & Maternity Care',
        'Pediatrics',
        'ICU & Ventilator Care',
        'Blood Bank',
        'Rajiv Aarogyasri Facility'
      ]),
      officialWebsite: 'https://karimnagar.telangana.gov.in',
      sourceUrl: 'https://telangana.gov.in',
      isVerified: true,
    },
    {
      name: 'Government General Hospital (GGH) Nizamabad',
      nameTelugu: 'ప్రభుత్వ జనరల్ ఆసుపత్రి, నిజామాబాద్',
      type: 'Government General Hospital',
      district: 'Nizamabad',
      address: 'Khaleelwadi, Nizamabad, Telangana 503001',
      contactNumber: '08462-220150',
      latitude: 18.6725,
      longitude: 78.0941,
      services: JSON.stringify([
        'Emergency & Casualty',
        'General Surgery',
        'Maternal & Newborn Care',
        'Ophthalmology',
        'Dialysis Center',
        'Aarogyasri Counter'
      ]),
      officialWebsite: 'https://nizamabad.telangana.gov.in',
      sourceUrl: 'https://telangana.gov.in',
      isVerified: true,
    },
    {
      name: 'Government General Hospital (GGH) Khammam',
      nameTelugu: 'ప్రభుత్వ జనరల్ ఆసుపత్రి, ఖమ్మం',
      type: 'Government General Hospital',
      district: 'Khammam',
      address: 'NSP Camp, Wyra Road, Khammam, Telangana 507002',
      contactNumber: '08742-224567',
      latitude: 17.2473,
      longitude: 80.1514,
      services: JSON.stringify([
        'Cardiology & Tele-ICU',
        'General Surgery',
        'Pediatrics',
        'Ortho & Joint Care',
        'KCR Kit Distribution',
        'Aarogyasri Cashless Desk'
      ]),
      officialWebsite: 'https://khammam.telangana.gov.in',
      sourceUrl: 'https://telangana.gov.in',
      isVerified: true,
    },
    {
      name: 'District Hospital Mahabubnagar',
      nameTelugu: 'జిల్లా ఆసుపత్రి, మహబూబ్‌నగర్',
      type: 'District Hospital',
      district: 'Mahabubnagar',
      address: 'Station Road, Mahabubnagar, Telangana 509001',
      contactNumber: '08542-242333',
      latitude: 16.7488,
      longitude: 77.9898,
      services: JSON.stringify([
        '24/7 Casualty & Trauma',
        'Obstetrics & Gynecology',
        'Pediatrics',
        'General Medicine',
        'Aarogyasri Helpdesk'
      ]),
      officialWebsite: 'https://mahabubnagar.telangana.gov.in',
      sourceUrl: 'https://telangana.gov.in',
      isVerified: true,
    },
    {
      name: 'Rajiv Institute of Medical Sciences (RIMS)',
      nameTelugu: 'రాజీవ్ ఇన్స్టిట్యూట్ ఆఫ్ మెడికల్ సైన్సెస్, ఆదిలాబాద్',
      type: 'Government Teaching Hospital',
      district: 'Adilabad',
      address: 'NH 44, Collectorate Road, Adilabad, Telangana 504001',
      contactNumber: '08732-220555',
      latitude: 19.6641,
      longitude: 78.5320,
      services: JSON.stringify([
        'Multi-Specialty Inpatient Care',
        'Tribal Health Outreach',
        'Pediatrics & Neonatal Care',
        'Emergency Surgery',
        'Rajiv Aarogyasri Network Center'
      ]),
      officialWebsite: 'https://adilabad.telangana.gov.in',
      sourceUrl: 'https://telangana.gov.in',
      isVerified: true,
    },
    {
      name: 'Apollo Hospitals Jubilee Hills',
      nameTelugu: 'అపోలో హాస్పిటల్స్, జూబ్లీహిల్స్',
      type: 'Aarogyasri Empaneled Private Hospital',
      district: 'Hyderabad',
      address: 'Road No 72, Opposite Bharatiya Vidya Bhavan, Jubilee Hills, Hyderabad 500033',
      contactNumber: '040-23607777',
      latitude: 17.4326,
      longitude: 78.4071,
      services: JSON.stringify([
        'Cardiology & CT Surgery',
        'Organ Transplant',
        'Medical & Surgical Oncology',
        'Neurology',
        'Aarogyasri Cashless Empaneled Packages'
      ]),
      officialWebsite: 'https://hyderabad.apollohospitals.com',
      sourceUrl: 'https://aarogyasri.telangana.gov.in',
      isVerified: true,
    },
    {
      name: 'Yashoda Hospitals Secunderabad',
      nameTelugu: 'యశోద హాస్పిటల్స్, సికింద్రాబాద్',
      type: 'Aarogyasri Empaneled Private Hospital',
      district: 'Hyderabad',
      address: 'Alexander Road, Karkhana, Secunderabad, Telangana 500003',
      contactNumber: '040-45674567',
      latitude: 17.4475,
      longitude: 78.4984,
      services: JSON.stringify([
        'Cardiac Sciences',
        'Bone Marrow Transplant',
        'Neurosciences',
        'Gastroenterology',
        'Aarogyasri Designated Specialty Packages'
      ]),
      officialWebsite: 'https://www.yashodahospitals.com',
      sourceUrl: 'https://aarogyasri.telangana.gov.in',
      isVerified: true,
    }
  ];

  for (const h of hospitalsData) {
    const existing = await prisma.hospital.findFirst({
      where: { name: h.name },
    });
    if (!existing) {
      await prisma.hospital.create({ data: h });
    }
  }

  // Create initial broadcast notification
  const existingNotice = await prisma.notification.findFirst({
    where: { title: 'Welcome to Telangana Healthcare Schemes AI Portal' },
  });
  if (!existingNotice) {
    await prisma.notification.create({
      data: {
        title: 'Welcome to Telangana Healthcare Schemes AI Portal',
        message: 'Explore verified Rajiv Aarogyasri health benefits up to ₹10 lakh, maternal care kits, and locate network hospitals across 33 districts.',
        type: 'SYSTEM',
        link: '/schemes',
      },
    });
  }

  console.log('Seeded verified hospitals and welcome notification successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
