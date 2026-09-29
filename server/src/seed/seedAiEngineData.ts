import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Industry } from '../models/Industry';
import { Rule } from '../models/Rule';
import { StatutoryApproval } from '../models/StatutoryApproval';
import { DocumentMaster } from '../models/DocumentMaster';
import { Department } from '../models/Department';
import { Scheme } from '../models/Scheme';
import { Logger } from '../utils/logger';

dotenv.config();

export const seedAiEngineData = async (): Promise<void> => {
  try {
    Logger.info('Seeding AI Regulatory Intelligence Engine collections (industries, rules, approvals, documents, schemes)...');

    // 1. Seed Industries
    const industriesData = [
      {
        name: 'Food Processing',
        code: 'IND-FOOD',
        sector: 'Agro & Food Processing',
        pollutionCategory: 'Orange' as const,
        riskLevel: 'Medium' as const,
        description: 'Commercial manufacturing, canning, preservation, packaging, and processing of food items, dairy, and agricultural commodities.',
        manufacturingProcesses: [
          'Raw Material Grading & Sorting',
          'Washing & Blanching',
          'Thermal Pasteurization / Sterilization',
          'Aseptic Packaging & Sealing',
          'Effluent Pre-treatment & Cold Storage',
        ],
        typicalWaterRequirement: 35,
        typicalPowerRequirement: 250,
        mandatoryApprovals: [
          'FSSAI Manufacturing License',
          'MPCB Consent to Establish (CTE)',
          'DISH Factory Plan Approval & License',
          'DMFS Provisional & Final Fire NOC',
          'Legal Metrology Packaged Commodities Registration',
        ],
        commonDocuments: [
          'FSSAI Form B Layout & FSMS Plan',
          'Water Potability Lab Report',
          'Architectural Factory Layout Plans',
          'Effluent Treatment Plant (ETP) Scheme',
          'List of Plant & Machinery with HP',
        ],
        applicableSchemes: [
          'Package Scheme of Incentives (PSI 2019)',
          'PM Formalisation of Micro food processing Enterprises (PMFME)',
          'Maharashtra Agro-Industrial Policy Subsidy',
        ],
      },
      {
        name: 'Chemicals & Petrochemicals',
        code: 'IND-CHEM',
        sector: 'Chemicals, Specialty Polymers & Petrochemicals',
        pollutionCategory: 'Red' as const,
        riskLevel: 'Critical' as const,
        description: 'Synthesis, compounding, distillation, and formulation of industrial chemicals, specialty solvents, paints, and petrochemical derivatives.',
        manufacturingProcesses: [
          'Raw Chemical Batch Reaction & Distillation',
          'Fractionation & Evaporation',
          'Solvent Recovery & Thermal Condensation',
          'Scrubbing of Acidic Stack Gases',
          'Hazardous Effluent Neutralization & TSDF Transfer',
        ],
        typicalWaterRequirement: 200,
        typicalPowerRequirement: 1200,
        mandatoryApprovals: [
          'Environmental Clearance (EC) from SEIAA / MoEFCC',
          'MPCB Consent to Establish (Red Category CTE)',
          'PESO Solvent / Chemical Storage License',
          'DISH Major Accident Hazard (MAH) Site & Factory Plan Approval',
          'Common Hazardous Waste TSDF Membership Authorization',
          'Industrial Boiler & Pressure Vessel Registration',
          'DMFS Hazardous Fire NOC & Hydrant Clearance',
        ],
        commonDocuments: [
          'Environmental Impact Assessment (EIA) Report',
          'Disaster Management Plan (DMP) & On-Site Emergency Plan',
          'PESO Tank Farm Layout & Safety Distance Certificate',
          'Effluent Treatment Plant Design & Zero Liquid Discharge (ZLD) Plan',
          'Hazardous Waste Manifest & TSDF Agreement',
        ],
        applicableSchemes: [
          'Package Scheme of Incentives (PSI 2019) Mega Project Scheme',
          'PCPIR Infrastructure Incentive Scheme',
        ],
      },
      {
        name: 'Textiles & Dyeing',
        code: 'IND-TEXTILE',
        sector: 'Textiles, Apparel & Wet Processing',
        pollutionCategory: 'Red' as const,
        riskLevel: 'High' as const,
        description: 'Spinning, weaving, wet processing, scouring, bleaching, dyeing, and printing of natural and synthetic textiles.',
        manufacturingProcesses: [
          'Yarn Sizing & Weaving / Knitting',
          'Scouring, Desizing & Bleaching',
          'High Temperature Dyeing & Color Fixation',
          'Washing, Stentering & Chemical Finishing',
          'Common Effluent Treatment (CETP) Discharge & Reverse Osmosis',
        ],
        typicalWaterRequirement: 350,
        typicalPowerRequirement: 800,
        mandatoryApprovals: [
          'MPCB Consent to Establish (CTE - Red Category)',
          'CETP Membership & Effluent Discharge Allotment',
          'DISH Textile Factory Plan Approval & Machinery Safety',
          'Ground Water Extraction Clearance (CGWA / GSDA)',
          'DMFS Fire Safety NOC for Textile Storage',
          'Textile Commissioner Registration & TUFS Verification',
        ],
        commonDocuments: [
          'CETP Membership Certificate & Conduit Connection Allotment',
          'Water Balance Diagram & Multi-Effect Evaporator (MEE) Layout',
          'Architectural Factory Layout & Egress Plans',
          'Boiler Specification & Emission Stack Height Calculation',
        ],
        applicableSchemes: [
          'Maharashtra Textile Policy 2023-28 (Power Tariff Subsidy & Capital Grant)',
          'Amended Technology Upgradation Fund Scheme (ATUFS)',
          'Package Scheme of Incentives (PSI 2019)',
        ],
      },
      {
        name: 'Electronics & Hardware',
        code: 'IND-ELEC',
        sector: 'Electronics System Design & Manufacturing (ESDM)',
        pollutionCategory: 'Orange' as const,
        riskLevel: 'Medium' as const,
        description: 'Fabrication of printed circuit boards (PCBs), electronic component assembly, semiconductor packaging, testing, and consumer hardware manufacturing.',
        manufacturingProcesses: [
          'Surface Mount Technology (SMT) Assembly',
          'Wave Soldering & Conformal Coating',
          'Laser Trimming & Testing',
          'Cleanroom Assembly & Burn-in Chamber Testing',
          'E-Waste Segregation & Recycler Handover',
        ],
        typicalWaterRequirement: 15,
        typicalPowerRequirement: 400,
        mandatoryApprovals: [
          'MPCB Consent to Establish (Green/Orange CTE)',
          'E-Waste Producer Responsibility Authorization (EPR)',
          'BIS Compulsory Registration Scheme (CRS) Certification',
          'DISH Cleanroom & Assembly Layout Approval',
          'DMFS Clean Agent Electrical Fire NOC',
        ],
        commonDocuments: [
          'SMT Line Machinery Layout & Static Dissipation Scheme',
          'E-Waste Disposal Tie-up Agreement with Authorized Dismantler',
          'BIS Compliance Test Reports',
          'Factory Plan Blueprints in Triplicate',
        ],
        applicableSchemes: [
          'Maharashtra Electronic Policy ESDM Capital Subsidy',
          'Scheme for Promotion of Manufacturing of Electronic Components and Semiconductors (SPECS)',
          'Package Scheme of Incentives (PSI 2019)',
        ],
      },
      {
        name: 'Warehousing & Logistics',
        code: 'IND-LOGISTICS',
        sector: 'Logistics, Warehousing & Supply Chain',
        pollutionCategory: 'Green' as const,
        riskLevel: 'Low' as const,
        description: 'Large-scale automated industrial warehousing, fulfillment centres, bulk raw material storage, and temperature-controlled cold logistics.',
        manufacturingProcesses: [
          'Inbound Consignment Receipt & Quality Inspection',
          'Automated Pallet Racking & High-bay Storage',
          'Order Picking, Kitting & Shrink Wrapping',
          'Cross-docking & Outbound Fleet Dispatch',
        ],
        typicalWaterRequirement: 10,
        typicalPowerRequirement: 150,
        mandatoryApprovals: [
          'MIDC / Local Planning Authority Building Plan Sanction',
          'DMFS High-Hazard Warehouse Fire NOC & Sprinkler Approval',
          'MPCB Green/White Category Siting Clearance',
          'Labour Department Shops & Commercial Establishments Registration',
          'Legal Metrology Weighbridge Certification',
        ],
        commonDocuments: [
          'Warehouse Master Plan & Truck Maneuvering Circulation Drawing',
          'Hydrant, Hose Reel & ESFR Sprinkler Network Layout',
          'Structural Stability Certificate for Heavy Storage Racks',
          'Title Verification & MIDC Plot Lease Deed',
        ],
        applicableSchemes: [
          'Maharashtra Logistics Policy 2024 (Incentives for Logistics Parks)',
          'Package Scheme of Incentives (PSI 2019)',
        ],
      },
      {
        name: 'Renewable Energy & Biofuels',
        code: 'IND-ENERGY',
        sector: 'Clean Energy & Biofuels',
        pollutionCategory: 'Orange' as const,
        riskLevel: 'High' as const,
        description: 'Biomass gasification, bio-ethanol production from agro residues, solar PV generation, and green hydrogen synthesis.',
        manufacturingProcesses: [
          'Feedstock Crushing, Hydrolysis & Fermentation',
          'Distillation & Molecular Sieve Dehydration',
          'Ethanol Denaturing & Tank Farm Storage',
          'High Pressure Boiler Co-generation & Power Evacuation',
          'Biomethanation & Spent Wash Treatment',
        ],
        typicalWaterRequirement: 300,
        typicalPowerRequirement: 1500,
        mandatoryApprovals: [
          'MEDA Grid Connectivity Recommendation',
          'MSEDCL / MSETCL Grid Interconnection & Power Evacuation Sanction',
          'MPCB Consent to Establish (CTE)',
          'PESO Bio-Ethanol Storage & Denaturing License',
          'DISH Boiler & Distillation Column Inspection Approval',
          'DMFS Class A/B Solvent Fire Safety NOC',
        ],
        commonDocuments: [
          'Grid Feasibility Study & Single Line Diagram (SLD)',
          'Process Safety & Flare System Blueprint',
          'Spent Wash Incineration & Zero Liquid Discharge Plan',
          'PESO Layout & Distance Matrix',
        ],
        applicableSchemes: [
          'National Biofuel Policy Incentive & Maharashtra State Grant',
          'MSEDCL Renewable Feed-in Tariff & Open Access Waivers',
          'Package Scheme of Incentives (PSI 2019)',
        ],
      },
      {
        name: 'Automotive & Engineering',
        code: 'IND-AUTO',
        sector: 'Automotive, Precision Engineering & Machining',
        pollutionCategory: 'Orange' as const,
        riskLevel: 'Medium' as const,
        description: 'Automobile component manufacturing, sheet metal pressing, precision CNC machining, powder coating, and robotic assembly.',
        manufacturingProcesses: [
          'CNC Turning, Milling & Grinding',
          'Degreasing, Phosphating & Powder Coating',
          'Robotic MIG/TIG Spot Welding',
          'Paint Shop Curing & Assembly Line Testing',
          'Coolant Recycling & Paint Sludge Solidification',
        ],
        typicalWaterRequirement: 50,
        typicalPowerRequirement: 650,
        mandatoryApprovals: [
          'MPCB Consent to Establish (Orange Category)',
          'DISH Factory Layout Approval & Crane/Hoist Testing',
          'DMFS Fire NOC for Paint Booth & Welding Bay',
          'MSEDCL High Tension (HT) Power Sanction',
          'Hazardous Waste (Paint Sludge / Spent Oil) TSDF Authorization',
        ],
        commonDocuments: [
          'Paint Booth Extraction System & Stack Height Drawing',
          'Factory Layout with Machinery Guarding Specifications',
          'Structural Load Certificate for EOT Cranes',
          'Hazardous Waste Disposal Agreement',
        ],
        applicableSchemes: [
          'Automotive Mission Plan Capital Subsidies',
          'Package Scheme of Incentives (PSI 2019) Anchor Unit Benefits',
        ],
      },
    ];

    for (const ind of industriesData) {
      await Industry.findOneAndUpdate({ code: ind.code }, ind, { upsert: true, new: true });
    }
    Logger.info(`✓ Seeded ${industriesData.length} Industrial Sectors.`);

    // 2. Seed Statutory Approvals (Collection: approvals)
    const statutoryApprovalsData = [
      // MPCB
      {
        approvalName: 'Consent to Establish (CTE) - Red Category',
        department: 'Maharashtra Pollution Control Board (MPCB)',
        industry: ['Chemicals & Petrochemicals', 'Textiles & Dyeing'],
        conditions: [
          'Unit categorized under Central Pollution Control Board (CPCB) Red Category list',
          'Effluent discharge > 10 KLD or air emission stack present',
        ],
        requiredDocuments: [
          'Environmental Management Plan (EMP) & EIA Report',
          'Effluent Treatment Plant (ETP) / ZLD Flow Scheme',
          'Air Pollution Control Devices (APCD) Engineering Blueprint',
          'MIDC Land Allotment Letter / 7/12 Land Title Extract',
          'Water Balance Diagram & Daily Water Sanction Letter',
        ],
        timeline: 45,
        riskLevel: 'Critical' as const,
        priority: 'Critical' as const,
        description: 'Mandatory statutory prior environmental clearance under Section 25 of Water Act 1974 and Section 21 of Air Act 1981 prior to starting any on-site civil construction.',
        stage: 'Pre-Construction' as const,
        inspectionRequired: true,
        issuingAuthority: 'MPCB Member Secretary / Regional Officer',
        validityYears: 5,
        isActive: true,
      },
      {
        approvalName: 'Consent to Establish (CTE) - Orange Category',
        department: 'Maharashtra Pollution Control Board (MPCB)',
        industry: ['Food Processing', 'Electronics & Hardware', 'Automotive & Engineering', 'Renewable Energy & Biofuels'],
        conditions: [
          'Unit categorized under CPCB Orange Category list with moderate environmental footprint',
        ],
        requiredDocuments: [
          'Manufacturing Process Flowchart & Material Balance',
          'Design of Wastewater Treatment / Sewage Treatment Plant',
          'Chimney / Exhaust Stack Elevation Drawing',
          'MIDC Plot Possession Receipt',
        ],
        timeline: 30,
        riskLevel: 'High' as const,
        priority: 'High' as const,
        description: 'Statutory consent for medium-polluting units verifying adequate effluent and emission control provisions.',
        stage: 'Pre-Construction' as const,
        inspectionRequired: true,
        issuingAuthority: 'MPCB Sub-Regional Officer',
        validityYears: 5,
        isActive: true,
      },
      {
        approvalName: 'Consent to Operate (CTO)',
        department: 'Maharashtra Pollution Control Board (MPCB)',
        industry: ['ALL'],
        conditions: [
          'Completion of factory construction and commissioning of pollution abatement systems',
          'Possession of valid prior Consent to Establish (CTE)',
        ],
        requiredDocuments: [
          'Copy of valid Consent to Establish (CTE)',
          'ETP / STP Commissioning Certificate by Chartered Engineer',
          'Emission & Effluent Testing Report from MoEF Approved Lab',
          'Capital Investment CA Certificate on Fixed Assets',
        ],
        timeline: 30,
        riskLevel: 'High' as const,
        priority: 'High' as const,
        description: 'Mandatory operational clearance certifying that environmental control equipment meets statutory standards before commercial output begins.',
        stage: 'Operational' as const,
        inspectionRequired: true,
        issuingAuthority: 'MPCB Regional Officer',
        validityYears: 5,
        isActive: true,
      },
      {
        approvalName: 'Hazardous Waste Authorization (HWA)',
        department: 'Maharashtra Pollution Control Board (MPCB)',
        industry: ['Chemicals & Petrochemicals', 'Textiles & Dyeing', 'Automotive & Engineering', 'Electronics & Hardware'],
        conditions: [
          'Generation of hazardous wastes specified in Schedule I / II of Hazardous Waste Rules 2016',
        ],
        requiredDocuments: [
          'Membership Certificate with Common Hazardous Waste TSDF (e.g. MEPL)',
          'Hazardous Waste Generation, Storage and Handling Protocol',
          'Layout showing dedicated, bunded Hazardous Waste Storage Shed',
        ],
        timeline: 21,
        riskLevel: 'High' as const,
        priority: 'High' as const,
        description: 'Statutory authorization for safe storage, handling, and transport of chemical sludge, spent solvents, and toxic residues.',
        stage: 'Operational' as const,
        inspectionRequired: true,
        issuingAuthority: 'MPCB Regional Officer',
        validityYears: 5,
        isActive: true,
      },

      // DISH
      {
        approvalName: 'Factory Plan Approval',
        department: 'Directorate of Industrial Safety and Health (DISH)',
        industry: ['ALL'],
        conditions: [
          'Manufacturing facility employing 10 or more workers with power or 20 without power',
        ],
        requiredDocuments: [
          'Form No. 1 Application for Approval of Factory Plans',
          'Architectural Layout Plans in Triplicate showing machine spacing',
          'Ventilation & Lighting Calculation Sheet',
          'Process Flow Diagram indicating fire/safety hazards and safety showers',
        ],
        timeline: 20,
        riskLevel: 'High' as const,
        priority: 'Critical' as const,
        description: 'Statutory review under Section 6 of Factories Act 1948 ensuring worker occupational safety, emergency egress, and machine guarding.',
        stage: 'Pre-Construction' as const,
        inspectionRequired: false,
        issuingAuthority: 'Joint Director DISH',
        validityYears: 10,
        isActive: true,
      },
      {
        approvalName: 'Factory License Registration',
        department: 'Directorate of Industrial Safety and Health (DISH)',
        industry: ['ALL'],
        conditions: [
          'Factory building constructed in adherence to approved Form 1 layout plan',
          'Installation of plant machinery and electrical installations complete',
        ],
        requiredDocuments: [
          'Form No. 2 (Application for Registration & Grant of License)',
          'Notice of Occupation (Form No. 3)',
          'Stability Certificate (Form 1A) issued by certified Structural Engineer',
          'Copy of approved Factory Layout Plans',
          'Treasury Challan for License Fee based on HP and worker count',
        ],
        timeline: 15,
        riskLevel: 'High' as const,
        priority: 'High' as const,
        description: 'Statutory license authorizing commencement of manufacturing operations with full worker welfare safeguards.',
        stage: 'Operational' as const,
        inspectionRequired: true,
        issuingAuthority: 'Inspector of Factories (DISH)',
        validityYears: 5,
        isActive: true,
      },

      // DMFS
      {
        approvalName: 'Provisional Fire NOC',
        department: 'Directorate of Maharashtra Fire Services (DMFS)',
        industry: ['ALL'],
        conditions: [
          'Any industrial, storage or hazardous factory construction in Maharashtra',
        ],
        requiredDocuments: [
          'Site Layout Plan showing 6-meter peripheral fire engine access driveway',
          'Building Elevation & Section Drawings showing emergency staircases',
          'Schematic Fire Hydrant & Water Reservoir Layout',
          'MIDC / Local Authority Plan Submission Copy',
        ],
        timeline: 15,
        riskLevel: 'High' as const,
        priority: 'Critical' as const,
        description: 'Statutory fire prevention layout clearance under Maharashtra Fire Prevention and Life Safety Measures Act 2006.',
        stage: 'Pre-Construction' as const,
        inspectionRequired: false,
        issuingAuthority: 'Chief Fire Officer / DMFS',
        validityYears: 1,
        isActive: true,
      },
      {
        approvalName: 'Final Fire NOC & Commissioning Compliance',
        department: 'Directorate of Maharashtra Fire Services (DMFS)',
        industry: ['ALL'],
        conditions: [
          'Completion of physical fire fighting installation (hydrants, sprinklers, alarms, underground static tank)',
        ],
        requiredDocuments: [
          'Copy of Provisional Fire NOC',
          'Form A Certificate from Licensed Fire Agency',
          'Photographs of installed Fire Pumps, Hydrant Ring and Risers',
          'Water Storage Tank Capacity Certification',
        ],
        timeline: 12,
        riskLevel: 'High' as const,
        priority: 'High' as const,
        description: 'Statutory on-site commissioning inspection clearance required prior to occupancy of industrial structures.',
        stage: 'Operational' as const,
        inspectionRequired: true,
        issuingAuthority: 'Divisional Fire Officer',
        validityYears: 1,
        isActive: true,
      },

      // MIDC
      {
        approvalName: 'Building Plan Sanction & Development Permission',
        department: 'Maharashtra Industrial Development Corporation (MIDC)',
        industry: ['ALL'],
        conditions: [
          'Industrial unit situated in MIDC industrial cluster or notified zone',
        ],
        requiredDocuments: [
          'Plot Allotment Letter & Possession Receipt',
          'Architectural Plans matching MIDC Development Control Regulations (DCR)',
          'Structural Design Calculations & Stability Certificate',
          'Provisional Fire NOC from DMFS',
        ],
        timeline: 21,
        riskLevel: 'Medium' as const,
        priority: 'High' as const,
        description: 'Statutory building permission sanctioning civil erection, set-backs, floor space index (FSI), and structural stability.',
        stage: 'Pre-Construction' as const,
        inspectionRequired: false,
        issuingAuthority: 'Executive Engineer / Special Planning Authority MIDC',
        validityYears: 3,
        isActive: true,
      },
      {
        approvalName: 'Industrial Water Supply Connection Sanction',
        department: 'Maharashtra Industrial Development Corporation (MIDC)',
        industry: ['Food Processing', 'Chemicals & Petrochemicals', 'Textiles & Dyeing', 'Automotive & Engineering', 'Renewable Energy & Biofuels'],
        conditions: [
          'Water requirement > 5 KLD for industrial or domestic utility purposes',
        ],
        requiredDocuments: [
          'Sanctioned Building Plan',
          'Water Balance Diagram & Daily Requirement Justification',
          'Plumbing & Internal Water Network Layout',
        ],
        timeline: 14,
        riskLevel: 'Medium' as const,
        priority: 'Medium' as const,
        description: 'Allocation and pipeline tie-in sanction for industrial grade water from MIDC supply mains.',
        stage: 'Construction' as const,
        inspectionRequired: true,
        issuingAuthority: 'Deputy Engineer (Water Supply) MIDC',
        validityYears: 10,
        isActive: true,
      },

      // FDA / Food specific
      {
        approvalName: 'FSSAI Central / State Manufacturing License',
        department: 'Food and Drug Administration (FDA Maharashtra)',
        industry: ['Food Processing'],
        conditions: [
          'Commercial processing, packaging, canning, or storage of consumable food articles',
        ],
        requiredDocuments: [
          'Form B duly signed by Authorized Signatory',
          'Layout Plan of the processing unit showing dimensions and segregation of clean zones',
          'List of Plant & Machinery with Installed Horsepower (HP)',
          'Water Potability Chemical & Microbiological Test Report',
          'Food Safety Management System (FSMS) Plan or ISO 22000 Manual',
          'Medical Fitness Certificates of Food Handling Workers',
        ],
        timeline: 25,
        riskLevel: 'High' as const,
        priority: 'Critical' as const,
        description: 'Statutory food safety license under Section 31 of Food Safety and Standards Act 2006 validating sanitary compliance.',
        stage: 'Operational' as const,
        inspectionRequired: true,
        issuingAuthority: 'Designated Officer FDA',
        validityYears: 5,
        isActive: true,
      },

      // PESO / Chemical specific
      {
        approvalName: 'PESO Petroleum / Solvent Storage License',
        department: 'Petroleum and Explosives Safety Organization (PESO)',
        industry: ['Chemicals & Petrochemicals', 'Renewable Energy & Biofuels'],
        conditions: [
          'Storage of Class A/B/C petroleum products or bulk denatured ethanol in excess of statutory limits',
        ],
        requiredDocuments: [
          'Site Layout Plan showing safety clear distances to boundary and buildings',
          'Fabrication Drawing of Aboveground / Underground Storage Tanks with design codes',
          'Safety Relief Valve & Flame Arrestor Specifications',
          'Provisional Fire NOC from DMFS',
        ],
        timeline: 45,
        riskLevel: 'Critical' as const,
        priority: 'Critical' as const,
        description: 'Federal statutory approval under Petroleum Rules 2002 for storage tanks, pump manifolds, and offloading gantries.',
        stage: 'Pre-Construction' as const,
        inspectionRequired: true,
        issuingAuthority: 'Joint Chief Controller of Explosives PESO',
        validityYears: 3,
        isActive: true,
      },

      // MEDA & Power
      {
        approvalName: 'High Tension (HT) Power Sanction & Grid Interconnection',
        department: 'Maharashtra State Electricity Distribution Co. Ltd. (MSEDCL)',
        industry: ['ALL'],
        conditions: [
          'Contract demand > 100 KVA requiring 11KV / 22KV / 33KV High Tension connection',
        ],
        requiredDocuments: [
          'Connected Load List with Connected Equipment Specifications',
          'Single Line Diagram (SLD) of Substation and Transformer Yard',
          'Electrical Contractor Work Completion Certificate',
          'Electrical Inspectorate NOC for Substation Energization',
        ],
        timeline: 20,
        riskLevel: 'Medium' as const,
        priority: 'High' as const,
        description: 'Substation engineering sanction and transmission line tapping agreement for guaranteed industrial power supply.',
        stage: 'Construction' as const,
        inspectionRequired: true,
        issuingAuthority: 'Superintending Engineer MSEDCL',
        validityYears: 10,
        isActive: true,
      },

      // Legal Metrology
      {
        approvalName: 'Legal Metrology Packaged Commodities Registration',
        department: 'Department of Legal Metrology (Weights & Measures)',
        industry: ['Food Processing', 'Electronics & Hardware', 'Warehousing & Logistics'],
        conditions: [
          'Manufacturing, packing or pre-packing commodities in standard unit packages for trade',
        ],
        requiredDocuments: [
          'Sample Product Packaging Artwork / Label Proof',
          'List of Pack Sizes and Maximum Retail Price (MRP) Declaration',
          'Factory Address Verification & GST Registration',
        ],
        timeline: 10,
        riskLevel: 'Low' as const,
        priority: 'Medium' as const,
        description: 'Statutory registration under Legal Metrology (Packaged Commodities) Rules 2011 governing packaging declarations.',
        stage: 'Operational' as const,
        inspectionRequired: false,
        issuingAuthority: 'Controller of Legal Metrology',
        validityYears: 5,
        isActive: true,
      },

      // CETP
      {
        approvalName: 'Common Effluent Treatment Plant (CETP) Conduit Connection',
        department: 'Maharashtra Industrial Development Corporation (MIDC)',
        industry: ['Textiles & Dyeing', 'Chemicals & Petrochemicals'],
        conditions: [
          'Discharge of industrial trade effluent into MIDC common underground effluent collection network',
        ],
        requiredDocuments: [
          'Effluent Quality Parameter Analysis (BOD, COD, TDS, Heavy Metals)',
          'Pre-treatment Neutralization Scheme Blueprint',
          'Flow Meter Installation & Calibration Certificate',
        ],
        timeline: 15,
        riskLevel: 'High' as const,
        priority: 'High' as const,
        description: 'Statutory intake permission for conveying pre-treated trade effluent to common industrial CETP.',
        stage: 'Construction' as const,
        inspectionRequired: true,
        issuingAuthority: 'MIDC Drainage Department & CETP Operating Society',
        validityYears: 5,
        isActive: true,
      },
    ];

    for (const app of statutoryApprovalsData) {
      await StatutoryApproval.findOneAndUpdate(
        { approvalName: app.approvalName },
        app,
        { upsert: true, new: true }
      );
    }
    Logger.info(`✓ Seeded ${statutoryApprovalsData.length} Statutory Approvals with Conditions & Documents.`);

    // 3. Seed Statutory Rules (Collection: rules)
    const rulesData = [
      {
        ruleCode: 'RULE-ENV-RED-EIA',
        title: 'Mandatory Environmental Impact Assessment for Red Category Projects',
        category: 'Environmental',
        applicableIndustries: ['Chemicals & Petrochemicals', 'Textiles & Dyeing', 'Renewable Energy & Biofuels'],
        condition: 'Investment > 5000 Lakhs OR Pollution Category is Red OR synthetic manufacturing',
        department: 'Maharashtra Pollution Control Board (MPCB)',
        mandate: 'Requires public hearing, baseline air/water sampling, and environmental clearance (EC) prior to any ground breaking activity.',
        requiredApprovals: ['Consent to Establish (CTE) - Red Category'],
        requiredDocuments: ['Environmental Management Plan (EMP) & EIA Report', 'Disaster Management Plan (DMP)'],
        severity: 'Mandatory' as const,
        legalActReference: 'EIA Notification 2006 & Environment (Protection) Act 1986',
      },
      {
        ruleCode: 'RULE-ENV-ORANGE-CTE',
        title: 'Consent to Establish for Orange Category Units',
        category: 'Environmental',
        applicableIndustries: ['Food Processing', 'Electronics & Hardware', 'Automotive & Engineering'],
        condition: 'Pollution Category is Orange with wastewater discharge < 50 KLD',
        department: 'Maharashtra Pollution Control Board (MPCB)',
        mandate: 'Mandatory Consent to Establish validating in-house effluent treatment or reuse provisions before civil erection.',
        requiredApprovals: ['Consent to Establish (CTE) - Orange Category'],
        requiredDocuments: ['Design of Wastewater Treatment / Sewage Treatment Plant', 'Process Flowchart'],
        severity: 'Mandatory' as const,
        legalActReference: 'Water Act 1974 Section 25 & Air Act 1981 Section 21',
      },
      {
        ruleCode: 'RULE-DISH-WORKERS-10',
        title: 'Factory Act Coverage for 10 or more Industrial Workers',
        category: 'Factory Safety',
        applicableIndustries: ['ALL'],
        condition: 'Employees >= 10 with electric power used in manufacturing',
        department: 'Directorate of Industrial Safety and Health (DISH)',
        mandate: 'Factory plan approval and machine layout sanction required under Section 6 of Factories Act 1948.',
        requiredApprovals: ['Factory Plan Approval', 'Factory License Registration'],
        requiredDocuments: ['Form No. 1 Application for Approval of Factory Plans', 'Architectural Layout Plans in Triplicate'],
        severity: 'Mandatory' as const,
        legalActReference: 'Factories Act 1948 Section 6 & Maharashtra Factories Rules 1963',
      },
      {
        ruleCode: 'RULE-DMFS-BUILTUP-FIRE',
        title: 'Fire Hydrant & Compartmentation Mandate',
        category: 'Fire Safety',
        applicableIndustries: ['ALL'],
        condition: 'Land Area > 1 Acre OR Built-up Area > 1000 sq.m OR Hazardous Storage',
        department: 'Directorate of Maharashtra Fire Services (DMFS)',
        mandate: 'Dedicated static water reservoir, peripheral 6m driveway, underground hydrant ring and provisional fire NOC.',
        requiredApprovals: ['Provisional Fire NOC', 'Final Fire NOC & Commissioning Compliance'],
        requiredDocuments: ['Site Layout Plan showing 6-meter peripheral fire engine access driveway', 'Schematic Fire Hydrant Layout'],
        severity: 'Mandatory' as const,
        legalActReference: 'Maharashtra Fire Prevention and Life Safety Measures Act 2006',
      },
      {
        ruleCode: 'RULE-FDA-FOOD-HYGIENE',
        title: 'FSSAI Schedule 4 Sanitary and Food Safety Mandate',
        category: 'Food Safety',
        applicableIndustries: ['Food Processing'],
        condition: 'Engaged in manufacturing, processing, repacking or cold storing of food products',
        department: 'Food and Drug Administration (FDA Maharashtra)',
        mandate: 'Valid FSSAI Central/State license, potable water certification, worker health screening and FSMS plan.',
        requiredApprovals: ['FSSAI Central / State Manufacturing License'],
        requiredDocuments: ['Form B duly signed by Authorized Signatory', 'Water Potability Chemical & Microbiological Test Report', 'FSMS Plan'],
        severity: 'Mandatory' as const,
        legalActReference: 'Food Safety and Standards Act 2006 Section 31',
      },
      {
        ruleCode: 'RULE-PESO-SOLVENT-STORAGE',
        title: 'Flammable Solvent & Hydrocarbon Bulk Storage Rule',
        category: 'Hazardous Storage',
        applicableIndustries: ['Chemicals & Petrochemicals', 'Renewable Energy & Biofuels'],
        condition: 'Storage of flammable solvents, ethanol or hydrocarbons > 2500 Litres',
        department: 'Petroleum and Explosives Safety Organization (PESO)',
        mandate: 'PESO site approval, dyke wall containment, nitrogen blanketing, and safety clear distance compliance.',
        requiredApprovals: ['PESO Petroleum / Solvent Storage License'],
        requiredDocuments: ['PESO Tank Farm Layout & Safety Distance Certificate'],
        severity: 'Mandatory' as const,
        legalActReference: 'Petroleum Act 1934 & Petroleum Rules 2002',
      },
      {
        ruleCode: 'RULE-MIDC-HIGH-WATER',
        title: 'Dedicated MIDC Industrial Water Connection Mandate',
        category: 'Utilities',
        applicableIndustries: ['Food Processing', 'Chemicals & Petrochemicals', 'Textiles & Dyeing', 'Renewable Energy & Biofuels'],
        condition: 'Daily Water Requirement > 20 KLD',
        department: 'Maharashtra Industrial Development Corporation (MIDC)',
        mandate: 'Water balance audit, underground storage sump equal to 48-hour consumption, and meter connection sanction.',
        requiredApprovals: ['Industrial Water Supply Connection Sanction'],
        requiredDocuments: ['Water Balance Diagram & Daily Water Sanction Letter'],
        severity: 'Mandatory' as const,
        legalActReference: 'MIDC Water Supply Regulations',
      },
    ];

    for (const rule of rulesData) {
      await Rule.findOneAndUpdate({ ruleCode: rule.ruleCode }, rule, { upsert: true, new: true });
    }
    Logger.info(`✓ Seeded ${rulesData.length} Statutory Regulatory Rules.`);

    // 4. Seed Document Masters (Collection: document_masters)
    const documentMastersData = [
      {
        name: 'Architectural Factory Layout Plans',
        category: 'Land & Siting' as const,
        issuingAuthority: 'Licensed Architect / Registered Civil Engineer',
        description: 'Comprehensive drawings in triplicate indicating site dimensions, machine positioning, internal driveways, safety egress routes, and setbacks.',
        applicableIndustries: ['ALL'],
        usedFor: ['Factory Plan Approval', 'Building Plan Sanction & Development Permission', 'Provisional Fire NOC'],
        isMandatory: true,
      },
      {
        name: 'MIDC Land Allotment Letter / 7/12 Land Title Extract',
        category: 'Land & Siting' as const,
        issuingAuthority: 'MIDC / Revenue Department Government of Maharashtra',
        description: 'Official proof of land tenure, ownership, demarcated plot boundaries, and possession receipt.',
        applicableIndustries: ['ALL'],
        usedFor: ['Building Plan Sanction & Development Permission', 'Consent to Establish (CTE) - Red Category', 'Consent to Establish (CTE) - Orange Category'],
        isMandatory: true,
      },
      {
        name: 'Environmental Management Plan (EMP) & EIA Report',
        category: 'Environmental' as const,
        issuingAuthority: 'NABET / QCI Accredited Environmental Consultant',
        description: 'Technical assessment detailing emission baseline, hazardous waste mitigation, ETP design, and green belt landscaping.',
        applicableIndustries: ['Chemicals & Petrochemicals', 'Textiles & Dyeing', 'Renewable Energy & Biofuels'],
        usedFor: ['Consent to Establish (CTE) - Red Category'],
        isMandatory: true,
      },
      {
        name: 'Water Balance Diagram & Daily Water Requirement Calculation',
        category: 'Utility & Infrastructure' as const,
        issuingAuthority: 'Project Engineering Team / Accredited Consultant',
        description: 'Input-output schematic of raw water intake, process consumption, cooling tower makeup, domestic use, and wastewater recycling rate.',
        applicableIndustries: ['Food Processing', 'Chemicals & Petrochemicals', 'Textiles & Dyeing', 'Renewable Energy & Biofuels'],
        usedFor: ['Industrial Water Supply Connection Sanction', 'Consent to Establish (CTE) - Red Category', 'Consent to Establish (CTE) - Orange Category'],
        isMandatory: true,
      },
      {
        name: 'Water Potability Chemical & Microbiological Test Report',
        category: 'Operational & Industry Specific' as const,
        issuingAuthority: 'NABL Accredited / State Public Health Laboratory',
        description: 'Laboratory analysis validating compliance with IS 10500 drinking water parameters for food/beverage preparation.',
        applicableIndustries: ['Food Processing'],
        usedFor: ['FSSAI Central / State Manufacturing License'],
        isMandatory: true,
      },
      {
        name: 'Form B - FSSAI Manufacturing License Application',
        category: 'Operational & Industry Specific' as const,
        issuingAuthority: 'Food and Drug Administration (FDA Maharashtra)',
        description: 'Statutory form detailing product categories, food safety supervisor qualifications, and sanitation protocols.',
        applicableIndustries: ['Food Processing'],
        usedFor: ['FSSAI Central / State Manufacturing License'],
        isMandatory: true,
      },
      {
        name: 'PESO Tank Farm Layout & Safety Distance Certificate',
        category: 'Safety & Factory' as const,
        issuingAuthority: 'PESO Authorized Competent Person / Charted Engineer',
        description: 'Certified drawing verifying minimum inter-tank spacing, dyke capacity, flame arrestors, and earth pit resistances.',
        applicableIndustries: ['Chemicals & Petrochemicals', 'Renewable Energy & Biofuels'],
        usedFor: ['PESO Petroleum / Solvent Storage License'],
        isMandatory: true,
      },
      {
        name: 'Structural Stability Certificate (Form 1A)',
        category: 'Safety & Factory' as const,
        issuingAuthority: 'Empaneled Structural Engineer',
        description: 'Engineering certificate certifying that the factory building, truss work, and foundation safely bear dynamic machinery vibrations.',
        applicableIndustries: ['ALL'],
        usedFor: ['Factory License Registration', 'Building Plan Sanction & Development Permission'],
        isMandatory: true,
      },
      {
        name: 'Schematic Fire Hydrant & Water Reservoir Layout',
        category: 'Safety & Factory' as const,
        issuingAuthority: 'Licensed Fire Consultant / Directorate of Maharashtra Fire Services',
        description: 'Calculations for underground static fire water tank, jockey pumps, mainline hydrant loop, and emergency alarms.',
        applicableIndustries: ['ALL'],
        usedFor: ['Provisional Fire NOC', 'Final Fire NOC & Commissioning Compliance'],
        isMandatory: true,
      },
      {
        name: 'Single Line Diagram (SLD) of Electrical Substation',
        category: 'Utility & Infrastructure' as const,
        issuingAuthority: 'Licensed Electrical Engineer / Certified Contractor',
        description: 'Electrical schematic showing transformer rating, HT switchgear, breaker protection, and earthing matrix.',
        applicableIndustries: ['ALL'],
        usedFor: ['High Tension (HT) Power Sanction & Grid Interconnection'],
        isMandatory: true,
      },
      {
        name: 'CETP Membership Certificate & Effluent Discharge Allotment',
        category: 'Environmental' as const,
        issuingAuthority: 'CETP Operating Company / MIDC',
        description: 'Proof of equity shares or membership granting allocated daily discharge volume into common effluent treatment plant.',
        applicableIndustries: ['Textiles & Dyeing', 'Chemicals & Petrochemicals'],
        usedFor: ['Common Effluent Treatment Plant (CETP) Conduit Connection', 'Consent to Establish (CTE) - Red Category'],
        isMandatory: true,
      },
      {
        name: 'Hazardous Waste TSDF Membership Agreement',
        category: 'Environmental' as const,
        issuingAuthority: 'Common Hazardous Waste TSDF Operator (MEPL / Taloja / Ranjangaon)',
        description: 'Five-year contract guaranteeing secure transportation and disposal of chemical incineration and landfill residues.',
        applicableIndustries: ['Chemicals & Petrochemicals', 'Automotive & Engineering', 'Electronics & Hardware'],
        usedFor: ['Hazardous Waste Authorization (HWA)', 'Consent to Establish (CTE) - Red Category'],
        isMandatory: true,
      },
    ];

    for (const doc of documentMastersData) {
      await DocumentMaster.findOneAndUpdate({ name: doc.name }, doc, { upsert: true, new: true });
    }
    Logger.info(`✓ Seeded ${documentMastersData.length} Statutory Document Masters.`);

    // 4.5 Seed Statutory Government Schemes (Collection: schemes)
    const schemesData = [
      {
        name: 'Maharashtra Package Scheme of Incentives (PSI 2019) - MSME',
        code: 'PSI-2019-MSME',
        description: 'Comprehensive capital subsidy, Gross SGST reimbursement, electricity duty waiver, and interest subvention for MSMEs in developing talukas.',
        eligibilityCriteria: [
          'Micro, Small & Medium Manufacturing units registered under Udyam',
          'Investment in plant & machinery in talukas categorized B, C, D, or D+',
          'Commencement of commercial production within statutory timeline',
        ],
        financialIncentiveSummary: 'Up to 80% Gross SGST reimbursement for 7-10 years, 5% interest subsidy on term loans, and 100% electricity duty exemption.',
        maxSubsidyAmount: 50000000,
        subsidyPercentage: 80,
        applicableIndustries: ['ALL'],
        applicableDistricts: ['ALL'],
        isMsmeEligible: true,
        isWomenEntrepreneurEligible: true,
        isStartupEligible: true,
        active: true,
      },
      {
        name: 'Maharashtra Women Entrepreneur Industrial Incentive Scheme',
        code: 'WOMEN-ENTREPRENEUR-SUBSIDY',
        description: 'Special targeted fiscal package exclusively for women-owned industrial enterprises with at least 51% shareholding.',
        eligibilityCriteria: [
          'Proprietary or partnership enterprise with >= 51% women ownership',
          'Active managerial involvement by woman entrepreneur',
          'New greenfield industrial unit or significant expansion',
        ],
        financialIncentiveSummary: 'Additional 5% interest subvention, 25% capital investment subsidy up to ₹50 Lakhs, electricity tariff rebate of ₹2/unit for 5 years, and prioritized MIDC plot allotment.',
        maxSubsidyAmount: 5000000,
        subsidyPercentage: 25,
        applicableIndustries: ['ALL'],
        applicableDistricts: ['ALL'],
        isWomenEntrepreneurEligible: true,
        isMsmeEligible: true,
        isStartupEligible: true,
        active: true,
      },
      {
        name: 'Stand-Up India Scheme for Women Entrepreneurs',
        code: 'STANDUP-INDIA-WOMEN',
        description: 'Central government credit facility promoting entrepreneurship among women and SC/ST communities for greenfield manufacturing enterprises.',
        eligibilityCriteria: [
          'Greenfield manufacturing, agri-processing, or services enterprise',
          'At least 51% shareholding held by woman entrepreneur',
          'Borrower must not be in default to any bank/financial institution',
        ],
        financialIncentiveSummary: 'Composite bank loan between ₹10 Lakhs and ₹1 Crore covering 85% of project cost with Credit Guarantee coverage.',
        maxSubsidyAmount: 10000000,
        applicableIndustries: ['ALL'],
        applicableDistricts: ['ALL'],
        isWomenEntrepreneurEligible: true,
        isMsmeEligible: true,
        isStartupEligible: true,
        active: true,
      },
      {
        name: 'Maharashtra State Innovative Startup Policy & Seed Grant 2024',
        code: 'MAHA-STARTUP-POLICY',
        description: 'Flagship state startup policy providing equity-free seed grants, patent reimbursement, testing subsidies, and access to state incubators.',
        eligibilityCriteria: [
          'DPIIT recognized or Maharashtra State Innovation Society (MSInS) registered startup',
          'Incorporated within last 10 years with innovative product or business model',
          'Registered office located in Maharashtra',
        ],
        financialIncentiveSummary: 'Direct seed grant up to ₹15 Lakhs for proof-of-concept, 80% patent filing cost reimbursement up to ₹10 Lakhs, and cloud/testing vouchers.',
        maxSubsidyAmount: 2500000,
        applicableIndustries: ['ALL'],
        applicableDistricts: ['ALL'],
        isStartupEligible: true,
        isMsmeEligible: true,
        active: true,
      },
      {
        name: 'Startup India Seed Fund Scheme (SISFS)',
        code: 'SISFS-STARTUP',
        description: 'Early-stage financial assistance to innovative startups for proof of concept, prototype development, product trials, and commercialization.',
        eligibilityCriteria: [
          'DPIIT-recognized startup incorporated not more than 2 years at the time of application',
          'Demonstrated business idea with social/economic impact or technological novelty',
          'Startup should not have received more than ₹10 Lakhs of monetary support under any other Central/State scheme',
        ],
        financialIncentiveSummary: 'Up to ₹20 Lakhs grant for proof-of-concept / prototype and up to ₹50 Lakhs debt/convertible debenture investment for commercialization.',
        maxSubsidyAmount: 5000000,
        applicableIndustries: ['ALL'],
        applicableDistricts: ['ALL'],
        isStartupEligible: true,
        isMsmeEligible: true,
        active: true,
      },
      {
        name: 'Chief Minister Employment Generation Programme (CMEGP)',
        code: 'CMEGP-2024',
        description: 'Credit-linked capital subsidy programme to stimulate rural and semi-urban industrial entrepreneurship and local job creation.',
        eligibilityCriteria: [
          'Applicant age between 18 to 45 years with minimum 8th standard pass',
          'Project cost up to ₹50 Lakhs for manufacturing units',
          'Generation of direct local employment of at least 5 workers',
        ],
        financialIncentiveSummary: '15% to 35% margin money capital subsidy on project cost (up to ₹25 Lakhs subsidy, with 35% for women and backward districts).',
        maxSubsidyAmount: 2500000,
        subsidyPercentage: 35,
        applicableIndustries: ['ALL'],
        applicableDistricts: ['ALL'],
        isMsmeEligible: true,
        isWomenEntrepreneurEligible: true,
        minEmployment: 5,
        maxInvestment: 100,
        active: true,
      },
      {
        name: 'Pradhan Mantri Formalisation of Micro Food Processing Enterprises (PMFME)',
        code: 'PMFME-FOOD',
        description: 'National scheme empowering micro food processing units through credit-linked capital subsidy, technology upgradation, and branding.',
        eligibilityCriteria: [
          'Individual micro food processing enterprise or SHG/FPO engaged in agri-food manufacturing',
          'Ownership of existing or new micro processing equipment',
          'Compliance with FSSAI hygiene standards',
        ],
        financialIncentiveSummary: '35% credit-linked capital subsidy with a maximum ceiling of ₹10 Lakhs per unit, plus 50% grant for branding and lab testing.',
        maxSubsidyAmount: 1000000,
        subsidyPercentage: 35,
        applicableIndustries: ['Food Processing'],
        applicableDistricts: ['ALL'],
        isMsmeEligible: true,
        isWomenEntrepreneurEligible: true,
        isStartupEligible: true,
        active: true,
      },
      {
        name: 'Amended Technology Upgradation Fund Scheme & Maharashtra Textile Policy',
        code: 'ATUFS-MAHA-TEXTILE',
        description: 'Direct capital investment subsidy on benchmarked machinery for spinning, weaving, garmenting, technical textiles, and processing units.',
        eligibilityCriteria: [
          'Textile manufacturing unit registered in Maharashtra',
          'Investment in specified state-of-the-art weaving, knitting, or processing machinery',
          'Compliance with pollution norms and zero liquid discharge where applicable',
        ],
        financialIncentiveSummary: '15% to 25% capital subsidy on eligible machinery up to ₹30 Crores, plus electricity tariff concession of ₹3/unit for 5 years.',
        maxSubsidyAmount: 300000000,
        subsidyPercentage: 25,
        applicableIndustries: ['Textiles & Dyeing', 'Textiles'],
        applicableDistricts: ['ALL'],
        isMsmeEligible: true,
        minInvestment: 50,
        active: true,
      },
      {
        name: 'Scheme for Promotion of Manufacturing of Electronic Components and Semiconductors (SPECS)',
        code: 'SPECS-ESDM',
        description: 'Fiscal incentive to offset the disability for domestic manufacturing of electronic components, semiconductors, and sub-assemblies.',
        eligibilityCriteria: [
          'Units manufacturing active/passive electronic components, PCBs, sensors, or semiconductor assemblies',
          'Minimum capital investment threshold of ₹5 Crores for ESDM components',
        ],
        financialIncentiveSummary: '25% financial incentive on capital expenditure for plant, machinery, cleanroom equipment, and utility installations.',
        maxSubsidyAmount: 200000000,
        subsidyPercentage: 25,
        applicableIndustries: ['Electronics & Hardware', 'Electronics'],
        applicableDistricts: ['ALL'],
        isMsmeEligible: true,
        isStartupEligible: true,
        minInvestment: 100,
        active: true,
      },
      {
        name: 'Vidarbha, Marathwada & D+ Backward District Industrial Acceleration Package',
        code: 'VIDARBHA-MARATHWADA-SPECIAL',
        description: 'Special enhanced fiscal package for manufacturing units establishing operations in industrially developing talukas of Vidarbha, Marathwada, and North Maharashtra.',
        eligibilityCriteria: [
          'Manufacturing enterprise located in Category D or D+ talukas (including Nanded, Yavatmal, Gadchiroli, Chandrapur, Amravati, Latur, Jalna, Nandurbar, Washim, Hingoli, Bhandara)',
          'Investment in eligible fixed capital assets',
        ],
        financialIncentiveSummary: '100% Gross SGST reimbursement for 10 years, 40% capital investment subsidy, 100% stamp duty exemption, and ₹2/unit power rebate for 7 years.',
        maxSubsidyAmount: 150000000,
        subsidyPercentage: 40,
        applicableIndustries: ['ALL'],
        applicableDistricts: [
          'Nanded', 'Yavatmal', 'Gadchiroli', 'Chandrapur', 'Amravati',
          'Latur', 'Jalna', 'Nandurbar', 'Washim', 'Hingoli', 'Bhandara',
          'Akola', 'Buldhana', 'Nagpur', 'Wardha', 'Osmanabad', 'Dharashiv',
          'Parbhani', 'Beed', 'Vidarbha', 'Marathwada'
        ],
        isMsmeEligible: true,
        active: true,
      },
      {
        name: 'Maharashtra Biofuel & Renewable Energy Promotion Scheme',
        code: 'BIOFUEL-GREEN-HYDROGEN',
        description: 'Special financial grant and tax incentives for establishing CBG (Compressed Bio-Gas), 2G ethanol, and biomass processing units.',
        eligibilityCriteria: [
          'Units manufacturing bio-ethanol, compressed biogas, or biomass briquettes utilizing agro-residues',
          'Grid synchronization or oil marketing company off-take agreement',
        ],
        financialIncentiveSummary: 'Capital subsidy of 25% up to ₹5 Crores on plant and bio-digester equipment, electricity duty exemption for 10 years, and priority grid connectivity.',
        maxSubsidyAmount: 50000000,
        subsidyPercentage: 25,
        applicableIndustries: ['Renewable Energy & Biofuels', 'Renewable Energy'],
        applicableDistricts: ['ALL'],
        isMsmeEligible: true,
        active: true,
      },
      {
        name: 'Maharashtra Industrial Employment Generation Incentive (EPF Subsidy)',
        code: 'EMPLOYMENT-PROMOTION-EPF',
        description: 'State reimbursement of employer contribution to Employees Provident Fund (EPF) to incentivize large-scale local formal employment.',
        eligibilityCriteria: [
          'Industrial manufacturing unit providing employment to 50 or more local workers with Maharashtra domicile',
          'Timely compliance with EPFO statutory registrations',
        ],
        financialIncentiveSummary: '100% reimbursement of the employer EPF contribution (up to 12% of basic wages) for 5 years for all newly hired local workers.',
        maxSubsidyAmount: 10000000,
        applicableIndustries: ['ALL'],
        applicableDistricts: ['ALL'],
        minEmployment: 50,
        isMsmeEligible: true,
        active: true,
      },
      {
        name: 'Maharashtra Electric Vehicle & Advanced Automotive Component Incentive',
        code: 'PLI-AUTO-EV',
        description: 'State subsidy package for automotive component manufacturers producing EV components, battery packs, and electric drivetrains.',
        eligibilityCriteria: [
          'Manufacturing unit producing EV drivetrains, battery management systems (BMS), motors, or power electronics',
          'Investment in certified plant and automated test equipment',
        ],
        financialIncentiveSummary: 'Capital subsidy of 15% on plant & machinery, 100% stamp duty exemption, and power tariff relief of ₹1.5/unit for 5 years.',
        maxSubsidyAmount: 100000000,
        subsidyPercentage: 15,
        applicableIndustries: ['Automotive & Engineering', 'Automotive'],
        applicableDistricts: ['ALL'],
        isMsmeEligible: true,
        isStartupEligible: true,
        active: true,
      },
    ];

    for (const schemeItem of schemesData) {
      await Scheme.findOneAndUpdate({ code: schemeItem.code }, schemeItem, { upsert: true, new: true });
    }
    Logger.info(`✓ Seeded ${schemesData.length} Government Incentive Schemes with MSME, Women Entrepreneur, Startup, District, and Industry criteria.`);

    // 5. Seed Diverse Sample Projects for Testing Approval Intelligence
    const { Project } = await import('../models/Project');
    const { User } = await import('../models/User');
    const entrepreneur = await User.findOne({ role: 'Entrepreneur' });

    if (entrepreneur) {
      const sampleProjects = [
        {
          projectName: 'Sahyadri Mega Food Processing & Cold Chain Unit',
          companyName: 'Sahyadri Agro-Infra Private Limited',
          industry: 'Food Processing',
          projectType: 'Greenfield',
          location: 'Plot No. C-18, Dindori MIDC Food Park',
          district: 'Nashik',
          taluka: 'Dindori',
          village: 'Mohadi',
          investment: 3800,
          landArea: 12.5,
          employees: 180,
          waterRequirement: 40,
          powerRequirement: 350,
          pollutionCategory: 'Orange' as const,
          projectStage: 'Planning' as const,
          status: 'Submitted' as const,
          owner: entrepreneur._id,
        },
        {
          projectName: 'Ichalkaranji Sustainable Textiles & Weaving Mill',
          companyName: 'Deccan Weaving & Processing Mills LLP',
          industry: 'Textiles & Dyeing',
          projectType: 'Greenfield',
          location: 'Plot 72/A, Textile SEZ, Kagal MIDC',
          district: 'Kolhapur',
          taluka: 'Kagal',
          village: 'Kagal',
          investment: 6200,
          landArea: 18,
          employees: 250,
          waterRequirement: 280,
          powerRequirement: 900,
          pollutionCategory: 'Red' as const,
          projectStage: 'Planning' as const,
          status: 'Submitted' as const,
          owner: entrepreneur._id,
        },
        {
          projectName: 'Bhiwandi Integrated Multimodal Logistics Park',
          companyName: 'Maha-Logistics Warehousing Corp',
          industry: 'Warehousing & Logistics',
          projectType: 'Greenfield',
          location: 'Survey 108/2, Mumbai-Nashik Highway Corridor',
          district: 'Thane',
          taluka: 'Bhiwandi',
          village: 'Padgha',
          investment: 11500,
          landArea: 45,
          employees: 120,
          waterRequirement: 15,
          powerRequirement: 200,
          pollutionCategory: 'Green' as const,
          projectStage: 'Planning' as const,
          status: 'Submitted' as const,
          owner: entrepreneur._id,
        },
        {
          projectName: 'Pune Precision SMT & Embedded Electronics Hub',
          companyName: 'Silicon Maharashtra Technologies Pvt Ltd',
          industry: 'Electronics & Hardware',
          projectType: 'Greenfield',
          location: 'Plot E-9, Chakan MIDC Phase 3',
          district: 'Pune',
          taluka: 'Khed',
          village: 'Kuruli',
          investment: 5400,
          landArea: 8.5,
          employees: 220,
          waterRequirement: 18,
          powerRequirement: 450,
          pollutionCategory: 'Orange' as const,
          projectStage: 'Planning' as const,
          status: 'Submitted' as const,
          owner: entrepreneur._id,
        },
      ];

      for (const sp of sampleProjects) {
        await Project.findOneAndUpdate(
          { projectName: sp.projectName },
          sp,
          { upsert: true, new: true }
        );
      }
      Logger.info(`✓ Seeded ${sampleProjects.length} Diverse Sample Projects (Food, Textile, Logistics, Electronics).`);
    }

    Logger.info('AI Regulatory Intelligence Engine seeding completed successfully.');
  } catch (error: any) {
    Logger.error(`Error during AI Engine seeding: ${error.message}`);
    throw error;
  }
};

// If run directly via tsx
if (process.argv[1] && process.argv[1].includes('seedAiEngineData')) {
  mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/maitri_plus')
    .then(async () => {
      await seedAiEngineData();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export default seedAiEngineData;
