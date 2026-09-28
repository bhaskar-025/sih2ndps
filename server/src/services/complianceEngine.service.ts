import { Compliance, ICompliance, ComplianceStatus } from '../models/Compliance';
import { complianceRepository } from '../repositories/compliance.repository';
import { EngineEvaluationResult } from '../types/compliance.types';
import { Logger } from '../utils/logger';

export class ComplianceEngineService {
  /**
   * Determine renewal eligibility and window metrics for a compliance record
   */
  getRenewalEligibility(
    compliance: ICompliance,
    referenceDate: Date = new Date()
  ): {
    isEligible: boolean;
    daysUntilWindow: number;
    daysRemaining: number;
    windowDays: number;
    reason: string;
  } {
    if (!compliance.renewalRequired) {
      return {
        isEligible: false,
        daysUntilWindow: 999,
        daysRemaining: 999,
        windowDays: 0,
        reason: 'Statutory renewal not mandatory for this one-time clearance/filing',
      };
    }

    const now = referenceDate.getTime();
    const dueTime = new Date(compliance.nextDueDate).getTime();
    const daysRemaining = Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));
    const windowDays = compliance.renewalWindowDays || 30;

    // Eligible if within the window before due date, or even if overdue
    if (daysRemaining <= windowDays) {
      return {
        isEligible: true,
        daysUntilWindow: 0,
        daysRemaining,
        windowDays,
        reason:
          daysRemaining <= 0
            ? 'Compliance is overdue and eligible for immediate overdue renewal / penalty regularization'
            : `Within statutory renewal window (${daysRemaining} days remaining, window is ${windowDays} days)`,
      };
    }

    const daysUntilWindow = daysRemaining - windowDays;
    return {
      isEligible: false,
      daysUntilWindow,
      daysRemaining,
      windowDays,
      reason: `Renewal window opens in ${daysUntilWindow} days (${windowDays} days prior to due date)`,
    };
  }

  /**
   * Compute the status transition for an individual compliance record
   */
  evaluateCompliance(
    compliance: ICompliance,
    referenceDate: Date = new Date()
  ): {
    shouldUpdate: boolean;
    newStatus: ComplianceStatus;
    reason: string;
  } {
    // If compliance is already marked Completed and not a renewal pending cycle, retain it
    if (compliance.status === 'Completed') {
      return { shouldUpdate: false, newStatus: 'Completed', reason: 'Already completed' };
    }

    const now = referenceDate.getTime();
    const dueTime = new Date(compliance.nextDueDate).getTime();
    const daysRemaining = Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));
    const windowDays = compliance.renewalWindowDays || 30;

    let targetStatus: ComplianceStatus;
    let reason: string;

    if (daysRemaining < 0) {
      targetStatus = 'Overdue';
      reason = `Statutory due date expired ${Math.abs(daysRemaining)} days ago`;
    } else if (compliance.renewalRequired && daysRemaining <= windowDays) {
      // Prioritize renewal pending when inside the renewal window
      targetStatus = 'Renewal Pending';
      reason = `Within statutory renewal window (${daysRemaining} days remaining)`;
    } else if (daysRemaining <= 30) {
      targetStatus = 'Due Soon';
      reason = `Due date approaching within 30 days (${daysRemaining} days remaining)`;
    } else {
      targetStatus = 'Upcoming';
      reason = `Next statutory filing scheduled in ${daysRemaining} days`;
    }

    const shouldUpdate = compliance.status !== targetStatus;
    return { shouldUpdate, newStatus: targetStatus, reason };
  }

  /**
   * Scan and evaluate all active compliances statewide or across all projects
   */
  async evaluateAllCompliances(referenceDate: Date = new Date()): Promise<EngineEvaluationResult> {
    const compliances = await Compliance.find({ isDeleted: false, status: { $ne: 'Completed' } });

    let updatedCount = 0;
    const statusTransitions: EngineEvaluationResult['statusTransitions'] = [];

    for (const comp of compliances) {
      const evaluation = this.evaluateCompliance(comp, referenceDate);
      if (evaluation.shouldUpdate) {
        const prevStatus = comp.status;
        comp.status = evaluation.newStatus;
        comp.history.push({
          action: 'AUTOMATED_ENGINE_STATUS_EVALUATION',
          previousStatus: prevStatus,
          newStatus: evaluation.newStatus,
          remarks: evaluation.reason,
          timestamp: new Date(),
        });
        await comp.save();

        updatedCount++;
        statusTransitions.push({
          id: comp._id.toString(),
          name: comp.complianceName,
          from: prevStatus,
          to: evaluation.newStatus,
          reason: evaluation.reason,
        });
      }
    }

    // Get aggregate counts
    const upcomingRenewals = await this.getUpcomingRenewals(undefined, referenceDate);
    const dueIn30Days = await this.getDueInNext30Days(undefined, referenceDate);
    const expired = await this.getExpiredCompliances(undefined, referenceDate);

    Logger.info(
      `Compliance Engine evaluated ${compliances.length} items, updated ${updatedCount} statuses.`
    );

    return {
      evaluatedCount: compliances.length,
      updatedCount,
      statusTransitions,
      upcomingRenewalsCount: upcomingRenewals.length,
      dueIn30DaysCount: dueIn30Days.length,
      expiredCount: expired.length,
      evaluatedAt: new Date().toISOString(),
    };
  }

  /**
   * Evaluate compliances scoped to a specific industrial project
   */
  async evaluateProjectCompliances(
    projectId: string,
    referenceDate: Date = new Date()
  ): Promise<EngineEvaluationResult> {
    const compliances = await complianceRepository.findByProject(projectId, {
      status: { $ne: 'Completed' },
    });

    let updatedCount = 0;
    const statusTransitions: EngineEvaluationResult['statusTransitions'] = [];

    for (const comp of compliances) {
      const evaluation = this.evaluateCompliance(comp, referenceDate);
      if (evaluation.shouldUpdate) {
        const prevStatus = comp.status;
        comp.status = evaluation.newStatus;
        comp.history.push({
          action: 'AUTOMATED_ENGINE_STATUS_EVALUATION',
          previousStatus: prevStatus,
          newStatus: evaluation.newStatus,
          remarks: evaluation.reason,
          timestamp: new Date(),
        });
        await comp.save();

        updatedCount++;
        statusTransitions.push({
          id: comp._id.toString(),
          name: comp.complianceName,
          from: prevStatus,
          to: evaluation.newStatus,
          reason: evaluation.reason,
        });
      }
    }

    const upcomingRenewals = await this.getUpcomingRenewals(projectId, referenceDate);
    const dueIn30Days = await this.getDueInNext30Days(projectId, referenceDate);
    const expired = await this.getExpiredCompliances(projectId, referenceDate);

    return {
      evaluatedCount: compliances.length,
      updatedCount,
      statusTransitions,
      upcomingRenewalsCount: upcomingRenewals.length,
      dueIn30DaysCount: dueIn30Days.length,
      expiredCount: expired.length,
      evaluatedAt: new Date().toISOString(),
    };
  }

  /**
   * Find all compliances requiring renewal where current date is within renewalWindowDays
   */
  async getUpcomingRenewals(
    projectId?: string,
    referenceDate: Date = new Date()
  ): Promise<ICompliance[]> {
    const filter: any = {
      isDeleted: false,
      renewalRequired: true,
      status: { $ne: 'Completed' },
    };

    if (projectId) {
      filter.projectId = projectId;
    }

    const candidates = await Compliance.find(filter)
      .populate('projectId', 'projectName companyName district')
      .sort({ nextDueDate: 1 });

    return candidates.filter((c) => {
      const eligibility = this.getRenewalEligibility(c, referenceDate);
      return eligibility.isEligible;
    });
  }

  /**
   * Find compliances due within the next 30 days
   */
  async getDueInNext30Days(
    projectId?: string,
    referenceDate: Date = new Date()
  ): Promise<ICompliance[]> {
    const startDate = new Date(referenceDate);
    const endDate = new Date(referenceDate);
    endDate.setDate(endDate.getDate() + 30);

    return await complianceRepository.findDueBetween(startDate, endDate, projectId);
  }

  /**
   * Find all expired / overdue compliances
   */
  async getExpiredCompliances(
    projectId?: string,
    referenceDate: Date = new Date()
  ): Promise<ICompliance[]> {
    return await complianceRepository.findExpired(referenceDate, projectId);
  }

  /**
   * Calculate next recurring due date based on frequency
   */
  computeNextRecurringDueDate(currentDueDate: Date, frequency: string): Date {
    const nextDate = new Date(currentDueDate);
    switch (frequency) {
      case 'Monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'Quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'Half-Yearly':
        nextDate.setMonth(nextDate.getMonth() + 6);
        break;
      case 'Annual':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      case 'Biennial':
        nextDate.setFullYear(nextDate.getFullYear() + 2);
        break;
      case 'One-Time':
      default:
        // One-time doesn't advance
        break;
    }
    return nextDate;
  }
}

export const complianceEngineService = new ComplianceEngineService();
export default complianceEngineService;
