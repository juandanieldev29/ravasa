import { DomainName } from 'aws-cdk-lib/aws-apigateway';
import { CnameRecord, HostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

interface RavasaHostedZoneProps {
  domain: DomainName;
}

export class RavasaHostedZone extends Construct {
  constructor(scope: Construct, id: string, props: RavasaHostedZoneProps) {
    super(scope, id);
    this.createCnameRecord(props.domain);
  }

  private createCnameRecord(domain: DomainName): void {
    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: 'Z03130964GP2T291PVL9',
      zoneName: 'ravasa.net',
    });
    new CnameRecord(this, 'ApiGwCustomDomainCnameRecord', {
      recordName: 'api-dev',
      zone: hostedZone,
      domainName: domain.domainNameAliasDomainName,
    });
  }
}
