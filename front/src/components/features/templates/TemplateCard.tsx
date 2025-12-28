import { MoreVertical, Eye, Copy, Edit, Trash2, FileText, Users, Globe, Lock, FolderOpen } from 'lucide-react';
import { Card, CardHeader, CardContent, Chip, Menu, MenuItem, MenuSeparator, IconButton } from '@/components/ui';
import { getCategoryInfo, formatQuestionCount, formatUsageCount } from './templateUtils';
import { cn } from '@/lib/utils';
import type { SurveyTemplate, TemplateCategory } from '@/types';

interface TemplateCardProps {
  template: SurveyTemplate;
  onUse: () => void;
  onPreview: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwner?: boolean;
}

export function TemplateCard({ template, onUse, onPreview, onEdit, onDelete, isOwner = false }: TemplateCardProps) {
  const categoryInfo = getCategoryInfo((template.category || 'other') as TemplateCategory);
  const canModify = isOwner;

  return (
    <Card variant="elevated" className="group cursor-pointer" onClick={onUse}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full shrink-0',
              template.isPublic ? 'bg-success-container/60 text-success' : 'bg-surface-container-high text-on-surface-variant'
            )}
          >
            <FolderOpen className="h-4 w-4" />
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Menu
              trigger={
                <IconButton variant="standard" size="sm" aria-label="More options" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </IconButton>
              }
              align="end"
            >
              <MenuItem onClick={onPreview} icon={<Eye className="h-4 w-4" />}>
                Preview
              </MenuItem>
              <MenuItem onClick={onUse} icon={<Copy className="h-4 w-4" />}>
                Use Template
              </MenuItem>
              {canModify && (
                <>
                  <MenuSeparator />
                  {onEdit && (
                    <MenuItem onClick={onEdit} icon={<Edit className="h-4 w-4" />}>
                      Edit
                    </MenuItem>
                  )}
                  {onDelete && (
                    <MenuItem onClick={onDelete} destructive icon={<Trash2 className="h-4 w-4" />}>
                      Delete
                    </MenuItem>
                  )}
                </>
              )}
            </Menu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <h3 className="font-medium text-on-surface mb-1 group-hover:text-primary transition-colors truncate">{template.name}</h3>
        {template.description && <p className="text-sm text-on-surface-variant line-clamp-2 mb-3">{template.description}</p>}
        {!template.description && <div className="mb-3" />}

        <div className="flex items-center justify-between text-xs text-on-surface-variant">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {formatQuestionCount(template.questionCount)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {formatUsageCount(template.usageCount)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {template.isPublic ? <Globe className="h-3.5 w-3.5 text-success" /> : <Lock className="h-3.5 w-3.5" />}
            <Chip size="sm" variant="assist">
              {categoryInfo.label}
            </Chip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
