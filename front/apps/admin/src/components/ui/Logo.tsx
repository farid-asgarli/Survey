import { cn } from '@/lib/utils';

export type LogoVariant = 'dark' | 'light' | 'icon';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface LogoProps {
  /** Logo variant: 'dark' (dark text), 'light' (light text), 'icon' (icon only) */
  variant?: LogoVariant;
  /** Size preset for the logo */
  size?: LogoSize;
  /** Custom className for additional styling */
  className?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Custom width (overrides size preset) */
  width?: number | string;
  /** Custom height (overrides size preset) */
  height?: number | string;
}

const logoSizes: Record<LogoSize, { width: number; height: number }> = {
  xs: { width: 24, height: 24 },
  sm: { width: 32, height: 32 },
  md: { width: 40, height: 40 },
  lg: { width: 56, height: 56 },
  xl: { width: 72, height: 72 },
  '2xl': { width: 96, height: 96 },
};

// For full logo (with text), we need wider dimensions
const fullLogoSizes: Record<LogoSize, { width: number; height: number }> = {
  xs: { width: 80, height: 24 },
  sm: { width: 100, height: 32 },
  md: { width: 140, height: 40 },
  lg: { width: 180, height: 56 },
  xl: { width: 220, height: 72 },
  '2xl': { width: 280, height: 96 },
};

const logoSrcMap: Record<LogoVariant, string> = {
  dark: '/images/logos/logo-dark.svg',
  light: '/images/logos/logo-light.svg',
  icon: '/images/logos/logo-icon.svg',
};

/**
 * Logo Component
 *
 * Renders the application logo with support for different variants and sizes.
 *
 * @example
 * // Icon only
 * <Logo variant="icon" size="md" />
 *
 * // Full logo with dark text
 * <Logo variant="dark" size="lg" />
 *
 * // Full logo with light text (for dark backgrounds)
 * <Logo variant="light" size="lg" />
 */
export function Logo({ variant = 'icon', size = 'md', className, alt = 'Inquiro Logo', width, height }: LogoProps) {
  const isIconOnly = variant === 'icon';
  const sizePreset = isIconOnly ? logoSizes[size] : fullLogoSizes[size];

  const finalWidth = width ?? sizePreset.width;
  const finalHeight = height ?? sizePreset.height;

  return <img src={logoSrcMap[variant]} alt={alt} width={finalWidth} height={finalHeight} className={cn('object-contain', className)} loading='eager' />;
}

/**
 * LogoIcon Component
 *
 * Shorthand for icon-only logo, useful for replacing Sparkles icons.
 *
 * @example
 * <LogoIcon size="sm" className="text-primary" />
 */
export function LogoIcon({ size = 'md', className, alt = 'Inquiro', ...props }: Omit<LogoProps, 'variant'>) {
  return <Logo variant='icon' size={size} className={className} alt={alt} {...props} />;
}

export default Logo;
