import { DomainError } from "@shared/errors/DomainError";

export class Password {
    private constructor(private readonly value: string) {}

    static create(input: string): Password {
        const value = (input ?? "").trim();

        if (!value) throw new DomainError("Password is required.");
        if (value.length < 8) throw new DomainError("Password is too short.");

        return new Password(value);
    }

    get raw(): string {
        return this.value
    }
}