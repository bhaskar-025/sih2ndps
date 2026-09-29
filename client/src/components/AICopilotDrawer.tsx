import React, { useState } from 'react';
import { copilotService, CopilotActionType, CopilotResponse } from '../services/copilotService';
import { Button } from './Button';
import { Badge } from './Badge';
import { Card } from './Card';
import {
  Sparkles,
  X,
  FileText,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  History,
  ClipboardList,
  MessageSquare,
  Award,
  Copy,
  Check,
  RefreshCw,
  Send,
  Bot,
  HelpCircle,
} from 'lucide-react';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId?: string;
  projectId?: string;
  initialContext?: any;
  onApplyQuery?: (queryText: string) => void;
  onApplyRemarks?: (remarks: string) => void;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  applicationId,
  projectId,
  initialContext,
  onApplyQuery,
  onApplyRemarks,
}) => {
  const effectiveAppId = applicationId || initialContext?.applicationId || initialContext?.applicationNumber;
  const effectiveProjId = projectId || initialContext?.projectId;

  const [activeAction, setActiveAction] = useState<CopilotActionType | null>(null);
  const [chatPrompt, setChatPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CopilotResponse | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const promptSuggestions = [
    'What environmental clearances apply to this project?',
    'Is site inspection mandatory before CTE issuance?',
    'Check fire hydrant and building setback compliance',
    'Draft objection notice for missing structural plan',
  ];

  const actions = [
    {
      id: 'summarize_application' as CopilotActionType,
      label: 'Summarize Application',
      icon: FileText,
      desc: '3-bullet statutory regulatory dossier',
    },
    {
      id: 'find_missing_documents' as CopilotActionType,
      label: 'Find Missing Documents',
      icon: AlertCircle,
      desc: 'Cross-department missing verification checklist',
    },
    {
      id: 'suggest_approval' as CopilotActionType,
      label: 'Suggest Approval Decision',
      icon: CheckCircle2,
      desc: 'Statutory decision rationale & conditions',
    },
    {
      id: 'predict_approval_probability' as CopilotActionType,
      label: 'Predict Approval Probability',
      icon: TrendingUp,
      desc: 'Risk score & compliance clearance likelihood',
    },
    {
      id: 'similar_past_projects' as CopilotActionType,
      label: 'Show Similar Past Projects',
      icon: History,
      desc: 'Benchmark against historical industrial units',
    },
    {
      id: 'generate_inspection_checklist' as CopilotActionType,
      label: 'Generate Inspection Checklist',
      icon: ClipboardList,
      desc: 'Custom site inspection points for this unit',
    },
    {
      id: 'draft_query' as CopilotActionType,
      label: 'Draft Query Automatically',
      icon: MessageSquare,
      desc: 'Formal RTI/Statutory clarification notice',
    },
    {
      id: 'generate_remarks' as CopilotActionType,
      label: 'Generate Approval Remarks',
      icon: Award,
      desc: 'Official NOC sanction remarks text',
    },
  ];

  const handleAction = async (action: CopilotActionType, customPrompt?: string) => {
    setActiveAction(action);
    setIsLoading(true);
    setCopied(false);
    try {
      const res = await copilotService.executeAction(action, {
        applicationId: effectiveAppId,
        projectId: effectiveProjId,
        prompt: customPrompt,
        contextData: initialContext,
      });
      setResult(res);
    } catch (err: any) {
      setResult({
        action,
        title: 'Error',
        summary: `Failed to execute action: ${err.message || 'Server error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatPrompt.trim()) return;
    const p = chatPrompt;
    setChatPrompt('');
    handleAction('ask_copilot', p);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  MAITRI+ AI Regulatory Copilot
                </h3>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Gemini 2.5 Flash
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Government Clearance Intelligence Engine &bull; Maharashtra Single Window
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Ask Gemini Freeform Prompt Box */}
          <form onSubmit={handleCustomSubmit} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                Ask Gemini Copilot Anything
              </span>
              <span className="text-[10px] text-slate-400">Press Enter to dispatch</span>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask about MPCB norms, setbacks, draft query, or check compliance..."
                value={chatPrompt}
                onChange={(e) => setChatPrompt(e.target.value)}
                disabled={isLoading}
                className="w-full text-xs pl-3.5 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={isLoading || !chatPrompt.trim()}
                className="absolute right-1.5 p-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white transition-colors shadow-sm"
                title="Send query to Gemini 2.5 Flash"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Prompt Suggestion Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {promptSuggestions.map((promptText, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setChatPrompt(promptText);
                    handleAction('ask_copilot', promptText);
                  }}
                  className="text-[10px] px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-orange-500/50 hover:text-orange-600 transition-colors truncate max-w-[250px]"
                >
                  &bull; {promptText}
                </button>
              ))}
            </div>
          </form>

          {/* Quick Action Pills Grid */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              1-Click Regulatory Scrutiny Actions
            </span>
            <div className="grid grid-cols-2 gap-2">
              {actions.map((act) => {
                const Icon = act.icon;
                const isCurrent = activeAction === act.id;
                return (
                  <button
                    key={act.id}
                    onClick={() => handleAction(act.id)}
                    disabled={isLoading}
                    className={`p-2.5 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                      isCurrent
                        ? 'border-orange-500 bg-orange-50/80 dark:bg-orange-950/40 ring-2 ring-orange-400/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-orange-600' : 'text-slate-500'}`} />
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                        {act.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {act.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result Card */}
          {isLoading ? (
            <div className="p-8 rounded-2xl bg-orange-50/40 dark:bg-slate-800/40 border border-orange-200/60 dark:border-slate-700/60 text-center space-y-3 animate-in fade-in duration-150">
              <RefreshCw className="w-6 h-6 text-orange-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Gemini 2.5 Flash is analyzing Maharashtra regulatory databases & project metrics...
              </p>
              <p className="text-[11px] text-slate-400">Cross-referencing MPCB, DISH & NBC 2016 statutory guidelines</p>
            </div>
          ) : result ? (
            <Card className="p-4 border border-orange-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {result.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] font-bold border-orange-500/40 text-orange-600 uppercase">
                    {result.source || 'gemini-2.5-flash'}
                  </Badge>
                  {result.confidence && (
                    <Badge variant="outline" className="text-[10px] font-bold border-emerald-500 text-emerald-600">
                      {result.confidence}% Confidence
                    </Badge>
                  )}
                </div>
              </div>

              {/* Freeform Prompt Answer */}
              {result.answer && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60 font-sans">
                    {result.answer}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(result.answer!)}
                    className="text-xs w-full"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    <span>{copied ? 'Copied Response' : 'Copy Response'}</span>
                  </Button>
                </div>
              )}

              {/* Action 1: Summary */}
              {result.summary && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60 font-sans">
                    {result.summary}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(result.summary!)}
                    className="text-xs w-full"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    <span>{copied ? 'Copied Dossier' : 'Copy Executive Summary'}</span>
                  </Button>
                </div>
              )}

              {/* Action 2: Missing Documents */}
              {result.missingDocuments && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                    <span>Missing Statutory Documents:</span>
                    <span className="text-rose-600 font-extrabold">{result.missingCount} Incomplete</span>
                  </div>
                  <div className="space-y-1.5">
                    {result.missingDocuments.map((doc: any, i: number) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs"
                      >
                        <span className="font-bold text-rose-900 dark:text-rose-200 block">
                          {doc.documentName}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                          {doc.issuingAuthority} &bull; {doc.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                  {result.healthScore !== undefined && (
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] flex justify-between font-semibold">
                      <span>Statutory Readiness Score</span>
                      <span className="text-orange-600 font-bold">{result.healthScore}%</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action 3: Suggest Approval */}
              {result.recommendation && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      Recommendation:
                    </span>
                    <Badge
                      variant={
                        result.recommendation === 'Approve'
                          ? 'success'
                          : result.recommendation === 'Reject'
                          ? 'destructive'
                          : 'warning'
                      }
                      className="font-bold text-xs"
                    >
                      {result.recommendation}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg leading-relaxed">
                    {result.rationale}
                  </p>
                  {result.conditions && result.conditions.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Recommended Conditions:</span>
                      {result.conditions.map((c: string, idx: number) => (
                        <div key={idx} className="text-xs p-2 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-amber-900 dark:text-amber-300 flex items-start gap-1.5">
                          <span className="font-bold">&bull;</span>
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action 4: Predict Probability */}
              {result.probability !== undefined && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Clearance Probability:
                    </span>
                    <span className="text-xl font-extrabold text-emerald-600">
                      {result.probability}% ({result.riskLevel})
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${result.probability}%` }}
                    />
                  </div>
                  {result.factors && (
                    <div className="space-y-1">
                      {result.factors.map((f, i) => (
                        <div key={i} className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                          <span>{f.factor}</span>
                          <span className={f.weight >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                            {f.impact}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action 5: Similar Projects */}
              {result.similarProjects && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Similar Sanctioned Units in Maharashtra:
                  </span>
                  <div className="space-y-1.5">
                    {result.similarProjects.map((p: any, i: number) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                      >
                        <div className="flex justify-between font-bold text-slate-800 dark:text-white">
                          <span>{p.projectName}</span>
                          <span className="text-emerald-600 font-medium">{p.outcome}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {p.industry} &bull; {p.district} &bull; {p.investment} &bull; Avg Approval: {p.historicalAvgApprovalDays} days
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action 6: Inspection Checklist */}
              {result.items && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Site Verification Points:
                  </span>
                  <div className="space-y-1.5">
                    {result.items.map((it, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                            {it.item}
                          </span>
                          <span className="text-[10px] text-slate-500">{it.standard}</span>
                        </div>
                        <Badge variant={it.priority === 'Critical' ? 'destructive' : 'warning'} className="text-[10px]">
                          {it.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action 7: Draft Query */}
              {result.draftText && (
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 font-mono text-[11px] text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto border border-slate-200 dark:border-slate-700">
                    {result.draftText}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(result.draftText!)}
                      className="text-xs flex-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                      <span>{copied ? 'Copied' : 'Copy Notice'}</span>
                    </Button>
                    {onApplyQuery && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onApplyQuery(result.draftText!);
                          onClose();
                        }}
                        className="text-xs bg-orange-600 hover:bg-orange-700 text-white flex-1"
                      >
                        Insert Into Query Form
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Action 8: Generate Remarks */}
              {result.remarks && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg italic">
                    "{result.remarks}"
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(result.remarks!)}
                      className="text-xs flex-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                      <span>{copied ? 'Copied' : 'Copy Remarks'}</span>
                    </Button>
                    {onApplyRemarks && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onApplyRemarks(result.remarks!);
                          onClose();
                        }}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
                      >
                        Apply To Sanction
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ) : (
            <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
              <Sparkles className="w-8 h-8 text-orange-400 mx-auto" />
              <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                Ready for AI Statutory Analysis
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Type any query above or select a 1-click action to evaluate statutory compliance, find missing documents, or draft official queries.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-orange-500" />
            MAITRI+ Government Nodal Intelligence
          </span>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-7">
            Close Copilot
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AICopilotDrawer;
