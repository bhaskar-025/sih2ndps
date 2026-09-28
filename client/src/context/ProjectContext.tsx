import React, { createContext, useContext, useState } from 'react';
import { Project, ProjectFilterParams } from '../types/project.types';

interface ProjectContextType {
  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;
  filters: ProjectFilterParams;
  setFilters: React.Dispatch<React.SetStateAction<ProjectFilterParams>>;
  resetFilters: () => void;
}

const defaultFilters: ProjectFilterParams = {
  page: 1,
  limit: 10,
  search: '',
  industry: 'ALL',
  district: 'ALL',
  status: 'ALL',
  projectStage: 'ALL',
  sort: '-createdAt',
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [filters, setFilters] = useState<ProjectFilterParams>(defaultFilters);

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <ProjectContext.Provider
      value={{
        activeProject,
        setActiveProject,
        filters,
        setFilters,
        resetFilters,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};

export default ProjectContext;
