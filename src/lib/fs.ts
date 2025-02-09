import { keccak256 } from "viem";

export enum FileType {
  PROOF_IMAGE = "PROOF_IMAGE",
  CHALLENGE_SUBMISSION = "CHALLENGE_SUBMISSION",
}

export function generateFilename(
  fileType: FileType,
  playerAddress: string,
  challengeId: number,
  chainId: number
): string {
  if (fileType === FileType.CHALLENGE_SUBMISSION) {
    const submissionString = `${playerAddress}${challengeId}${chainId}`;
    return keccak256(Buffer.from(submissionString)).slice(2);
  }

  // For proof images
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

export function getFileUploadUrl(
  chainId: number,
  fileType: FileType,
  playerAddress: string,
  challengeId: number
): string {
  const filename = generateFilename(
    fileType,
    playerAddress,
    challengeId,
    chainId
  );

  return `https://${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}${getPath(
    chainId,
    filename,
    fileType
  )}`;
}

export function getPath(chainId: number, filename: string, fileType: FileType) {
  console.log(fileType);
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
  return `chain-${chainId}/${path}/${filename}`;
}
