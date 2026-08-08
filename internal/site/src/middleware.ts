import { defineMiddleware } from 'astro:middleware';
import { GetSession } from './lib/auth';

export const onRequest = defineMiddleware((Context, Next) => {
  Context.locals.Session = GetSession(Context.cookies.get('E3DASession')?.value);
  return Next();
});
