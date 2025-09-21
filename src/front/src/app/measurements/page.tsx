'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify, ResourcesConfig } from 'aws-amplify';

import Spinner from '@/components/spinner';
import UserProfile from '@/components/user-profile';

import LoadingContextProvider from '@/contexts/loading-context';

import '@aws-amplify/ui-react/styles.css';

const config: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!,
      identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID!,
      loginWith: {
        oauth: {
          domain: process.env.NEXT_PUBLIC_USER_POOL_DOMAIN_URL!,
          scopes: ['openid', 'profile', 'email', 'aws.cognito.signin.user.admin'],
          redirectSignIn: ['https://dev.d27xqlna0b9pop.amplifyapp.com/measurements'],
          redirectSignOut: ['https://dev.d27xqlna0b9pop.amplifyapp.com/measurements'],
          responseType: 'code',
        },
      },
    },
  },
};

Amplify.configure(config, { ssr: true });

export default function Measurements() {
  return (
    <Authenticator.Provider>
      <LoadingContextProvider>
        <Spinner />
        <Authenticator socialProviders={['google']} signUpAttributes={['email']}>
          <UserProfile />
        </Authenticator>
      </LoadingContextProvider>
    </Authenticator.Provider>
  );
}
