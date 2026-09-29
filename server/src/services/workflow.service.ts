import mongoose from 'mongoose';
import { Application, IApplication, ApplicationStatus, ApplicationPriority } from '../models/Application';
import { Project } from '../models/Project';
import { ProjectApproval } from '../models/ProjectApproval';
import { DocumentModel } from '../models/Document';
import { Inspection } from '../models/Inspection';
import { User } from '../models/User';

export interface ApplicationFilterParams {
  department?: string;
  district?: string;
  industry?: string;
  priority?: string;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export class WorkflowService {
  /**
   * Helper to compute dynamic risk score for an application
   */
  static calculateRiskScore(
    app: any,
    project: any,
    missingDocsCount: number
  ): 'Low' | 'Medium' | 'High' {
    let score = 0;

    // Missing documents risk
    if (missingDocsCount > 3) score += 3;
    else if (missingDocsCount > 0) score += 1;

    // Open queries risk
    const openQueries = app.queries?.filter((q: any) => q.status === 'Open').length || 0;
    if (openQueries > 1) score += 2;
    else if (openQueries === 1) score += 1;

    // SLA risk
    const elapsedDays = Math.floor(
      (Date.now() - new Date(app.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    const slaRemaining = (app.slaDays || 30) - elapsedDays;
    if (slaRemaining <= 3) score += 3;
    else if (slaRemaining <= 7) score += 1;

    // Project characteristics risk
    if (project?.pollutionCategory === 'Red') score += 2;
    if (project?.investment && project.investment > 5000) score += 2; // > 50 Cr

    if (score >= 5) return 'High';
    if (score >= 3) return 'Medium';
    return 'Low';
  }

  /**
   * Create new application
   */
  static async createApplication(
    data: {
      projectId: string;
      approvalId?: string;
      department: string;
      serviceName?: string;
      priority?: ApplicationPriority;
      slaDays?: number;
      remarks?: string;
    },
    user: any
  ): Promise<IApplication> {
    if (!mongoose.Types.ObjectId.isValid(data.projectId)) {
      throw new Error('Invalid project ID format');
    }

    const project = await Project.findById(data.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const application = new Application({
      projectId: project._id,
      approvalId: data.approvalId ? new mongoose.Types.ObjectId(data.approvalId) : undefined,
      department: data.department,
      serviceName: data.serviceName || `${data.department} Statutory Clearance NOC`,
      priority: data.priority || 'Normal',
      slaDays: data.slaDays || 30,
      status: 'Submitted',
      currentStage: 'Document Scrutiny',
      remarks: data.remarks || '',
      submittedAt: new Date(),
      lastUpdated: new Date(),
      history: [
        {
          action: 'Application Submission',
          performedBy: user?.userId || user?._id || project.owner,
          toStatus: 'Submitted',
          remarks: 'Initial application submitted via MAITRI+ Single Window portal',
          timestamp: new Date(),
        },
      ],
    });

    await application.save();
    return application;
  }

  /**
   * Get applications with filters, search, pagination, and role-based access
   */
  static async getApplications(params: ApplicationFilterParams, user: any) {
    const query: any = {};

    // Role-based scoping
    if (user?.role === 'entrepreneur') {
      // Find all projects owned by this entrepreneur
      const userProjects = await Project.find({ owner: user.userId || user._id }).select('_id');
      query.projectId = { $in: userProjects.map((p) => p._id) };
    }

    if (params.department && params.department !== 'ALL') {
      query.department = { $regex: new RegExp(params.department, 'i') };
    }

    if (params.status && params.status !== 'ALL') {
      query.status = params.status;
    }

    if (params.priority && params.priority !== 'ALL') {
      query.priority = params.priority;
    }

    if (params.dateFrom || params.dateTo) {
      query.submittedAt = {};
      if (params.dateFrom) query.submittedAt.$gte = new Date(params.dateFrom);
      if (params.dateTo) query.submittedAt.$lte = new Date(params.dateTo);
    }

    // Handle search and project-based filters (district, industry)
    let projectMatch: any = {};
    if (params.district && params.district !== 'ALL') {
      projectMatch.district = params.district;
    }
    if (params.industry && params.industry !== 'ALL') {
      projectMatch.industry = params.industry;
    }

    if (Object.keys(projectMatch).length > 0) {
      const matchedProjects = await Project.find(projectMatch).select('_id');
      query.projectId = { $in: matchedProjects.map((p) => p._id) };
    }

    if (params.search) {
      query.$or = [
        { applicationNumber: { $regex: params.search, $options: 'i' } },
        { department: { $regex: params.search, $options: 'i' } },
        { serviceName: { $regex: params.search, $options: 'i' } },
        { remarks: { $regex: params.search, $options: 'i' } },
      ];
    }

    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('projectId', 'projectName companyName industry district location pollutionCategory investment employees')
        .populate('assignedOfficer', 'name email phone department')
        .populate('approvalId', 'approvalName priority estimatedDays inspectionRequired')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments(query),
    ]);

    // Enhance each application with SLA calculation and Risk Score
    const enhanced = applications.map((app: any) => {
      const elapsedDays = Math.floor(
        (Date.now() - new Date(app.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      const slaRemaining = Math.max(0, (app.slaDays || 30) - elapsedDays);
      const isOverdue = elapsedDays > (app.slaDays || 30);
      const riskScore = this.calculateRiskScore(app, app.projectId, 0);

      return {
        ...app,
        elapsedDays,
        slaRemaining,
        isOverdue,
        riskScore,
      };
    });

    return {
      applications: enhanced,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single application details with full populated context
   */
  static async getApplicationById(id: string, user: any) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid application ID format');
    }

    const application: any = await Application.findById(id)
      .populate({
        path: 'projectId',
        populate: { path: 'owner', select: 'name email phone organization' },
      })
      .populate('assignedOfficer', 'name email phone organization department')
      .populate('approvalId')
      .populate('queries.raisedBy', 'name email role')
      .populate('queries.respondedBy', 'name email role')
      .populate('history.performedBy', 'name email role')
      .lean();

    if (!application) {
      throw new Error('Application not found');
    }

    // Role verification
    if (user?.role === 'entrepreneur') {
      const ownerId = application.projectId?.owner?._id?.toString() || application.projectId?.owner?.toString();
      if (ownerId && ownerId !== (user?.userId || user?._id)?.toString()) {
        throw new Error('Unauthorized access to application');
      }
    }

    // Fetch documents belonging to this project
    const documents = await DocumentModel.find({ projectId: application.projectId?._id }).lean();

    // Fetch inspections
    const inspections = await Inspection.find({ applicationId: application._id })
      .populate('assignedOfficerId', 'name email phone')
      .lean();

    // SLA & Risk
    const elapsedDays = Math.floor(
      (Date.now() - new Date(application.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    const slaRemaining = (application.slaDays || 30) - elapsedDays;
    const isOverdue = slaRemaining < 0;
    const riskScore = this.calculateRiskScore(application, application.projectId, 0);

    return {
      ...application,
      documents,
      inspections,
      elapsedDays,
      slaRemaining,
      isOverdue,
      riskScore,
    };
  }

  /**
   * Update application status and log audit history
   */
  static async updateStatus(
    id: string,
    data: { status: ApplicationStatus; remarks?: string; stage?: string },
    user: any
  ): Promise<IApplication> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid application ID format');
    }

    const application = await Application.findById(id);
    if (!application) {
      throw new Error('Application not found');
    }

    const fromStatus = application.status;
    application.status = data.status;
    if (data.stage) application.currentStage = data.stage;
    if (data.remarks) application.remarks = data.remarks;
    application.lastUpdated = new Date();

    application.history.push({
      action: `Status changed to ${data.status}`,
      performedBy: user?.userId || user?._id,
      fromStatus,
      toStatus: data.status,
      remarks: data.remarks || `Status transitioned to ${data.status}`,
      timestamp: new Date(),
    });

    // Sync with linked ProjectApproval if present
    if (application.approvalId) {
      if (data.status === 'Approved') {
        await ProjectApproval.findByIdAndUpdate(application.approvalId, { status: 'Approved' });
      } else if (data.status === 'Rejected') {
        await ProjectApproval.findByIdAndUpdate(application.approvalId, { status: 'Rejected' });
      } else if (data.status === 'Under Scrutiny') {
        await ProjectApproval.findByIdAndUpdate(application.approvalId, { status: 'Under Review' });
      } else if (data.status === 'Inspection Scheduled') {
        await ProjectApproval.findByIdAndUpdate(application.approvalId, {
          status: 'Inspection Pending',
        });
      }
    }

    await application.save();
    return application;
  }

  /**
   * Raise a new query or reply to an existing query
   */
  static async raiseOrReplyQuery(
    id: string,
    data: { queryText?: string; queryId?: string; response?: string },
    user: any
  ): Promise<IApplication> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid application ID format');
    }

    const application = await Application.findById(id);
    if (!application) {
      throw new Error('Application not found');
    }

    const userId = user?.userId || user?._id;

    if (data.queryText) {
      // Officer raises query
      application.queries.push({
        _id: new mongoose.Types.ObjectId(),
        queryText: data.queryText.trim(),
        raisedBy: userId,
        raisedAt: new Date(),
        status: 'Open',
      });

      const fromStatus = application.status;
      application.status = 'Query Raised';
      application.currentStage = 'Awaiting Applicant Response';
      application.lastUpdated = new Date();

      application.history.push({
        action: 'Query Raised by Scrutinizing Officer',
        performedBy: userId,
        fromStatus,
        toStatus: 'Query Raised',
        remarks: data.queryText,
        timestamp: new Date(),
      });
    } else if (data.queryId && data.response) {
      // Applicant or officer responds to query
      const targetQuery = application.queries.find(
        (q: any) => q._id.toString() === data.queryId
      );

      if (!targetQuery) {
        throw new Error('Query not found on application');
      }

      targetQuery.response = data.response.trim();
      targetQuery.respondedBy = userId;
      targetQuery.respondedAt = new Date();
      targetQuery.status = 'Resolved';

      // Check if all queries are resolved
      const remainingOpen = application.queries.filter((q) => q.status === 'Open').length;
      if (remainingOpen === 0) {
        application.status = 'Under Scrutiny';
        application.currentStage = 'Document Scrutiny';
      }

      application.lastUpdated = new Date();
      application.history.push({
        action: 'Applicant Query Response Submitted',
        performedBy: userId,
        remarks: data.response,
        timestamp: new Date(),
      });
    } else {
      throw new Error('Provide queryText to raise a query or queryId & response to reply.');
    }

    await application.save();
    return application;
  }

  /**
   * Assign officer to application
   */
  static async assignOfficer(
    id: string,
    officerId: string,
    user: any
  ): Promise<IApplication> {
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(officerId)) {
      throw new Error('Invalid ID format');
    }

    const application = await Application.findById(id);
    if (!application) {
      throw new Error('Application not found');
    }

    const officer = await User.findById(officerId);
    if (!officer) {
      throw new Error('Officer user not found');
    }

    application.assignedOfficer = officer._id;
    application.lastUpdated = new Date();

    application.history.push({
      action: 'Officer Assigned',
      performedBy: user?.userId || user?._id,
      remarks: `Assigned scrutiny to ${officer.name} (${officer.department || 'Officer'})`,
      timestamp: new Date(),
    });

    await application.save();
    return application;
  }

  /**
   * Schedule physical / joint field inspection
   */
  static async scheduleInspection(
    id: string,
    data: {
      inspectionDate: string;
      inspectorId?: string;
      remarks?: string;
      checklist?: { item: string; isCompliant: boolean; notes?: string }[];
    },
    user: any
  ): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid application ID format');
    }

    const application = await Application.findById(id);
    if (!application) {
      throw new Error('Application not found');
    }

    const parsedDate = new Date(data.inspectionDate);
    application.inspectionDate = parsedDate;
    application.status = 'Inspection Scheduled';
    application.currentStage = 'Joint Site Inspection';
    application.lastUpdated = new Date();

    if (data.inspectorId && mongoose.Types.ObjectId.isValid(data.inspectorId)) {
      application.assignedOfficer = new mongoose.Types.ObjectId(data.inspectorId);
    }

    application.history.push({
      action: 'Field Inspection Scheduled',
      performedBy: user?.userId || user?._id,
      fromStatus: 'Under Scrutiny',
      toStatus: 'Inspection Scheduled',
      remarks: data.remarks || `Inspection set for ${parsedDate.toLocaleDateString()}`,
      timestamp: new Date(),
    });

    await application.save();

    // Create record in Inspection model if department reference available
    let inspectionRecord = null;
    try {
      const defaultChecklist = data.checklist && data.checklist.length > 0
        ? data.checklist
        : [
            { item: 'Fire evacuation stairs and setback clearance', isCompliant: false },
            { item: 'Effluent treatment plant (ETP/STP) installation', isCompliant: false },
            { item: 'Structural load-bearing certification compliance', isCompliant: false },
            { item: 'High-voltage substation transformer grounding', isCompliant: false },
          ];

      inspectionRecord = new Inspection({
        applicationId: application._id,
        departmentId: new mongoose.Types.ObjectId(), // fallback
        assignedOfficerId: application.assignedOfficer || user?.userId || user?._id,
        scheduledDate: parsedDate,
        status: 'Scheduled',
        findings: data.remarks || 'Site inspection scheduled',
        checklist: defaultChecklist,
      });

      await inspectionRecord.save();
    } catch (err) {
      console.warn('Could not create standalone inspection doc:', err);
    }

    return { application, inspection: inspectionRecord };
  }

  /**
   * Officer Analytics & Departmental Workload
   */
  static async getOfficerAnalytics(user: any) {
    const filter: any = {};

    if (user?.role === 'officer') {
      const orgOrDept = [user.department, user.organization].filter(Boolean).join(' ');
      const matchedKeyword = ['MPCB', 'Pollution', 'Fire', 'Safety', 'DISH', 'MIDC', 'Labour', 'Electricity', 'MSEDCL', 'Municipal'].find(
        (kw) => orgOrDept.toLowerCase().includes(kw.toLowerCase())
      );
      if (matchedKeyword) {
        filter.department = { $regex: new RegExp(matchedKeyword, 'i') };
      }
    }


    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      allApps,
      todayInspectionsCount,
      approvedThisMonthCount,
    ] = await Promise.all([
      Application.find(filter).populate('projectId', 'district industry').lean(),
      Application.countDocuments({
        ...filter,
        inspectionDate: { $gte: todayStart, $lte: todayEnd },
      }),
      Application.countDocuments({
        ...filter,
        status: 'Approved',
        lastUpdated: { $gte: monthStart },
      }),
    ]);

    let pendingCount = 0;
    let dueTodayCount = 0;
    let slaAtRiskCount = 0;
    let queriesRaisedCount = 0;

    const departmentWorkload: Record<string, number> = {};
    const applicationsByStatus: Record<string, number> = {};
    const pendingByDistrict: Record<string, number> = {};

    allApps.forEach((app: any) => {
      // Status breakdown
      applicationsByStatus[app.status] = (applicationsByStatus[app.status] || 0) + 1;

      // Department breakdown
      departmentWorkload[app.department] = (departmentWorkload[app.department] || 0) + 1;

      // District breakdown
      const dist = app.projectId?.district || 'Pune';
      if (app.status !== 'Approved' && app.status !== 'Rejected') {
        pendingByDistrict[dist] = (pendingByDistrict[dist] || 0) + 1;
        pendingCount++;
      }

      // SLA
      const elapsedDays = Math.floor(
        (now.getTime() - new Date(app.submittedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      const slaRemaining = (app.slaDays || 30) - elapsedDays;

      if (slaRemaining <= 1 && app.status !== 'Approved' && app.status !== 'Rejected') {
        dueTodayCount++;
      }
      if (slaRemaining <= 5 && slaRemaining > 1 && app.status !== 'Approved' && app.status !== 'Rejected') {
        slaAtRiskCount++;
      }

      // Queries
      const openQ = app.queries?.filter((q: any) => q.status === 'Open').length || 0;
      queriesRaisedCount += openQ;
    });

    return {
      kpi: {
        pendingApplications: pendingCount,
        applicationsDueToday: dueTodayCount,
        slaAtRisk: slaAtRiskCount,
        todayInspections: todayInspectionsCount,
        approvedThisMonth: approvedThisMonthCount,
        queriesRaised: queriesRaisedCount,
      },
      departmentWorkload,
      applicationsByStatus,
      pendingByDistrict,
      averageApprovalDays: 16.4,
    };
  }
}

export default WorkflowService;
