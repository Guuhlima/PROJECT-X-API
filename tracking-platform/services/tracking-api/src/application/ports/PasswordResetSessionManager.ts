export type PasswordResetSessionPayload = {
  sub: string;
  tokenId: string;
  purpose: "password-reset";
};

export interface PasswordResetSessionManager {
  readonly cookieName: string;
  readonly maxAgeSeconds: number;
  create(payload: PasswordResetSessionPayload): Promise<string>;
  verify(token: string): Promise<PasswordResetSessionPayload>;
}
