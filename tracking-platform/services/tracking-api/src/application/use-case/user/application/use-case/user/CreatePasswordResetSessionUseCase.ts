import crypto from "crypto";
import { PasswordResetSessionManager } from "@application/ports/PasswordResetSessionManager";
import { PasswordResetTokenRepository } from "@domain/repositories/passwordResetTokenRepository/PasswordResetTokenRepository";
import { UserRepository } from "@domain/repositories/userRepository/UserRepository";
import { UserId } from "@domain/value-objects/User-objects/UserId";
import { DomainError } from "@shared/errors/DomainError";

type CreatePasswordResetSessionInput = {
  token: string;
};

type CreatePasswordResetSessionOutput = {
  sessionToken: string;
  message: string;
};

export class CreatePasswordResetSessionUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly passwordResetSessionManager: PasswordResetSessionManager
  ) {}

  async execute(
    input: CreatePasswordResetSessionInput
  ): Promise<CreatePasswordResetSessionOutput> {
    const tokenHash = crypto.createHash("sha256").update(input.token).digest("hex");
    const resetToken = await this.passwordResetTokenRepository.findByTokenHash(tokenHash);

    if (!resetToken) {
      throw new DomainError("Invalid token.");
    }

    if (resetToken.usedAt) {
      throw new DomainError("Token already used.");
    }

    if (resetToken.expiresAt.getTime() < Date.now()) {
      throw new DomainError("Token expired.");
    }

    const user = await this.userRepository.findById(UserId.create(resetToken.userId));
    if (!user) {
      throw new DomainError("User not found.");
    }

    const sessionToken = await this.passwordResetSessionManager.create({
      sub: user.id,
      tokenId: resetToken.id,
      purpose: "password-reset",
    });

    await this.passwordResetTokenRepository.markAsUsed(resetToken.id);

    return {
      sessionToken,
      message: "Password reset session created.",
    };
  }
}
