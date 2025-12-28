// ResponseDetailDrawer - Side drawer showing individual response details

import { useMemo } from 'react';
import { User, Clock, Calendar, Monitor, Globe, CheckCircle2, XCircle, Trash2, FileText, Hash, Loader2, AlertCircle } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter, Button, Skeleton, Divider, OverlayHeader } from '@/components/ui';
import { useResponseDetail, useDeleteResponse } from '@/hooks/queries/useResponses';
import { useSurveyDetail } from '@/hooks/queries/useSurveys';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { toast } from '@/components/ui';
import { formatDurationBetween, formatDateTime, formatDate } from '@/utils';
import { QuestionType } from '@/types';
import type { Answer, Question } from '@/types';

interface ResponseDetailDrawerProps {
  surveyId: string;
  responseId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}

// Helper to get answer display value
function getAnswerDisplay(answer: Answer, question: Question | undefined): React.ReactNode {
  if (!question) {
    return answer.answerValue || answer.values?.join(', ') || 'N/A';
  }

  const type = question.type;
  const options = question.settings?.options ?? [];

  // Handle different question types
  switch (type) {
    case QuestionType.SingleChoice:
    case QuestionType.Dropdown:
    case QuestionType.YesNo: {
      // Options are stored as string[], answer value should match option text
      const option = options.find((o) => o === answer.answerValue);
      return option || answer.answerValue || 'N/A';
    }

    case QuestionType.MultipleChoice:
    case QuestionType.Checkbox: {
      if (answer.values && answer.values.length > 0) {
        const selectedOptions = answer.values.map((v) => {
          const option = options.find((o) => o === v);
          return option || v;
        });
        return (
          <ul className="list-disc list-inside space-y-1">
            {selectedOptions.map((opt, idx) => (
              <li key={idx} className="text-sm">
                {opt}
              </li>
            ))}
          </ul>
        );
      }
      return 'N/A';
    }

    case QuestionType.Rating:
    case QuestionType.NPS:
    case QuestionType.Scale: {
      const rating = parseInt(answer.answerValue || '0');
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
      return 'N/A';
    }

    case QuestionType.Ranking: {
      if (answer.values && answer.values.length > 0) {
        return (
          <ol className="list-decimal list-inside space-y-1">
            {answer.values.map((v, idx) => {
              const option = options.find((o) => o === v);
              return (
                <li key={idx} className="text-sm">
                  {option || v}
                </li>
              );
            })}
          </ol>
        );
      }
      return 'N/A';
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
      return 'No files uploaded';
    }

    case QuestionType.Date:
    case QuestionType.DateTime: {
      if (answer.answerValue) {
        return formatDate(answer.answerValue);
      }
      return 'N/A';
    }

    default:
      return answer.answerValue || 'N/A';
  }
}

// Answer Card Component
function AnswerCard({ answer, question, index }: { answer: Answer; question: Question | undefined; index: number }) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-4 space-y-2">
      <div className="flex items-start gap-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-container text-on-primary-container text-xs font-semibold">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-on-surface leading-tight">{question?.text || 'Unknown Question'}</p>
          {question?.isRequired && <span className="text-xs text-error">Required</span>}
        </div>
      </div>
      <div className="pl-9 text-on-surface">{getAnswerDisplay(answer, question)}</div>
    </div>
  );
}

export function ResponseDetailDrawer({ surveyId, responseId, open, onOpenChange, onDeleted }: ResponseDetailDrawerProps) {
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
      title: 'Delete Response',
      description: 'Are you sure you want to delete this response? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (confirmed) {
      try {
        await deleteResponse.mutateAsync(responseId);
        toast.success('Response deleted successfully');
        onOpenChange(false);
        onDeleted?.();
      } catch {
        toast.error('Failed to delete response');
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
            title="Response Details"
            description={survey?.title || 'Survey Response'}
            showClose
          >
            {/* Stats pills */}
            {response && (
              <div className="flex items-center gap-3 mt-4">
                <OverlayHeader.StatsPill icon={<Hash />} value={sortedAnswers.length} label="answers" />
                <OverlayHeader.StatsPill icon={<Clock />} value={formatDurationBetween(response.startedAt, response.completedAt)} />
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
                <p className="text-on-surface-variant">Failed to load response</p>
              </div>
            ) : response ? (
              <div className="space-y-6">
                {/* Response Metadata */}
                <div className="bg-surface-container rounded-2xl p-4 space-y-3">
                  <h4 className="font-semibold text-on-surface">Response Info</h4>

                  <Divider />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-on-surface-variant" />
                      <div>
                        <p className="text-on-surface-variant text-xs">Respondent</p>
                        <p className="font-medium text-on-surface">{response.respondentEmail || 'Anonymous'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-on-surface-variant" />
                      <div>
                        <p className="text-on-surface-variant text-xs">Response ID</p>
                        <p className="font-medium text-on-surface font-mono text-xs">{response.id.slice(0, 8)}...</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-on-surface-variant" />
                      <div>
                        <p className="text-on-surface-variant text-xs">Started</p>
                        <p className="font-medium text-on-surface">{formatDateTime(response.startedAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-on-surface-variant" />
                      <div>
                        <p className="text-on-surface-variant text-xs">Duration</p>
                        <p className="font-medium text-on-surface">{formatDurationBetween(response.startedAt, response.completedAt)}</p>
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
                                    <p className="text-on-surface-variant text-xs">Device</p>
                                    <p className="font-medium text-on-surface">{String(meta.device)}</p>
                                  </div>
                                </div>
                              )}
                              {meta.location != null && (
                                <div className="flex items-center gap-2">
                                  <Globe className="h-4 w-4 text-on-surface-variant" />
                                  <div>
                                    <p className="text-on-surface-variant text-xs">Location</p>
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
                  <h4 className="font-semibold text-on-surface mb-3">Answers ({sortedAnswers.length})</h4>
                  <div className="space-y-3">
                    {sortedAnswers.length === 0 ? (
                      <div className="text-center py-8 text-on-surface-variant">No answers recorded</div>
                    ) : (
                      sortedAnswers.map((answer, index) => (
                        <AnswerCard key={answer.id} answer={answer} question={questionsMap.get(answer.questionId)} index={index} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button variant="tonal" className="text-error" onClick={handleDelete} disabled={deleteResponse.isPending || !responseId}>
              {deleteResponse.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <ConfirmDialog />
    </>
  );
}
