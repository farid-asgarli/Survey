import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Loader2, Mail, User as UserIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Input, Button } from '@/components/ui';
import { AvatarSelector } from './AvatarSelector';
import { useAuthStore } from '@/stores';
import { useUpdateProfile, useSelectAvatar, useClearAvatar, useUserAvatar, useDateTimeFormatter } from '@/hooks';
import { toast } from '@/components/ui/Toast';
import { validateEmail, validateName } from '@/lib/validations';

interface ProfileSettingsProps {
  className?: string;
}

export function ProfileSettings({ className }: ProfileSettingsProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { formatDateLong } = useDateTimeFormatter();

  // Track the user ID to detect when we need to reset form
  const [lastUserId, setLastUserId] = useState(user?.id);

  // Initialize form state from user, reset when user changes
  const initialValues = useMemo(
    () => ({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    }),
    [user?.firstName, user?.lastName, user?.email]
  );

  const [firstName, setFirstName] = useState(initialValues.firstName);
  const [lastName, setLastName] = useState(initialValues.lastName);
  const [email, setEmail] = useState(initialValues.email);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Reset form when user changes (different account)
  if (user?.id !== lastUserId) {
    setLastUserId(user?.id);
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setEmail(user?.email || '');
    setIsEditing(false);
    setErrors({});
    setTouched({});
  }

  const updateProfileMutation = useUpdateProfile();
  const selectAvatarMutation = useSelectAvatar();
  const clearAvatarMutation = useClearAvatar();

  // Get centralized avatar data (selected avatar + Azure AD photo)
  const { azureAdPhotoUrl, isAzureAdAvailable } = useUserAvatar();

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const firstNameError = validateName(firstName, 'First name');
    if (firstNameError) {
      newErrors.firstName = firstNameError;
    }

    const lastNameError = validateName(lastName, 'Last name');
    if (lastNameError) {
      newErrors.lastName = lastNameError;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      newErrors.email = emailError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [firstName, lastName, email]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate the specific field
    const newErrors = { ...errors };

    if (field === 'firstName') {
      const error = validateName(firstName, 'First name');
      if (error) {
        newErrors.firstName = error;
      } else {
        delete newErrors.firstName;
      }
    }

    if (field === 'lastName') {
      const error = validateName(lastName, 'Last name');
      if (error) {
        newErrors.lastName = error;
      } else {
        delete newErrors.lastName;
      }
    }

    if (field === 'email') {
      const error = validateEmail(email);
      if (error) {
        newErrors.email = error;
      } else {
        delete newErrors.email;
      }
    }

    setErrors(newErrors);
  };

  const handleSave = async () => {
    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
    });

    if (!validateForm()) {
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        firstName,
        lastName,
      });

      setIsEditing(false);
      setTouched({});
      toast.success(t('profile.toast.updateSuccess'));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const message = err.response?.data?.message || t('profile.toast.updateFailed');

      // Handle validation errors from the server
      if (err.response?.data?.errors) {
        const serverErrors: Record<string, string> = {};
        for (const [field, messages] of Object.entries(err.response.data.errors)) {
          serverErrors[field.toLowerCase()] = messages[0];
        }
        setErrors((prev) => ({ ...prev, ...serverErrors }));
      }

      toast.error(t('profile.toast.updateFailedTitle'), { description: message });
    }
  };

  const handleCancel = () => {
    // Reset to original values
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email);
    }
    setIsEditing(false);
    setErrors({});
    setTouched({});
  };

  const handleAvatarSelect = async (avatarId: string) => {
    await selectAvatarMutation.mutateAsync(avatarId);
    toast.success(t('profile.toast.avatarUpdated'));
  };

  const handleAvatarClear = async () => {
    await clearAvatarMutation.mutateAsync();
    toast.success(t('profile.toast.avatarRemoved'));
  };

  const hasChanges = user && (firstName !== (user.firstName || '') || lastName !== (user.lastName || '') || email !== user.email);

  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || t('common.userFallback');
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card variant='elevated' className={className}>
      <CardHeader>
        <CardTitle>{t('profile.title')}</CardTitle>
        <CardDescription>{t('profile.description')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Avatar Section */}
        <AvatarSelector
          currentAvatarId={user?.avatarId}
          fallback={initials}
          onSelect={handleAvatarSelect}
          onClear={handleAvatarClear}
          isLoading={selectAvatarMutation.isPending || clearAvatarMutation.isPending}
          azureAdPhotoUrl={azureAdPhotoUrl || undefined}
          showAzureAdOption={isAzureAdAvailable && !!azureAdPhotoUrl}
        />

        {/* Divider */}
        <div className='border-t border-outline-variant/30' />

        {/* Profile Info Section */}
        <div className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='relative'>
              <Input
                label={t('profile.firstName')}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                onBlur={() => handleBlur('firstName')}
                disabled={!isEditing}
                error={touched.firstName ? errors.firstName : undefined}
                startIcon={<UserIcon className='h-4 w-4' />}
              />
            </div>
            <div className='relative'>
              <Input
                label={t('profile.lastName')}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={() => handleBlur('lastName')}
                disabled={!isEditing}
                error={touched.lastName ? errors.lastName : undefined}
                startIcon={<UserIcon className='h-4 w-4' />}
              />
            </div>
          </div>

          <div className='relative'>
            <Input
              label={t('profile.email')}
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              disabled={!isEditing}
              error={touched.email ? errors.email : undefined}
              startIcon={<Mail className='h-4 w-4' />}
              helperText={isEditing && email !== user?.email ? t('profile.emailChangeNotice') : undefined}
            />
          </div>

          {/* Account Info (Read-only) */}
          {user && (
            <div className='p-4 rounded-xl bg-surface-container/50'>
              <p className='text-xs text-on-surface-variant mb-2'>{t('profile.accountInfo')}</p>
              <div className='grid gap-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-on-surface-variant'>{t('profile.memberSince')}</span>
                  <span className='text-on-surface font-medium'>{formatDateLong(user.createdAt)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-on-surface-variant'>{t('profile.lastUpdated')}</span>
                  <span className='text-on-surface font-medium'>{formatDateLong(user.updatedAt)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-2'>
          {isEditing ? (
            <>
              <Button variant='outline' onClick={handleCancel} disabled={updateProfileMutation.isPending}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSave} disabled={updateProfileMutation.isPending || !hasChanges}>
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Check className='h-4 w-4 mr-2' />
                    {t('common.saveChanges')}
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button variant='outline' onClick={() => setIsEditing(true)}>
              {t('profile.editProfile')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
