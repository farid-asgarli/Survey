// Welcome Screen - Initial screen shown before survey starts
// M3 Expressive: Clean, focused design with shape variety and container hierarchy
// NO shadows, NO gradients - uses border emphasis and surface colors for depth
// Composes UI components (Card, Button, IconContainer, Chip)
// Uses container queries (@sm:, @md:) for proper preview responsiveness

import { useTranslation } from 'react-i18next';
import { Button, Card, CardContent, IconContainer, Chip } from '@/components/ui';
import { ArrowRight, Clock, HelpCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

/** Style customization options that can be controlled via backend */
interface WelcomeScreenStyleOverrides {
  /** Primary accent color (CSS color value) */
  accentColor?: string;
  /** Card background color */
  cardBackground?: string;
  /** Text color override */
  textColor?: string;
  /** Button style: 'filled' | 'tonal' | 'outline' */
  buttonVariant?: 'filled' | 'tonal' | 'outline';
  /** Layout style: 'centered' | 'left-aligned' */
  layout?: 'centered' | 'left-aligned';
  /** Show decorative background shapes */
  showDecorations?: boolean;
}

interface WelcomeScreenProps {
  /** Survey title */
  title: string;
  /** Survey description */
  description?: string;
  /** Custom welcome message shown in a card */
  welcomeMessage?: string;
  /** Number of questions in the survey */
  questionCount: number;
  /** Callback when user clicks start */
  onStart: () => void;
  /** Whether the start action is in progress */
  isStarting?: boolean;
  /** Logo URL to display */
  logoUrl?: string;
  /** Logo size: 0=small, 1=medium (default), 2=large, 3=extra-large */
  logoSize?: number;
  /** Whether to show a background behind the logo */
  showLogoBackground?: boolean;
  /** Background color for the logo */
  logoBackgroundColor?: string;
  /** Branding title displayed below the logo */
  brandingTitle?: string;
  /** Branding subtitle displayed below the title */
  brandingSubtitle?: string;
  /** Style overrides from backend configuration */
  styleOverrides?: WelcomeScreenStyleOverrides;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function WelcomeScreen({
  title,
  description,
  welcomeMessage,
  questionCount,
  onStart,
  isStarting,
  logoUrl,
  logoSize = 1,
  showLogoBackground,
  logoBackgroundColor,
  brandingTitle,
  brandingSubtitle,
  styleOverrides = {},
}: WelcomeScreenProps) {
  const { t } = useTranslation();
  const estimatedMinutes = Math.ceil(questionCount * 0.5);

  const { accentColor, cardBackground, textColor, buttonVariant = 'filled', layout = 'centered', showDecorations = true } = styleOverrides;

  // Logo size mapping with container query responsive classes
  const logoSizeMap: Record<number, string> = {
    0: 'w-14 h-14 @sm:w-16 @sm:h-16',
    1: 'w-20 h-20 @sm:w-24 @sm:h-24',
    2: 'w-24 h-24 @sm:w-28 @sm:h-28',
    3: 'w-28 h-28 @sm:w-32 @sm:h-32',
  };

  const isLeftAligned = layout === 'left-aligned';

  // Custom CSS variables for style overrides
  const customStyles: React.CSSProperties = {
    ...(accentColor && { '--accent-override': accentColor }),
    ...(textColor && { '--text-override': textColor }),
  } as React.CSSProperties;

  return (
    <div className='min-h-[70vh] flex flex-col items-center justify-center px-4 @sm:px-6 @md:px-8 py-8 @sm:py-12 relative overflow-hidden' style={customStyles}>
      {/* ========== DECORATIVE BACKGROUND SHAPES ========== */}
      {showDecorations && (
        <div className='absolute inset-0 pointer-events-none overflow-hidden' aria-hidden='true'>
          {/* Large primary blob - top left */}
          <div className='absolute -top-24 -left-24 @sm:-top-32 @sm:-left-32 w-64 @sm:w-80 @md:w-96 h-64 @sm:h-80 @md:h-96 rounded-full bg-primary-container/10' />
          {/* Secondary accent - bottom right */}
          <div className='absolute -bottom-16 -right-16 @sm:-bottom-24 @sm:-right-24 w-48 @sm:w-64 @md:w-72 h-48 @sm:h-64 @md:h-72 rounded-5xl bg-secondary-container/8 rotate-12' />
          {/* Small floating pill - top right */}
          <div className='absolute top-20 @sm:top-28 right-8 @sm:right-16 w-16 @sm:w-20 h-6 @sm:h-8 rounded-full bg-tertiary-container/15' />
        </div>
      )}

      {/* ========== MAIN CONTENT CONTAINER ========== */}
      <div className={cn('relative z-10 flex flex-col w-full max-w-xl', isLeftAligned ? 'items-start text-left' : 'items-center text-center')}>
        {/* ========== LOGO / BRAND HERO ========== */}
        <div className={cn('mb-8 @sm:mb-10', isLeftAligned ? '' : 'flex flex-col items-center')}>
          {logoUrl ? (
            <div
              className={cn(
                'rounded-2xl @sm:rounded-3xl overflow-hidden border-2 border-outline-variant/30',
                'transition-[border-radius,border-color] duration-500',
                'hover:border-primary/40 hover:rounded-3xl @sm:hover:rounded-3xl',
                showLogoBackground && 'p-3 @sm:p-4',
                logoSizeMap[logoSize] || logoSizeMap[1]
              )}
              style={{
                backgroundColor: showLogoBackground ? logoBackgroundColor || 'var(--color-surface-container)' : undefined,
              }}
            >
              <img src={logoUrl} alt={t('a11y.surveyLogo')} className='w-full h-full object-contain' />
            </div>
          ) : (
            <IconContainer
              emphasis='dramatic'
              variant='primary'
              shape='rounded'
              className='border-2 border-primary/20 transition-[border-radius,border-color] duration-500 hover:border-primary/40 hover:rounded-3xl'
              icon={<Sparkles strokeWidth={1.5} />}
            />
          )}

          {/* Branding Text */}
          {(brandingTitle || brandingSubtitle) && (
            <div className='mt-4 @sm:mt-5'>
              {brandingTitle && (
                <p className='text-lg @sm:text-xl font-bold text-on-surface tracking-tight' style={textColor ? { color: textColor } : undefined}>
                  {brandingTitle}
                </p>
              )}
              {brandingSubtitle && <p className='text-sm @sm:text-base text-on-surface-variant mt-0.5 font-medium'>{brandingSubtitle}</p>}
            </div>
          )}
        </div>

        {/* ========== SURVEY TITLE ========== */}
        <h1
          className={cn(
            'text-2xl @sm:text-3xl @md:text-4xl font-extrabold text-on-surface',
            'leading-tight tracking-tight mb-3 @sm:mb-4',
            !isLeftAligned && 'px-2'
          )}
          style={textColor ? { color: textColor } : undefined}
        >
          {title}
        </h1>

        {/* ========== DESCRIPTION ========== */}
        {description && (
          <p className={cn('text-base @sm:text-lg text-on-surface-variant', 'leading-relaxed mb-6 @sm:mb-8 max-w-md', !isLeftAligned && 'px-2')}>
            {description}
          </p>
        )}

        {/* ========== WELCOME MESSAGE CARD ========== */}
        {welcomeMessage && (
          <Card
            variant='filled'
            padding='default'
            className={cn(
              'w-full max-w-md mb-6 @sm:mb-8 border border-outline-variant/20',
              'transition-[border-radius,border-color] duration-300',
              'hover:border-primary/25'
            )}
            style={cardBackground ? { backgroundColor: cardBackground } : undefined}
          >
            <CardContent className='p-0'>
              <p className='text-sm @sm:text-base text-on-surface leading-relaxed whitespace-pre-wrap'>{welcomeMessage}</p>
            </CardContent>
          </Card>
        )}

        {/* ========== SURVEY META CHIPS ========== */}
        <div className={cn('flex flex-wrap gap-2 @sm:gap-3 mb-8 @sm:mb-10', isLeftAligned ? 'justify-start' : 'justify-center')}>
          <Chip variant='assist' size='default' icon={<HelpCircle className='w-4 h-4' />} className='border border-primary/15'>
            {questionCount} {t('welcomeScreen.questions', { count: questionCount })}
          </Chip>

          <Chip variant='suggestion' size='default' icon={<Clock className='w-4 h-4' />}>
            ~{estimatedMinutes} {t('welcomeScreen.minutes')}
          </Chip>
        </div>

        {/* ========== CTA BUTTON ========== */}
        <div className={cn('flex flex-col', isLeftAligned ? 'items-start' : 'items-center')}>
          <Button
            variant={buttonVariant}
            size='xl'
            onClick={onStart}
            disabled={isStarting}
            loading={isStarting}
            className='gap-3 px-10 @sm:px-12 group'
            style={accentColor && buttonVariant === 'filled' ? { backgroundColor: accentColor } : undefined}
          >
            <span>{isStarting ? t('welcomeScreen.starting', { defaultValue: 'Starting...' }) : t('welcomeScreen.startSurvey')}</span>
            {!isStarting && <ArrowRight className='w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5' />}
          </Button>

          {/* Helper text */}
          <p className='mt-4 @sm:mt-5 text-xs @sm:text-sm text-on-surface-variant/60 font-medium'>
            {t('welcomeScreen.anonymousNote', { defaultValue: 'Your responses help us improve' })}
          </p>
        </div>
      </div>
    </div>
  );
}
