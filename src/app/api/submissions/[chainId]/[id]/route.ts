import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { chainId: string; id: string } }
) {
  try {
    const endpoint = process.env.NEXT_PUBLIC_MINIO_ENDPOINT;
    const bucket = process.env.MINIO_BUCKET_NAME;
    const url = `${endpoint}/${bucket}/chain-${params.chainId}/challenge-submissions/${params.id}.json`;

    console.log({ url });

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Submission not found");
    }

    const submission = await response.json();
    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 }
    );
  }
}
