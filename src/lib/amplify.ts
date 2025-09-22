import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { App, GitHubSourceCodeProvider, Platform } from '@aws-cdk/aws-amplify-alpha';
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
      ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSAppSyncPushToCloudWatchLogs'),
    );
    const computeRole = new Role(this, 'ComputeRole', {
      assumedBy: new ServicePrincipal('amplify.amazonaws.com'),
    });
    computeRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSAppSyncPushToCloudWatchLogs'),
    );
    const amplifyApp = new App(this, 'AmplifyApp', {
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
                  commands: ['npm run build'],
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
    amplifyApp.addBranch('dev', {
      stage: 'DEVELOPMENT',
    });
  }
}
