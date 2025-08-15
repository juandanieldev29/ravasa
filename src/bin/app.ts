#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../lib/app';

const app = new cdk.App();
new AppStack(app, 'Ravasa');
