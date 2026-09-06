import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { createReadStream } from "node:fs";
import { basename } from "node:path";

const endpoint = process.env.R2_ENDPOINT!;
const publicUrl = process.env.R2_PUBLIC_URL!;
const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;
const bucket = process.env.R2_BUCKET!;

const client = new S3Client({
  region: "auto",
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
});

async function uploadFile(filePath: string, fileName: string) {
  const stream = createReadStream(filePath);

  const uploadReq = new Upload({
    client,
    queueSize: 4,
    partSize: 5 * 1024 * 1024,
    params: {
      Bucket: bucket,
      Key: fileName,
      Body: stream,
    },
  });

  uploadReq.on("httpUploadProgress", (progress) => {
    const fraction = (progress.loaded ?? 0) / (progress.total ?? 0);
    const percentage = (fraction * 100).toFixed(2);
    console.log(`Uploading progress: ${percentage} %`);
  });

  const res = await uploadReq.done();
  const url = new URL(fileName, publicUrl);

  return {
    status: res.$metadata.httpStatusCode!,
    fileName,
    privateUrl: res.Location!,
    publicUrl: url.href,
  };
}

const args = process.argv.slice(2);

const filePath = args.shift();

if (!filePath) {
  console.error("Please provide a file path");
  process.exit(1);
}

const baseName = basename(filePath);

const res = await uploadFile(filePath, baseName);

console.log("Uploading completed");
console.log(res);
