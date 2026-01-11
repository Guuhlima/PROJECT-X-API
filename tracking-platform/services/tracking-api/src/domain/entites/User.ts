import { UserId } from "@domain/value-objects/User-objects/UserId"
import { UserName } from "@domain/value-objects/User-objects/UserName";
import { Email } from "@domain/value-objects/User-objects/Email";
import { PasswordHash } from "@domain/value-objects/User-objects/PasswordHash";
import { DomainError } from "@shared/errors/DomainError";

export type UserProps = {
    id: UserId;
    name: UserName;
    email: Email;
    passwordHash: PasswordHash;
    active: boolean;
    verified: boolean;
}

export class User {
    constructor (public readonly props: UserProps) {}

    static create(input: {
        id: UserId;
        name: UserName;
        email: Email;
        passwordHash: PasswordHash;
        active?: boolean;
    }): User {
        return new User({
            id: input.id,
            name: input.name,
            email: input.email,
            passwordHash: input.passwordHash,
            active: input.active ?? true,
            verified: false
        })
    }

    static restore(props: UserProps): User {
        return new User(props);
    }

    get id(): string {
        return this.props.id.raw;
    }

    get email(): string {
        return this.props.email.raw;
    }

    get name(): string {
        return this.props.name.raw;
    }

    get passwordHash(): string {
        return this.props.passwordHash.raw;
    }

    get isActive(): boolean {
        return this.props.active;
    }

    get isVerified(): boolean {
        return this.props.verified;
    }

    deactivate(): void {
        if (!this.props.active) {
        throw new DomainError("User is already inactive.");
        }
        this.props.active = false;
    }

    activate(): void {
        if (this.props.active) {
        throw new DomainError("User is already active.");
        }
        this.props.active = true;
    }

    confirm(): void {
        if (this.props.verified) {
            throw new DomainError("User is already verified")
        }
        this.props.verified = true;
    }
}