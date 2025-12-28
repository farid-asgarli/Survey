// Email HTML Generator - Creates Outlook-compatible HTML from blocks
import type {
  EmailBlock,
  EmailGlobalStyles,
  HeaderBlock,
  TextBlock,
  ImageBlock,
  ButtonBlock,
  DividerBlock,
  SpacerBlock,
  ColumnsBlock,
  SocialBlock,
  FooterBlock,
} from './types';

// Escape HTML entities for safety
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Generate VML button for Outlook (bulletproof buttons)
function generateVMLButton(
  text: string,
  url: string,
  bgColor: string,
  textColor: string,
  borderRadius: number,
  paddingV: number,
  paddingH: number,
  fontSize: number,
  fullWidth: boolean,
  fontFamily: string = 'Arial,Helvetica,sans-serif'
): string {
  const width = fullWidth ? 560 : paddingH * 2 + text.length * (fontSize * 0.6);
  const height = paddingV * 2 + fontSize + 4;

  return `
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${escapeHtml(
    url
  )}" style="height:${height}px;v-text-anchor:middle;width:${width}px;" arcsize="${Math.round(
    (borderRadius / height) * 100
  )}%" stroke="f" fillcolor="${bgColor}">
  <w:anchorlock/>
  <center>
<![endif]-->
    <a href="${escapeHtml(
      url
    )}" target="_blank" style="background-color:${bgColor};border-radius:${borderRadius}px;color:${textColor};display:inline-block;font-family:${fontFamily};font-size:${fontSize}px;font-weight:bold;line-height:${height}px;text-align:center;text-decoration:none;width:${
    fullWidth ? '100%' : 'auto'
  };padding:${paddingV}px ${paddingH}px;-webkit-text-size-adjust:none;mso-hide:all;">
      ${escapeHtml(text)}
    </a>
<!--[if mso]>
  </center>
</v:roundrect>
<![endif]-->`;
}

// Generate header block HTML
function generateHeaderHtml(block: HeaderBlock, globalStyles: EmailGlobalStyles): string {
  const { content } = block;
  const bgColor = content.backgroundColor || '#ffffff';
  const textColor = content.textColor || globalStyles.textColor;
  const align = content.alignment || 'center';
  const padding = content.padding || 20;

  let logoHtml = '';
  if (content.logoUrl) {
    const logoWidth = content.logoWidth || 150;
    logoHtml = `
      <tr>
        <td align="${align}" style="padding-bottom:10px;">
          <img src="${escapeHtml(content.logoUrl)}" alt="${escapeHtml(
      content.logoAlt || 'Logo'
    )}" width="${logoWidth}" style="display:block;border:0;outline:none;text-decoration:none;max-width:100%;height:auto;" />
        </td>
      </tr>`;
  }

  let titleHtml = '';
  if (content.title) {
    titleHtml = `
      <tr>
        <td align="${align}" style="font-family:${globalStyles.fontFamily};font-size:24px;font-weight:bold;color:${textColor};padding-bottom:${
      content.subtitle ? '5' : '0'
    }px;">
          ${escapeHtml(content.title)}
        </td>
      </tr>`;
  }

  let subtitleHtml = '';
  if (content.subtitle) {
    subtitleHtml = `
      <tr>
        <td align="${align}" style="font-family:${globalStyles.fontFamily};font-size:14px;color:${textColor};opacity:0.8;">
          ${escapeHtml(content.subtitle)}
        </td>
      </tr>`;
  }

  return `
<tr>
  <td style="background-color:${bgColor};padding:${padding}px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      ${logoHtml}
      ${titleHtml}
      ${subtitleHtml}
    </table>
  </td>
</tr>`;
}

