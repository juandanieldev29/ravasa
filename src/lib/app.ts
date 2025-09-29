import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { RavasaHubSecrets } from './secret';
import { RavasaAmplifyHostingStack } from './amplify';
import { RavasaCognito } from './cognito';
import { RavasaLambda } from './lambda';
import { RavasaApiGateway } from './apigateway';
import { RavasaCertificate } from './certificate';
import { RavasaDomain } from './domain';
import { RavasaHostedZone } from './hosted-zone';

export class AppStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.buildAppStack();
  }

  private buildAppStack() {
    const { githubTokenSecret, googleSecret } = new RavasaHubSecrets(this, 'Secret');
    const { certificate } = new RavasaCertificate(this, 'Certificate');
    const { domain } = new RavasaDomain(this, 'Domain', {
      certificate: certificate,
    });
    new RavasaHostedZone(this, 'HostedZone', {
      domain: domain,
    });
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
      domain: domain,
      userPool: userPool,
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
