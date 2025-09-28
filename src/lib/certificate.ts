import { Certificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

export class RavasaCertificate extends Construct {
  public readonly certificate: ICertificate;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.certificate = this.createCertificate();
  }

  private createCertificate(): ICertificate {
    const certificateArn =
      'arn:aws:acm:us-west-2:008971652026:certificate/b9cb87ea-67c3-4b90-93e5-ba727720758c';
    const domainCert = Certificate.fromCertificateArn(this, 'DomainCertificate', certificateArn);
    return domainCert;
  }
}
