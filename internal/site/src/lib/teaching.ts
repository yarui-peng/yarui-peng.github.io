import { readFile } from 'node:fs/promises';
import path from 'node:path';

export type TeachingRecord = Record<string, string>;

export function ParseCsv(Text: string): TeachingRecord[] {
  const Records: string[][] = [];
  let Record: string[] = [];
  let Field = '';
  let Quoted = false;
  for (let Index = 0; Index < Text.length; Index += 1) {
    const Character = Text[Index];
    const Next = Text[Index + 1];
    if (Character === '"' && Quoted && Next === '"') { Field += '"'; Index += 1; }
    else if (Character === '"') Quoted = !Quoted;
    else if (Character === ',' && !Quoted) { Record.push(Field); Field = ''; }
    else if ((Character === '\n' || Character === '\r') && !Quoted) {
      if (Character === '\r' && Next === '\n') Index += 1;
      Record.push(Field); Field = '';
      if (Record.some((Value) => Value.length)) Records.push(Record);
      Record = [];
    } else Field += Character;
  }
  if (Field.length || Record.length) { Record.push(Field); Records.push(Record); }
  const [Headers, ...Values] = Records;
  return (Values ?? []).map((Value) => Object.fromEntries((Headers ?? []).map((Header, Index) => [Header, Value[Index] ?? ''])));
}

export async function ReadTeachingRecords() {
  const FilePath = path.join(process.cwd(), '..', '..', 'dynamic', 'data', 'teaching.csv');
  try {
    return ParseCsv(await readFile(FilePath, 'utf8'));
  } catch {
    return [];
  }
}
