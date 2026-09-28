export type PollutionCategory = 'Red' | 'Orange' | 'Green' | 'White';
export type ProjectStage = 'Planning' | 'Land_Acquisition' | 'Clearance_In_Progress' | 'Construction' | 'Operational';
export type ProjectStatus = 'Draft' | 'Submitted' | 'Under_Review' | 'Approved' | 'Rejected';

export interface ProjectOwner {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  department?: string;
}

export interface ProjectApplication {
  _id: string;
  applicationNumber: string;
  serviceName: string;
  status: string;
  currentStage: string;
  priority: string;
  submittedAt: string;
}

export interface ProjectDocument {
  _id: string;
  title: string;
  originalName: string;
  verificationStatus: string;
  aiClassificationTag?: string;
  createdAt: string;
}

export interface Project {
  _id: string;
  projectName: string;
  companyName: string;
  industry: string;
  projectType: string;
  location: string;
  district: string;
  taluka: string;
  village?: string;
  investment: number;
  landArea: number;
  employees: number;
  waterRequirement: number;
  powerRequirement: number;
  pollutionCategory: PollutionCategory;
  projectStage: ProjectStage;
  status: ProjectStatus;
  owner: ProjectOwner | string;
  applications?: ProjectApplication[];
  documents?: ProjectDocument[];
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProjectsResponse {
  success: boolean;
  message: string;
  data: Project[];
  pagination: ProjectPagination;
}

export interface SingleProjectResponse {
  success: boolean;
  message: string;
  data: Project;
}

export interface ProjectFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  industry?: string;
  district?: string;
  status?: string;
  projectStage?: string;
  sort?: string;
}

export interface CreateProjectFormData {
  // Step 1: Company
  companyName: string;
  
  // Step 2: Project
  projectName: string;
  industry: string;
  projectType: string;
  pollutionCategory: PollutionCategory;
  projectStage: ProjectStage;
  
  // Step 3: Location
  location: string;
  district: string;
  taluka: string;
  village?: string;
  
  // Step 4: Infrastructure
  investment: number;
  landArea: number;
  employees: number;
  waterRequirement: number;
  powerRequirement: number;
}
