import { createContext, useContext } from "react";
import challenges from "@/lib/data/challenges.json";
import { Address } from "viem";

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

export enum ProofType {
  IMAGE = "image",
  TEXT = "text",
  LINK = "link",
}

export interface Task {
  id: number;
  title: string;
  description: string;
  instructions_url: string;
  difficulty: ChallengeDifficulty;
  points: number;
  proofType: ProofType;
  allowMultipleProofs?: boolean;
  playersRequired: number;
  required?: boolean;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  homepage: string;
  submissionType?: "google_form" | "onchain";
  formUrl?: string;
  tasks?: Task[];
  nftTitle: string;
  nftDescription: string;
}

interface AppContextType {
  challenges: Challenge[];
}

const defaultContext: AppContextType = {
  challenges: challenges as Challenge[],
};

export enum SubmissionPayloadVersion {
  V1 = "v1",
}

export interface Submission {
  version: SubmissionPayloadVersion;
  chainId: number;
  nickname: string;
  playerAddress: Address;
  challengeId: number;
  responses: Response[];
  timestamp: number;
}

export interface Response {
  taskId: number;
  type: ProofType;
  answer: string;
  images: string[];
}

export interface Approval {
  nickname: string;
  playerAddress: Address;
  challengeId: number;
  points: BigInt[];
}

export const AppContext = createContext<AppContextType>(defaultContext);

export const useAppContext = () => useContext(AppContext);
