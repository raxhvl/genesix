import { v4 as uuidv4 } from "uuid";
import { Submission } from "./context/AppContext";

export enum FileType {
  PROOF_IMAGE = "PROOF_IMAGE",
  CHALLENGE_SUBMISSION = "CHALLENGE_SUBMISSION",
}

export function getPath(chainId: number, filename: string, fileType: FileType) {
  let path;
  switch (fileType) {
    case FileType.PROOF_IMAGE:
      path = "proof-images";
      break;
    case FileType.CHALLENGE_SUBMISSION:
      path = "challenge-submissions";
      break;
    default:
      throw new Error("Invalid file type");
  }

  // Extract extension from original filename
  const extension = filename.includes(".") ? filename.split(".").pop() : "";

  // Generate UUID and append extension if it exists
  const uuidFilename = extension ? `${uuidv4()}.${extension}` : uuidv4();

  return `chain-${chainId}/${path}/${uuidFilename}`;
}

export async function fetchSubmission(
  chainId: number,
  submissionId: string
): Promise<Submission> {
  const response = await fetch(`/api/submissions/${chainId}/${submissionId}`);
  if (!response.ok) {
    const res = await response.json();
    throw new Error(`${res.error}`);
  }
  return response.json();
}