// Generate text block HTML
function generateTextHtml(block: TextBlock, globalStyles: EmailGlobalStyles): string {
  const { content } = block;
  const bgColor = content.backgroundColor || 'transparent';
  const textColor = content.textColor || globalStyles.textColor;
  const fontSize = content.fontSize || 16;
  const lineHeight = content.lineHeight || 1.5;
  const padding = content.padding || 20;
  const align = content.alignment || 'left';

  // Process HTML content to ensure inline styles and email compatibility
  const processedHtml = content.html
    // Ensure links have proper styling
    .replace(/<a /g, `<a style="color:${globalStyles.linkColor};text-decoration:underline;" `)
    // Ensure paragraphs have proper margin
    .replace(/<p>/g, `<p style="margin:0 0 16px 0;padding:0;">`)
    // Ensure headings have proper styling
    .replace(/<h1>/g, `<h1 style="margin:0 0 16px 0;font-size:28px;font-weight:bold;">`)
    .replace(/<h2>/g, `<h2 style="margin:0 0 14px 0;font-size:22px;font-weight:bold;">`)
    .replace(/<h3>/g, `<h3 style="margin:0 0 12px 0;font-size:18px;font-weight:bold;">`);

  return `
<tr>
  <td style="background-color:${bgColor};padding:${padding}px;font-family:${globalStyles.fontFamily};font-size:${fontSize}px;line-height:${lineHeight};color:${textColor};text-align:${align};">
    ${processedHtml}
  </td>
</tr>`;
}

// Generate image block HTML
function generateImageHtml(block: ImageBlock, globalStyles: EmailGlobalStyles): string {
  const { content } = block;
  const align = content.alignment || 'center';
  const padding = content.padding || 10;
  const borderRadius = content.borderRadius || 0;
  const width = content.width || globalStyles.contentWidth - 40;

  let imgHtml = `<img src="${escapeHtml(content.src)}" alt="${escapeHtml(
    content.alt
  )}" width="${width}" style="display:block;border:0;outline:none;text-decoration:none;max-width:100%;height:auto;${
    borderRadius ? `border-radius:${borderRadius}px;` : ''
  }" />`;

  if (content.linkUrl) {
    imgHtml = `<a href="${escapeHtml(content.linkUrl)}" target="_blank" style="display:block;">${imgHtml}</a>`;
  }

  return `
<tr>
  <td align="${align}" style="padding:${padding}px;">
    ${imgHtml}
  </td>
</tr>`;
}

// Generate button block HTML (with VML fallback for Outlook)
function generateButtonHtml(block: ButtonBlock, globalStyles: EmailGlobalStyles): string {
  const { content } = block;
  const bgColor = content.backgroundColor || '#0066cc';
  const textColor = content.textColor || '#ffffff';
  const borderRadius = content.borderRadius || 4;
  const paddingV = content.padding?.vertical || 12;
  const paddingH = content.padding?.horizontal || 24;
  const align = content.alignment || 'center';
  const fontSize = content.fontSize || 16;
  const fullWidth = content.fullWidth || false;
  const fontFamily = globalStyles.fontFamily;

  const vmlButton = generateVMLButton(
    content.text,
    content.url,
    bgColor,
    textColor,
    borderRadius,
    paddingV,
    paddingH,
    fontSize,
    fullWidth,
    fontFamily
  );

  return `
<tr>
  <td align="${align}" style="padding:20px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" ${fullWidth ? 'width="100%"' : ''}>
      <tr>
        <td align="center" style="border-radius:${borderRadius}px;background-color:${bgColor};">
          ${vmlButton}
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

// Generate divider block HTML
function generateDividerHtml(block: DividerBlock): string {
  const { content } = block;
  const color = content.color || '#dddddd';
  const thickness = content.thickness || 1;
  const style = content.style || 'solid';
  const width = content.width || '100%';
  const padding = content.padding || 20;

  return `
<tr>
  <td style="padding:${padding}px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${width}" align="center">
      <tr>
        <td style="border-top:${thickness}px ${style} ${color};font-size:0;line-height:0;height:0;">&nbsp;</td>
      </tr>
    </table>
  </td>
</tr>`;
}

// Generate spacer block HTML
function generateSpacerHtml(block: SpacerBlock): string {
  const height = block.content.height || 20;
  return `
<tr>
  <td style="height:${height}px;font-size:0;line-height:0;">&nbsp;</td>
</tr>`;
}

// Generate columns block HTML (table-based for Outlook)
function generateColumnsHtml(block: ColumnsBlock, globalStyles: EmailGlobalStyles): string {
  const { content } = block;
  const columns = content.columns || [];
  const gap = content.gap || 20;
  const bgColor = content.backgroundColor || 'transparent';
  const padding = content.padding || 20;
  const stackOnMobile = content.stackOnMobile !== false;

  if (columns.length === 0) return '';

  const columnWidth = Math.floor((globalStyles.contentWidth - padding * 2 - gap * (columns.length - 1)) / columns.length);

  const columnsHtml = columns
    .map((col, index) => {
      const colBlocks = col.blocks.map((b) => generateBlockHtml(b, globalStyles)).join('');
      const isLast = index === columns.length - 1;

      return `
<!--[if mso]>
<td valign="top" width="${col.width ? Math.floor((globalStyles.contentWidth * col.width) / 100) : columnWidth}" style="width:${
        col.width || Math.floor(100 / columns.length)
      }%;">
