import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Department } from '../models/Department';
import { KnowledgeCategory } from '../models/KnowledgeCategory';
import { FAQ } from '../models/FAQ';
import { ApprovalGuide } from '../models/ApprovalGuide';
import { Regulation } from '../models/Regulation';
import { Logger } from '../utils/logger';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/maitri_plus';

export const seedKnowledge = async (): Promise<void> => {
  try {
    Logger.info('Connecting to MongoDB for Regulatory Knowledge Engine seeding...');
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
    }
    Logger.info('Connected to MongoDB.');

    // 1. Seed Departments
    const departmentsData = [
      {
        name: 'Maharashtra Pollution Control Board (MPCB)',
        code: 'MPCB',
        description:
          'Apex regulatory authority in Maharashtra responsible for monitoring and mitigating environmental degradation, administering Water and Air Acts, and issuing Consent to Establish (CTE) and Consent to Operate (CTO).',
        website: 'https://mpcb.gov.in',
        contactEmail: 'contact@mpcb.gov.in',
        contactPhone: '+91 22 24010437',
        officeAddress: 'Kalpataru Point, 3rd and 4th floor, Opp. PVR Cinema, Sion Circle, Mumbai - 400022',
        approvalTypes: [
          'Consent to Establish (CTE)',
          'Consent to Operate (CTO)',
          'Hazardous Waste Authorization (HWA)',
          'Plastic Waste Producer Responsibility Authorization',
          'Bio-Medical Waste Authorization',
        ],
        status: 'Active' as const,
        nodalOfficer: 'Dr. V. M. Motghare (Joint Director)',
        servicesOffered: [
          'Consent to Establish (CTE)',
          'Consent to Operate (CTO)',
          'Hazardous Waste Authorization',
        ],
        averageProcessingDays: 21,
        isActive: true,
      },
      {
        name: 'Directorate of Industrial Safety and Health (DISH)',
        code: 'DISH',
        description:
          'Enforces statutory occupational safety, health, and welfare standards across industrial units under the Factories Act, 1948 and Maharashtra Factories Rules, 1963.',
        website: 'https://dish.maharashtra.gov.in',
        contactEmail: 'dish.mumbai@maharashtra.gov.in',
        contactPhone: '+91 22 26572504',
        officeAddress: 'Kamgar Bhavan, 5th Floor, C-20, E-Block, Bandra Kurla Complex, Bandra (East), Mumbai - 400051',
        approvalTypes: [
          'Factory Plan Approval',
          'Factory License Registration',
          'Boiler Registration & Inspection',
          'Unfired Pressure Vessel Safety Endorsement',
        ],
        status: 'Active' as const,
        nodalOfficer: 'Chief Inspector of Factories (Maharashtra)',
        servicesOffered: ['Factory Plan Approval', 'Factory License Registration', 'Boiler Registration'],
        averageProcessingDays: 18,
        isActive: true,
      },
      {
        name: 'Directorate of Maharashtra Fire Services (DMFS)',
        code: 'DMFS',
        description:
          'State body empowered under the Maharashtra Fire Prevention and Life Safety Measures Act, 2006 to audit fire hazards, approve industrial firefighting layouts, and issue Fire Safety NOCs.',
        website: 'https://mahafireservice.gov.in',
        contactEmail: 'fireservices@maharashtra.gov.in',
        contactPhone: '+91 22 26677555',
        officeAddress: 'Maharashtra Fire Academy, Vidyanagari Marg, Kalina, Santacruz (East), Mumbai - 400098',
        approvalTypes: [
          'Provisional Fire NOC (Design Phase)',
          'Final Fire NOC (Commissioning Phase)',
          'Annual Fire Audit Compliance Certification (Form B)',
        ],
        status: 'Active' as const,
        nodalOfficer: 'Chief Fire Officer S. N. Raut',
        servicesOffered: ['Provisional Fire NOC', 'Final Fire NOC', 'Annual Fire Audit Review'],
        averageProcessingDays: 14,
        isActive: true,
      },
      {
        name: 'Maharashtra Industrial Development Corporation (MIDC)',
        code: 'MIDC',
        description:
          'Premier industrial development agency facilitating industrial land acquisition, building plan sanctioning, treated water supply networks, and drainage infrastructure.',
        website: 'https://midcindia.org',
        contactEmail: 'support@midcindia.org',
        contactPhone: '+91 22 26870052',
        officeAddress: 'Udyog Bhavan, Marol Industrial Area, Mahakali Caves Road, Andheri (East), Mumbai - 400093',
        approvalTypes: [
          'Industrial Plot Allotment & Lease Execution',
          'MIDC Special Planning Authority (SPA) Building Plan Sanction',
          'Industrial Water Connection Sanction',
          'Drainage & Common Effluent Treatment Plant (CETP) Discharge Permission',
        ],
        status: 'Active' as const,
        nodalOfficer: 'Chief Executive Officer (MIDC)',
        servicesOffered: ['Plot Allotment', 'Building Plan Sanction', 'Water Connection Sanction'],
        averageProcessingDays: 15,
        isActive: true,
      },
      {
        name: 'Office of the Labour Commissioner',
        code: 'LABOUR',
        description:
          'Governs industrial relations, workplace compliance, Contract Labour registration, and social security mandates across manufacturing units in Maharashtra.',
        website: 'https://mahakamgar.maharashtra.gov.in',
        contactEmail: 'labourcommissioner@maharashtra.gov.in',
        contactPhone: '+91 22 26572555',
        officeAddress: 'Kamgar Bhavan, C-20, E-Block, Bandra Kurla Complex, Mumbai - 400051',
        approvalTypes: [
          'Principal Employer Registration under Contract Labour Act',
          'Shop & Commercial Establishment (Gumasta) License',
          'Inter-State Migrant Workmen Registration',
          'Standing Orders Certification',
        ],
        status: 'Active' as const,
        nodalOfficer: 'Labour Commissioner (Maharashtra)',
        servicesOffered: ['Contract Labour Registration', 'Shop & Establishment License'],
        averageProcessingDays: 10,
        isActive: true,
      },
      {
        name: 'Maharashtra State Electricity Distribution Co. Ltd. (MSEDCL)',
        code: 'MSEDCL',
        description:
          'State power distribution utility responsible for industrial High Tension (HT) and Low Tension (LT) power feasibility clearances, dedicated substation approvals, and metering setup.',
        website: 'https://mahadiscom.in',
        contactEmail: 'customercare@mahadiscom.in',
        contactPhone: '+91 22 26474211',
        officeAddress: 'Prakashgad, Plot No. G-9, Prof. Anant Kanekar Marg, Bandra (East), Mumbai - 400051',
        approvalTypes: [
          'HT Industrial Power Load Feasibility Sanction',
          'LT Industrial Power Sanction',
          'Electrical Inspectorate Safety Clearance NOC',
        ],
        status: 'Active' as const,
        nodalOfficer: 'Chief Engineer (Commercial)',
        servicesOffered: ['HT Industrial Power Sanction', 'Electrical Safety Clearance'],
        averageProcessingDays: 20,
        isActive: true,
      },
      {
        name: 'Food and Drug Administration (FDA Maharashtra)',
        code: 'FDA',
        description:
          'Nodal regulatory authority enforcing the Food Safety and Standards Act (FSSAI) and Drugs & Cosmetics Act for pharmaceutical and food processing facilities.',
        website: 'https://fda.maharashtra.gov.in',
        contactEmail: 'comm.fda-mah@nic.in',
        contactPhone: '+91 22 26592204',
        officeAddress: 'Survey No. 341, Bandra Kurla Complex, Bandra (East), Mumbai - 400051',
        approvalTypes: [
          'Central / State FSSAI Food Manufacturing License',
          'Drug Manufacturing License (Form 25/28)',
          'WHO-GMP Certificate of Pharmaceutical Product (CoPP)',
        ],
        status: 'Active' as const,
        nodalOfficer: 'Commissioner (FDA Maharashtra)',
        servicesOffered: ['FSSAI Food License', 'Drug Manufacturing License'],
        averageProcessingDays: 25,
        isActive: true,
      },
    ];

    for (const d of departmentsData) {
      const existing = await Department.findOne({
        $or: [{ code: d.code }, { name: d.name }],
      });
      if (existing) {
        Object.assign(existing, d);
        await existing.save();
      } else {
        const newDept = new Department(d);
        await newDept.save();
      }
    }
    Logger.info(`✓ Seeded/Updated ${departmentsData.length} statutory departments.`);

    // 2. Seed Knowledge Categories
    const categoriesData = [
      {
        name: 'Environmental Clearances & Pollution Control',
        description:
          'Consent to Establish (CTE), Consent to Operate (CTO), Hazardous Waste, and Environmental Impact Assessment mandates.',
      },
      {
        name: 'Industrial Safety & Factory Licensing',
        description:
          'Occupational safety, factory plan sanctions, boiler certifications, and hazardous machinery guidelines.',
      },
      {
        name: 'Fire Prevention & Life Safety',
        description:
          'Provisional Fire NOC, Final Fire NOC, automatic sprinkler systems, and annual fire audits.',
      },
      {
        name: 'Land, Zoning & Infrastructure',
        description:
          'MIDC industrial plot allotment, zoning classifications, building plan sanctions, and utility rights-of-way.',
      },
      {
        name: 'Labour Welfare & Statutory Registers',
        description:
          'Contract Labour (R&A) Act, EPF/ESIC registrations, minimum wages, and workplace health standards.',
      },
      {
        name: 'Power & Utility Sanctions',
        description:
          'High-tension power loads, sub-stations, transformer clearances, and industrial water allocations.',
      },
      {
        name: 'Food Processing & Pharmaceuticals',
        description:
          'FSSAI food hygiene standards, drug manufacturing compliance, and GMP cleanliness validation.',
      },
    ];

    for (const cat of categoriesData) {
      await KnowledgeCategory.findOneAndUpdate({ name: cat.name }, cat, { upsert: true, new: true });
    }
    Logger.info(`✓ Seeded ${categoriesData.length} Knowledge Categories.`);

    // 3. Seed FAQs
    await FAQ.deleteMany({});
    const faqsData = [
      {
        question: 'What is the fundamental difference between MPCB CTE and CTO?',
        answer:
          'Consent to Establish (CTE) is mandatory BEFORE breaking ground or purchasing plant machinery, validating that your factory design complies with environmental standards. Consent to Operate (CTO) is applied after construction and trial run completion, certifying that pollution control equipment (ETP/STP/APCD) operates effectively before commercial production begins.',
        department: 'Maharashtra Pollution Control Board (MPCB)',
        category: 'Environmental Clearances & Pollution Control',
        keywords: ['CTE', 'CTO', 'MPCB', 'Consent to Establish', 'Consent to Operate', 'Pollution Control'],
      },
      {
        question: 'How are industries categorized into Red, Orange, Green, and White by MPCB?',
        answer:
          'Industries are classified based on the Pollution Index (PI) score formulated by CPCB: Red category (PI score 60 and above) representing heavily polluting units; Orange (PI score 41 to 59); Green (PI score 21 to 40); and White (PI score up to 20), which are virtually non-polluting and only require an online intimation without formal CTE.',
        department: 'Maharashtra Pollution Control Board (MPCB)',
        category: 'Environmental Clearances & Pollution Control',
        keywords: ['Red Category', 'Orange Category', 'Green Category', 'White Category', 'Pollution Index'],
      },
      {
        question: 'When is Factory Plan Approval required from DISH?',
        answer:
          'Under Section 6 of the Factories Act, 1948 and Rule 3 of Maharashtra Factories Rules, 1963, factory premises plan approval must be secured from the Directorate of Industrial Safety and Health (DISH) prior to commencing construction, plant layout alterations, or expansion of any manufacturing unit employing 10 or more workers with power, or 20 without power.',
        department: 'Directorate of Industrial Safety and Health (DISH)',
        category: 'Industrial Safety & Factory Licensing',
        keywords: ['DISH', 'Factory Plan Approval', 'Factories Act 1948', 'Plant Layout', 'Worker Safety'],
      },
      {
        question: 'What is the validity period of a Factory License in Maharashtra?',
        answer:
          'A factory license issued by DISH in Maharashtra can be granted or renewed for a duration of 1 year up to 10 consecutive calendar years, upon advance payment of the proportional statutory license fee based on installed horsepower and maximum workers employed.',
        department: 'Directorate of Industrial Safety and Health (DISH)',
        category: 'Industrial Safety & Factory Licensing',
        keywords: ['Factory License', 'Renewal', 'Validity', 'DISH', 'Horsepower'],
      },
      {
        question: 'What is the difference between Provisional Fire NOC and Final Fire NOC?',
        answer:
          'Provisional Fire NOC is issued by DMFS during the architectural planning stage based on proposed fire hydrant layouts, fire exits, and compartmentation drawings. Final Fire NOC is granted only after on-site physical commissioning and hydraulic pressure testing of the actual firefighting installation before building occupancy is permitted.',
        department: 'Directorate of Maharashtra Fire Services (DMFS)',
        category: 'Fire Prevention & Life Safety',
        keywords: ['Provisional Fire NOC', 'Final Fire NOC', 'DMFS', 'Commissioning', 'Fire Safety Audit'],
      },
      {
        question: 'Is an Annual Fire Safety Audit mandatory in Maharashtra?',
        answer:
          'Yes. Under Section 3(3) of the Maharashtra Fire Prevention and Life Safety Measures Act, 2006, the owner or occupier of an industrial building must submit a certificate in "Form B" issued by a licensed fire agency twice a year (in January and July) certifying that all firefighting installations remain in active working order.',
        department: 'Directorate of Maharashtra Fire Services (DMFS)',
        category: 'Fire Prevention & Life Safety',
        keywords: ['Form B', 'Annual Fire Audit', 'Licensed Agency', 'Fire Hydrant', 'Fire Extinguisher'],
      },
      {
        question: 'What documents are required to secure an MIDC Water Connection?',
        answer:
          'Key documents include: MIDC Plot Allotment Letter, Possession Receipt, Sanctioned Building Plan, MPCB Consent to Establish (CTE), plumbing layout drawings certified by a licensed plumber, and an estimate of daily industrial vs domestic water demand in Kilo Liters per Day (KLD).',
        department: 'Maharashtra Industrial Development Corporation (MIDC)',
        category: 'Land, Zoning & Infrastructure',
        keywords: ['MIDC', 'Water Connection', 'KLD', 'Allotment Letter', 'Plumbing Drawing'],
      },
      {
        question: 'When is a Principal Employer registration under Contract Labour Act required?',
        answer:
          'Under Section 7 of the Contract Labour (Regulation and Abolition) Act, 1970, any industrial establishment employing 50 or more contract workers on any single day in the preceding 12 months must register as a Principal Employer with the Office of the Labour Commissioner.',
        department: 'Office of the Labour Commissioner',
        category: 'Labour Welfare & Statutory Registers',
        keywords: ['Contract Labour', 'Principal Employer', 'Form I', 'Labour Department', 'Manpower'],
      },
      {
        question: 'What are the criteria for High Tension (HT) Industrial Power sanction?',
        answer:
          'For industrial power demands exceeding 100 kVA (or 107 HP) in Maharashtra, MSEDCL mandates High Tension (11 kV, 22 kV, or 33 kV) supply. The applicant must provide a dedicated indoor/outdoor transformer yard, HT vacuum circuit breaker (VCB), and safety clearance from the Electrical Inspectorate.',
        department: 'Maharashtra State Electricity Distribution Co. Ltd. (MSEDCL)',
        category: 'Power & Utility Sanctions',
        keywords: ['HT Power', 'MSEDCL', 'Transformer', 'Load Feasibility', 'Electrical Inspectorate'],
      },
      {
        question: 'When is a Central FSSAI Manufacturing License required versus a State License?',
        answer:
          'A Central FSSAI License is mandatory if the manufacturing capacity exceeds 2 Metric Tonnes per day (MT/day) for all food processing units, 10,000 liters/day for milk units, 50 MT/day for vegetable oil processing, or if the unit is operating in multiple states or 100% Export Oriented (EOU). Otherwise, a State FSSAI License applies.',
        department: 'Food and Drug Administration (FDA Maharashtra)',
        category: 'Food Processing & Pharmaceuticals',
        keywords: ['FSSAI', 'Central License', 'Food Processing', 'Agro Industry', 'FDA Maharashtra'],
      },
    ];

    const insertedFaqs = await FAQ.insertMany(faqsData);
    Logger.info(`✓ Seeded ${insertedFaqs.length} Regulatory FAQs.`);

    // Map FAQs by keyword for guide linking
    const faqMap = new Map<string, mongoose.Types.ObjectId>();
    insertedFaqs.forEach((f) => {
      f.keywords.forEach((k) => faqMap.set(k.toLowerCase(), f._id));
    });

    // 4. Seed Approval Guides
    await ApprovalGuide.deleteMany({});
    const guidesData = [
      {
        title: 'Consent to Establish (CTE) for Manufacturing Units',
        department: 'Maharashtra Pollution Control Board (MPCB)',
        industryTypes: [
          'Chemicals & Petrochemicals',
          'Pharmaceuticals & APIs',
          'Automotive & Engineering',
          'Textiles & Dyeing',
          'Renewable Energy & Biofuels',
          'Food Processing',
          'ALL',
        ],
        description:
          'Mandatory primary environmental clearance under Section 25 of the Water Act, 1974 and Section 21 of the Air Act, 1981 prior to installing manufacturing equipment, civil construction, or civil machinery.',
        requiredDocuments: [
          'Detailed Project Report (DPR) with Manufacturing Flowchart',
          'Industrial Plot Allotment Letter / MIDC Possession Receipt',
          'Layout Plan demarcating Effluent Treatment Plant (ETP) and STP',
          'Water Balance Diagram (Domestic, Industrial, Cooling, Boiler)',
          'Air Pollution Control Devices (APCD) Specifications (Bag filters, Scrubbers)',
          'CA Certificate verifying Capital Investment (Land, Building, Plant & Machinery)',
        ],
        eligibilityCriteria: [
          'Valid lease or ownership deed in recognized industrial zone or MIDC',
          'Compliance with CPCB emission norms and effluent discharge standards',
          'Adequate provision for Zero Liquid Discharge (ZLD) where applicable',
        ],
        estimatedTimeline: '21 to 45 working days',
        inspectionRequired: true,
        dependencies: [
          'MIDC Land Allotment Letter',
          'Environmental Impact Assessment (EIA) for Category A/B projects',
        ],
        renewalRequired: false,
        renewalFrequency: 'Valid for 5 years or until plant commissioning',
        faqIds: [
          faqMap.get('cte') || insertedFaqs[0]._id,
          faqMap.get('pollution index') || insertedFaqs[1]._id,
        ].filter(Boolean),
      },
      {
        title: 'Consent to Operate (CTO) & Hazardous Waste Authorization',
        department: 'Maharashtra Pollution Control Board (MPCB)',
        industryTypes: [
          'Chemicals & Petrochemicals',
          'Pharmaceuticals & APIs',
          'Automotive & Engineering',
          'Textiles & Dyeing',
          'Electronics & Semiconductors',
          'ALL',
        ],
        description:
          'Operational statutory license certifying that pollution control systems are fully commissioned, tested, and meeting prescribed standards before commercial production initiates.',
        requiredDocuments: [
          'Copy of valid Consent to Establish (CTE)',
          'Joint Inspection Report from MPCB Sub-Regional Officer',
          'Analysis Reports of Treated Effluent and Stack Emissions from MoEF Approved Lab',
          'Photographs and Technical Commissioning Certificate of ETP / STP / APCD',
          'Membership Certificate of Common Effluent Treatment Plant (CETP) & CHWTSDF',
          'Hazardous Waste Generation, Storage and Disposal Management Plan',
        ],
        eligibilityCriteria: [
          'Physical installation of all pollution control equipment outlined in CTE',
          'Valid membership with Common Hazardous Waste TSDF (e.g. MEPL Taloja/Ranjangaon)',
          'Online continuous emission/effluent monitoring system (OCEMS) for Red category',
        ],
        estimatedTimeline: '30 to 45 working days',
        inspectionRequired: true,
        dependencies: ['Consent to Establish (CTE)', 'Final Fire NOC'],
        renewalRequired: true,
        renewalFrequency: 'Every 5 Years (Red: 5 yrs, Orange: 10 yrs, Green: 15 yrs)',
        faqIds: [
          faqMap.get('cto') || insertedFaqs[0]._id,
          faqMap.get('hazardous waste') || insertedFaqs[4]._id,
        ].filter(Boolean),
      },
      {
        title: 'Factory Plan Approval & Factory License Registration',
        department: 'Directorate of Industrial Safety and Health (DISH)',
        industryTypes: [
          'Manufacturing & Heavy Engineering',
          'Automotive & Engineering',
          'Chemicals & Petrochemicals',
          'Textiles & Dyeing',
          'Food Processing',
          'Renewable Energy & Biofuels',
          'ALL',
        ],
        description:
          'Statutory approval of factory premises layout and licensing under Section 6 of Factories Act, 1948 ensuring worker occupational safety, ventilation, emergency egress, and machine guarding.',
        requiredDocuments: [
          'Form No. 1 (Application for approval of plans)',
          'Factory Layout Plans in Triplicate prepared by Qualified Architect',
          'Process Flow Diagram describing materials, by-products, and safety hazards',
          'List of Plant & Machinery with Installed Horsepower (HP)',
          'Maximum number of workers proposed in each shift (Male, Female, Contract)',
          'Building Safety & Stability Certificate from a Certified Structural Engineer',
        ],
        eligibilityCriteria: [
          'Clear minimum headroom of 4.25 meters in work halls',
          'Minimum 500 cubic feet of workspace per worker',
          'Distinct emergency fire exits opening outward without obstruction',
        ],
        estimatedTimeline: '15 to 30 working days',
        inspectionRequired: true,
        dependencies: ['MIDC Building Plan Approval', 'Provisional Fire NOC'],
        renewalRequired: true,
        renewalFrequency: 'Annual or Multi-year (1 to 10 Years)',
        faqIds: [
          faqMap.get('factory plan approval') || insertedFaqs[2]._id,
          faqMap.get('factory license') || insertedFaqs[3]._id,
        ].filter(Boolean),
      },
      {
        title: 'Directorate of Maharashtra Fire Services (DMFS) Final Fire NOC',
        department: 'Directorate of Maharashtra Fire Services (DMFS)',
        industryTypes: ['ALL'],
        description:
          'Mandatory fire safety certification under the Maharashtra Fire Prevention and Life Safety Measures Act, 2006 required before occupancy or operation of industrial buildings.',
        requiredDocuments: [
          'Copy of Provisional Fire NOC issued by DMFS / Local Fire Authority',
          'As-Built Architectural Drawings showing actual fire hydrant, hose reel, and sprinkler positions',
          'Licensed Agency Certificate verifying installation of fire protection systems',
          'Underground and Overhead Fire Water Tank Capacity Proof (Hydraulic calculations)',
          'Fire Alarm, Smoke Detector, and Emergency Public Address System test report',
        ],
        eligibilityCriteria: [
          '6-meter unobstructed all-around vehicular driveway for fire tender movement',
          'Dedicated fire pump house with diesel generator backup',
          'Compliant emergency staircase width and exit illumination',
        ],
        estimatedTimeline: '14 to 21 working days',
        inspectionRequired: true,
        dependencies: ['Provisional Fire NOC', 'Building Completion Certificate'],
        renewalRequired: true,
        renewalFrequency: 'Biannual (Form B submission every 6 Months in Jan & July)',
        faqIds: [
          faqMap.get('provisional fire noc') || insertedFaqs[4]._id,
          faqMap.get('form b') || insertedFaqs[5]._id,
        ].filter(Boolean),
      },
      {
        title: 'MIDC Industrial Water Connection Sanction',
        department: 'Maharashtra Industrial Development Corporation (MIDC)',
        industryTypes: ['ALL'],
        description:
          'Statutory approval and execution of piped industrial and domestic water supply pipeline connection within notified MIDC industrial areas.',
        requiredDocuments: [
          'MIDC Plot Allotment Letter & Lease Deed',
          'Sanctioned Building Plan',
          'MPCB Consent to Establish (CTE) copy showing authorized water consumption',
          'Internal Plumbing & Piping Layout certified by Licensed Plumber',
          'Water Requirement calculation sheet (Domestic, Industrial Process, Boiler feed)',
        ],
        eligibilityCriteria: [
          'Plot must be situated within an active MIDC industrial water distribution network',
          'Installation of MIDC-approved automated electromagnetic water meter',
        ],
        estimatedTimeline: '10 to 15 working days',
        inspectionRequired: true,
        dependencies: ['MIDC Land Allotment', 'MPCB Consent to Establish (CTE)'],
        renewalRequired: false,
        renewalFrequency: 'Not Required (Continuous monthly billing)',
        faqIds: [faqMap.get('midc') || insertedFaqs[6]._id].filter(Boolean),
      },
      {
        title: 'Contract Labour Principal Employer Registration (RC)',
        department: 'Office of the Labour Commissioner',
        industryTypes: ['ALL'],
        description:
          'Registration Certificate under Section 7 of the Contract Labour (Regulation and Abolition) Act, 1970 for establishments deploying 50 or more outsourced contractor personnel.',
        requiredDocuments: [
          'Form I (Application for Registration of Establishment)',
          'List of Contractors with nature of work, duration, and maximum contract labour count',
          'Copy of Incorporation Certificate / Partnership Deed',
          'Treasury Challan receipt for statutory government registration fee',
          'Identity Proof and Residential Address of Occupier / Directors',
        ],
        eligibilityCriteria: [
          'Industrial unit employing 50 or more contract workers on any single working day',
          'Compliance with minimum wage, EPF, and ESIC provisions for contract workmen',
        ],
        estimatedTimeline: '7 to 15 working days',
        inspectionRequired: false,
        dependencies: ['Factory License / Shop & Establishment Registration'],
        renewalRequired: false,
        renewalFrequency: 'Permanent (Amendment required if worker count exceeds registered bracket)',
        faqIds: [faqMap.get('contract labour') || insertedFaqs[7]._id].filter(Boolean),
      },
      {
        title: 'High Tension (HT) Industrial Power Feasibility & Sanction',
        department: 'Maharashtra State Electricity Distribution Co. Ltd. (MSEDCL)',
        industryTypes: [
          'Manufacturing & Heavy Engineering',
          'Chemicals & Petrochemicals',
          'Automotive & Engineering',
          'Data Centers & IT Parks',
          'Textiles & Dyeing',
          'ALL',
        ],
        description:
          'Clearance and connection agreement for industrial loads exceeding 100 kVA connecting to 11 kV, 22 kV, or 33 kV distribution lines with dedicated transformer bay.',
        requiredDocuments: [
          'Application Form A1 for HT Industrial Power Supply',
          'MIDC Land Possession Receipt & Sanctioned Layout',
          'Substation / Transformer Yard Civil Layout Plan',
          'Single Line Diagram (SLD) prepared by Chartered Electrical Engineer',
          'Electrical Inspectorate (Govt of Maharashtra) Statutory Clearance Certificate',
        ],
        eligibilityCriteria: [
          'Contract demand of 100 kVA or greater',
          'Compliance with Central Electricity Authority (CEA) Safety Regulations',
          'Adequate capacitor bank installation maintaining Power Factor above 0.95',
        ],
        estimatedTimeline: '20 to 35 working days',
        inspectionRequired: true,
        dependencies: ['Land Allotment', 'Electrical Inspectorate Safety NOC'],
        renewalRequired: false,
        renewalFrequency: 'Not Required (Continuous billing with periodic meter testing)',
        faqIds: [faqMap.get('ht power') || insertedFaqs[8]._id].filter(Boolean),
      },
      {
        title: 'FSSAI Central / State Manufacturing License',
        department: 'Food and Drug Administration (FDA Maharashtra)',
        industryTypes: ['Food Processing', 'Agro-Commodities & Beverages', 'Cold Chain & Warehousing'],
        description:
          'Statutory food safety license under Section 31 of the Food Safety and Standards Act, 2006 validating Good Manufacturing Practices (GMP) and hazard analysis.',
        requiredDocuments: [
          'Form B duly completed and signed by authorized signatory',
          'Blueprint / Layout plan of the processing unit showing dimensions and operational areas',
          'List of Directors / Partners with address and contact details',
          'Name and list of equipment and machinery along with number, installed capacity and HP',
          'Analysis report of water to be used in processing from a recognized/public health lab',
          'Food Safety Management System (FSMS) plan or ISO 22000 certificate',
        ],
        eligibilityCriteria: [
          'Strict adherence to Schedule 4 sanitary and hygienic requirements',
          'Certified Food Safety Supervisor on payroll for every shift',
        ],
        estimatedTimeline: '25 to 40 working days',
        inspectionRequired: true,
        dependencies: ['MPCB Consent to Establish (CTE)', 'NOC from Local Authority / MIDC'],
        renewalRequired: true,
        renewalFrequency: 'Every 1 to 5 Years',
        faqIds: [faqMap.get('fssai') || insertedFaqs[9]._id].filter(Boolean),
      },
    ];

    const insertedGuides = await ApprovalGuide.insertMany(guidesData);
    Logger.info(`✓ Seeded ${insertedGuides.length} Comprehensive Approval Guides.`);

    // 5. Seed Statutory Regulations
    await Regulation.deleteMany({});
    const regulationsData = [
      {
        title: 'Water Pollution Control and Industrial Effluent Discharge Mandates',
        actName: 'Water (Prevention and Control of Pollution) Act, 1974',
        ruleNumber: 'Section 25 and Section 26',
        summary:
          'Prohibits any person or industrial unit from bringing into use any new or altered outlet for the discharge of sewage or trade effluent into a stream, well, or sewer without the prior consent of the State Pollution Control Board. Prescribes mandatory effluent treatment systems (ETP) and discharge parameter thresholds.',
        applicableIndustries: [
          'Chemicals & Petrochemicals',
          'Pharmaceuticals & APIs',
          'Textiles & Dyeing',
          'Food Processing',
          'Automotive & Engineering',
          'ALL',
        ],
        department: 'Maharashtra Pollution Control Board (MPCB)',
        effectiveDate: new Date('1974-03-23'),
        referenceUrl: 'https://mpcb.gov.in/sites/default/files/wateract1974.pdf',
      },
      {
        title: 'Air Pollution Control and Chimney Stack Emission Standards',
        actName: 'Air (Prevention and Control of Pollution) Act, 1981',
        ruleNumber: 'Section 21',
        summary:
          'Mandates that no person shall, without the previous consent of the State Board, operate any industrial plant in an air pollution control area. Requires installation of control equipment including cyclones, bag filters, and electrostatic precipitators, plus regular emission stack testing.',
        applicableIndustries: [
          'Manufacturing & Heavy Engineering',
          'Chemicals & Petrochemicals',
          'Thermal Power & Boilers',
          'Automotive & Engineering',
          'ALL',
        ],
        department: 'Maharashtra Pollution Control Board (MPCB)',
        effectiveDate: new Date('1981-03-29'),
        referenceUrl: 'https://mpcb.gov.in/sites/default/files/airact1981.pdf',
      },
      {
        title: 'Hazardous Waste Storage, Handling and Manifest Management',
        actName: 'Hazardous and Other Wastes (Management and Transboundary Movement) Rules, 2016',
        ruleNumber: 'Rule 6, Rule 9 and Schedule I/II',
        summary:
          'Directs industrial occupiers generating hazardous waste to obtain authorization from the SPCB, store waste for a maximum of 90 days in leak-proof containers, and transfer waste solely to authorized Common Treatment Storage and Disposal Facilities (TSDF) utilizing the 7-copy Form 10 Manifest system.',
        applicableIndustries: [
          'Chemicals & Petrochemicals',
          'Pharmaceuticals & APIs',
          'Automotive & Engineering',
          'Electronics & Semiconductors',
          'ALL',
        ],
        department: 'Maharashtra Pollution Control Board (MPCB)',
        effectiveDate: new Date('2016-04-04'),
        referenceUrl: 'https://cpcb.nic.in/displaypdf.php?id=aHdyLzIwMTYucGRm',
      },
      {
        title: 'Factory Construction, Plant Layout, and Machine Safety Standards',
        actName: 'The Factories Act, 1948 & Maharashtra Factories Rules, 1963',
        ruleNumber: 'Section 6, Section 7, Section 21 and Rule 3',
        summary:
          'Statutory mandate compelling all manufacturing premises employing 10 or more workers with power (or 20 without power) to obtain prior approval for plant layouts, ensure safety guarding on all dangerous moving machinery, provide emergency escapes, adequate ventilation, and certified occupational health checkups.',
        applicableIndustries: ['ALL'],
        department: 'Directorate of Industrial Safety and Health (DISH)',
        effectiveDate: new Date('1948-09-23'),
        referenceUrl: 'https://dish.maharashtra.gov.in/acts-rules',
      },
      {
        title: 'Fire Prevention, Escape Means, and Biannual Safety Audits',
        actName: 'Maharashtra Fire Prevention and Life Safety Measures Act, 2006',
        ruleNumber: 'Section 3, Section 8 and Schedule I',
        summary:
          'Imposes obligation on factory owners to implement adequate fire prevention and protection systems (fire hydrants, automatic sprinklers, smoke alarms) as per the National Building Code (NBC) Part IV, secure Final Fire NOC before occupancy, and furnish a Form B maintenance certificate every 6 months.',
        applicableIndustries: ['ALL'],
        department: 'Directorate of Maharashtra Fire Services (DMFS)',
        effectiveDate: new Date('2006-12-06'),
        referenceUrl: 'https://mahafireservice.gov.in/act-rules.php',
      },
      {
        title: 'Contract Labour Licensing and Principal Employer Welfare Obligations',
        actName: 'Contract Labour (Regulation and Abolition) Act, 1970',
        ruleNumber: 'Section 7 and Section 12',
        summary:
          'Requires principal employers deploying 50 or more contract workmen to register their establishment with the licensing officer and ensure contractors provide statutory basic amenities including clean drinking water, first-aid, rest rooms, and timely wage disbursement.',
        applicableIndustries: ['ALL'],
        department: 'Office of the Labour Commissioner',
        effectiveDate: new Date('1970-09-05'),
        referenceUrl: 'https://mahakamgar.maharashtra.gov.in/contract-labour-act',
      },
      {
        title: 'Groundwater Abstraction Regulations and Flowmeter Telemetry Rules',
        actName: 'Central Ground Water Authority (CGWA) Guidelines, 2020',
        ruleNumber: 'Regulation 4 and Regulation 6',
        summary:
          'Mandates all industrial units abstracting groundwater in classified semi-critical, critical, or over-exploited blocks to obtain CGWA NOC, install digital telemetry flow meters, submit annual groundwater audits, and implement mandatory rainwater harvesting systems with recharge shafts.',
        applicableIndustries: [
          'Beverages & Distilleries',
          'Food Processing',
          'Chemicals & Petrochemicals',
          'Textiles & Dyeing',
          'ALL',
        ],
        department: 'Maharashtra Industrial Development Corporation (MIDC)',
        effectiveDate: new Date('2020-09-24'),
        referenceUrl: 'https://cgwa-noc.gov.in/LandingPage/Guideline.htm',
      },
      {
        title: 'Industrial Food Safety and Good Hygienic Practices (GHP)',
        actName: 'Food Safety and Standards Act, 2006 & Regulations, 2011',
        ruleNumber: 'Section 31 and Schedule 4',
        summary:
          'Establishes unified legal framework governing manufacturing, packaging, testing, and distribution of food products. Directs units to implement HACCP (Hazard Analysis Critical Control Point), water quality testing (IS 10500 standard), and periodic pest control verification.',
        applicableIndustries: ['Food Processing', 'Agro-Commodities & Beverages'],
        department: 'Food and Drug Administration (FDA Maharashtra)',
        effectiveDate: new Date('2011-08-05'),
        referenceUrl: 'https://www.fssai.gov.in/cms/food-safety-and-standards-act-2006.php',
      },
    ];

    const insertedRegulations = await Regulation.insertMany(regulationsData);
    Logger.info(`✓ Seeded ${insertedRegulations.length} Statutory Regulations.`);

    Logger.info('🎉 Regulatory Knowledge Engine seeding completed successfully!');
  } catch (error: any) {
    Logger.error(`Failed to seed Regulatory Knowledge Engine: ${error.message}`);
    throw error;
  }
};

if (require.main === module) {
  seedKnowledge()
    .then(() => {
      mongoose.disconnect();
      process.exit(0);
    })
    .catch(() => {
      mongoose.disconnect();
      process.exit(1);
    });
}

export default seedKnowledge;
