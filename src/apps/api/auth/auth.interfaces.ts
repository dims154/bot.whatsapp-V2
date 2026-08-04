export interface AuthPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  status: string;
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: 'Bearer';
    expiresIn: string;
  };
}

export interface RefreshPayload {
  refreshToken: string;
}
