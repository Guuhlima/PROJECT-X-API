export type UserProps = {
     id: string;
     name: string;
     email: string;
     password: string;
}

export class User {
    constructor (public readonly props: UserProps) {}

    get id() { return this.props.id; }
    get email() { return this.props.email; }
}