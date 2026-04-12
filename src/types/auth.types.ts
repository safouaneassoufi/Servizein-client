export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserMe {
  id: string;
  phone: string;
  email: string | null;
  name: string;
  avatarUrl: string | null;
  roles: string[];
  status: 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED';
  phoneVerified: boolean;
  emailVerified: boolean;
  createdAt: string;
  providerAccount: {
    id: string;
    kycStatus: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
    verified: boolean;
    available: boolean;
    averageRating: number;
    reviewCount: number;
  } | null;
}
