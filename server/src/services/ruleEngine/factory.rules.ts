import { IProject } from '../../models/Project';
import { RuleEvaluationResult } from './industry.rules';

export const evaluateFactoryRules = (project: IProject): RuleEvaluationResult[] => {
  const approvals: RuleEvaluationResult[] = [];
  const ind = (project.industry || '').toLowerCase();

  // Rule: Factory Building Plan Sanction & Factory License
  approvals.push({
    approvalName: 'Factory Building Plan Approval & Manufacturing License',
    department: 'Directorate of Industrial Safety and Health (DISH Maharashtra)',
    priority: 'Critical',
    reason: 'Statutory plant layout validation and factory license under Section 6 of the Factories Act 1948 and Maharashtra Factories Rules 1963.',
    estimatedDays: 21,
    inspectionRequired: true,
    dependencies: ['MIDC Building Plan Sanction', 'Provisional Fire NOC'],
    requiredDocuments: [
      'Factory Architectural Blueprints showing Ventilation & Emergency Exits (1:100 scale)',
      'Machinery Layout & Equipment Load Bearing Calculations',
      'Manufacturing Process Safety Description & Hazard Identification',
      'Structural Stability Certificate by Licensed Chartered Engineer',
    ],
  });

  // Rule: Fire Safety NOC
  approvals.push({
    approvalName: 'Provisional Fire Safety Clearance NOC',
    department: 'Directorate of Maharashtra Fire Services (DMFS)',
    priority: 'Critical',
    reason: 'Mandatory fire prevention assessment and fire hydrant network approval before commencing building construction.',
    estimatedDays: 14,
    inspectionRequired: true,
    dependencies: ['Plot Demarcation / Site Plan'],
    requiredDocuments: [
      'Hydrant & Sprinkler Isometric CAD Schematic conforming to NBC Part 4',
      'Fire Water Tank Capacity (minimum 200,000 Litres underground)',
      'Passive Fire Compartmentation & Smoke Evacuation Plan',
    ],
  });

  // Rule: Steam Boilers & Pressure Vessels (Biofuels, Chemicals, Food, or high energy)
  const requiresBoiler =
    ind.includes('biofuel') ||
    ind.includes('chemical') ||
    ind.includes('food') ||
    ind.includes('textile') ||
    project.powerRequirement >= 2000;

  if (requiresBoiler) {
    approvals.push({
      approvalName: 'Directorate of Steam Boilers Registration & Erection Sanction',
      department: 'Directorate of Steam Boilers (Government of Maharashtra)',
      priority: 'High',
      reason: `Industrial process utilizes pressurized steam boilers and thermic fluid heaters subject to Indian Boilers Act 1923.`,
      estimatedDays: 25,
      inspectionRequired: true,
      dependencies: ['Factory Building Plan Approval & Manufacturing License'],
      requiredDocuments: [
        'Boiler Maker Certificate & IBR Inspector Test Stamp (Form II/III)',
        'Steam Piping Isometric Layout & Stress Analysis Report',
        'Certified Boiler Attendant License Credentials',
      ],
    });
  }

  return approvals;
};
