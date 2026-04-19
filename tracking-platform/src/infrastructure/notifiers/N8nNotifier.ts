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
  maxAttempts?: number;
  retryDelayMs?: number;
}

export class N8nNotifier implements Notifier {
  private readonly timeoutMs: number;
  private readonly maxAttempts: number;
  private readonly retryDelayMs: number;

  constructor(private readonly config: N8nNotifierConfig) {
    this.timeoutMs = config.timeoutMs ?? 4000;
    this.maxAttempts = Math.max(config.maxAttempts ?? 3, 1);
    this.retryDelayMs = Math.max(config.retryDelayMs ?? 1000, 0);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getEventName(payload: unknown): string | undefined {
    return (payload as { event?: string }).event;
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
    if (!url) {
      console.error("[N8nNotifier] webhook url is missing");
      return;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (this.config.jwtSecret) {
      headers.Authorization = `Bearer ${this.makeJwt(claims)}`;
    }

    if (this.config.hmacSecret) {
      headers["x-signature"] = this.signHmac(payload);
    }

    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(this.timeoutMs),
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(`HTTP ${response.status} ${response.statusText} - ${body}`);
        }

        return;
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        const willRetry = attempt < this.maxAttempts;
        const delayMs = this.retryDelayMs * attempt;

        if (!willRetry) {
          console.error("[N8nNotifier] giving up after retries", {
            url,
            event: this.getEventName(payload),
            attempts: this.maxAttempts,
            at: new Date().toISOString(),
          });
          return;
        }

        await this.sleep(delayMs);
      }
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
