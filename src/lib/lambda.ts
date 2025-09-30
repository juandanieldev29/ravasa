import { Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import {
  Effect,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { join } from 'path';

interface LambdaProps {
  readonly userPoolARN: string;
  readonly userPoolId: string;
  readonly measurementsTable: ITable;
}

export class RavasaLambda extends Construct {
  public readonly cognitoListUsersRole: Role;
  public readonly userIndexLambda: NodejsFunction;
  public readonly userShowLambda: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaProps) {
    super(scope, id);
    this.cognitoListUsersRole = this.createRole(props.userPoolARN);
    this.userIndexLambda = this.createUserIndexFunction(props.userPoolId);
    this.userShowLambda = this.createUserShowFunction(props.userPoolId, props.measurementsTable);
  }

  private createRole(userPoolARN: string) {
    const role = new Role(this, 'ServiceRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    });
    role.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
    );
    role.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['cognito-idp:ListUsers'],
        resources: [userPoolARN],
      }),
    );
    return role;
  }

  private createUserIndexFunction(userPoolId: string): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(3),
      memorySize: 128,
    };
    const lambdaFunction = new NodejsFunction(this, 'UserIndexLambdaFunction', {
      entry: join(__dirname, `/../back/user/index.ts`),
      role: this.cognitoListUsersRole,
      environment: {
        USER_POOL_ID: userPoolId,
      },
      ...nodeJsFunctionProps,
    });
    return lambdaFunction;
  }

  private createUserShowFunction(userPoolId: string, measurementsTable: ITable): NodejsFunction {
    const nodeJsFunctionProps: NodejsFunctionProps = {
      runtime: Runtime.NODEJS_20_X,
      timeout: Duration.seconds(3),
      memorySize: 128,
    };
    const lambdaFunction = new NodejsFunction(this, 'UserShowLambdaFunction', {
      entry: join(__dirname, `/../back/user/show.ts`),
      role: this.cognitoListUsersRole,
      environment: {
        USER_POOL_ID: userPoolId,
      },
      ...nodeJsFunctionProps,
    });
    measurementsTable.grantReadData(lambdaFunction);
    return lambdaFunction;
  }
}
