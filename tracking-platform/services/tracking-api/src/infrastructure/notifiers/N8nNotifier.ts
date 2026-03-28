import axios from 'axios';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Notifier } from '@application/ports/Notifier';

type JwtClaims = {
  sub: string;
  email: string;
  name: string;
};

type N8nNotifierConfig = {
  userCreatedWebhookUrl?: string;
  passwordResetWebhookUrl?: string;
  hmacSecret?: string;
  jwtSecret?: string;
  timeoutMs?: number;
}

export class N8nNotifier implements Notifier {
  private readonly timeoutMs: number;

  constructor(private readonly config: N8nNotifierConfig) {
    this.timeoutMs = config.timeoutMs ?? 4000;
  }

  private signHmac(payload: unknown): string {
    const raw = JSON.stringify(payload);
    return crypto.createHmac("sha256", this.config.hmacSecret!).update(raw).digest("hex");
  }

  private makeJwt(claims: JwtClaims): string {
    if (!this.config.jwtSecret) throw new Error('Missing JWT secret');
    return jwt.sign(claims, this.config.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: '5m',
      issuer: 'track-products-api',
      audience: 'n8n-webhook',
    });
  }

  private async postWebhook(
    url: string | undefined,
    payload: unknown,
    claims: JwtClaims
  ): Promise<void> {
    if (!url) return

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.makeJwt(claims)}`,
    };

    if (this.config.hmacSecret) {
      headers["x-signature"] = this.signHmac(payload);
    }

    try {
      await axios.post(url, payload, { headers, timeout: this.timeoutMs });
    } catch (e) {
      console.error("[N8nNotifier] notify error:", (e as Error).message)
    }
  }

  async userCreated(input: { id: string; name: string; email: string }): Promise<void> {
    const payload = {
      event: "user.created",
      ...input,
      ts: Date.now(),
    };

    await this.postWebhook(this.config.userCreatedWebhookUrl, payload, {
      sub: input.id,
      email: input.email,
      name: input.name,
    });
  }

  async passwordResetRequested(input: { userId: string; name: string; email: string; resetUrl: string; expiresAt: string; }): Promise<void> {
    const payload = {
      event: "user.password_reset_requested",
      ...input,
      ts: Date.now(),
    };

    await this.postWebhook(this.config.passwordResetWebhookUrl, payload, {
      sub: input.userId,
      email: input.email,
      name: input.name
    })
  }
}
