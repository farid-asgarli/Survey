// React Query hooks for Question operations within surveys

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { questionsApi } from '@/services';
import { surveyKeys } from './useSurveys';
import type { CreateQuestionRequest, UpdateQuestionRequest, Question, QuestionSettings, QuestionType } from '@/types';

// Query keys
export const questionKeys = {
  all: ['questions'] as const,
  lists: () => [...questionKeys.all, 'list'] as const,
  list: (surveyId: string) => [...questionKeys.lists(), surveyId] as const,
  details: () => [...questionKeys.all, 'detail'] as const,
  detail: (surveyId: string, questionId: string) => [...questionKeys.details(), surveyId, questionId] as const,
};

/**
 * Hook to create a new question
 */
export function useCreateQuestion(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuestionRequest) => questionsApi.create(surveyId, data),
    onSuccess: () => {
      // Invalidate survey detail to refetch questions
      queryClient.invalidateQueries({ queryKey: surveyKeys.detail(surveyId) });
      queryClient.invalidateQueries({ queryKey: questionKeys.list(surveyId) });
    },
  });
}

/**
 * Hook to update a question
 */
export function useUpdateQuestion(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, data }: { questionId: string; data: UpdateQuestionRequest }) => questionsApi.update(surveyId, questionId, data),
    onSuccess: (_, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.detail(surveyId) });
      queryClient.invalidateQueries({ queryKey: questionKeys.detail(surveyId, questionId) });
    },
  });
}

/**
 * Hook to delete a question
 */
export function useDeleteQuestion(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) => questionsApi.delete(surveyId, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.detail(surveyId) });
      queryClient.invalidateQueries({ queryKey: questionKeys.list(surveyId) });
    },
  });
}

/**
 * Hook to reorder questions
 */
export function useReorderQuestions(surveyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionIds: string[]) => questionsApi.reorder(surveyId, questionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.detail(surveyId) });
    },
  });
}

/**
 * Batch sync questions - handles create, update, delete, and reorder in one operation
 * This is the main function used by the survey builder for saving
 */
export interface QuestionSyncResult {
  created: Array<{ tempId: string; realId: string; question: Question }>;
  updated: Question[];
  deleted: string[];
  reordered: boolean;
}

export interface QuestionSyncData {
  surveyId: string;
  // Questions to create (have temp_ prefix in ID)
  toCreate: Array<{
    tempId: string;
    data: CreateQuestionRequest;
  }>;
  // Questions to update (have real IDs)
  toUpdate: Array<{
    questionId: string;
    data: UpdateQuestionRequest;
  }>;
  // Question IDs to delete
  toDelete: string[];
  // Final order of question IDs (after mapping temp IDs to real IDs)
  finalOrder: string[];
}

/**
 * Hook to sync all questions in a batch operation
 * Handles creates, updates, deletes, and reordering
 */
export function useSyncQuestions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (syncData: QuestionSyncData): Promise<QuestionSyncResult> => {
      const { surveyId, toCreate, toUpdate, toDelete, finalOrder } = syncData;
      const result: QuestionSyncResult = {
        created: [],
        updated: [],
        deleted: [],
        reordered: false,
      };

      // Map of temp IDs to real IDs (filled as we create)
      const idMap = new Map<string, string>();

      // 1. Delete questions first (to avoid conflicts)
      for (const questionId of toDelete) {
        try {
          await questionsApi.delete(surveyId, questionId);
          result.deleted.push(questionId);
        } catch (error) {
          console.error(`Failed to delete question ${questionId}:`, error);
          // Continue with other operations
        }
      }

      // 2. Create new questions
      for (const { tempId, data } of toCreate) {
        try {
          const created = await questionsApi.create(surveyId, data);
          idMap.set(tempId, created.id);
          result.created.push({ tempId, realId: created.id, question: created });
        } catch (error) {
          console.error(`Failed to create question (temp ID: ${tempId}):`, error);
          throw error; // Fail the whole operation if create fails
        }
      }

      // 3. Update existing questions
      for (const { questionId, data } of toUpdate) {
        try {
          const updated = await questionsApi.update(surveyId, questionId, data);
          result.updated.push(updated);
        } catch (error) {
          console.error(`Failed to update question ${questionId}:`, error);
          // Continue with other operations
        }
      }

      // 4. Reorder questions (map temp IDs to real IDs)
      const mappedOrder = finalOrder.map((id) => (id.startsWith('temp_') ? idMap.get(id) : id)).filter((id): id is string => id !== undefined);

      if (mappedOrder.length > 0) {
        try {
          await questionsApi.reorder(surveyId, mappedOrder);
          result.reordered = true;
        } catch (error) {
          console.error('Failed to reorder questions:', error);
          // Non-critical, continue
        }
      }

      return result;
    },
    onSuccess: (_result, { surveyId }) => {
      // Invalidate survey detail to get fresh data
      queryClient.invalidateQueries({ queryKey: surveyKeys.detail(surveyId) });
      queryClient.invalidateQueries({ queryKey: questionKeys.list(surveyId) });
    },
  });
}

/**
 * Helper to determine what needs to be synced
 */
export interface DraftQuestionData {
  id: string;
  type: QuestionType;
  text: string;
  description?: string;
  isRequired: boolean;
  order: number;
  settings: QuestionSettings | Record<string, unknown>;
}

export function calculateQuestionChanges(
  originalQuestions: Question[],
  draftQuestions: DraftQuestionData[],
  languageCode: string
): {
  toCreate: QuestionSyncData['toCreate'];
  toUpdate: QuestionSyncData['toUpdate'];
  toDelete: string[];
  finalOrder: string[];
} {
  const draftIds = new Set(draftQuestions.map((q) => q.id));

  // Questions to create (have temp_ prefix)
  const toCreate: QuestionSyncData['toCreate'] = draftQuestions
    .filter((q) => q.id.startsWith('temp_'))
    .map((q) => ({
      tempId: q.id,
      data: {
        type: q.type as CreateQuestionRequest['type'],
        text: q.text,
        description: q.description,
        isRequired: q.isRequired,
        order: q.order + 1, // Backend expects 1-based order
        settings: q.settings as QuestionSettings,
        languageCode,
      },
    }));

  // Questions to delete (in original but not in draft, excluding temp IDs)
  const toDelete = originalQuestions.filter((q) => !draftIds.has(q.id)).map((q) => q.id);

  // Questions to update (exist in both, check for changes)
  const toUpdate: QuestionSyncData['toUpdate'] = [];
  for (const draft of draftQuestions) {
    if (draft.id.startsWith('temp_')) continue; // Skip new questions

    const original = originalQuestions.find((q) => q.id === draft.id);
    if (!original) continue; // Skip if not found (shouldn't happen)

    // Check if anything changed (compare with 1-based order since that's what backend uses)
    const hasChanges =
      original.type !== draft.type ||
      original.text !== draft.text ||
      original.description !== draft.description ||
      original.isRequired !== draft.isRequired ||
      original.order !== draft.order + 1 ||
      JSON.stringify(original.settings) !== JSON.stringify(draft.settings);

    if (hasChanges) {
      toUpdate.push({
        questionId: draft.id,
        data: {
          type: draft.type,
          text: draft.text,
          description: draft.description,
          isRequired: draft.isRequired,
          order: draft.order + 1, // Backend expects 1-based order
          settings: draft.settings as QuestionSettings,
          languageCode,
        },
      });
    }
  }

  // Final order (including temp IDs that will be mapped later)
  const finalOrder = draftQuestions.map((q) => q.id);

  return { toCreate, toUpdate, toDelete, finalOrder };
}
