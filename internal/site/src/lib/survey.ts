import { createHmac, timingSafeEqual } from 'node:crypto';

const SurveyMaxAgeSeconds = 60 * 60 * 24 * 30;
const SurveyCookie = 'E3DASurvey';

function Secret() {
  return process.env.SURVEY_SECRET ?? (process.env.NODE_ENV === 'production' ? '' : 'development-survey-secret');
}

function Signature(Value: string) {
  return createHmac('sha256', Secret()).update(Value).digest('base64url');
}

export function CreateSurveyToken(Group: string, File: string) {
  const Value = `${Group}:${File}:${Date.now() + SurveyMaxAgeSeconds * 1000}`;
  return `${Buffer.from(Value).toString('base64url')}.${Signature(Value)}`;
}

export function HasSurveyAccess(Token: string | undefined, Group: string, File: string) {
  if (!Token || !Secret()) return false;
  const [Encoded, ProvidedSignature] = Token.split('.');
  if (!Encoded || !ProvidedSignature) return false;
  try {
    const Value = Buffer.from(Encoded, 'base64url').toString('utf8');
    const [TokenGroup, TokenFile, ExpiresAt] = Value.split(':');
    const ExpectedSignature = Signature(Value);
    return TokenGroup === Group && TokenFile === File && Number(ExpiresAt) > Date.now() && ProvidedSignature.length === ExpectedSignature.length && timingSafeEqual(Buffer.from(ProvidedSignature), Buffer.from(ExpectedSignature));
  } catch {
    return false;
  }
}

export function SurveyCookieName() {
  return SurveyCookie;
}

export function SurveyMaxAge() {
  return SurveyMaxAgeSeconds;
}
