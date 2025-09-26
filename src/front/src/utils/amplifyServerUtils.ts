import { createServerRunner } from '@aws-amplify/adapter-nextjs';

export const { runWithAmplifyServerContext } = createServerRunner({
  config: {
    Auth: {
      Cognito: {
        userPoolId: 'us-west-2_VCQNI3mrA',
        userPoolClientId: '3i5nmumobuv4gcvn5oqnp83210',
        identityPoolId: 'us-west-2:7a230bee-3a55-4b37-8a1f-11a3e54cfdc2',
        loginWith: {
          oauth: {
            domain: 'ravasa.auth.us-west-2.amazoncognito.com',
            scopes: ['openid', 'profile', 'email', 'aws.cognito.signin.user.admin'],
            redirectSignIn: ['https://dev.d22jw8grtfyd4.amplifyapp.com/measurements'],
            redirectSignOut: ['https://dev.d22jw8grtfyd4.amplifyapp.com/measurements'],
            responseType: 'code',
          },
        },
      },
    },
  },
});
