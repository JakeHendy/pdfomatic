"use strict";
import { S3Event, S3EventRecord, SQSEvent } from "aws-lambda"
import  { S3 } from "@aws-sdk/client-s3"

export const createHigherPrefix = (record: S3EventRecord): string => {
    const key = record.s3.object.key.split('/');
    key.splice(-1, 1);
    return key.join('/')
}

export const handler = async (event: SQSEvent, _context: Map<String, String>): Promise<String> => {
    console.log(event);
    const client = new S3({region:event.Records[0].awsRegion});
    for (let i = 0; i < event.Records.length; i++) { 
        const record = event.Records[i];

        const s3Event = JSON.parse(record.body) as S3EventRecord;
        const objects = await client.listObjectsV2({
            Bucket: s3Event.s3.bucket.name,
            Prefix: createHigherPrefix(s3Event)
        })
        console.log(`There are ${objects.KeyCount} objects in this prefix`)
    }
    return 'Hello World!';
}