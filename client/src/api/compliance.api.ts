import { apiClient } from './client';
import mockComplianceData from './mockData/mockCompliance.json';

export interface ComplianceItem {
  _id: string;
  projectId: string;
  complianceName: string;
  department: string;
  frequency: string;
  nextDueDate: string;
  status: 'Upcoming' | 'Overdue' | 'Due Soon' | 'Renewal' | 'Completed';
  penaltyRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  penaltyAmount: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  officerInCharge: string;
}

export const complianceApi = {
  /**
   * Fetches statutory compliance filings list
   */
  async getCompliance(params?: { status?: string; department?: string; risk?: string }): Promise<ComplianceItem[]> {
    return apiClient.executeWithFallback(
      () => apiClient.get('/compliance', { params }),
      () => {
        let list = [...mockComplianceData] as ComplianceItem[];
        if (params?.status && params.status !== 'ALL') {
          list = list.filter((c) => c.status === params.status);
        }
        if (params?.department && params.department !== 'ALL') {
          list = list.filter((c) => c.department === params.department);
        }
        if (params?.risk && params.risk !== 'ALL') {
          list = list.filter((c) => c.penaltyRisk === params.risk);
        }
        return list;
      },
      'compliance'
    );
  },

  /**
   * Updates compliance filing state
   */
  async updateStatus(id: string, status: string, remarks?: string): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.patch(`/compliance/${id}/status`, { status, remarks }),
      () => {
        const found = mockComplianceData.find((c) => c._id === id);
        return { ...found, status, remarks, updatedAt: new Date().toISOString() };
      },
      `compliance/${id}/status`
    );
  },

  /**
   * Issues regulatory non-compliance notice to industrial unit
   */
  async generateNotice(id: string, remarks: string): Promise<any> {
    return apiClient.executeWithFallback(
      () => apiClient.post(`/compliance/${id}/notice`, { remarks }),
      () => ({
        success: true,
        noticeNumber: `MH-REG-NOTICE-${Date.now().toString().slice(-6)}`,
        issuedAt: new Date().toISOString(),
        remarks
      }),
      `compliance/${id}/notice`
    );
  }
};

export const getCompliance = complianceApi.getCompliance;
