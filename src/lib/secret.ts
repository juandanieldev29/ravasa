import { Construct } from 'constructs';
import { Secret, ISecret } from 'aws-cdk-lib/aws-secretsmanager';

export class RavasaHubSecrets extends Construct {
  public readonly githubTokenSecret: ISecret;
  public readonly googleSecret: ISecret;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.githubTokenSecret = this.createGithubTokenSecret();
    this.googleSecret = this.createGoogleSecret();
  }

  private createGithubTokenSecret(): ISecret {
    return Secret.fromSecretNameV2(this, 'GithubTokenConfig', 'GithubAccessToken');
  }

  private createGoogleSecret(): ISecret {
    return Secret.fromSecretNameV2(this, 'GoogleOauthConfig', 'GoogleClientConfig');
  }
}
