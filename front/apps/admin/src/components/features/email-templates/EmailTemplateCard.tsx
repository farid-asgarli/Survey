// EmailTemplateCard - Display card for email template

import { Mail, MoreVertical, Copy, Trash2, Edit, Star, Clock, Eye } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Menu, MenuItem, MenuSeparator, Chip } from '@/components/ui';
import { useDateTimeFormatter } from '@/hooks';
import { EmailTemplateType } from '@/types/enums';
import type { EmailTemplateSummary } from '@/types';

interface EmailTemplateCardProps {
  template: EmailTemplateSummary;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  onPreview: () => void;
}

const typeConfig: Record<EmailTemplateType, { label: string; color: string }> = {
  [EmailTemplateType.SurveyInvitation]: { label: 'Invitation', color: 'bg-primary-container text-on-primary-container' },
  [EmailTemplateType.SurveyReminder]: { label: 'Reminder', color: 'bg-warning-container text-on-warning-container' },
  [EmailTemplateType.ThankYou]: { label: 'Thank You', color: 'bg-success-container text-on-success-container' },
  [EmailTemplateType.Custom]: { label: 'Custom', color: 'bg-tertiary-container text-on-tertiary-container' },
};

export function EmailTemplateCard({ template, onEdit, onDuplicate, onDelete, onSetDefault, onPreview }: EmailTemplateCardProps) {
  const { formatDate } = useDateTimeFormatter();
  const config = typeConfig[template.type] || typeConfig[EmailTemplateType.Custom];

  return (
    <Card variant='elevated' className='group'>
      <CardHeader className='pb-2'>
        <div className='flex items-start justify-between gap-2'>
          <div className={`flex h-9 w-9 items-center justify-center rounded-full shrink-0 ${config.color}`}>
            <Mail className='h-4 w-4' />
          </div>
          <Menu
            trigger={
              <Button variant='text' size='icon-sm' className='h-8 w-8 p-0'>
                <MoreVertical className='h-4 w-4' />
              </Button>
            }
            align='end'
          >
            <MenuItem onClick={onPreview} icon={<Eye className='h-4 w-4' />}>
              Preview
            </MenuItem>
            <MenuItem onClick={onEdit} icon={<Edit className='h-4 w-4' />}>
              Edit
            </MenuItem>
            <MenuItem onClick={onDuplicate} icon={<Copy className='h-4 w-4' />}>
              Duplicate
            </MenuItem>
            {!template.isDefault && (
              <MenuItem onClick={onSetDefault} icon={<Star className='h-4 w-4' />}>
                Set as Default
              </MenuItem>
            )}
            <MenuSeparator />
            <MenuItem onClick={onDelete} destructive icon={<Trash2 className='h-4 w-4' />}>
              Delete
            </MenuItem>
          </Menu>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className='font-medium text-on-surface mb-1 line-clamp-1'>{template.name}</h3>
        <p className='text-sm text-on-surface-variant line-clamp-1 mb-3'>{template.subject}</p>

        <div className='flex items-center justify-between text-xs text-on-surface-variant'>
          <div className='flex items-center gap-1'>
            <Clock className='h-3 w-3' />
            <span>{formatDate(template.createdAt)}</span>
          </div>
          <div className='flex items-center gap-2'>
            {template.isDefault && (
              <Chip size='sm' className='bg-primary-container text-on-primary-container'>
                <Star className='h-3 w-3 mr-1' fill='currentColor' />
                Default
              </Chip>
            )}
            <Chip size='sm' className={config.color}>
              {config.label}
            </Chip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
