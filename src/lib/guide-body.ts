// Guides are written in a small, predictable subset of Markdown (src/content/products/<slug>/guides/<id>/<lang>.md):
//
//   ## Section title          → a section of the article (and an entry of its table of contents)
//   A paragraph.               → paragraph (inline markdown + {placeholders} allowed)
//   - item                     → bullet list
//   1. step                    → numbered steps (rendered as step cards)
//   > note                     → highlighted note
//
// Blocks are separated by a blank line. Anything else is an error, so a guide always renders the same way
// on the page, in its .md version and in llms-full.txt.

export type Block =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'note'; text: string };

export interface GuideSection {
  h2: string;
  blocks: Block[];
}

const join = (lines: string[]) => lines.map((l) => l.trim()).join(' ');

function listItems(lines: string[], marker: RegExp, where: string): string[] {
  const items: string[][] = [];
  for (const line of lines) {
    if (marker.test(line)) items.push([line.replace(marker, '')]);
    else if (items.length && /^\s+\S/.test(line)) items[items.length - 1].push(line);
    else throw new Error(`[content] ${where}: every line of a list must start with the same marker ("${line.trim()}")`);
  }
  return items.map(join);
}

export function parseGuideBody(body: string, where: string): GuideSection[] {
  const sections: GuideSection[] = [];
  const chunks = body.replace(/\r\n/g, '\n').trim().split(/\n\s*\n/);
  for (const chunk of chunks) {
    const lines = chunk.split('\n').filter((l) => l.trim() !== '');
    if (!lines.length) continue;
    const first = lines[0];
    if (/^## /.test(first)) {
      sections.push({ h2: first.slice(3).trim(), blocks: [] });
      if (lines.length > 1) throw new Error(`[content] ${where}: leave a blank line after "${first}"`);
      continue;
    }
    if (/^#/.test(first)) throw new Error(`[content] ${where}: only "## " headings are allowed ("${first}")`);
    const section = sections[sections.length - 1];
    if (!section) throw new Error(`[content] ${where}: the article must start with a "## " heading`);
    if (/^- /.test(first)) section.blocks.push({ type: 'ul', items: listItems(lines, /^- /, where) });
    else if (/^\d+\. /.test(first)) section.blocks.push({ type: 'ol', items: listItems(lines, /^\d+\. /, where) });
    else if (/^> ?/.test(first)) section.blocks.push({ type: 'note', text: join(lines.map((l) => l.replace(/^> ?/, ''))) });
    else section.blocks.push({ type: 'p', text: join(lines) });
  }
  if (!sections.length) throw new Error(`[content] ${where}: the article is empty`);
  return sections;
}
