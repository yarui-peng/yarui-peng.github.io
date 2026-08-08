import { parse } from 'csv-parse/sync';
import { parse as parseBibtex } from '@retorquere/bibtex-parser';

const sourceFiles = import.meta.glob('./legacy/**/*', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>;

export function source(relativePath: string): string {
  const value = sourceFiles[`./legacy/${relativePath}`];
  if (typeof value !== 'string') throw new Error(`Missing legacy source: ${relativePath}`);
  return value;
}

export function rows(relativePath: string): string[][] {
  return parse(source(relativePath), { skip_empty_lines: true, relax_column_count: true });
}

export type RowGroup = { name: string; rows: string[][] };

export function groupRows(data: string[][]): RowGroup[] {
  return data.reduce<RowGroup[]>((groups, row) => {
    if (row.length === 1) {
      groups.push({ name: row[0], rows: [] });
    } else if (groups.length > 0) {
      groups[groups.length - 1].rows.push(row);
    }
    return groups;
  }, []);
}

export function html(relativePath: string): string {
  return source(relativePath);
}

export type Publication = {
  type: string;
  key: string;
  title: string;
  author: string;
  authors: PublicationAuthor[];
  year: string;
  month?: string;
  venue: string;
  booktitle?: string;
  publisher?: string;
  school?: string;
  volume?: string;
  number?: string;
  pages?: string;
  note?: string;
  legacyPdfPath?: string;
  legacyMediaKey?: string;
  doi?: string;
  url?: string;
};

export type PublicationAuthor = {
  name: string;
  href?: string;
};

function field(fields: Record<string, unknown>, name: string): string | undefined {
  const value = fields[name];
  return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;
}

function authorList(value: unknown): PublicationAuthor[] {
  if (!Array.isArray(value)) return typeof value === 'string' ? [{ name: value }] : [];
  const homepageLinks: Record<string, string> = {
    'yarui peng': '/people/#Faculty',
    'mehran sanjabiasasi': '/people/#Ph.D.%20Students',
    'md. arafat kabir': '/people/#Alumni',
    'imam al razi': '/people/#Alumni',
    'joshua mitchener': '/people/#Former%20Students',
  };
  return value.map((author) => {
    if (!author || typeof author !== 'object') return { name: '' };
    const person = author as { firstName?: string; lastName?: string; name?: string };
    const name = person.firstName && person.lastName ? `${person.firstName} ${person.lastName}` : person.name ?? person.lastName ?? person.firstName ?? '';
    return { name, href: homepageLinks[name.toLowerCase()] };
  }).filter((author) => author.name);
}

function authors(value: unknown): string {
  return authorList(value).map((author) => author.name).join(' and ');
}

export function publications(): Publication[] {
  const parsed = parseBibtex(source('publication.bib'));
  return parsed.entries.map((entry) => {
    const fields = entry.fields as Record<string, unknown>;
    const booktitle = field(fields, 'booktitle');
    const journal = field(fields, 'journal');
    return {
      type: entry.type,
      key: entry.key,
      title: field(fields, 'title') ?? entry.key,
      author: authors(fields.author),
      authors: authorList(fields.author),
      year: field(fields, 'year') ?? '',
      month: field(fields, 'month'),
      venue: journal ?? booktitle ?? field(fields, 'publisher') ?? '',
      booktitle,
      publisher: field(fields, 'publisher'),
      school: field(fields, 'school'),
      volume: field(fields, 'volume'),
      number: field(fields, 'number'),
      pages: field(fields, 'pages')?.replace(/--/g, '-'),
      note: field(fields, 'note'),
      legacyPdfPath: field(fields, 'year') ? `/pub/doc/${field(fields, 'year')}/${entry.key}.pdf` : undefined,
      legacyMediaKey: entry.key,
      doi: field(fields, 'doi'),
      url: field(fields, 'url'),
    };
  }).sort((a, b) => b.year.localeCompare(a.year));
}