<![endif]-->
<div style="display:inline-block;vertical-align:top;width:100%;max-width:${
        col.width ? Math.floor((globalStyles.contentWidth * col.width) / 100) : columnWidth
      }px;${stackOnMobile ? '' : `width:${col.width || Math.floor(100 / columns.length)}%;`}">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    ${colBlocks}
  </table>
</div>
<!--[if mso]>
</td>
${!isLast ? `<td style="width:${gap}px;"></td>` : ''}
<![endif]-->`;
    })
    .join('');

  return `
<tr>
  <td style="background-color:${bgColor};padding:${padding}px;">
    <!--[if mso]>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
    <![endif]-->
    ${columnsHtml}
    <!--[if mso]>
    </tr>
    </table>
    <![endif]-->
  </td>
</tr>`;
}

// Social icon URLs (using simple text fallback for maximum compatibility)
const socialIcons: Record<string, { color: string; char: string }> = {
  facebook: { color: '#1877f2', char: 'f' },
  twitter: { color: '#1da1f2', char: 't' },
  instagram: { color: '#e4405f', char: 'i' },
  linkedin: { color: '#0077b5', char: 'in' },
  youtube: { color: '#ff0000', char: 'yt' },
  tiktok: { color: '#000000', char: 'tk' },
};

// Generate social block HTML
function generateSocialHtml(block: SocialBlock, globalStyles: EmailGlobalStyles): string {
  const { content } = block;
  const links = content.links || [];
  const iconSize = content.iconSize || 32;
  const align = content.alignment || 'center';
  const gap = content.gap || 10;
  const padding = content.padding || 20;
  const fontFamily = globalStyles.fontFamily;

  if (links.length === 0) return '';

  const iconsHtml = links
    .map((link) => {
      const icon = socialIcons[link.platform];
      const bgColor = icon?.color || '#333333';

      return `
<td style="padding:0 ${gap / 2}px;">
  <a href="${escapeHtml(
    link.url
  )}" target="_blank" style="display:inline-block;width:${iconSize}px;height:${iconSize}px;background-color:${bgColor};border-radius:50%;text-align:center;line-height:${iconSize}px;color:#ffffff;font-family:${fontFamily};font-size:${Math.floor(
        iconSize * 0.4
      )}px;font-weight:bold;text-decoration:none;">
    ${icon?.char || '?'}
  </a>
</td>`;
    })
    .join('');

  return `
<tr>
  <td align="${align}" style="padding:${padding}px;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        ${iconsHtml}
      </tr>
    </table>
  </td>
</tr>`;
}

// Generate footer block HTML
function generateFooterHtml(block: FooterBlock, globalStyles: EmailGlobalStyles): string {
  const { content } = block;
  const bgColor = content.backgroundColor || '#f4f4f4';
  const textColor = content.textColor || '#666666';
  const fontSize = content.fontSize || 12;
  const padding = content.padding || 20;

  let companyHtml = '';
  if (content.companyName) {
    companyHtml = `<p style="margin:0 0 8px 0;font-weight:bold;">${escapeHtml(content.companyName)}</p>`;
  }

  let addressHtml = '';
  if (content.address) {
    addressHtml = `<p style="margin:0 0 8px 0;">${escapeHtml(content.address).replace(/\n/g, '<br>')}</p>`;
  }

  let unsubscribeHtml = '';
  if (content.unsubscribeUrl && content.unsubscribeText) {
    unsubscribeHtml = `<p style="margin:16px 0 0 0;"><a href="${escapeHtml(
      content.unsubscribeUrl
    )}" target="_blank" style="color:${textColor};text-decoration:underline;">${escapeHtml(content.unsubscribeText)}</a></p>`;
  }

  return `
<tr>
  <td style="background-color:${bgColor};padding:${padding}px;font-family:${globalStyles.fontFamily};font-size:${fontSize}px;color:${textColor};text-align:center;">
    ${companyHtml}
    ${addressHtml}
    ${unsubscribeHtml}
  </td>
</tr>`;
}

