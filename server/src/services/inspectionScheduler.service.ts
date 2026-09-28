import mongoose from 'mongoose';
import { Inspection, IInspection } from '../models/Inspection';
import { Application } from '../models/Application';
import { User } from '../models/User';
import { inspectionRepository } from '../repositories/inspection.repository';
import { ApiError } from '../utils/apiError';
import { Logger } from '../utils/logger';

export class InspectionSchedulerService {
  /**
   * Assign an inspector to an inspection
   */
  async assignInspector(
    inspectionId: string,
    inspectorId: string,
    remarks?: string,
    performedBy?: string
  ): Promise<IInspection> {
    const inspection = await inspectionRepository.findById(inspectionId);
    if (!inspection) {
      throw ApiError.notFound(`Inspection with ID ${inspectionId} not found`);
    }

    const inspector = await User.findOne({ _id: inspectorId, isActive: true });
    if (!inspector) {
      throw ApiError.notFound(`Inspector user with ID ${inspectorId} not found or is inactive`);
    }

    const previousInspector = inspection.assignedInspector;

    const historyEntry = {
      action: 'INSPECTOR_ASSIGNED',
      performedBy: performedBy ? new mongoose.Types.ObjectId(performedBy) : undefined,
      remarks: remarks || `Assigned to inspector ${inspector.name} (${inspector.department || inspection.department})`,
      previousStatus: inspection.status,
      newStatus: inspection.status,
      timestamp: new Date(),
    };

    const updated = await inspectionRepository.update(inspectionId, {
      assignedInspector: new mongoose.Types.ObjectId(inspectorId),
    });

    if (!updated) {
      throw ApiError.internal('Failed to assign inspector');
    }

    await inspectionRepository.addHistory(inspectionId, historyEntry);
    Logger.info(`Inspection ${inspectionId} inspector assigned: ${inspector.name}`);
    return updated;
  }

  /**
   * Reschedule an inspection with new date/time and reason
   */
  async rescheduleInspection(
    inspectionId: string,
    newDate: Date | string,
    newTime?: string,
    reason?: string,
    performedBy?: string
  ): Promise<IInspection> {
    const inspection = await inspectionRepository.findById(inspectionId);
    if (!inspection) {
      throw ApiError.notFound(`Inspection with ID ${inspectionId} not found`);
    }

    if (inspection.status === 'Completed' || inspection.status === 'Cancelled') {
      throw ApiError.badRequest(`Cannot reschedule an inspection that is already ${inspection.status}`);
    }

    const previousDate = inspection.inspectionDate;
    const previousTime = inspection.inspectionTime;
    const targetDate = new Date(newDate);

    const historyEntry = {
      action: 'INSPECTION_RESCHEDULED',
      performedBy: performedBy ? new mongoose.Types.ObjectId(performedBy) : undefined,
      previousStatus: inspection.status,
      newStatus: 'Rescheduled',
      remarks: `Rescheduled from ${previousDate.toISOString().split('T')[0]} ${previousTime} to ${targetDate.toISOString().split('T')[0]} ${newTime || previousTime}. Reason: ${reason || 'Operational adjustment'}`,
      timestamp: new Date(),
    };

    const updatePayload: Partial<IInspection> = {
      inspectionDate: targetDate,
      status: 'Rescheduled',
    };
    if (newTime) {
      updatePayload.inspectionTime = newTime;
    }
    if (reason) {
      updatePayload.remarks = reason;
    }

    const updated = await inspectionRepository.update(inspectionId, updatePayload);
    if (!updated) {
      throw ApiError.internal('Failed to reschedule inspection');
    }

    await inspectionRepository.addHistory(inspectionId, historyEntry);

    // If associated with an Application, synchronize application inspectionDate
    if (inspection.application) {
      await Application.updateOne(
        { _id: inspection.application },
        {
          $set: { inspectionDate: targetDate },
          $push: {
            history: {
              action: 'INSPECTION_RESCHEDULED',
              performedBy: performedBy ? new mongoose.Types.ObjectId(performedBy) : undefined,
              remarks: `Field inspection rescheduled to ${targetDate.toISOString().split('T')[0]}`,
              timestamp: new Date(),
            },
          },
        }
      );
    }

    Logger.info(`Inspection ${inspectionId} rescheduled to ${targetDate.toISOString()}`);
    return updated;
  }

