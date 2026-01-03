import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Loader2, Sparkles, User } from 'lucide-react';
import { Avatar, Button, Dialog, DialogHeader, DialogContent, DialogBody, DialogFooter } from '@/components/ui';
import { useDialogState } from '@/hooks';
import { cn } from '@/lib/utils';

/**
 * Total number of avatars in the collection.
 * Must match the backend constant in SelectAvatarCommandHandler.
 */
const TOTAL_AVATARS = 77;

/**
 * Generate the avatar collection from 1 to TOTAL_AVATARS.
 * Avatar IDs follow the format: avatar-1, avatar-2, ..., avatar-77.
 */
export const AVATAR_COLLECTION = Array.from({ length: TOTAL_AVATARS }, (_, i) => {
  const num = i + 1;
  return {
    id: `avatar-${num}` as const,
    url: `/images/avatars/avatar-${num}.png`,
  };
});

export type AvatarId = (typeof AVATAR_COLLECTION)[number]['id'];

/**
 * Get the URL for an avatar ID.
 * Returns undefined if the ID is not valid.
 */
export function getAvatarUrl(avatarId: string | null | undefined): string | undefined {
  if (!avatarId) return undefined;
  const avatar = AVATAR_COLLECTION.find((a) => a.id === avatarId);
  return avatar?.url;
}

/**
 * Check if a string is a valid avatar ID.
 */
export function isValidAvatarId(id: string | null | undefined): id is AvatarId {
  if (!id) return false;
  return AVATAR_COLLECTION.some((a) => a.id === id);
}

interface AvatarSelectorProps {
  /** Currently selected avatar ID (e.g., "avatar-1", "avatar-32") */
  currentAvatarId?: string | null;
  /** Fallback initials for avatar display */
  fallback: string;
  /** Called when an avatar is selected - receives the avatar ID */
  onSelect: (avatarId: string) => Promise<void>;
  /** Called when avatar is cleared/removed */
  onClear?: () => Promise<void>;
  /** Whether a selection operation is in progress */
  isLoading?: boolean;
  /** Azure AD profile photo URL (if user is signed in with Azure AD) */
  azureAdPhotoUrl?: string;
  /** Whether to show the Azure AD photo option */
  showAzureAdOption?: boolean;
}