// Main block to HTML converter
export function generateBlockHtml(block: EmailBlock, globalStyles: EmailGlobalStyles): string {
  switch (block.type) {
    case 'header':
      return generateHeaderHtml(block, globalStyles);
    case 'text':
      return generateTextHtml(block, globalStyles);
    case 'image':
      return generateImageHtml(block, globalStyles);
    case 'button':
      return generateButtonHtml(block, globalStyles);
    case 'divider':
      return generateDividerHtml(block);
    case 'spacer':
      return generateSpacerHtml(block);
    case 'columns':
      return generateColumnsHtml(block, globalStyles);
    case 'social':
      return generateSocialHtml(block, globalStyles);
    case 'footer':
      return generateFooterHtml(block, globalStyles);
    default:
      return '';
  }
}

// Generate complete email HTML document
export function generateEmailHtml(blocks: EmailBlock[], globalStyles: EmailGlobalStyles, subject: string, preheader?: string): string {
  const blocksHtml = blocks.map((block) => generateBlockHtml(block, globalStyles)).join('');

  const preheaderHtml = preheader
    ? `
    <!--[if !mso]><!-->
    <div style="display:none;font-size:1px;color:${globalStyles.backgroundColor};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
      ${escapeHtml(preheader)}
    </div>
    <!--<![endif]-->`
    : '';

  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="format-detection" content="telephone=no">
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      border-collapse: collapse;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      outline: none;
      text-decoration: none;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      height: 100% !important;
    }
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }
    /* Mobile styles */
    @media only screen and (max-width: 620px) {
      .wrapper {
        width: 100% !important;
        max-width: 100% !important;
      }
      .column {
        width: 100% !important;
        max-width: 100% !important;
        display: block !important;
      }
      .mobile-hide {
        display: none !important;
      }
      .mobile-center {
        text-align: center !important;
      }
      .mobile-padding {
        padding-left: 16px !important;
        padding-right: 16px !important;
      }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${globalStyles.backgroundColor};font-family:${globalStyles.fontFamily};">
  ${preheaderHtml}
  
  <!-- Main wrapper table -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${globalStyles.backgroundColor};">
    <tr>
      <td align="center" style="padding:20px 10px;">
        
        <!-- Content table -->
        <table role="presentation" class="wrapper" cellpadding="0" cellspacing="0" border="0" width="${globalStyles.contentWidth}" style="max-width:${
    globalStyles.contentWidth
  }px;background-color:${globalStyles.contentBackgroundColor};${globalStyles.borderRadius ? `border-radius:${globalStyles.borderRadius}px;` : ''}">
          ${blocksHtml}
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// Generate plain text version from blocks
export function generatePlainText(blocks: EmailBlock[]): string {
  const textParts: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case 'header':
        if (block.content.title) textParts.push(block.content.title);
        if (block.content.subtitle) textParts.push(block.content.subtitle);
        textParts.push('');
        break;
      case 'text': {
        // Strip HTML tags
        const text = block.content.html
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>/gi, '\n\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .trim();
        if (text) textParts.push(text);
        break;
      }
      case 'button':
        textParts.push(`${block.content.text}: ${block.content.url}`);
        break;
      case 'divider':
        textParts.push('---');
        break;
      case 'spacer':
        textParts.push('');
        break;
      case 'columns':
        for (const col of block.content.columns) {
          textParts.push(generatePlainText(col.blocks));
        }
        break;
      case 'social': {
        const socialLinks = block.content.links.map((l) => `${l.platform}: ${l.url}`).join('\n');
        if (socialLinks) textParts.push(socialLinks);
        break;
      }
      case 'footer':
        if (block.content.companyName) textParts.push(block.content.companyName);
        if (block.content.address) textParts.push(block.content.address);
        if (block.content.unsubscribeText && block.content.unsubscribeUrl) {
          textParts.push(`${block.content.unsubscribeText}: ${block.content.unsubscribeUrl}`);
        }
        break;
    }
  }

  return textParts
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
