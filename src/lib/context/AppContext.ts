import { createContext, useContext } from "react";
import challenges from "@/lib/data/challenges.json";

// Exposing challenges via context has few benefits:
// 1. It allows us to access challenges from any component without prop drilling
// 2. It makes it easy to mock challenges in tests
// 3. It makes it easy to replace challenges with an API call in the future
// 4. It makes it easy to validate challenges against an interface, in the future.

enum ChallengeDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

enum ProofType {
  IMAGE = "image",
  TEXT = "text",
  LINK = "link",
}

interface Task {
  id: number;
  title: string;
  description: string;
  difficulty: ChallengeDifficulty;
  points: number;
  proofType: ProofType;
  playersRequired: number;
}

interface Challenge {
  id: number;
  title: string;
  tasks: Task[];
}

interface AppContextType {
  challenges: Challenge[];
}

const defaultContext: AppContextType = {
  challenges: challenges as Challenge[],
};

export const AppContext = createContext<AppContextType>(defaultContext);

export const useAppContext = () => useContext(AppContext);
