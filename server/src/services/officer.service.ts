import mongoose from 'mongoose';
import { Application, IApplication } from '../models/Application';
import { Project } from '../models/Project';
import { Department } from '../models/Department';
import { Inspection } from '../models/Inspection';
import { User } from '../models/User';
import { DocumentModel } from '../models/Document';
import { Logger } from '../utils/logger';

export class OfficerService {
  /**
   * Calculate live officer analytics using MongoDB aggregation
   */
  static async getLiveDashboardAnalytics(user: any) {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filter by officer's department if not admin
    let filter: any = {};
    if (user && user.role?.toLowerCase() === 'officer') {
      const orgOrDept = [user.department, user.organization].filter(Boolean).join(' ');
      const matchedKeyword = ['MPCB', 'Pollution', 'Fire', 'Safety', 'DISH', 'MIDC', 'Labour', 'Electricity', 'MSEDCL', 'Municipal', 'Industry', 'Industries'].find(
        (kw) => orgOrDept.toLowerCase().includes(kw.toLowerCase())
      );
      if (matchedKeyword) {
        filter.department = { $regex: new RegExp(matchedKeyword, 'i') };
      }
    }

    let allApplications = await Application.find(filter)
      .populate('projectId', 'projectName companyName industry district location pollutionCategory investment employees')
      .populate('assignedOfficer', 'name email phone department')
      .populate('approvalId')
      .sort({ submittedAt: -1 })
      .lean();

    // If department filter produced 0 applications, fall back to viewing state-wide applications
    if (allApplications.length === 0 && filter.department) {
      filter = {};
      allApplications = await Application.find({})
        .populate('projectId', 'projectName companyName industry district location pollutionCategory investment employees')
        .populate('assignedOfficer', 'name email phone department')
        .populate('approvalId')
        .sort({ submittedAt: -1 })
        .lean();
    }

    const [
      applicationsTodayCount,
      activeDepartmentsCount,
      scheduledInspectionsCount,
      totalProjectsCount,
      allOfficers,
    ] = await Promise.all([
      Application.countDocuments({
        ...filter,
        submittedAt: { $gte: todayStart, $lte: todayEnd },
      }),
      Department.countDocuments({ isActive: true }),
      Inspection.countDocuments({ status: 'Scheduled' }),
      Project.countDocuments({ isDeleted: { $ne: true } }),
      User.find({ role: { $in: ['officer', 'Officer', 'admin', 'Admin'] } }).select('name email department role phone').lean(),
    ]);

    let pendingScrutiny = 0;
    let queriesRaised = 0;
    let approvalsIssued = 0;
    let rejected = 0;
    let returned = 0;
    let totalSlaRemainingDays = 0;
    let activeSlaCases = 0;

    const districtMap: Record<string, number> = {};
    const industryMap: Record<string, number> = {};
    const statusMap: Record<string, number> = {};
    const officerWorkloadMap: Record<string, { officer: any; count: number }> = {};

    // Initialize officer map
    allOfficers.forEach((off: any) => {
      officerWorkloadMap[off._id.toString()] = {
        officer: off,
        count: 0,
      };
    });

    const priorityQueue: any[] = [];
    const todayTasks: any[] = [];
    const assignedCases: any[] = [];
    const unassignedCases: any[] = [];
    const escalatedCases: any[] = [];
    const highRiskCases: any[] = [];
    const pendingQueries: any[] = [];
    const returnedFiles: any[] = [];
    const approvalsReady: any[] = [];
    const recentActivity: any[] = [];

    allApplications.forEach((app: any) => {
      const elapsedDays = Math.floor(
        (now.getTime() - new Date(app.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      const slaRemaining = Math.max(0, (app.slaDays || 30) - elapsedDays);
      const isOverdue = elapsedDays > (app.slaDays || 30);
      const isDueToday = slaRemaining <= 1;

      // Risk score calculation based on pollution, scale, and overdue status
      let calculatedRisk = app.riskScore || 15;
      if (app.projectId?.pollutionCategory === 'Red') calculatedRisk += 35;
      if (app.projectId?.pollutionCategory === 'Orange') calculatedRisk += 15;
      if (isOverdue) calculatedRisk += 25;
      if (app.status === 'Query Raised') calculatedRisk += 10;
      calculatedRisk = Math.min(99, calculatedRisk);

      const enhancedApp = {
        ...app,
        elapsedDays,
        slaRemaining,
        isOverdue,
        isDueToday,
        riskScore: calculatedRisk,
      };

      // Collect activity timeline items
      if (app.history && Array.isArray(app.history)) {
        app.history.forEach((h: any) => {
          recentActivity.push({
            applicationId: app._id,
            applicationNumber: app.applicationNumber,
            projectName: app.projectId?.projectName || 'Industrial Project',
            department: app.department,
            action: h.action,
            remarks: h.remarks,
            fromStatus: h.fromStatus,
            toStatus: h.toStatus,
            timestamp: h.timestamp || app.lastUpdated,
          });
        });
      }

      // Status breakdown
      statusMap[app.status] = (statusMap[app.status] || 0) + 1;

      // District breakdown
      const dist = app.projectId?.district || 'General Zone';
      districtMap[dist] = (districtMap[dist] || 0) + 1;

      // Industry breakdown
      const ind = app.projectId?.industry || 'Manufacturing';
      industryMap[ind] = (industryMap[ind] || 0) + 1;

      // Officer assignment count
      if (app.assignedOfficer?._id) {
        const offId = app.assignedOfficer._id.toString();
        if (officerWorkloadMap[offId]) {
          officerWorkloadMap[offId].count += 1;
        }
      }

      // Classify into queues
      if (['Submitted', 'Under Scrutiny', 'Document Verification'].includes(app.status)) {
        pendingScrutiny++;
      }
      if (app.status === 'Approved') {
        approvalsIssued++;
      }
      if (app.status === 'Rejected') {
        rejected++;
      }
      if (app.status === 'Returned') {
        returned++;
        returnedFiles.push(enhancedApp);
      }
      if (app.status === 'Query Raised') {
        queriesRaised++;
        pendingQueries.push(enhancedApp);
      }

      // Active SLA tracking
      if (!['Approved', 'Rejected', 'Draft'].includes(app.status)) {
        totalSlaRemainingDays += slaRemaining;
        activeSlaCases++;
      }

      // Queue 1: Priority Queue
      if (app.priority === 'Critical' || app.priority === 'Urgent' || isOverdue) {
        priorityQueue.push(enhancedApp);
      }

      // Queue 2: Today's Tasks
      if (isDueToday || (app.inspectionDate && new Date(app.inspectionDate) >= todayStart && new Date(app.inspectionDate) <= todayEnd)) {
        todayTasks.push(enhancedApp);
      }

      // Queue 3 & 4: Assigned vs Unassigned
      if (!app.assignedOfficer) {
        unassignedCases.push(enhancedApp);
      } else {
        assignedCases.push(enhancedApp);
      }

      // Queue 5: Escalated Cases
      if (app.escalated || isOverdue) {
        escalatedCases.push(enhancedApp);
      }

      // Queue 6: High Risk Cases
      if (calculatedRisk >= 60 || app.projectId?.pollutionCategory === 'Red') {
        highRiskCases.push(enhancedApp);
      }

      // Queue 7: Approvals Ready
      if (['Inspection Completed', 'Document Verification', 'Under Scrutiny'].includes(app.status) && app.queries?.every((q: any) => q.status === 'Resolved')) {
        approvalsReady.push(enhancedApp);
      }
    });

    const averageSlaRemaining = activeSlaCases > 0 ? Math.round(totalSlaRemainingDays / activeSlaCases) : 22;

    // Sort recent activity descending
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      kpi: {
        pendingReviews: pendingScrutiny,
        pendingScrutiny,
        applicationsToday: applicationsTodayCount,
        approvedToday: approvalsIssued,
        approvalsIssued,
        rejected,
        queriesRaised,
        returned,
        applicationsWaiting: unassignedCases.length,
        averageSla: averageSlaRemaining,
        averageSlaRemaining,
        inspectionToday: scheduledInspectionsCount,
        inspectionsScheduled: scheduledInspectionsCount,
        totalProjects: totalProjectsCount,
        todaysDeadline: todayTasks.length,
        overdue: escalatedCases.length,
        highRiskApplications: highRiskCases.length,
        departmentsActive: activeDepartmentsCount,
        totalApplications: allApplications.length,
      },
      officerWorkload: Object.values(officerWorkloadMap).map((item) => ({
        officerId: item.officer._id,
        name: item.officer.name,
        email: item.officer.email,
        department: item.officer.department || 'Statutory Authority',
        activeCases: item.count,
        phone: item.officer.phone,
      })),
      queues: {
        priorityQueue: priorityQueue.slice(0, 15),
        todayTasks: todayTasks.slice(0, 15),
        assignedCases: assignedCases.slice(0, 15),
        unassignedCases: unassignedCases.slice(0, 15),
        escalatedCases: escalatedCases.slice(0, 15),
        highRiskCases: highRiskCases.slice(0, 15),
        pendingQueries: pendingQueries.slice(0, 15),
        returnedFiles: returnedFiles.slice(0, 15),
        approvalsReady: approvalsReady.slice(0, 15),
      },
      charts: {
        districtBreakdown: Object.entries(districtMap).map(([district, count]) => ({ district, count })),
        industryBreakdown: Object.entries(industryMap).map(([industry, count]) => ({ industry, count })),
        statusBreakdown: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
      },
      recentActivity: recentActivity.slice(0, 20),
    };
  }

  /**
   * Get list of officers for assignment
   */
  static async getOfficersList() {
    const officers = await User.find({
      role: { $in: ['officer', 'Officer', 'admin', 'Admin'] },
    })
      .select('name email phone department organization role')
      .lean();

    const counts = await Application.aggregate([
      { $match: { assignedOfficer: { $ne: null }, status: { $nin: ['Approved', 'Rejected'] } } },
      { $group: { _id: '$assignedOfficer', count: { $sum: 1 } } },
    ]);

    const countMap: Record<string, number> = {};
    counts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    return officers.map((o: any) => ({
      ...o,
      activeLoad: countMap[o._id.toString()] || 0,
    }));
  }

  /**
   * Assign officer to application
   */
  static async assignOfficer(applicationId: string, officerId: string, currentUser: any) {
    const application = await Application.findById(applicationId);
    if (!application) throw new Error('Application not found');

    const officer = await User.findById(officerId);
    if (!officer) throw new Error('Officer not found');

    application.assignedOfficer = officer._id;
    if (application.status === 'Submitted') {
      application.status = 'Under Scrutiny';
      application.currentStage = 'Officer Scrutiny';
    }
    application.lastUpdated = new Date();

    application.history.push({
      action: `Assigned to Officer: ${officer.name} (${officer.department || 'Nodal Agency'})`,
      performedBy: currentUser?.userId || currentUser?._id,
      toStatus: application.status,
      remarks: `Case file routed to ${officer.name} for technical scrutiny.`,
      timestamp: new Date(),
    });

    await application.save();
    return application;
  }

  /**
   * Forward application to another department
   */
  static async forwardDepartment(applicationId: string, targetDepartment: string, remarks: string, currentUser: any) {
    const application = await Application.findById(applicationId);
    if (!application) throw new Error('Application not found');

    const previousDept = application.department;
    application.forwardedFrom = previousDept;
    application.forwardedTo = targetDepartment;
    application.department = targetDepartment;
    application.status = 'Under Scrutiny';
    application.currentStage = `Forwarded to ${targetDepartment}`;
    application.lastUpdated = new Date();

    application.history.push({
      action: `Forwarded to Department: ${targetDepartment}`,
      performedBy: currentUser?.userId || currentUser?._id,
      fromStatus: 'Under Scrutiny',
      toStatus: 'Under Scrutiny',
      remarks: remarks || `Inter-departmental transfer from ${previousDept} to ${targetDepartment}.`,
      timestamp: new Date(),
    });

    await application.save();
    return application;
  }

  /**
   * Generate official NOC / Clearance Certificate
   */
  static async generateNoc(applicationId: string, remarks: string, currentUser: any) {
    const application = await Application.findById(applicationId).populate('projectId');
    if (!application) throw new Error('Application not found');

    const year = new Date().getFullYear();
    const certificateNumber = `NOC-MH-${year}-${Math.floor(100000 + Math.random() * 900000)}`;

    application.status = 'Approved';
    application.currentStage = 'NOC Issued & Dispatched';
    application.certificateNumber = certificateNumber;
    application.certificateIssuedAt = new Date();
    application.certificateRemarks = remarks || 'All statutory conditions fulfilled and verified.';
    application.lastUpdated = new Date();

    application.history.push({
      action: `Statutory Clearance NOC Issued (${certificateNumber})`,
      performedBy: currentUser?.userId || currentUser?._id,
      fromStatus: 'Under Scrutiny',
      toStatus: 'Approved',
      remarks: `Official digital sanction issued. Certificate Number: ${certificateNumber}.`,
      timestamp: new Date(),
    });

    await application.save();
    return {
      application,
      certificateNumber,
      issuedAt: application.certificateIssuedAt,
      issuingAuthority: application.department,
      projectName: (application.projectId as any)?.projectName || 'Industrial Project',
      validity: '3 Years from Date of Issuance',
    };
  }

  /**
   * Add internal officer note
   */
  static async addOfficerNote(applicationId: string, noteText: string, officerName: string, officerId?: string) {
    const application = await Application.findById(applicationId);
    if (!application) throw new Error('Application not found');

    application.internalNotes.push({
      note: noteText.trim(),
      officerName: officerName || 'Scrutinizing Officer',
      officerId: officerId ? new mongoose.Types.ObjectId(officerId) : undefined,
      createdAt: new Date(),
    });

    application.lastUpdated = new Date();
    await application.save();
    return application.internalNotes;
  }

  /**
   * Return application to entrepreneur for correction
   */
  static async returnApplication(applicationId: string, reason: string, currentUser: any) {
    const application = await Application.findById(applicationId);
    if (!application) throw new Error('Application not found');

    application.status = 'Returned';
    application.currentStage = 'Returned to Applicant for Resubmission';
    application.remarks = reason;
    application.lastUpdated = new Date();

    application.history.push({
      action: 'Application Returned to Entrepreneur',
      performedBy: currentUser?.userId || currentUser?._id,
      fromStatus: application.status,
      toStatus: 'Returned',
      remarks: reason,
      timestamp: new Date(),
    });

    await application.save();
    return application;
  }
}

export default OfficerService;
