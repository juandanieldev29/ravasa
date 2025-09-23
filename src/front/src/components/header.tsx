import { cookies } from 'next/headers';
import Link from 'next/link';
import { fetchAuthSession } from 'aws-amplify/auth/server';

import { runWithAmplifyServerContext } from '@/utils/amplifyServerUtils';
import CloseSession from '@/components/close-session';

export default async function Header() {
  const session = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (contextSpec) => fetchAuthSession(contextSpec),
  });
  return (
    <header className="w-full flex shadow-sm bg-slate-900 p-2">
      <h1 className="text-4xl lg:text-5xl text-white grow-6">
        <Link href="/">Ravasa</Link>
      </h1>
      <nav className="flex justify-end self-center grow gap-4">
        <Link href="/measurements" className="text-white">
          Mediciones
        </Link>
        {session.tokens?.idToken && session.tokens?.accessToken && <CloseSession />}
      </nav>
    </header>
  );
}
