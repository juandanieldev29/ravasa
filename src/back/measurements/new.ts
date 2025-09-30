import { APIGatewayProxyWithCognitoAuthorizerEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

import { ddbClient } from './ddbClient';
import { IMeasurement } from '../types/measurements';
import { CORS_HEADERS } from '../constants';

export const handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  const userPoolId = process.env.USER_POOL_ID;
  if (!userPoolId) {
    return {
      statusCode: 500,
      body: 'User pool ID is not configured',
      headers: CORS_HEADERS,
    };
  }
  const isAdminClaim = event.requestContext.authorizer.claims['custom:isAdmin'];
  const isAdmin = isAdminClaim && isAdminClaim === 'true' ? true : false;
  if (!isAdmin) {
    return {
      statusCode: 403,
      body: 'You are not allowed to perform this action',
      headers: CORS_HEADERS,
    };
  }
  const body: IMeasurement = JSON.parse(event.body!);
  const client = new CognitoIdentityProviderClient();
  const input: ListUsersCommandInput = {
    UserPoolId: userPoolId,
    Filter: `sub=\"${body.userId}\"`,
    AttributesToGet: ['sub'],
    Limit: 1,
  };
  const command = new ListUsersCommand(input);
  try {
    const response = await client.send(command);
    const users = response.Users ?? [];
    const user = users.at(0);
    if (!users || !users.length || !user) {
      return {
        statusCode: 404,
        body: 'User not found',
        headers: CORS_HEADERS,
      };
    }
    const params = {
      TableName: 'measurements',
      Item: marshall(body),
    };
    await ddbClient.send(new PutItemCommand(params));
    return {
      statusCode: 201,
      body: JSON.stringify(body),
      headers: CORS_HEADERS,
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify('some error happened'),
      headers: CORS_HEADERS,
    };
  }
};
