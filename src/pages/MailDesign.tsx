import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Code,
  Columns2,
  Copy,
  Eye,
  GripVertical,
  Image,
  Link2,
  Monitor,
  Plus,
  Save,
  Send,
  Smartphone,
  Sparkles,
  Trash2,
  Type,
  Upload,
} from 'lucide-react';
import clsx from 'clsx';

const LOGO_BLACK_URL = 'https://leadingedge.com.bd/wp-content/uploads/2025/10/logo-black-scaled.png';
const LOGO_WHITE_URL = 'https://leadingedge.com.bd/wp-content/uploads/2025/10/logo-white-scaled.png';

const FB_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#e2e8f0" style="display:block;"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`;
const IG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="#e2e8f0" stroke="none"/></svg>`;
const X_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#e2e8f0" style="display:block;"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;
const LI_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#e2e8f0" style="display:block;"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>`;
const WA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#e2e8f0" style="display:block;"><path d="M12.04 2C6.58 2 2.15 6.29 2.15 11.58c0 1.88.57 3.63 1.55 5.12L2 22l5.51-1.67a10 10 0 0 0 4.53 1.07c5.46 0 9.89-4.29 9.89-9.58S17.5 2 12.04 2zm0 17.23c-1.5 0-2.92-.38-4.16-1.06l-.3-.17-3.27.99 1-3.19-.2-.32a8.04 8.04 0 0 1-1.22-4.31c0-4.44 3.75-8.05 8.35-8.05 4.59 0 8.34 3.61 8.34 8.05 0 4.44-3.75 8.06-8.34 8.06zm4.44-5.71c-.24-.12-1.42-.69-1.64-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.93-.14.16-.28.18-.52.06-.24-.12-1.02-.36-1.94-1.15-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.49.1-.1.24-.26.36-.39.12-.13.16-.22.24-.37.08-.16.04-.29-.02-.41-.06-.12-.54-1.31-.74-1.8-.2-.48-.41-.42-.54-.43h-.46c-.16 0-.41.06-.62.29-.22.24-.84.82-.84 2.01s.86 2.34.98 2.5c.12.16 1.7 2.65 4.12 3.72.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.09.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.05.14-1.15-.06-.1-.22-.16-.46-.28z"/></svg>`;

type EditorMode = 'builder' | 'code';
type PreviewMode = 'desktop' | 'mobile';
type PreviewTheme = 'light' | 'dark' | 'auto';
type TextAlign = 'left' | 'center' | 'right';
type HeaderStyle = 'classic' | 'centered' | 'split';
type FooterStyle = 'classic' | 'simple' | 'dark';
type TemplateKey = 'product-launch' | 'discount-offer' | 'newsletter' | 'festival' | 'new-collection' | 'thank-you' | 'invitation';
type BlockType = 'hero' | 'text' | 'image' | 'button' | 'grid' | 'divider';

interface DesignForm {
  name: string;
  subject: string;
  campaignPurpose: string;
  templateKey: TemplateKey;
  editorMode: EditorMode;
  body_html: string;
  use_header: boolean;
  use_footer: boolean;
  headerStyle: HeaderStyle;
  footerStyle: FooterStyle;
  logoUrl: string;
  brandName: string;
  brandColor: string;
  accentColor: string;
  buttonColor: string;
  backgroundColor: string;
  sectionBg: string;
  textColor: string;
  footerBg: string;
  fontFamily: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  contactWebsite: string;
  whatsappUrl: string;
  unsubscribeUrl: string;
}

interface HeroBlock {
  id: string;
  type: 'hero';
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  layout: 'center' | 'split-left' | 'split-right';
}

interface TextBlock {
  id: string;
  type: 'text';
  heading: string;
  content: string;
  align: TextAlign;
}

interface ImageBlock {
  id: string;
  type: 'image';
  imageUrl: string;
  alt: string;
  caption: string;
  link: string;
}

interface ButtonBlock {
  id: string;
  type: 'button';
  text: string;
  link: string;
  align: TextAlign;
}

interface GridItem {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  link: string;
  ctaText: string;
}

interface GridBlock {
  id: string;
  type: 'grid';
  title: string;
  subtitle: string;
  columns: 2 | 3;
  items: GridItem[];
}

interface DividerBlock {
  id: string;
  type: 'divider';
  color: string;
}

type Block = HeroBlock | TextBlock | ImageBlock | ButtonBlock | GridBlock | DividerBlock;

const FONT_OPTIONS = [
  '"Segoe UI", Arial, sans-serif',
  'Georgia, serif',
  '"Trebuchet MS", Arial, sans-serif',
  'Verdana, Arial, sans-serif',
];

const SOCIAL_LINKS = [
  { label: 'Facebook', url: 'https://www.facebook.com/leadingedge.bd', svg: FB_SVG },
  { label: 'Instagram', url: 'https://www.instagram.com/leadingedgebd/', svg: IG_SVG },
  { label: 'X / Twitter', url: 'https://x.com/Leadingedge_bd', svg: X_SVG },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/company/107868953/', svg: LI_SVG },
  { label: 'WhatsApp', url: 'https://wa.me/8801759993888', svg: WA_SVG },
];

const TEMPLATE_LIBRARY: Array<{ key: TemplateKey; title: string; description: string; purpose: string }> = [
  { key: 'product-launch', title: 'Product Launch', description: 'Announce a new product or collection.', purpose: 'New launch' },
  { key: 'discount-offer', title: 'Discount Offer', description: 'Promote a sale, coupon, or limited offer.', purpose: 'Discount campaign' },
  { key: 'newsletter', title: 'Newsletter', description: 'Share updates, highlights, and news.', purpose: 'Newsletter' },
  { key: 'festival', title: 'Festival Campaign', description: 'Celebrate seasonal and festive promotions.', purpose: 'Festival offer' },
  { key: 'new-collection', title: 'New Collection', description: 'Showcase a new range of products.', purpose: 'Product promotion' },
  { key: 'thank-you', title: 'Thank You', description: 'Send customer appreciation emails.', purpose: 'Customer update' },
  { key: 'invitation', title: 'Event Invitation', description: 'Invite customers to a showroom or event.', purpose: 'Event invitation' },
];

const isTemplateKey = (value: unknown): value is TemplateKey =>
  value === 'product-launch' ||
  value === 'discount-offer' ||
  value === 'newsletter' ||
  value === 'festival' ||
  value === 'new-collection' ||
  value === 'thank-you' ||
  value === 'invitation';

const DEFAULT_FORMS: DesignForm = {
  name: 'New Design',
  subject: 'Your next campaign starts here',
  campaignPurpose: 'Product promotion',
  templateKey: 'product-launch',
  editorMode: 'builder',
  body_html: '<h2 style="color:#1e293b">Hello valued customer!</h2>\n<p style="color:#475569; line-height:1.7;">Thank you for being with us.</p>',
  use_header: true,
  use_footer: true,
  headerStyle: 'classic',
  footerStyle: 'classic',
  logoUrl: LOGO_BLACK_URL,
  brandName: 'Leading Edge',
  brandColor: '#ea580c',
  accentColor: '#f97316',
  buttonColor: '#ea580c',
  backgroundColor: '#f4f4f5',
  sectionBg: '#ffffff',
  textColor: '#334155',
  footerBg: '#0f172a',
  fontFamily: '"Segoe UI", Arial, sans-serif',
  contactAddress: 'H-78/1, Bir Uttom Ziaur Rahman Shorok, Moakhali, Dhaka-1212',
  contactPhone: '01759-993888',
  contactEmail: 'sales@leadingedge.com.bd',
  contactWebsite: 'https://leadingedge.com.bd',
  whatsappUrl: 'https://wa.me/8801759993888',
  unsubscribeUrl: 'https://leadingedge.com.bd/unsubscribe',
};

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const htmlWithBreaks = (value: string) => escapeHtml(value).replace(/\n/g, '<br />');

const socialIcon = (href: string, svg: string, label: string) =>
  `<a href="${href}" title="${label}" style="display:inline-block;margin:0 4px;text-decoration:none;">` +
  `<span style="display:inline-block;width:38px;height:38px;background:rgba(255,255,255,0.14);border-radius:50%;padding:10px;box-sizing:border-box;vertical-align:middle;">${svg}</span>` +
  `</a>`;

