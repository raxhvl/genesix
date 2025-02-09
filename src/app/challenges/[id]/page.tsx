import { use } from "react";

export default function ChallengePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const challengeId = Number.parseInt(id);
  return <div>Challenge {challengeId}</div>;
}
