import { useState, useCallback, useRef, type ChangeEvent, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { type FileUploadResponse } from '@/services/api';

export interface ImageUploaderProps {
  /** Current image URL (can be an uploaded file URL or external URL) */
  value?: string;
  /** Callback when image changes (receives URL or empty string) */
  onChange: (url: string) => void;
  /** Optional callback with full upload result */
  onUploadComplete?: (result: FileUploadResponse) => void;
  /** Label for the uploader */
  label?: string;
  /** Helper text below the uploader */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Placeholder text for URL input */
  placeholder?: string;
  /** Whether the uploader is disabled */
  disabled?: boolean;
  /** Upload function - if not provided, only URL input is available */
  onUpload?: (file: File) => Promise<FileUploadResponse>;
  /** Accepted file types */
  accept?: string;
  /** Maximum file size in bytes (default: 5MB) */
  maxSize?: number;
  /** Image preview aspect ratio (e.g., "1/1", "16/9", "4/3") */
  aspectRatio?: string;
  /** Size variant */
  size?: 'sm' | 'default' | 'lg';
  /** Optional className */
  className?: string;
  /** Category for file organization */
  category?: 'logo' | 'background' | 'question' | 'avatar';
}

const sizeStyles = {
  sm: {
    preview: 'h-16 w-16',
    dropzone: 'p-4',
    icon: 'h-6 w-6',
    text: 'text-xs',
  },
  default: {
    preview: 'h-24 w-24',
    dropzone: 'p-6',
    icon: 'h-8 w-8',
    text: 'text-sm',
  },
  lg: {
    preview: 'h-32 w-32',
    dropzone: 'p-8',
    icon: 'h-10 w-10',
    text: 'text-base',
  },
};

export function ImageUploader({
  value,
  onChange,
  onUploadComplete,
  label,
  helperText,
  error,
  placeholder = 'https://example.com/image.png',
  disabled = false,
  onUpload,
  accept = 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml',
  maxSize = 5 * 1024 * 1024, // 5MB
  aspectRatio,
  size = 'default',
  className,
}: // Note: category is passed via props for documentation but used by parent in onUpload callback
ImageUploaderProps) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value?.startsWith('http') && !value.includes('/api/files') ? value : '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const styles = sizeStyles[size];
  const hasError = !!error || !!uploadError;
  const displayError = error || uploadError;

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file type
      const allowedTypes = accept.split(',').map((t) => t.trim());
      if (!allowedTypes.some((type) => file.type === type || file.type.match(type.replace('*', '.*')))) {
        return t('imageUploader.errors.invalidType', 'Invalid file type. Please upload an image.');
      }

      // Check file size
      if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        return t('imageUploader.errors.tooLarge', { maxSize: maxSizeMB, defaultValue: `File is too large. Maximum size is ${maxSizeMB}MB.` });
      }

      return null;
    },
    [accept, maxSize, t]
  );

  const handleFileSelect = useCallback(
    async (file: File) => {
      setUploadError(null);
      setPreviewError(false);

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      // If no upload function, we can't proceed
      if (!onUpload) {
        setUploadError(t('imageUploader.errors.noUploadFunction', 'Upload is not available. Please enter a URL instead.'));
        return;
      }

      setIsUploading(true);

      try {
        const result = await onUpload(file);
        onChange(result.url);
        onUploadComplete?.(result);
        setUrlInput('');
      } catch (err) {
        const message = err instanceof Error ? err.message : t('imageUploader.errors.uploadFailed', 'Upload failed. Please try again.');
        setUploadError(message);
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, onChange, onUploadComplete, validateFile, t]
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
      // Reset input so same file can be selected again
      e.target.value = '';
    },
    [handleFileSelect]
  );

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || isUploading) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [disabled, isUploading, handleFileSelect]
  );

  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) return;
    setUploadError(null);
    setPreviewError(false);
    onChange(urlInput.trim());
  }, [urlInput, onChange]);

  const handleClear = useCallback(() => {
    onChange('');
    setUrlInput('');
    setUploadError(null);
    setPreviewError(false);
  }, [onChange]);

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={cn('w-full', className)}>
      {label && <label className={cn('block text-sm font-semibold mb-2', hasError ? 'text-error' : 'text-on-surface')}>{label}</label>}

      {/* Mode tabs - only show if upload is available */}
      {onUpload && (
        <div className='flex gap-1 mb-3 p-1 bg-surface-container-low rounded-xl'>
          <button
            type='button'
            onClick={() => setMode('upload')}
            disabled={disabled}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              mode === 'upload'
                ? 'bg-surface-container-lowest text-on-surface border-2 border-primary/30'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            )}
          >
            <Upload className='h-4 w-4' />
            {t('imageUploader.upload', 'Upload')}
          </button>
          <button
            type='button'
            onClick={() => setMode('url')}
            disabled={disabled}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              mode === 'url'
                ? 'bg-surface-container-lowest text-on-surface border-2 border-primary/30'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            )}
          >
            <LinkIcon className='h-4 w-4' />
            {t('imageUploader.url', 'URL')}
          </button>
        </div>
      )}

      <div className='flex gap-3'>
        {/* Preview */}
        <div
          className={cn(
            'shrink-0 rounded-xl border-2 border-outline-variant/30 bg-surface-container-low overflow-hidden flex items-center justify-center',
            styles.preview,
            aspectRatio && `aspect-[${aspectRatio}]`
          )}
        >
          {value && !previewError ? (
            <img
              src={value}
              alt={t('a11y.preview')}
              className='h-full w-full object-contain'
              onError={() => setPreviewError(true)}
              onLoad={() => setPreviewError(false)}
            />
          ) : (
            <ImageIcon className={cn('text-on-surface-variant/40', styles.icon)} />
          )}
        </div>

        {/* Upload/URL area */}
        <div className='flex-1 min-w-0'>
          {mode === 'upload' && onUpload ? (
            // Drag & drop zone
            <div
              onClick={!disabled && !isUploading ? triggerFileSelect : undefined}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all cursor-pointer',
                styles.dropzone,
                isDragging && 'border-primary bg-primary/5 scale-[1.02]',
                hasError && 'border-error bg-error/5',
                !isDragging && !hasError && 'border-outline-variant/50 hover:border-primary/50 hover:bg-surface-container-lowest',
                (disabled || isUploading) && 'cursor-not-allowed opacity-60'
              )}
            >
              <input
                ref={fileInputRef}
                type='file'
                accept={accept}
                onChange={handleInputChange}
                disabled={disabled || isUploading}
                className='sr-only'
                aria-label={t('imageUploader.selectFile', 'Select file')}
              />

              {isUploading ? (
                <>
                  <Loader2 className={cn('animate-spin text-primary mb-2', styles.icon)} />
                  <p className={cn('text-on-surface-variant', styles.text)}>{t('imageUploader.uploading', 'Uploading...')}</p>
                </>
              ) : (
                <>
                  <Upload className={cn('text-on-surface-variant/60 mb-2', styles.icon)} />
                  <p className={cn('text-on-surface-variant text-center', styles.text)}>{t('imageUploader.dragDrop', 'Drag & drop or click to upload')}</p>
                  <p className='text-xs text-on-surface-variant/60 mt-1'>
                    {t('imageUploader.maxSize', {
                      size: Math.round(maxSize / (1024 * 1024)),
                      defaultValue: `Max ${Math.round(maxSize / (1024 * 1024))}MB`,
                    })}
                  </p>
                </>
              )}
            </div>
          ) : (
            // URL input
            <div className='space-y-2'>
              <div className='flex gap-2'>
                <Input
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setUploadError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleUrlSubmit();
                    }
                  }}
                  placeholder={placeholder}
                  disabled={disabled}
                  size='sm'
                  className='flex-1'
                />
                <Button type='button' size='sm' onClick={handleUrlSubmit} disabled={disabled || !urlInput.trim()}>
                  {t('imageUploader.apply', 'Apply')}
                </Button>
              </div>
            </div>
          )}

          {/* Clear button - show when there's a value */}
          {value && (
            <Button type='button' variant='text' size='sm' onClick={handleClear} disabled={disabled} className='mt-2 text-error hover:text-error'>
              <X className='h-4 w-4 mr-1' />
              {t('imageUploader.remove', 'Remove image')}
            </Button>
          )}
        </div>
      </div>

      {/* Error message */}
      {displayError && (
        <div className='flex items-center gap-2 mt-2 text-error text-sm'>
          <AlertCircle className='h-4 w-4 shrink-0' />
          <span>{displayError}</span>
        </div>
      )}

      {/* Helper text */}
      {helperText && !displayError && <p className='mt-2 text-sm text-on-surface-variant/70'>{helperText}</p>}
    </div>
  );
}
