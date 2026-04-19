export type AuthTokenPayload = {
  sub: string;
  email: string;
  name: string;
};

export interface TokenSigner {
  sign(payload: AuthTokenPayload): Promise<string>;
}
