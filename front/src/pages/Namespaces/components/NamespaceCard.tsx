import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardContent, Menu, MenuItem, MenuSeparator, Chip } from '@/components/ui';
import { MoreVertical, Settings, Trash2, Crown, Check, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NamespaceCardProps } from '../types';

export function NamespaceCard({ namespace, isActive, isOwner, onSelect, onSettings, onDelete }: NamespaceCardProps) {
  const { t } = useTranslation();

  return (
    <Card variant="outlined" className={cn('group cursor-pointer', isActive && 'border-primary bg-primary/5')} onClick={onSelect}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Icon */}
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl shrink-0',
              isActive ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
            )}
          >
            <Building2 className="h-5 w-5" />
          </div>

          {/* Menu button */}
          <Menu
            trigger={
              <button
                className="p-2 -mr-2 -mt-1 rounded-full hover:bg-surface-container-high opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
                aria-label={t('common.workspaceOptions')}
              >
                <MoreVertical className="h-4 w-4 text-on-surface-variant" />
              </button>
            }
            align="end"
          >
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              icon={<Check className="h-4 w-4" />}
            >
              {t('workspaces.switchTo')}
            </MenuItem>
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                onSettings();
              }}
              icon={<Settings className="h-4 w-4" />}
            >
              {t('workspaces.settings')}
            </MenuItem>
            {isOwner && (
              <>
                <MenuSeparator />
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  destructive
                  icon={<Trash2 className="h-4 w-4" />}
                >
                  {t('workspaces.deleteWorkspace')}
                </MenuItem>
              </>
            )}
          </Menu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Title and slug */}
        <h3 className="font-semibold text-on-surface truncate mb-0.5">{namespace.name}</h3>
        <p className="text-sm text-on-surface-variant/60 truncate mb-3">{namespace.slug}</p>

        {/* Description if present */}
        {namespace.description && <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">{namespace.description}</p>}

        {/* Status badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {isActive && (
            <Chip size="sm" variant="success">
              {t('workspaces.active')}
            </Chip>
          )}
          <Chip size="sm" variant="assist">
            {namespace.subscriptionTier}
          </Chip>
          {isOwner && (
            <Chip size="sm" variant="assist">
              <Crown className="h-3 w-3 mr-1" />
              {t('workspaces.roles.owner')}
            </Chip>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
