'use client';

import { Authenticator } from '@aws-amplify/ui-react';

import Spinner from '@/components/spinner';
import UserProfile from '@/components/user-profile';
import Measurements from '@/components/measurements';

export default function MeasurementsPage() {
  return (
    <Authenticator.Provider>
      <Spinner />
      <Authenticator socialProviders={['google']} signUpAttributes={['email']}>
        <UserProfile />
        <Measurements />
      </Authenticator>
    </Authenticator.Provider>
  );
}
