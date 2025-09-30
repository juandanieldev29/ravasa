'use client';

import { Authenticator } from '@aws-amplify/ui-react';

import UserProfile from '@/components/user-profile';
import Measurements from '@/components/measurements';

export default function MeasurementsPage() {
  return (
    <Authenticator.Provider>
      <Authenticator socialProviders={['google']} signUpAttributes={['email']}>
        <UserProfile />
        <Measurements />
      </Authenticator>
    </Authenticator.Provider>
  );
}
