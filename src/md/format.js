import { isValidElement, Fragment } from 'react';
import { ORIGIN } from '../seo.js';

// Small helpers for writing markdown from page data. Every link comes out absolute.

export const abs = (path) => (/^[a-z]+:/i.test(path) ? path : ORIGIN + (path.startsWith('/') ? path : `/${path}`));

// Escapes the characters that would otherwise turn plain copy into markdown.
export const esc = (text) => String(text).replace(/([\\`*_[\]<])/g, '\\$1');

export const link = (text, href) => `[${esc(text)}](${abs(href)})`;
export const h = (level, text) => `${'#'.repeat(level)} ${esc(text)}`;
export const list = (items) => items.map((i) => `- ${i}`).join('\n');
export const ordered = (items) => items.map((i, n) => `${n + 1}. ${i}`).join('\n');

export function table(head, rows) {
  const line = (cells) => `| ${cells.map((c) => String(c).replace(/\|/g, '\\|')).join(' | ')} |`;
  return [line(head), line(head.map(() => '---')), ...rows.map(line)].join('\n');
}

// YYYY-MM-DD in local time, so '26 October 2026' stays the 26th in any timezone.
export function date(d) {
  const t = new Date(d);
  return [t.getFullYear(), t.getMonth() + 1, t.getDate()].map((n) => String(n).padStart(2, '0')).join('-');
}

// Copy that holds JSX (a link or the email inside a sentence) becomes inline markdown.
export function inline(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return esc(node);
  if (Array.isArray(node)) return node.map(inline).join('');
  if (!isValidElement(node)) return '';
  const { type, props } = node;
  if (type === 'a') return `[${inline(props.children)}](${abs(props.href)})`;
  if (type === Fragment || typeof type === 'string') return inline(props.children);
  return inline(type(props)); // a small function component such as <Mail />
}

// One page: title, summary, canonical and date, then the body sections and related links.
export function page({ path, title, summary, updated, body, related = [] }) {
  return [
    h(1, title),
    `> ${esc(summary)}`,
    `Canonical: ${abs(path)}\nLast updated: ${date(updated)}`,
    ...body.filter(Boolean),
    related.length ? `${h(2, 'Related')}\n${list(related.map(([t, p]) => link(t, p)))}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
    .concat('\n');
}
