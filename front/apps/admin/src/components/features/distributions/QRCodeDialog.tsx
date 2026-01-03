import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Copy, Check, QrCode, Palette, Sun, Moon, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogBody, DialogFooter, Button, Select, Tabs, TabsList, TabsTrigger, toast } from '@/components/ui';
import { useCopyToClipboard } from '@/hooks';
import type { SurveyLink } from '@/types';
import { cn } from '@/lib/utils';

interface QRCodeDialogProps {
  link: SurveyLink | null;
  onClose: () => void;
}

type QRTheme = 'light' | 'dark' | 'brand';

const themeColors: Record<QRTheme, { foreground: string; background: string; bgClass: string }> = {
  light: { foreground: '000000', background: 'ffffff', bgClass: 'bg-white' },
  dark: { foreground: 'ffffff', background: '1a1a1a', bgClass: 'bg-neutral-900' },
  brand: { foreground: '6750A4', background: 'ffffff', bgClass: 'bg-white' },
};

// Generate QR code URL using Google Charts API (free, no library needed)
function generateQRCodeUrl(data: string, size: number, fgColor: string, bgColor: string): string {
  const encodedData = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}&color=${fgColor}&bgcolor=${bgColor}&format=png&margin=10`;
}

export function QRCodeDialog({ link, onClose }: QRCodeDialogProps) {
  const { t } = useTranslation();
  const { copied, copy } = useCopyToClipboard();
  const [qrTheme, setQrTheme] = useState<QRTheme>('light');
  const [qrSize, setQrSize] = useState('300');

  const sizeOptions = useMemo(
    () => [
      { value: '200', label: t('qrCodeDialog.sizes.small') },
      { value: '300', label: t('qrCodeDialog.sizes.medium') },
      { value: '400', label: t('qrCodeDialog.sizes.large') },
      { value: '600', label: t('qrCodeDialog.sizes.xlarge') },
    ],
    [t]
  );

  const handleCopyLink = () => {
    if (!link) return;
    copy(link.fullUrl, {
      successMessage: t('qrCodeDialog.toast.copied'),
      errorMessage: t('qrCodeDialog.toast.copyFailed'),
    });
  };

  const handleDownload = async () => {
    if (!link) return;

    try {
      const colors = themeColors[qrTheme];
      const size = parseInt(qrSize);
      const qrUrl = generateQRCodeUrl(link.fullUrl, size, colors.foreground, colors.background);

      // Fetch the image and create a download link
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `qr-code-${link.token}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);

      toast.success(t('qrCodeDialog.toast.downloaded'));
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error(t('qrCodeDialog.toast.downloadFailed'));
    }
  };

  if (!link) return null;

  const colors = themeColors[qrTheme];
  const displaySize = Math.min(parseInt(qrSize), 300);
  const qrUrl = generateQRCodeUrl(link.fullUrl, displaySize, colors.foreground, colors.background);

  return (
    <Dialog open={!!link} onOpenChange={() => onClose()}>
      <DialogContent size="lg" showClose={false}>
        <DialogHeader
          hero
          icon={<QrCode className="h-7 w-7" />}
          title={t('qrCodeDialog.title')}
          description={t('qrCodeDialog.description')}
          showClose
        />

        <DialogBody>
          <div className="flex flex-col md:flex-row gap-6">
            {/* QR Code Preview */}
            <div className="flex-1 flex flex-col items-center">
              <div
                className={cn(
                  'p-6 rounded-3xl transition-colors duration-200',
                  colors.bgClass,
                  qrTheme === 'dark' ? '' : 'border border-outline-variant/30'
                )}
              >
                <img src={qrUrl} alt={t('a11y.qrCode')} className="rounded-xl" style={{ width: displaySize, height: displaySize }} />
              </div>

              {/* Link display */}
              <div className="mt-4 flex items-center gap-2 bg-surface-container rounded-xl px-3 py-2 w-full max-w-75">
                <code className="flex-1 text-xs text-on-surface-variant truncate">{link.fullUrl}</code>
                <Button variant="text" size="icon-sm" onClick={handleCopyLink}>
                  {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Settings */}
            <div className="flex-1 space-y-5">
              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">{t('qrCodeDialog.theme')}</label>
                <Tabs value={qrTheme} onValueChange={(v) => setQrTheme(v as QRTheme)}>
                  <TabsList className="w-full">
                    <TabsTrigger value="light" className="flex-1 gap-1.5">
                      <Sun className="w-4 h-4" />
                      {t('qrCodeDialog.themes.light')}
                    </TabsTrigger>
                    <TabsTrigger value="dark" className="flex-1 gap-1.5">
                      <Moon className="w-4 h-4" />
                      {t('qrCodeDialog.themes.dark')}
                    </TabsTrigger>
                    <TabsTrigger value="brand" className="flex-1 gap-1.5">
                      <Palette className="w-4 h-4" />
                      {t('qrCodeDialog.themes.brand')}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2">{t('qrCodeDialog.downloadSize')}</label>
                <Select options={sizeOptions} value={qrSize} onChange={setQrSize} placeholder={t('qrCodeDialog.selectSize')} />
              </div>

              {/* Download Button */}
              <div className="pt-2">
                <Button variant="tonal" className="w-full" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  {t('qrCodeDialog.downloadPNG')}
                </Button>
              </div>

              {/* Open Survey Link */}
              <Button variant="outline" className="w-full" onClick={() => window.open(link.fullUrl, '_blank')}>
                <ExternalLink className="w-4 h-4 mr-2" />
                {t('qrCodeDialog.openSurvey')}
              </Button>

              {/* Usage Tips */}
              <div className="p-4 bg-surface-container rounded-2xl">
                <h4 className="text-sm font-medium mb-2">{t('qrCodeDialog.tips.title')}</h4>
                <ul className="text-xs text-on-surface-variant space-y-1">
                  <li>• {t('qrCodeDialog.tips.tip1')}</li>
                  <li>• {t('qrCodeDialog.tips.tip2')}</li>
                  <li>• {t('qrCodeDialog.tips.tip3')}</li>
                  <li>• {t('qrCodeDialog.tips.tip4')}</li>
                </ul>
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="text" onClick={onClose}>
            {t('common.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
