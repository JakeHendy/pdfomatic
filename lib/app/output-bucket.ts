import { NestedStack, NestedStackProps, Stack, StackProps } from 'aws-cdk-lib';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class OutputBucket extends NestedStack {
  public bucket: Bucket;
  constructor(scope: Construct, id: string, props?: NestedStackProps) {
    super(scope, id);
    
    const outputBucket = new Bucket(scope, 'OutputBucket', {
        bucketName: "iag-pdf-o-matic-output",
    })
    this.bucket = outputBucket;
  }
}
