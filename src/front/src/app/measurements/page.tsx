'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify, ResourcesConfig } from 'aws-amplify';

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
          redirectSignIn: ['https://dev.d3fbeoy7g89fap.amplifyapp.com/'],
          redirectSignOut: ['https://dev.d3fbeoy7g89fap.amplifyapp.com/'],
          responseType: 'code',
        },
      },
      allowGuestAccess: true,
    },
  },
};

Amplify.configure(config, { ssr: true });

export default function Measurements() {
  return (
    <Authenticator.Provider>
      <Authenticator socialProviders={['google']} signUpAttributes={['email']}></Authenticator>
    </Authenticator.Provider>
  );
}
