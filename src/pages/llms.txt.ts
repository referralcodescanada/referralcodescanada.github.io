// /llms.txt — index of the site for AI assistants (https://llmstxt.org).
import { getModel } from '../lib/data.ts';
import { rootLlmsTxt } from '../lib/markdown.ts';

export const GET = async () => new Response(rootLlmsTxt(await getModel()));
