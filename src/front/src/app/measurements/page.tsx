'use client';

import { Authenticator, translations } from '@aws-amplify/ui-react';
import { Amplify, ResourcesConfig } from 'aws-amplify';
import { I18n } from 'aws-amplify/utils';

import Spinner from '@/components/spinner';
import UserProfile from '@/components/user-profile';

import LoadingContextProvider from '@/contexts/loading-context';

I18n.putVocabularies(translations);
I18n.setLanguage('es');

I18n.putVocabularies({
  es: {
    'Enter your Username': 'Escriba su Usuario',
  },
});

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
          redirectSignIn: ['https://dev.d22jw8grtfyd4.amplifyapp.com/measurements'],
          redirectSignOut: ['https://dev.d22jw8grtfyd4.amplifyapp.com/measurements'],
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
