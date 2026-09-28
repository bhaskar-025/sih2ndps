import React, { useState } from 'react';
import { useSchemes } from '../../hooks/useSchemes';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { CardSkeleton } from '../../components/Skeleton';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, ArrowRight, RefreshCw, AlertTriangle } from 'lucide-react';

export const IncentivesSchemes: React.FC = () => {
  const { schemes, isLoading, isError, error, refetch } = useSchemes();
  const { success } = useToast();
  const [selectedSchemeId, setSelectedSchemeId] = useState<string | null>(null);

  const handleApply = (scheme: any) => {
    setSelectedSchemeId(scheme._id);
    const title = scheme.schemeName || scheme.name;
    success(`Eligibility application submitted for "${title}". Dossier forwarded to District Industries Centre (DIC).`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Maharashtra Industrial Incentives & Subsidies
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Direct financial incentives, Gross SGST reimbursements, and capital subsidies under the Directorate of Industries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh Schemes"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Failed to load subsidy schemes: {(error as any)?.message || 'Server error'}</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Grid of Schemes */}
      {isLoading ? (
        <CardSkeleton count={3} />
      ) : schemes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No Schemes Currently Available</h3>
          <p className="text-xs text-slate-500 mt-1">Check back soon for new state industrial policy announcements.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {schemes.map((scheme: any) => {
            const schemeName = scheme.schemeName || scheme.name;
            const code = scheme.code || (scheme.schemeName ? 'PSI-2019' : 'INCENTIVE');
            const summary =
              scheme.financialIncentiveSummary ||
              (scheme.subsidyPercentage
                ? `Up to ${scheme.subsidyPercentage}% Gross SGST reimbursement + capital subsidy up to ₹${(
                    (scheme.maxSubsidyAmount || 0) / 10000000
                  ).toFixed(1)} Cr`
                : 'Capital Subsidy & Interest Subvention');
            const criteria: string[] = scheme.eligibilityCriteria || [];

            return (
              <Card
                key={scheme._id}
                hover
                onClick={() => setSelectedSchemeId(scheme._id)}
                className={`cursor-pointer transition-all flex flex-col justify-between ${
                  selectedSchemeId === scheme._id
                    ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-lg'
                    : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <Badge variant="saffron">{code}</Badge>
                    <span className="text-xs font-bold text-emerald-600">Active Program</span>
                  </div>

                  <div className="mt-3 space-y-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {schemeName}
                    </h3>
                    {scheme.department && (
                      <p className="text-[11px] font-semibold text-orange-600 dark:text-orange-400">
                        {scheme.department}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                      {scheme.description}
                    </p>
                  </div>

                  <div className="mt-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200/50 dark:border-orange-900/30 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-orange-800 dark:text-orange-400 block">
                      Financial Benefit Summary:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                      {summary}
                    </p>
                  </div>

                  {criteria.length > 0 && (
                    <div className="mt-3 space-y-1.5 text-xs">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                        Key Eligibility:
                      </span>
                      <ul className="space-y-1">
                        {criteria.map((c: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-500">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApply(scheme);
                    }}
                    className="w-full text-xs"
                  >
                    <span>Apply for Eligibility Certificate</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IncentivesSchemes;
