import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { App, GitHubSourceCodeProvider, Platform } from '@aws-cdk/aws-amplify-alpha';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { BuildSpec } from 'aws-cdk-lib/aws-codebuild';

export class AppStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.buildAppStack();
  }

  private buildAppStack() {
    const githubTokenSecret = Secret.fromSecretNameV2(
      this,
      'GithubTokenConfig',
      'GithubAccessToken',
    );
    const amplifyApp = new App(this, 'AmplifyApp', {
      appName: 'ravasa',
      sourceCodeProvider: new GitHubSourceCodeProvider({
        owner: 'juandanieldev29',
        repository: 'ravasa',
        oauthToken: githubTokenSecret.secretValue,
      }),
      autoBranchDeletion: true,
      environmentVariables: {
        AMPLIFY_MONOREPO_APP_ROOT: 'src/front',
        AMPLIFY_DIFF_DEPLOY: 'false',
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
