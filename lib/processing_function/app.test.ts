import { S3EventRecord, SQSEvent, SQSRecord } from "aws-lambda"
import { createHigherPrefix, handler } from "./app"
import { ListObjectsV2Command, ListObjectsV2CommandInput, ListObjectsV2CommandOutput, S3Client, _Object } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";



const s3ClientMock = mockClient(S3Client);

beforeAll(() => {
    s3ClientMock.reset();
})

const createS3RecordForPath = (input: string): S3EventRecord => {
    return {
        s3: {
            bucket: {
                name: "pdfomatic.test"
            },
            object: {
                key: input
            }
        }
    } as S3EventRecord;
}

const createSqsEventForS3Events = (input: S3EventRecord[]): SQSEvent => {
    const records: SQSRecord[] = [];
    input.forEach(r => {
        records.push({
            body: JSON.stringify(r)
        } as SQSRecord)
    })
    return {
        Records: records
    } as SQSEvent
}

test('Works on root object', () => {
    const input = "foobar.pdf"
    const expected = ""
    const actual = createHigherPrefix(createS3RecordForPath(input));
    expect(actual).toBe(expected)
})

test('Works on one folder in prefix', () => {
    const input = "potato/foobar.pdf"
    const expected = "potato"
    const actual = createHigherPrefix(createS3RecordForPath(input));
    expect(actual).toBe(expected)
})

test('Works on two folder in prefix', () => {
    const input = "potato/pizza/foobar.pdf"
    const expected = "potato/pizza"
    const actual = createHigherPrefix(createS3RecordForPath(input));
    expect(actual).toBe(expected)
})

test('Handles SQSEvent', async () => {
    s3ClientMock.on(ListObjectsV2Command).resolves(
        {
            Name: "pdfomatic.test",
            KeyCount: 5,
            Contents: [
                {
                    Key: "foo.pdf"
                }
            ] as _Object[]
        } as ListObjectsV2CommandOutput
    )
    const input = createSqsEventForS3Events([createS3RecordForPath('potato/foo.pdf')]);
    await handler(input, new Map<String, String>())
    expect(s3ClientMock.call(0).args[0].input).toStrictEqual({
        Bucket: "pdfomatic.test",
        Prefix: "potato"
    } as ListObjectsV2CommandInput)
})