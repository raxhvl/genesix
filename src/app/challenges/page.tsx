"use client";

import Link from "next/link";
import { useAppContext } from "@/lib/context/AppContext";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page() {
  const { challenges } = useAppContext();
  return (
    <div>
      List of challenges:
      {challenges.map((challenge, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{challenge.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
          <CardFooter>
            <Link href={`/challenges/${challenge.id}`}>View challenge</Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
