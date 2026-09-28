import mongoose from 'mongoose';
import { IAuditLog } from '../models/AuditLog';
import { IApplication } from '../models/Application';

export interface IAuditLogFilterParams {
  entity?: string;
  action?: string;
  user?: string;
  userId?: string;
  entityId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface IAuditLogCreateDTO {
  user?: mongoose.Types.ObjectId | string | null;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export interface IWorkflowTransitionItem {
  action: string;
  performedBy?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
  } | null;
  fromStatus?: string;
  toStatus?: string;
  fromStage?: string;
  toStage?: string;
  remarks?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  durationInPreviousStageFormatted?: string;
}

export interface IWorkflowHistoryResponse {
  application: {
    _id: string;
    applicationNumber: string;
    project: any;
    department: string;
    assignedOfficer: any;
    status: string;
    currentStage: string;
    priority: string;
    slaDays: number;
    submittedAt: Date;
    lastUpdated: Date;
    inspectionDate?: Date;
    remarks?: string;
  };
  slaAnalytics: {
    slaDays: number;
    elapsedDays: number;
    remainingDays: number;
    isBreached: boolean;
    urgencyLevel: 'Normal' | 'Approaching Deadline' | 'Overdue';
  };
  totalTransitions: number;
  stateTransitions: IWorkflowTransitionItem[];
  auditTrail: IAuditLog[];
  queries: any[];
}
