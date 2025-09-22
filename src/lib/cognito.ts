import { IdentityPool, UserPoolAuthenticationProvider } from 'aws-cdk-lib/aws-cognito-identitypool';
import { RemovalPolicy } from 'aws-cdk-lib';
import {
  AccountRecovery,
  ProviderAttribute,
  UserPool,
  UserPoolClient,
  UserPoolDomain,
  UserPoolIdentityProviderGoogle,
  VerificationEmailStyle,
  BooleanAttribute,
} from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';

interface CognitoStackProps {
  readonly googleSecret: ISecret;
}

export class RavasaCognito extends Construct {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;
  public readonly identityPool: IdentityPool;
  public readonly userPoolDomain: UserPoolDomain;

  constructor(scope: Construct, id: string, props: CognitoStackProps) {
    super(scope, id);
    const { userPool, userPoolClient, identityPool, userPoolDomain } = this.createCognitoAuth(
      props.googleSecret,
    );
    this.userPool = userPool;
    this.userPoolClient = userPoolClient;
    this.identityPool = identityPool;
    this.userPoolDomain = userPoolDomain;
  }

  private createCognitoAuth(googleSecret: ISecret) {
    const userPool = new UserPool(this, 'CognitoAuth', {
      userPoolName: 'RavasaUserPool',
      selfSignUpEnabled: true,
      accountRecovery: AccountRecovery.PHONE_AND_EMAIL,
      userVerification: {
        emailStyle: VerificationEmailStyle.CODE,
      },
      customAttributes: {
        isAdmin: new BooleanAttribute({ mutable: true }),
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const userPoolDomain = new UserPoolDomain(this, 'RavasaUserPoolDomain', {
      userPool: userPool,
      cognitoDomain: {
        domainPrefix: 'ravasa',
      },
    });

    const googleProvider = new UserPoolIdentityProviderGoogle(this, 'RavasaGoogleProvider', {
      clientId: '268739192082-8gn9rvh883gdgccku4un5sk2viol60o7.apps.googleusercontent.com',
      clientSecretValue: googleSecret.secretValue,
      scopes: ['openid', 'profile', 'email'],
      attributeMapping: {
        email: ProviderAttribute.GOOGLE_EMAIL,
        givenName: ProviderAttribute.GOOGLE_GIVEN_NAME,
        familyName: ProviderAttribute.GOOGLE_FAMILY_NAME,
        profilePicture: ProviderAttribute.GOOGLE_PICTURE,
      },
      userPool,
    });
    userPool.registerIdentityProvider(googleProvider);
    const userPoolClient = new UserPoolClient(this, 'CognitoAuthClient', {
      userPool,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        callbackUrls: ['https://dev.d20h4ot408xbeh.amplifyapp.com/measurements'],
        logoutUrls: ['https://dev.d20h4ot408xbeh.amplifyapp.com/measurements'],
      },
    });
    const identityPool = new IdentityPool(this, 'CognitoAuthPool', {
      identityPoolName: 'RavasaUserIdentityPool',
      allowUnauthenticatedIdentities: false,
      authenticationProviders: {
        userPools: [
          new UserPoolAuthenticationProvider({
            userPool: userPool,
            userPoolClient: userPoolClient,
          }),
        ],
      },
    });
    return { userPool, userPoolClient, identityPool, userPoolDomain };
  }
}
