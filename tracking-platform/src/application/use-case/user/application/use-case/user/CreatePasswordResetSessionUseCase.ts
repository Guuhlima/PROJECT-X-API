import crypto from "crypto";
import { PasswordResetSessionManager } from "@application/ports/PasswordResetSessionManager";
import { PasswordResetTokenRepository } from "@domain/repositories/passwordResetTokenRepository/PasswordResetTokenRepository";
import { UserRepository } from "@domain/repositories/userRepository/UserRepository";
import { UserId } from "@domain/value-objects/User-objects/UserId";
import { userErrors } from "@shared/errors/user/UserErrors";

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
      throw userErrors.invalidToken();
    }

    if (resetToken.usedAt) {
      throw userErrors.tokenAlreadyUsed();
    }

    if (resetToken.expiresAt.getTime() < Date.now()) {
      throw userErrors.tokenExpired();
    }

    const user = await this.userRepository.findById(UserId.create(resetToken.userId));
    if (!user) {
      throw userErrors.userNotFound();
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
