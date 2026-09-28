import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { Application } from '../models/Application';
import { DocumentModel } from '../models/Document';
import { Inspection } from '../models/Inspection';
import { Compliance } from '../models/Compliance';
import { AuditLog } from '../models/AuditLog';
import { Logger } from '../utils/logger';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/maitri_plus';

export const seedAuditLogs = async (): Promise<void> => {
  try {
    Logger.info('Seeding Audit Logs & Application Workflow Transitions...');
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
    }

    const [adminUser, officerUser, entrepreneurUser] = await Promise.all([
      User.findOne({ role: 'admin' }),
      User.findOne({ role: 'officer' }),
      User.findOne({ role: 'entrepreneur' }),
    ]);

    const projects = await Project.find({ isDeleted: false });
    if (projects.length === 0) {
      Logger.warn('No projects found to associate audit logs with.');
      return;
    }

    const primaryProject = projects[0];

    // Ensure sample applications with complete, deep state transitions exist
    let applications = await Application.find({ projectId: primaryProject._id });

    if (applications.length === 0) {
      const app1 = new Application({
        applicationNumber: 'APP-MH-2026-MPCB-001',
        projectId: primaryProject._id,
        department: 'Maharashtra Pollution Control Board (MPCB)',
        assignedOfficer: officerUser?._id,
        status: 'Approved',
        currentStage: 'Sanction Issued',
        priority: 'High',
        slaDays: 30,
        submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        lastUpdated: new Date(),
        remarks: 'Consent to Establish (CTE) granted with standard environmental conditions',
        serviceName: 'MPCB Consent to Establish (CTE) Clearance',
        queries: [
          {
            queryText: 'Provide revised Water Balance Diagram reflecting cooling tower blowdown volume.',
            raisedBy: officerUser?._id,
            raisedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            status: 'Resolved',
            response: 'Attached updated engineering diagram with 45 KLD cooling recirculation details.',
            respondedBy: entrepreneurUser?._id,
            respondedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          },
        ],
        history: [
          {
            action: 'Application Submitted',
            performedBy: entrepreneurUser?._id,
            fromStatus: 'Draft',
            toStatus: 'Submitted',
            fromStage: 'Drafting',
            toStage: 'Submission',
            remarks: 'Applicant submitted CTE dossier with project report and land documents',
            metadata: { ip: '103.21.124.89' },
            timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          },
          {
            action: 'Scrutiny Initiated',
            performedBy: officerUser?._id,
            fromStatus: 'Submitted',
            toStatus: 'Under Scrutiny',
            fromStage: 'Submission',
            toStage: 'Document Scrutiny',
            remarks: 'Assigned to SRO Baramati for preliminary technical document scrutiny',
            metadata: { officerName: officerUser?.name },
            timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
          },
          {
            action: 'Query Raised by Nodal Officer',
            performedBy: officerUser?._id,
            fromStatus: 'Under Scrutiny',
            toStatus: 'Query Raised',
            fromStage: 'Document Scrutiny',
            toStage: 'Clarification Required',
            remarks: 'Discrepancy observed in daily water consumption vs boiler feed calculations',
            metadata: { queryCategory: 'Water Balance' },
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          },
          {
            action: 'Query Response Submitted',
            performedBy: entrepreneurUser?._id,
            fromStatus: 'Query Raised',
            toStatus: 'Under Scrutiny',
            fromStage: 'Clarification Required',
            toStage: 'Document Scrutiny',
            remarks: 'Entrepreneur furnished detailed clarification with revised flow balance',
            metadata: { attachments: ['revised_water_balance.pdf'] },
            timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          },
          {
            action: 'Inspection Scheduled',
            performedBy: officerUser?._id,
            fromStatus: 'Under Scrutiny',
            toStatus: 'Inspection Scheduled',
            fromStage: 'Document Scrutiny',
            toStage: 'Field Inspection',
            remarks: 'Joint site visit scheduled with Field Officer for ETP civil verification',
            metadata: { inspectionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
            timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          },
          {
            action: 'Inspection Completed',
            performedBy: officerUser?._id,
            fromStatus: 'Inspection Scheduled',
            toStatus: 'Inspection Completed',
            fromStage: 'Field Inspection',
            toStage: 'Final Scrutiny & Board Review',
            remarks: 'Site inspection completed. ETP civil construction complies with MPCB norms',
            metadata: { verificationResult: 'Satisfactory' },
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
          {
            action: 'Officer Approved',
            performedBy: officerUser?._id,
            fromStatus: 'Inspection Completed',
            toStatus: 'Approved',
            fromStage: 'Final Scrutiny & Board Review',
            toStage: 'Sanction Issued',
            remarks: 'Clearance granted by Competent Authority under Section 25 Water Act',
            metadata: { consentNumber: 'MPCB/RO-PUNE/CTE-2026/0491' },
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
        ],
      });
      await app1.save();

      const app2 = new Application({
        applicationNumber: 'APP-MH-2026-DISH-002',
        projectId: primaryProject._id,
        department: 'Directorate of Industrial Safety and Health (DISH)',
        assignedOfficer: officerUser?._id,
        status: 'Under Scrutiny',
        currentStage: 'Document Scrutiny',
        priority: 'Normal',
        slaDays: 20,
        submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        lastUpdated: new Date(),
        remarks: 'Application for Factory Plan Approval under Section 6 of Factories Act, 1948',
        serviceName: 'DISH Factory Plan Sanction',
        queries: [],
        history: [
          {
            action: 'Application Submitted',
            performedBy: entrepreneurUser?._id,
            fromStatus: 'Draft',
            toStatus: 'Submitted',
            fromStage: 'Drafting',
            toStage: 'Submission',
            remarks: 'Submitted factory building blueprints and machinery layout plans',
            metadata: { ip: '103.21.124.89' },
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          },
          {
            action: 'Scrutiny Initiated',
            performedBy: officerUser?._id,
            fromStatus: 'Submitted',
            toStatus: 'Under Scrutiny',
            fromStage: 'Submission',
            toStage: 'Document Scrutiny',
            remarks: 'Technical examiner verifying headroom and fire escape corridor compliance',
            metadata: { examinerRole: 'Safety Inspector' },
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
        ],
      });
      await app2.save();

      applications = [app1, app2];
      Logger.info('✓ Created sample applications with complete state transitions.');
    } else {
      // Ensure the first application has rich history
      const firstApp = applications[0];
      if (!firstApp.history || firstApp.history.length < 3) {
        firstApp.history = [
          {
            action: 'Application Submitted',
            performedBy: entrepreneurUser?._id,
            fromStatus: 'Draft',
            toStatus: 'Submitted',
            fromStage: 'Drafting',
            toStage: 'Submission',
            remarks: 'Applicant submitted clearance dossier',
            metadata: { ip: '103.21.124.89' },
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          },
          {
            action: 'Scrutiny Initiated',
            performedBy: officerUser?._id,
            fromStatus: 'Submitted',
            toStatus: 'Under Scrutiny',
            fromStage: 'Submission',
            toStage: 'Document Scrutiny',
            remarks: 'Assigned to nodal officer for preliminary scrutiny',
            metadata: { officerName: officerUser?.name },
            timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          },
          {
            action: 'Inspection Scheduled',
            performedBy: officerUser?._id,
            fromStatus: 'Under Scrutiny',
            toStatus: 'Inspection Scheduled',
            fromStage: 'Document Scrutiny',
            toStage: 'Field Inspection',
            remarks: 'Scheduled field inspection for on-site compliance audit',
            metadata: { location: firstApp.department },
            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          },
          {
            action: 'Officer Approved',
            performedBy: officerUser?._id,
            fromStatus: 'Inspection Scheduled',
            toStatus: 'Approved',
            fromStage: 'Field Inspection',
            toStage: 'Sanction Issued',
            remarks: 'Statutory approval issued with digital signature',
            metadata: { sanctionRef: 'MH-SANCTION-2026-902' },
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
        ];
        await firstApp.save();
        Logger.info('✓ Updated existing application with full state transitions.');
      }
    }

    const appRecord = applications[0];

    // Seed comprehensive AuditLog records covering all requested action examples
    await AuditLog.deleteMany({});

    const sampleAuditLogs = [
      {
        user: entrepreneurUser?._id,
        action: 'User Login',
        entity: 'User',
        entityId: entrepreneurUser?._id.toString() || 'user-001',
        oldValue: { lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        newValue: { lastLogin: new Date(), authMethod: 'JWT_BEARER', status: 'SUCCESS' },
        ipAddress: '103.21.124.89',
        metadata: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0', role: 'entrepreneur' },
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        user: entrepreneurUser?._id,
        action: 'Project Created',
        entity: 'Project',
        entityId: primaryProject._id.toString(),
        oldValue: null,
        newValue: {
          projectName: primaryProject.projectName,
          companyName: primaryProject.companyName,
          district: primaryProject.district,
          investment: primaryProject.investment,
          pollutionCategory: primaryProject.pollutionCategory,
        },
        ipAddress: '103.21.124.89',
        metadata: { projectStage: 'Planning', industrialZone: 'Baramati MIDC' },
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
      },
      {
        user: adminUser?._id || entrepreneurUser?._id,
        action: 'Approval Generated',
        entity: 'Approval',
        entityId: primaryProject._id.toString(),
        oldValue: { totalApprovals: 0 },
        newValue: {
          totalApprovalsGenerated: 7,
          departmentsInvolved: ['MPCB', 'MIDC', 'DMFS', 'DISH', 'MSEDCL', 'Labour'],
          ruleEngineVersion: '2.0.0',
        },
        ipAddress: '127.0.0.1',
        metadata: { roadmapsGenerated: 7, automatedRuleMatches: 12 },
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 - 30 * 60 * 1000),
      },
      {
        user: entrepreneurUser?._id,
        action: 'Application Submitted',
        entity: 'Application',
        entityId: appRecord._id.toString(),
        oldValue: { status: 'Draft', currentStage: 'Drafting' },
        newValue: { status: 'Submitted', currentStage: 'Submission', applicationNumber: appRecord.applicationNumber },
        ipAddress: '103.21.124.89',
        metadata: { department: appRecord.department, serviceName: appRecord.serviceName },
        timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        user: entrepreneurUser?._id,
        action: 'Document Uploaded',
        entity: 'Document',
        entityId: appRecord._id.toString(),
        oldValue: null,
        newValue: {
          fileName: 'Detailed_Project_Report_Biofuels.pdf',
          documentType: 'Detailed Project Report (DPR)',
          fileSize: 4520910,
          mimeType: 'application/pdf',
          verificationStatus: 'Pending',
        },
        ipAddress: '103.21.124.89',
        metadata: { checksum: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
        timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
      },
      {
        user: officerUser?._id,
        action: 'Inspection Scheduled',
        entity: 'Inspection',
        entityId: appRecord._id.toString(),
        oldValue: { inspectionStatus: 'None' },
        newValue: {
          inspectionDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          inspectionType: 'Pre-Commissioning Emission & ETP Audit',
          inspector: officerUser?.name,
          status: 'Scheduled',
        },
        ipAddress: '49.36.12.18',
        metadata: { officerDepartment: officerUser?.department, venue: primaryProject.location },
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        user: officerUser?._id,
        action: 'Officer Approved',
        entity: 'Application',
        entityId: appRecord._id.toString(),
        oldValue: { status: 'Inspection Completed', currentStage: 'Final Scrutiny & Board Review' },
        newValue: { status: 'Approved', currentStage: 'Sanction Issued', sanctionNumber: 'MH-SANCTION-2026-902' },
        ipAddress: '49.36.12.18',
        metadata: {
          approvingOfficer: officerUser?.name,
          validityYears: 5,
          certificateUrl: '/uploads/certificates/MPCB_CTE_001.pdf',
        },
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        user: officerUser?._id,
        action: 'Officer Rejected',
        entity: 'Application',
        entityId: 'APP-MH-2026-REJ-098',
        oldValue: { status: 'Under Scrutiny' },
        newValue: {
          status: 'Rejected',
          rejectionReason: 'Non-compliance with CPCB buffer zone restrictions adjacent to water bodies',
        },
        ipAddress: '49.36.12.18',
        metadata: { department: 'Maharashtra Pollution Control Board (MPCB)', hearingOffered: true },
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        user: adminUser?._id || officerUser?._id,
        action: 'Renewal Generated',
        entity: 'Compliance',
        entityId: primaryProject._id.toString(),
        oldValue: { renewalStatus: 'Upcoming' },
        newValue: {
          complianceName: 'Hazardous Waste Annual Authorization Renewal',
          renewalFrequency: 'Annual',
          nextDueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          status: 'Renewal Pending',
        },
        ipAddress: '127.0.0.1',
        metadata: { renewalWindowDays: 60, automatedScheduler: 'ComplianceWatchdog' },
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        user: officerUser?._id,
        action: 'User Login',
        entity: 'User',
        entityId: officerUser?._id.toString() || 'officer-001',
        oldValue: null,
        newValue: { authMethod: 'PORTAL_LOGIN', role: 'officer', status: 'SUCCESS' },
        ipAddress: '49.36.12.18',
        metadata: { organization: 'Maharashtra State Administration' },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    ];

    const insertedAuditLogs = await AuditLog.insertMany(sampleAuditLogs);
    Logger.info(`✓ Seeded ${insertedAuditLogs.length} audit logs tracking all key action examples.`);
    Logger.info('🎉 Audit Logs & Workflow State Transitions seeding completed!');
  } catch (error: any) {
    Logger.error(`Failed to seed audit logs: ${error.message}`);
    throw error;
  }
};

if (require.main === module) {
  seedAuditLogs()
    .then(() => {
      mongoose.disconnect();
      process.exit(0);
    })
    .catch(() => {
      mongoose.disconnect();
      process.exit(1);
    });
}

export default seedAuditLogs;
