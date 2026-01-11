// src/infra/notifiers/N8nNotifier.ts
import axios from 'axios';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Notifier } from '@application/ports/Notifier';

type JwtClaims = {
  sub: string;
  email: string;
  name: string;
};

export class N8nNotifier implements Notifier {
  constructor(
    private readonly webhookUrl: string,
    private readonly hmacSecret?: string,
    private readonly jwtSecret?: string,
    private readonly timeoutMs = 4000
  ) {}

  private signHmac(payload: unknown): string {
    const raw = JSON.stringify(payload);
    return crypto.createHmac('sha256', this.hmacSecret!).update(raw).digest('hex');
  }

  private makeJwt(claims: JwtClaims): string {
    if (!this.jwtSecret) throw new Error('Missing JWT secret');
    return jwt.sign(claims, this.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: '5m',
      issuer: 'track-products-api',
      audience: 'n8n-webhook',
    });
  }

  async userCreated(input: { id: string; name: string; email: string }): Promise<void> {
    const payload = { ...input, ts: Date.now() };

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    const token = this.makeJwt({ sub: input.id, email: input.email, name: input.name });
    headers['Authorization'] = `Bearer ${token}`;

    if (this.hmacSecret) {
      headers['x-signature'] = this.signHmac(payload);
    }

    try {
      await axios.post(this.webhookUrl, payload, { headers, timeout: this.timeoutMs });
    } catch (e) {
      console.error('[N8nNotifier] notify error:', (e as Error).message);
    }
  }
}
