import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Trash2, Upload, X, Loader2, ImagePlus } from 'lucide-react';
import { Avatar, Button, Dialog, DialogHeader, DialogContent, DialogFooter } from '@/components/ui';
import { useDialogState } from '@/hooks';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  fallback: string;
  onUpload: (file: File) => Promise<void>;
  onRemove?: () => Promise<void>;
  isUploading?: boolean;
  isRemoving?: boolean;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

const DEFAULT_MAX_SIZE_MB = 2;
const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function AvatarUpload({
  currentAvatarUrl,
  fallback,
  onUpload,
  onRemove,
  isUploading = false,
  isRemoving = false,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
}: AvatarUploadProps) {
  const { t } = useTranslation();
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dialog states with cleanup on close
  const uploadDialog = useDialogState({
    onClose: () => {
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setError(null);
    },
  });
  const removeDialog = useDialogState();

  const isLoading = isUploading || isRemoving;

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedTypes.includes(file.type)) {
        return t('avatar.validation.invalidType', { types: acceptedTypes.map((tp) => tp.split('/')[1].toUpperCase()).join(', ') });
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        return t('avatar.validation.tooLarge', { size: maxSizeMB });
      }
      return null;
    },
    [acceptedTypes, maxSizeMB, t]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setSelectedFile(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    },
    [validateFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

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

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    try {
      await onUpload(selectedFile);
      uploadDialog.close();
    } catch {
      setError(t('avatar.uploadError'));
    }
  }, [selectedFile, onUpload, t, uploadDialog]);

  const handleRemove = useCallback(async () => {
    if (!onRemove) return;

    try {
      await onRemove();
      removeDialog.close();
    } catch {
      setError(t('avatar.removeError'));
    }
  }, [onRemove, t, removeDialog]);

  const handleOpenUploadDialog = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    uploadDialog.open();
  }, [uploadDialog]);

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Avatar size="xl" src={currentAvatarUrl} fallback={fallback} className={cn(isLoading && 'opacity-50')} />

          {/* Overlay on hover */}
          <div
            className={cn(
              'absolute inset-0 flex items-center justify-center rounded-full bg-scrim/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer',
              isLoading && 'opacity-50'
            )}
            onClick={handleOpenUploadDialog}
          >
            <Camera className="h-6 w-6 text-inverse-on-surface" />
          </div>

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-scrim/30">
              <Loader2 className="h-6 w-6 text-inverse-on-surface animate-spin" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleOpenUploadDialog} disabled={isLoading}>
              <Upload className="h-4 w-4 mr-2" />
              {currentAvatarUrl ? t('avatar.change') : t('avatar.upload')}
            </Button>

            {currentAvatarUrl && onRemove && (
              <Button variant="outline" size="sm" onClick={() => removeDialog.open()} disabled={isLoading} className="text-error">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-on-surface-variant">
            {acceptedTypes.map((tp) => tp.split('/')[1].toUpperCase()).join(', ')}. {t('avatar.maxSize', { size: maxSizeMB })}
          </p>
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog.isOpen} onOpenChange={uploadDialog.setOpen}>
        <DialogContent showClose={false}>
          <DialogHeader
            hero
            icon={<ImagePlus className="h-7 w-7" />}
            title={t('avatar.uploadDialog.title')}
            description={t('avatar.uploadDialog.description')}
            showClose
          />
          <div
            className={cn(
              'border-2 border-dashed rounded-2xl p-8 text-center transition-colors',
              dragActive ? 'border-primary bg-primary/5' : 'border-outline-variant/50',
              error && 'border-error/50 bg-error/5'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img src={previewUrl} alt={t('a11y.preview')} className="h-32 w-32 rounded-full object-cover" />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                    }}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-error text-on-error hover:bg-error/90 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-on-surface-variant">{selectedFile?.name}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-surface-container">
                  <Upload className="h-8 w-8 text-on-surface-variant" />
                </div>
                <div>
                  <p className="text-on-surface font-medium">{t('avatar.dragDrop')}</p>
                  <p className="text-sm text-on-surface-variant">{t('avatar.orBrowse')}</p>
                </div>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  {t('avatar.browseFiles')}
                </Button>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept={acceptedTypes.join(',')} onChange={handleInputChange} className="hidden" />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-error-container text-on-error-container text-sm flex items-center gap-2">
              <X className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </DialogContent>

        <DialogFooter>
          <Button variant="outline" onClick={() => uploadDialog.close()} disabled={isUploading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('avatar.uploading')}
              </>
            ) : (
              t('avatar.upload')
            )}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <Dialog open={removeDialog.isOpen} onOpenChange={removeDialog.setOpen}>
        <DialogContent showClose={false}>
          <DialogHeader
            hero
            icon={<Trash2 className="h-7 w-7" />}
            title={t('avatar.removeDialog.title')}
            description={t('avatar.removeDialog.description')}
            variant="error"
            showClose
          />

          <div className="p-4">
            <div className="flex justify-end gap-3">
              <Button variant="text" onClick={() => removeDialog.close()} disabled={isRemoving}>
                {t('common.cancel')}
              </Button>
              <Button variant="destructive" onClick={handleRemove} disabled={isRemoving}>
                {isRemoving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('avatar.removing')}
                  </>
                ) : (
                  t('avatar.remove')
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
