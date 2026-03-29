import { LoginInput, LoginOutput } from "@application/dtos/LoginDTO";
import { PasswordHasher } from "@application/ports/PasswordHasher";
import { TokenSigner } from "@application/ports/TokenSigner";
import { UserRepository } from "@domain/repositories/userRepository/UserRepository";
import { Email } from "@domain/value-objects/User-objects/Email";
import { Password } from "@domain/value-objects/User-objects/Password";
import { DomainError } from "@shared/errors/DomainError";

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenSigner: TokenSigner
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const email = Email.create(input.email);
    const password = Password.create(input.password);

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new DomainError("Invalid credentials.");
    }

    const isPasswordValid = await this.passwordHasher.compare(
      password.raw,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new DomainError("Invalid credentials.");
    }

    if (!user.isActive) {
      throw new DomainError("User is inactive.");
    }

    if (!user.isVerified) {
      throw new DomainError("User is not verified.");
    }

    const accessToken = await this.tokenSigner.sign({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      accessToken,
      tokenType: "Bearer",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        verified: user.isVerified,
        active: user.isActive,
      },
    };
  }
}
