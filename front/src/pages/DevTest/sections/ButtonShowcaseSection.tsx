import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, IconButton } from '@/components/ui';
import { Sparkles, Plus, Download, Upload, Trash2, Heart, Star, Bell, Settings } from 'lucide-react';

export function ButtonShowcaseSection() {
  const [loading, setLoading] = useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Card variant="elevated" shape="rounded">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Buttons
        </CardTitle>
        <CardDescription>Button variants and states</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Buttons */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-on-surface">Primary Variants</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="filled">Filled</Button>
            <Button variant="tonal">Tonal</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="text">Text</Button>
            <Button variant="text">Text Only</Button>
          </div>
        </div>

        {/* Destructive Buttons */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-on-surface">Destructive Variants</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="destructive">Destructive</Button>
            <Button variant="destructive-tonal">Destructive Tonal</Button>
            <Button variant="destructive-outline">Destructive Outline</Button>
            <Button variant="destructive-outline">Destructive Outline 2</Button>
          </div>
        </div>

        {/* Button Sizes */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-on-surface">Sizes</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </div>

        {/* With Icons */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-on-surface">With Icons</h3>
          <div className="flex flex-wrap gap-3">
            <Button>
              <Plus className="h-4 w-4" /> Create
            </Button>
            <Button variant="tonal">
              <Download className="h-4 w-4" /> Download
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4" /> Upload
            </Button>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>

        {/* States */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-on-surface">States</h3>
          <div className="flex flex-wrap gap-3">
            <Button loading={loading} onClick={handleLoadingDemo}>
              {loading ? 'Loading...' : 'Click for Loading'}
            </Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>

        {/* Icon Buttons */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-on-surface">Icon Buttons</h3>
          <div className="flex flex-wrap gap-3">
            <IconButton variant="standard" aria-label="Like">
              <Heart className="h-5 w-5" />
            </IconButton>
            <IconButton variant="filled" aria-label="Favorite">
              <Star className="h-5 w-5" />
            </IconButton>
            <IconButton variant="filled-tonal" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </IconButton>
            <IconButton variant="outlined" aria-label="Settings">
              <Settings className="h-5 w-5" />
            </IconButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
