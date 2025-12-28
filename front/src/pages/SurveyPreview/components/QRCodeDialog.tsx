import { QrCode, Copy, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, Button, IconButton } from '@/components/ui';
import { generateQRCodeUrl } from '../utils';

interface QRCodeDialogProps {
  open: boolean;
  previewUrl: string;
  onOpenChange: (open: boolean) => void;
  onCopyLink: () => void;
}

export function QRCodeDialog({ open, previewUrl, onOpenChange, onCopyLink }: QRCodeDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" showClose={false}>
        <DialogHeader
          hero
          icon={<QrCode className="w-6 h-6" />}
          title={t('surveyPreview.qrCodeTitle')}
          description={t('surveyPreview.qrCodeDescription')}
          showClose
        />
        <div className="p-6 space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-2xl border border-outline-variant/20">
              <img src={generateQRCodeUrl(previewUrl, 180)} alt="QR Code" className="w-44 h-44" />
            </div>
          </div>

          {/* URL Input */}
          <div>
            <p className="text-xs text-on-surface-variant text-center mb-3">{t('surveyPreview.scanOrCopy')}</p>
            <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low rounded-xl border border-outline-variant/30">
              <input
                type="text"
                value={previewUrl}
                readOnly
                className="flex-1 bg-transparent text-sm text-on-surface outline-none min-w-0 truncate"
              />
              <IconButton variant="standard" size="sm" aria-label={t('surveyPreview.copyLink')} onClick={onCopyLink}>
                <Copy className="w-4 h-4" />
              </IconButton>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={() => window.open(previewUrl, '_blank')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              {t('surveyPreview.openInNewTab')}
            </Button>
            <Button variant="tonal" onClick={onCopyLink}>
              <Copy className="w-4 h-4 mr-2" />
              {t('surveyPreview.copyLink')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
