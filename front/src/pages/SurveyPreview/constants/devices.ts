import { Smartphone, Tablet, Monitor, Laptop, Tv } from 'lucide-react';
import type { DevicePreset } from '../types';

// Popular device presets
export const DEVICE_PRESETS: DevicePreset[] = [
  // Mobile devices
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', category: 'mobile', width: 393, height: 852, icon: Smartphone },
  { id: 'iphone-se', name: 'iPhone SE', category: 'mobile', width: 375, height: 667, icon: Smartphone },
  { id: 'pixel-8', name: 'Pixel 8', category: 'mobile', width: 412, height: 915, icon: Smartphone },
  { id: 'galaxy-s24', name: 'Galaxy S24', category: 'mobile', width: 360, height: 780, icon: Smartphone },
  // Tablets
  { id: 'ipad-pro-11', name: 'iPad Pro 11"', category: 'tablet', width: 834, height: 1194, icon: Tablet },
  { id: 'ipad-mini', name: 'iPad Mini', category: 'tablet', width: 744, height: 1133, icon: Tablet },
  { id: 'galaxy-tab-s9', name: 'Galaxy Tab S9', category: 'tablet', width: 800, height: 1280, icon: Tablet },
  { id: 'surface-pro', name: 'Surface Pro', category: 'tablet', width: 912, height: 1368, icon: Tablet },
  // Desktop
  { id: 'laptop', name: 'Laptop (1366×768)', category: 'desktop', width: 1366, height: 768, icon: Laptop },
  { id: 'desktop-hd', name: 'Desktop HD', category: 'desktop', width: 1920, height: 1080, icon: Monitor },
  { id: 'desktop-2k', name: 'Desktop 2K', category: 'desktop', width: 2560, height: 1440, icon: Tv },
  { id: 'responsive', name: 'Responsive', category: 'desktop', width: 0, height: 0, icon: Monitor },
];
