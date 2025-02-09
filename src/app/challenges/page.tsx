"use client";

import Link from "next/link";

export default function Page() {
  return (
    <div>
      List of challenges:
      <ul>
        <li>
          <Link href="/challenges/1">Challenge 1</Link>
        </li>
      </ul>
    </div>
  );
}
