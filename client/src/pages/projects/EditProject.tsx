import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { projectService } from '../../services/projectService';
import { Project } from '../../types/project.types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Skeleton } from '../../components/Skeleton';
import { ErrorState } from '../../components/EmptyState';
import {
  ArrowLeft,
  Save,
  Building2,
  FileSpreadsheet,
  MapPin,
  Cpu,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const MAHARASHTRA_DISTRICTS = [
  'Pune',
  'Mumbai City',
  'Mumbai Suburban',
  'Thane',
  'Raigad',
  'Nagpur',
  'Nashik',
  'Aurangabad',
  'Solapur',
  'Kolhapur',
  'Satara',
  'Ahmednagar',
  'Jalgaon',
  'Amravati',
  'Nanded',
];

const INDUSTRIES = [
  'Renewable Energy & Biofuels',
  'Electric Mobility & Electronics',
  'Manufacturing & Heavy Engineering',
  'Pharmaceuticals & Biotechnology',
  'Chemicals & Petrochemicals',
  'Food Processing & Agro-tech',
  'Textiles & Garments',
  'IT & Data Centers',
];

const editProjectSchema = z.object({
  projectName: z.string().min(2, 'Project title must be at least 2 characters'),
  companyName: z.string().min(2, 'Company name is required'),
  industry: z.string().min(2, 'Industry is required'),
  projectType: z.string().min(2, 'Project type is required'),
  pollutionCategory: z.enum(['Red', 'Orange', 'Green', 'White']),
  projectStage: z.enum(['Planning', 'Land_Acquisition', 'Clearance_In_Progress', 'Construction', 'Operational']),
  status: z.enum(['Draft', 'Submitted', 'Under_Review', 'Approved', 'Rejected']),
  location: z.string().min(3, 'Location is required'),
  district: z.string().min(2, 'District is required'),
  taluka: z.string().min(2, 'Taluka is required'),
  village: z.string().optional(),
  investment: z.coerce.number().positive('Investment must be greater than 0'),
  landArea: z.coerce.number().positive('Land area must be greater than 0'),
  employees: z.coerce.number().int().nonnegative('Employees count cannot be negative'),
  waterRequirement: z.coerce.number().nonnegative('Water requirement cannot be negative'),
  powerRequirement: z.coerce.number().nonnegative('Power requirement cannot be negative'),
});

type EditProjectValues = z.infer<typeof editProjectSchema>;

export const EditProject: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: project, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProject(id!),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditProjectValues>({
    resolver: zodResolver(editProjectSchema),
  });

  useEffect(() => {
    if (project) {
      reset({
        projectName: project.projectName,
        companyName: project.companyName,
        industry: project.industry,
        projectType: project.projectType,
        pollutionCategory: project.pollutionCategory,
        projectStage: project.projectStage,
        status: project.status,
        location: project.location,
        district: project.district,
        taluka: project.taluka,
        village: project.village || '',
        investment: project.investment,
        landArea: project.landArea,
        employees: project.employees,
        waterRequirement: project.waterRequirement,
        powerRequirement: project.powerRequirement,
      });
    }
  }, [project, reset]);

  const updateMutation = useMutation({
    mutationFn: (values: EditProjectValues) => projectService.updateProject(id!, values),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      navigate(`/projects/${id}`);
    },
    onError: (err: any) => {
      setServerError(err.message || 'Failed to update project');
    },
  });

  const onSubmit = (values: EditProjectValues) => {
    setServerError(null);
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <ErrorState
          message={(error as Error)?.message || 'Failed to load project for editing'}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to={`/projects/${project._id}`}
            className="text-xs text-slate-500 hover:text-orange-600 flex items-center gap-1 mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Project Docket</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Edit Project Dossier
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Update technical allocations, location specifications, and development milestones.
          </p>
        </div>
      </div>

      {serverError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6 space-y-4">
          <CardHeader className="p-0 pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-600" />
              <span>Project & Corporate Profile</span>
            </CardTitle>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                {...register('projectName')}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white"
              />
              {errors.projectName && (
                <p className="text-rose-500 text-[11px] mt-1">{errors.projectName.message}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Legal Name *
              </label>
              <input
                type="text"
                {...register('companyName')}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white"
              />
              {errors.companyName && (
                <p className="text-rose-500 text-[11px] mt-1">{errors.companyName.message}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Industry Sector *
              </label>
              <select
                {...register('industry')}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Type *
              </label>
              <select
                {...register('projectType')}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white"
              >
                <option value="Greenfield">Greenfield</option>
                <option value="Brownfield">Brownfield</option>
                <option value="Expansion">Expansion</option>
                <option value="Modernization">Modernization</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pollution Category *
              </label>
              <select
                {...register('pollutionCategory')}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white"
              >
                <option value="Red">Red</option>
                <option value="Orange">Orange</option>
                <option value="Green">Green</option>
                <option value="White">White</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Development Stage *
              </label>
              <select
                {...register('projectStage')}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white"
              >
                <option value="Planning">Planning</option>
                <option value="Land_Acquisition">Land Acquisition</option>
                <option value="Clearance_In_Progress">Clearance In Progress</option>
                <option value="Construction">Construction</option>
                <option value="Operational">Operational</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Location & Infrastructure */}
        <Card className="p-6 space-y-4">
          <CardHeader className="p-0 pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              <span>Location & Infrastructure Allocations</span>
            </CardTitle>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                District *
              </label>
              <select
                {...register('district')}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white"
              >
                {MAHARASHTRA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Taluka *
              </label>
              <input
                type="text"
                {...register('taluka')}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Village
              </label>
              <input
                type="text"
                {...register('village')}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Location Address / MIDC Plot *
              </label>
              <input
                type="text"
                {...register('location')}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Investment (₹ in Lakhs) *
              </label>
              <input
                type="number"
                step="any"
                {...register('investment')}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Land Area (Acres) *
              </label>
              <input
                type="number"
                step="any"
                {...register('landArea')}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Employees *
              </label>
              <input
                type="number"
                {...register('employees')}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Water (KLD) *
              </label>
              <input
                type="number"
                step="any"
                {...register('waterRequirement')}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Power (KW) *
              </label>
              <input
                type="number"
                step="any"
                {...register('powerRequirement')}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>
        </Card>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to={`/projects/${project._id}`}>
            <Button type="button" variant="outline" size="sm">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            size="sm"
            isLoading={isSubmitting || updateMutation.isPending}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            <span>Save Changes</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProject;
