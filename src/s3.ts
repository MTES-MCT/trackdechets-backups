import S3 from "aws-sdk/clients/s3";
import { Stream } from "stream";

const s3 = new S3({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
});

export function s3Writer(filename: string) {
  const pass = new Stream.PassThrough();
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: filename,
    Body: pass,
    partSize: process.env.S3_ENDPOINT_PART_SIZE,
  };
  const upload = s3.upload(params).promise();
  return { writer: pass, upload };
}
