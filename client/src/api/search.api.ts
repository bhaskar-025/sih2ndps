import { apiClient } from './client';
import mockApplicationsData from './mockData/mockApplications.json';
import mockProjectsData from './mockData/mockProjects.json';
import mockDocumentsData from './mockData/mockDocuments.json';
import mockDepartmentsData from './mockData/mockDepartments.json';

export interface GlobalSearchResult {
  type: 'project' | 'application' | 'document' | 'officer' | 'department';
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  route: string;
  metadata?: Record<string, any>;
}

export const searchApi = {
  /**
   * Performs unified search across Projects, Applications, Tracking IDs, Companies, Officers, Districts, and Documents
   */
  async globalSearch(query: string): Promise<GlobalSearchResult[]> {
    if (!query || query.trim().length === 0) return [];
    const q = query.toLowerCase().trim();

    return apiClient.executeWithFallback(
      () => apiClient.get('/search', { params: { q } }),
      () => {
        const results: GlobalSearchResult[] = [];

        // 1. Search Applications (by tracking ID, service name, company, applicant)
        mockApplicationsData.forEach((app) => {
          if (
            app.applicationNumber.toLowerCase().includes(q) ||
            app.serviceName.toLowerCase().includes(q) ||
            app.department.toLowerCase().includes(q) ||
            app.projectId?.projectName.toLowerCase().includes(q) ||
            app.projectId?.companyName.toLowerCase().includes(q) ||
            app.projectId?.district.toLowerCase().includes(q)
          ) {
            results.push({
              type: 'application',
              id: app._id,
              title: `${app.applicationNumber} — ${app.serviceName}`,
              subtitle: `${app.projectId?.projectName} • ${app.department} (${app.projectId?.district})`,
              badge: app.status,
              route: `/applications?id=${app._id}`,
              metadata: { risk: app.riskScore, sla: app.slaRemaining }
            });
          }
        });

        // 2. Search Projects (by name, company, district, industry)
        mockProjectsData.forEach((proj) => {
          if (
            proj.projectName.toLowerCase().includes(q) ||
            proj.companyName.toLowerCase().includes(q) ||
            proj.district.toLowerCase().includes(q) ||
            proj.industry.toLowerCase().includes(q)
          ) {
            results.push({
              type: 'project',
              id: proj._id,
              title: proj.projectName,
              subtitle: `${proj.companyName} • ${proj.district} • ${proj.industry}`,
              badge: `${proj.approvalPercentage}% Approved`,
              route: `/projects`,
              metadata: { investment: proj.investment }
            });
          }
        });

        // 3. Search Documents (by document name, type, file name)
        mockDocumentsData.forEach((doc) => {
          if (
            doc.name.toLowerCase().includes(q) ||
            doc.documentType.toLowerCase().includes(q) ||
            doc.fileName.toLowerCase().includes(q)
          ) {
            results.push({
              type: 'document',
              id: doc._id,
              title: doc.name,
              subtitle: `${doc.documentType} • ${doc.fileName}`,
              badge: doc.verificationStatus,
              route: `/projects/${doc.projectId}/documents`,
              metadata: { ocr: doc.ocrStatus }
            });
          }
        });

        // 4. Search Officers (by name, email, department)
        mockDepartmentsData.forEach((dept) => {
          dept.officers?.forEach((off) => {
            if (
              off.name.toLowerCase().includes(q) ||
              off.email.toLowerCase().includes(q) ||
              off.designation.toLowerCase().includes(q) ||
              dept.name.toLowerCase().includes(q) ||
              dept.code.toLowerCase().includes(q)
            ) {
              results.push({
                type: 'officer',
                id: off._id,
                title: off.name,
                subtitle: `${off.designation} • ${dept.code} (${off.email})`,
                badge: `${off.activeCases} Active Files`,
                route: `/departments`,
                metadata: { department: dept.code }
              });
            }
          });
        });

        return results.slice(0, 15);
      },
      `search?q=${encodeURIComponent(query)}`
    );
  }
};
