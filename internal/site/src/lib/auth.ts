import { randomBytes } from 'node:crypto';

const SessionMaxAgeMs = 8 * 60 * 60 * 1000;
const SessionStore = new Map<string, { Username: string; IsAdmin: boolean; ExpiresAt: number }>();

export function IsDevelopmentOpenLoginEnabled() {
  return process.env.NODE_ENV !== 'production' && process.env.DEV_OPEN_LOGIN !== 'false';
}

export function CreateSession(Username: string) {
  const Token = randomBytes(24).toString('base64url');
  SessionStore.set(Token, { Username, IsAdmin: Username === 'yrpeng', ExpiresAt: Date.now() + SessionMaxAgeMs });
  return Token;
}

export function GetSession(Token: string | undefined) {
  const Session = Token ? SessionStore.get(Token) : undefined;
  if (!Session || Session.ExpiresAt < Date.now()) {
    if (Token) SessionStore.delete(Token);
    return undefined;
  }
  return Session;
}

export function DeleteSession(Token: string | undefined) {
  if (Token) SessionStore.delete(Token);
}
