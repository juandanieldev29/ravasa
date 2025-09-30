import { RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, Billing, ITable, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class RavasaDatabase extends Construct {
  public readonly measurementsTable: ITable;

  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.measurementsTable = this.createMeasurementsTable();
  }

  private createMeasurementsTable(): ITable {
    const measurementsTable = new TableV2(this, 'MeasurementsDatabaseTable', {
      partitionKey: {
        name: 'userId',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'yearMonth',
        type: AttributeType.STRING,
      },
      tableName: 'measurements',
      removalPolicy: RemovalPolicy.DESTROY,
      billing: Billing.onDemand(),
    });
    return measurementsTable;
  }
}
