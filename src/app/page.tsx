"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "./context/AppContext";
import { Button } from "@/components/ui/button";

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(15,23,42,${0.1 + i * 0.03})`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full text-slate-950 dark:text-white"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Genesix</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export default function Home({ title = "Genesix" }: { title?: string }) {
  const words = title.split(" ");

  const { isNewUser, setIsNewUser } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    // if (!isNewUser) {
    //   router.push("/challenges");
    // }
  }, [isNewUser, router]);

  const handleStart = () => {
    setIsNewUser(false);
    router.push("/challenges");
  };

  //   if (!isNewUser) return null;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-neutral-950">
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 tracking-tighter">
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={`${wordIndex}-${letterIndex}`}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: wordIndex * 0.1 + letterIndex * 0.03,
                      type: "spring",
                      stiffness: 150,
                      damping: 25,
                    }}
                    className="inline-block text-transparent bg-clip-text 
                                                                                bg-gradient-to-r from-neutral-900 to-neutral-700/80 
                                                                                dark:from-white dark:to-white/80"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium mb-6 tracking-tight text-neutral-700 dark:text-neutral-300">
            The first six chapters of your web3 origin story are about to begin.
          </h2>

          <div
            className="inline-block group relative bg-gradient-to-b from-black/10 to-white/10 
                                                dark:from-white/10 dark:to-black/10 p-px rounded-2xl backdrop-blur-lg 
                                                overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <Button onClick={handleStart} size="lg">
              Start Your Journey
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// export default function WelcomePage() {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
//       <div className="text-center bg-white p-8 rounded-lg shadow-lg">
//         <h1 className="text-4xl font-bold mb-4">Welcome!</h1>
//         <p className="text-lg mb-4">
//           The first six chapters of your web3 origin story are about to begin.
//         </p>
//       </div>
//     </div>
//   );
// }
