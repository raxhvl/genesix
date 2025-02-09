"use client";

import Link from "next/link";
import { useAppContext } from "@/lib/context/AppContext";

export default function Page() {
  const { challenges } = useAppContext();
  return (
    <div>
      List of challenges:
      <ul>
        {challenges.map((challenge, index) => (
          <li key={index}>
            <Link href={`/challenges/${challenge.id}`}>{challenge.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
