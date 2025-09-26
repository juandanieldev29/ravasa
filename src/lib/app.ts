import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { RavasaHubSecrets } from './secret';
import { RavasaAmplifyHostingStack } from './amplify';
import { RavasaCognito } from './cognito';
import { RavasaLambda } from './lambda';
import { RavasaApiGateway } from './apigateway';

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
    const { userIndexLambda, userShowLambda } = new RavasaLambda(this, 'Lambda', {
      userPoolARN: userPool.userPoolArn,
      userPoolId: userPool.userPoolId,
    });
    new RavasaApiGateway(this, 'Gateway', {
      userIndexLambda: userIndexLambda,
      userShowLambda: userShowLambda,
    });
    new RavasaAmplifyHostingStack(this, 'Amplify', {
      githubTokenSecret: githubTokenSecret,
      userPoolId: userPool.userPoolId,
      userPoolClientId: userPoolClient.userPoolClientId,
      identityPoolId: identityPool.identityPoolId,
      userPoolDomainUrl: `${userPoolDomain.domainName}.auth.${this.region}.amazoncognito.com`,
    });
  }
}
