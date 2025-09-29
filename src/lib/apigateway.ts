import {
  AuthorizationType,
  LambdaRestApi,
  LambdaIntegration,
  DomainName,
  CognitoUserPoolsAuthorizer,
  BasePathMapping,
  Cors,
} from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface RavasaApiGatewayProps {
  userIndexLambda: IFunction;
  userShowLambda: IFunction;
  domain: DomainName;
  userPool: UserPool;
}

export class RavasaApiGateway extends Construct {
  constructor(scope: Construct, id: string, props: RavasaApiGatewayProps) {
    super(scope, id);
    this.createApiGateway(
      props.userIndexLambda,
      props.userShowLambda,
      props.domain,
      props.userPool,
    );
  }

  private createApiGateway(
    userIndexLambda: IFunction,
    userShowLambda: IFunction,
    domain: DomainName,
    userPool: UserPool,
  ) {
    const apigw = new LambdaRestApi(this, 'RavasaApi', {
      restApiName: 'Ravasa Service',
      handler: userIndexLambda,
      proxy: false,
      defaultCorsPreflightOptions: {
        allowOrigins: ['https://dev.ravasa.net'],
        allowMethods: Cors.ALL_METHODS,
        allowHeaders: Cors.DEFAULT_HEADERS,
        allowCredentials: true,
      },
    });
    const endpointAuthorizer = new CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [userPool],
    });
    const user = apigw.root.addResource('user');
    user.addMethod('GET', new LambdaIntegration(userIndexLambda), {
      authorizer: endpointAuthorizer,
      authorizationType: AuthorizationType.COGNITO,
    });
    const singleUser = user.addResource('{id}');
    singleUser.addMethod('GET', new LambdaIntegration(userShowLambda));

    new BasePathMapping(this, 'api-gw-base-path-mapping', {
      domainName: domain,
      restApi: apigw,
    });
  }
}
