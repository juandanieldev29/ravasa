import {
  AuthorizationType,
  LambdaRestApi,
  LambdaIntegration,
  DomainName,
  CognitoUserPoolsAuthorizer,
  BasePathMapping,
  Cors,
  Model,
  JsonSchemaType,
  RequestValidator,
} from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { IFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface RavasaApiGatewayProps {
  userIndexLambda: IFunction;
  userShowLambda: IFunction;
  measurementsNewLambda: IFunction;
  domain: DomainName;
  userPool: UserPool;
}

export class RavasaApiGateway extends Construct {
  constructor(scope: Construct, id: string, props: RavasaApiGatewayProps) {
    super(scope, id);
    this.createApiGateway(
      props.userIndexLambda,
      props.userShowLambda,
      props.measurementsNewLambda,
      props.domain,
      props.userPool,
    );
  }

  private createModelValidators(apiGateway: LambdaRestApi) {
    const createMeasurementModel = new Model(this, 'CreateMeasurementValidator', {
      restApi: apiGateway,
      contentType: 'application/json',
      description: 'Validates the request body for creating a new measurement',
      modelName: 'CreateMeasurementValidator',
      schema: {
        type: JsonSchemaType.OBJECT,
        required: [
          'userId',
          'yearMonth',
          'weight',
          'fatPercentage',
          'bodyMassIndex',
          'visceralFat',
          'muscleMass',
          'waterPercentage',
          'metabolicAge',
        ],
        properties: {
          userId: { type: JsonSchemaType.STRING, format: 'uuid' },
          yearMonth: { type: JsonSchemaType.STRING },
          weight: { type: JsonSchemaType.NUMBER, minimum: 0 },
          fatPercentage: { type: JsonSchemaType.NUMBER, minimum: 0 },
          bodyMassIndex: { type: JsonSchemaType.NUMBER, minimum: 0 },
          visceralFat: { type: JsonSchemaType.NUMBER, minimum: 0 },
          muscleMass: { type: JsonSchemaType.NUMBER, minimum: 0 },
          waterPercentage: { type: JsonSchemaType.NUMBER, minimum: 0 },
          metabolicAge: { type: JsonSchemaType.NUMBER, minimum: 0 },
        },
        additionalProperties: false,
      },
    });

    return {
      createMeasurementModel,
    };
  }

  private createApiGateway(
    userIndexLambda: IFunction,
    userShowLambda: IFunction,
    measurementsNewLambda: IFunction,
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

    const { createMeasurementModel } = this.createModelValidators(apigw);

    const user = apigw.root.addResource('user');
    user.addMethod('GET', new LambdaIntegration(userIndexLambda), {
      authorizer: endpointAuthorizer,
      authorizationType: AuthorizationType.COGNITO,
    });
    const singleUser = user.addResource('{id}');
    singleUser.addMethod('GET', new LambdaIntegration(userShowLambda), {
      authorizer: endpointAuthorizer,
      authorizationType: AuthorizationType.COGNITO,
    });
    const measurement = apigw.root.addResource('measurement');
    measurement.addMethod('POST', new LambdaIntegration(measurementsNewLambda), {
      authorizer: endpointAuthorizer,
      authorizationType: AuthorizationType.COGNITO,
      requestValidator: new RequestValidator(this, 'CreateMeasurementBodyValidator', {
        restApi: apigw,
        requestValidatorName: 'CreateMeasurementBodyValidator',
        validateRequestBody: true,
      }),
      requestModels: {
        'application/json': createMeasurementModel,
      },
    });

    new BasePathMapping(this, 'api-gw-base-path-mapping', {
      domainName: domain,
      restApi: apigw,
    });
  }
}
