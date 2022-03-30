import { NestedStack, NestedStackProps, Stack, StackProps } from 'aws-cdk-lib';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { SnsDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { SqsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';

export class InputBucket extends NestedStack {

  public bucket: Bucket;
  public newObjectQueue: Queue;

  constructor(scope: Construct, id: string, props?: NestedStackProps) {
    super(scope, id);

    const newObjectSns = new Topic(scope, 'NewObjectEvent', {
        topicName: "PdfOMaticInputTopic",
        displayName: "PdfOMaticInputTopic"
    })

    const newObjectSqs = new Queue(scope, 'NewObjectQueue', {
        queueName: "PdfOMaticInputQueue"
    })
    newObjectSns.addSubscription(new SqsSubscription(newObjectSqs))

    const inputBucket = new Bucket(scope, 'InputBucket', {
        bucketName: "iag-pdf-o-matic-input",
    })
    inputBucket.addEventNotification(EventType.OBJECT_CREATED_PUT, new SnsDestination(newObjectSns))
    this.bucket = inputBucket;
    this.newObjectQueue = newObjectSqs;
  }
}
