import { apiClient } from './client';
import mockDepartmentsData from './mockData/mockDepartments.json';

export interface DepartmentItem {
  _id: string;
  name: string;
  code: string;
  description: string;
  jurisdiction: string;
  portalUrl: string;
  contactEmail: string;
  contactPhone: string;
  officerCount: number;
  pendingCases: number;
  completedCases: number;
  averageSla: number;
  performancePercent: number;
  approvalTypes: string[];
  officers: {
    _id: string;
    name: string;
    email: string;
    designation: string;
    activeCases: number;
  }[];
}

export const departmentApi = {
  /**
   * Fetches state statutory clearing agencies list with live case queues
   */
  async getDepartments(): Promise<DepartmentItem[]> {
    return apiClient.executeWithFallback(
      () => apiClient.get('/departments'),
      () => mockDepartmentsData as DepartmentItem[],
      'departments'
    );
  },

  /**
   * Fetches department profile by ID or code
   */
  async getDepartmentById(idOrCode: string): Promise<DepartmentItem | null> {
    return apiClient.executeWithFallback(
      () => apiClient.get(`/departments/${idOrCode}`),
      () => {
        const found = (mockDepartmentsData as DepartmentItem[]).find(
          (d) => d._id === idOrCode || d.code.toLowerCase() === idOrCode.toLowerCase()
        );
        return found || (mockDepartmentsData[0] as DepartmentItem);
      },
      `departments/${idOrCode}`
    );
  },
};

export const getDepartments = departmentApi.getDepartments;
