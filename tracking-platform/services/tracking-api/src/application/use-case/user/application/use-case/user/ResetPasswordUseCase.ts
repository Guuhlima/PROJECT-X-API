import crypto from "crypto";
import { PasswordResetTokenRepository } from "@domain/repositories/passwordResetTokenRepository/PasswordResetTokenRepository";
import { UserRepository } from "@domain/repositories/userRepository/UserRepository";
import { PasswordHasher } from "@application/ports/PasswordHasher";
import { Password } from "@domain/value-objects/User-objects/Password";
import { PasswordHash } from "@domain/value-objects/User-objects/PasswordHash";
import { UserId } from "@domain/value-objects/User-objects/UserId";
import { DomainError } from "@shared/errors/DomainError";
import { ResetPasswordInput, ResetPasswordOutput } from "@application/dtos/ResetPasswordDTO";

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(input: ResetPasswordInput): Promise<ResetPasswordOutput> {
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

    const password = Password.create(input.password);
    const hashed = await this.passwordHasher.hash(password.raw);

    user.updatePassword(PasswordHash.create(hashed));

    await this.userRepository.save(user);
    await this.passwordResetTokenRepository.markAsUsed(resetToken.id);

    return {
      message: "Password updated successfully.",
    };
  }
}
