import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Project } from '../models/Project';
import { Compliance } from '../models/Compliance';
import { Logger } from '../utils/logger';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/maitri_plus';

export const seedCompliances = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }
    Logger.info('Seeding statutory compliances...');

    const projects = await Project.find({ isDeleted: false });
    if (projects.length === 0) {
      Logger.warn('No projects found to seed compliances for.');
      return;
    }

    // Clear all existing compliances to maintain clean idempotency
    await Compliance.deleteMany({});

    const now = new Date();

    for (const project of projects) {
      const compliancesToSeed = [
        {
          projectId: project._id,
          complianceName: 'MPCB Environmental Statement (Form V)',
          department: 'Maharashtra Pollution Control Board (MPCB)',
          frequency: 'Annual' as const,
          nextDueDate: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000), // in 18 days
          status: 'Due Soon' as const,
          priority: 'High' as const,
          documentsRequired: ['Water & Air Balance Sheet', 'Pollution Cess Audit', 'Raw Material Consumption Log'],
          renewalRequired: true,
          renewalWindowDays: 30,
          penaltyRisk: 'High' as const,
          remarks: 'Mandatory annual environmental audit under EPA 1986',
          history: [
            {
              action: 'COMPLIANCE_INITIALIZED',
              remarks: 'Seeded initial statutory tracking item',
              newStatus: 'Due Soon',
              timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
            },
          ],
        },
        {
          projectId: project._id,
          complianceName: 'Fire Safety Certificate Renewal (Form B)',
          department: 'Directorate of Maharashtra Fire Services (DMFS)',
          frequency: 'Annual' as const,
          nextDueDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), // in 8 days
          status: 'Renewal Pending' as const,
          priority: 'Critical' as const,
          documentsRequired: ['Fire Hydrant Inspection Certificate', 'Sprinkler System Test Report', 'Evacuation Drill Log'],
          renewalRequired: true,
          renewalWindowDays: 30,
          penaltyRisk: 'Critical' as const,
          remarks: 'Statutory renewal under Maharashtra Fire Prevention and Life Safety Measures Act',
          history: [
            {
              action: 'RENEWAL_WINDOW_OPENED',
              remarks: 'Entered 30-day renewal window',
              previousStatus: 'Upcoming',
              newStatus: 'Renewal Pending',
              timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            },
          ],
        },
        {
          projectId: project._id,
          complianceName: 'DISH Annual Factory Safety Return (Form 27)',
          department: 'Directorate of Industrial Safety and Health (DISH)',
          frequency: 'Annual' as const,
          nextDueDate: new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000), // in 75 days
          status: 'Upcoming' as const,
          priority: 'Medium' as const,
          documentsRequired: ['Factory Inspector Audit Report', 'Accident Register (Form 24)', 'Worker Health Checkup Summary'],
          renewalRequired: true,
          renewalWindowDays: 30,
          penaltyRisk: 'Medium' as const,
          remarks: 'Annual filing under Maharashtra Factories Rules 1963',
          history: [
            {
              action: 'COMPLIANCE_INITIALIZED',
              remarks: 'Scheduled next annual filing',
              newStatus: 'Upcoming',
              timestamp: new Date(),
            },
          ],
        },
        {
          projectId: project._id,
          complianceName: 'Hazardous Waste Manifest Return (Form 10)',
          department: 'Maharashtra Pollution Control Board (MPCB)',
          frequency: 'Quarterly' as const,
          nextDueDate: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000), // overdue by 12 days
          status: 'Overdue' as const,
          priority: 'Critical' as const,
          documentsRequired: ['CHWTSDF Waste Disposal Manifest', 'Transporter Authorization Slip'],
          renewalRequired: true,
          renewalWindowDays: 15,
          penaltyRisk: 'Critical' as const,
          remarks: 'Overdue quarterly submission under HWM Rules 2016',
          history: [
            {
              action: 'MARKED_OVERDUE',
              remarks: 'Due date expired 12 days ago without filing submission',
              previousStatus: 'Due Soon',
              newStatus: 'Overdue',
              timestamp: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
            },
          ],
        },
        {
          projectId: project._id,
          complianceName: 'MIDC Effluent Discharge & Water Quality Assessment',
          department: 'Maharashtra Industrial Development Corp. (MIDC)',
          frequency: 'Half-Yearly' as const,
          lastCompleted: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          nextDueDate: new Date(now.getTime() + 150 * 24 * 60 * 60 * 1000), // in 150 days
          status: 'Completed' as const,
          priority: 'Medium' as const,
          documentsRequired: ['CETP Discharge Quality Test Report', 'Flow Meter Calibration Certificate'],
          renewalRequired: true,
          renewalWindowDays: 30,
          penaltyRisk: 'Medium' as const,
          remarks: 'Previous cycle completed and verified by MIDC drainage subdivision',
          history: [
            {
              action: 'COMPLETED_AND_VERIFIED',
              remarks: 'Submitted lab report and verified compliant',
              previousStatus: 'Renewal Pending',
              newStatus: 'Completed',
              timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            },
          ],
        },
        {
          projectId: project._id,
          complianceName: 'Boiler Fitness & Steam Piping Certificate Renewal',
          department: 'Directorate of Industrial Safety and Health (DISH)',
          frequency: 'Annual' as const,
          nextDueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // in 1 day
          status: 'Due Soon' as const,
          priority: 'Critical' as const,
          documentsRequired: ['Hydraulic Test Report', 'Boiler Attendant Competency Certificate'],
          renewalRequired: true,
          renewalWindowDays: 30,
          penaltyRisk: 'Critical' as const,
          remarks: 'Statutory boiler test under Indian Boilers Act 1923 due within 24 hours',
          history: [
            {
              action: 'REMINDER_DISPATCHED',
              remarks: '24-hour statutory deadline alert dispatched',
              newStatus: 'Due Soon',
              timestamp: new Date(),
            },
          ],
        },
      ];

      await Compliance.insertMany(compliancesToSeed);
      Logger.info(`Successfully seeded ${compliancesToSeed.length} statutory compliances for ${project.projectName}.`);
    }
  } catch (error) {
    Logger.error('Failed to seed compliances:', error);
  }
};
