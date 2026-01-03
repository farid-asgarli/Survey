import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Input, Avatar, toast } from '@/components/ui';
import { User, Sparkles, Save, Mail } from 'lucide-react';
import { useAuthStore } from '@/stores';
import { useUpdateProfile, useSelectAvatar, useClearAvatar, useUserAvatar } from '@/hooks';
import { AvatarSelector } from '@/components/features/profile';

export function ProfileSection() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const updateProfile = useUpdateProfile();
  const selectAvatar = useSelectAvatar();
  const clearAvatar = useClearAvatar();

  // Get centralized avatar data (selected avatar + Azure AD photo)
  const { avatarUrl, azureAdPhotoUrl, isAzureAdAvailable } = useUserAvatar();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if form is dirty
  const isDirty = useMemo(() => {
    if (!user) return false;
    return firstName !== (user.firstName || '') || lastName !== (user.lastName || '') || email !== user.email;
  }, [firstName, lastName, email, user]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = t('validation.required', { field: t('profile.firstName') });
    }
    if (!lastName.trim()) {
      newErrors.lastName = t('validation.required', { field: t('profile.lastName') });
    }
    if (!email.trim()) {
      newErrors.email = t('validation.required', { field: t('profile.email') });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('validation.invalidEmail');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    await updateProfile.mutateAsync({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });
  };

  const handleSelectAvatar = async (avatarId: string) => {
    await selectAvatar.mutateAsync(avatarId);
    toast.success(t('profile.avatar.updated'));
  };

  const handleClearAvatar = async () => {
    await clearAvatar.mutateAsync();
    toast.success(t('profile.avatar.removed'));
  };

  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || '?' : '?';

  return (
    <div className='space-y-6'>
      {/* Hero Profile Card */}
      <Card variant='highlighted' shape='rounded' className='overflow-hidden'>
        <div className='relative'>
          {/* Gradient background banner */}
          <div className='h-24 bg-linear-to-br from-primary via-primary/80 to-tertiary/60' />

          {/* Avatar overlay */}
          <div className='absolute -bottom-12 left-6'>
            <Avatar src={avatarUrl} fallback={fullName} size='xl' className='ring-4 ring-surface shadow-lg h-24 w-24 text-xl' />
          </div>
        </div>

        <CardContent className='pt-16 pb-6'>
          <div className='flex items-center gap-2 mb-1'>
            <h2 className='text-2xl font-bold text-on-surface'>
              {user?.firstName} {user?.lastName}
            </h2>
            {user && <Sparkles className='h-5 w-5 text-primary' />}
          </div>
          <p className='text-on-surface-variant'>{user?.email}</p>
        </CardContent>
      </Card>

      {/* Avatar Selection Card */}
      <Card variant='elevated' shape='rounded'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5 text-primary' />
            {t('profile.avatar.title')}
          </CardTitle>
          <CardDescription>{t('profile.avatar.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarSelector
            currentAvatarId={user?.avatarId}
            fallback={fullName}
            onSelect={handleSelectAvatar}
            onClear={handleClearAvatar}
            isLoading={selectAvatar.isPending || clearAvatar.isPending}
            azureAdPhotoUrl={azureAdPhotoUrl || undefined}
            showAzureAdOption={isAzureAdAvailable && !!azureAdPhotoUrl}
          />
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card variant='elevated' shape='rounded'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <User className='h-5 w-5 text-primary' />
            {t('profile.title')}
          </CardTitle>
          <CardDescription>{t('profile.description')}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Input
              label={t('profile.firstName')}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              error={errors.firstName}
              placeholder={t('profile.firstNamePlaceholder')}
            />
            <Input
              label={t('profile.lastName')}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              error={errors.lastName}
              placeholder={t('profile.lastNamePlaceholder')}
            />
          </div>
          <Input
            label={t('profile.email')}
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder={t('profile.emailPlaceholder')}
            startIcon={<Mail className='h-4 w-4' />}
          />
        </CardContent>
        <CardFooter className='justify-end'>
          <Button onClick={handleSave} loading={updateProfile.isPending} disabled={!isDirty}>
            <Save className='h-4 w-4' />
            {t('profile.saveChanges')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
