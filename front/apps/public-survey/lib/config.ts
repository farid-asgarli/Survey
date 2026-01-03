// Environment configuration for public survey app

export const config = {
  // API base URL - will be set via environment variable in production
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  
  // Default language
  defaultLanguage: 'en',
  
  // Supported languages
  supportedLanguages: ['en', 'az', 'ru'],
} as const;

export type Config = typeof config;
