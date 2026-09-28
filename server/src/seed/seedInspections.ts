import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Project } from '../models/Project';
import { Application } from '../models/Application';
import { User } from '../models/User';
import { Inspection } from '../models/Inspection';
import { InspectionChecklist } from '../models/InspectionChecklist';
import { Logger } from '../utils/logger';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/maitri_plus';

export const seedInspections = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }
    Logger.info('Seeding field inspections and checklists...');

    const projects = await Project.find({ isDeleted: false });
    if (projects.length === 0) {
      Logger.warn('No projects found to seed inspections for.');
      return;
    }

    const officer = await User.findOne({ role: 'officer' });
    if (!officer) {
      Logger.warn('No officer found to assign inspections to.');
      return;
    }

    const applications = await Application.find({ isDeleted: false });

    // Clean existing inspections to maintain clean idempotency
    await Inspection.deleteMany({});
    await InspectionChecklist.deleteMany({});

    const now = new Date();

    const sampleInspections = [
      {
        project: projects[0]._id,
        application: applications[0]?._id,
        department: 'Maharashtra Pollution Control Board (MPCB)',
        assignedInspector: officer._id,
        inspectionDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), // in 4 days
        inspectionTime: '10:30 AM',
        inspectionType: 'Pre-Commissioning Emission & ETP Audit',
        status: 'Scheduled' as const,
        remarks: 'Joint site visit with MPCB Sub-Regional Officer for effluent treatment plant verification',
        findings: '',
        documentsVerified: ['ETP Engineering Flow Diagram', 'Zero Liquid Discharge (ZLD) Layout', 'Environmental Clearance Approval'],
        photos: [],
        location: projects[0].location || 'Plot B-42, Baramati MIDC Industrial Zone',
        history: [
          {
            action: 'INSPECTION_SCHEDULED',
            remarks: 'Scheduled pre-commissioning pollution audit',
            newStatus: 'Scheduled',
            timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          },
        ],
        checklist: [
          {
            item: 'Effluent Treatment Plant (ETP) civil structures and capacity verified for 450 KLD load',
            status: 'Pending' as const,
            remarks: 'Primary and secondary settling tanks to be inspected',
          },
          {
            item: 'Air pollution control devices (Cyclone separator & bag filters) fitted to boiler stack',
            status: 'Pending' as const,
            remarks: 'Stack emission monitoring point to be inspected',
          },
          {
            item: 'Hazardous waste secure containment shed constructed with impervious flooring',
            status: 'Pending' as const,
            remarks: 'Spill containment bunds to be inspected',
          },
          {
            item: 'Online Continuous Emission Monitoring System (OCEMS) linked to CPCB/MPCB servers',
            status: 'Pending' as const,
            remarks: 'Data transmission handshake test required',
          },
        ],
      },
      {
        project: projects[0]._id,
        application: applications[1]?._id,
        department: 'Directorate of Industrial Safety and Health (DISH)',
        assignedInspector: officer._id,
        inspectionDate: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000), // in 9 days
        inspectionTime: '02:00 PM',
        inspectionType: 'Factory Safety & Boiler Fitness Audit',
        status: 'Scheduled' as const,
        remarks: 'Mandatory verification under Maharashtra Factories Rules 1963 and Indian Boilers Act',
        findings: '',
        documentsVerified: ['Factory Floor Layout Approval', 'Boiler Hydraulic Pressure Test Certificate', 'Fire Evacuation Plan'],
        photos: [],
        location: projects[0].location || 'Plot B-42, Baramati MIDC Industrial Zone',
        history: [
          {
            action: 'INSPECTION_SCHEDULED',
            remarks: 'Scheduled statutory safety and boiler inspection',
            newStatus: 'Scheduled',
            timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          },
        ],
        checklist: [
          {
            item: 'Machinery safety guards and emergency trip switches installed on main line',
            status: 'Pending' as const,
            remarks: '',
          },
          {
            item: 'Boiler safety valves and water level indicators inspected and calibrated',
            status: 'Pending' as const,
            remarks: '',
          },
          {
            item: 'Factory ventilation, natural lighting and worker ergonomics conform to statutory norms',
            status: 'Pending' as const,
            remarks: '',
          },
          {
            item: 'On-site emergency response team (ERT) and first-aid medical post equipped',
            status: 'Pending' as const,
            remarks: '',
          },
        ],
      },
      {
        project: projects[projects.length > 1 ? 1 : 0]._id,
        department: 'Directorate of Maharashtra Fire Services (DMFS)',
        assignedInspector: officer._id,
        inspectionDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        inspectionTime: '11:00 AM',
        inspectionType: 'Final Fire Safety Verification for Final NOC',
        status: 'Completed' as const,
        remarks: 'Site inspection completed satisfactorily. All active fire hydrants verified.',
        findings: 'Fire hydrant pressure tested at 8.2 kg/cm2 with continuous flow. Automatic sprinkler network in chemical warehouse functional. Evacuation routes unblocked and clearly illuminated. Recommended for Final Fire NOC issuance.',
        documentsVerified: ['Fire Hydrant Layout Plan', 'Underground Water Storage Tank Certificate (2 Lakh Litres)', 'Electrical Safety Audit Report'],
        photos: [
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80',
        ],
        location: projects[projects.length > 1 ? 1 : 0].location || 'Phase-2 Chakan MIDC Industrial Corridor',
        history: [
          {
            action: 'INSPECTION_SCHEDULED',
            remarks: 'Scheduled fire safety site inspection',
            newStatus: 'Scheduled',
            timestamp: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
          },
          {
            action: 'INSPECTION_COMPLETED',
            remarks: 'Conducted field testing of life safety measures',
            previousStatus: 'Scheduled',
            newStatus: 'Completed',
            timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          },
        ],
        checklist: [
          {
            item: 'Fire hydrant ring main pressure test maintained above 7.0 kg/cm2',
            status: 'Compliant' as const,
            remarks: 'Measured 8.2 kg/cm2 at terrace booster pump',
          },
          {
            item: 'Dedicated static underground water storage reservoir of minimum 200,000 litres capacity',
            status: 'Compliant' as const,
            remarks: 'Tank volume verified full with float valve operational',
          },
          {
            item: 'Automatic fire detection, smoke sensors and manual call points connected to central monitoring panel',
            status: 'Compliant' as const,
            remarks: 'Panel audible alarm tested and verified',
          },
          {
            item: 'Fire-rated doors with panic hardware on all emergency egress staircases',
            status: 'Compliant' as const,
            remarks: '2-hour fire-rated doors confirmed',
          },
        ],
      },
    ];

    for (const insp of sampleInspections) {
      const { checklist, ...inspData } = insp;
      const createdInsp = new Inspection(inspData);
      await createdInsp.save();

      if (checklist && checklist.length > 0) {
        const checklistDocs = checklist.map((c) => ({
          inspectionId: createdInsp._id,
          item: c.item,
          status: c.status,
          remarks: c.remarks || '',
        }));
        await InspectionChecklist.insertMany(checklistDocs);
      }

      Logger.info(`✓ Seeded inspection: ${createdInsp.inspectionType} (${createdInsp.status}) with ${checklist.length} checklist items.`);
    }

    Logger.info('✨ Inspection module seeding completed.');
  } catch (error) {
    Logger.error('Failed to seed inspections:', error);
  }
};
