import { DomainError } from "@shared/errors/DomainError";

export class UserName {
    private constructor(private readonly value: string) {}

    static create(input: string): UserName {
        const value = (input ?? "").trim()

        if(!value) throw new DomainError("Username is required.");
        if(value.length < 5) throw new DomainError("Username is too short.");
        if(value.length > 300) throw new DomainError("Username is too long.");

        return new UserName(value)
    } 

    get raw(): string {
        return this.value
    }
}