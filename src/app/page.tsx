"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "./context/AppContext";
// import { Button } from "@/components/ui/button";

export default function Home() {
  const { isNewUser, setIsNewUser } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!isNewUser) {
      router.push("/challenges");
    }
  }, [isNewUser, router]);

  const handleStart = () => {
    setIsNewUser(false);
    router.push("/challenges");
  };

  if (!isNewUser) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4">Welcome!</h1>
        <p className="text-xl mb-6">Your web3 origin story begins here. 🚀</p>
        {/* <Button onClick={handleStart} size="lg">
          Get Started
        </Button> */}
      </div>
    </div>
  );
}
