import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProjectProvider } from './context/ProjectContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { DashboardOverview } from './pages/dashboard/Overview';
import { ProjectsList } from './pages/projects/ProjectsList';
import { CreateProject } from './pages/projects/CreateProject';
import { ProjectDetails } from './pages/projects/ProjectDetails';
import { EditProject } from './pages/projects/EditProject';
import { ApplicationsList } from './pages/applications/ApplicationsList';
import { ComplianceTracker } from './pages/compliance/ComplianceTracker';
import { IncentivesSchemes } from './pages/schemes/IncentivesSchemes';
import { ApprovalRoadmap } from './pages/roadmap/ApprovalRoadmap';
import { ApprovalDetails } from './pages/roadmap/ApprovalDetails';
import { DocumentsDashboard } from './pages/documents/DocumentsDashboard';
import { DocumentDetails } from './pages/documents/DocumentDetails';
import { OfficerDashboard } from './pages/officer/OfficerDashboard';
import { LandingPage } from './pages/LandingPage';
import { NotFound } from './pages/NotFound';




import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Initialize central TanStack QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <ProjectProvider>
              <ErrorBoundary>
                <BrowserRouter>
              <Routes>
                {/* Public Landing Page */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/landing" element={<LandingPage />} />

                {/* Auth Layout Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                {/* Protected Dashboard Layout Routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<DashboardOverview />} />
                  
                  {/* Real Project Management Module Routes */}
                  <Route path="/projects" element={<ProjectsList />} />
                  <Route path="/projects/new" element={<CreateProject />} />
                  <Route path="/projects/:id" element={<ProjectDetails />} />
                  <Route path="/projects/:id/edit" element={<EditProject />} />
                  <Route path="/projects/:id/roadmap" element={<ApprovalRoadmap />} />
                  <Route path="/projects/:id/roadmap/approvals/:approvalId" element={<ApprovalDetails />} />
                  <Route path="/projects/:id/documents" element={<DocumentsDashboard />} />
                  <Route path="/projects/:id/documents/:docId" element={<DocumentDetails />} />
                  <Route path="/documents" element={<DocumentsDashboard />} />



                  {/* Government Officer Workspace */}
                  <Route path="/officer" element={<OfficerDashboard />} />
                  <Route path="/officer/applications/:id" element={<OfficerDashboard />} />

                  {/* Supporting Regulatory Modules */}
                  <Route path="/applications" element={<ApplicationsList />} />
                  <Route path="/compliance" element={<ComplianceTracker />} />
                  <Route path="/schemes" element={<IncentivesSchemes />} />
                  <Route path="/inspections" element={<DashboardOverview />} />
                  <Route path="/departments" element={<DashboardOverview />} />
                  <Route path="/users" element={<DashboardOverview />} />
                  <Route path="*" element={<NotFound />} />

                </Route>
              </Routes>
            </BrowserRouter>
              </ErrorBoundary>
            </ProjectProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
