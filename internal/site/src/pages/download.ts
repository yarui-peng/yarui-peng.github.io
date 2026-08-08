import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { HasSurveyAccess, SurveyCookieName } from '../lib/survey';

const ContentTypes: Record<string, string> = {
  pdf: 'application/pdf',
  tgz: 'application/gzip',
  zip: 'application/zip',
  mp4: 'video/mp4',
  webm: 'video/webm',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

function GetRoot(Group: string) {
  if (Group === 'e3da') return process.env.E3DA_PRIVATE_ROOT;
  if (Group === 'uark') return process.env.UARK_PRIVATE_ROOT;
  if (Group === 'public') return process.env.E3DA_PUBLIC_ROOT;
  return undefined;
}

function ParseRange(Value: string | null, Size: number) {
  if (!Value) return undefined;
  const Match = /^bytes=(\d*)-(\d*)$/.exec(Value);
  if (!Match || (!Match[1] && !Match[2])) return null;
  const Start = Match[1] ? Number(Match[1]) : Math.max(Size - Number(Match[2]), 0);
  const End = Match[2] ? Number(Match[2]) : Size - 1;
  if (!Number.isSafeInteger(Start) || !Number.isSafeInteger(End) || Start < 0 || End < Start || Start >= Size) return null;
  return { Start, End: Math.min(End, Size - 1) };
}

function Stream(FilePath: string, Start: number, End: number) {
  return Readable.toWeb(createReadStream(FilePath, { start: Start, end: End })) as ReadableStream;
}

export const GET = async ({ request, locals, url }) => {
  const Group = (url.searchParams.get('group') ?? '').toLowerCase();
  const RequestedFile = url.searchParams.get('file') ?? '';
  const Root = GetRoot(Group);
  const SurveyRequired = url.searchParams.get('survey') === 'required';
  const SurveyToken = request.headers.get('cookie')?.match(new RegExp(`${SurveyCookieName()}=([^;]+)`))?.[1];

  if (!Root || !RequestedFile || (Group !== 'public' && !locals.Session)) return new Response('Forbidden', { status: 403 });
  if (Group === 'public' && SurveyRequired && !locals.Session && !HasSurveyAccess(SurveyToken, Group, RequestedFile)) {
    return Response.redirect(new URL(`/survey?group=${encodeURIComponent(Group)}&file=${encodeURIComponent(RequestedFile)}`, url), 303);
  }

  try {
    const RootPath = await realpath(Root);
    const FilePath = await realpath(path.resolve(RootPath, RequestedFile));
    if (!FilePath.startsWith(`${RootPath}${path.sep}`)) return new Response('Forbidden', { status: 403 });

    const FileStat = await stat(FilePath);
    if (!FileStat.isFile()) return new Response('Not found', { status: 404 });

    const Range = ParseRange(request.headers.get('range'), FileStat.size);
    if (Range === null) return new Response('Range Not Satisfiable', { status: 416, headers: { 'Content-Range': `bytes */${FileStat.size}` } });
    const Start = Range?.Start ?? 0;
    const End = Range?.End ?? FileStat.size - 1;
    const FileName = path.basename(FilePath);
    const Extension = path.extname(FileName).slice(1).toLowerCase();
    const ResponseHeaders = new Headers({
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, no-store',
      'Content-Length': String(End - Start + 1),
      'Content-Type': ContentTypes[Extension] ?? 'application/octet-stream',
      'Content-Disposition': `${url.searchParams.has('stream') ? 'inline' : 'attachment'}; filename="${FileName.replace(/"/g, '')}"`,
    });
    if (Range) {
      ResponseHeaders.set('Content-Range', `bytes ${Start}-${End}/${FileStat.size}`);
      return new Response(Stream(FilePath, Start, End), { status: 206, headers: ResponseHeaders });
    }
    return new Response(Stream(FilePath, Start, End), { headers: ResponseHeaders });
  } catch {
    return new Response('Not found', { status: 404 });
  }
};
