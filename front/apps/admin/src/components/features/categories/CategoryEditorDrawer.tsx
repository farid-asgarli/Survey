/**
 * CategoryEditorDrawer - Drawer for creating/editing survey categories
 *
 * Features:
 * - Name and description fields
 * - Color picker with presets
 * - Icon selector
 * - Display order
 * - Active status toggle
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Drawer, DrawerContent, DrawerHeader, DrawerFooter, Button, Input, Textarea, Switch, toast } from '@/components/ui';
import { cn } from '@/lib/utils';
import { Folder, FolderOpen, Tag, Hash, Grid3X3, Box } from 'lucide-react';
import type { SurveyCategory, SurveyCategorySummary } from '@/types';

// ============ Types ============
export interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
}

interface CategoryEditorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: SurveyCategory | SurveyCategorySummary | null;
  onSave: (data: CategoryFormData) => Promise<void>;
  isSaving?: boolean;
}

// ============ Constants ============
const defaultFormData: CategoryFormData = {
  name: '',
  description: '',
  color: '#6366f1',
  icon: 'folder',
  isActive: true,
};

// Color presets for categories
const COLOR_PRESETS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Slate', value: '#64748b' },
];

// Icon options
const ICON_OPTIONS = [
  { name: 'Folder', value: 'folder', icon: Folder },
  { name: 'Folder Open', value: 'folder-open', icon: FolderOpen },
  { name: 'Tag', value: 'tag', icon: Tag },
  { name: 'Hash', value: 'hash', icon: Hash },
  { name: 'Grid', value: 'grid', icon: Grid3X3 },
  { name: 'Box', value: 'box', icon: Box },
];

// ============ Component ============
export function CategoryEditorDrawer({ open, onOpenChange, category, onSave, isSaving = false }: CategoryEditorDrawerProps): React.JSX.Element {
  const { t } = useTranslation();
  const isEditing = !!(category && 'id' in category && category.id);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data from category or defaults
  const initialFormData = useMemo((): CategoryFormData => {
    if (category) {
      return {
        name: category.name || '',
        description: category.description || '',
        color: category.color || defaultFormData.color,
        icon: category.icon || defaultFormData.icon,
        isActive: category.isActive !== false,
      };
    }
    return { ...defaultFormData };
  }, [category]);

  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);

  // Reset form when category changes
  const categoryKey = category && 'id' in category ? category.id : 'new';
  const [prevCategoryKey, setPrevCategoryKey] = useState(categoryKey);
  if (categoryKey !== prevCategoryKey) {
    setPrevCategoryKey(categoryKey);
    setFormData(initialFormData);
    setErrors({});
  }

  const updateField = useCallback(
    <K extends keyof CategoryFormData>(field: K, value: CategoryFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors]
  );

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('validation.required');
    } else if (formData.name.length > 100) {
      newErrors.name = t('validation.maxLength', { count: 100 });
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = t('validation.maxLength', { count: 500 });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, t]);

  const handleSave = useCallback(async () => {
    if (!validate()) {
      toast.error(t('errors.fixErrors'));
      return;
    }

    try {
      await onSave(formData);
      onOpenChange(false);
    } catch {
      // Error handled by mutation
    }
  }, [validate, formData, onSave, onOpenChange, t]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Helper to check if a color is light
  const isLightColor = (hex: string): boolean => {
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length !== 6) return true;
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className='max-w-lg'>
        <DrawerHeader>
          <h2 className='text-xl font-semibold'>{isEditing ? t('categories.editCategory') : t('categories.createCategory')}</h2>
          <p className='text-sm text-on-surface-variant'>{isEditing ? t('categories.editDescription') : t('categories.createDescription')}</p>
        </DrawerHeader>

        <div className='flex-1 overflow-y-auto px-6 py-4 space-y-6'>
          {/* Name Field */}
          <div className='space-y-2'>
            <label htmlFor='name' className='text-sm font-medium text-on-surface'>
              {t('common.name')} <span className='text-error'>*</span>
            </label>
            <Input
              id='name'
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder={t('categories.namePlaceholder')}
              error={errors.name}
            />
            {errors.name && <p className='text-sm text-error'>{errors.name}</p>}
          </div>

          {/* Description Field */}
          <div className='space-y-2'>
            <label htmlFor='description' className='text-sm font-medium text-on-surface'>
              {t('common.description')}
            </label>
            <Textarea
              id='description'
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder={t('categories.descriptionPlaceholder')}
              rows={3}
            />
            {errors.description && <p className='text-sm text-error'>{errors.description}</p>}
          </div>

          {/* Color Picker */}
          <div className='space-y-3'>
            <label className='text-sm font-medium text-on-surface'>{t('categories.color')}</label>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 rounded-xl border-2 border-outline-variant/30 shadow-sm' style={{ backgroundColor: formData.color }} />
              <Input type='color' value={formData.color} onChange={(e) => updateField('color', e.target.value)} className='w-20 h-10 p-1 cursor-pointer' />
              <Input value={formData.color} onChange={(e) => updateField('color', e.target.value)} placeholder='#6366f1' className='w-28' />
            </div>
            <div className='grid grid-cols-8 gap-2'>
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type='button'
                  className={cn('w-8 h-8 rounded-lg transition-all hover:scale-110', formData.color === preset.value && 'ring-2 ring-primary ring-offset-2')}
                  style={{ backgroundColor: preset.value }}
                  onClick={() => updateField('color', preset.value)}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          {/* Icon Selector */}
          <div className='space-y-3'>
            <label className='text-sm font-medium text-on-surface'>{t('categories.icon')}</label>
            <div className='grid grid-cols-6 gap-2'>
              {ICON_OPTIONS.map((option) => {
                const IconComponent = option.icon;
                const isSelected = formData.icon === option.value;
                return (
                  <button
                    key={option.value}
                    type='button'
                    className={cn(
                      'flex items-center justify-center h-12 rounded-xl border-2 transition-all',
                      isSelected
                        ? 'border-primary bg-primary-container/20'
                        : 'border-outline-variant/30 hover:border-outline-variant/50 hover:bg-surface-container-low'
                    )}
                    onClick={() => updateField('icon', option.value)}
                    title={option.name}
                  >
                    <IconComponent className={cn('h-6 w-6', isSelected ? 'text-primary' : 'text-on-surface-variant')} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div className='space-y-3'>
            <label className='text-sm font-medium text-on-surface'>{t('common.preview')}</label>
            <div className='flex items-center gap-3 p-4 rounded-xl border border-outline-variant/30' style={{ backgroundColor: `${formData.color}15` }}>
              <div className='flex items-center justify-center h-12 w-12 rounded-xl' style={{ backgroundColor: formData.color }}>
                {(() => {
                  const IconComponent = ICON_OPTIONS.find((o) => o.value === formData.icon)?.icon || Folder;
                  return <IconComponent className={cn('h-6 w-6', isLightColor(formData.color) ? 'text-gray-800' : 'text-white')} />;
                })()}
              </div>
              <div className='flex-1'>
                <h4 className='font-semibold text-on-surface'>{formData.name || t('categories.namePlaceholder')}</h4>
                {formData.description && <p className='text-sm text-on-surface-variant line-clamp-1'>{formData.description}</p>}
              </div>
            </div>
          </div>

          {/* Active Status (only show when editing) */}
          {isEditing && (
            <div className='flex items-center justify-between py-3 border-t border-outline-variant/30'>
              <div>
                <label htmlFor='isActive' className='text-sm font-medium text-on-surface'>
                  {t('common.active')}
                </label>
                <p className='text-sm text-on-surface-variant'>{t('categories.activeDescription')}</p>
              </div>
              <Switch id='isActive' checked={formData.isActive} onChange={(e) => updateField('isActive', e.target.checked)} />
            </div>
          )}
        </div>

        <DrawerFooter>
          <Button variant='outline' onClick={handleClose} disabled={isSaving}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} loading={isSaving}>
            {isEditing ? t('common.save') : t('common.create')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
