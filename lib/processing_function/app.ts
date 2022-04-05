"use strict";
import { S3Event, S3EventRecord, SNSEventRecord, SQSEvent, Context, SNSEvent } from "aws-lambda"
import { S3 } from "@aws-sdk/client-s3"

export const createHigherPrefix = (record: S3EventRecord): string => {
    const key = record.s3.object.key.split('/');
    key.splice(-1, 1);
    return key.join('/')
}

const handleS3Event = async (record: S3EventRecord): Promise<[Boolean, Array<Error>]> => {
    const client = new S3({ region: record.awsRegion });

    const objects = await client.listObjectsV2({
        Bucket: record.s3.bucket.name,
        Prefix: createHigherPrefix(record)
    })
    console.log(`There are ${objects.KeyCount} objects in this prefix`)
    return [true, []]
}

export const handler = async (event: SQSEvent, _context: Context): Promise<String> => {
    console.log(event);
    for (let i = 0; i < event.Records.length; i++) {
        const record = event.Records[i];

        const snsEvent = JSON.parse(record.body) as SNSEvent;
        const s3Event = JSON.parse(snsEvent.Records[0].Sns.Message) as S3EventRecord
        handleS3Event(s3Event)
    }
    return 'Hello World!';
}