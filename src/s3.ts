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
  const options: S3.ManagedUpload.ManagedUploadOptions = {
    ...(S3_ENDPOINT_PART_SIZE
      ? { partSize: parseInt(S3_ENDPOINT_PART_SIZE, 10) }
      : {}),
  };

  const upload = s3.upload(params, options);

  if (opts.logProgress) {
    let logPercentThreshold = 1;
    upload.on("httpUploadProgress", ({ loaded, total }) => {
      const progress = Math.floor((loaded / total) * 100);
      if (progress > logPercentThreshold) {
        console.log(`Uploaded ${progress}%`);
        logPercentThreshold = Math.floor(progress) + 1;
      }
    });
  }

  const uploadPromise = upload.promise();

  return { writer: pass, upload: uploadPromise };
}
