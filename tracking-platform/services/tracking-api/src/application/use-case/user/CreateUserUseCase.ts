import { UserRepository } from "@domain/repositories/userRepository/UserRepository";
import { User } from "@domain/entites/User";
import { Email } from "@domain/value-objects/User-objects/Email";
import { UserId } from "@domain/value-objects/User-objects/UserId";
import { UserName } from "@domain/value-objects/User-objects/UserName";
import { Password } from "@domain/value-objects/User-objects/Password";
import { PasswordHash } from "@domain/value-objects/User-objects/PasswordHash";
import { PasswordHasher } from "@application/ports/PasswordHasher";
import { IdGenerator } from "@application/ports/IdGenerator";
import { DomainError } from "@shared/errors/DomainError";
import { CreateUserInput, CreateUserOutput } from "@application/dtos/CreateUserDTO";

export class CreateUser {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordHasher: PasswordHasher,
        private readonly idGenerator: IdGenerator,
    ) {}

    async execute(input: CreateUserInput): Promise<CreateUserOutput> {
        const name = UserName.create(input.name);
        const email = Email.create(input.email);
        const password = Password.create(input.password);
        
        const exists = await this.userRepository.findByEmail(email);
        if (exists) throw new DomainError("Email is already in use.");

        const id = UserId.create(this.idGenerator.newId());

        const hashed = await this.passwordHasher.hash(password.raw);
        const passwordHash = PasswordHash.create(hashed);

        const user = User.create({ id, name, email, passwordHash });

        const created = await this.userRepository.create(user);

        return {
            id: created.id,
            name: created.name,
            email: created.email
        }
    }
}