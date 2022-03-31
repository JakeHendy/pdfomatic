"use strict";
import { S3Event, S3EventRecord, SQSEvent } from "aws-lambda"
import  { S3 } from "@aws-sdk/client-s3"

export const createHigherPrefix = (record: S3EventRecord): string => {
    const key = record.s3.object.key.split('/');
    key.splice(-1, 1);
    return key.join('/')
}

exports.handler = async (event: S3Event, _context: Map<String, String>): Promise<String> => {
    const client = new S3({region:event.Records[0].awsRegion});
    const objects = await client.listObjectsV2({
        Bucket: event.Records[0].s3.bucket.name,
        Prefix: createHigherPrefix(event.Records[0])
    })
    console.log(`There are ${objects.KeyCount} objects in this prefix`)
    return 'Hello World!';
}