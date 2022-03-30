import { Stack, StackProps, Stage } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { InputBucket } from './app/input-bucket';
import { OutputBucket } from './app/output-bucket';
import { ProcessingLambda } from './app/processing-lambda';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class PdfOMatic extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const inputBucket = new InputBucket(this, 'Input');
    const outputBucket = new OutputBucket(this, 'Output');
  
    new ProcessingLambda(this, 'ProcessingLambdaStack', inputBucket.bucket, inputBucket.newObjectQueue, outputBucket.bucket)

  }
}

export class PdfOMaticStage extends Stage {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
      new PdfOMatic(this, 'PdfOMatic')
  }
}