import { UserRepository } from "@domain/repositories/userRepository/UserRepository";
import { UserId } from "@domain/value-objects/User-objects/UserId";
import { DomainError } from "@shared/errors/DomainError";

export class ConfirmUserUseCase {
    constructor(private readonly UserRepository: UserRepository) {}

    async execute(userIdRaw: string): Promise<void> {
        const userId = UserId.create(userIdRaw);

        const user = await this.UserRepository.findById(userId);
        if (!user) {
            throw new DomainError("User not found");
        }

        user.confirm();

        await this.UserRepository.save(user);
    }
}