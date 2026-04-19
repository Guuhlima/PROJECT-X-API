import { DomainError } from "@shared/errors/DomainError";

export class PasswordHash {
    private constructor(private readonly value: string) {}

    static create(input: string): PasswordHash {
        const value = (input ?? '').trim();

        if (!value) throw new DomainError("PasswordHash is required.");
        if (value.length < 20) throw new DomainError("PasswordHash is too short.");

        return new PasswordHash(value);
    }

    get raw(): string {
        return this.value;
    }
}