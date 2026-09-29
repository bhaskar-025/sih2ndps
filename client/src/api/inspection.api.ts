import { apiClient } from './client';
import mockInspectionsData from './mockData/mockInspections.json';

export interface InspectionScheduleData {
  applicationId: string;
  projectId?: string;
  inspectorId?: string;
  scheduledDate: string;
  remarks?: string;
}

export interface InspectionCompleteData {
  result: 'Pass' | 'Fail' | 'Conditional';
  remarks: string;
  checklist?: { item: string; passed: boolean }[];
  geoTag?: string;
  photos?: string[];
}

export const inspectionApi = {
  /**
   * Fetches field inspections list
   */
  async getInspections(params?: { status?: string; date?: string }): Promise<any[]> {
    return apiClient.executeWithFallback(
      () => apiClient.get('/inspections', { params }),
      () => {
        let list = [...mockInspectionsData];
        if (params?.status && params.status !== 'ALL') {
          list = list.filter((i) => i.status === params.status);
        }
        return list;
      },
      'inspections'
    );
  },

  /**
   * Schedules a new statutory field audit
   */
  async scheduleInspection(data: InspectionScheduleData): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.post('/inspections', data),
      () => ({
        _id: `insp-${Date.now()}`,
        ...data,
        status: 'Scheduled',
        geoTag: '18.5204° N, 73.8567° E (Auto-geotagged)',
        gpsStatus: 'GPS Matched (Accuracy 5m)',
        checklist: [
          { item: 'Effluent Treatment Plant (ETP) capacity validation', passed: true },
          { item: 'Hazardous chemical storage isolation barrier check', passed: true },
          { item: 'Fire safety hydrants and emergency assembly point setup', passed: true }
        ],
        createdAt: new Date().toISOString()
      }),
      'inspections'
    );
  },

  /**
   * Reschedules an existing field audit
   */
  async rescheduleInspection(id: string, scheduledDate: string, remarks?: string): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.patch(`/inspections/${id}/reschedule`, { scheduledDate, remarks }),
      () => {
        const found = mockInspectionsData.find((i) => i._id === id);
        return { ...found, scheduledDate, remarks, status: 'Scheduled', updatedAt: new Date().toISOString() };
      },
      `inspections/${id}/reschedule`
    );
  },

  /**
   * Completes an inspection and logs official result
   */
  async completeInspection(id: string, data: InspectionCompleteData): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.post(`/inspections/${id}/report`, data),
      () => {
        const found = mockInspectionsData.find((i) => i._id === id);
        return {
          ...found,
          status: 'Completed',
          result: data.result,
          remarks: data.remarks,
          checklist: data.checklist || found?.checklist,
          reportUrl: '/reports/inspection_report_cleared.pdf',
          completedAt: new Date().toISOString()
        };
      },
      `inspections/${id}/report`
    );
  },

  /**
   * Cancels a scheduled inspection
   */
  async cancelInspection(id: string, reason: string): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.post(`/inspections/${id}/cancel`, { reason }),
      () => ({ success: true, status: 'Cancelled', cancelReason: reason }),
      `inspections/${id}/cancel`
    );
  },

  /**
   * Uploads inspection report document
   */
  async uploadInspectionReport(id: string, formData: FormData): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.post(`/inspections/${id}/upload-report`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
      () => ({ success: true, reportUrl: '/uploads/reports/inspection_report.pdf' }),
      `inspections/${id}/upload-report`
    );
  }
};

export const getInspections = inspectionApi.getInspections;
