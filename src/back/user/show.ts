import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  ListUsersCommandInput,
} from '@aws-sdk/client-cognito-identity-provider';

import { CORS_HEADERS } from '../constants';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  if (!id) {
    return {
      statusCode: 400,
      body: 'You must provide an user id',
      headers: CORS_HEADERS,
    };
  }
  const userPoolId = process.env.USER_POOL_ID;
  if (!userPoolId) {
    return {
      statusCode: 500,
      body: 'User pool ID is not configured',
      headers: CORS_HEADERS,
    };
  }
  const client = new CognitoIdentityProviderClient();
  const input: ListUsersCommandInput = {
    UserPoolId: userPoolId,
    Filter: `sub=\"${id}\"`,
    AttributesToGet: ['given_name', 'email', 'sub'],
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
    const userAttributes = user.Attributes ?? [];
    const formattedAttributes = userAttributes.reduce((acc, item) => {
      const key = item.Name;
      const value = item.Value;
      if (!key || !value) {
        return acc;
      }
      return { ...acc, [key]: value };
    }, {});
    return {
      statusCode: 200,
      body: JSON.stringify(formattedAttributes),
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
