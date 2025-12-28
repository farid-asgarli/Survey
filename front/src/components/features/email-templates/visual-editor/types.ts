// Visual Email Editor Types - Outlook Compatible

export type EmailBlockType = 'header' | 'text' | 'image' | 'button' | 'divider' | 'spacer' | 'columns' | 'social' | 'footer';

export interface EmailBlockBase {
  id: string;
  type: EmailBlockType;
}

export interface HeaderBlock extends EmailBlockBase {
  type: 'header';
  content: {
    logoUrl?: string;
    logoAlt?: string;
    logoWidth?: number;
    title?: string;
    subtitle?: string;
    backgroundColor?: string;
    textColor?: string;
    alignment?: 'left' | 'center' | 'right';
    padding?: number;
  };
}

export interface TextBlock extends EmailBlockBase {
  type: 'text';
  content: {
    html: string;
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    lineHeight?: number;
    padding?: number;
    alignment?: 'left' | 'center' | 'right';
  };
}

export interface ImageBlock extends EmailBlockBase {
  type: 'image';
  content: {
    src: string;
    alt: string;
    width?: number;
    linkUrl?: string;
    alignment?: 'left' | 'center' | 'right';
    padding?: number;
    borderRadius?: number;
  };
}

export interface ButtonBlock extends EmailBlockBase {
  type: 'button';
  content: {
    text: string;
    url: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: number;
    padding?: { vertical: number; horizontal: number };
    alignment?: 'left' | 'center' | 'right';
    fullWidth?: boolean;
    fontSize?: number;
  };
}

export interface DividerBlock extends EmailBlockBase {
  type: 'divider';
  content: {
    color?: string;
    thickness?: number;
    style?: 'solid' | 'dashed' | 'dotted';
    width?: string;
    padding?: number;
  };
}

export interface SpacerBlock extends EmailBlockBase {
  type: 'spacer';
  content: {
    height: number;
  };
}

export interface ColumnContent {
  id: string;
  blocks: EmailBlock[];
  width?: number; // percentage
}

export interface ColumnsBlock extends EmailBlockBase {
  type: 'columns';
  content: {
    columns: ColumnContent[];
    gap?: number;
    backgroundColor?: string;
    padding?: number;
    stackOnMobile?: boolean;
  };
}

export interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok';
  url: string;
}

export interface SocialBlock extends EmailBlockBase {
  type: 'social';
  content: {
    links: SocialLink[];
    iconSize?: number;
    iconStyle?: 'color' | 'dark' | 'light';
    alignment?: 'left' | 'center' | 'right';
    gap?: number;
    padding?: number;
  };
}

export interface FooterBlock extends EmailBlockBase {
  type: 'footer';
  content: {
    companyName?: string;
    address?: string;
    unsubscribeText?: string;
    unsubscribeUrl?: string;
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    padding?: number;
  };
}

export type EmailBlock = HeaderBlock | TextBlock | ImageBlock | ButtonBlock | DividerBlock | SpacerBlock | ColumnsBlock | SocialBlock | FooterBlock;

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  preheader?: string;
  blocks: EmailBlock[];
  globalStyles: EmailGlobalStyles;
}

export interface EmailGlobalStyles {
  backgroundColor: string;
  contentBackgroundColor: string;
  contentWidth: number;
  fontFamily: string;
  textColor: string;
  linkColor: string;
  borderRadius?: number;
}

// Default values for blocks
export const defaultGlobalStyles: EmailGlobalStyles = {
  backgroundColor: '#f4f4f4',
  contentBackgroundColor: '#ffffff',
  contentWidth: 600,
  fontFamily: 'Arial, Helvetica, sans-serif',
  textColor: '#333333',
  linkColor: '#0066cc',
  borderRadius: 0,
};

export const defaultBlockContent: Record<EmailBlockType, Partial<EmailBlock['content']>> = {
  header: {
    title: 'Your Company',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    alignment: 'center',
    padding: 20,
  },
  text: {
    html: '<p>Enter your text here...</p>',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    fontSize: 16,
    lineHeight: 1.5,
    padding: 20,
    alignment: 'left',
  },
  image: {
    src: '',
    alt: 'Image description',
    alignment: 'center',
    padding: 10,
    borderRadius: 0,
  },
  button: {
    text: 'Click Here',
    url: '{{surveyLink}}',
    backgroundColor: '#0066cc',
    textColor: '#ffffff',
    borderRadius: 4,
    padding: { vertical: 12, horizontal: 24 },
    alignment: 'center',
    fullWidth: false,
    fontSize: 16,
  },
  divider: {
    color: '#dddddd',
    thickness: 1,
    style: 'solid',
    width: '100%',
    padding: 20,
  },
  spacer: {
    height: 20,
  },
  columns: {
    columns: [],
    gap: 20,
    backgroundColor: '#ffffff',
    padding: 20,
    stackOnMobile: true,
  },
  social: {
    links: [],
    iconSize: 32,
    iconStyle: 'color',
    alignment: 'center',
    gap: 10,
    padding: 20,
  },
  footer: {
    companyName: '{{companyName}}',
    unsubscribeText: 'Unsubscribe',
    unsubscribeUrl: '{{unsubscribeLink}}',
    backgroundColor: '#f4f4f4',
    textColor: '#666666',
    fontSize: 12,
    padding: 20,
  },
};

// Placeholder definitions for email templates
export const emailPlaceholders = [
  { key: '{{firstName}}', label: 'First Name', description: "Recipient's first name" },
  { key: '{{lastName}}', label: 'Last Name', description: "Recipient's last name" },
  { key: '{{email}}', label: 'Email', description: "Recipient's email address" },
  { key: '{{surveyLink}}', label: 'Survey Link', description: 'Link to the survey' },
  { key: '{{surveyTitle}}', label: 'Survey Title', description: 'Title of the survey' },
  { key: '{{senderName}}', label: 'Sender Name', description: 'Name of the sender' },
  { key: '{{companyName}}', label: 'Company Name', description: 'Your company name' },
  { key: '{{unsubscribeLink}}', label: 'Unsubscribe Link', description: 'Unsubscribe link' },
];
