import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';
import { Layout } from 'lucide-react';

export function CardsSection() {
  return (
    <Card variant="elevated" shape="rounded">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layout className="h-5 w-5 text-primary" />
          Card Variants
        </CardTitle>
        <CardDescription>Different card styles and elevations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card variant="elevated" shape="rounded">
            <CardContent className="pt-4">
              <p className="text-sm text-on-surface-variant">Elevated Card</p>
            </CardContent>
          </Card>
          <Card variant="filled" shape="rounded">
            <CardContent className="pt-4">
              <p className="text-sm text-on-surface-variant">Filled Card</p>
            </CardContent>
          </Card>
          <Card variant="outlined" shape="rounded">
            <CardContent className="pt-4">
              <p className="text-sm text-on-surface-variant">Outlined Card</p>
            </CardContent>
          </Card>
          <Card variant="highlighted" shape="rounded">
            <CardContent className="pt-4">
              <p className="text-sm text-on-surface-variant">Highlighted Card</p>
            </CardContent>
          </Card>
          <Card variant="interactive" shape="rounded">
            <CardContent className="pt-4">
              <p className="text-sm text-on-surface-variant">Interactive Card</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
