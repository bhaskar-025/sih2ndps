import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { projectService } from '../../services/projectService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import {
  Building2,
  FileSpreadsheet,
  MapPin,
  Cpu,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
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

// Zod Schema for the complete project wizard
const projectWizardSchema = z.object({
  // Step 1: Company
  companyName: z
    .string()
    .min(2, 'Company legal name must be at least 2 characters')
    .max(200, 'Company name is too long'),

  // Step 2: Project
  projectName: z
    .string()
    .min(3, 'Project title must be at least 3 characters')
    .max(200, 'Project name is too long'),
  industry: z.string().min(2, 'Please select an industry sector'),
  projectType: z.string().min(2, 'Please select a project type'),
  pollutionCategory: z.enum(['Red', 'Orange', 'Green', 'White']),
  projectStage: z.enum(['Planning', 'Land_Acquisition', 'Clearance_In_Progress', 'Construction', 'Operational']),

  // Step 3: Location
  location: z.string().min(3, 'Location or MIDC plot detail is required'),
  district: z.string().min(2, 'District is required'),
  taluka: z.string().min(2, 'Taluka is required'),
  village: z.string().optional(),

  // Step 4: Infrastructure
  investment: z.coerce.number().positive('Investment must be greater than 0'),
  landArea: z.coerce.number().positive('Land area must be greater than 0'),
  employees: z.coerce.number().int().nonnegative('Employees count cannot be negative'),
  waterRequirement: z.coerce.number().nonnegative('Water requirement cannot be negative'),
  powerRequirement: z.coerce.number().nonnegative('Power requirement cannot be negative'),
});

type ProjectWizardValues = z.infer<typeof projectWizardSchema>;

