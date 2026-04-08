import { PasswordHasher } from "@application/ports/PasswordHasher";
import { PasswordResetTokenRepository } from "@domain/repositories/passwordResetTokenRepository/PasswordResetTokenRepository";
import { UserRepository } from "@domain/repositories/userRepository/UserRepository";
import { Password } from "@domain/value-objects/User-objects/Password";
import { PasswordHash } from "@domain/value-objects/User-objects/PasswordHash";
import { UserId } from "@domain/value-objects/User-objects/UserId";
import { ResetPasswordOutput } from "@application/dtos/ResetPasswordDTO";
import { userErrors } from "@shared/errors/user/UserErrors";

type ResetPasswordWithSessionInput = {
  userId: string;
  password: string;
};

export class ResetPasswordWithSessionUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(
    input: ResetPasswordWithSessionInput
  ): Promise<ResetPasswordOutput> {
    const user = await this.userRepository.findById(UserId.create(input.userId));
    if (!user) {
      throw userErrors.userNotFound();
    }

    const password = Password.create(input.password);
    const hashed = await this.passwordHasher.hash(password.raw);

    user.updatePassword(PasswordHash.create(hashed));

    await this.userRepository.save(user);
    await this.passwordResetTokenRepository.deleteByUserId(user.id);

    return {
      message: "Password updated successfully.",
    };
  }
}
