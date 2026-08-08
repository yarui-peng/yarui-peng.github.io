import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ParseCsv } from './teaching';

export type ManualRecord = {
  title: string;
  category: string;
  group: string;
  file: string;
  description: string;
  streamable: string;
  survey: string;
};

export async function ReadManuals(): Promise<ManualRecord[]> {
  const FilePath = path.join(process.cwd(), '..', '..', 'dynamic', 'data', 'manuals.csv');
  try {
    return (ParseCsv(await readFile(FilePath, 'utf8')) as ManualRecord[]).filter((Manual) => Manual.title && Manual.file && ['e3da', 'uark', 'public'].includes(Manual.group));
  } catch {
    return [];
  }
}
