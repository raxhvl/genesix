import { NextResponse } from "next/server";
import challenges from "@/lib/data/challenges.json";

type Props = {
  params: Promise<{ challengeId: string; tokenId: string }>;
};

export async function GET(request: Request, props: Props) {
  const params = await props.params;
  try {
    const challengeId = parseInt(params.challengeId);
    const tokenId = parseInt(params.tokenId);

    // Find the challenge
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    const metadata = {
      name: `Onchain Days #${tokenId} // ${challenge.title}`,
      description: challenge.description,
      external_url: challenge.homepage,
      image: `https://genesix.rahxvl.com/nft/${challengeId}.jpg`,
      attributes: [
        {
          trait_type: "Challenge",
          value: challenge.title,
        },
      ],
    };

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Error generating token metadata:", error);
    return NextResponse.json(
      { error: "Failed to generate metadata" },
      { status: 500 }
    );
  }
}
