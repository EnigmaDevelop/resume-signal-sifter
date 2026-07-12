// Inline SVG icon set — replaces emoji glyphs so the UI reads consistently
// across platforms/fonts. All icons share viewBox 0 0 24 24; most are
// stroke-only (stroke="currentColor", fill="none", stroke-width 2, round
// caps/joins) so they inherit the surrounding text color and theme for free.
// A couple (iconTheme's fill half, iconSend, iconLogo) intentionally use
// fill="currentColor" where a solid shape reads better than an outline.

// AI mode entrance: one large 4-point sparkle + a small companion sparkle —
// the conventional "generative/AI" glyph.
export const iconAiEnter = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M11.5 1.5 L12.91 9.09 L20.5 10.5 L12.91 11.91 L11.5 19.5 L10.09 11.91 L2.5 10.5 L10.09 9.09 Z"/>
  <path d="M18.5 2.3 L19.14 4.86 L21.7 5.5 L19.14 6.14 L18.5 8.7 L17.86 6.14 L15.3 5.5 L17.86 4.86 Z"/>
</svg>`;

// AI mode exit: a speech bubble with two short menu lines inside — "return
// to the static menu chat".
export const iconAiExit = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3.5" y="4.5" width="17" height="12" rx="3"/>
  <path d="M8 16.5 L8 20 L11.5 16.5"/>
  <line x1="7.5" y1="8.5" x2="16.5" y2="8.5"/>
  <line x1="7.5" y1="11.5" x2="13.5" y2="11.5"/>
</svg>`;

// Practice-mode exit: a door frame with an arrow pointing out.
export const iconPracticeExit = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 4h3.5A1.5 1.5 0 0 1 19 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14"/>
  <line x1="4" y1="12" x2="14.5" y2="12"/>
  <polyline points="10.5 8 14.5 12 10.5 16"/>
</svg>`;

// Theme toggle: a half-filled circle (platform-neutral stand-in for 🌓).
export const iconTheme = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="8.5"/>
  <path d="M12 3.5a8.5 8.5 0 0 0 0 17Z" fill="currentColor" stroke="none"/>
</svg>`;

// Send button: a simple paper plane (platform-neutral stand-in for ➤).
export const iconSend = `<svg viewBox="0 0 24 24" fill="currentColor">
  <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"/>
</svg>`;

// Muted header logo mark — a rounded speech bubble with three ascending
// vertical bars. Shares geometry with public/favicon.svg (see docs/branding.md);
// the bubble uses currentColor so it themes, the bars punch through with
// var(--surface) so they read as "cut out" of the bubble on the header
// background.
export const iconLogo = `<svg viewBox="0 0 24 24">
  <rect x="3" y="4" width="18" height="13" rx="4" fill="currentColor"/>
  <path d="M7 17 L7 21 L11 17 Z" fill="currentColor"/>
  <rect x="6.5" y="10" width="2.2" height="4.5" rx="1.1" fill="var(--surface)"/>
  <rect x="10.5" y="8" width="2.2" height="6.5" rx="1.1" fill="var(--surface)"/>
  <rect x="14.5" y="6" width="2.2" height="8.5" rx="1.1" fill="var(--surface)"/>
</svg>`;
