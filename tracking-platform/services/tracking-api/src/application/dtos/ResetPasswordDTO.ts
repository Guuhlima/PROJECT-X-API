export type ResetPasswordInput = {
    token: string;
    password: string;
}

export type ResetPasswordOutput = {
    message: string;
}