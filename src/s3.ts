import S3 from "aws-sdk/clients/s3";
import { Stream } from "stream";

const {
  S3_ENDPOINT,
  S3_REGION,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_BUCKET,
  S3_ENDPOINT_PART_SIZE
} = process.env;

const s3 = new S3({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
  signatureVersion: "v4"
});

export function s3Writer(filename: string) {
  const pass = new Stream.PassThrough();
  const params = {
    Bucket: S3_BUCKET,
    Key: filename,
    Body: pass,
    partSize: S3_ENDPOINT_PART_SIZE ? parseInt(S3_ENDPOINT_PART_SIZE, 10) : 500
  };
  const upload = s3.upload(params).promise();
  return { writer: pass, upload };
}
