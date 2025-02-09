"use client";

import { use } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const challengeId = parseInt(id);
  if (isNaN(challengeId)) {
    // TODO: Toast page
    throw new Error("Challenge ID must be a number");
  }

  return <div>Ready for challenge {id}?</div>;
}
