import { User } from "@domain/entites/User";
import { Email } from "@domain/value-objects/User-objects/Email";
import { UserId } from "@domain/value-objects/User-objects/UserId";

export interface UserRepository {
    findById(id: UserId): Promise<User | null>;
    findByEmail(email: Email): Promise<User | null>;
    create(user: User): Promise<User>;
    save(user: User): Promise<void>;
}