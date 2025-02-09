import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getPath } from "@/lib/fs";

const s3Client = new S3Client({
  region: process.env.MINIO_REGION!,
  endpoint: process.env.NEXT_PUBLIC_MINIO_ENDPOINT!,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
});

export async function POST(request: Request) {
  const { chainId, filename, fileType, contentType } = await request.json();

  console.log({ chainId, filename, fileType, contentType });

  const command = new PutObjectCommand({
    Bucket: process.env.MINIO_BUCKET_NAME!,
    Key: `${getPath(chainId, filename, fileType)}`,
    ContentType: contentType,
  });

  console.log(`Uploading to key: ${getPath(chainId, filename, fileType)}`);

  try {
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60,
    });
    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}
