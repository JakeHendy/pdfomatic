import { NestedStack, NestedStackProps, Stack, StackProps } from "aws-cdk-lib";
import { IRepository } from "aws-cdk-lib/aws-ecr";
import { DockerImageCode, DockerImageFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

export class ProcessingLambda extends NestedStack {
    constructor(scope: Construct, id: string, inputBucket: Bucket, triggerQueue: Queue, outputBucket: Bucket, props?: NestedStackProps) {
        super(scope, id);

        const processingFunction = new DockerImageFunction(scope, 'ProcessingLambda', {
            functionName: "PdfOMatic",
            memorySize: 1024,
            code: DockerImageCode.fromImageAsset("lib/processing_function")
        });
        inputBucket.grantRead(processingFunction);
        outputBucket.grantReadWrite(processingFunction);
        processingFunction.addEventSource(new SqsEventSource(triggerQueue))
    }
}