import { LambdaRestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface RavasaApiGatewayProps {
  userIndexLambda: IFunction;
  userShowLambda: IFunction;
}

export class RavasaApiGateway extends Construct {
  constructor(scope: Construct, id: string, props: RavasaApiGatewayProps) {
    super(scope, id);
    this.createApiGateway(props.userIndexLambda, props.userShowLambda);
  }

  private createApiGateway(userIndexLambda: IFunction, userShowLambda: IFunction) {
    const apigw = new LambdaRestApi(this, 'RavasaApi', {
      restApiName: 'Ravasa Service',
      handler: userIndexLambda,
      proxy: false,
    });
    const user = apigw.root.addResource('user');
    user.addMethod('GET', new LambdaIntegration(userIndexLambda));
    const singleUser = user.addResource('{id}');
    singleUser.addMethod('GET', new LambdaIntegration(userShowLambda));
  }
}
