import { Compliance, ICompliance } from '../models/Compliance';
import { ComplianceReminder, ReminderType } from '../types/compliance.types';

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export class ReminderService {
  /**
   * Determine reminder type and payload for a single compliance record
   */
  generateReminderForCompliance(
    compliance: ICompliance,
    referenceDate: Date = new Date()
  ): ComplianceReminder | null {
    if (compliance.status === 'Completed' || compliance.isDeleted) {
      return null;
    }

    const now = referenceDate.getTime();
    const dueTime = new Date(compliance.nextDueDate).getTime();
    const daysRemaining = Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));

    let reminderType: ReminderType | null = null;
    let urgency = compliance.priority || 'Medium';
    let message = '';
    let actionRequired = '';

    if (daysRemaining < 0) {
      reminderType = 'OVERDUE';
      urgency = 'Critical';
      message = `CRITICAL STATUTORY NOTICE: ${compliance.complianceName} under ${compliance.department} expired ${Math.abs(daysRemaining)} days ago. Penalty risk: ${compliance.penaltyRisk}.`;
      actionRequired = 'Submit overdue filing and compliance documentation immediately to avert regulatory penalties or license suspension.';
    } else if (daysRemaining <= 1) {
      reminderType = '1_DAY';
      urgency = 'Critical';
      message = `URGENT 24-HOUR NOTICE: ${compliance.complianceName} is due ${daysRemaining === 0 ? 'today' : 'tomorrow'} (${formatDate(compliance.nextDueDate)}).`;
      actionRequired = 'Complete filing and upload mandatory compliance proofs on MAITRI+ portal immediately.';
    } else if (daysRemaining <= 7) {
      reminderType = '7_DAYS';
      urgency = 'High';
      message = `7-DAY STATUTORY REMINDER: ${compliance.complianceName} for ${compliance.department} due in ${daysRemaining} days (${formatDate(compliance.nextDueDate)}).`;
      actionRequired = 'Gather required documents and submit filing before the statutory deadline.';
    } else if (daysRemaining <= 15) {
      reminderType = '15_DAYS';
      urgency = 'Medium';
      message = `15-DAY COMPLIANCE NOTICE: ${compliance.complianceName} due on ${formatDate(compliance.nextDueDate)} (${daysRemaining} days remaining).`;
      actionRequired = 'Initiate document verification and preparation of compliance docket.';
    } else if (daysRemaining <= 30) {
      reminderType = '30_DAYS';
      urgency = 'Low';
      message = `30-DAY STATUTORY ADVISORY: Upcoming renewal/filing for ${compliance.complianceName} due on ${formatDate(compliance.nextDueDate)}.`;
      actionRequired = 'Review mandatory submission checklist and check document vault readiness.';
    } else {
      // More than 30 days away - no active threshold reminder generated
      return null;
    }

    const project = compliance.projectId as any;
    const projectName = project?.projectName || 'Industrial Project';
    const companyName = project?.companyName || 'Industrial Unit';

    return {
      complianceId: compliance._id.toString(),
      complianceName: compliance.complianceName,
      projectId: project?._id?.toString() || (compliance.projectId as any).toString(),
      projectName,
      companyName,
      department: compliance.department,
      nextDueDate: compliance.nextDueDate,
      daysRemaining,
      reminderType,
      urgency,
      penaltyRisk: compliance.penaltyRisk,
      message,
      actionRequired,
      documentsRequired: compliance.documentsRequired || [],
    };
  }

  /**
   * Generate all reminders for a specific project
   */
  async generateProjectReminders(
    projectId: string,
    referenceDate: Date = new Date()
  ): Promise<ComplianceReminder[]> {
    const compliances = await Compliance.find({
      projectId,
      isDeleted: false,
      status: { $ne: 'Completed' },
    })
      .populate('projectId', 'projectName companyName district')
      .sort({ nextDueDate: 1 });

    const reminders: ComplianceReminder[] = [];
    for (const comp of compliances) {
      const reminder = this.generateReminderForCompliance(comp, referenceDate);
      if (reminder) {
        reminders.push(reminder);
      }
    }

    return reminders;
  }

  /**
   * Generate all active reminders statewide / across all projects
   */
  async generateAllActiveReminders(
    referenceDate: Date = new Date()
  ): Promise<ComplianceReminder[]> {
    const compliances = await Compliance.find({
      isDeleted: false,
      status: { $ne: 'Completed' },
    })
      .populate('projectId', 'projectName companyName district')
      .sort({ nextDueDate: 1 });

    const reminders: ComplianceReminder[] = [];
    for (const comp of compliances) {
      const reminder = this.generateReminderForCompliance(comp, referenceDate);
      if (reminder) {
        reminders.push(reminder);
      }
    }

    return reminders;
  }
}

export const reminderService = new ReminderService();
export default reminderService;
