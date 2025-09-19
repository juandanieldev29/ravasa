import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { RavasaHubSecrets } from './secret';
import { RavasaAmplifyHostingStack } from './amplify';
import { RavasaCognito } from './cognito';

export class AppStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.buildAppStack();
  }

  private buildAppStack() {
    const { githubTokenSecret, googleSecret } = new RavasaHubSecrets(this, 'Secret');
    const { userPool, userPoolClient, identityPool, userPoolDomain } = new RavasaCognito(
      this,
      'Cognito',
      {
        googleSecret: googleSecret,
      },
    );
    new RavasaAmplifyHostingStack(this, 'Amplify', {
      githubTokenSecret: githubTokenSecret,
      userPoolId: userPool.userPoolId,
      userPoolClientId: userPoolClient.userPoolClientId,
      identityPoolId: identityPool.identityPoolId,
      userPoolDomainUrl: `${userPoolDomain.domainName}.auth.${this.region}.amazoncognito.com`,
    });
  }
}
