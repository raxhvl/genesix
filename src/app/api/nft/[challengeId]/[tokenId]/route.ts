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
      name: `EF Onchain Days: ${challenge.nftTitle} #${tokenId}`,
      description: challenge.nftDescription,
      external_url: challenge.homepage,
      image: `${process.env.APP_URL}/nft/placeholder.jpg`,
      attributes: [
        {
          trait_type: "Collection",
          value: "Onchain Days",
        },
        {
          trait_type: "Challenge",
          value: challenge.title,
        },
        {
          trait_type: "Category",
          value: challenge.nftTitle,
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
