export class PrepareIndexDto {
  userAddress: string;
}

export class PrepareIndexResponseDto {
  success: boolean;
  indexBlobId?: string;
  graphBlobId?: string;
  message?: string;
}
