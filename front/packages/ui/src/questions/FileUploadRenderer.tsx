import { Upload, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { QuestionRendererProps } from '../types/index.js';
import { cn } from '@survey/ui-primitives';

// ============ File Upload ============
export function FileUploadRenderer({ question, value, onChange, error, disabled, labels }: QuestionRendererProps) {
  const maxFiles = question.settings?.maxFileSize ? 1 : 5; // Default max files
  const maxFileSizeMB = question.settings?.maxFileSize || 5;
  const maxFileSize = maxFileSizeMB * 1024 * 1024; // Convert MB to bytes
  const allowedTypes = useMemo(() => question.settings?.allowedFileTypes || [], [question.settings?.allowedFileTypes]);
  const files = useMemo(() => (value as File[]) || [], [value]);

  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles || disabled) return;
      setUploadError(null);

      const fileArray = Array.from(newFiles);

      // Validate file count
      if (files.length + fileArray.length > maxFiles) {
        setUploadError(`Maximum ${maxFiles} file(s) allowed`);
        return;
      }

      // Validate each file
      for (const file of fileArray) {
        if (file.size > maxFileSize) {
          setUploadError(`File size must be less than ${maxFileSizeMB}MB`);
          return;
        }
        if (allowedTypes.length > 0 && !allowedTypes.some((type) => file.type.includes(type))) {
          setUploadError(`Allowed file types: ${allowedTypes.join(', ')}`);
          return;
        }
      }

      onChange([...files, ...fileArray]);
    },
    [files, maxFiles, maxFileSize, maxFileSizeMB, allowedTypes, onChange, disabled]
  );

  const handleRemove = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles.length > 0 ? newFiles : null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all duration-200',
          dragActive
            ? 'border-primary bg-primary-container/20'
            : 'border-outline-variant/50 bg-surface-container-lowest hover:border-outline-variant',
          error && 'border-error/50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Upload className="w-12 h-12 text-on-surface-variant/50 mb-4" />
        <p className="text-on-surface font-medium mb-1">{labels.dropFilesHere || 'Drop files here or click to upload'}</p>
        <p className="text-on-surface-variant/70 text-sm">
          {(labels.maxFilesText || 'Maximum {count} file(s), up to {size}MB each')
            .replace('{count}', String(maxFiles))
            .replace('{size}', String(maxFileSizeMB))}
        </p>
        {allowedTypes.length > 0 && (
          <p className="text-on-surface-variant/50 text-xs mt-1">
            {labels.allowedTypesPrefix || 'Allowed types'}: {allowedTypes.join(', ')}
          </p>
        )}
        <input
          type="file"
          multiple={maxFiles > 1}
          accept={allowedTypes.length > 0 ? allowedTypes.join(',') : undefined}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-outline-variant/30">
              <div className="w-10 h-10 rounded-lg bg-primary-container/50 flex items-center justify-center">
                <Upload className="w-5 h-5 text-on-primary-container" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-on-surface font-medium truncate">{file.name}</p>
                <p className="text-on-surface-variant text-sm">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="p-2 rounded-full hover:bg-error-container/50 text-on-surface-variant hover:text-error transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {(error || uploadError) && <p className="text-error text-sm">{error || uploadError}</p>}
    </div>
  );
}
