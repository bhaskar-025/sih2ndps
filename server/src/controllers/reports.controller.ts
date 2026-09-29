import { Request, Response } from 'express';
import { Application } from '../models/Application';
import { Project } from '../models/Project';
import { Inspection } from '../models/Inspection';
import { Department } from '../models/Department';
import { ApiResponse } from '../utils/apiResponse';
import { Logger } from '../utils/logger';

export class ReportsController {
  /**
   * @route GET /api/v1/reports/export/:type
   * @desc Export data in CSV format (applications, projects, inspections, departments)
   */
  static async exportData(req: Request, res: Response): Promise<void> {
    try {
      const type = req.params.type;
      const format = (req.query.format as string) || 'csv';

      if (type === 'applications') {
        const apps = await Application.find({})
          .populate('projectId', 'projectName companyName industry district investment')
          .populate('assignedOfficer', 'name department')
          .sort({ submittedAt: -1 })
          .lean();

        if (format === 'json') {
          res.json({ success: true, data: apps });
          return;
        }

        // CSV generation
        const headers = 'Application Number,Project Name,Company Name,Department,Industry,District,Investment (Lakhs),Status,Priority,SLA Days,Submitted Date,Assigned Officer\n';
        const rows = apps.map((a: any) => {
          const p = a.projectId || {};
          const off = a.assignedOfficer || {};
          return `"${a.applicationNumber}","${p.projectName || ''}","${p.companyName || ''}","${a.department || ''}","${p.industry || ''}","${p.district || ''}","${p.investment || 0}","${a.status}","${a.priority}","${a.slaDays}","${new Date(a.submittedAt).toLocaleDateString()}","${off.name || 'Unassigned'}"`;
        }).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=applications_report_${Date.now()}.csv`);
        res.status(200).send(headers + rows);
        return;
      }

      if (type === 'projects') {
        const projects = await Project.find({}).sort({ createdAt: -1 }).lean();

        if (format === 'json') {
          res.json({ success: true, data: projects });
          return;
        }

        const headers = 'Project Name,Company Name,Industry,District,Location,Investment (Lakhs),Employees,Pollution Category,Status,Stage,Created Date\n';
        const rows = projects.map((p: any) => {
          return `"${p.projectName}","${p.companyName}","${p.industry}","${p.district}","${p.location}","${p.investment}","${p.employees}","${p.pollutionCategory}","${p.status}","${p.projectStage}","${new Date(p.createdAt).toLocaleDateString()}"`;
        }).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=industrial_units_report_${Date.now()}.csv`);
        res.status(200).send(headers + rows);
        return;
      }

      if (type === 'inspections') {
        const inspections = await Inspection.find({})
          .populate('applicationId', 'applicationNumber department')
          .populate('assignedOfficerId', 'name department')
          .sort({ scheduledDate: -1 })
          .lean();

        if (format === 'json') {
          res.json({ success: true, data: inspections });
          return;
        }

        const headers = 'Application Number,Department,Scheduled Date,Status,Assigned Inspector,Findings,Checklist Items\n';
        const rows = inspections.map((i: any) => {
          const app = i.applicationId || {};
          const off = i.assignedOfficerId || {};
          return `"${app.applicationNumber || 'N/A'}","${app.department || 'Statutory Authority'}","${new Date(i.scheduledDate).toLocaleDateString()}","${i.status}","${off.name || 'Unassigned'}","${(i.findings || '').replace(/"/g, '""')}","${i.checklist?.length || 0} items"`;
        }).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=inspections_report_${Date.now()}.csv`);
        res.status(200).send(headers + rows);
        return;
      }

      res.status(400).json({ success: false, message: 'Invalid report type' });
    } catch (error: any) {
      Logger.error(`Error in exportData: ${error.message}`);
      res.status(500).json({ success: false, message: error.message || 'Export failed' });
    }
  }

  /**
   * @route GET /api/v1/reports/summary
   * @desc Comprehensive multi-dimensional analytics for government dossiers
   */
  static async getSummaryReport(_req: Request, res: Response): Promise<void> {
    try {
      const [appsCount, projectsCount, approvedCount, departments] = await Promise.all([
        Application.countDocuments({}),
        Project.countDocuments({}),
        Application.countDocuments({ status: 'Approved' }),
        Department.find({ isActive: true }).select('name approvalTypes averageProcessingDays').lean(),
      ]);

      const districtAgg = await Project.aggregate([
        { $group: { _id: '$district', units: { $sum: 1 }, totalInvestment: { $sum: '$investment' }, totalEmployees: { $sum: '$employees' } } },
        { $sort: { totalInvestment: -1 } },
      ]);

      const industryAgg = await Project.aggregate([
        { $group: { _id: '$industry', count: { $sum: 1 }, totalInvestment: { $sum: '$investment' } } },
        { $sort: { count: -1 } },
      ]);

      ApiResponse.success(
        res,
        {
          overview: {
            totalApplications: appsCount,
            totalIndustrialUnits: projectsCount,
            totalApprovalsIssued: approvedCount,
            stateClearanceRate: appsCount > 0 ? `${Math.round((approvedCount / appsCount) * 100)}%` : '100%',
          },
          districtAnalytics: districtAgg,
          industryAnalytics: industryAgg,
          departmentProfiles: departments,
        },
        'State industrial intelligence report compiled'
      );
    } catch (error: any) {
      Logger.error(`Error in getSummaryReport: ${error.message}`);
      res.status(500).json({ success: false, message: error.message || 'Failed to compile summary report' });
    }
  }
}

export default ReportsController;
