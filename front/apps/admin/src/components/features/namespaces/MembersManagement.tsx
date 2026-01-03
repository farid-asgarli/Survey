import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  IconButton,
  Input,
  Select,
  Avatar,
  Skeleton,
  Menu,
  MenuItem,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@/components/ui';
import { getAvatarUrl } from '@/components/features/profile/AvatarSelector';
import { UserPlus, MoreVertical, Mail, Shield, Crown, User, Trash2 } from 'lucide-react';
import { useNamespaceMembers, useInviteMember, useRemoveMember, useDialogState } from '@/hooks';
import { useConfirmDialog } from '@/hooks';
import { toast } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useForm, zodResolver, type SubmitHandler } from '@/lib/form';
import { inviteMemberSchema, type InviteMemberFormData } from '@/lib/validations';
import type { NamespaceMembership } from '@/types';
import { MemberRole } from '@/types/enums';
import { useTranslation } from 'react-i18next';

type MemberRoleKey = keyof typeof MemberRole;
type MemberRoleValue = (typeof MemberRole)[MemberRoleKey];

// Helper to get role key from numeric value
const getRoleKey = (value: MemberRoleValue): MemberRoleKey => {
  const entry = Object.entries(MemberRole).find(([, v]) => v === value);
  return (entry?.[0] as MemberRoleKey) || 'Member';
};

interface MembersManagementProps {
  namespaceId: string;
  currentUserId: string;
  isOwner: boolean;
}

const roleIcons: Record<MemberRoleKey, React.ComponentType<{ className?: string }>> = {
  Owner: Crown,
  Admin: Shield,
  Member: User,
  Viewer: User,
  Respondent: User,
};

const roleColors: Record<MemberRoleKey, string> = {
  Owner: 'bg-tertiary/10 text-tertiary border-tertiary/20',
  Admin: 'bg-primary/10 text-primary border-primary/20',
  Member: 'bg-secondary/10 text-secondary border-secondary/20',
  Viewer: 'bg-on-surface-variant/10 text-on-surface-variant border-outline-variant',
  Respondent: 'bg-outline/10 text-outline border-outline/20',
};

