// /robots.txt — every crawler, search engine and AI assistant is welcome.
import { SITE } from '../config/site.ts';
import { URLS } from '../lib/model.ts';

const AI_BOTS = [
  'Googlebot', 'Bingbot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot', 'Applebot-Extended', 'DuckAssistBot', 'MistralAI-User',
  'CCBot', 'meta-externalagent', 'Amazonbot', 'YouBot',
];

export const GET = () =>
  new Response(`# ${SITE.name} — every crawler, search engine and AI assistant is welcome.
User-agent: *
Allow: /

${AI_BOTS.map((b) => `User-agent: ${b}`).join('\n')}
Allow: /

Sitemap: ${URLS.abs('/sitemap.xml')}
`);