const buildHeroBlock = (overrides: Partial<HeroBlock> = {}): HeroBlock => ({
  id: createId(),
  type: 'hero',
  badge: 'New Arrival',
  title: 'Introducing NISKO Kitchen Collection',
  subtitle: 'Modern kitchen solutions designed for stylish homes.',
  description: 'Showcase your best offer with a clear headline, supporting copy, and a strong call to action.',
  ctaText: 'Explore Now',
  ctaLink: 'https://leadingedge.com.bd',
  imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80',
  layout: 'split-left',
  ...overrides,
});

const buildTextBlock = (overrides: Partial<TextBlock> = {}): TextBlock => ({
  id: createId(),
  type: 'text',
  heading: 'Why customers will notice this email',
  content: 'Use short paragraphs, clear headings, and simple language to keep attention high. Add personalization tokens like {{first_name}} to make the message more relevant.',
  align: 'left',
  ...overrides,
});

const buildImageBlock = (overrides: Partial<ImageBlock> = {}): ImageBlock => ({
  id: createId(),
  type: 'image',
  imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  alt: 'Promotional image',
  caption: 'Add product photography, lifestyle imagery, or seasonal banners.',
  link: 'https://leadingedge.com.bd',
  ...overrides,
});

const buildButtonBlock = (overrides: Partial<ButtonBlock> = {}): ButtonBlock => ({
  id: createId(),
  type: 'button',
  text: 'Shop Now',
  link: 'https://leadingedge.com.bd',
  align: 'center',
  ...overrides,
});

const buildGridBlock = (columns: 2 | 3, overrides: Partial<GridBlock> = {}): GridBlock => ({
  id: createId(),
  type: 'grid',
  title: columns === 3 ? 'Featured Products' : 'Recommended Products',
  subtitle: 'Use this area for product cards, offers, or highlights.',
  columns,
  items: [
    {
      title: 'NISKO Modular Cabinet',
      description: 'Elegant storage solution for modern homes.',
      price: 'Tk 45,000',
      imageUrl: 'https://images.unsplash.com/photo-1588854337113-19f0c9e4d1a6?auto=format&fit=crop&w=900&q=80',
      link: 'https://leadingedge.com.bd',
      ctaText: 'View Details',
    },
    {
      title: 'Premium Island Counter',
      description: 'Create a brighter, more functional kitchen layout.',
      price: 'Tk 68,000',
      imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80',
      link: 'https://leadingedge.com.bd',
      ctaText: 'Shop Now',
    },
    {
      title: 'Custom Storage Tower',
      description: 'Ideal for compact and premium interiors.',
      price: 'Tk 35,000',
      imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
      link: 'https://leadingedge.com.bd',
      ctaText: 'Learn More',
    },
  ].slice(0, columns),
  ...overrides,
});

const buildDividerBlock = (overrides: Partial<DividerBlock> = {}): DividerBlock => ({
  id: createId(),
  type: 'divider',
  color: '#e2e8f0',
  ...overrides,
});

const toStringValue = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);

