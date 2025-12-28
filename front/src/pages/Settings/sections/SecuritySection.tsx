import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  toast,
} from '@/components/ui';
import { Shield, Lock, Eye, EyeOff, ShieldCheck, ShieldOff, RefreshCw, AlertTriangle, Smartphone, Mail, ChevronRight } from 'lucide-react';
import { useSettingsStore } from '@/stores';
import { useChangePassword } from '@/hooks';
import { cn } from '@/lib/utils';
import { useForm, zodResolver, type SubmitHandler } from '@/lib/form';
import { changePasswordSchema, type ChangePasswordFormData } from '@/lib/validations';

export function SecuritySection() {
  const { t } = useTranslation();
  const changePassword = useChangePassword();
  const { twoFactor, enableTwoFactor, disableTwoFactor } = useSettingsStore();

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [showDisable2FADialog, setShowDisable2FADialog] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, touchedFields },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const newPassword = watch('newPassword');

  const onSubmit: SubmitHandler<ChangePasswordFormData> = async (data) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      reset();
    } catch {
      // Error handled by interceptor
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleEnable2FA = (method: 'authenticator' | 'sms' | 'email') => {
    enableTwoFactor(method);
    setShow2FADialog(false);
    toast.success(t('twoFactor.enabledSuccess'));
  };

  const handleDisable2FA = () => {
    disableTwoFactor();
    setShowDisable2FADialog(false);
    toast.success(t('twoFactor.disabledSuccess'));
  };

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication Card */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {t('twoFactor.title')}
          </CardTitle>
          <CardDescription>{t('twoFactor.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {twoFactor.enabled ? (
            <div className="space-y-4">
              {/* Status Card */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-success-container/30 border border-success/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-container">
                  <ShieldCheck className="h-5 w-5 text-on-success-container" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-on-surface">{t('twoFactor.enabled')}</h4>
                  <p className="text-sm text-on-surface-variant mt-0.5">
                    {t('twoFactor.usingMethod', {
                      method:
                        twoFactor.method === 'authenticator'
                          ? t('twoFactor.authenticatorApp')
                          : twoFactor.method === 'sms'
                          ? t('twoFactor.sms')
                          : t('auth.email'),
                    })}
                  </p>
                  {twoFactor.backupCodesRemaining !== undefined && (
                    <p className="text-sm text-on-surface-variant mt-1">
                      {t('twoFactor.backupCodesRemaining', { count: twoFactor.backupCodesRemaining })}
                    </p>
                  )}
                </div>
                <Badge variant="success">{t('common.status')}</Badge>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button variant="tonal" size="sm">
                  <RefreshCw className="h-4 w-4" />
                  {t('twoFactor.regenerateBackupCodes')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowDisable2FADialog(true)}>
                  <ShieldOff className="h-4 w-4" />
                  {t('twoFactor.disable')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Warning */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-warning-container/30 border border-warning/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-container">
                  <AlertTriangle className="h-5 w-5 text-on-warning-container" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-on-surface">{t('twoFactor.notEnabled')}</h4>
                  <p className="text-sm text-on-surface-variant mt-0.5">{t('twoFactor.recommendation')}</p>
                </div>
              </div>

              {/* Enable Button */}
              <Button onClick={() => setShow2FADialog(true)}>
                <ShieldCheck className="h-4 w-4" />
                {t('twoFactor.enable')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password Form */}
      <Card variant="elevated" shape="rounded">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            {t('passwordChange.title')}
          </CardTitle>
          <CardDescription>{t('passwordChange.description')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <Input
              label={t('passwordChange.currentPassword')}
              type={showPasswords.current ? 'text' : 'password'}
              {...register('currentPassword')}
              error={touchedFields.currentPassword ? errors.currentPassword?.message : undefined}
              placeholder={t('passwordChange.placeholders.current')}
              endIcon={
                <button type="button" onClick={() => togglePasswordVisibility('current')} className="hover:text-primary transition-colors">
                  {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            <Input
              label={t('passwordChange.newPassword')}
              type={showPasswords.new ? 'text' : 'password'}
              {...register('newPassword')}
              error={touchedFields.newPassword ? errors.newPassword?.message : undefined}
              placeholder={t('passwordChange.placeholders.new')}
              endIcon={
                <button type="button" onClick={() => togglePasswordVisibility('new')} className="hover:text-primary transition-colors">
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            <Input
              label={t('passwordChange.confirmPassword')}
              type={showPasswords.confirm ? 'text' : 'password'}
              {...register('confirmPassword')}
              error={touchedFields.confirmPassword ? errors.confirmPassword?.message : undefined}
              placeholder={t('passwordChange.placeholders.confirm')}
              endIcon={
                <button type="button" onClick={() => togglePasswordVisibility('confirm')} className="hover:text-primary transition-colors">
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            {/* Password strength indicator */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => {
                    const strength =
                      newPassword.length >= 8
                        ? 1 + ((/[A-Z]/.test(newPassword) ? 1 : 0) + (/[0-9]/.test(newPassword) ? 1 : 0) + (/[^A-Za-z0-9]/.test(newPassword) ? 1 : 0))
                        : 0;
                    return (
                      <div
                        key={i}
                        className={cn(
                          'h-1.5 flex-1 rounded-full transition-colors',
                          i < strength ? (strength <= 1 ? 'bg-error' : strength <= 2 ? 'bg-warning' : 'bg-success') : 'bg-surface-container-highest'
                        )}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-on-surface-variant">
                  {newPassword.length < 8
                    ? t('passwordChange.strength.tooShort')
                    : !(/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) && /[0-9]/.test(newPassword))
                    ? t('passwordChange.strength.addMore')
                    : /[^A-Za-z0-9]/.test(newPassword)
                    ? t('passwordChange.strength.strong')
                    : t('passwordChange.strength.good')}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" loading={changePassword.isPending}>
              <Lock className="h-4 w-4" />
              {t('passwordChange.changeButton')}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Enable 2FA Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className="sm:max-w-md" showClose={false}>
          <DialogHeader
            hero
            icon={<Shield className="h-7 w-7" />}
            title={t('twoFactor.enableTitle')}
            description={t('twoFactor.enableDesc')}
            showClose
          />
          <div className="space-y-3 py-4">
            {[
              {
                id: 'authenticator',
                icon: Smartphone,
                labelKey: 'twoFactor.authenticatorApp',
                descKey: 'twoFactor.authenticatorAppDesc',
              },
              { id: 'sms', icon: Mail, labelKey: 'twoFactor.sms', descKey: 'twoFactor.smsDesc' },
              { id: 'email', icon: Mail, labelKey: 'twoFactor.emailMethod', descKey: 'twoFactor.emailMethodDesc' },
            ].map((method) => (
              <button
                key={method.id}
                onClick={() => handleEnable2FA(method.id as 'authenticator' | 'sms' | 'email')}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-outline-variant/30',
                  'hover:border-primary/40 hover:bg-primary-container/10 transition-all'
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container/50">
                  <method.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-on-surface">{t(method.labelKey)}</p>
                  <p className="text-sm text-on-surface-variant">{t(method.descKey)}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-on-surface-variant" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisable2FADialog} onOpenChange={setShowDisable2FADialog}>
        <DialogContent className="sm:max-w-md" showClose={false}>
          <DialogHeader
            hero
            icon={<Shield className="h-7 w-7" />}
            title={t('twoFactor.disableTitle')}
            description={t('twoFactor.disableDesc')}
            variant="error"
            showClose
          />
          <div className="p-4">
            <div className="flex justify-end gap-3">
              <Button variant="text" onClick={() => setShowDisable2FADialog(false)}>
                {t('common.cancel')}
              </Button>
              <Button variant="destructive" onClick={handleDisable2FA}>
                {t('twoFactor.disable')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