export function AvatarSelector({
  currentAvatarId,
  fallback,
  onSelect,
  onClear,
  isLoading = false,
  azureAdPhotoUrl,
  showAzureAdOption = false,
}: AvatarSelectorProps) {
  const { t } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const selectorDialog = useDialogState({
    onClose: () => {
      setSelectedId(null);
      setHoveredId(null);
    },
  });

  // Get the current avatar URL from the ID
  const currentAvatarUrl = useMemo(() => getAvatarUrl(currentAvatarId), [currentAvatarId]);

  // Display priority: 3D avatar if selected, then Azure AD photo, then fallback
  const displayAvatarUrl = currentAvatarUrl || azureAdPhotoUrl;

  // Preview shows: hovered avatar > selected avatar > current avatar
  const previewId = hoveredId || selectedId || currentAvatarId;
  const previewUrl = useMemo(() => {
    if (previewId === 'azure-ad-photo') return azureAdPhotoUrl;
    return getAvatarUrl(previewId);
  }, [previewId, azureAdPhotoUrl]);

  const handleOpenSelector = () => {
    setSelectedId(currentAvatarId || null);
    setHoveredId(null);
    selectorDialog.open();
  };

  const handleSelectAvatar = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleConfirmSelection = async () => {
    if (selectedId) {
      // Special handling for Azure AD photo - clear the stored avatar
      // so the Azure AD photo takes precedence (handled in display layer)
      if (selectedId === 'azure-ad-photo') {
        if (onClear) {
          await onClear();
        }
      } else {
        await onSelect(selectedId);
      }
      selectorDialog.close();
    }
  };

  const handleClearAvatar = async () => {
    if (onClear) {
      await onClear();
      selectorDialog.close();
    }
  };

  return (
    <>
      <div className='flex items-center gap-4'>
        <div className='relative group'>
          <Avatar size='xl' src={displayAvatarUrl} fallback={fallback} className={cn(isLoading && 'opacity-50')} />

          {/* Hover overlay */}
          <button
            onClick={handleOpenSelector}
            disabled={isLoading}
            className={cn(
              'absolute inset-0 flex items-center justify-center rounded-full',
              'bg-scrim/50 opacity-0 group-hover:opacity-100 transition-opacity',
              'cursor-pointer disabled:cursor-not-allowed'
            )}
          >
            <Sparkles className='h-6 w-6 text-inverse-on-surface' />
          </button>

          {/* Loading overlay */}
          {isLoading && (
            <div className='absolute inset-0 flex items-center justify-center rounded-full bg-scrim/30'>
              <Loader2 className='h-6 w-6 text-inverse-on-surface animate-spin' />
            </div>
          )}
        </div>

        <div className='flex flex-col gap-1'>
          <Button variant='outline' size='sm' onClick={handleOpenSelector} disabled={isLoading}>
            <Sparkles className='h-4 w-4 mr-2' />
            {currentAvatarId ? t('avatar.changeAvatar') : t('avatar.selectAvatar')}
          </Button>
          <p className='text-xs text-on-surface-variant'>{t('avatar.selectFromCollection')}</p>
        </div>
      </div>

      {/* Avatar Selection Dialog */}
      <Dialog open={selectorDialog.isOpen} onOpenChange={selectorDialog.setOpen}>
        <DialogContent className='max-w-4xl' showClose={false}>
          <DialogHeader
            hero
            icon={<Sparkles className='h-7 w-7' />}
            title={t('avatar.selectorDialog.title')}
            description={t('avatar.selectorDialog.description')}
            showClose
          />

          <DialogBody className='p-0'>
            <div className='flex flex-col md:flex-row'>
              {/* Preview Pane - Left Side */}
              <div
                className={cn(
                  'flex flex-col items-center justify-center p-6 md:p-8',
                  'bg-surface-container-low border-b md:border-b-0 md:border-r border-outline-variant/30',
                  'md:w-64 md:min-h-[360px]',
                  'transition-all duration-300'
                )}
              >
                <div className='relative'>
                  {/* Decorative background ring */}
                  <div
                    className={cn(
                      'absolute inset-0 -m-3 rounded-full',
                      'bg-primary-container/40 border-2 border-primary/20',
                      'transition-all duration-300',
                      previewUrl ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
                    )}
                  />

                  {/* Avatar preview */}
                  <div
                    className={cn(
                      'relative rounded-full overflow-hidden',
                      'transition-all duration-300 ease-out',
                      'ring-4 ring-surface-container-low',
                      previewUrl ? 'w-32 h-32 md:w-40 md:h-40' : 'w-24 h-24 md:w-32 md:h-32'
                    )}
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt='Avatar preview' className='w-full h-full object-cover transition-opacity duration-200' key={previewUrl} />
                    ) : (
                      <div className='w-full h-full bg-surface-container flex items-center justify-center'>
                        <User className='w-12 h-12 md:w-16 md:h-16 text-on-surface-variant/50' />
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview label */}
                <div className='mt-4 text-center'>
                  <p className={cn('text-sm font-medium transition-all duration-200', selectedId ? 'text-on-surface' : 'text-on-surface-variant')}>
                    {hoveredId
                      ? t('avatar.preview.hover')
                      : selectedId
                      ? selectedId === 'azure-ad-photo'
                        ? t('avatar.preview.microsoftPhoto')
                        : t('avatar.preview.selected')
                      : t('avatar.preview.selectOne')}
                  </p>
                  {selectedId && selectedId !== 'azure-ad-photo' && !hoveredId && (
                    <p className='text-xs text-on-surface-variant mt-1'>{selectedId.replace('avatar-', '#')}</p>
                  )}
                </div>
              </div>

              {/* Avatar Grid - Right Side */}
              <div className='flex-1 p-4 md:p-6 space-y-4 overflow-hidden'>
                {/* Azure AD Photo Option */}
                {showAzureAdOption && azureAdPhotoUrl && (
                  <div>
                    <p className='text-sm font-medium text-on-surface mb-2'>{t('avatar.microsoftAccount')}</p>
                    <button
                      type='button'
                      onClick={() => handleSelectAvatar('azure-ad-photo')}
                      onMouseEnter={() => setHoveredId('azure-ad-photo')}
                      onMouseLeave={() => setHoveredId(null)}
                      className={cn(
                        'relative rounded-2xl p-1.5 transition-all duration-200',
                        'hover:bg-primary-container/50',
                        selectedId === 'azure-ad-photo' && 'ring-2 ring-primary bg-primary-container/30'
                      )}
                    >
                      <Avatar src={azureAdPhotoUrl} fallback={fallback} size='lg' className='h-14 w-14' />
                      {selectedId === 'azure-ad-photo' && (
                        <div className='absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center'>
                          <Check className='h-3 w-3 text-on-primary' />
                        </div>
                      )}
                    </button>
                    <div className='mt-3 border-b border-outline-variant/30' />
                  </div>
                )}

                {/* Avatar Grid */}
                <div>
                  <p className='text-sm font-medium text-on-surface mb-3'>{t('avatar.chooseCharacter')}</p>
                  <div className='grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-1.5 max-h-[35vh] overflow-y-auto p-1'>
                    {AVATAR_COLLECTION.map((avatar) => (
                      <button
                        key={avatar.id}
                        type='button'
                        onClick={() => handleSelectAvatar(avatar.id)}
                        onMouseEnter={() => setHoveredId(avatar.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={cn(
                          'relative rounded-xl p-1 transition-all duration-200',
                          'hover:bg-primary-container/50',
                          selectedId === avatar.id
                            ? 'ring-2 ring-primary bg-primary-container/30 scale-105'
                            : hoveredId === avatar.id && 'bg-surface-container-high scale-102'
                        )}
                      >
                        <Avatar src={avatar.url} fallback='' size='default' className='h-11 w-11' />
                        {selectedId === avatar.id && (
                          <div className='absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center'>
                            <Check className='h-2.5 w-2.5 text-on-primary' />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            {currentAvatarId && onClear && (
              <Button variant='outline' onClick={handleClearAvatar} disabled={isLoading} className='mr-auto'>
                {t('avatar.removeAvatar')}
              </Button>
            )}
            <Button variant='text' onClick={selectorDialog.close}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleConfirmSelection} disabled={!selectedId || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  {t('common.saving')}
                </>
              ) : (
                <>
                  <Check className='h-4 w-4 mr-2' />
                  {t('avatar.confirm')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