  /**
   * Cancel an inspection with mandatory cancellation reason
   */
  async cancelInspection(
    inspectionId: string,
    reason: string,
    performedBy?: string
  ): Promise<IInspection> {
    const inspection = await inspectionRepository.findById(inspectionId);
    if (!inspection) {
      throw ApiError.notFound(`Inspection with ID ${inspectionId} not found`);
    }

    if (inspection.status === 'Completed') {
      throw ApiError.badRequest('Cannot cancel an inspection that has already been completed');
    }

    const previousStatus = inspection.status;

    const historyEntry = {
      action: 'INSPECTION_CANCELLED',
      performedBy: performedBy ? new mongoose.Types.ObjectId(performedBy) : undefined,
      previousStatus,
      newStatus: 'Cancelled',
      remarks: `Cancellation rationale: ${reason}`,
      timestamp: new Date(),
    };

    const updated = await inspectionRepository.update(inspectionId, {
      status: 'Cancelled',
      remarks: reason,
    });

    if (!updated) {
      throw ApiError.internal('Failed to cancel inspection');
    }

    await inspectionRepository.addHistory(inspectionId, historyEntry);

    // Notify/update linked application if present
    if (inspection.application) {
      await Application.updateOne(
        { _id: inspection.application },
        {
          $push: {
            history: {
              action: 'INSPECTION_CANCELLED',
              performedBy: performedBy ? new mongoose.Types.ObjectId(performedBy) : undefined,
              remarks: `Scheduled inspection cancelled: ${reason}`,
              timestamp: new Date(),
            },
          },
        }
      );
    }

    Logger.info(`Inspection ${inspectionId} cancelled`);
    return updated;
  }

  /**
   * Complete inspection with findings, remarks, verified documents, and site photos
   */
  async completeInspection(
    inspectionId: string,
    data: {
      findings?: string;
      remarks?: string;
      documentsVerified?: string[];
      photos?: string[];
    },
    performedBy?: string
  ): Promise<IInspection> {
    const inspection = await inspectionRepository.findById(inspectionId);
    if (!inspection) {
      throw ApiError.notFound(`Inspection with ID ${inspectionId} not found`);
    }

    if (inspection.status === 'Cancelled') {
      throw ApiError.badRequest('Cannot complete a cancelled inspection');
    }

    const previousStatus = inspection.status;

    const historyEntry = {
      action: 'INSPECTION_COMPLETED',
      performedBy: performedBy ? new mongoose.Types.ObjectId(performedBy) : undefined,
      previousStatus,
      newStatus: 'Completed',
      remarks: data.remarks || 'Site inspection completed with findings recorded',
      timestamp: new Date(),
    };

    const updatePayload: Partial<IInspection> = {
      status: 'Completed',
      findings: data.findings || inspection.findings || '',
      remarks: data.remarks || inspection.remarks || '',
    };

    if (data.documentsVerified) {
      updatePayload.documentsVerified = data.documentsVerified;
    }
    if (data.photos) {
      updatePayload.photos = data.photos;
    }

    const updated = await inspectionRepository.update(inspectionId, updatePayload);
    if (!updated) {
      throw ApiError.internal('Failed to complete inspection');
    }

    await inspectionRepository.addHistory(inspectionId, historyEntry);

    // If associated with an Application, advance application status to 'Inspection Completed'
    if (inspection.application) {
      await Application.updateOne(
        { _id: inspection.application },
        {
          $set: {
            status: 'Inspection Completed',
            currentStage: 'Post-Inspection Review',
          },
          $push: {
            history: {
              action: 'INSPECTION_COMPLETED',
              performedBy: performedBy ? new mongoose.Types.ObjectId(performedBy) : undefined,
              fromStatus: 'Inspection Scheduled',
              toStatus: 'Inspection Completed',
              remarks: data.findings || 'Site inspection findings submitted by officer',
              timestamp: new Date(),
            },
          },
        }
      );
    }

    Logger.info(`Inspection ${inspectionId} marked completed`);
    return updated;
  }
}

export const inspectionSchedulerService = new InspectionSchedulerService();
export default inspectionSchedulerService;
