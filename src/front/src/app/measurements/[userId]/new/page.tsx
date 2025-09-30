import { cookies } from 'next/headers';
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth/server';
import { redirect } from 'next/navigation';

import { runWithAmplifyServerContext } from '@/utils/amplifyServerUtils';

export default async function UserMeasurementsNewPage() {
  const session = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (contextSpec) => fetchAuthSession(contextSpec),
  });
  if (!session.tokens?.idToken) {
    redirect('/measurements');
  }
  const attributes = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (contextSpec) => fetchUserAttributes(contextSpec),
  });
  const isAdminAttribute = attributes['custom:isAdmin'];
  const isAdmin = isAdminAttribute && isAdminAttribute === 'true' ? true : false;
  if (!isAdmin) {
    redirect('/measurements');
  }
  return <h1>Agregar nueva medicion</h1>;
}
