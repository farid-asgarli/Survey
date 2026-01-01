// ResponseDetailDrawer - Side drawer showing individual response details

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Clock, Calendar, Monitor, Globe, CheckCircle2, XCircle, Trash2, FileText, Hash, Loader2, AlertCircle } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, Button, Skeleton, Divider, OverlayHeader } from '@/components/ui';
import { useResponseDetail, useDeleteResponse } from '@/hooks/queries/useResponses';
import { useSurveyDetail } from '@/hooks/queries/useSurveys';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { toast } from '@/components/ui';
import { formatDuration, formatDurationBetween, formatDateTime, formatDate } from '@/utils';
import { QuestionType } from '@/types';
import type { Answer, Question } from '@/types';

interface ResponseDetailDrawerProps {
  surveyId: string;
  responseId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

// Helper to get response duration - prefer backend-calculated timeSpentSeconds
function getResponseDuration(response: { timeSpentSeconds?: number; startedAt: string; submittedAt?: string }): string {
  // Use backend-calculated timeSpentSeconds when available (most accurate)
  if (response.timeSpentSeconds != null && response.timeSpentSeconds > 0) {
    return formatDuration(response.timeSpentSeconds);
  }
  // Fallback to computing from timestamps
  return formatDurationBetween(response.startedAt, response.submittedAt);
}

// Helper to get answer display value
function getAnswerDisplay(answer: Answer, question: Question | undefined, t: (key: string) => string): React.ReactNode {
  if (!question) {
    // Fallback: use displayValue (computed by backend) or deprecated fields
    return answer.displayValue || answer.text || t('responses.na');
  }

  const type = question.type;
  const options = question.settings?.options ?? [];

  // Handle different question types
  switch (type) {
    case QuestionType.SingleChoice:
    case QuestionType.Dropdown:
    case QuestionType.YesNo: {
      // Use selectedOptions if available, fallback to displayValue
      if (answer.selectedOptions && answer.selectedOptions.length > 0) {
        return answer.selectedOptions[0].text;
      }
      return answer.displayValue || answer.text || t('responses.na');
    }

    case QuestionType.MultipleChoice:
    case QuestionType.Checkbox: {
      // Use selectedOptions for selected choices
      if (answer.selectedOptions && answer.selectedOptions.length > 0) {
        return (
          <ul className="list-disc list-inside space-y-1">
            {answer.selectedOptions.map((opt) => (
              <li key={opt.id} className="text-sm">
                {opt.text}
              </li>
            ))}
            {/* Show "Other" text if present */}
            {answer.text && (
              <li className="text-sm text-on-surface-variant italic">
                {t('common.other')}: {answer.text}
              </li>
            )}
          </ul>
        );
      }
      // Fallback to displayValue
      return answer.displayValue || t('responses.na');
    }

    case QuestionType.Rating:
    case QuestionType.NPS:
    case QuestionType.Scale: {
      const rating = parseInt(answer.text || answer.displayValue || '0');
      const max = question.settings?.maxValue || 5;
      return (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-primary">{rating}</span>
          <span className="text-on-surface-variant">/ {max}</span>
        </div>
      );
    }

    case QuestionType.Matrix: {
      if (answer.matrixAnswers) {
        return (
          <div className="space-y-2">
            {Object.entries(answer.matrixAnswers).map(([row, value]) => (
              <div key={row} className="flex justify-between text-sm">
                <span className="text-on-surface-variant">{row}:</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        );
      }
      return t('responses.na');
    }

    case QuestionType.Ranking: {
      // For ranking, selectedOptions contains the ordered options
      if (answer.selectedOptions && answer.selectedOptions.length > 0) {
        return (
          <ol className="list-decimal list-inside space-y-1">
            {answer.selectedOptions.map((opt) => (
              <li key={opt.id} className="text-sm">
                {opt.text}
              </li>
            ))}
          </ol>
        );
      }
      // Fallback: try parsing text as JSON array
      if (answer.text) {
        try {
          const rankedValues = JSON.parse(answer.text) as string[];
          if (Array.isArray(rankedValues)) {
            return (
              <ol className="list-decimal list-inside space-y-1">
                {rankedValues.map((v, idx) => {
                  // Try to find option by ID or text
                  const option = options.find((o) => o.id === v || o.text === v);
                  return (
                    <li key={idx} className="text-sm">
                      {option?.text || v}
                    </li>
                  );
                })}
              </ol>
            );
          }
        } catch {
          // Not JSON, use displayValue
        }
      }
      return answer.displayValue || t('responses.na');
    }

    case QuestionType.FileUpload: {
      if (answer.fileUrls && answer.fileUrls.length > 0) {
        return (
          <div className="space-y-1">
            {answer.fileUrls.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <FileText className="h-4 w-4" />
                File {idx + 1}
              </a>
            ))}
          </div>
        );
      }
      return t('responses.noFiles');
    }

    case QuestionType.Date:
    case QuestionType.DateTime: {
      if (answer.text || answer.displayValue) {
        return formatDate(answer.text || answer.displayValue);
      }
      return t('responses.na');
    }

    default:
      return answer.displayValue || answer.text || t('responses.na');
  }
}

// Answer Card Component
function AnswerCard({ answer, question, index, t }: { answer: Answer; question: Question | undefined; index: number; t: (key: string) => string }) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-4 space-y-2">
      <div className="flex items-start gap-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-container text-on-primary-container text-xs font-semibold">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-on-surface leading-tight">{question?.text || t('responses.unknownQuestion')}</p>
          {question?.isRequired && <span className="text-xs text-error">{t('common.required')}</span>}
        </div>
      </div>
      <div className="pl-9 text-on-surface">{getAnswerDisplay(answer, question, t)}</div>
    </div>
  );
}

