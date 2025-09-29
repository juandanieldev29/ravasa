import { Stack, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import {
  App,
  GitHubSourceCodeProvider,
  Platform,
  RedirectStatus,
} from '@aws-cdk/aws-amplify-alpha';
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { BuildSpec } from 'aws-cdk-lib/aws-codebuild';

interface AmplifyHostingStackProps {
  readonly githubTokenSecret: ISecret;
  readonly userPoolId: string;
  readonly userPoolClientId: string;
  readonly identityPoolId: string;
  readonly userPoolDomainUrl: string;
}

export class RavasaAmplifyHostingStack extends Stack {
  constructor(scope: Construct, id: string, props: AmplifyHostingStackProps) {
    super(scope, id);
    this.buildAppStack(
      props.githubTokenSecret,
      props.userPoolId,
      props.userPoolClientId,
      props.identityPoolId,
      props.userPoolDomainUrl,
    );
    Tags.of(this).add('App', 'Ravasa');
    Tags.of(this).add('Environment', 'Development');
  }

  private buildAppStack(
    githubTokenSecret: ISecret,
    userPoolId: string,
    userPoolClientId: string,
    identityPoolId: string,
    userPoolDomainUrl: string,
  ) {
    const serviceRole = new Role(this, 'ServiceRole', {
      assumedBy: new ServicePrincipal('amplify.amazonaws.com'),
    });
    serviceRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess-Amplify'),
    );
    const computeRole = new Role(this, 'ComputeRole', {
      assumedBy: new ServicePrincipal('amplify.amazonaws.com'),
    });
    computeRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
    );
    const amplifyApp = new App(this, 'AmplifyApp', {
      customRules: [
        {
          source: 'https://www.dev.ravasa.net',
          target: 'https://dev.ravasa.net',
          status: RedirectStatus.REWRITE,
        },
      ],
      appName: 'ravasa',
      sourceCodeProvider: new GitHubSourceCodeProvider({
        owner: 'juandanieldev29',
        repository: 'ravasa',
        oauthToken: githubTokenSecret.secretValue,
      }),
      role: serviceRole,
      computeRole: computeRole,
      autoBranchDeletion: true,
      environmentVariables: {
        AMPLIFY_MONOREPO_APP_ROOT: 'src/front',
        AMPLIFY_DIFF_DEPLOY: 'false',
        NEXT_PUBLIC_USER_POOL_ID: userPoolId,
        NEXT_PUBLIC_USER_POOL_CLIENT_ID: userPoolClientId,
        NEXT_PUBLIC_IDENTITY_POOL_ID: identityPoolId,
        NEXT_PUBLIC_USER_POOL_DOMAIN_URL: userPoolDomainUrl,
        USER_POOL_ID: userPoolId,
        USER_POOL_CLIENT_ID: userPoolClientId,
        IDENTITY_POOL_ID: identityPoolId,
        USER_POOL_DOMAIN_URL: userPoolDomainUrl,
      },
      platform: Platform.WEB_COMPUTE,
      buildSpec: BuildSpec.fromObjectToYaml({
        version: 1,
        applications: [
          {
            frontend: {
              phases: {
                preBuild: {
                  commands: ['npm ci --cache .npm --prefer-offline'],
                },
                build: {
                  commands: [
                    'env | grep -e USER_POOL_ID -e USER_POOL_CLIENT_ID -e IDENTITY_POOL_ID -e USER_POOL_DOMAIN_URL >> .env',
                    'npm run build',
                  ],
                },
              },
              artifacts: {
                baseDirectory: '.next',
                files: ['**/*'],
              },
              cache: {
                paths: ['.next/cache/**/*', '.npm/**/*'],
              },
            },
            appRoot: 'src/front',
          },
        ],
      }),
    });
    amplifyApp.addBranch('main', {
      stage: 'PRODUCTION',
    });
    const dev = amplifyApp.addBranch('dev', {
      stage: 'DEVELOPMENT',
    });
    const domain = amplifyApp.addDomain('dev.ravasa.net');
    domain.mapRoot(dev);
    domain.mapSubDomain(dev, 'www');
  }
}
