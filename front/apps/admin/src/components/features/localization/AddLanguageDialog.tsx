// Add Language Dialog - Dialog for adding new languages to a survey
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Check, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter, Button, Input, Checkbox } from '@/components/ui';
import { cn } from '@/lib/utils';
import { LANGUAGE_INFO } from './SurveyLanguageSwitcher';

// Popular languages shown at the top
const POPULAR_LANGUAGE_CODES = ['es', 'fr', 'de', 'pt', 'it', 'nl'];

// All available languages for surveys (subset of LANGUAGE_INFO)
const ALL_LANGUAGES = Object.entries(LANGUAGE_INFO).map(([languageCode, info]) => ({
  ...info,
  code: languageCode,
}));

interface AddLanguageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Languages already added to the survey */
  existingLanguages: string[];
  /** Default language of the survey (for auto-translate source) */
  defaultLanguage: string;
  /** Callback when a language is added */
  onAddLanguage: (languageCode: string, autoTranslate: boolean) => void;
  /** Whether the add operation is in progress */
  isLoading?: boolean;
}

export function AddLanguageDialog({
  open,
  onOpenChange,
  existingLanguages,
  defaultLanguage,
  onAddLanguage,
  isLoading = false,
}: AddLanguageDialogProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [autoTranslate, setAutoTranslate] = useState(false);

  // Filter out existing languages and apply search
  const availableLanguages = useMemo(() => {
    return ALL_LANGUAGES.filter((lang) => {
      // Exclude already added languages
      if (existingLanguages.includes(lang.code)) return false;

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return lang.code.toLowerCase().includes(query) || lang.name.toLowerCase().includes(query) || lang.nativeName.toLowerCase().includes(query);
      }
      return true;
    });
  }, [existingLanguages, searchQuery]);

  // Popular languages that are still available
  const popularLanguages = useMemo(() => {
    return availableLanguages.filter((lang) => POPULAR_LANGUAGE_CODES.includes(lang.code));
  }, [availableLanguages]);

  // Other languages (not in popular list)
  const otherLanguages = useMemo(() => {
    return availableLanguages.filter((lang) => !POPULAR_LANGUAGE_CODES.includes(lang.code));
  }, [availableLanguages]);

  const handleAdd = () => {
    if (selectedLanguage) {
      onAddLanguage(selectedLanguage, autoTranslate);
      // Reset state
      setSelectedLanguage(null);
      setSearchQuery('');
      setAutoTranslate(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state on close
    setSelectedLanguage(null);
    setSearchQuery('');
    setAutoTranslate(false);
  };

  const defaultLangInfo = LANGUAGE_INFO[defaultLanguage] || { nativeName: defaultLanguage };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="sm" onClose={handleClose}>
        <DialogHeader
          hero
          icon={<Globe className="w-6 h-6" />}
          title={t('localization.addLanguageTitle', 'Add Language')}
          description={t('localization.addLanguageDescription', 'Add a new language translation to this survey')}
          variant="primary"
        />

        <DialogBody className="p-0">
          {/* Search Input */}
          <div className="px-5 py-4 border-b border-outline-variant/20">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('localization.searchLanguages', 'Search languages...')}
                className="pl-11 rounded-full"
              />
            </div>
          </div>

          {/* Language List */}
          <div className="max-h-72 overflow-y-auto">
            {/* Popular Languages */}
            {popularLanguages.length > 0 && !searchQuery && (
              <div className="p-4">
                <p className="px-2 py-1.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                  {t('localization.popularLanguages', 'Popular Languages')}
                </p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {popularLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={cn(
                        // M3 Expressive: Pill-shaped with dynamic radius
                        'flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all duration-200',
                        'hover:rounded-3xl',
                        selectedLanguage === lang.code
                          ? 'bg-primary-container/40 border-primary/40 ring-2 ring-primary/20'
                          : 'border-outline-variant/30 hover:bg-surface-container hover:border-primary/20'
                      )}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="text-xs font-semibold text-on-surface">{lang.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            {popularLanguages.length > 0 && otherLanguages.length > 0 && !searchQuery && (
              <div className="px-5">
                <div className="border-t border-outline-variant/20" />
              </div>
            )}

            {/* All/Other Languages */}
            {(otherLanguages.length > 0 || searchQuery) && (
              <div className="p-4">
                {!searchQuery && (
                  <p className="px-2 py-1.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                    {t('localization.allLanguages', 'All Languages')}
                  </p>
                )}
                <div className="space-y-1 mt-2">
                  {(searchQuery ? availableLanguages : otherLanguages).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={cn(
                        // M3 Expressive: Dynamic shape on selection
                        'flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left border-2',
                        'transition-all duration-200',
                        selectedLanguage === lang.code
                          ? 'bg-primary-container/30 border-primary/30 rounded-2xl'
                          : 'border-transparent hover:bg-surface-container hover:border-outline-variant/20'
                      )}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-on-surface">{lang.nativeName}</span>
                        <span className="text-xs text-on-surface-variant ml-2">({lang.name})</span>
                      </div>
                      {selectedLanguage === lang.code && (
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary">
                          <Check className="w-4 h-4 text-on-primary" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {availableLanguages.length === 0 && (
              <div className="p-10 text-center">
                <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-2xl bg-surface-container-high border border-outline-variant/20">
                  <Globe className="w-7 h-7 text-on-surface-variant" />
                </div>
                <p className="text-sm font-medium text-on-surface-variant">
                  {searchQuery
                    ? t('common.noResults', 'No results found')
                    : t('localization.languageAlreadyExists', 'All available languages have been added')}
                </p>
              </div>
            )}
          </div>

          {/* Auto-translate Option */}
          {selectedLanguage && (
            <div className="px-5 py-4 border-t border-outline-variant/20 bg-surface-container/40">
              <label className="flex items-start gap-4 cursor-pointer p-3 rounded-2xl hover:bg-surface-container transition-colors">
                <Checkbox checked={autoTranslate} onChange={(e) => setAutoTranslate(e.target.checked)} className="mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-on-surface">{t('localization.autoTranslate', 'Auto-translate from default language')}</p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {t(
                      'localization.autoTranslateDesc',
                      'Use machine translation to create initial translations from {{language}} (you can edit them later)',
                      { language: defaultLangInfo.nativeName }
                    )}
                  </p>
                </div>
              </label>
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="text" onClick={handleClose} className="rounded-full">
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button variant="filled" onClick={handleAdd} disabled={!selectedLanguage} loading={isLoading} className="rounded-full">
            {selectedLanguage
              ? t('localization.addLanguage', 'Add {{language}}', {
                  language: LANGUAGE_INFO[selectedLanguage]?.nativeName || selectedLanguage,
                })
              : t('localization.addLanguage', 'Add Language')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
