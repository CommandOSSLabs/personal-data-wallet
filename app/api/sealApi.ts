import httpApi from './httpApi';

export interface CreateSealPolicyRequest {
  userAddress: string;
  nftType: string;
  description: string;
}

export interface CreateSealPolicyResponse {
  success: boolean;
  data: {
    policyId: string;
    transactionHash: string;
  };
  message: string;
}

export interface AddNftTypeRequest {
  policyId: string;
  nftType: string;
  userAddress: string;
}

export interface VerifyNftAccessRequest {
  policyId: string;
  nftType: string;
  userAddress: string;
}

export const sealApi = {
  /**
   * Create a new Seal policy for NFT access control
   */
  async createSealPolicy(request: CreateSealPolicyRequest): Promise<CreateSealPolicyResponse> {
    const response = await httpApi.post('/admin/create-seal-policy', request);
    return response.data;
  },

  /**
   * Add NFT type to existing policy
   */
  async addNftTypeToPolicy(request: AddNftTypeRequest): Promise<{ success: boolean; message: string }> {
    const response = await httpApi.post('/admin/add-nft-type', request);
    return response.data;
  },

  /**
   * Verify user has access to specific NFT type
   */
  async verifyNftAccess(request: VerifyNftAccessRequest): Promise<{ hasAccess: boolean; message: string }> {
    const response = await httpApi.post('/admin/verify-nft-access', request);
    return response.data;
  }
};

export default sealApi;