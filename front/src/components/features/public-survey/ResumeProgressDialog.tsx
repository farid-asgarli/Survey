// Resume Progress Dialog - Prompts user to resume saved progress or start fresh

import { Dialog, DialogContent, Button } from '@/components/ui';
import { History, RefreshCw } from 'lucide-react';

interface ResumeProgressDialogProps {
  open: boolean;
  onResume: () => void;
  onStartFresh: () => void;
}

export function ResumeProgressDialog({ open, onResume, onStartFresh }: ResumeProgressDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent showClose={false}>
        <div className='p-6 max-w-md'>
          {/* Icon */}
          <div className='flex justify-center mb-6'>
            <div className='w-16 h-16 rounded-3xl bg-primary-container/60 flex items-center justify-center'>
              <History className='w-8 h-8 text-on-primary-container' />
            </div>
          </div>

          {/* Title */}
          <h2 className='text-xl font-bold text-on-surface text-center mb-3'>Continue Where You Left Off?</h2>

          {/* Description */}
          <p className='text-on-surface-variant text-center mb-8'>
            We found your previous progress on this survey. Would you like to continue from where you left off, or start fresh?
          </p>

          {/* Actions */}
          <div className='flex flex-col gap-3'>
            <Button size='lg' onClick={onResume} className='w-full gap-2'>
              <History className='w-5 h-5' />
              Continue Survey
            </Button>
            <Button variant='outline' size='lg' onClick={onStartFresh} className='w-full gap-2'>
              <RefreshCw className='w-5 h-5' />
              Start Fresh
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