export const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<ProjectWizardValues>({
    resolver: zodResolver(projectWizardSchema),
    mode: 'onChange',
    defaultValues: {
      companyName: '',
      projectName: '',
      industry: 'Manufacturing & Heavy Engineering',
      projectType: 'Greenfield',
      pollutionCategory: 'Orange',
      projectStage: 'Planning',
      location: '',
      district: 'Pune',
      taluka: '',
      village: '',
      investment: 500,
      landArea: 10,
      employees: 50,
      waterRequirement: 100,
      powerRequirement: 500,
    },
  });

  const formValues = watch();

  const steps = [
    { number: 1, title: 'Company', icon: Building2 },
    { number: 2, title: 'Project', icon: FileSpreadsheet },
    { number: 3, title: 'Location', icon: MapPin },
    { number: 4, title: 'Infrastructure', icon: Cpu },
    { number: 5, title: 'Review', icon: CheckCircle2 },
  ];

  // Validate only the current step before advancing
  const handleNext = async () => {
    let fieldsToValidate: (keyof ProjectWizardValues)[] = [];
    if (currentStep === 1) fieldsToValidate = ['companyName'];
    if (currentStep === 2) fieldsToValidate = ['projectName', 'industry', 'projectType', 'pollutionCategory', 'projectStage'];
    if (currentStep === 3) fieldsToValidate = ['location', 'district', 'taluka'];
    if (currentStep === 4) fieldsToValidate = ['investment', 'landArea', 'employees', 'waterRequirement', 'powerRequirement'];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(5, prev + 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const onSubmit = async (data: ProjectWizardValues) => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      const newProject = await projectService.createProject({
        ...data,
        status: 'Submitted',
      });
      navigate(`/projects/${newProject._id}`);
    } catch (err: any) {
      setServerError(err.message || 'Failed to register project in MongoDB');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/projects"
            className="text-xs text-slate-500 hover:text-orange-600 flex items-center gap-1 mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects Registry</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Register Industrial Project
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Multi-step statutory single window registration for Maharashtra industrial clearances.
          </p>
        </div>

        <Badge variant="saffron" className="self-start sm:self-auto py-1 px-3">
          Step {currentStep} of 5: {steps[currentStep - 1].title}
        </Badge>
      </div>

      {serverError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Stepper Wizard Progress Bar */}
      <div className="grid grid-cols-5 gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <div
              key={step.number}
              onClick={() => {
                if (step.number < currentStep) setCurrentStep(step.number);
              }}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                isCurrent
                  ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/40 text-orange-600 font-bold shadow-sm'
                  : isCompleted
                  ? 'border-emerald-300 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-600 cursor-pointer'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-xs">
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="p-6">
          {/* STEP 1: Company */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <CardHeader className="p-0 pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-600" />
                  <span>Step 1: Enterprise & Company Credentials</span>
                </CardTitle>
                <CardDescription>
                  Enter the registered corporate entity or manufacturing firm details.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company / Firm Legal Name *
                  </label>
                  <input
                    type="text"
                    {...register('companyName')}
                    placeholder="e.g. Sahyadri Industrial Polymers Pvt Ltd"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white"
                  />
                  {errors.companyName && (
                    <p className="text-rose-500 text-[11px] mt-1">{errors.companyName.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Project */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <CardHeader className="p-0 pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-orange-600" />
                  <span>Step 2: Project Details & Categorization</span>
                </CardTitle>
                <CardDescription>
                  Define the industrial project parameters and pollution categorization for clearances.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Project / Unit Title *
                  </label>
                  <input
                    type="text"
                    {...register('projectName')}
                    placeholder="e.g. Integrated Bio-Ethanol Refinement & Power Plant"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white"
                  />
                  {errors.projectName && (
                    <p className="text-rose-500 text-[11px] mt-1">{errors.projectName.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Project Type *
                    </label>
                    <select
                      {...register('projectType')}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white"
                    >
                      <option value="Greenfield">Greenfield (New Establishment)</option>
                      <option value="Brownfield">Brownfield (Existing Facility Conversion)</option>
                      <option value="Expansion">Expansion of Existing Unit</option>
                      <option value="Modernization">Modernization & Tech Upgrade</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      MPCB Pollution Category *
                    </label>
                    <select
                      {...register('pollutionCategory')}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white"
                    >
                      <option value="Red">Red (Heavy Environmental Impact)</option>
                      <option value="Orange">Orange (Moderate Impact - Consent required)</option>
                      <option value="Green">Green (Low Impact)</option>
                      <option value="White">White (Non-Polluting / Exempted)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Current Development Stage *
                    </label>
                    <select
                      {...register('projectStage')}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white"
                    >
                      <option value="Planning">Planning & DPR Stage</option>
                      <option value="Land_Acquisition">Land Acquisition / MIDC Allotment</option>
                      <option value="Clearance_In_Progress">Clearance In Progress</option>
                      <option value="Construction">Under Construction</option>
                      <option value="Operational">Commissioned & Operational</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <CardHeader className="p-0 pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <span>Step 3: Industrial Site Location</span>
                </CardTitle>
                <CardDescription>
                  Geographic jurisdiction for MIDC, Revenue, and District Industry Centre routing.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      District (Maharashtra) *
                    </label>
                    <select
                      {...register('district')}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white"
                    >
                      {MAHARASHTRA_DISTRICTS.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Taluka / Sub-division *
                    </label>
                    <input
                      type="text"
                      {...register('taluka')}
                      placeholder="e.g. Baramati, Khed, Haveli"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white"
                    />
                    {errors.taluka && (
                      <p className="text-rose-500 text-[11px] mt-1">{errors.taluka.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Village / Industrial Estate
                    </label>
                    <input
                      type="text"
                      {...register('village')}
                      placeholder="e.g. Katphal, Mahalunge"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Detailed Location / Plot Address *
                    </label>
                    <input
                      type="text"
                      {...register('location')}
                      placeholder="e.g. Plot No. B-42, MIDC Industrial Area"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white"
                    />
                    {errors.location && (
                      <p className="text-rose-500 text-[11px] mt-1">{errors.location.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Infrastructure */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <CardHeader className="p-0 pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-base flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-orange-600" />
                  <span>Step 4: Infrastructure & Capital Outlay</span>
                </CardTitle>
                <CardDescription>
                  Resource allocations required for MSEDCL power, MIDC water, and PSI subsidy eligibility.
                </CardDescription>
              </CardHeader>

              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Total Capital Investment (₹ in Lakhs) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      {...register('investment')}
                      placeholder="e.g. 14500 (for ₹145 Cr)"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white font-mono"
                    />
                    {errors.investment && (
                      <p className="text-rose-500 text-[11px] mt-1">{errors.investment.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Total Land Area Required (in Acres) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      {...register('landArea')}
                      placeholder="e.g. 35.5"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white font-mono"
                    />
                    {errors.landArea && (
                      <p className="text-rose-500 text-[11px] mt-1">{errors.landArea.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Planned Direct Employees *
                    </label>
                    <input
                      type="number"
                      {...register('employees')}
                      placeholder="e.g. 250"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white font-mono"
                    />
                    {errors.employees && (
                      <p className="text-rose-500 text-[11px] mt-1">{errors.employees.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Water Requirement (in KLD) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      {...register('waterRequirement')}
                      placeholder="e.g. 400"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white font-mono"
                    />
                    {errors.waterRequirement && (
                      <p className="text-rose-500 text-[11px] mt-1">{errors.waterRequirement.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Power Load (in KW) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      {...register('powerRequirement')}
                      placeholder="e.g. 2500"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs focus:border-orange-500 focus:outline-none text-slate-900 dark:text-white font-mono"
                    />
                    {errors.powerRequirement && (
                      <p className="text-rose-500 text-[11px] mt-1">{errors.powerRequirement.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <CardHeader className="p-0 pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Step 5: Review & Submit Application Dossier</span>
                </CardTitle>
                <CardDescription>
                  Please review all entered technical parameters before submitting to MongoDB.
                </CardDescription>
              </CardHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <h4 className="font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider text-[10px]">
                    Enterprise & Project
                  </h4>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/50 pb-1">
                    <span className="text-slate-500">Project Name:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{formValues.projectName}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/50 pb-1">
                    <span className="text-slate-500">Company Name:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{formValues.companyName}</strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/50 pb-1">
                    <span className="text-slate-500">Industry:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{formValues.industry}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category:</span>
                    <Badge variant={formValues.pollutionCategory === 'Red' ? 'destructive' : 'saffron'}>
                      {formValues.pollutionCategory} Category
                    </Badge>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                  <h4 className="font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider text-[10px]">
                    Site & Infrastructure
                  </h4>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/50 pb-1">
                    <span className="text-slate-500">Location:</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {formValues.location}, {formValues.taluka}, {formValues.district}
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/50 pb-1">
                    <span className="text-slate-500">Investment:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">
                      ₹{formValues.investment} Lakhs (₹{(Number(formValues.investment) / 100).toFixed(2)} Cr)
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/50 pb-1">
                    <span className="text-slate-500">Land Area:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-mono">{formValues.landArea} Acres</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Utilities:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono">
                      {formValues.waterRequirement} KLD Water &bull; {formValues.powerRequirement} KW Power
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-orange-50/70 border border-orange-200/50 text-orange-950 dark:bg-orange-950/20 dark:border-orange-900/40 dark:text-orange-300 text-xs">
                Upon submission, this industrial unit will be registered into the MAITRI+ database. You will immediately be able to attach Single Window clearances (MPCB, MIDC, DMFS) and track inspections.
              </div>
            </div>
          )}

          {/* Wizard Action Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
            {currentStep > 1 ? (
              <Button type="button" variant="outline" size="sm" onClick={handlePrev}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Previous Step
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <Button type="button" size="sm" onClick={handleNext}>
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            ) : (
              <Button type="submit" size="sm" isLoading={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>Submit & Create Project</span>
              </Button>
            )}
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreateProject;