export function MembersManagement({ namespaceId, currentUserId, isOwner }: MembersManagementProps) {
  const { t } = useTranslation();

  const roleOptions: { value: InviteMemberFormData['role']; label: string }[] = [
    { value: 'Admin', label: t('workspaces.roles.admin') },
    { value: 'Member', label: t('workspaces.roles.member') },
    { value: 'Viewer', label: t('workspaces.roles.viewer') },
  ];

  const { data: members, isLoading, error } = useNamespaceMembers(namespaceId);
  const inviteMember = useInviteMember();
  const removeMember = useRemoveMember();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  // React Hook Form setup for invite form
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    reset,
    watch,
    setValue,
  } = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: '',
      role: 'Member',
    },
    mode: 'onBlur',
  });

  // Dialog state with form reset on close
  const inviteDialog = useDialogState({
    onClose: () => reset(),
  });

  const watchedRole = watch('role');

  const onSubmit: SubmitHandler<InviteMemberFormData> = async (data) => {
    try {
      await inviteMember.mutateAsync({
        namespaceId,
        data: { email: data.email.trim(), role: MemberRole[data.role] },
      });
      toast.success(t('workspaces.team.invitationSent', { email: data.email }));
      inviteDialog.close();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || t('workspaces.team.inviteError');
      toast.error(message);
    }
  };

  const handleRemoveMember = async (member: NamespaceMembership) => {
    const confirmed = await confirm({
      title: t('workspaces.team.removeTitle'),
      description: t('workspaces.team.removeConfirm', { name: `${member.firstName} ${member.lastName}` }),
      confirmText: t('common.remove'),
      variant: 'destructive',
    });

    if (confirmed) {
      try {
        await removeMember.mutateAsync({
          namespaceId,
          membershipId: member.membershipId,
        });
        toast.success(t('workspaces.team.removeSuccess'));
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        const message = err?.response?.data?.message || t('workspaces.team.removeError');
        toast.error(message);
      }
    }
  };

  const canManageMember = (member: NamespaceMembership): boolean => {
    // Only owner can manage members, and can't remove themselves
    return isOwner && member.role !== MemberRole.Owner && member.userId !== currentUserId;
  };

  if (error) {
    return (
      <Card variant="elevated">
        <CardContent className="py-12 text-center">
          <p className="text-error">{t('workspaces.team.failedToLoad')}</p>
          <Button variant="text" className="mt-2" onClick={() => window.location.reload()}>
            {t('workspaces.team.tryAgain')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('workspaces.team.title')}</CardTitle>
              <CardDescription>{t('workspaces.team.description')}</CardDescription>
            </div>
            {isOwner && (
              <Button onClick={() => inviteDialog.open()} className="gap-2">
                <UserPlus className="h-4 w-4" />
                {t('workspaces.team.invite')}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : members && members.items && members.items.length > 0 ? (
            <div className="-mx-5 divide-y divide-outline-variant/30">
              {members.items.map((member) => {
                const roleKey = getRoleKey(member.role);
                const RoleIcon = roleIcons[roleKey];
                return (
                  <div
                    key={member.membershipId}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-container-high transition-colors group"
                  >
                    <Avatar
                      src={getAvatarUrl(member.avatarId)}
                      alt={`${member.firstName} ${member.lastName}`}
                      fallback={`${member.firstName[0]}${member.lastName[0]}`}
                      size="lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-on-surface truncate">
                        {member.firstName} {member.lastName}
                        {member.userId === currentUserId && <span className="ml-2 text-xs text-on-surface-variant">{t('workspaces.team.you')}</span>}
                      </p>
                      <p className="text-sm text-on-surface-variant truncate flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {member.email}
                      </p>
                    </div>
                    <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border', roleColors[roleKey])}>
                      <RoleIcon className="h-3.5 w-3.5" />
                      {roleKey}
                    </div>
                    {canManageMember(member) && (
                      <Menu
                        trigger={
                          <IconButton
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={t('a11y.memberActions')}
                          >
                            <MoreVertical className="h-5 w-5" />
                          </IconButton>
                        }
                        align="end"
                      >
                        <MenuItem onClick={() => handleRemoveMember(member)} destructive icon={<Trash2 className="h-4 w-4" />}>
                          {t('workspaces.team.removeFromWorkspace')}
                        </MenuItem>
                      </Menu>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high">
                  <UserPlus className="h-8 w-8 text-on-surface-variant" />
                </div>
              </div>
              <p className="text-on-surface font-medium">{t('workspaces.team.noMembers')}</p>
              <p className="text-sm text-on-surface-variant mt-1">{t('workspaces.team.noMembersDesc')}</p>
              {isOwner && (
                <Button className="mt-4" onClick={() => inviteDialog.open()}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t('workspaces.team.inviteFirst')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialog.isOpen} onOpenChange={inviteDialog.setOpen}>
        <DialogContent size="sm" showClose={false}>
          <DialogHeader
            hero
            icon={<UserPlus className="h-7 w-7" />}
            title={t('workspaces.team.inviteTitle')}
            description={t('workspaces.team.inviteDescription')}
            showClose
          />

          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogBody className="space-y-4">
              <Input
                label={t('workspaces.team.emailLabel')}
                type="email"
                placeholder={t('workspaces.team.emailPlaceholder')}
                {...register('email')}
                error={touchedFields.email ? errors.email?.message : undefined}
                startIcon={<Mail className="h-5 w-5" />}
                autoFocus
              />

              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">{t('workspaces.team.roleLabel')}</label>
                <Select
                  value={watchedRole}
                  onChange={(value) => setValue('role', value as InviteMemberFormData['role'])}
                  options={roleOptions}
                  placeholder={t('workspaces.team.selectRole')}
                />
                <p className="mt-1.5 text-xs text-on-surface-variant">
                  {watchedRole === 'Admin' && t('workspaces.team.roleDescriptions.admin')}
                  {watchedRole === 'Member' && t('workspaces.team.roleDescriptions.member')}
                  {watchedRole === 'Viewer' && t('workspaces.team.roleDescriptions.viewer')}
                </p>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button type="button" variant="text" onClick={inviteDialog.close} disabled={inviteMember.isPending}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={inviteMember.isPending}>
                {inviteMember.isPending ? t('workspaces.team.sending') : t('workspaces.team.sendInvitation')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog />
    </>
  );
}
