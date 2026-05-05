# UI Context — Design Tokens

## Color Palette

| Token Name               | Hex Value | Usage                              |
| ------------------------ | --------- | ---------------------------------- |
| `color-bg-primary`       | #FFFFFF   | Main background                    |
| `color-bg-secondary`     | #F0F2F5   | App background / panels            |
| `color-bg-muted`         | #E9ECEF   | Subtle sections / inputs           |
| `color-bg-chat-incoming` | #FFFFFF   | Customer messages                  |
| `color-bg-chat-outgoing` | #DCF8C6   | AI/owner messages (WhatsApp style) |
| `color-bg-hover`         | #F5F7F9   | Hover states                       |

| `color-text-primary` | #111B21 | Main text |
| `color-text-secondary` | #667781 | Secondary text |
| `color-text-muted` | #8696A0 | Placeholder / hints |
| `color-text-inverse` | #FFFFFF | Text on dark/green |

| `color-brand-primary` | #25D366 | WhatsApp green (primary CTA) |
| `color-brand-primary-hover` | #1DA851 | Hover state |
| `color-brand-soft` | #E6F9F0 | Light green backgrounds |

| `color-accent-blue` | #53BDEB | Info / links |
| `color-accent-yellow` | #FFE69A | Warnings / highlights |
| `color-accent-red` | #FF6B6B | Errors / destructive actions |

| `color-border-default` | #E0E6EA | Default borders |
| `color-border-strong` | #D1D7DB | Stronger separators |

| `color-status-success` | #25D366 | Success |
| `color-status-warning` | #FFB020 | Warning |
| `color-status-error` | #FF6B6B | Error |
| `color-status-info` | #53BDEB | Info |

| `color-ai-highlight` | #E6F9F0 | AI-generated responses |
| `color-ai-border` | #25D366 | AI indicator border |

---

## Typography

| Token              | Value                        | Usage           |
| ------------------ | ---------------------------- | --------------- |
| `font-family-base` | Inter, system-ui, sans-serif | Primary UI font |
| `font-family-mono` | Menlo, monospace             | Code / IDs      |

| `font-size-xs` | 12px | Metadata, timestamps |
| `font-size-sm` | 14px | Secondary text |
| `font-size-base` | 16px | Body text |
| `font-size-lg` | 18px | Section headers |
| `font-size-xl` | 20px | Page titles |

| `font-weight-regular` | 400 | Default text |
| `font-weight-medium` | 500 | Labels |
| `font-weight-semibold` | 600 | Headers |
| `font-weight-bold` | 700 | Emphasis |

| `line-height-tight` | 1.2 | Headings |
| `line-height-normal` | 1.5 | Body text |
| `line-height-loose` | 1.7 | Long content |

---

## Border Radius Scale

| Token         | Value | Usage           |
| ------------- | ----- | --------------- |
| `radius-xs`   | 4px   | Small elements  |
| `radius-sm`   | 6px   | Inputs, buttons |
| `radius-md`   | 10px  | Cards           |
| `radius-lg`   | 16px  | Modals          |
| `radius-xl`   | 24px  | Chat bubbles    |
| `radius-full` | 999px | Pills / avatars |

---

## Accent & AI Variants

| Token                 | Hex Value | Usage               |
| --------------------- | --------- | ------------------- |
| `color-ai-badge-bg`   | #E6F9F0   | AI label background |
| `color-ai-badge-text` | #1DA851   | AI label text       |
| `color-ai-message-bg` | #DCF8C6   | AI message bubble   |
| `color-ai-glow`       | #B9F5D0   | Subtle highlight    |

| `color-highlight-soft` | #F0FFF7 | Selected states |
| `color-highlight-strong` | #25D366 | Active states |

---

## Notes

- Design is **light-first**, minimal, and WhatsApp-inspired
- Green is used **sparingly for actions and AI emphasis**
- Neutral grays balance readability and reduce visual noise
- Chat UI should feel familiar and simple, not overloaded
