// Logic Visualization - Flow diagram showing question logic paths

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui';
import { GitBranch, Eye, EyeOff, SkipForward, CircleStop, AlertCircle, ArrowDown, ArrowRight } from 'lucide-react';
import { useLogicMap, getOperatorLabel, validateLogicRules } from '@/hooks/queries/useQuestionLogic';
import { useSurveyBuilderStore } from '@/stores';
import { LogicAction } from '@/types';
import type { QuestionLogic } from '@/types';

interface LogicVisualizationProps {
  surveyId: string;
  className?: string;
  compact?: boolean;
}

export function LogicVisualization({ surveyId, className, compact = false }: LogicVisualizationProps) {
  const { t } = useTranslation();
  const { questions } = useSurveyBuilderStore();
  const { data: logicMap, isLoading, error } = useLogicMap(surveyId);

  // Flatten all rules from the logic map
  const allRules = useMemo(() => {
    if (!logicMap?.questions) return [];
    return logicMap.questions.flatMap((q) => q.logicRules || []);
  }, [logicMap]);

  // Validate logic rules
  const validation = useMemo(() => {
    if (allRules.length === 0) return { isValid: true, errors: [] };
    return validateLogicRules(
      allRules,
      questions.map((q) => ({ id: q.id, order: q.order }))
    );
  }, [allRules, questions]);

  // Build visualization data
  const visualizationData = useMemo(() => {
    if (!logicMap?.questions) return [];

    return logicMap.questions.map((q) => {
      const question = questions.find((ques) => ques.id === q.id);
      return {
        id: q.id,
        text: q.text,
        order: q.order,
        questionType: question?.type || 'Unknown',
        rules: q.logicRules || [],
        hasIncomingLogic: allRules.some((r) => r.targetQuestionId === q.id && (r.action === LogicAction.Show || r.action === LogicAction.Skip)),
        hasOutgoingLogic: (q.logicRules || []).length > 0,
      };
    });
  }, [logicMap, questions, allRules]);

  const getActionIcon = (action: LogicAction) => {
    switch (action) {
      case LogicAction.Show:
        return <Eye className="w-3.5 h-3.5" />;
      case LogicAction.Hide:
        return <EyeOff className="w-3.5 h-3.5" />;
      case LogicAction.Skip:
        return <SkipForward className="w-3.5 h-3.5" />;
      case LogicAction.EndSurvey:
        return <CircleStop className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  const getActionColor = (action: LogicAction) => {
    switch (action) {
      case LogicAction.Show:
        return 'bg-success-container text-on-success-container';
      case LogicAction.Hide:
        return 'bg-error-container text-on-error-container';
      case LogicAction.Skip:
        return 'bg-warning-container text-on-warning-container';
      case LogicAction.EndSurvey:
        return 'bg-error text-on-error';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  const getQuestionLabel = (qId: string) => {
    const q = questions.find((q) => q.id === qId);
    if (!q) return 'Unknown';
    return `Q${q.order + 1}`;
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('p-4 bg-error-container rounded-2xl', className)}>
        <div className="flex items-center gap-2 text-on-error-container">
          <AlertCircle className="w-5 h-5" />
          <span>{t('logicVisualization.loadError')}</span>
        </div>
      </div>
    );
  }

  if (allRules.length === 0) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <GitBranch className="w-12 h-12 mx-auto text-on-surface-variant/30 mb-3" />
        <p className="text-on-surface-variant">{t('logicVisualization.noRules')}</p>
        <p className="text-sm text-on-surface-variant/70 mt-1">{t('logicVisualization.addLogicHint')}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Validation Warnings */}
      {!validation.isValid && (
        <div className="p-3 bg-error-container rounded-xl">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-error mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-on-error-container">{t('logicVisualization.issuesFound')}</p>
              <ul className="mt-1 text-on-error-container/80 list-disc list-inside">
                {validation.errors.slice(0, 3).map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Flow Diagram */}
      <div className="relative">
        {visualizationData.map((item, index) => (
          <div key={item.id} className="relative">
            {/* Question Node */}
            <div
              className={cn(
                'relative p-3 rounded-xl border transition-all duration-200',
                item.hasOutgoingLogic ? 'border-primary/50 bg-primary/5' : 'border-outline-variant/30 bg-surface-container',
                item.hasIncomingLogic && 'ring-2 ring-tertiary/30 ring-offset-2 ring-offset-surface'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={cn(
                        'shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
                        item.hasOutgoingLogic ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
                      )}
                    >
                      {item.order + 1}
                    </span>
                    <p className={cn('text-sm font-medium truncate', compact ? 'max-w-36' : 'max-w-72')} title={item.text}>
                      {item.text}
                    </p>
                  </div>

                  {/* Logic Rules for this question */}
                  {item.rules.length > 0 && !compact && (
                    <div className="mt-2 space-y-1.5 pl-9">
                      {item.rules.map((rule) => (
                        <LogicRuleBadge
                          key={rule.id}
                          rule={rule}
                          getQuestionLabel={getQuestionLabel}
                          getActionIcon={getActionIcon}
                          getActionColor={getActionColor}
                        />
                      ))}
                    </div>
                  )}

                  {/* Compact mode - just show count */}
                  {item.rules.length > 0 && compact && (
                    <div className="flex items-center gap-1.5 mt-1 pl-9">
                      <GitBranch className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs text-on-surface-variant">
                        {item.rules.length} rule{item.rules.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Logic indicator */}
                {item.hasOutgoingLogic && (
                  <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <GitBranch className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
              </div>
            </div>

            {/* Connection Line */}
            {index < visualizationData.length - 1 && (
              <div className="flex items-center justify-center py-1">
                <ArrowDown className="w-4 h-4 text-outline-variant" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="pt-4 border-t border-outline-variant/30">
        <p className="text-xs font-medium text-on-surface-variant mb-2">{t('conditionalLogic.legend')}</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-success-container border border-success-container" />
            <span className="text-on-surface-variant">{t('conditionalLogic.show')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-error-container border border-error-container" />
            <span className="text-on-surface-variant">{t('conditionalLogic.hide')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-warning-container border border-warning-container" />
            <span className="text-on-surface-variant">{t('conditionalLogic.skip')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-error border border-error" />
            <span className="text-on-surface-variant">{t('conditionalLogic.actions.endSurvey')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Logic Rule Badge Component
interface LogicRuleBadgeProps {
  rule: QuestionLogic;
  getQuestionLabel: (qId: string) => string;
  getActionIcon: (action: LogicAction) => React.ReactNode;
  getActionColor: (action: LogicAction) => string;
}

function LogicRuleBadge({ rule, getQuestionLabel, getActionIcon, getActionColor }: LogicRuleBadgeProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-1 text-xs">
      <span className="text-on-surface-variant">{t('conditionalLogic.if')}</span>
      <span className="px-1.5 py-0.5 bg-secondary-container text-on-secondary-container rounded">{getQuestionLabel(rule.sourceQuestionId)}</span>
      <span className="text-on-surface-variant">{getOperatorLabel(rule.operator)}</span>
      {rule.conditionValue && (
        <span className="px-1.5 py-0.5 bg-tertiary-container text-on-tertiary-container rounded max-w-24 truncate">{rule.conditionValue}</span>
      )}
      <ArrowRight className="w-3 h-3 text-on-surface-variant" />
      <span className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded', getActionColor(rule.action))}>
        {getActionIcon(rule.action)}
        <span className="capitalize">{rule.action}</span>
      </span>
      {rule.targetQuestionId && (
        <>
          <ArrowRight className="w-3 h-3 text-on-surface-variant" />
          <span className="px-1.5 py-0.5 bg-secondary-container text-on-secondary-container rounded">{getQuestionLabel(rule.targetQuestionId)}</span>
        </>
      )}
    </div>
  );
}

// Compact Logic Summary for Question Card
interface LogicSummaryBadgeProps {
  questionId: string;
  surveyId: string;
  className?: string;
}

export function LogicSummaryBadge({ questionId, surveyId, className }: LogicSummaryBadgeProps) {
  const { data: logicMap, isLoading } = useLogicMap(surveyId);

  const ruleCount = useMemo(() => {
    if (!logicMap?.questions) return 0;
    const question = logicMap.questions.find((q) => q.id === questionId);
    return question?.logicRules?.length || 0;
  }, [logicMap, questionId]);

  if (isLoading || ruleCount === 0) {
    return null;
  }

  return (
    <div
      className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs', 'bg-tertiary-container text-on-tertiary-container', className)}
    >
      <GitBranch className="w-3 h-3" />
      <span>{ruleCount}</span>
    </div>
  );
}
