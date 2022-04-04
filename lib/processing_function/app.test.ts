import { Context, S3Event, S3EventRecord, SNSEvent, SNSEventRecord, SQSEvent, SQSRecord } from "aws-lambda"
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
    const snsRecords: SNSEventRecord[] = [];
    input.forEach(r => {
        snsRecords.push({
            Sns: {
                Message: JSON.stringify(r)
            }
        } as SNSEventRecord)
    })
    const snsEvent: SNSEvent = {
        Records: snsRecords
    }
    const records: SQSRecord[] = [];

    records.push({
        body: JSON.stringify(snsEvent)
    } as SQSRecord)
    return {
        Records: records
    } as SQSEvent
}

test('Test mock data creator', () => {
    const expected = `{
        "Type" : "Notification",
        "MessageId" : "7e660faf-dbc8-5c2a-8a00-556ff5c1314c",
        "TopicArn" : "arn:aws:sns:eu-west-2:0123456789:PdfOMaticInputTopic",
        "Subject" : "Amazon S3 Notification",
        "Message" : "{\"Records\":[{\"eventVersion\":\"2.1\",\"eventSource\":\"aws:s3\",\"awsRegion\":\"eu-west-2\",\"eventTime\":\"2022-03-31T22:31:36.172Z\",\"eventName\":\"ObjectCreated:Put\",\"userIdentity\":{\"principalId\":\"AWS:0123456789:sns@example.com\"},\"requestParameters\":{\"sourceIPAddress\":\"0.0.0.0\"},\"responseElements\":{\"x-amz-request-id\":\"abcdefghj\",\"x-amz-id-2\":\"abcdeghijklmnop=\"},\"s3\":{\"s3SchemaVersion\":\"1.0\",\"configurationId\":\"abcdefghijklmnop\",\"bucket\":{\"name\":\"test\",\"ownerIdentity\":{\"principalId\":\"ABCDEFGHIJK\"},\"arn\":\"arn:aws:s3:::test\"},\"object\":{\"key\":\"IMG_2122.jpeg\",\"size\":1702723,\"eTag\":\"8b36501739a92c43efa16ab924ed6088\",\"sequencer\":\"0062462BC814066BB7\"}}}]}",
        "Timestamp" : "2022-03-31T22:31:37.049Z",
        "SignatureVersion" : "1",
        "Signature" : "--",
        "SigningCertURL" : "https://sns.eu-west-2.amazonaws.com/pem",
        "UnsubscribeURL" : "https://sns.eu-west-2.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:eu-west-2:0123456789:PdfOMaticInputTopic:0f26f555-f261-4180-895e-8d410c19476f"
      }`
    const actual = createSqsEventForS3Events([createS3RecordForPath('IMG_2122.jpeg')])
    expect(actual.Records).toHaveLength(1)
    const actualSnsBody = JSON.parse(actual.Records[0].body) as SNSEvent
    expect(actualSnsBody.Records).toHaveLength(1)
    const actualS3Body = JSON.parse(actualSnsBody.Records[0].Sns.Message) as S3EventRecord
    expect(actualS3Body.s3.object.key).toStrictEqual('IMG_2122.jpeg')
})

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
    await handler(input, {} as Context)
    expect(s3ClientMock.call(0).args[0].input).toStrictEqual({
        Bucket: "pdfomatic.test",
        Prefix: "potato"
    } as ListObjectsV2CommandInput)
})