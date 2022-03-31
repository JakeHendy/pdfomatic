import { S3EventRecord } from "aws-lambda"
import { createHigherPrefix } from "./app"

require ('./app')

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