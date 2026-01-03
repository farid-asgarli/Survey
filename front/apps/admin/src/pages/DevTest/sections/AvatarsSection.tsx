import { Card, CardHeader, CardTitle, CardDescription, CardContent, Avatar } from '@/components/ui';
import { Eye } from 'lucide-react';

export function AvatarsSection() {
  return (
    <Card variant="elevated" shape="rounded">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Avatars
        </CardTitle>
        <CardDescription>User profile images and fallbacks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar fallback="JD" size="sm" />
          <Avatar fallback="Alice Brown" size="default" />
          <Avatar fallback="Mike Wilson" size="lg" />
          <Avatar fallback="Sarah" size="xl" />
        </div>
      </CardContent>
    </Card>
  );
}
