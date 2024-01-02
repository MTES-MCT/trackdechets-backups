import S3 from "aws-sdk/clients/s3";
import { Stream } from "stream";

const {
  S3_ENDPOINT,
  S3_REGION,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_BUCKET,
  S3_ENDPOINT_PART_SIZE,
} = process.env;

const s3 = new S3({
  endpoint: S3_ENDPOINT,
  region: S3_REGION,
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
});

type S3WriterOpts = {
  logProgress?: boolean;
};

export function s3Writer(filename: string, opts: S3WriterOpts = {}) {
  const pass = new Stream.PassThrough();
  const params: S3.PutObjectRequest = {
    Bucket: S3_BUCKET,
    Key: filename,
    Body: pass,
  };
  const partSize = parseInt(S3_ENDPOINT_PART_SIZE, 10);
  const options: S3.ManagedUpload.ManagedUploadOptions = {
    ...(S3_ENDPOINT_PART_SIZE ? { partSize } : {}),
  };

  const upload = s3.upload(params, options);

  if (opts.logProgress) {
    upload.on("httpUploadProgress", ({ loaded }) => {
      const chunk = loaded / partSize;
      // log 1 out of 5
      if (!(chunk % 5)) {
        console.log(`Uploaded chunk n° ${chunk}`);
      }
    });
  }

  const uploadPromise = upload.promise();

  return { writer: pass, upload: uploadPromise };
}
