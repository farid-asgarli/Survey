import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, toast } from '@/components/ui';
import { Bell, Check, X, AlertTriangle, Info } from 'lucide-react';

export function ToastDemoSection() {
  return (
    <Card variant="elevated" shape="rounded">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Toast Notifications
        </CardTitle>
        <CardDescription>Feedback messages and alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button variant="filled" onClick={() => toast.success('Success! Operation completed')}>
            <Check className="h-4 w-4" /> Success
          </Button>
          <Button variant="destructive" onClick={() => toast.error('Error! Something went wrong')}>
            <X className="h-4 w-4" /> Error
          </Button>
          <Button variant="outline" onClick={() => toast.warning('Warning! Please review this')}>
            <AlertTriangle className="h-4 w-4" /> Warning
          </Button>
          <Button variant="tonal" onClick={() => toast.info('Info: Here is some information')}>
            <Info className="h-4 w-4" /> Info
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
