// Development Test Page - Component Showcase & Theme Controls
// This page only works in development mode

import { useThemeStore } from '@/stores/themeStore';
import { Badge, Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import { Code, Sun, Moon, RefreshCw, Palette, Layers, Type, Sparkles, Layout, Wand2 } from 'lucide-react';
import {
  ThemeControlsSection,
  ColorTokensSection,
  TypographySection,
  ButtonShowcaseSection,
  FormControlsSection,
  BadgesChipsSection,
  CardsSection,
  ToastDemoSection,
  AvatarsSection,
  SpacingSection,
} from './sections';

export function DevTestPage() {
  const { isDark } = useThemeStore();

  return (
    <div className="min-h-screen bg-surface-container-lowest">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-surface-container-low/95 backdrop-blur-sm border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-on-surface">Dev Test Page</h1>
              <p className="text-sm text-on-surface-variant">Component showcase & theme controls</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isDark ? 'default' : 'outline'}>
              {isDark ? <Moon className="h-3 w-3 mr-1" /> : <Sun className="h-3 w-3 mr-1" />}
              {isDark ? 'Dark' : 'Light'}
            </Badge>
            <Button variant="text" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Tabs defaultValue="theme" variant="pills" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="theme" icon={<Palette className="h-4 w-4" />}>
              Theme
            </TabsTrigger>
            <TabsTrigger value="colors" icon={<Layers className="h-4 w-4" />}>
              Colors
            </TabsTrigger>
            <TabsTrigger value="typography" icon={<Type className="h-4 w-4" />}>
              Typography
            </TabsTrigger>
            <TabsTrigger value="buttons" icon={<Sparkles className="h-4 w-4" />}>
              Buttons
            </TabsTrigger>
            <TabsTrigger value="forms" icon={<Layout className="h-4 w-4" />}>
              Forms
            </TabsTrigger>
            <TabsTrigger value="components" icon={<Wand2 className="h-4 w-4" />}>
              Components
            </TabsTrigger>
            <TabsTrigger value="spacing" icon={<Layout className="h-4 w-4" />}>
              Spacing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="theme" className="space-y-6">
            <ThemeControlsSection />
          </TabsContent>

          <TabsContent value="colors" className="space-y-6">
            <ColorTokensSection />
          </TabsContent>

          <TabsContent value="typography" className="space-y-6">
            <TypographySection />
          </TabsContent>

          <TabsContent value="buttons" className="space-y-6">
            <ButtonShowcaseSection />
          </TabsContent>

          <TabsContent value="forms" className="space-y-6">
            <FormControlsSection />
          </TabsContent>

          <TabsContent value="components" className="space-y-6">
            <BadgesChipsSection />
            <CardsSection />
            <ToastDemoSection />
            <AvatarsSection />
          </TabsContent>

          <TabsContent value="spacing" className="space-y-6">
            <SpacingSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default DevTestPage;
