// Survey Builder Store - Zustand store with undo/redo, autosave, and state management

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Survey, QuestionSettings } from '@/types';
import { QuestionType } from '@/types/enums';

// ============ Types ============

export interface DraftQuestion {
  id: string;
  type: QuestionType;
  text: string;
  description?: string;
  isRequired: boolean;
  order: number;
  settings: QuestionSettings;
  options: DraftOption[];
}

export interface DraftOption {
  id: string;
  text: string;
  value?: string;
  order: number;
}

export interface SurveyBuilderState {
  // Survey data
  survey: Survey | null;
  questions: DraftQuestion[];
  // Original questions from server (for calculating changes)
  originalQuestions: Survey['questions'];

  // Editor state
  selectedQuestionId: string | null;
  activePanel: 'questions' | 'theme' | 'settings';
  isPreviewMode: boolean;

  // Read-only mode (for published/closed/archived surveys)
  isReadOnly: boolean;

  // Dirty state & autosave
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;

  // Undo/Redo
  history: HistoryEntry[];
  historyIndex: number;

  // UI State
  isAddQuestionMenuOpen: boolean;
  draggedQuestionId: null | string;

  // Localization - current editing language
  editingLanguage: string;
}

interface HistoryEntry {
  questions: DraftQuestion[];
  timestamp: number;
}

interface SurveyBuilderActions {
  // Survey operations
  initializeSurvey: (survey: Survey) => void;
  updateSurveyMetadata: (
    updates: Partial<
      Pick<Survey, 'title' | 'description' | 'welcomeMessage' | 'thankYouMessage' | 'themeId' | 'presetThemeId' | 'themeCustomizations'>
    >
  ) => void;
  resetBuilder: () => void;

  // Question operations
  addQuestion: (type: QuestionType, afterQuestionId?: string) => void;
  updateQuestion: (questionId: string, updates: Partial<DraftQuestion>) => void;
  deleteQuestion: (questionId: string) => void;
  duplicateQuestion: (questionId: string) => void;
  reorderQuestions: (startIndex: number, endIndex: number) => void;

  // Option operations
  addOption: (questionId: string) => void;
  updateOption: (questionId: string, optionId: string, updates: Partial<DraftOption>) => void;
  deleteOption: (questionId: string, optionId: string) => void;
  reorderOptions: (questionId: string, startIndex: number, endIndex: number) => void;

  // Selection
  selectQuestion: (questionId: string | null) => void;

  // Panel navigation
  setActivePanel: (panel: 'questions' | 'theme' | 'settings') => void;
  setPreviewMode: (isPreview: boolean) => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Save state
  markDirty: () => void;
  markSaved: () => void;
  setSaving: (isSaving: boolean) => void;

  // UI State
  setAddQuestionMenuOpen: (isOpen: boolean) => void;
  setDraggedQuestionId: (questionId: string | null) => void;

  // Localization
  setEditingLanguage: (languageCode: string) => void;
  addLanguage: (languageCode: string) => void;

  // Question ID mapping (after save)
  applyQuestionIdMappings: (mappings: Array<{ tempId: string; realId: string }>) => void;

  // Helpers
  getQuestionById: (questionId: string) => DraftQuestion | undefined;
  getQuestionsForSave: () => Array<{
    type: QuestionType;
    text: string;
    description?: string;
    isRequired: boolean;
    order: number;
    settings: QuestionSettings;
    options: Array<{ text: string; value?: string; order: number }>;
  }>;
}

// ============ Helpers ============

