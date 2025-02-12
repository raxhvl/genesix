import { NextResponse } from "next/server";

type Props = {
  params: Promise<{
    chainId: string;
    id: string;
  }>;
};

export async function GET(request: Request, props: Props) {
  const params = await props.params;
  try {
    const endpoint = process.env.NEXT_PUBLIC_MINIO_ENDPOINT;
    const bucket = process.env.MINIO_BUCKET_NAME;
    const url = `${endpoint}/${bucket}/chain-${params.chainId}/challenge-submissions/${params.id}.json`;

    console.log({ url });

    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Submission not found! Are you on the correct chain?" },
        { status: 404 }
      );
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
