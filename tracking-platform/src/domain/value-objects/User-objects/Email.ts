import { DomainError } from "@shared/errors/DomainError";

export class Email {
    private constructor(private readonly value: string) {}

    static create(input: string): Email {
        const value = (input ?? "").trim().toLowerCase();

        if (!value) throw new DomainError("Email is required");

        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if (!isValid) throw new DomainError("Email is invalid.");

        return new Email(value);
    }

    get raw(): string {
        return this.value;
    }
}