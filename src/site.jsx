// Contact details and links used across the site. Edit them here, once.

export const SITE = {
  email: 'hello@scalea.com',
  // WhatsApp number in international format, digits only (Nepal: 977 + number), e.g. '9779800000000'.
  whatsapp: '9779748759519',
  // How the number is shown on the site.
  phone: '+977 974-875-9519',
  // The message a visitor's WhatsApp opens with, ready to send.
  whatsappText: 'Hi Scalea, I want to build a website.',
  linkedin: 'https://www.linkedin.com/in/swachhal-lamsal-126b2b310/',
  instagram: '',
  // Google Apps Script web app URL that writes career applications to a Google Sheet
  // (see scripts/careers-form.gs). Empty: applications open as an email instead.
  careersEndpoint: '',
};

// WhatsApp chat with the greeting pre-filled. Until a number is set, falls back to the project form.
export function whatsappHref(text = SITE.whatsappText) {
  if (!SITE.whatsapp) return '/start';
  return `https://wa.me/${SITE.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}

export const SOCIAL = [
  {
    k: 'LinkedIn',
    href: () => SITE.linkedin,
    d: 'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3zM9.5 9.5h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.2c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75V21h-4z',
  },
  {
    k: 'Instagram',
    href: () => SITE.instagram,
    d: 'M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm4.9-7.9a1.1 1.1 0 1 1 0-2.2 1.1 1.1 0 0 1 0 2.2ZM12 3.6c2.7 0 3 0 4.1.06 2.7.12 4 1.42 4.12 4.12.06 1.06.06 1.38.06 4.08s0 3.02-.06 4.08c-.12 2.7-1.42 4-4.12 4.12-1.06.06-1.38.06-4.1.06s-3.02 0-4.08-.06c-2.72-.12-4-1.43-4.12-4.12C3.74 15.02 3.73 14.7 3.73 12s0-3.02.06-4.08C3.9 5.2 5.2 3.9 7.9 3.78 8.98 3.62 9.3 3.6 12 3.6Z',
  },
];

// Icon links to the profiles that have a URL set above, opening in a new tab.
export function SocialLinks() {
  return SOCIAL.filter((s) => s.href()).map((s) => (
    <li key={s.k}>
      <a href={s.href()} aria-label={s.k} target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d={s.d} /></svg>
      </a>
    </li>
  ));
}
