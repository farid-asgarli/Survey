// RecipientImporter component for CSV upload and manual email entry

import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, Plus, AlertCircle, CheckCircle2, FileText, Users, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDialogState } from '@/hooks';
import { Button, Input, Card, CardContent, Chip, Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter } from '@/components/ui';

interface RecipientImporterProps {
  recipients: string[];
  onChange: (recipients: string[]) => void;
  maxRecipients?: number;
  className?: string;
}

interface ParseResult {
  valid: string[];
  invalid: string[];
  duplicates: string[];
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

function parseCSV(content: string): string[] {
  // Handle different CSV formats - emails can be in any column
  const lines = content.split(/\r?\n/);
  const emails: string[] = [];

  for (const line of lines) {
    // Try to find email in each cell
    const cells = line.split(/[,;\t]/);
    for (const cell of cells) {
      const trimmed = cell.trim().replace(/^["']|["']$/g, ''); // Remove quotes
      if (validateEmail(trimmed)) {
        emails.push(trimmed.toLowerCase());
      }
    }
  }

  return emails;
}

function processEmails(newEmails: string[], existingEmails: string[]): ParseResult {
  const valid: string[] = [];
  const invalid: string[] = [];
  const duplicates: string[] = [];
  const existingSet = new Set(existingEmails.map((e) => e.toLowerCase()));
  const seenInBatch = new Set<string>();

  for (const email of newEmails) {
    const normalized = email.trim().toLowerCase();
    if (!normalized) continue;

    if (!validateEmail(normalized)) {
      invalid.push(email);
    } else if (existingSet.has(normalized) || seenInBatch.has(normalized)) {
      duplicates.push(email);
    } else {
      valid.push(normalized);
      seenInBatch.add(normalized);
    }
  }

  return { valid, invalid, duplicates };
}

export function RecipientImporter({ recipients, onChange, maxRecipients = 10000, className }: RecipientImporterProps) {
  const { t } = useTranslation();
  const [manualEmail, setManualEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [importResult, setImportResult] = useState<ParseResult | null>(null);
  const importDialog = useDialogState();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddEmail = useCallback(() => {
    const email = manualEmail.trim().toLowerCase();

    if (!email) {
      setEmailError(t('recipientImporter.enterEmail'));
      return;
    }

    if (!validateEmail(email)) {
      setEmailError(t('recipientImporter.invalidEmail'));
      return;
    }

    if (recipients.includes(email)) {
      setEmailError(t('recipientImporter.duplicateEmail'));
      return;
    }

    if (recipients.length >= maxRecipients) {
      setEmailError(t('recipientImporter.maxRecipientsError', { max: maxRecipients }));
      return;
    }

    onChange([...recipients, email]);
    setManualEmail('');
    setEmailError('');
  }, [manualEmail, recipients, onChange, maxRecipients, t]);

  const handleRemoveEmail = useCallback(
    (email: string) => {
      onChange(recipients.filter((r) => r !== email));
    },
    [recipients, onChange]
  );

  const handleClearAll = useCallback(() => {
    onChange([]);
  }, [onChange]);

  const handleFileSelect = useCallback(
    async (file: File) => {
      const text = await file.text();
      const emails = parseCSV(text);
      const result = processEmails(emails, recipients);

      setImportResult(result);
      importDialog.open();
    },
    [recipients, importDialog]
  );

  const handleConfirmImport = useCallback(() => {
    if (importResult) {
      const newRecipients = [...recipients, ...importResult.valid].slice(0, maxRecipients);
      onChange(newRecipients);
      setImportResult(null);
      importDialog.close();
    }
  }, [importResult, recipients, onChange, maxRecipients, importDialog]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files[0];
      if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [handleFileSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddEmail();
      }
    },
    [handleAddEmail]
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Manual Entry */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder={t('recipientImporter.emailPlaceholder')}
            value={manualEmail}
            onChange={(e) => {
              setManualEmail(e.target.value);
              setEmailError('');
            }}
            onKeyDown={handleKeyDown}
            error={emailError}
            size="default"
          />
        </div>
        <Button variant="tonal" onClick={handleAddEmail} className="shrink-0">
          <Plus className="w-4 h-4 mr-1" />
          {t('common.add')}
        </Button>
      </div>

      {/* CSV Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-6 transition-all duration-200',
          'flex flex-col items-center justify-center gap-3',
          dragActive
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-outline-variant/50 hover:border-outline-variant bg-surface-container-lowest'
        )}
      >
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
            dragActive ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant'
          )}
        >
          <Upload className="w-6 h-6" />
        </div>
        <div className="text-center">
          <p className="text-sm text-on-surface font-medium">{t('recipientImporter.dropCsvHere')}</p>
          <p className="text-xs text-on-surface-variant mt-1">{t('recipientImporter.orClickToBrowse')}</p>
        </div>
        <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleFileChange} className="hidden" id="csv-upload" />
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          <FileText className="w-4 h-4 mr-2" />
          {t('recipientImporter.browseFiles')}
        </Button>
      </div>

      {/* Recipients List */}
      {recipients.length > 0 && (
        <Card variant="outlined">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-on-surface-variant" />
                <span className="text-sm font-medium text-on-surface">{t('recipientImporter.recipientCount', { count: recipients.length })}</span>
              </div>
              <Button variant="text" size="sm" onClick={handleClearAll} className="text-error hover:bg-error/10">
                <Trash2 className="w-4 h-4 mr-1" />
                {t('common.clearAll')}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {recipients.slice(0, 100).map((email) => (
                <Chip key={email} size="sm" className="bg-surface-container-high text-on-surface pr-1">
                  {email}
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className="ml-1 p-0.5 hover:bg-on-surface/10 rounded-full transition-colors"
                    aria-label={`Remove ${email}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Chip>
              ))}
              {recipients.length > 100 && (
                <Chip size="sm" className="bg-surface-container-highest text-on-surface-variant">
                  {t('recipientImporter.moreRecipients', { count: recipients.length - 100 })}
                </Chip>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Preview Dialog */}
      <Dialog open={importDialog.isOpen} onOpenChange={importDialog.setOpen}>
        <DialogContent size="default" showClose={false}>
          <DialogHeader
            hero
            icon={<Upload className="h-7 w-7" />}
            title={t('recipientImporter.importTitle')}
            description={t('recipientImporter.importDescription')}
            showClose
          />
          <DialogBody>
            {importResult && (
              <div className="space-y-4">
                {/* Valid emails */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-success-container/30">
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-on-surface">{t('recipientImporter.validEmails', { count: importResult.valid.length })}</p>
                    <p className="text-xs text-on-surface-variant">{t('recipientImporter.willBeAdded')}</p>
                  </div>
                </div>

                {/* Duplicates */}
                {importResult.duplicates.length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-warning-container/30">
                    <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-on-surface">
                        {t('recipientImporter.duplicatesSkipped', { count: importResult.duplicates.length })}
                      </p>
                      <p className="text-xs text-on-surface-variant">{t('recipientImporter.alreadyInList')}</p>
                    </div>
                  </div>
                )}

                {/* Invalid emails */}
                {importResult.invalid.length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-error-container/30">
                    <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-on-surface">
                        {t('recipientImporter.invalidEmails', { count: importResult.invalid.length })}
                      </p>
                      <div className="mt-2 max-h-24 overflow-y-auto">
                        {importResult.invalid.slice(0, 10).map((email, i) => (
                          <p key={i} className="text-xs text-on-surface-variant truncate">
                            {email}
                          </p>
                        ))}
                        {importResult.invalid.length > 10 && (
                          <p className="text-xs text-on-surface-variant font-medium">
                            {t('recipientImporter.moreInvalid', { count: importResult.invalid.length - 10 })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="text" onClick={() => importDialog.close()}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleConfirmImport} disabled={!importResult || importResult.valid.length === 0}>
              {t('recipientImporter.importButton', { count: importResult?.valid.length || 0 })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