/** Generate temporary ID for questions (used to identify new questions) */
const generateTempId = () => `temp_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;

/** Generate UUID v4 for option IDs (backend requires valid GUIDs) */
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const getDefaultSettings = (type: QuestionType): QuestionSettings => {
  switch (type) {
    case QuestionType.Rating:
      return { minValue: 1, maxValue: 5, minLabel: 'Poor', maxLabel: 'Excellent' };
    case QuestionType.Scale:
      return { minValue: 0, maxValue: 10, minLabel: 'Not likely', maxLabel: 'Very likely' };
    case QuestionType.NPS:
      return { minValue: 0, maxValue: 10, minLabel: 'Not at all likely', maxLabel: 'Extremely likely' };
    case QuestionType.Matrix:
      return { matrixRows: ['Row 1'], matrixColumns: ['Column 1', 'Column 2', 'Column 3'] };
    case QuestionType.Text:
    case QuestionType.ShortText:
      return { maxLength: 255, placeholder: 'Enter your answer...' };
    case QuestionType.Email:
      return { maxLength: 255, placeholder: 'Enter your email address...' };
    case QuestionType.Number:
      return { placeholder: 'Enter a number...' };
    case QuestionType.LongText:
      return { maxLength: 2000, placeholder: 'Enter your detailed response...' };
    case QuestionType.FileUpload:
      return { allowedFileTypes: ['.pdf', '.doc', '.docx', '.jpg', '.png'], maxFileSize: 5, maxFiles: 3 };
    case QuestionType.Date:
    case QuestionType.DateTime:
      return {};
    default:
      return {};
  }
};

const getDefaultOptions = (type: QuestionType): DraftOption[] => {
  if (
    (
      [QuestionType.SingleChoice, QuestionType.MultipleChoice, QuestionType.Ranking, QuestionType.Dropdown, QuestionType.Checkbox] as QuestionType[]
    ).includes(type)
  ) {
    return [
      { id: generateUUID(), text: 'Option 1', order: 0 },
      { id: generateUUID(), text: 'Option 2', order: 1 },
    ];
  }
  if (type === QuestionType.YesNo) {
    return [
      { id: generateUUID(), text: 'Yes', order: 0 },
      { id: generateUUID(), text: 'No', order: 1 },
    ];
  }
  return [];
};

const getQuestionTypeLabel = (type: QuestionType): string => {
  const labels: Record<QuestionType, string> = {
    [QuestionType.SingleChoice]: 'Single Choice',
    [QuestionType.MultipleChoice]: 'Multiple Choice',
    [QuestionType.Text]: 'Short Text',
    [QuestionType.LongText]: 'Long Text',
    [QuestionType.Rating]: 'Rating',
    [QuestionType.Scale]: 'Scale',
    [QuestionType.Matrix]: 'Matrix',
    [QuestionType.Date]: 'Date',
    [QuestionType.DateTime]: 'Date & Time',
    [QuestionType.FileUpload]: 'File Upload',
    [QuestionType.Ranking]: 'Ranking',
    [QuestionType.YesNo]: 'Yes/No',
    [QuestionType.Dropdown]: 'Dropdown',
    [QuestionType.NPS]: 'Net Promoter Score',
    [QuestionType.Checkbox]: 'Checkbox',
    [QuestionType.Number]: 'Number',
    [QuestionType.ShortText]: 'Short Text',
    [QuestionType.Email]: 'Email',
    [QuestionType.Phone]: 'Phone Number',
    [QuestionType.Url]: 'Website URL',
  };
  return labels[type] || String(type);
};

const surveyToQuestions = (survey: Survey): DraftQuestion[] => {
  return (survey.questions || []).map((q, index) => {
    // Options have id, text, order structure
    const options = q.settings?.options || [];
    return {
      id: q.id,
      type: q.type,
      text: q.text,
      description: q.description,
      isRequired: q.isRequired,
      order: index, // Use 0-based index internally, server uses 1-based
      settings: q.settings || {},
      options: options.map((opt, optIndex) => ({
        id: opt.id || `temp-opt-${optIndex}`,
        text: opt.text,
        value: opt.text, // value mirrors text for DraftOption compatibility
        order: opt.order ?? optIndex,
      })),
    };
  });
};

// ============ Initial State ============

const initialState: SurveyBuilderState = {
  survey: null,
  questions: [],
  originalQuestions: [],
  selectedQuestionId: null,
  activePanel: 'questions',
  isPreviewMode: false,
  isReadOnly: false,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  history: [],
  historyIndex: -1,
  isAddQuestionMenuOpen: false,
  draggedQuestionId: null,
  editingLanguage: 'en', // Default editing language
};

const MAX_HISTORY = 50;

// ============ Store ============

export const useSurveyBuilderStore = create<SurveyBuilderState & SurveyBuilderActions>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,

      // ============ Survey Operations ============

      initializeSurvey: (survey) => {
        const questions = surveyToQuestions(survey);
        // Survey is read-only if it's not a draft (published, closed, or archived)
        const isReadOnly = survey.status !== 0; // 0 = Draft
        set((state) => {
          state.survey = survey;
          state.questions = questions;
          // Store original questions for change detection during save
          state.originalQuestions = survey.questions || [];
          state.selectedQuestionId = questions.length > 0 ? questions[0].id : null;
          state.isDirty = false;
          state.isReadOnly = isReadOnly;
          state.history = [{ questions: JSON.parse(JSON.stringify(questions)), timestamp: Date.now() }];
          state.historyIndex = 0;
          state.activePanel = 'questions';
          state.isPreviewMode = false;
          // Set editing language to survey's default language
          state.editingLanguage = survey.defaultLanguage || 'en';
        });
      },

      updateSurveyMetadata: (updates) => {
        set((state) => {
          if (state.survey) {
            Object.assign(state.survey, updates);
            state.isDirty = true;
          }
        });
      },

      resetBuilder: () => {
        set(() => ({ ...initialState }));
      },

      // ============ Question Operations ============

      addQuestion: (type, afterQuestionId) => {
        const newQuestion: DraftQuestion = {
          id: generateTempId(),
          type,
          text: `New ${getQuestionTypeLabel(type)} Question`,
          description: '',
          isRequired: false,
          order: 0,
          settings: getDefaultSettings(type),
          options: getDefaultOptions(type),
        };

        set((state) => {
          // Find insertion index
          let insertIndex = state.questions.length;
          if (afterQuestionId) {
            const afterIndex = state.questions.findIndex((q: DraftQuestion) => q.id === afterQuestionId);
            if (afterIndex !== -1) {
              insertIndex = afterIndex + 1;
            }
          }

          // Insert and reorder
          state.questions.splice(insertIndex, 0, newQuestion);
          state.questions.forEach((q: DraftQuestion, i: number) => {
            q.order = i;
          });

          // Select new question
          state.selectedQuestionId = newQuestion.id;
          state.isDirty = true;
          state.isAddQuestionMenuOpen = false;

          // Save to history
          const newHistoryEntry = { questions: JSON.parse(JSON.stringify(state.questions)), timestamp: Date.now() };
          state.history = state.history.slice(0, state.historyIndex + 1);
          state.history.push(newHistoryEntry);
          if (state.history.length > MAX_HISTORY) {
            state.history.shift();
          }
          state.historyIndex = state.history.length - 1;
        });
      },

      updateQuestion: (questionId, updates) => {
        set((state) => {
          const question = state.questions.find((q: DraftQuestion) => q.id === questionId);
          if (question) {
            Object.assign(question, updates);
            state.isDirty = true;

            // Save to history (debounced in component)
            const newHistoryEntry = { questions: JSON.parse(JSON.stringify(state.questions)), timestamp: Date.now() };
            state.history = state.history.slice(0, state.historyIndex + 1);
            state.history.push(newHistoryEntry);
            if (state.history.length > MAX_HISTORY) {
              state.history.shift();
            }
            state.historyIndex = state.history.length - 1;
          }
        });
      },

      deleteQuestion: (questionId) => {
        set((state) => {
          const index = state.questions.findIndex((q: DraftQuestion) => q.id === questionId);
          if (index !== -1) {
            state.questions.splice(index, 1);
            state.questions.forEach((q: DraftQuestion, i: number) => {
              q.order = i;
            });

            // Update selection
            if (state.selectedQuestionId === questionId) {
              if (state.questions.length > 0) {
                state.selectedQuestionId = state.questions[Math.min(index, state.questions.length - 1)].id;
              } else {
                state.selectedQuestionId = null;
              }
            }

            state.isDirty = true;

            // Save to history
            const newHistoryEntry = { questions: JSON.parse(JSON.stringify(state.questions)), timestamp: Date.now() };
            state.history = state.history.slice(0, state.historyIndex + 1);
            state.history.push(newHistoryEntry);
            if (state.history.length > MAX_HISTORY) {
              state.history.shift();
            }
            state.historyIndex = state.history.length - 1;
          }
        });
      },

      duplicateQuestion: (questionId) => {
        set((state) => {
          const question = state.questions.find((q: DraftQuestion) => q.id === questionId);
          if (question) {
            const duplicate: DraftQuestion = {
              ...JSON.parse(JSON.stringify(question)),
              id: generateTempId(),
              text: `${question.text} (Copy)`,
              options: question.options.map((o: DraftOption) => ({
                ...o,
                id: generateUUID(),
              })),
            };

            const index = state.questions.findIndex((q: DraftQuestion) => q.id === questionId);
            state.questions.splice(index + 1, 0, duplicate);
            state.questions.forEach((q: DraftQuestion, i: number) => {
              q.order = i;
            });

            state.selectedQuestionId = duplicate.id;
            state.isDirty = true;

            // Save to history
            const newHistoryEntry = { questions: JSON.parse(JSON.stringify(state.questions)), timestamp: Date.now() };
            state.history = state.history.slice(0, state.historyIndex + 1);
            state.history.push(newHistoryEntry);
            if (state.history.length > MAX_HISTORY) {
              state.history.shift();
            }
            state.historyIndex = state.history.length - 1;
          }
        });
      },

      reorderQuestions: (startIndex, endIndex) => {
        set((state) => {
          const [moved] = state.questions.splice(startIndex, 1);
          state.questions.splice(endIndex, 0, moved);
          state.questions.forEach((q: DraftQuestion, i: number) => {
            q.order = i;
          });

          state.isDirty = true;

          // Save to history
          const newHistoryEntry = { questions: JSON.parse(JSON.stringify(state.questions)), timestamp: Date.now() };
          state.history = state.history.slice(0, state.historyIndex + 1);
          state.history.push(newHistoryEntry);
          if (state.history.length > MAX_HISTORY) {
            state.history.shift();
          }
          state.historyIndex = state.history.length - 1;
        });
      },

      // ============ Option Operations ============

      addOption: (questionId) => {
        set((state) => {
          const question = state.questions.find((q: DraftQuestion) => q.id === questionId);
          if (question) {
            const newOption: DraftOption = {
              id: generateUUID(),
              text: `Option ${question.options.length + 1}`,
              order: question.options.length,
            };
            question.options.push(newOption);
            state.isDirty = true;
          }
        });
      },

      updateOption: (questionId, optionId, updates) => {
        set((state) => {
          const question = state.questions.find((q: DraftQuestion) => q.id === questionId);
          if (question) {
            const option = question.options.find((o: DraftOption) => o.id === optionId);
            if (option) {
              Object.assign(option, updates);
              state.isDirty = true;
            }
          }
        });
      },

      deleteOption: (questionId, optionId) => {
        set((state) => {
          const question = state.questions.find((q: DraftQuestion) => q.id === questionId);
          if (question) {
            const index = question.options.findIndex((o: DraftOption) => o.id === optionId);
            if (index !== -1) {
              question.options.splice(index, 1);
              question.options.forEach((o: DraftOption, i: number) => {
                o.order = i;
              });
              state.isDirty = true;
            }
          }
        });
      },

      reorderOptions: (questionId, startIndex, endIndex) => {
        set((state) => {
          const question = state.questions.find((q: DraftQuestion) => q.id === questionId);
          if (question) {
            const [moved] = question.options.splice(startIndex, 1);
            question.options.splice(endIndex, 0, moved);
            question.options.forEach((o: DraftOption, i: number) => {
              o.order = i;
            });
            state.isDirty = true;
          }
        });
      },

      // ============ Selection ============

      selectQuestion: (questionId) => {
        set((state) => {
          state.selectedQuestionId = questionId;
        });
      },

      // ============ Panel Navigation ============

      setActivePanel: (panel) => {
        set((state) => {
          state.activePanel = panel;
        });
      },

      setPreviewMode: (isPreview) => {
        set((state) => {
          state.isPreviewMode = isPreview;
        });
      },

      // ============ Undo/Redo ============

      undo: () => {
        set((state) => {
          if (state.historyIndex > 0) {
            state.historyIndex -= 1;
            state.questions = JSON.parse(JSON.stringify(state.history[state.historyIndex].questions));
            state.isDirty = true;
          }
        });
      },

      redo: () => {
        set((state) => {
          if (state.historyIndex < state.history.length - 1) {
            state.historyIndex += 1;
            state.questions = JSON.parse(JSON.stringify(state.history[state.historyIndex].questions));
            state.isDirty = true;
          }
        });
      },

      canUndo: () => {
        const state = get();
        return state.historyIndex > 0;
      },

      canRedo: () => {
        const state = get();
        return state.historyIndex < state.history.length - 1;
      },

      // ============ Save State ============

      markDirty: () => {
        set((state) => {
          state.isDirty = true;
        });
      },

      markSaved: () => {
        set((state) => {
          state.isDirty = false;
          state.lastSavedAt = new Date();
          // Update originalQuestions to match current state
          // (for questions that didn't need ID mapping)
          const now = new Date().toISOString();
          state.originalQuestions = state.questions.map((q) => {
            // Try to find the original question to preserve createdAt
            const original = state.originalQuestions?.find((oq) => oq.id === q.id);
            return {
              id: q.id,
              surveyId: state.survey?.id || '',
              type: q.type,
              text: q.text,
              description: q.description,
              isRequired: q.isRequired,
              order: q.order,
              settings: q.settings,
              options: q.options.map((o) => ({
                id: o.id,
                questionId: q.id,
                text: o.text,
                value: o.value,
                order: o.order,
              })),
              createdAt: original?.createdAt || now,
              updatedAt: now,
            };
          });
        });
      },

      setSaving: (isSaving) => {
        set((state) => {
          state.isSaving = isSaving;
        });
      },

      // ============ UI State ============

      setAddQuestionMenuOpen: (isOpen) => {
        set((state) => {
          state.isAddQuestionMenuOpen = isOpen;
        });
      },

      setDraggedQuestionId: (questionId) => {
        set((state) => {
          state.draggedQuestionId = questionId;
        });
      },

      // ============ Localization ============

      setEditingLanguage: (languageCode) => {
        set((state) => {
          state.editingLanguage = languageCode;
        });
      },

      addLanguage: (languageCode) => {
        set((state) => {
          if (state.survey && !state.survey.availableLanguages.includes(languageCode)) {
            state.survey.availableLanguages = [...state.survey.availableLanguages, languageCode];
          }
        });
      },

      // ============ Question ID Mapping ============

      applyQuestionIdMappings: (mappings) => {
        set((state) => {
          // Create a map for quick lookup
          const idMap = new Map(mappings.map((m) => [m.tempId, m.realId]));

          // Update question IDs
          state.questions.forEach((question) => {
            const newId = idMap.get(question.id);
            if (newId) {
              question.id = newId;
            }
          });

          // Update selected question ID if it was a temp ID
          if (state.selectedQuestionId) {
            const newSelectedId = idMap.get(state.selectedQuestionId);
            if (newSelectedId) {
              state.selectedQuestionId = newSelectedId;
            }
          }

          // Update history entries
          state.history.forEach((entry) => {
            entry.questions.forEach((question) => {
              const newId = idMap.get(question.id);
              if (newId) {
                question.id = newId;
              }
            });
          });

          // Update originalQuestions to match current state (since we just saved)
          const now = new Date().toISOString();
          state.originalQuestions = state.questions.map((q) => {
            // Try to find the original question to preserve createdAt
            const original = state.originalQuestions?.find((oq) => oq.id === q.id);
            return {
              id: q.id,
              surveyId: state.survey?.id || '',
              type: q.type,
              text: q.text,
              description: q.description,
              isRequired: q.isRequired,
              order: q.order,
              settings: q.settings,
              options: q.options.map((o) => ({
                id: o.id,
                questionId: q.id,
                text: o.text,
                value: o.value,
                order: o.order,
              })),
              createdAt: original?.createdAt || now,
              updatedAt: now,
            };
          });
        });
      },

      // ============ Helpers ============

      getQuestionById: (questionId) => {
        return get().questions.find((q) => q.id === questionId);
      },

      getQuestionsForSave: () => {
        return get().questions.map((q) => ({
          type: q.type,
          text: q.text,
          description: q.description,
          isRequired: q.isRequired,
          order: q.order + 1, // Backend expects 1-based order
          settings: q.settings,
          options: q.options.map((o) => ({
            text: o.text,
            value: o.value,
            order: o.order + 1, // Backend expects 1-based order
          })),
        }));
      },
    }))
  )
);

// Selector hooks for optimized re-renders
export const useSelectedQuestion = () => {
  const selectedQuestionId = useSurveyBuilderStore((state) => state.selectedQuestionId);
  const questions = useSurveyBuilderStore((state) => state.questions);
  return questions.find((q) => q.id === selectedQuestionId);
};

export const useBuilderIsDirty = () => useSurveyBuilderStore((state) => state.isDirty);
export const useBuilderIsSaving = () => useSurveyBuilderStore((state) => state.isSaving);
export const useBuilderIsReadOnly = () => useSurveyBuilderStore((state) => state.isReadOnly);