export function ResponseDetailDrawer({ surveyId, responseId, open, onOpenChange, onDeleted }: ResponseDetailDrawerProps) {
  const { t } = useTranslation();
  const { data: response, isLoading, error } = useResponseDetail(surveyId, responseId || undefined);
  const { data: survey } = useSurveyDetail(surveyId);
  const deleteResponse = useDeleteResponse(surveyId);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // Create a map of question ID to question for easy lookup
  const questionsMap = useMemo(() => {
    const questions = survey?.questions;
    if (!questions) return new Map<string, Question>();
    return new Map(questions.map((q) => [q.id, q]));
  }, [survey]);

  // Sort answers by question order
  const sortedAnswers = useMemo(() => {
    const answers = response?.answers;
    if (!answers) return [];
    return [...answers].sort((a, b) => {
      const qA = questionsMap.get(a.questionId);
      const qB = questionsMap.get(b.questionId);
      return (qA?.order || 0) - (qB?.order || 0);
    });
  }, [response, questionsMap]);

  const handleDelete = async () => {
    if (!responseId) return;

    const confirmed = await confirm({
      title: t('responses.deleteResponse.title'),
      description: t('responses.deleteResponse.description'),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      variant: 'destructive',
    });

    if (confirmed) {
      try {
        await deleteResponse.mutateAsync(responseId);
        toast.success(t('responses.deleteSuccess'));
        onOpenChange(false);
        onDeleted?.();
      } catch {
        toast.error(t('responses.deleteError'));
      }
    }
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange} side="right">
        <DrawerContent className="max-w-lg!" showClose={false}>
          <DrawerHeader
            hero
            icon={<FileText className="h-7 w-7" />}
            title={t('responses.responseDetails')}
            description={survey?.title || t('responses.title')}
            showClose
          >
            {/* Stats pills */}
            {response && (
              <div className="flex items-center gap-3 mt-4">
                <OverlayHeader.StatsPill icon={<Hash />} value={sortedAnswers.length} label="answers" />
                <OverlayHeader.StatsPill icon={<Clock />} value={getResponseDuration(response)} />
                {response.isComplete ? (
                  <OverlayHeader.Badge icon={<CheckCircle2 />} text="Complete" variant="success" />
                ) : (
                  <OverlayHeader.Badge icon={<XCircle />} text="Partial" variant="warning" />
                )}
              </div>
            )}
          </DrawerHeader>

          <DrawerBody className="pt-5">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <AlertCircle className="h-10 w-10 text-error mb-3" />
                <p className="text-on-surface-variant">{t('responses.loadError')}</p>
              </div>
            ) : response ? (
              <div className="space-y-6">
                {/* Response Metadata */}
                <div className="bg-surface-container rounded-2xl p-4 space-y-3">
                  <h4 className="font-semibold text-on-surface">{t('responses.responseInfo')}</h4>

                  <Divider />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-on-surface-variant" />
                      <div>
                        <p className="text-on-surface-variant text-xs">{t('responses.respondent')}</p>
                        <p className="font-medium text-on-surface">{response.respondentEmail || t('responses.anonymous')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-on-surface-variant" />
                      <div>
                        <p className="text-on-surface-variant text-xs">{t('responses.responseId')}</p>
                        <p className="font-medium text-on-surface font-mono text-xs">{response.id.slice(0, 8)}...</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-on-surface-variant" />
                      <div>
                        <p className="text-on-surface-variant text-xs">{t('responses.started')}</p>
                        <p className="font-medium text-on-surface">{formatDateTime(response.startedAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-on-surface-variant" />
                      <div>
                        <p className="text-on-surface-variant text-xs">{t('responses.duration')}</p>
                        <p className="font-medium text-on-surface">{getResponseDuration(response)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional metadata if available */}
                  {response.metadata && (
                    <>
                      <Divider />
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {(() => {
                          const meta = response.metadata as Record<string, unknown>;
                          return (
                            <>
                              {meta.device != null && (
                                <div className="flex items-center gap-2">
                                  <Monitor className="h-4 w-4 text-on-surface-variant" />
                                  <div>
                                    <p className="text-on-surface-variant text-xs">{t('responses.device')}</p>
                                    <p className="font-medium text-on-surface">{String(meta.device)}</p>
                                  </div>
                                </div>
                              )}
                              {meta.location != null && (
                                <div className="flex items-center gap-2">
                                  <Globe className="h-4 w-4 text-on-surface-variant" />
                                  <div>
                                    <p className="text-on-surface-variant text-xs">{t('responses.location')}</p>
                                    <p className="font-medium text-on-surface">{String(meta.location)}</p>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </>
                  )}
                </div>

                {/* Answers Section */}
                <div>
                  <h4 className="font-semibold text-on-surface mb-3">
                    {t('responses.answers')} ({sortedAnswers.length})
                  </h4>
                  <div className="space-y-3">
                    {sortedAnswers.length === 0 ? (
                      <div className="text-center py-8 text-on-surface-variant">{t('responses.noAnswers')}</div>
                    ) : (
                      sortedAnswers.map((answer, index) => (
                        <AnswerCard key={answer.id} answer={answer} question={questionsMap.get(answer.questionId)} index={index} t={t} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.close')}
            </Button>
            <Button variant="tonal" className="text-error" onClick={handleDelete} disabled={deleteResponse.isPending || !responseId}>
              {deleteResponse.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              {t('common.delete')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <ConfirmDialog />
    </>
  );
}
