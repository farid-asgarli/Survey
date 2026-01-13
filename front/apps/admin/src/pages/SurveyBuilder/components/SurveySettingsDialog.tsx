import { useTranslation } from 'react-i18next';
import { Settings2, Tags, Check, ChevronDown } from 'lucide-react';
import { Button, Textarea, Dialog, DialogContent, DialogHeader, Menu, MenuItem } from '@/components/ui';
import { useCategoryOptions } from '@/hooks';
import { cn } from '@/lib/utils';

interface SurveySettingsDialogProps {
  isOpen: boolean;
  description: string;
  thankYouMessage: string;
  welcomeMessage: string;
  categoryId?: string;
  onOpenChange: (open: boolean) => void;
  onDescriptionChange: (value: string) => void;
  onThankYouMessageChange: (value: string) => void;
  onWelcomeMessageChange: (value: string) => void;
  onCategoryChange: (categoryId: string | undefined) => void;
}

export function SurveySettingsDialog({
  isOpen,
  description,
  thankYouMessage,
  welcomeMessage,
  categoryId,
  onOpenChange,
  onDescriptionChange,
  onThankYouMessageChange,
  onWelcomeMessageChange,
  onCategoryChange,
}: SurveySettingsDialogProps) {
  const { t } = useTranslation();
  const { data: categoryOptions = [] } = useCategoryOptions();

  // Find the selected category
  const selectedCategory = categoryOptions.find((c) => c.id === categoryId);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent showClose={false}>
        <DialogHeader hero icon={<Settings2 className='h-7 w-7' />} title={t('surveyBuilder.settings')} description={t('surveyBuilder.settings')} showClose />
        <div className='space-y-6 p-4'>
          {/* Survey Description */}
          <Textarea
            label={t('common.description')}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={t('surveys.form.descriptionPlaceholder')}
            rows={3}
          />

          {/* Category Selector */}
          {categoryOptions.length > 0 && (
            <div className='space-y-2'>
              <label className='text-sm font-medium text-on-surface'>{t('categories.title')}</label>
              <Menu
                align='start'
                side='bottom'
                maxHeight='280px'
                trigger={
                  <button
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors',
                      'bg-surface-container hover:bg-surface-container-high border border-outline-variant/40',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'
                    )}
                  >
                    <Tags className='h-4 w-4 text-on-surface-variant' />
                    {selectedCategory ? (
                      <>
                        <span className='w-2.5 h-2.5 rounded-full shrink-0' style={{ backgroundColor: selectedCategory.color }} />
                        <span className='flex-1'>{selectedCategory.name}</span>
                      </>
                    ) : (
                      <span className='flex-1 text-on-surface-variant'>{t('categories.uncategorized')}</span>
                    )}
                    <ChevronDown className='h-4 w-4 text-on-surface-variant' />
                  </button>
                }
              >
                <MenuItem onClick={() => onCategoryChange(undefined)} className={cn(!categoryId && 'bg-primary/8')}>
                  <span className='flex-1 text-on-surface-variant'>{t('categories.uncategorized')}</span>
                  {!categoryId && <Check className='h-4 w-4 text-primary' />}
                </MenuItem>
                {categoryOptions.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <MenuItem key={cat.id} onClick={() => onCategoryChange(cat.id)} className={cn(isSelected && 'bg-primary/8')}>
                      <span className='w-2.5 h-2.5 rounded-full mr-2' style={{ backgroundColor: cat.color }} />
                      <span className='flex-1'>{cat.name}</span>
                      {cat.isDefault && <span className='text-xs text-on-surface-variant mr-2'>{t('categories.badges.default')}</span>}
                      {isSelected && <Check className='h-4 w-4 text-primary' />}
                    </MenuItem>
                  );
                })}
              </Menu>
            </div>
          )}

          {/* Thank You Message */}
          <Textarea
            label={t('surveyBuilder.thankYouMessage')}
            value={thankYouMessage}
            onChange={(e) => onThankYouMessageChange(e.target.value)}
            placeholder={t('surveyBuilder.thankYouMessage')}
            helperText={t('surveyBuilder.thankYouMessageDesc')}
            rows={2}
          />

          {/* Welcome Message */}
          <Textarea
            label={t('surveyBuilder.welcomeMessage')}
            value={welcomeMessage}
            onChange={(e) => onWelcomeMessageChange(e.target.value)}
            placeholder={t('surveyBuilder.welcomeMessage')}
            helperText={t('surveyBuilder.welcomeMessageDesc')}
            rows={2}
          />

          <div className='flex justify-end gap-3 pt-4 border-t border-outline-variant/30'>
            <Button variant='text' onClick={() => onOpenChange(false)}>
              {t('common.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
