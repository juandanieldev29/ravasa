import { IMeasurement } from './measurements';

export interface IUser {
  given_name: string;
  email: string;
  sub: string;
}

export interface IUserWithMeasurements {
  given_name: string;
  email: string;
  sub: string;
  measurements: IMeasurement[];
}
