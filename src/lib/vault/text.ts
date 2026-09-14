/**
 * Cheap text helpers that work on raw markdown without a parser.
 * They only need to be good enough for titles, headings, search text and link context.
 */

const blank = (match: string) => match.replace(/[^\n]/g, ' ');

/** Replace fenced code blocks and `%%comments%%` with spaces, preserving length and newlines. */
export function stripFences(body: string): string {
  return body
    .replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\1[ \t]*$/gm, blank)
    .replace(/%%[\s\S]*?%%/g, blank);
}

/** Like `stripFences`, and also blanks inline code, so link syntax inside backticks is ignored. */
export function stripCode(body: string): string {
  return stripFences(body).replace(/`[^`\n]+`/g, blank);
}

/** Reduce inline markdown to readable text. */
export function inlineToText(text: string): string {
  return text
    .replace(/!\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (_, target: string, label?: string) => label || target)
    .replace(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]*))?\]\]/g, (_, target: string, label?: string) => {
      const name = target.split('/').pop() ?? target;
      return label || name;
    })
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>\n]+>/g, '')
    .replace(/\$\$([^$]+)\$\$/g, '$1')
    .replace(/\$([^$\n]+)\$/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/==(.*?)==/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\\([\\`*_{}[\]()#+\-.!])/g, '$1');
}

/** Plain text of a whole note body (frontmatter already removed). Code blocks keep their content. */
export function toPlainText(body: string): string {
  const text = body
    .replace(/^(`{3,}|~{3,})[^\n]*$/gm, '')
    .replace(/%%[\s\S]*?%%/g, ' ')
    .replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm, '')
    .replace(/^[ \t]{0,3}>[ \t]?\[!([\w-]+)\][+-]?[ \t]*/gm, '')
    .replace(/^[ \t]{0,3}>[ \t]?/gm, '')
    .replace(/^[ \t]*[-*+][ \t]+\[[ xX]\][ \t]+/gm, '')
    .replace(/^[ \t]*[-*+][ \t]+/gm, '')
    .replace(/^[ \t]*\d+[.)][ \t]+/gm, '')
    .replace(/^[ \t]*\|?[ \t]*:?-+:?[ \t]*(\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/gm, '')
    .replace(/\|/g, ' ')
    .replace(/^[ \t]*(?:-{3,}|\*{3,}|_{3,})[ \t]*$/gm, '')
    .replace(/\[\^[^\]]+\]:?/g, '');
  return inlineToText(text)
    .replace(/[ \t]+/g, ' ')
    .replace(/^ +| +$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export interface RawHeading {
  depth: number;
  text: string;
}

/** ATX headings outside fenced code, in document order. Inline code stays part of the text, as in Astro's ids. */
export function extractHeadings(body: string): RawHeading[] {
  const headings: RawHeading[] = [];
  const pattern = /^ {0,3}(#{1,6})[ \t]+(.+?)[ \t]*#*[ \t]*$/gm;
  for (const match of stripFences(body).matchAll(pattern)) {
    headings.push({ depth: match[1].length, text: inlineToText(match[2]).trim() });
  }
  return headings;
}

/** The text of a leading `# H1` if it is the first non-blank line of the body. */
export function leadingH1(body: string): string | undefined {
  const firstLine = body.split('\n').find((line) => line.trim() !== '');
  const match = firstLine?.match(/^ {0,3}#[ \t]+(.+?)[ \t]*#*[ \t]*$/);
  return match ? inlineToText(match[1]).trim() : undefined;
}

/** A leading H1 is dropped from the rendered body when it duplicates the note title. */
export function shouldStripTitle(frontmatterTitle: string | undefined, h1: string | undefined): boolean {
  if (!h1) return false;
  if (!frontmatterTitle) return true;
  return frontmatterTitle.normalize('NFC').trim().toLowerCase() === h1.normalize('NFC').trim().toLowerCase();
}

export function countWords(plain: string): number {
  return plain.split(/\s+/).filter(Boolean).length;
}

/** Turn a stem such as `hash-maps` or `hash_maps` into `hash maps` for a fallback title. */
export function titleFromStem(stem: string): string {
  return stem.replace(/[-_]+/g, ' ').trim();
}
