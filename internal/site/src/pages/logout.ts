import { DeleteSession } from '../lib/auth';

export const GET = ({ cookies, redirect }) => {
	DeleteSession(cookies.get('E3DASession')?.value);
	cookies.delete('E3DASession', { path: '/' });
	return redirect('/login');
};