const normalizeLoadedBlocks = (rawBlocks: unknown, templateKey: TemplateKey): Block[] => {
  if (!Array.isArray(rawBlocks)) return buildDefaultBlocks(templateKey);

  const normalized = rawBlocks
    .map((raw): Block | null => {
      if (!raw || typeof raw !== 'object') return null;
      const block = raw as Record<string, unknown>;
      const type = block.type;
      const id = toStringValue(block.id, createId());

      if (type === 'hero') {
        const layout = block.layout === 'split-left' || block.layout === 'split-right' ? block.layout : 'center';
        return buildHeroBlock({
          id,
          badge: toStringValue(block.badge, 'Featured Update'),
          title: toStringValue(block.title, 'Big announcement for your audience'),
          subtitle: toStringValue(block.subtitle, 'Use this section for your most important message.'),
          description: toStringValue(block.description, ''),
          ctaText: toStringValue(block.ctaText, 'Learn More'),
          ctaLink: toStringValue(block.ctaLink, 'https://leadingedge.com.bd'),
          imageUrl: toStringValue(block.imageUrl, 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80'),
          layout,
        });
      }

      if (type === 'text') {
        const align = block.align === 'left' || block.align === 'right' ? block.align : 'center';
        return buildTextBlock({
          id,
          heading: toStringValue(block.heading, 'Section heading'),
          content: toStringValue(block.content, ''),
          align,
        });
      }

      if (type === 'image') {
        return buildImageBlock({
          id,
          imageUrl: toStringValue(block.imageUrl, 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80'),
          alt: toStringValue(block.alt, 'Campaign image'),
          caption: toStringValue(block.caption, ''),
          link: toStringValue(block.link, 'https://leadingedge.com.bd'),
        });
      }

      if (type === 'button') {
        const align = block.align === 'left' || block.align === 'right' ? block.align : 'center';
        return buildButtonBlock({
          id,
          text: toStringValue(block.text, 'Explore Now'),
          link: toStringValue(block.link, 'https://leadingedge.com.bd'),
          align,
        });
      }

      if (type === 'grid') {
        const columns = block.columns === 3 ? 3 : 2;
        const fallback = buildGridBlock(columns, { id });
        const rawItems = Array.isArray(block.items) ? block.items : [];
        const items = rawItems.slice(0, columns).map((item, index) => {
          const src = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
          const base = fallback.items[index] || fallback.items[0];
          return {
            title: toStringValue(src.title, base.title),
            description: toStringValue(src.description, base.description),
            price: toStringValue(src.price, base.price),
            imageUrl: toStringValue(src.imageUrl, base.imageUrl),
            link: toStringValue(src.link, base.link),
            ctaText: toStringValue(src.ctaText, base.ctaText),
          };
        });

        return buildGridBlock(columns, {
          id,
          title: toStringValue(block.title, fallback.title),
          subtitle: toStringValue(block.subtitle, fallback.subtitle),
          columns,
          items: items.length ? items : fallback.items,
        });
      }

      if (type === 'divider') {
        return buildDividerBlock({
          id,
          color: toStringValue(block.color, '#e2e8f0'),
        });
      }

      return null;
    })
    .filter((block): block is Block => Boolean(block));

  return normalized.length ? normalized : buildDefaultBlocks(templateKey);
};

const buildDefaultBlocks = (templateKey: TemplateKey): Block[] => {
  switch (templateKey) {
    case 'discount-offer':
      return [
        buildHeroBlock({ badge: 'Limited Offer', title: 'Save More with Our Seasonal Discount', subtitle: 'Create urgency with a bold offer and a direct CTA.', ctaText: 'View Offer', layout: 'center' }),
        buildTextBlock({ heading: 'Exclusive campaign highlight', content: 'Use this space to explain the offer, the deadline, and any terms customers should know before clicking.' }),
        buildGridBlock(2, { title: 'Top Picks on Offer', subtitle: 'Show a couple of featured items with pricing or discounts.' }),
        buildButtonBlock({ text: 'Claim Discount', align: 'center' }),
        buildDividerBlock(),
      ];
    case 'newsletter':
      return [
        buildHeroBlock({ badge: 'Monthly Update', title: 'This Month in Review', subtitle: 'A clean newsletter layout that keeps readers moving.', ctaText: 'Read More', layout: 'center' }),
        buildTextBlock({ heading: 'What is new?', content: 'Share news, project milestones, product improvements, and useful links in short readable sections.' }),
        buildImageBlock(),
        buildButtonBlock({ text: 'Visit Website' }),
        buildDividerBlock(),
      ];
    case 'festival':
      return [
        buildHeroBlock({ badge: 'Festival Special', title: 'Celebrate the Season with Style', subtitle: 'Use bright visuals and a festive message that feels timely.', ctaText: 'Explore Festival Deals', layout: 'split-right' }),
        buildTextBlock({ heading: 'Seasonal campaign message', content: 'Add a warm greeting, seasonal imagery, and a CTA that leads straight to the relevant offer page.' }),
        buildGridBlock(3, { title: 'Festival Collection', subtitle: 'Highlight several related products or bundles.' }),
        buildButtonBlock({ text: 'Shop Festival Collection' }),
      ];
    case 'new-collection':
      return [
        buildHeroBlock({ badge: 'New Collection', title: 'Fresh Designs for Modern Living', subtitle: 'Perfect for a new range or product line launch.', ctaText: 'Browse Collection', layout: 'split-left' }),
        buildGridBlock(3, { title: 'Featured Designs', subtitle: 'Showcase the best examples from the new range.' }),
        buildTextBlock({ heading: 'Why this collection matters', content: 'Explain the inspiration, materials, craftsmanship, or key differentiators to help customers understand the value.' }),
        buildButtonBlock({ text: 'Explore Collection' }),
      ];
    case 'thank-you':
      return [
        buildHeroBlock({ badge: 'Customer Appreciation', title: 'Thank You for Choosing Us', subtitle: 'Use appreciation emails to keep customers engaged after purchase.', ctaText: 'See What’s New', layout: 'center' }),
        buildTextBlock({ heading: 'A short note of gratitude', content: 'Thank the customer, reinforce trust, and share a next step or recommended offer.' }),
        buildButtonBlock({ text: 'Continue Shopping' }),
        buildDividerBlock(),
      ];
    case 'invitation':
      return [
        buildHeroBlock({ badge: 'Save the Date', title: 'You Are Invited to Our Showroom Event', subtitle: 'Invite customers to an opening, demo, or appointment.', ctaText: 'Register Now', layout: 'split-right' }),
        buildTextBlock({ heading: 'Event details', content: 'Mention the date, venue, purpose, and what attendees can expect when they arrive.' }),
        buildImageBlock({ caption: 'Use a venue or event hero image to create interest.' }),
        buildButtonBlock({ text: 'Book a Slot' }),
      ];
    case 'product-launch':
    default:
      return [
        buildHeroBlock(),
        buildTextBlock(),
        buildGridBlock(2),
        buildButtonBlock(),
        buildDividerBlock(),
      ];
  }
};

const applyTemplatePreset = (templateKey: TemplateKey): { form: DesignForm; blocks: Block[] } => {
  const base = { ...DEFAULT_FORMS, templateKey, editorMode: 'builder' as const };

  switch (templateKey) {
    case 'discount-offer':
      return { form: { ...base, name: 'Discount Offer', subject: 'Limited-time discount just for you', campaignPurpose: 'Discount campaign', brandColor: '#dc2626', accentColor: '#ef4444', buttonColor: '#dc2626', backgroundColor: '#fff7ed', sectionBg: '#ffffff' }, blocks: buildDefaultBlocks(templateKey) };
    case 'newsletter':
      return { form: { ...base, name: 'Newsletter Update', subject: 'Latest news and updates from our team', campaignPurpose: 'Newsletter', brandColor: '#1d4ed8', accentColor: '#2563eb', buttonColor: '#1d4ed8', backgroundColor: '#eff6ff', sectionBg: '#ffffff' }, blocks: buildDefaultBlocks(templateKey) };
    case 'festival':
      return { form: { ...base, name: 'Festival Campaign', subject: 'Celebrate the season with exclusive offers', campaignPurpose: 'Festival offer', brandColor: '#7c3aed', accentColor: '#8b5cf6', buttonColor: '#7c3aed', backgroundColor: '#faf5ff', sectionBg: '#ffffff' }, blocks: buildDefaultBlocks(templateKey) };
    case 'new-collection':
      return { form: { ...base, name: 'New Collection Launch', subject: 'Discover our new collection today', campaignPurpose: 'New launch', brandColor: '#0f766e', accentColor: '#14b8a6', buttonColor: '#0f766e', backgroundColor: '#f0fdfa', sectionBg: '#ffffff' }, blocks: buildDefaultBlocks(templateKey) };
    case 'thank-you':
      return { form: { ...base, name: 'Customer Thank You', subject: 'Thank you for being with us', campaignPurpose: 'Customer update', brandColor: '#ca8a04', accentColor: '#eab308', buttonColor: '#ca8a04', backgroundColor: '#fffbeb', sectionBg: '#ffffff' }, blocks: buildDefaultBlocks(templateKey) };
    case 'invitation':
      return { form: { ...base, name: 'Event Invitation', subject: 'Join us for our upcoming event', campaignPurpose: 'Event invitation', brandColor: '#0f172a', accentColor: '#475569', buttonColor: '#0f172a', backgroundColor: '#f8fafc', sectionBg: '#ffffff' }, blocks: buildDefaultBlocks(templateKey) };
    case 'product-launch':
    default:
      return { form: { ...base, name: 'Product Launch', subject: 'Introducing our latest collection', campaignPurpose: 'Product promotion', brandColor: '#ea580c', accentColor: '#f97316', buttonColor: '#ea580c', backgroundColor: '#f4f4f5', sectionBg: '#ffffff' }, blocks: buildDefaultBlocks(templateKey) };
  }
};

const buildHeaderHtml = (form: DesignForm) => {
  if (!form.use_header) return '';

  if (form.headerStyle === 'split') {
    return `
      <div style="background:${form.sectionBg};padding:18px 24px;border-bottom:2px solid ${form.brandColor};display:flex;justify-content:space-between;align-items:center;gap:16px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <img src="${form.logoUrl || LOGO_BLACK_URL}" alt="${escapeHtml(form.brandName)}" style="max-height:50px;max-width:180px;display:block;" />
          <div style="font-size:15px;font-weight:700;color:${form.textColor};">${escapeHtml(form.brandName)}</div>
        </div>
        <div style="font-size:12px;color:${form.textColor};text-align:right;">${escapeHtml(form.campaignPurpose)}</div>
      </div>`;
  }

  if (form.headerStyle === 'centered') {
    return `
      <div style="background:${form.sectionBg};padding:20px 24px;border-bottom:2px solid ${form.brandColor};text-align:center;">
        <img src="${form.logoUrl || LOGO_BLACK_URL}" alt="${escapeHtml(form.brandName)}" style="max-height:54px;max-width:220px;display:block;margin:0 auto 8px;" />
        <div style="font-size:16px;font-weight:700;color:${form.textColor};">${escapeHtml(form.brandName)}</div>
        <div style="font-size:12px;color:${form.textColor};opacity:0.8;margin-top:3px;">${escapeHtml(form.campaignPurpose)}</div>
      </div>`;
  }

  return `
    <div style="background:${form.sectionBg};padding:16px 24px;border-bottom:2px solid ${form.brandColor};text-align:center;">
      <img src="${form.logoUrl || LOGO_BLACK_URL}" alt="${escapeHtml(form.brandName)}" style="max-height:50px;max-width:200px;display:block;margin:0 auto;" />
    </div>`;
};

const buildFooterHtml = (form: DesignForm) => {
  if (!form.use_footer) return '';

  if (form.footerStyle === 'simple') {
    return `
      <div style="background:${form.footerBg};padding:24px;text-align:center;color:#cbd5e1;font-size:13px;line-height:1.7;">
        <div style="font-weight:700;color:#ffffff;margin-bottom:4px;">${escapeHtml(form.brandName)}</div>
        <div>${escapeHtml(form.contactAddress)}</div>
        <div>${escapeHtml(form.contactPhone)} · ${escapeHtml(form.contactEmail)}</div>
        <div><a href="${escapeHtml(form.contactWebsite)}" style="color:#93c5fd;text-decoration:none;">${escapeHtml(form.contactWebsite)}</a></div>
        <div style="margin-top:10px;">${SOCIAL_LINKS.map(link => socialIcon(link.url, link.svg, link.label)).join('')}</div>
        <div style="margin-top:12px;font-size:11px;opacity:0.8;">If you no longer wish to receive these emails, <a href="${escapeHtml(form.unsubscribeUrl)}" style="color:#93c5fd;text-decoration:none;">unsubscribe here</a>.</div>
      </div>`;
  }

  if (form.footerStyle === 'dark') {
    return `
      <div style="background:${form.footerBg};padding:30px 24px 24px;text-align:center;color:#94a3b8;font-size:13px;line-height:1.7;">
        <div style="font-size:17px;font-weight:700;color:#f8fafc;margin-bottom:4px;">${escapeHtml(form.brandName)}</div>
        <div style="margin-bottom:4px;">${escapeHtml(form.contactAddress)}</div>
        <div style="margin-bottom:4px;">${escapeHtml(form.contactPhone)} · ${escapeHtml(form.contactEmail)}</div>
        <div><a href="${escapeHtml(form.contactWebsite)}" style="color:#93c5fd;text-decoration:none;">${escapeHtml(form.contactWebsite)}</a></div>
        <div style="margin-top:14px;">${SOCIAL_LINKS.map(link => socialIcon(link.url, link.svg, link.label)).join('')}</div>
        <div style="margin-top:16px;font-size:11px;border-top:1px solid rgba(255,255,255,0.08);padding-top:12px;">&copy; ${new Date().getFullYear()} ${escapeHtml(form.brandName)}. All rights reserved.</div>
      </div>`;
  }

  return `
    <div style="background:${form.footerBg};padding:32px 24px 24px;text-align:center;color:#94a3b8;font-size:13px;line-height:1.7;">
      <div style="font-size:17px;font-weight:700;color:#f8fafc;margin-bottom:6px;">${escapeHtml(form.brandName)}</div>
      <div style="margin-bottom:4px;"><a href="https://maps.app.goo.gl/FaFjLs4K25RE3wip7" style="color:#93c5fd;text-decoration:none;">${escapeHtml(form.contactAddress)}</a></div>
      <div style="margin-bottom:4px;"><a href="tel:${escapeHtml(form.contactPhone)}" style="color:#94a3b8;text-decoration:none;">&#128222; ${escapeHtml(form.contactPhone)}</a></div>
      <div style="margin-bottom:4px;"><a href="${escapeHtml(form.contactWebsite)}" style="color:#93c5fd;text-decoration:none;">${escapeHtml(form.contactWebsite)}</a> &nbsp;&bull;&nbsp; <a href="mailto:${escapeHtml(form.contactEmail)}" style="color:#93c5fd;text-decoration:none;">${escapeHtml(form.contactEmail)}</a></div>
      <div style="margin:14px 0 18px;font-size:0;">${SOCIAL_LINKS.map(link => socialIcon(link.url, link.svg, link.label)).join('')}</div>
      <div style="font-size:11px;color:#64748b;border-top:1px solid rgba(255,255,255,0.08);padding-top:12px;">If you no longer wish to receive these emails, <a href="${escapeHtml(form.unsubscribeUrl)}" style="color:#93c5fd;text-decoration:none;">unsubscribe here</a>.</div>
    </div>`;
};

const buildBlockHtml = (block: Block, form: DesignForm) => {
  switch (block.type) {
    case 'hero': {
      const button = block.ctaText ? `<a href="${escapeHtml(block.ctaLink)}" style="display:inline-block;background:${form.buttonColor};color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;">${escapeHtml(block.ctaText)}</a>` : '';
      const image = block.imageUrl ? `<img src="${escapeHtml(block.imageUrl)}" alt="${escapeHtml(block.title)}" style="width:100%;max-width:100%;border-radius:18px;display:block;" />` : '';

      if (block.layout === 'split-left' || block.layout === 'split-right') {
        const imageCell = `<td style="width:50%;vertical-align:middle;padding:${block.layout === 'split-left' ? '0 0 0 18px' : '0 18px 0 0'};">${image}</td>`;
        const textCell = `
          <td style="width:50%;vertical-align:middle;padding:${block.layout === 'split-left' ? '0 18px 0 0' : '0 0 0 18px'};color:${form.textColor};">
            <div style="display:inline-block;background:${form.accentColor};color:#ffffff;font-size:11px;font-weight:700;letter-spacing:0.08em;padding:6px 10px;border-radius:999px;margin-bottom:12px;">${escapeHtml(block.badge)}</div>
            <h1 style="margin:0 0 10px;font-size:30px;line-height:1.15;color:${form.textColor};">${escapeHtml(block.title)}</h1>
            <div style="font-size:16px;line-height:1.6;margin-bottom:8px;color:${form.textColor};opacity:0.88;">${escapeHtml(block.subtitle)}</div>
            <p style="margin:0 0 18px;font-size:15px;line-height:1.7;opacity:0.9;">${escapeHtml(block.description)}</p>
            ${button}
          </td>`;
        return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;"><tr>${block.layout === 'split-left' ? textCell + imageCell : imageCell + textCell}</tr></table>`;
      }

      return `
        <div style="text-align:center;color:${form.textColor};">
          <div style="display:inline-block;background:${form.accentColor};color:#ffffff;font-size:11px;font-weight:700;letter-spacing:0.08em;padding:6px 10px;border-radius:999px;margin-bottom:14px;">${escapeHtml(block.badge)}</div>
          <h1 style="margin:0 0 10px;font-size:34px;line-height:1.12;color:${form.textColor};">${escapeHtml(block.title)}</h1>
          <div style="font-size:17px;line-height:1.6;margin-bottom:8px;opacity:0.9;">${escapeHtml(block.subtitle)}</div>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;opacity:0.9;">${escapeHtml(block.description)}</p>
          ${image ? `<div style="margin:18px 0 20px;">${image}</div>` : ''}
          ${button}
        </div>`;
    }
    case 'text':
      return `
        <div style="text-align:${block.align};color:${form.textColor};">
          <h2 style="margin:0 0 10px;font-size:24px;line-height:1.25;color:${form.textColor};">${escapeHtml(block.heading)}</h2>
          <div style="font-size:15px;line-height:1.8;">${htmlWithBreaks(block.content)}</div>
        </div>`;
    case 'image': {
      const image = `<img src="${escapeHtml(block.imageUrl)}" alt="${escapeHtml(block.alt)}" style="width:100%;border-radius:16px;display:block;" />`;
      return `
        <div style="text-align:center;">
          ${block.link ? `<a href="${escapeHtml(block.link)}" style="text-decoration:none;">${image}</a>` : image}
          ${block.caption ? `<div style="margin-top:8px;font-size:13px;line-height:1.6;color:${form.textColor};opacity:0.78;">${escapeHtml(block.caption)}</div>` : ''}
        </div>`;
    }
    case 'button':
      return `
        <div style="text-align:${block.align};">
          <a href="${escapeHtml(block.link)}" style="display:inline-block;background:${form.buttonColor};color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:700;">${escapeHtml(block.text)}</a>
        </div>`;
    case 'grid': {
      const width = block.columns === 3 ? '33.333%' : '50%';
      const itemsHtml = block.items.map(item => `
        <td class="stack-col" style="width:${width};vertical-align:top;padding:10px;">
          <div style="background:${form.sectionBg};border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;height:100%;">
            <a href="${escapeHtml(item.link)}" style="text-decoration:none;color:inherit;display:block;">
              <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title)}" style="width:100%;height:220px;object-fit:cover;display:block;" />
            </a>
            <div style="padding:16px;">
              <div style="font-size:17px;font-weight:700;color:${form.textColor};margin-bottom:6px;">${escapeHtml(item.title)}</div>
              <div style="font-size:14px;line-height:1.7;color:${form.textColor};opacity:0.85;margin-bottom:8px;">${escapeHtml(item.description)}</div>
              <div style="font-size:16px;font-weight:700;color:${form.brandColor};margin-bottom:12px;">${escapeHtml(item.price)}</div>
              <a href="${escapeHtml(item.link)}" style="display:inline-block;background:${form.buttonColor};color:#ffffff;text-decoration:none;padding:10px 16px;border-radius:999px;font-weight:700;font-size:13px;">${escapeHtml(item.ctaText)}</a>
            </div>
          </div>
        </td>`).join('');

      return `
        <div>
          <h2 style="margin:0 0 6px;font-size:24px;line-height:1.25;color:${form.textColor};text-align:center;">${escapeHtml(block.title)}</h2>
          <div style="font-size:14px;line-height:1.7;color:${form.textColor};opacity:0.85;text-align:center;margin-bottom:14px;">${escapeHtml(block.subtitle)}</div>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr>${itemsHtml}</tr>
          </table>
          <style>@media only screen and (max-width: 640px) {.stack-col { width: 100% !important; display: block !important; }}</style>
        </div>`;
    }
    case 'divider':
      return `<hr style="border:none;border-top:1px solid ${block.color};margin:8px 0;" />`;
    default:
      return '';
  }
};

const buildBuilderBodyHtml = (form: DesignForm, blocks: Block[]) => blocks.map(block => `<div style="margin-bottom:24px;">${buildBlockHtml(block, form)}</div>`).join('');

const buildEmailHtml = (bodyHtml: string, form: DesignForm): string => {
  const header = buildHeaderHtml(form);
  const footer = buildFooterHtml(form);

  return `<!DOCTYPE html><html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><style>
    body{margin:0;padding:0;background:${form.backgroundColor};font-family:${form.fontFamily};-webkit-text-size-adjust:100%;}
    img{border:0;max-width:100%;height:auto;}
    @media only screen and (max-width: 640px) {
      .email-shell{padding:12px !important;}
      .email-card{border-radius:20px !important;}
      .email-body{padding:20px !important;}
      .stack-col{width:100% !important;display:block !important;}
      .hero-split td{display:block !important;width:100% !important;padding:0 !important;}
    }
  </style></head><body><div class="email-shell" style="background:${form.backgroundColor};padding:20px 10px;">
    <div class="email-card" style="max-width:760px;margin:0 auto;background:${form.sectionBg};border-radius:18px;overflow:hidden;box-shadow:0 8px 32px rgba(15,23,42,0.08);">
      ${header}
      <div class="email-body" style="padding:28px 32px;color:${form.textColor};font-size:15px;line-height:1.7;">
        ${bodyHtml}
      </div>
      ${footer}
    </div>
  </div></body></html>`;
};

const convertLegacyDesignToBuilder = (design: any): { form: DesignForm; blocks: Block[] } => {
  const preset = applyTemplatePreset((design.templateKey || 'product-launch') as TemplateKey);
  return {
    form: {
      ...preset.form,
      name: design.name || preset.form.name,
      subject: design.subject || preset.form.subject,
      body_html: design.body_html || preset.form.body_html,
      use_header: design.use_header === 1,
      use_footer: design.use_footer === 1,
      logoUrl: design.email_theme === 'dark' ? LOGO_WHITE_URL : LOGO_BLACK_URL,
    },
    blocks: preset.blocks,
  };
};

const MailDesign: React.FC = () => {
  const [designs, setDesigns] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [previewTheme, setPreviewTheme] = useState<PreviewTheme>('light');
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [designFilter, setDesignFilter] = useState<'all' | 'templates' | 'designs'>('all');
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [formData, setFormData] = useState<DesignForm>(DEFAULT_FORMS);
  const [blocks, setBlocks] = useState<Block[]>(buildDefaultBlocks(DEFAULT_FORMS.templateKey));

  const api = () => (window as any).electronAPI;

  const loadDesigns = () => {
    try {
      console.log('[MailDesign] Loading designs...');
      const result = api()?.getDesigns?.();
      if (result?.then) {
        result.then((res: any) => {
          console.log('[MailDesign] Designs loaded:', res?.length || 0);
          setDesigns(res || []);
        }).catch((err: any) => {
          console.error('[MailDesign] Error loading designs:', err);
          setDesigns([]);
        });
      } else if (Array.isArray(result)) {
        console.log('[MailDesign] Designs loaded (sync):', result.length);
        setDesigns(result);
      } else {
        console.warn('[MailDesign] electronAPI.getDesigns not available');
        setDesigns([]);
      }
    } catch (error) {
      console.error('[MailDesign] Error in loadDesigns:', error);
      setDesigns([]);
    }
  };

  useEffect(() => {
    loadDesigns();
  }, []);

  const updateBlock = (blockId: string, updater: (block: Block) => Block) => {
    setBlocks(prev => prev.map(block => (block.id === blockId ? updater(block) : block)));
  };

  const addBlock = (type: BlockType) => {
    let next: Block;
    switch (type) {
      case 'hero': next = buildHeroBlock(); break;
      case 'text': next = buildTextBlock(); break;
      case 'image': next = buildImageBlock(); break;
      case 'button': next = buildButtonBlock(); break;
      case 'grid': next = buildGridBlock(2); break;
      case 'divider': next = buildDividerBlock(); break;
      default: next = buildTextBlock(); break;
    }
    setBlocks(prev => [...prev, next]);
    setSelectedBlockId(next.id);
    setFormData(prev => ({ ...prev, editorMode: 'builder' }));
  };

  const moveBlock = (blockId: string, direction: -1 | 1) => {
    setBlocks(prev => {
      const currentIndex = prev.findIndex(block => block.id === blockId);
      const targetIndex = currentIndex + direction;
      if (currentIndex < 0 || targetIndex < 0 || targetIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const removeBlock = (blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
    if (selectedBlockId === blockId) setSelectedBlockId(null);
  };

  const duplicateBlock = (blockId: string) => {
    const block = blocks.find(item => item.id === blockId);
    if (!block) return;
    const cloned = JSON.parse(JSON.stringify(block)) as Block;
    cloned.id = createId();
    setBlocks(prev => {
      const index = prev.findIndex(item => item.id === blockId);
      const next = [...prev];
      next.splice(index + 1, 0, cloned);
      return next;
    });
    setSelectedBlockId(cloned.id);
  };

  const applyPreset = (templateKey: TemplateKey) => {
    const preset = applyTemplatePreset(templateKey);
    setFormData(preset.form);
    setBlocks(preset.blocks);
    setEditingId(null);
    setSelectedBlockId(preset.blocks[0]?.id || null);
    setShowPreview(false);
    setFeedback({ type: 'info', message: `Loaded ${TEMPLATE_LIBRARY.find(item => item.key === templateKey)?.title || 'template'} preset.` });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked } as DesignForm));
      return;
    }

    if (name === 'templateKey') {
      applyPreset(value as TemplateKey);
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value } as DesignForm));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, onLoaded: (dataUrl: string) => void) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onLoaded(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const handleSave = async (saveAsTemplate = false) => {
    const generatedBody = formData.editorMode === 'builder' ? buildBuilderBodyHtml(formData, blocks) : formData.body_html;
    const payload = {
      name: formData.name,
      subject: formData.subject,
      body_html: buildEmailHtml(generatedBody, formData),
      builder_json: JSON.stringify({ formData, blocks, editorMode: formData.editorMode }),
      use_header: formData.use_header ? 1 : 0,
      use_footer: formData.use_footer ? 1 : 0,
      email_theme: 'custom',
      is_template: saveAsTemplate ? 1 : 0,
    };

    if (editingId && !saveAsTemplate) {
      api()?.updateDesign(editingId, payload);
      setFeedback({ type: 'success', message: 'Design updated.' });
    } else {
      api()?.saveDesign(payload);
      setFeedback({ type: 'success', message: saveAsTemplate ? 'Template saved.' : 'Design saved.' });
    }

    setTimeout(() => loadDesigns(), 250);
  };

  const handleEdit = (design: any) => {
    try {
      console.log('[MailDesign] handleEdit called for design:', design.id);
      
      // Always reset preview mode
      setShowPreview(false);
      setFeedback(null);

      let nextForm: DesignForm = { ...DEFAULT_FORMS };
      let nextBlocks: Block[] = buildDefaultBlocks(DEFAULT_FORMS.templateKey);
      let usedMode: 'builder' | 'legacy' = 'builder';

      if (design.builder_json) {
        try {
          const parsed = JSON.parse(design.builder_json);
          console.log('[MailDesign] Successfully parsed builder_json');
          
          const parsedTemplateKey = isTemplateKey(parsed?.formData?.templateKey) ? parsed.formData.templateKey : DEFAULT_FORMS.templateKey;

          nextForm = {
            ...DEFAULT_FORMS,
            ...(parsed.formData || {}),
            templateKey: parsedTemplateKey,
            name: design.name,
            subject: design.subject,
            body_html: design.body_html || DEFAULT_FORMS.body_html,
            use_header: design.use_header === 1,
            use_footer: design.use_footer === 1,
            editorMode: 'builder', // Explicitly set builder mode
          };

          nextBlocks = normalizeLoadedBlocks(parsed.blocks, parsedTemplateKey);
          usedMode = 'builder';
        } catch (parseError) {
          console.warn('[MailDesign] Failed to parse builder_json, falling back to legacy:', parseError);
          const legacy = convertLegacyDesignToBuilder(design);
          nextForm = { ...legacy.form, editorMode: 'builder' }; // Use builder mode for legacy too
          nextBlocks = legacy.blocks;
          usedMode = 'legacy';
        }
      } else {
        console.log('[MailDesign] No builder_json, using legacy conversion');
        const legacy = convertLegacyDesignToBuilder(design);
        nextForm = { ...legacy.form, editorMode: 'builder' }; // Use builder mode for legacy too
        nextBlocks = legacy.blocks;
        usedMode = 'legacy';
      }

      console.log('[MailDesign] Setting state - mode:', usedMode, 'blocks:', nextBlocks.length, 'formData.editorMode:', nextForm.editorMode);
      
      // Set all state at once to reduce potential race conditions
      setEditingId(design.id);
      setFormData(nextForm);
      setBlocks(nextBlocks);
      setSelectedBlockId(nextBlocks[0]?.id || null);
      
      console.log('[MailDesign] State updated successfully');
    } catch (error) {
      console.error('[MailDesign] Unexpected error in handleEdit:', error);
      setFeedback({ type: 'error', message: 'Failed to load design. Please try again.' });
    }
  };

  const handleDelete = (id: number) => {
    if (!confirm('Delete this design?')) return;
    api()?.deleteDesign(id);
    setTimeout(() => {
      loadDesigns();
      if (editingId === id) {
        const preset = applyTemplatePreset('product-launch');
        setEditingId(null);
        setFormData(preset.form);
        setBlocks(preset.blocks);
        setSelectedBlockId(preset.blocks[0]?.id || null);
      }
    }, 250);
  };

  const handleNew = () => {
    try {
      console.log('[MailDesign] Creating new design');
      const preset = applyTemplatePreset('product-launch');
      setEditingId(null);
      setShowPreview(false);
      setFeedback(null);
      setFormData({ ...preset.form, editorMode: 'builder' });
      setBlocks(preset.blocks);
      setSelectedBlockId(preset.blocks[0]?.id || null);
      console.log('[MailDesign] New design created successfully');
    } catch (error) {
      console.error('[MailDesign] Error creating new design:', error);
      setFeedback({ type: 'error', message: 'Failed to create new design.' });
    }
  };

  const handleSendTest = async () => {
    if (!testEmailAddress.trim()) {
      setFeedback({ type: 'error', message: 'Enter a test email address first.' });
      return;
    }

    const html = buildEmailHtml(formData.editorMode === 'builder' ? buildBuilderBodyHtml(formData, blocks) : formData.body_html, formData);
    const result = await api()?.sendTestEmail({
      to: testEmailAddress.trim(),
      subject: formData.subject || 'Test Email',
      html,
    });

    if (result?.success) {
      setFeedback({ type: 'success', message: `Test email sent to ${testEmailAddress.trim()}.` });
    } else {
      setFeedback({ type: 'error', message: result?.error || 'Failed to send test email.' });
    }
  };

  const previewHtml = formData.editorMode === 'builder'
    ? buildEmailHtml(buildBuilderBodyHtml(formData, blocks), formData)
    : buildEmailHtml(formData.body_html, formData);

  const previewCss = previewTheme === 'dark'
    ? '<style>html,body{background:#020617!important;color:#e2e8f0!important;} .email-shell{background:#020617!important;} .email-card{background:#111827!important;box-shadow:0 8px 26px rgba(0,0,0,0.45)!important;} .email-body{color:#e2e8f0!important;} a{color:#93c5fd!important;}</style>'
    : previewTheme === 'auto'
      ? '<style>@media (prefers-color-scheme: dark){html,body{background:#020617!important;color:#e2e8f0!important;} .email-shell{background:#020617!important;} .email-card{background:#111827!important;box-shadow:0 8px 26px rgba(0,0,0,0.45)!important;} .email-body{color:#e2e8f0!important;} a{color:#93c5fd!important;}}</style>'
      : '';

  const themedPreviewHtml = previewHtml.includes('</head>')
    ? previewHtml.replace('</head>', `${previewCss}</head>`)
    : `${previewCss}${previewHtml}`;

  const renderBlockEditor = (block: Block) => (
    <div className="mt-3 rounded-xl border border-orange-200 bg-white p-3 space-y-3" onClick={event => event.stopPropagation()}>
      <div className="text-xs font-semibold uppercase tracking-wide text-orange-700">Edit This Section</div>

      {block.type === 'hero' && (
        <>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Badge</label>
            <input value={block.badge} onChange={event => updateBlock(block.id, current => ({ ...(current as HeroBlock), badge: event.target.value }))} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Headline</label>
            <input value={block.title} onChange={event => updateBlock(block.id, current => ({ ...(current as HeroBlock), title: event.target.value }))} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Short Description</label>
            <textarea value={block.description} onChange={event => updateBlock(block.id, current => ({ ...(current as HeroBlock), description: event.target.value }))} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm min-h-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-600 mb-1 block">Button Text</label>
              <input value={block.ctaText} onChange={event => updateBlock(block.id, current => ({ ...(current as HeroBlock), ctaText: event.target.value }))} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-600 mb-1 block">Button Link</label>
              <input value={block.ctaLink} onChange={event => updateBlock(block.id, current => ({ ...(current as HeroBlock), ctaLink: event.target.value }))} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
        </>
      )}

      {block.type === 'text' && (
        <>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Heading</label>
            <input value={block.heading} onChange={event => updateBlock(block.id, current => ({ ...(current as TextBlock), heading: event.target.value }))} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Content</label>
            <textarea value={block.content} onChange={event => updateBlock(block.id, current => ({ ...(current as TextBlock), content: event.target.value }))} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm min-h-28" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Alignment</label>
            <select value={block.align} onChange={event => updateBlock(block.id, current => ({ ...(current as TextBlock), align: event.target.value as TextAlign }))} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm">
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </>
      )}

      {block.type === 'image' && (
        <>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Image URL</label>
            <input value={block.imageUrl} onChange={event => updateBlock(block.id, current => ({ ...(current as ImageBlock), imageUrl: event.target.value }))} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Caption</label>
            <textarea value={block.caption} onChange={event => updateBlock(block.id, current => ({ ...(current as ImageBlock), caption: event.target.value }))} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm min-h-20" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Link</label>
            <input value={block.link} onChange={event => updateBlock(block.id, current => ({ ...(current as ImageBlock), link: event.target.value }))} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </>
      )}

      {block.type === 'button' && (
        <>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Button Text</label>
            <input value={block.text} onChange={event => updateBlock(block.id, current => ({ ...(current as ButtonBlock), text: event.target.value }))} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Button Link</label>
            <input value={block.link} onChange={event => updateBlock(block.id, current => ({ ...(current as ButtonBlock), link: event.target.value }))} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </>
      )}

      {block.type === 'grid' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-600 mb-1 block">Title</label>
              <input value={block.title} onChange={event => updateBlock(block.id, current => ({ ...(current as GridBlock), title: event.target.value }))} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-600 mb-1 block">Columns</label>
              <select value={block.columns} onChange={event => updateBlock(block.id, current => ({ ...(current as GridBlock), columns: Number(event.target.value) as 2 | 3 }))} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm">
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns</option>
              </select>
            </div>
          </div>
          {(block as GridBlock).items.map((item, itemIndex) => (
            <div key={itemIndex} className="rounded-lg border border-stone-200 p-3 bg-stone-50 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-stone-500">Item {itemIndex + 1}</div>
              <input value={item.title} onChange={event => updateBlock(block.id, current => {
                const next = { ...(current as GridBlock) };
                next.items[itemIndex] = { ...next.items[itemIndex], title: event.target.value };
                return next;
              })} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" placeholder="Title" />
              <textarea value={item.description} onChange={event => updateBlock(block.id, current => {
                const next = { ...(current as GridBlock) };
                next.items[itemIndex] = { ...next.items[itemIndex], description: event.target.value };
                return next;
              })} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm min-h-20" placeholder="Description" />
            </div>
          ))}
        </>
      )}

      {block.type === 'divider' && (
        <div>
          <label className="text-xs font-semibold text-stone-600 mb-1 block">Divider Color</label>
          <input type="color" value={block.color} onChange={event => updateBlock(block.id, current => ({ ...(current as DividerBlock), color: event.target.value }))} className="w-full h-10 bg-white border border-stone-300 rounded-lg px-2 py-1" />
        </div>
      )}
    </div>
  );

  const visibleDesigns = designs.filter(design => {
    if (designFilter === 'templates') return design.is_template === 1;
    if (designFilter === 'designs') return design.is_template !== 1;
    return true;
  });

  return (
    <div className="h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden">
      <div className="p-4 xl:p-6 max-w-[1850px] mx-auto flex flex-col 2xl:flex-row gap-5 min-h-full animate-in fade-in duration-500">
      <div className="w-full 2xl:w-84 2xl:shrink-0 bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
        <div className="p-4 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-semibold text-stone-900">Template Library</div>
              <div className="text-xs text-stone-500">Start from a marketing-ready layout.</div>
            </div>
            <button onClick={handleNew} className="p-2 rounded-lg bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors">
              <Plus size={15} />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
            {TEMPLATE_LIBRARY.map(template => (
              <button
                key={template.key}
                onClick={() => applyPreset(template.key)}
                className="text-left p-3 rounded-xl border border-stone-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
              >
                <div className="text-sm font-semibold text-stone-900">{template.title}</div>
                <div className="text-xs text-stone-500 mt-0.5">{template.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-stone-100 flex items-center gap-2 bg-white">
          <button onClick={() => setDesignFilter('all')} className={clsx('px-2.5 py-1.5 text-xs rounded-full border', designFilter === 'all' ? 'bg-orange-100 border-orange-200 text-orange-700' : 'border-stone-200 text-stone-500')}>All</button>
          <button onClick={() => setDesignFilter('templates')} className={clsx('px-2.5 py-1.5 text-xs rounded-full border', designFilter === 'templates' ? 'bg-orange-100 border-orange-200 text-orange-700' : 'border-stone-200 text-stone-500')}>Templates</button>
          <button onClick={() => setDesignFilter('designs')} className={clsx('px-2.5 py-1.5 text-xs rounded-full border', designFilter === 'designs' ? 'bg-orange-100 border-orange-200 text-orange-700' : 'border-stone-200 text-stone-500')}>Designs</button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#f8f5f2]/30">
          {visibleDesigns.length === 0 && <div className="text-center text-xs text-stone-400 p-4">No designs yet.</div>}
          {visibleDesigns.map(design => (
            <div
              key={design.id}
              onClick={() => handleEdit(design)}
              className={clsx(
                'px-3 py-2.5 rounded-xl border cursor-pointer group flex justify-between items-start transition-colors',
                editingId === design.id ? 'bg-orange-50 border-orange-200 shadow-sm' : 'bg-white border-stone-200 hover:border-orange-300'
              )}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-stone-800 truncate max-w-[145px]">{design.name}</div>
                  {design.is_template === 1 && <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Template</span>}
                </div>
                <div className="text-xs text-stone-500 truncate max-w-[145px]">{design.subject || 'No subject'}</div>
              </div>
              <button onClick={event => { event.stopPropagation(); handleDelete(design.id); }} className="text-stone-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center shrink-0 gap-3">
          <div>
            <h2 className="text-lg font-bold text-stone-900">{editingId ? 'Edit Design' : 'New Design'}</h2>
            <p className="text-xs text-stone-500 mt-0.5">Template selection, branding controls, reusable blocks, and test-send support.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="flex items-center gap-2 mr-2 flex-wrap">
              <input
                type="email"
                value={testEmailAddress}
                onChange={event => setTestEmailAddress(event.target.value)}
                placeholder="Test email address"
                className="w-56 max-w-full bg-white border border-stone-300 shadow-sm rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 placeholder:text-stone-400"
              />
              <button onClick={handleSendTest} className="flex items-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white text-sm font-medium rounded-lg transition-all">
                <Send size={14} />
                Test Email
              </button>
            </div>
            {showPreview && (
              <div className="flex items-center bg-stone-100 p-1 rounded-lg border border-stone-200 mr-1 flex-wrap gap-1">
                <button onClick={() => setPreviewMode('desktop')} className={clsx('px-2.5 py-1 text-xs rounded font-medium transition-colors flex items-center gap-1', previewMode === 'desktop' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700')}><Monitor size={13} />Desktop</button>
                <button onClick={() => setPreviewMode('mobile')} className={clsx('px-2.5 py-1 text-xs rounded font-medium transition-colors flex items-center gap-1', previewMode === 'mobile' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700')}><Smartphone size={13} />Mobile</button>
                <button onClick={() => setPreviewTheme('light')} className={clsx('px-2.5 py-1 text-xs rounded font-medium transition-colors', previewTheme === 'light' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700')}>Light</button>
                <button onClick={() => setPreviewTheme('dark')} className={clsx('px-2.5 py-1 text-xs rounded font-medium transition-colors', previewTheme === 'dark' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700')}>Dark</button>
                <button onClick={() => setPreviewTheme('auto')} className={clsx('px-2.5 py-1 text-xs rounded font-medium transition-colors', previewTheme === 'auto' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700')}>Auto Phone Mode</button>
              </div>
            )}
            <button onClick={() => setShowPreview(prev => !prev)} className={clsx('flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-all font-medium', showPreview ? 'bg-orange-100 text-orange-700 border-orange-300 shadow-sm' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50')}>
              {showPreview ? <><Code size={14} /> Edit</> : <><Eye size={14} /> Preview</>}
            </button>
            <button onClick={() => handleSave(false)} className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-all shadow-sm shadow-orange-500/20">
              <Save size={14} />
              {editingId ? 'Update' : 'Save'}
            </button>
            <button onClick={() => handleSave(true)} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm shadow-emerald-600/20">
              <Sparkles size={14} />
              Save as Template
            </button>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-stone-100 shrink-0 grid grid-cols-1 2xl:grid-cols-3 gap-4 bg-white">
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Design Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-white border border-stone-300 shadow-sm rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Default Email Subject</label>
            <input type="text" name="subject" value={formData.subject} onChange={handleChange} className="w-full bg-white border border-stone-300 shadow-sm rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 placeholder:text-stone-400" placeholder="Your Exclusive Offer Awaits!" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Campaign Purpose</label>
            <select name="templateKey" value={formData.templateKey} onChange={handleChange} className="w-full bg-white border border-stone-300 shadow-sm rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500">
              {TEMPLATE_LIBRARY.map(template => <option key={template.key} value={template.key}>{template.title} · {template.purpose}</option>)}
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-stone-100 bg-[#f8f5f2]/50 shrink-0 flex flex-wrap gap-x-6 gap-y-4 items-center">
          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-stone-700">
            <input type="checkbox" name="use_header" checked={formData.use_header} onChange={handleChange} className="w-4 h-4 rounded border-stone-300 accent-orange-500" />
            Branded Header
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-stone-700">
            <input type="checkbox" name="use_footer" checked={formData.use_footer} onChange={handleChange} className="w-4 h-4 rounded border-stone-300 accent-orange-500" />
            Branded Footer
          </label>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-500">Editor:</span>
            <button onClick={() => setFormData(prev => ({ ...prev, editorMode: 'builder' }))} className={clsx('px-3 py-1.5 text-xs rounded-md border', formData.editorMode === 'builder' ? 'bg-orange-100 text-orange-700 border-orange-300 shadow-sm' : 'bg-white text-stone-500 border-stone-200')}>Builder</button>
            <button onClick={() => setFormData(prev => ({ ...prev, editorMode: 'code' }))} className={clsx('px-3 py-1.5 text-xs rounded-md border', formData.editorMode === 'code' ? 'bg-orange-100 text-orange-700 border-orange-300 shadow-sm' : 'bg-white text-stone-500 border-stone-200')}>Code</button>
          </div>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <span className="text-xs font-medium text-stone-500">Header Style:</span>
            <select name="headerStyle" value={formData.headerStyle} onChange={handleChange} className="bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-700">
              <option value="classic">Classic</option>
              <option value="centered">Centered</option>
              <option value="split">Split</option>
            </select>
            <span className="text-xs font-medium text-stone-500">Footer Style:</span>
            <select name="footerStyle" value={formData.footerStyle} onChange={handleChange} className="bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs text-stone-700">
              <option value="classic">Classic</option>
              <option value="simple">Simple</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-stone-100 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 bg-white">
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Brand Name</label>
            <input type="text" name="brandName" value={formData.brandName} onChange={handleChange} className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Logo URL or Upload</label>
            <div className="flex gap-2">
              <input type="text" name="logoUrl" value={formData.logoUrl} onChange={handleChange} className="flex-1 bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm" />
              <label className="px-3 py-2 text-sm rounded-lg bg-stone-100 border border-stone-200 cursor-pointer hover:bg-stone-200 transition-colors flex items-center gap-1.5">
                <Upload size={14} />
                <input type="file" accept="image/*" className="hidden" onChange={event => handleFileUpload(event, dataUrl => setFormData(prev => ({ ...prev, logoUrl: dataUrl })))} />
              </label>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Font Family</label>
            <select name="fontFamily" value={formData.fontFamily} onChange={handleChange} className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm">
              {FONT_OPTIONS.map(font => <option key={font} value={font}>{font}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Background Color</label>
            <input type="color" name="backgroundColor" value={formData.backgroundColor} onChange={handleChange} className="w-full h-10 bg-white border border-stone-300 rounded-lg px-2 py-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Button Color</label>
            <input type="color" name="buttonColor" value={formData.buttonColor} onChange={handleChange} className="w-full h-10 bg-white border border-stone-300 rounded-lg px-2 py-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Brand Color</label>
            <input type="color" name="brandColor" value={formData.brandColor} onChange={handleChange} className="w-full h-10 bg-white border border-stone-300 rounded-lg px-2 py-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Accent Color</label>
            <input type="color" name="accentColor" value={formData.accentColor} onChange={handleChange} className="w-full h-10 bg-white border border-stone-300 rounded-lg px-2 py-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Section Background</label>
            <input type="color" name="sectionBg" value={formData.sectionBg} onChange={handleChange} className="w-full h-10 bg-white border border-stone-300 rounded-lg px-2 py-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-600 mb-1 block">Footer Background</label>
            <input type="color" name="footerBg" value={formData.footerBg} onChange={handleChange} className="w-full h-10 bg-white border border-stone-300 rounded-lg px-2 py-1" />
          </div>
        </div>

        {!showPreview && (
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-stone-500 mr-2">Add blocks</span>
            <button onClick={() => addBlock('hero')} className="px-3 py-2 rounded-lg bg-white border border-stone-200 text-sm hover:border-orange-300 hover:bg-orange-50 flex items-center gap-1.5"><Sparkles size={14} /> Hero</button>
            <button onClick={() => addBlock('text')} className="px-3 py-2 rounded-lg bg-white border border-stone-200 text-sm hover:border-orange-300 hover:bg-orange-50 flex items-center gap-1.5"><Type size={14} /> Text</button>
            <button onClick={() => addBlock('image')} className="px-3 py-2 rounded-lg bg-white border border-stone-200 text-sm hover:border-orange-300 hover:bg-orange-50 flex items-center gap-1.5"><Image size={14} /> Image</button>
            <button onClick={() => addBlock('button')} className="px-3 py-2 rounded-lg bg-white border border-stone-200 text-sm hover:border-orange-300 hover:bg-orange-50 flex items-center gap-1.5"><Link2 size={14} /> Button</button>
            <button onClick={() => addBlock('grid')} className="px-3 py-2 rounded-lg bg-white border border-stone-200 text-sm hover:border-orange-300 hover:bg-orange-50 flex items-center gap-1.5"><Columns2 size={14} /> Product Grid</button>
            <button onClick={() => addBlock('divider')} className="px-3 py-2 rounded-lg bg-white border border-stone-200 text-sm hover:border-orange-300 hover:bg-orange-50 flex items-center gap-1.5">Divider</button>
            <span className="ml-auto text-xs text-stone-500">Drag blocks to reorder.</span>
          </div>
        )}

        <div className="flex-1 min-h-0 relative bg-stone-100">
          {feedback && (
            <div className={clsx('px-4 py-3 text-sm border-b', feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : feedback.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-sky-50 text-sky-800 border-sky-200')}>
              {feedback.message}
            </div>
          )}

          {showPreview ? (
            <div className="h-full w-full p-0 flex items-center justify-center">
              <div
                className={clsx(
                  'transition-all duration-300 ease-in-out bg-white overflow-hidden shadow-xl',
                  previewMode === 'mobile' ? 'w-[375px] max-w-full h-[812px] rounded-[36px] my-6 border-[12px] border-stone-800 ring-1 ring-stone-200/50 relative' : 'w-full h-full'
                )}
              >
                <iframe srcDoc={themedPreviewHtml} className="w-full h-full border-0 bg-white" sandbox="allow-same-origin" title="Email Preview" />
              </div>
            </div>
          ) : formData.editorMode === 'code' ? (
            <textarea
              name="body_html"
              value={formData.body_html}
              onChange={handleChange}
              className="w-full h-full bg-stone-50 font-mono text-sm text-stone-800 p-5 resize-none focus:outline-none leading-relaxed border-none"
              placeholder="<div>Write your HTML email body here...</div>"
            />
          ) : (
            <div className="h-full grid grid-cols-1 gap-4 p-4 min-h-0">
              <div className="min-w-0 min-h-0 flex flex-col gap-4">
                <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-stone-900">Builder Canvas</div>
                      <div className="text-xs text-stone-500">Arrange blocks, then edit each selected section directly below it.</div>
                    </div>
                    <button onClick={() => { console.log('clear-selection'); setSelectedBlockId(null); }} className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50">Clear selection</button>
                  </div>
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {blocks.map((block, index) => {
                      const isSelected = selectedBlockId === block.id;
                      return (
                        <div
                          key={block.id}
                          draggable
                          onDragStart={() => setDraggedBlockId(block.id)}
                          onDragOver={event => event.preventDefault()}
                          onDrop={() => draggedBlockId && draggedBlockId !== block.id && setBlocks(prev => {
                            const fromIndex = prev.findIndex(item => item.id === draggedBlockId);
                            const toIndex = prev.findIndex(item => item.id === block.id);
                            if (fromIndex < 0 || toIndex < 0) return prev;
                            const next = [...prev];
                            const [moved] = next.splice(fromIndex, 1);
                            next.splice(toIndex, 0, moved);
                            return next;
                          })}
                          onClick={() => { console.log('[MailDesign] Block clicked:', block.id); setSelectedBlockId(block.id); }}
                          className={clsx('rounded-2xl border p-3 bg-stone-50 cursor-pointer', isSelected ? 'border-orange-300 shadow-sm bg-orange-50' : 'border-stone-200 hover:border-orange-200')}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-2 text-stone-400"><GripVertical size={16} /></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="text-sm font-semibold text-stone-900 capitalize">{block.type} block {index + 1}</div>
                                <div className="flex items-center gap-1">
                                  <button onClick={event => { event.stopPropagation(); moveBlock(block.id, -1); }} className="p-1 rounded hover:bg-white text-stone-500"><ArrowUp size={14} /></button>
                                  <button onClick={event => { event.stopPropagation(); moveBlock(block.id, 1); }} className="p-1 rounded hover:bg-white text-stone-500"><ArrowDown size={14} /></button>
                                  <button onClick={event => { event.stopPropagation(); duplicateBlock(block.id); }} className="p-1 rounded hover:bg-white text-stone-500"><Copy size={14} /></button>
                                  <button onClick={event => { event.stopPropagation(); removeBlock(block.id); }} className="p-1 rounded hover:bg-white text-stone-500"><Trash2 size={14} /></button>
                                </div>
                              </div>
                              <div className="text-xs text-stone-500 mt-1">
                                {block.type === 'hero' && (block as HeroBlock).title}
                                {block.type === 'text' && (block as TextBlock).heading}
                                {block.type === 'image' && (block as ImageBlock).caption}
                                {block.type === 'button' && (block as ButtonBlock).text}
                                {block.type === 'grid' && (block as GridBlock).title}
                                {block.type === 'divider' && 'Divider line'}
                              </div>
                              {isSelected && renderBlockEditor(block)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm flex-1 min-h-0">
                  <div className="px-4 py-3 border-b border-stone-100 bg-stone-50 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-stone-900">Email Body Preview</div>
                      <div className="text-xs text-stone-500">Preview desktop/mobile and Light, Dark, or Auto phone mode.</div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <button onClick={() => setPreviewMode('desktop')} className={clsx('text-xs px-3 py-1.5 rounded-lg border', previewMode === 'desktop' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-white text-stone-600 border-stone-200')}>Desktop</button>
                      <button onClick={() => setPreviewMode('mobile')} className={clsx('text-xs px-3 py-1.5 rounded-lg border', previewMode === 'mobile' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-white text-stone-600 border-stone-200')}>Mobile</button>
                      <select value={previewTheme} onChange={event => setPreviewTheme(event.target.value as PreviewTheme)} className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-700">
                        <option value="light">Light Mode</option>
                        <option value="dark">Dark Mode</option>
                        <option value="auto">Auto (Phone System)</option>
                      </select>
                      <button onClick={() => setShowPreview(true)} className="text-xs px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200">Open Preview</button>
                    </div>
                  </div>
                  <div className="p-4 min-h-[280px] bg-stone-50 flex items-center justify-center">
                    <div className={clsx('w-full', previewMode === 'mobile' && 'max-w-[380px] h-[640px] border-[8px] border-stone-800 rounded-[28px] overflow-hidden bg-white')}>
                      <iframe srcDoc={themedPreviewHtml} className={clsx('w-full border border-stone-200 rounded-xl bg-white', previewMode === 'mobile' ? 'h-full border-0 rounded-none' : 'h-[360px]')} sandbox="allow-same-origin" title="Inline Email Preview" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default MailDesign;
