import { InspectionStatus, IInspection } from '../models/Inspection';
import { ChecklistItemStatus, IInspectionChecklist } from '../models/InspectionChecklist';

export { InspectionStatus, ChecklistItemStatus };

export interface CreateChecklistItemDTO {
  item: string;
  status?: ChecklistItemStatus;
  remarks?: string;
}

export interface CreateInspectionDTO {
  project: string;
  application?: string;
  department: string;
  assignedInspector: string;
  inspectionDate: string | Date;
  inspectionTime?: string;
  inspectionType?: string;
  status?: InspectionStatus;
  remarks?: string;
  location?: string;
  documentsVerified?: string[];
  photos?: string[];
  checklist?: CreateChecklistItemDTO[];
}

export interface UpdateInspectionDTO {
  department?: string;
  assignedInspector?: string;
  inspectionDate?: string | Date;
  inspectionTime?: string;
  inspectionType?: string;
  remarks?: string;
  findings?: string;
  documentsVerified?: string[];
  photos?: string[];
  location?: string;
  checklist?: {
    _id?: string;
    item: string;
    status?: ChecklistItemStatus;
    remarks?: string;
  }[];
}

export interface UpdateInspectionStatusDTO {
  status: InspectionStatus;
  remarks?: string;
  findings?: string;
  documentsVerified?: string[];
  photos?: string[];
}

export interface RescheduleInspectionDTO {
  inspectionDate: string | Date;
  inspectionTime?: string;
  reason: string;
}

export interface CancelInspectionDTO {
  reason: string;
}

export interface AssignInspectorDTO {
  assignedInspector: string;
  remarks?: string;
}

export interface InspectionFilterParams {
  project?: string;
  application?: string;
  department?: string;
  assignedInspector?: string;
  status?: InspectionStatus | 'ALL';
  inspectionType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface InspectionDetailsResponse {
  inspection: IInspection;
  checklist: IInspectionChecklist[];
  history: any[];
}
