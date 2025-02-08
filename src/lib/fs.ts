export enum FileType {
  PROOF_IMAGE = "PROOF_IMAGE",
  CHALLENGE_SUBMISSION = "CHALLENGE_SUBMISSION",
}

export function getChainDirectory(chainId: number) {
  return `chain-${chainId}`;
}

export function getFileUploadUrl(
  chainId: number,
  filename: string,
  fileType: FileType
) {
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
  // TODO: Remove test path
  // User prefix.
  return `chain-${chainId}/test/${path}/${filename}`;
}
